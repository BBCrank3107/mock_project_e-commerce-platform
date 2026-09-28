-- ==============================================================================
-- DATABASE SCHEMA: E-COMMERCE PLATFORM (POSTGRESQL)
-- Đáp ứng yêu cầu ít nhất 15 bảng theo MOCK_PROJECTS.md
-- Thiết kế phân tách rõ ràng cho 2 thành viên:
-- Member A: roles, users, user_roles, categories, subcategories, products, product_images, reviews, wishlists
-- Member B: inventory, promotions, carts, cart_items, orders, order_items, payments, shipping_info, notifications
-- ==============================================================================

-- 1. ROLES
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS wishlists CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS shipping_info CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS promotions CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS subcategories CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- 1. ROLES
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- 2. USERS
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. USER_ROLES (n-n)
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- 4. CATEGORIES
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    icon_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE
);

-- 5. SUBCATEGORIES
CREATE TABLE subcategories (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- 6. PRODUCTS
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    subcategory_id BIGINT NOT NULL REFERENCES subcategories(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    sku VARCHAR(100) UNIQUE,
    price NUMERIC(12, 2) NOT NULL,
    discount_price NUMERIC(12, 2),
    description TEXT,
    thumbnail_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. PRODUCT_IMAGES (File Upload Feature)
CREATE TABLE product_images (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    is_thumbnail BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. INVENTORY
CREATE TABLE inventory (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
    stock_quantity INT NOT NULL DEFAULT 0,
    low_stock_threshold INT NOT NULL DEFAULT 5,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. PROMOTIONS (Discounts / Coupons)
CREATE TABLE promotions (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    discount_percent INT NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
    max_discount_amount NUMERIC(12, 2),
    min_order_amount NUMERIC(12, 2) DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_to TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- 10. CARTS
CREATE TABLE carts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. CART_ITEMS
CREATE TABLE cart_items (
    id BIGSERIAL PRIMARY KEY,
    cart_id BIGINT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    price NUMERIC(12, 2) NOT NULL,
    CONSTRAINT uq_cart_product UNIQUE (cart_id, product_id)
);

-- 12. ORDERS
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    order_code VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    promotion_id BIGINT REFERENCES promotions(id) ON DELETE SET NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    discount_amount NUMERIC(12, 2) DEFAULT 0,
    final_amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, CONFIRMED, SHIPPING, COMPLETED, CANCELLED
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. ORDER_ITEMS
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL
);

-- 14. PAYMENTS
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'COD', -- COD, BANKING, VNPAY
    payment_status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, COMPLETED, FAILED
    transaction_code VARCHAR(100),
    amount NUMERIC(12, 2) NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE
);

-- 15. SHIPPING_INFO
CREATE TABLE shipping_info (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    recipient_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    shipping_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    tracking_code VARCHAR(100),
    shipping_status VARCHAR(50) DEFAULT 'PREPARING', -- PREPARING, IN_TRANSIT, DELIVERED, RETURNED
    estimated_delivery TIMESTAMP WITH TIME ZONE
);

-- 16. REVIEWS
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_product_review UNIQUE (user_id, product_id)
);

-- 17. WISHLISTS (Dự phòng / Bonus)
CREATE TABLE wishlists (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_product_wishlist UNIQUE (user_id, product_id)
);

-- 18. NOTIFICATIONS (Dự phòng / Bonus)
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE & SEARCH
-- ==============================================================================
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_subcategory ON products(subcategory_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);

-- ==============================================================================
-- INITIAL SEED DATA
-- Password mặc định cho tài khoản là '123456' (BCrypt: $2a$10$wO3nC78qQxVqg1Zp9Hj0iO45FqK/q6M18pI1G9dF0Yl.YgGvB6f7e)
-- ==============================================================================
INSERT INTO roles (name, description) VALUES
('ROLE_ADMIN', 'Administrator with full system privileges'),
('ROLE_CUSTOMER', 'Registered customer'),
('ROLE_VENDOR', 'Vendor who can sell products');

INSERT INTO users (username, email, password, full_name, phone, is_active) VALUES
('admin', 'admin@ecommerce.com', '$2a$10$wO3nC78qQxVqg1Zp9Hj0iO45FqK/q6M18pI1G9dF0Yl.YgGvB6f7e', 'System Administrator', '0901234567', TRUE),
('customer', 'customer@gmail.com', '$2a$10$wO3nC78qQxVqg1Zp9Hj0iO45FqK/q6M18pI1G9dF0Yl.YgGvB6f7e', 'Nguyen Van A', '0912345678', TRUE);

-- Gán role
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1), -- admin có ROLE_ADMIN
(2, 2); -- customer có ROLE_CUSTOMER

-- Categories & Subcategories
INSERT INTO categories (name, slug, description, icon_url) VALUES
('Điện tử & Công nghệ', 'dien-tu-cong-nghe', 'Thiết bị điện thoại, máy tính, công nghệ cao', '/icons/electronics.svg'),
('Thời trang & Phụ kiện', 'thoi-trang-phu-kien', 'Quần áo nam nữ, giày dép, phụ kiện thời trang', '/icons/fashion.svg'),
('Gia dụng & Đời sống', 'gia-dung-doi-song', 'Đồ gia dụng tiện ích cho gia đình', '/icons/home.svg');

INSERT INTO subcategories (category_id, name, slug, description) VALUES
(1, 'Điện thoại thông minh', 'dien-thoai-thong-minh', 'iPhone, Samsung, Xiaomi...'),
(1, 'Laptop & Máy tính xách tay', 'laptop-may-tinh-xach-tay', 'MacBook, Dell, ThinkPad...'),
(2, 'Áo thun & Sơ mi nam', 'ao-thun-so-mi-nam', 'Thời trang nam đa phong cách'),
(2, 'Váy & Đầm nữ', 'vay-dam-nu', 'Thời trang nữ thanh lịch'),
(3, 'Nồi chiên không dầu', 'noi-chien-khong-dau', 'Gia dụng thông minh');

-- Products
INSERT INTO products (subcategory_id, name, slug, sku, price, discount_price, description, thumbnail_url, is_active) VALUES
(1, 'iPhone 15 Pro 128GB', 'iphone-15-pro-128gb', 'IP15P-128', 27990000, 25990000, 'Khung Titan chuẩn hàng không vũ trụ, chip A17 Pro cực mạnh.', '/uploads/products/iphone15pro.png', TRUE),
(1, 'Samsung Galaxy S24 Ultra', 'samsung-galaxy-s24-ultra', 'SS-S24U-256', 29990000, 26990000, 'Galaxy AI thông minh, camera 200MP đột phá, bút S-Pen tiện ích.', '/uploads/products/s24ultra.png', TRUE),
(2, 'MacBook Air M3 13 inch', 'macbook-air-m3-13-inch', 'MBA-M3-8G', 26990000, 24500000, 'Siêu mỏng nhẹ, pin trâu đến 18 giờ, hiệu năng chip M3 đỉnh cao.', '/uploads/products/macbookm3.png', TRUE),
(3, 'Áo Thun Cotton Premium Oversize', 'ao-thun-cotton-premium-oversize', 'AT-COT-01', 250000, 199000, 'Chất liệu 100% cotton co giãn 4 chiều, thấm hút mồ hôi tối đa.', '/uploads/products/aothun.png', TRUE),
(5, 'Nồi Chiên Không Dầu Philips HD9252', 'noi-chien-khong-dau-philips-hd9252', 'PL-HD9252', 2200000, 1690000, 'Dung tích 4.1L, công nghệ Rapid Air giảm 90% dầu mỡ.', '/uploads/products/noichien.png', TRUE);

-- Inventory
INSERT INTO inventory (product_id, stock_quantity, low_stock_threshold) VALUES
(1, 20, 5),
(2, 15, 3),
(3, 10, 2),
(4, 100, 10),
(5, 35, 5);

-- Promotions
INSERT INTO promotions (code, description, discount_percent, max_discount_amount, min_order_amount, valid_from, valid_to, is_active) VALUES
('WELCOME10', 'Giảm 10% cho đơn hàng đầu tiên', 10, 500000, 1000000, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '30 days', TRUE),
('MOCKPROJECT', 'Giảm 20% mock project demo', 20, 1000000, 500000, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '7 days', TRUE);
