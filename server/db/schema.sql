-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- =========================
-- Users
-- =========================
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id               INTEGER PRIMARY KEY,
  name             TEXT NOT NULL,
  email            TEXT NOT NULL UNIQUE,
  created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =========================
-- Accounts (HSA)
-- =========================
DROP TABLE IF EXISTS accounts;
CREATE TABLE accounts (
  id               INTEGER PRIMARY KEY,
  user_id          INTEGER NOT NULL,
  balance_cents    INTEGER NOT NULL DEFAULT 0 CHECK (balance_cents >= 0),
  display_number   TEXT,
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);

-- =========================
-- Cards (virtual)
-- =========================
DROP TABLE IF EXISTS cards;
CREATE TABLE cards (
  id               INTEGER PRIMARY KEY,
  account_id       INTEGER NOT NULL,
  card_token       TEXT NOT NULL UNIQUE,
  last4            TEXT NOT NULL CHECK (length(last4) BETWEEN 1 AND 8),
  expiry_month     INTEGER NOT NULL CHECK (expiry_month BETWEEN 1 AND 12),
  expiry_year      INTEGER NOT NULL,
  status           TEXT NOT NULL CHECK (status IN ('ACTIVE','BLOCKED')),
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_cards_account_id ON cards(account_id);

-- =========================
-- Transactions (ledger)
-- =========================
DROP TABLE IF EXISTS transactions;
CREATE TABLE transactions (
  id               INTEGER PRIMARY KEY,
  account_id       INTEGER NOT NULL,
  card_id          INTEGER,                          -- NULL for deposits
  type             TEXT NOT NULL CHECK (type IN ('DEPOSIT','PURCHASE')),
  amount_cents     INTEGER NOT NULL CHECK (amount_cents > 0),
  eligible         INTEGER CHECK (eligible IN (0,1)), -- NULL for deposits
  status           TEXT NOT NULL CHECK (status IN ('APPROVED','DECLINED','SETTLED')),
  decline_reason   TEXT,                             -- 'INELIGIBLE_EXPENSE','INSUFFICIENT_FUNDS'
  merchant         TEXT,
  category_code    TEXT,                             -- 'PHARMACY','DOCTOR','RESTAURANT', etc.
  item_code        TEXT,                             -- 'IBUPROFEN','BANDAGE', etc.
  note             TEXT,
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (card_id)    REFERENCES cards(id)    ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_tx_account_id_created_at ON transactions(account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tx_card_id ON transactions(card_id);
CREATE INDEX IF NOT EXISTS idx_tx_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_tx_category_item ON transactions(category_code, item_code);

-- =========================
-- Eligibility Catalog (optional but nice)
-- =========================
DROP TABLE IF EXISTS eligibility_catalog;
CREATE TABLE eligibility_catalog (
  id               INTEGER PRIMARY KEY,
  category_code    TEXT,      -- e.g., 'PHARMACY','DOCTOR'
  item_code        TEXT,      -- e.g., 'IBUPROFEN'
  label            TEXT NOT NULL,
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (category_code IS NOT NULL OR item_code IS NOT NULL)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_eligibility_unique 
  ON eligibility_catalog(COALESCE(category_code, ''), COALESCE(item_code, ''));
