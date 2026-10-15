/**
 * Xử lý đường dẫn hình ảnh cho toàn bộ hệ thống:
 * 1. Nếu là link online (http://, https://) -> giữ nguyên
 * 2. Nếu là ảnh preview tạm thời (blob:, data:) -> giữ nguyên
 * 3. Nếu là ảnh upload cục bộ (/uploads/... hoặc uploads/...) -> tự động gắn base URL của backend hoặc proxy
 * 4. Nếu không có ảnh hoặc lỗi -> trả về ảnh placeholder mặc định
 */
export const getImageUrl = (url?: string | null): string => {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return '/product-placeholder.svg';
  }

  const trimmed = url.trim();

  // Link online hoặc blob preview
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // Ảnh upload cục bộ trên backend
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const backendBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
  return `${backendBase}${cleanPath}`;
};
