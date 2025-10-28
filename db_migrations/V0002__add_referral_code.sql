ALTER TABLE users ADD COLUMN referral_code VARCHAR(50) UNIQUE;
UPDATE users SET referral_code = 'REF' || LPAD(id::text, 6, '0') WHERE referral_code IS NULL;