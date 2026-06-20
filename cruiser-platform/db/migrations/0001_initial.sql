-- Cruiser Parfum — D1 Database Schema
-- Migration: 0001_initial

-- ── Users ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email       TEXT UNIQUE NOT NULL,
  name        TEXT,
  image       TEXT,
  role        TEXT NOT NULL DEFAULT 'customer' CHECK(role IN ('customer','admin','superadmin')),
  phone       TEXT,
  email_verified INTEGER DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Accounts (OAuth) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS accounts (
  id                    TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id               TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type                  TEXT NOT NULL,
  provider              TEXT NOT NULL,
  provider_account_id   TEXT NOT NULL,
  refresh_token         TEXT,
  access_token          TEXT,
  expires_at            INTEGER,
  token_type            TEXT,
  scope                 TEXT,
  id_token              TEXT,
  session_state         TEXT,
  UNIQUE(provider, provider_account_id)
);

-- ── Sessions ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  session_token TEXT UNIQUE NOT NULL,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires       TEXT NOT NULL
);

-- ── Verification Tokens ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier  TEXT NOT NULL,
  token       TEXT UNIQUE NOT NULL,
  expires     TEXT NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- ── Addresses ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS addresses (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label       TEXT NOT NULL DEFAULT 'Home',
  recipient   TEXT NOT NULL,
  phone       TEXT NOT NULL,
  address     TEXT NOT NULL,
  city        TEXT NOT NULL,
  province    TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country     TEXT NOT NULL DEFAULT 'Indonesia',
  is_default  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Categories ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name        TEXT UNIQUE NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url   TEXT,
  is_active   INTEGER NOT NULL DEFAULT 1,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Products ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  tagline       TEXT,
  description   TEXT NOT NULL,
  story         TEXT,
  category_id   TEXT REFERENCES categories(id),
  price         INTEGER NOT NULL,
  compare_price INTEGER,
  cost_price    INTEGER,
  sku           TEXT UNIQUE,
  stock         INTEGER NOT NULL DEFAULT 0,
  weight        INTEGER DEFAULT 200,
  volume_ml     INTEGER DEFAULT 50,
  concentration TEXT NOT NULL DEFAULT 'Extrait De Parfum',
  dna           TEXT,
  scent_notes   TEXT,
  color_accent  TEXT,
  is_featured   INTEGER NOT NULL DEFAULT 0,
  is_bestseller INTEGER NOT NULL DEFAULT 0,
  is_new        INTEGER NOT NULL DEFAULT 0,
  is_active     INTEGER NOT NULL DEFAULT 1,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  meta_title    TEXT,
  meta_desc     TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Product Images ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_images (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  product_id  TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  alt         TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_primary  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Coupons ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coupons (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  code            TEXT UNIQUE NOT NULL,
  type            TEXT NOT NULL CHECK(type IN ('percentage','fixed','free_shipping')),
  value           INTEGER NOT NULL,
  min_order       INTEGER DEFAULT 0,
  max_discount    INTEGER,
  usage_limit     INTEGER,
  usage_count     INTEGER NOT NULL DEFAULT 0,
  user_limit      INTEGER DEFAULT 1,
  is_active       INTEGER NOT NULL DEFAULT 1,
  starts_at       TEXT,
  expires_at      TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Orders ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  order_number    TEXT UNIQUE NOT NULL,
  user_id         TEXT REFERENCES users(id) ON DELETE SET NULL,
  guest_email     TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK(status IN ('pending','awaiting_payment','paid','processing','shipped','delivered','cancelled','refunded')),
  payment_method  TEXT,
  payment_status  TEXT NOT NULL DEFAULT 'unpaid' CHECK(payment_status IN ('unpaid','paid','failed','refunded')),
  payment_ref     TEXT,
  coupon_id       TEXT REFERENCES coupons(id),
  subtotal        INTEGER NOT NULL,
  discount        INTEGER NOT NULL DEFAULT 0,
  shipping_cost   INTEGER NOT NULL DEFAULT 0,
  tax             INTEGER NOT NULL DEFAULT 0,
  total           INTEGER NOT NULL,
  shipping_method TEXT,
  recipient       TEXT NOT NULL,
  phone           TEXT NOT NULL,
  address         TEXT NOT NULL,
  city            TEXT NOT NULL,
  province        TEXT NOT NULL,
  postal_code     TEXT NOT NULL,
  country         TEXT NOT NULL DEFAULT 'Indonesia',
  notes           TEXT,
  tracking_number TEXT,
  shipped_at      TEXT,
  delivered_at    TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Order Items ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  order_id    TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  TEXT NOT NULL REFERENCES products(id),
  name        TEXT NOT NULL,
  image_url   TEXT,
  price       INTEGER NOT NULL,
  quantity    INTEGER NOT NULL,
  subtotal    INTEGER NOT NULL
);

-- ── Reviews ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  product_id  TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id     TEXT REFERENCES users(id) ON DELETE SET NULL,
  order_id    TEXT REFERENCES orders(id),
  name        TEXT NOT NULL,
  rating      INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  title       TEXT,
  body        TEXT NOT NULL,
  is_verified INTEGER NOT NULL DEFAULT 0,
  is_approved INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Wishlists ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishlists (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id  TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, product_id)
);

-- ── Banners ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS banners (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  title       TEXT NOT NULL,
  subtitle    TEXT,
  image_url   TEXT NOT NULL,
  link        TEXT,
  cta_text    TEXT,
  position    TEXT NOT NULL DEFAULT 'hero' CHECK(position IN ('hero','promotional','sidebar')),
  is_active   INTEGER NOT NULL DEFAULT 1,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  starts_at   TEXT,
  ends_at     TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Newsletter Subscribers ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email       TEXT UNIQUE NOT NULL,
  name        TEXT,
  is_active   INTEGER NOT NULL DEFAULT 1,
  source      TEXT DEFAULT 'website',
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Settings ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'string',
  description TEXT,
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Indexes ───────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_slug       ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active     ON products(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_products_category   ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_user         ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_number       ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status       ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order   ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product     ON reviews(product_id, is_approved);
CREATE INDEX IF NOT EXISTS idx_wishlists_user      ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_user       ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user       ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user      ON addresses(user_id);

-- ── Seed Data ─────────────────────────────────────────────────────

INSERT OR IGNORE INTO categories (id, name, slug, description, is_active, sort_order)
VALUES
  ('cat-edp', 'Extrait De Parfum', 'extrait-de-parfum', 'Highest concentration luxury fragrances', 1, 1),
  ('cat-set', 'Gift Sets', 'gift-sets', 'Curated fragrance collections', 1, 2);

INSERT OR IGNORE INTO products (
  id, name, slug, tagline, description, story, category_id,
  price, compare_price, sku, stock, volume_ml, concentration,
  dna, scent_notes, color_accent, is_featured, is_bestseller, is_new, is_active, sort_order,
  meta_title, meta_desc
) VALUES
(
  'prod-eternity',
  'Eternity',
  'eternity',
  'Freshness That Lingers.',
  'Kesegaran buah seperti pineapple dan apple membuka aroma dengan kesan cerah dan hidup, lalu perlahan berubah menjadi manis hangat dari caramel. Wangi ini tidak hanya segar di awal, tapi meninggalkan jejak yang tahan lama dan berkesan.',
  'Eternity was born from the belief that a truly great fragrance should feel alive from the first spray — bold, vibrant, and unforgettable. Inspired by sun-drenched tropical mornings and the warmth that follows.',
  'cat-edp',
  299000, 350000, 'CRS-ETR-50', 50, 50, 'Extrait De Parfum',
  '["Fresh","Sweet","Addictive"]',
  '[{"name":"Pineapple","icon":"🍍","type":"top"},{"name":"Green Apple","icon":"🍎","type":"top"},{"name":"Lemon","icon":"🍋","type":"top"},{"name":"Caramel","icon":"🟤","type":"heart"},{"name":"Bergamot","icon":"🌿","type":"base"}]',
  '#8B9E6A', 1, 0, 0, 1, 1,
  'CRUISER ETERNITY — Fresh Luxury Extrait De Parfum 50ml',
  'ETERNITY by CRUISER — A fresh, sweet, addictive Extrait De Parfum. Notes of Pineapple, Green Apple, Lemon, Caramel & Bergamot. 50ml.'
),
(
  'prod-noctis',
  'Noctis',
  'noctis',
  'Embrace the Night.',
  'Aroma madu, vanilla, dan cinnamon menciptakan karakter hangat, dalam, dan sensual — seperti suasana malam yang tenang tapi penuh daya tarik. Wangi ini membungkus pemakainya dengan aura misterius dan intim.',
  'Noctis draws its soul from the quiet power of midnight — when the world stills and only warmth remains. A fragrance for those who move through the night with confidence and mystery.',
  'cat-edp',
  299000, 350000, 'CRS-NCT-50', 30, 50, 'Extrait De Parfum',
  '["Warm","Sensual","Deep"]',
  '[{"name":"Honey","icon":"🍯","type":"top"},{"name":"Vanilla","icon":"🌼","type":"heart"},{"name":"Cinnamon","icon":"🌿","type":"heart"},{"name":"Jasmine","icon":"🌸","type":"heart"},{"name":"Musk","icon":"✨","type":"base"}]',
  '#7A1A45', 1, 1, 0, 1, 2,
  'CRUISER NOCTIS — Warm Sensual Extrait De Parfum 50ml',
  'NOCTIS by CRUISER — Warm, sensual, deep Extrait De Parfum. Notes of Honey, Vanilla, Cinnamon, Jasmine & Musk. 50ml. Bestseller.'
),
(
  'prod-liberea',
  'Liberea',
  'liberea',
  'Softness in Every Note.',
  'Perpaduan lemon yang ringan dengan vanilla dan butter menciptakan aroma yang lembut, bersih, dan nyaman. Wangi ini terasa seperti kemewahan yang halus — tidak mencolok, tapi sangat berkelas dan menenangkan.',
  'Liberea was crafted for those who believe true luxury whispers, never shouts. A fragrance of quiet elegance — the sensation of cashmere and sunlight in a single breath.',
  'cat-edp',
  299000, 350000, 'CRS-LBR-50', 45, 50, 'Extrait De Parfum',
  '["Creamy","Fresh","Comforting"]',
  '[{"name":"Lemon","icon":"🍋","type":"top"},{"name":"Vanilla","icon":"🌼","type":"heart"},{"name":"Butter","icon":"🧈","type":"heart"},{"name":"Pink Pepper","icon":"🌸","type":"top"},{"name":"White Floral","icon":"⚪","type":"base"}]',
  '#1A5F8A', 1, 0, 0, 1, 3,
  'CRUISER LIBEREA — Creamy Fresh Extrait De Parfum 50ml',
  'LIBEREA by CRUISER — Creamy, fresh, comforting Extrait De Parfum. Notes of Lemon, Vanilla, Butter, Pink Pepper & White Floral. 50ml.'
);

INSERT OR IGNORE INTO settings (key, value, type, description) VALUES
  ('site_name', 'CRUISER', 'string', 'Brand name'),
  ('site_tagline', 'Luxury in Every Note.', 'string', 'Brand tagline'),
  ('currency', 'IDR', 'string', 'Default currency'),
  ('currency_symbol', 'Rp', 'string', 'Currency symbol'),
  ('free_shipping_threshold', '500000', 'number', 'Free shipping minimum order in IDR'),
  ('instagram_url', 'https://www.instagram.com/cruiser.official', 'string', 'Instagram URL'),
  ('shopee_url', 'https://id.shp.ee/1ftBwTk6', 'string', 'Shopee store URL'),
  ('whatsapp_number', '+6281234567890', 'string', 'WhatsApp contact number');
