CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY,
  device_id UUID NOT NULL,
  request_id UUID NOT NULL,
  offer_id TEXT NOT NULL CHECK (offer_id IN ('yearly', 'monthly')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  created_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE (device_id, request_id)
);
CREATE INDEX IF NOT EXISTS purchases_device_expiry ON purchases (device_id, expires_at DESC);
