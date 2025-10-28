ALTER TABLE users ADD COLUMN referred_by INTEGER REFERENCES users(id);
CREATE INDEX idx_users_referred_by ON users(referred_by);