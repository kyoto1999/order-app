-- Menus (메뉴)
CREATE TABLE IF NOT EXISTS menus (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  image_url VARCHAR(500),
  stock INTEGER NOT NULL DEFAULT 0
);

-- Options (옵션)
CREATE TABLE IF NOT EXISTS options (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  additional_price INTEGER NOT NULL DEFAULT 0,
  menu_id INTEGER NOT NULL REFERENCES menus(id) ON DELETE CASCADE
);

-- Orders (주문)
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  ordered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'received',
  total_price INTEGER NOT NULL
);

-- Order_Items (주문 항목)
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_id INTEGER NOT NULL REFERENCES menus(id),
  menu_name VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL,
  options JSONB DEFAULT '[]'
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_options_menu_id ON options(menu_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
