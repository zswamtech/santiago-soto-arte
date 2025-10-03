-- Migration 005: snapshot_signature + tabla de eventos CAP
-- Reversible de forma manual (DROP COLUMN / DROP TABLE) si hiciera falta.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS snapshot_signature TEXT;

-- Métrica granular: cada vez que se aplica CAP guardamos un evento.
CREATE TABLE IF NOT EXISTS discount_cap_events (
  id SERIAL PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS discount_cap_events_order_idx ON discount_cap_events(order_id);

-- Nota: si la tabla orders es muy usada, se podría considerar un trigger de auditoría en lugar de eventos explícitos.

-- Registrar versión en tabla de migraciones (idempotente)
INSERT INTO schema_migrations(version) VALUES('005') ON CONFLICT DO NOTHING;