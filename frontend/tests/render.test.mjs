import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server.js';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const loadSource = (path) => require(`../src/${path}`);

test('storefront, auth and admin navigation render with the shared theme', async () => {
  const previousStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: () => null, setItem() {}, removeItem() {} },
  });
  const previousExtensions = ['.ts', '.tsx'].map((extension) => [
    extension,
    require.extensions[extension],
  ]);
  for (const [extension] of previousExtensions) {
    require.extensions[extension] = (module, filename) => {
      // Load only the icons used by each page, as the production bundler does.
      const source = readFileSync(filename, 'utf8').replace(
        /import\s*\{([^}]+)\}\s*from\s*['"]@mui\/icons-material['"];?/g,
        (_, names) =>
          names
            .split(',')
            .map((name) => {
              const [icon, alias] = name.trim().split(/\s+as\s+/);
              return icon ? `import ${alias || icon} from '@mui/icons-material/${icon}';` : '';
            })
            .join('\n')
      );
      const { outputText } = ts.transpileModule(source, {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          jsx: ts.JsxEmit.ReactJSX,
          esModuleInterop: true,
          target: ts.ScriptTarget.ES2022,
        },
        fileName: filename,
      });
      module._compile(outputText, filename);
    };
  }
  try {
    const { ThemeProvider } = require('@mui/material/styles');
    const { theme } = loadSource('theme.ts');
    const { AuthProvider } = loadSource('context/AuthContext.tsx');
    const { CartProvider } = loadSource('features/cart_checkout/CartContext.tsx');
    const render = (component, props = {}, location = '/') =>
      renderToString(
        React.createElement(
          ThemeProvider,
          { theme },
          React.createElement(
            StaticRouter,
            { location },
            React.createElement(
              AuthProvider,
              null,
              React.createElement(CartProvider, null, React.createElement(component, props))
            )
          )
        )
      );
    const { ProductListPage } = loadSource('features/catalog/ProductListPage.tsx');
    const home = render(ProductListPage);
    assert.ok(home.includes('Công nghệ tốt.'));
    assert.ok(home.includes('collection'));
    assert.ok(home.includes('Tìm trong bộ sưu tập'));
    const results = render(ProductListPage, {}, '/?keyword=Sony&subcategoryId=6');
    assert.ok(results.includes('Sony'));
    assert.ok(!results.includes('Công nghệ tốt.'));
    const { LoginPage } = loadSource('features/auth/LoginPage.tsx');
    const login = render(LoginPage, {}, '/login');
    assert.ok(login.includes('current-password'));
    assert.ok(login.includes('Hiện mật khẩu'));
    assert.ok(!login.includes('Tài khoản kiểm thử'));
    const { RegisterPage } = loadSource('features/auth/RegisterPage.tsx');
    assert.ok(render(RegisterPage, {}, '/register').includes('confirmPassword'));
    const { AdminLayout } = loadSource('components/layout/AdminLayout.tsx');
    const admin = render(AdminLayout, {}, '/admin/orders');
    assert.ok(admin.includes('/admin/orders'));
    assert.ok(admin.includes('/admin/products'));
  } finally {
    for (const [extension, original] of previousExtensions) {
      if (original) require.extensions[extension] = original;
      else delete require.extensions[extension];
    }
    if (previousStorage) Object.defineProperty(globalThis, 'localStorage', previousStorage);
    else delete globalThis.localStorage;
  }
});
