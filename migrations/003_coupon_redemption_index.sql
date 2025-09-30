-- Migration 003: Índices y constraints para redenciones de cupones
-- Idempotente

-- Índice único para evitar múltiples redenciones por misma orden+cupón (si el webhook se reenvía)
CREATE UNIQUE INDEX IF NOT EXISTS uq_coupon_redemption_code_order ON coupon_redemptions(code, order_id);

-- Índice auxiliar para consultas analíticas (uso por cupón ordenado por fecha)
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_code_redeemed_at ON coupon_redemptions(code, redeemed_at DESC);

-- Índice para filtrar cupones activos por enabled + expiración
CREATE INDEX IF NOT EXISTS idx_coupons_enabled_expires2 ON coupons(enabled, expires_at);

INSERT INTO schema_migrations(version) VALUES('003') ON CONFLICT DO NOTHING;
