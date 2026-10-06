import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';

// Execute the actual TypeScript modules using the existing compiler; no test dependency needed.
function loadTs(relative) {
  const url = new URL(relative, import.meta.url);
  const source = readFileSync(url, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', output)(createRequire(url), module, module.exports);
  return module.exports;
}
const { safeReturnPath } = loadTs('../src/features/auth/returnPath.ts');
const { checkoutSchema } = loadTs('../src/features/cart_checkout/checkoutSchema.ts');
const { registerSchema } = loadTs('../src/features/auth/authSchema.ts');
const { readCatalogQuery, updateCatalogQuery } = loadTs('../src/features/catalog/catalogQuery.ts');

test('login returns to the intended cart, checkout or product review route', () => {
  for (const from of ['/cart', '/checkout', '/products/1#reviews', '/?keyword=Sony&page=2'])
    assert.equal(safeReturnPath({ from }), from);
});
test('return destinations cannot leave the app or loop through auth pages', () => {
  for (const from of [
    'https://example.com',
    '//example.com',
    '/\\example.com',
    '/login',
    '/register?from=/cart',
    '',
    123,
  ])
    assert.equal(safeReturnPath({ from }), '/');
  assert.equal(safeReturnPath(null), '/');
});
test('catalog links restore keyword, category, price, page and sort', () => {
  assert.deepEqual(
    readCatalogQuery(
      new URLSearchParams(
        'keyword=Sony&subcategoryId=6&minPrice=1000000&maxPrice=9000000&page=2&sort=price-asc'
      )
    ),
    {
      keyword: 'Sony',
      subcategory: 6,
      minPrice: 1000000,
      maxPrice: 9000000,
      page: 2,
      sort: 'price-asc',
    }
  );
});
test('changing a filter resets pagination without losing the other filters', () => {
  const previous = new URLSearchParams('page=4&subcategoryId=6&sort=price-asc');
  const next = updateCatalogQuery(previous, { keyword: 'Sony' });
  assert.equal(next.get('page'), null);
  assert.equal(next.get('subcategoryId'), '6');
  assert.equal(next.get('sort'), 'price-asc');
  assert.equal(previous.get('page'), '4');
});
test('pagination can change independently and clearing a filter removes its parameter', () => {
  const next = updateCatalogQuery(new URLSearchParams('keyword=Sony&subcategoryId=6'), {
    page: '3',
    keyword: undefined,
  });
  assert.equal(next.get('page'), '3');
  assert.equal(next.get('keyword'), null);
  assert.equal(next.get('subcategoryId'), '6');
});
test('invalid catalog URL values cannot produce invalid API paging or price ranges', () => {
  const query = readCatalogQuery(
    new URLSearchParams(
      'page=Infinity&subcategoryId=-3&minPrice=-1&maxPrice=invalid&sort=password-desc'
    )
  );
  assert.equal(query.page, 1);
  assert.equal(query.subcategory, undefined);
  assert.equal(query.minPrice, 0);
  assert.equal(query.maxPrice, 60000000);
  assert.equal(query.sort, 'createdAt-desc');
  const inverted = readCatalogQuery(new URLSearchParams('minPrice=9000000&maxPrice=1000000'));
  assert.equal(inverted.maxPrice, 9000000);
});
const checkout = {
  recipientName: ' Nguyen Van An ',
  phone: '0912345678',
  address: ' 123 Nguyen Hue ',
  city: ' Ho Chi Minh ',
  paymentMethod: 'COD',
};
test('checkout accepts both supported payment methods and trims shipping fields', () => {
  for (const method of ['COD', 'BANKING']) {
    const parsed = checkoutSchema.parse({ ...checkout, paymentMethod: method });
    assert.equal(parsed.recipientName, 'Nguyen Van An');
    assert.equal(parsed.address, '123 Nguyen Hue');
    assert.equal(parsed.city, 'Ho Chi Minh');
  }
});
test('checkout rejects missing shipping fields and invalid phone numbers', () => {
  for (const field of ['recipientName', 'phone', 'address', 'city'])
    assert.equal(checkoutSchema.safeParse({ ...checkout, [field]: ' ' }).success, false);
  for (const phone of ['123', 'abcdefghij', '0912345678x'])
    assert.equal(checkoutSchema.safeParse({ ...checkout, phone }).success, false);
});
test('checkout rejects unsupported payment methods and oversized notes', () => {
  assert.equal(checkoutSchema.safeParse({ ...checkout, paymentMethod: 'CARD' }).success, false);
  assert.equal(checkoutSchema.safeParse({ ...checkout, notes: 'x'.repeat(2001) }).success, false);
});
test('registration reports password confirmation errors on the confirmation field', () => {
  const result = registerSchema.safeParse({
    username: 'customer',
    email: 'test@example.com',
    fullName: 'Test User',
    password: '123456',
    confirmPassword: '654321',
  });
  assert.equal(result.success, false);
  assert.ok(result.error.issues.some((issue) => issue.path[0] === 'confirmPassword'));
});
