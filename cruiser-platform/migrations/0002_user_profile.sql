ALTER TABLE users ADD COLUMN phone TEXT;
ALTER TABLE users ADD COLUMN address TEXT;
ALTER TABLE users ADD COLUMN city TEXT;
ALTER TABLE users ADD COLUMN province TEXT;
ALTER TABLE users ADD COLUMN postal_code TEXT;
ALTER TABLE users ADD COLUMN profile_complete INTEGER NOT NULL DEFAULT 0;

-- Existing credential-registered users (and admin) are considered complete
-- so they are never blocked by the new profile gate.
UPDATE users SET profile_complete = 1 WHERE password_hash IS NOT NULL;
