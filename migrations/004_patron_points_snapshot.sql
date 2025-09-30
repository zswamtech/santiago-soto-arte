-- Migration 004: Añadir columna patron_points_snapshot a orders
-- Idempotente: verifica existencia antes de alterar.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='orders' AND column_name='patron_points_snapshot'
  ) THEN
    ALTER TABLE orders ADD COLUMN patron_points_snapshot INT;
  END IF;
END$$;

-- Registrar versión
INSERT INTO schema_migrations(version) VALUES('004') ON CONFLICT DO NOTHING;
