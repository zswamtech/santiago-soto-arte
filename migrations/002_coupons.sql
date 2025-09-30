-- Migration 002: coupons & coupon_redemptions + order columns
-- Idempotente: usar IF NOT EXISTS y verificar columnas antes de añadir.

-- Tabla de cupones
CREATE TABLE IF NOT EXISTS coupons (
  code TEXT PRIMARY KEY,
  percent INT NOT NULL CHECK (percent > 0 AND percent <= 50),
  max_uses INT,
  uses INT NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índice para expirados / habilitados (consulta rápida de válidos)
CREATE INDEX IF NOT EXISTS idx_coupons_enabled_expires ON coupons(enabled, expires_at);

-- Tabla de redenciones (uso por orden / usuario futuro)
CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL REFERENCES coupons(code) ON DELETE CASCADE,
  order_id TEXT,
  user_id TEXT,
  redeemed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_code ON coupon_redemptions(code);

-- Añadir columnas a orders si no existen
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='orders' AND column_name='patron_percent_applied'
  ) THEN
    ALTER TABLE orders ADD COLUMN patron_percent_applied INT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='orders' AND column_name='coupon_percent_applied'
  ) THEN
    ALTER TABLE orders ADD COLUMN coupon_percent_applied INT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='orders' AND column_name='coupon_code'
  ) THEN
    ALTER TABLE orders ADD COLUMN coupon_code TEXT REFERENCES coupons(code);
  END IF;
END$$;

-- Seed opcional (solo inserta si no existen)
INSERT INTO coupons(code, percent) VALUES
 ('PATRON5',5),
 ('PATRON8',8),
 ('PATRON10',10),
 ('PATRON15',15)
ON CONFLICT (code) DO NOTHING;
