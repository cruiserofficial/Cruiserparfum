CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT,
  role TEXT NOT NULL DEFAULT 'customer',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tagline TEXT,
  description TEXT,
  story TEXT,
  price INTEGER NOT NULL,
  compare_price INTEGER,
  sku TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  volume_ml INTEGER NOT NULL DEFAULT 50,
  concentration TEXT NOT NULL DEFAULT 'Extrait De Parfum',
  color_accent TEXT NOT NULL DEFAULT '#C9A84C',
  dna TEXT NOT NULL DEFAULT '[]',
  scent_notes TEXT NOT NULL DEFAULT '[]',
  images_json TEXT NOT NULL DEFAULT '[]',
  is_featured INTEGER NOT NULL DEFAULT 0,
  is_bestseller INTEGER NOT NULL DEFAULT 0,
  is_new INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 99,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  recipient TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT '',
  province TEXT NOT NULL DEFAULT '',
  postal_code TEXT NOT NULL DEFAULT '',
  notes TEXT,
  shipping_method TEXT NOT NULL DEFAULT '',
  courier TEXT,
  shipping_cost INTEGER NOT NULL DEFAULT 0,
  subtotal INTEGER NOT NULL,
  total INTEGER NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  tracking_number TEXT,
  is_guest INTEGER NOT NULL DEFAULT 0,
  user_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  image_url TEXT
);

CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  value INTEGER NOT NULL DEFAULT 0,
  min_order INTEGER NOT NULL DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  expires_at TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Seed: 3 products
INSERT OR IGNORE INTO products (id, name, slug, tagline, description, story, price, compare_price, sku, stock, volume_ml, concentration, color_accent, dna, scent_notes, images_json, is_featured, is_bestseller, is_new, is_active, sort_order, created_at, updated_at) VALUES
(
  'prod-eternity', 'Eternity', 'eternity', 'Freshness That Lingers.',
  'Kesegaran buah seperti pineapple dan apple membuka aroma dengan kesan cerah dan hidup, lalu perlahan berubah menjadi manis hangat dari caramel. Wangi ini tidak hanya segar di awal, tapi meninggalkan jejak yang tahan lama dan berkesan — makanya lingers.',
  'Eternity was born from the belief that a truly great fragrance should feel alive from the very first spray — bold, vibrant, and unforgettable.',
  299000, 350000, 'CRS-ETR-50', 50, 50, 'Extrait De Parfum', '#8B9E6A',
  '["Fresh","Sweet","Addictive"]',
  '[{"name":"Pineapple","icon":"🍍","type":"top"},{"name":"Green Apple","icon":"🍏","type":"top"},{"name":"Lemon","icon":"🍋","type":"top"},{"name":"Caramel","icon":"🟤","type":"heart"},{"name":"Bergamot","icon":"🍊","type":"base"}]',
  '[{"id":"1a","productId":"prod-eternity","url":"/images/eternity-splash.png","alt":"ETERNITY by CRUISER","sortOrder":0,"isPrimary":true},{"id":"1b","productId":"prod-eternity","url":"/images/eternity-scene.png","alt":"ETERNITY scene","sortOrder":1,"isPrimary":false},{"id":"1c","productId":"prod-eternity","url":"/images/eternity-packaging.png","alt":"ETERNITY packaging","sortOrder":2,"isPrimary":false},{"id":"1d","productId":"prod-eternity","url":"/images/eternity-bottles.png","alt":"ETERNITY bottles","sortOrder":3,"isPrimary":false}]',
  1, 0, 0, 1, 1, '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'
),
(
  'prod-noctis', 'Noctis', 'noctis', 'Embrace the Night.',
  'Aroma madu, vanilla, dan cinnamon menciptakan karakter hangat, dalam, dan sensual — seperti suasana malam yang tenang tapi penuh daya tarik.',
  'Noctis draws its soul from the quiet power of midnight — when the world stills and only warmth remains.',
  299000, 350000, 'CRS-NCT-50', 30, 50, 'Extrait De Parfum', '#7A1A45',
  '["Warm","Sensual","Deep"]',
  '[{"name":"Honey","icon":"🍯","type":"top"},{"name":"Vanilla","icon":"🌼","type":"heart"},{"name":"Cinnamon","icon":"🪵","type":"heart"},{"name":"Jasmine","icon":"🌸","type":"heart"},{"name":"Musk","icon":"✨","type":"base"}]',
  '[{"id":"2a","productId":"prod-noctis","url":"/images/noctis-splash.png","alt":"NOCTIS by CRUISER","sortOrder":0,"isPrimary":true},{"id":"2b","productId":"prod-noctis","url":"/images/noctis-packaging.png","alt":"NOCTIS packaging","sortOrder":1,"isPrimary":false},{"id":"2c","productId":"prod-noctis","url":"/images/noctis-bottles.png","alt":"NOCTIS bottles","sortOrder":2,"isPrimary":false}]',
  1, 1, 0, 1, 2, '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'
),
(
  'prod-liberea', 'Liberea', 'liberea', 'Softness in Every Note.',
  'Perpaduan lemon yang ringan dengan vanilla dan butter menciptakan aroma yang lembut, bersih, dan nyaman.',
  'Liberea was crafted for those who believe true luxury whispers, never shouts.',
  299000, 350000, 'CRS-LBR-50', 45, 50, 'Extrait De Parfum', '#1A5F8A',
  '["Creamy","Fresh","Comforting"]',
  '[{"name":"Lemon","icon":"🍋","type":"top"},{"name":"Vanilla","icon":"🌼","type":"heart"},{"name":"Butter","icon":"🧈","type":"heart"},{"name":"Pink Pepper","icon":"🌸","type":"top"},{"name":"White Floral","icon":"⚪","type":"base"}]',
  '[{"id":"3a","productId":"prod-liberea","url":"/images/liberea-splash.png","alt":"LIBEREA by CRUISER","sortOrder":0,"isPrimary":true},{"id":"3b","productId":"prod-liberea","url":"/images/liberea-packaging.png","alt":"LIBEREA packaging","sortOrder":1,"isPrimary":false},{"id":"3c","productId":"prod-liberea","url":"/images/liberea-bottles.png","alt":"LIBEREA bottles","sortOrder":2,"isPrimary":false}]',
  1, 0, 0, 1, 3, '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'
);

-- Default admin settings
INSERT OR IGNORE INTO admin_settings (key, value, updated_at) VALUES
('payment_methods', '{"midtrans":false,"qris":true,"bankTransfer":true,"cod":true}', '2026-01-01T00:00:00Z'),
('bank_accounts', '[]', '2026-01-01T00:00:00Z'),
('qris_image', 'null', '2026-01-01T00:00:00Z'),
('store_info', '{"phone":"","address":"","instagram":"cruiser.official"}', '2026-01-01T00:00:00Z');
