-- ==============================================================================
-- DATABASE SCHEMA & COMPREHENSIVE SEED DATA
-- Project: E-Commerce Platform (CyberTech Store)
-- Database: PostgreSQL 16+
-- Đáp ứng yêu cầu ít nhất 15 bảng theo MOCK_PROJECTS.md (18 bảng hoàn chỉnh)
-- ==============================================================================

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

-- 17. WISHLISTS
CREATE TABLE wishlists (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_product_wishlist UNIQUE (user_id, product_id)
);

-- 18. NOTIFICATIONS
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 19. IDEMPOTENCY_RECORDS (Payment & Checkout Idempotency Protection)
CREATE TABLE IF NOT EXISTS idempotency_records (
    id BIGSERIAL PRIMARY KEY,
    idempotency_key VARCHAR(120) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_path VARCHAR(255) NOT NULL,
    request_hash VARCHAR(64) NOT NULL,
    order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PROCESSING',
    response_code INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_idempotency_key ON idempotency_records(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_idempotency_user ON idempotency_records(user_id);

-- ==============================================================================
-- INDEXES
-- ==============================================================================
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_subcategory ON products(subcategory_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);

-- ==============================================================================
-- COMPREHENSIVE SEED DATA (CYBERTECH STORE)
-- Password mặc định: 123456 (BCrypt: $2a$10$vENG9oojbP47y01jzk.Dt.B7xqHfo9FY5p7umi6cr6avumFH45HSO)
-- ==============================================================================

-- 1. Roles
INSERT INTO roles (name, description) VALUES
('ROLE_ADMIN', 'Quản trị viên toàn quyền hệ thống'),
('ROLE_CUSTOMER', 'Khách hàng mua sắm'),
('ROLE_VENDOR', 'Nhà phân phối bán hàng');

-- 2. Users
INSERT INTO users (username, email, password, full_name, phone, avatar_url, is_active) VALUES
('admin', 'admin@cybertech.vn', '$2a$10$vENG9oojbP47y01jzk.Dt.B7xqHfo9FY5p7umi6cr6avumFH45HSO', 'Quản Trị Viên CyberTech', '0988123456', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', TRUE),
('customer', 'customer@gmail.com', '$2a$10$vENG9oojbP47y01jzk.Dt.B7xqHfo9FY5p7umi6cr6avumFH45HSO', 'Nguyễn Văn An', '0912345678', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', TRUE),
('hoangnam', 'nam.tran@gmail.com', '$2a$10$vENG9oojbP47y01jzk.Dt.B7xqHfo9FY5p7umi6cr6avumFH45HSO', 'Trần Hoàng Nam', '0909888999', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', TRUE);

-- Gán quyền User
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1), -- admin có ROLE_ADMIN
(1, 2), -- admin cũng có ROLE_CUSTOMER
(2, 2), -- customer có ROLE_CUSTOMER
(3, 2); -- hoangnam có ROLE_CUSTOMER

-- 3. Categories (5 Danh mục công nghệ)
INSERT INTO categories (name, slug, description, icon_url) VALUES
('Điện Thoại & Tablet', 'dien-thoai-tablet', 'Smartphone cao cấp, iPad và máy tính bảng mới nhất', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100'),
('Laptop & Máy Tính', 'laptop-may-tinh', 'MacBook, Laptop Gaming, Ultrabook mỏng nhẹ hiệu năng đỉnh cao', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=100'),
('Âm Thanh & Tai Nghe', 'am-thanh-tai-nghe', 'Tai nghe chống ồn chủ động, loa Bluetooth thời thượng', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'),
('Đồng Hồ Thông Minh', 'dong-ho-thong-minh', 'Apple Watch, Galaxy Watch đo sức khỏe và thể thao chuyên nghiệp', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'),
('Phụ Kiện Công Nghệ', 'phu-kien-cong-nghe', 'Bàn phím cơ, chuột không dây, củ sạc GaN, cáp sạc nhanh', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=100');

-- 4. Subcategories (10 Danh mục con)
INSERT INTO subcategories (category_id, name, slug, description) VALUES
(1, 'iPhone', 'iphone', 'Các dòng điện thoại Apple iPhone chính hãng'),
(1, 'Samsung Galaxy', 'samsung-galaxy', 'Dòng flagship Samsung Galaxy Ultra và Flip/Fold'),
(1, 'iPad & Tablet', 'ipad-tablet', 'Máy tính bảng iPad Pro, iPad Air và Samsung Tab'),
(2, 'MacBook & Mac', 'macbook-mac', 'Apple MacBook Pro, MacBook Air trang bị chip Apple Silicon'),
(2, 'Laptop Gaming & Đồ Họa', 'laptop-gaming-do-hoa', 'Laptop cấu hình mạnh với card đồ họa RTX chuyên game và thiết kế'),
(3, 'Tai Nghe Chống Ồn', 'tai-nghe-chong-on', 'Tai nghe True Wireless và Over-ear chống ồn đỉnh cao'),
(3, 'Loa Bluetooth', 'loa-bluetooth', 'Loa di động âm thanh chất lượng, kháng nước vượt trội'),
(4, 'Apple Watch', 'apple-watch', 'Đồng hồ thông minh Apple Watch Ultra và Series mới nhất'),
(4, 'Galaxy Watch', 'galaxy-watch', 'Đồng hồ thông minh Samsung Galaxy Watch'),
(5, 'Bàn Phím & Chuột', 'ban-phim-chuot', 'Bàn phím cơ cơ học cao cấp, chuột công thái học không dây');

-- 5. Products (15 Sản phẩm công nghệ bán chạy thực tế)
INSERT INTO products (subcategory_id, name, slug, sku, price, discount_price, description, thumbnail_url, is_active) VALUES
(1, 'iPhone 15 Pro Max 256GB Titan Tự Nhiên', 'iphone-15-pro-max-256gb-titan', 'APL-IP15PM-256', 29990000, 27490000, 'Thiết kế khung viền Titan siêu bền nhẹ, màn hình Super Retina XDR 120Hz mượt mà, chip A17 Pro mạnh mẽ bậc nhất cùng camera tiềm vọng zoom quang học 5x.', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600', TRUE),
(2, 'Samsung Galaxy S24 Ultra 12GB/256GB AI Phone', 'samsung-galaxy-s24-ultra-ai', 'SS-S24U-256', 31990000, 28990000, 'Tích hợp bộ công cụ quyền năng Galaxy AI, khung viền Titanium sang trọng, camera 200MP bắt trọn chi tiết trong đêm và bút S-Pen thông minh tiện lợi.', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600', TRUE),
(3, 'iPad Pro M4 11 inch Wi-Fi 256GB Space Black', 'ipad-pro-m4-11-inch-256gb', 'APL-IPADM4-11', 28990000, 26990000, 'Độ mỏng kỷ lục thế giới, màn hình Ultra Retina XDR Tandem OLED tuyệt đẹp, hiệu năng xử lý đột phá cùng chip Apple M4 thế hệ mới.', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600', TRUE),
(4, 'MacBook Pro 14 inch M3 Pro 18GB/512GB Space Black', 'macbook-pro-14-m3-pro-18-512', 'APL-MBP14-M3P', 49990000, 46990000, 'Cỗ máy trạm di động chuyên nghiệp cho lập trình viên và thiết kế đồ họa, thời lượng pin ấn tượng lên đến 22 giờ liên tục, màn hình Liquid Retina XDR rực rỡ.', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600', TRUE),
(4, 'MacBook Air 13 inch M3 8GB/256GB Midnight', 'macbook-air-13-m3-midnight', 'APL-MBA13-M3', 27990000, 25490000, 'Thiết kế nhôm nguyên khối siêu mỏng nhẹ, pin 18 giờ, không quạt tản nhiệt hoàn toàn yên tĩnh, màu xanh Midnight huyền bí cuốn hút.', 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600', TRUE),
(5, 'Asus ROG Zephyrus G16 OLED Gaming Laptop RTX 4070', 'asus-rog-zephyrus-g16-oled', 'ASUS-G16-4070', 58990000, 54990000, 'Laptop gaming mỏng nhẹ cao cấp nhất với màn hình ROG Nebula OLED 240Hz, CPU Intel Core Ultra 9 và card đồ họa NVIDIA GeForce RTX 4070.', 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600', TRUE),
(6, 'Tai nghe chống ồn Sony WH-1000XM5 Silver', 'tai-nghe-sony-wh-1000xm5-silver', 'SNY-WH1000XM5', 8490000, 6990000, 'Công nghệ chống ồn hàng đầu thế giới với bộ xử lý kép V1 và QN1, chất âm Hi-Res Audio chuẩn phòng thu, đàm thoại trong trẻo với 8 micro AI.', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', TRUE),
(6, 'Tai nghe Apple AirPods Pro 2 USB-C MagSafe', 'airpods-pro-2-usb-c', 'APL-APP2-USBC', 6190000, 5290000, 'Chống ồn chủ động mạnh gấp 2 lần, tính năng Nhận biết Cuộc trò chuyện thông minh và Âm thanh Không gian cá nhân hóa với cổng sạc Type-C tiện lợi.', 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600', TRUE),
(7, 'Loa Bluetooth Marshall Emberton II Black & Brass', 'loa-marshall-emberton-ii', 'MSH-EMB2-BLK', 4290000, 3690000, 'Âm thanh đa hướng True Stereophonic 360 độ độc quyền, thời gian phát nhạc trên 30 giờ, chuẩn chống nước bụi IP67 chuẩn phong cách cổ điển.', 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600', TRUE),
(8, 'Apple Watch Ultra 2 GPS + Cellular 49mm Titan', 'apple-watch-ultra-2-49mm', 'APL-AWU2-49', 21990000, 19990000, 'Màn hình sáng nhất 3000 nits, vỏ Titan chống ăn mòn, nút Action tùy biến, đo độ sâu dưới nước và GPS tần số kép cho vận động viên chuyên nghiệp.', 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600', TRUE),
(9, 'Samsung Galaxy Watch 6 Classic 47mm LTE Black', 'samsung-galaxy-watch-6-classic-47mm', 'SS-GW6C-47', 8990000, 7490000, 'Viền xoay bezel vật lý đặc trưng, mặt kính Sapphire bền bỉ, tính năng theo dõi giấc ngủ cá nhân hóa và phân tích thành phần cơ thể BIA.', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600', TRUE),
(10, 'Chuột không dây công thái học Logitech MX Master 3S', 'logitech-mx-master-3s', 'LOG-MX3S-GRA', 2490000, 2090000, 'Cảm biến 8000 DPI lướt trên mọi bề mặt kính, cuộn siêu tốc MagSpeed 1000 dòng/giây, nút bấm Quiet Clicks êm ái giảm 90% tiếng ồn.', 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600', TRUE),
(10, 'Bàn phím cơ không dây Keychron K2 Pro QMK/VIA', 'keychron-k2-pro-wireless', 'KEY-K2PRO-RED', 2650000, 2290000, 'Bố cục 75% gọn gàng, hỗ trợ tùy biến phím qua QMK/VIA, switch Keychron K Pro êm ái, kết nối Bluetooth 5.1 cùng lúc 3 thiết bị Mac/Windows.', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600', TRUE),
(10, 'Củ sạc nhanh Anker Prime 67W GaN 3 Cổng A2669', 'cu-sac-anker-prime-67w-gan', 'ANK-P67-GAN', 1390000, 1090000, 'Công nghệ GaNPrime độc quyền nhỏ gọn hơn 51%, phân phối điện năng thông minh MultiDevice, sạc nhanh đồng thời 2 laptop và 1 điện thoại.', 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600', TRUE),
(10, 'Cáp sạc Type-C to C Ugreen 100W Bọc Dù 2M', 'cap-sac-ugreen-100w-type-c-2m', 'UGR-CC-100W', 250000, 189000, 'Hỗ trợ sạc nhanh chuẩn Power Delivery 100W 5A, chip E-Marker bảo vệ quá nhiệt quá dòng, vỏ bọc dù bện nylon chống đứt gãy 20.000 lần gập.', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600', TRUE);

-- 6. Product Images (Thêm ảnh chi tiết cho tính năng upload/gallery)
INSERT INTO product_images (product_id, image_url, is_thumbnail) VALUES
(1, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600', TRUE),
(1, 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600', FALSE),
(2, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600', TRUE),
(4, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600', TRUE),
(7, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', TRUE),
(12, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600', TRUE);

-- 7. Inventory (Tồn kho thực tế)
INSERT INTO inventory (product_id, stock_quantity, low_stock_threshold) VALUES
(1, 25, 5),
(2, 18, 3),
(3, 12, 2),
(4, 8, 2),
(5, 30, 5),
(6, 6, 2),
(7, 40, 8),
(8, 55, 10),
(9, 22, 5),
(10, 14, 3),
(11, 16, 4),
(12, 70, 15),
(13, 45, 10),
(14, 35, 8),
(15, 120, 20);

-- 8. Promotions (Voucher giảm giá cho đơn hàng)
INSERT INTO promotions (code, description, discount_percent, max_discount_amount, min_order_amount, valid_from, valid_to, is_active) VALUES
('WELCOME10', 'Giảm 10% cho khách hàng mới gia nhập CyberTech', 10, 500000, 1000000, CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP + INTERVAL '30 days', TRUE),
('MOCKPROJECT', 'Giảm 20% cho dự án thực hành', 20, 1000000, 500000, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '7 days', TRUE),
('CYBERTECH20', 'Ưu đãi Lễ hội Công nghệ giảm sốc 20%', 20, 1500000, 5000000, CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP + INTERVAL '15 days', TRUE),
('FREESHIP', 'Mã trợ giá vận chuyển toàn quốc giảm 5%', 5, 200000, 500000, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '60 days', TRUE);

-- 9. Reviews (Đánh giá khách hàng)
INSERT INTO reviews (user_id, product_id, rating, comment) VALUES
(2, 1, 5, 'Máy đẹp xuất sắc, viền titan cầm nhẹ hơn hẳn bản 14 Pro Max. Pin trâu dùng cả ngày không hết!'),
(3, 1, 5, 'Camera zoom 5x chụp concert cực kỳ rõ nét, giao hàng siêu nhanh đóng gói cẩn thận.'),
(2, 4, 5, 'MacBook M3 Pro dựng video 4K mượt mà không hề giật lag, màu Space Black cực sang trọng.'),
(3, 7, 5, 'Chống ồn Sony đỉnh nhất phân khúc, đeo êm tai không bị đau đầu khi làm việc cả ngày.'),
(2, 12, 4, 'Chuột cầm rất vừa tay, cuộn con lăn kim loại cực thích, pin dùng 2 tháng mới phải sạc lại.');

-- 10. Wishlists (Mẫu)
INSERT INTO wishlists (user_id, product_id) VALUES
(2, 4),
(2, 7),
(3, 1);

-- 11. Carts & Cart Items (Giỏ hàng mẫu cho customer)
INSERT INTO carts (id, user_id) VALUES (1, 2);
INSERT INTO cart_items (cart_id, product_id, quantity, price) VALUES
(1, 12, 1, 2090000), -- 1 chuột MX Master 3S
(1, 15, 2, 189000);  -- 2 cáp sạc Ugreen

-- 12. Orders, Order Items, Payments & Shipping Info (2 Đơn hàng mẫu để kiểm thử Admin Orders)
-- Đơn hàng 1: COMPLETED
INSERT INTO orders (id, order_code, user_id, promotion_id, total_amount, discount_amount, final_amount, status, notes) VALUES
(1, 'ORD-20261001-001', 2, 1, 27490000, 500000, 26990000, 'COMPLETED', 'Giao giờ hành chính, gọi trước khi giao');

INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES
(1, 1, 1, 27490000, 27490000);

INSERT INTO payments (order_id, payment_method, payment_status, transaction_code, amount, paid_at) VALUES
(1, 'BANKING', 'COMPLETED', 'VNPAY-88992211', 26990000, CURRENT_TIMESTAMP - INTERVAL '3 days');

INSERT INTO shipping_info (order_id, recipient_name, phone_number, shipping_address, city, tracking_code, shipping_status, estimated_delivery) VALUES
(1, 'Nguyễn Văn An', '0912345678', 'Số 123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1', 'TP. Hồ Chí Minh', 'GHN-88229911', 'DELIVERED', CURRENT_TIMESTAMP - INTERVAL '2 days');

-- Đơn hàng 2: PENDING (Chờ duyệt)
INSERT INTO orders (id, order_code, user_id, promotion_id, total_amount, discount_amount, final_amount, status, notes) VALUES
(2, 'ORD-20261005-002', 3, NULL, 5290000, 0, 5290000, 'PENDING', 'Giao buổi tối sau 18h');

INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES
(2, 8, 1, 5290000, 5290000);

INSERT INTO payments (order_id, payment_method, payment_status, transaction_code, amount) VALUES
(2, 'COD', 'PENDING', NULL, 5290000);

INSERT INTO shipping_info (order_id, recipient_name, phone_number, shipping_address, city, tracking_code, shipping_status) VALUES
(2, 'Trần Hoàng Nam', '0909888999', 'Số 45 Đường Cầu Giấy, Phường Quan Hoa, Quận Cầu Giấy', 'Hà Nội', 'VTP-334455', 'PREPARING');

-- Explicit seed IDs must not collide with the next generated cart/order IDs.
SELECT setval(pg_get_serial_sequence('carts', 'id'), (SELECT MAX(id) FROM carts));
SELECT setval(pg_get_serial_sequence('orders', 'id'), (SELECT MAX(id) FROM orders));
