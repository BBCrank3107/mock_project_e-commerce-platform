const priceLimit = 60_000_000;
export function readCatalogQuery(params: URLSearchParams) {
  const finite = (value: string | null, fallback: number) =>
    value?.trim() && Number.isFinite(Number(value)) ? Number(value) : fallback;
  const minPrice = Math.min(priceLimit, Math.max(0, finite(params.get('minPrice'), 0)));
  const maxPrice = Math.min(
    priceLimit,
    Math.max(minPrice, finite(params.get('maxPrice'), priceLimit))
  );
  const subcategoryId = finite(params.get('subcategoryId'), 0);
  const requestedSort = params.get('sort') || '';
  return {
    keyword: params.get('keyword') || '',
    subcategory: Number.isInteger(subcategoryId) && subcategoryId > 0 ? subcategoryId : undefined,
    minPrice,
    maxPrice,
    page: Math.max(1, Math.floor(finite(params.get('page'), 1))),
    sort: ['createdAt-desc', 'price-asc', 'price-desc', 'name-asc'].includes(requestedSort)
      ? requestedSort
      : 'createdAt-desc',
  };
}
export function updateCatalogQuery(
  previous: URLSearchParams,
  patch: Record<string, string | undefined>
) {
  const next = new URLSearchParams(previous);
  next.delete('page');
  Object.entries(patch).forEach(([key, value]) =>
    value ? next.set(key, value) : next.delete(key)
  );
  return next;
}
