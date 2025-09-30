-- Migration 001: Estructura inicial de persistencia de órdenes
-- Ejecutar una sola vez. Idempotente mediante IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  provider_ref TEXT,
  status TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'cop',
  subtotal INT NOT NULL,
  discount_total INT NOT NULL,
  tax INT NOT NULL,
  shipping INT NOT NULL,
  total INT NOT NULL,
  shipping_tier TEXT,
  discount_cap_applied BOOLEAN DEFAULT false,
  discounts JSON,
  items JSON NOT NULL,
  pricing_snapshot JSON NOT NULL,
  customer_email TEXT,
  customer_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhook_events (
  event_id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  order_id TEXT REFERENCES orders(id),
  type TEXT,
  raw JSON,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_status_created_at ON orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_email_created_at ON orders(customer_email, created_at DESC);

-- Tabla de migraciones simple (si se desea expandir en el futuro)
CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO schema_migrations(version) VALUES ('001') ON CONFLICT DO NOTHING;
