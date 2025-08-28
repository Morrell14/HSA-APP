import { Router } from "express";
import { get, all, run } from "../db";

export const accountsRouter = Router();

// GET /api/accounts/:accountId  -> balance + latest card + recent transactions
accountsRouter.get("/:accountId", async (req, res, next) => {
  try {
    const accountId = Number(req.params.accountId);
    if (!Number.isInteger(accountId)) {
      return res.status(400).json({ error: "invalid accountId" });
    }

    const account = await get<{ id: number; balance_cents: number; display_number: string }>(
      "SELECT id, balance_cents, display_number FROM accounts WHERE id = ?",
      [accountId]
    );
    if (!account) return res.status(404).json({ error: "account not found" });

    // latest card (if any)
    const latestCard = await get<{
      id: number;
      last4: string;
      expiry_month: number;
      expiry_year: number;
      status: string;
    }>(
      `SELECT id, last4, expiry_month, expiry_year, status
         FROM cards
        WHERE account_id = ?
        ORDER BY datetime(created_at) DESC
        LIMIT 1`,
      [accountId]
    );

    const transactions = await all(
      `SELECT id, type, amount_cents, status, eligible, decline_reason,
              merchant, category_code, item_code, note, created_at
         FROM transactions
        WHERE account_id = ?
        ORDER BY datetime(created_at) DESC
        LIMIT 25`,
      [accountId]
    );

    res.json({ account, card: latestCard ?? null, transactions });
  } catch (e) {
    next(e);
  }
});

// POST /api/accounts/:accountId/deposits  { amount_cents, note? }
accountsRouter.post("/:accountId/deposits", async (req, res, next) => {
    try {
      const accountId = Number(req.params.accountId);
      const { amount_cents, note } = req.body || {};
  
      if (!Number.isInteger(accountId)) {
        return res.status(400).json({ error: "invalid accountId" });
      }
      if (!Number.isInteger(amount_cents) || amount_cents <= 0) {
        return res.status(400).json({ error: "amount_cents must be a positive integer" });
      }
  
      // Ensure account exists
      const account = await get<{ id: number; balance_cents: number }>(
        "SELECT id, balance_cents FROM accounts WHERE id = ?",
        [accountId]
      );
      if (!account) return res.status(404).json({ error: "account not found" });
  
      // Atomic: insert ledger row and update balance
      await run("BEGIN");
      const tx = await run(
        `INSERT INTO transactions
           (account_id, card_id, type, amount_cents, eligible, status, decline_reason, merchant, category_code, item_code, note)
         VALUES (?, NULL, 'DEPOSIT', ?, NULL, 'SETTLED', NULL, NULL, NULL, NULL, ?)`,
        [accountId, amount_cents, note ?? null]
      );
      await run(
        "UPDATE accounts SET balance_cents = balance_cents + ? WHERE id = ?",
        [amount_cents, accountId]
      );
      await run("COMMIT");
  
      const updated = await get<{ balance_cents: number }>(
        "SELECT balance_cents FROM accounts WHERE id = ?",
        [accountId]
      );
  
      res.status(201).json({
        transaction: {
          id: tx.lastID,
          type: "DEPOSIT",
          status: "SETTLED",
          amount_cents,
          note: note ?? null
        },
        new_balance_cents: updated?.balance_cents ?? account.balance_cents + amount_cents
      });
    } catch (e) {
      await run("ROLLBACK").catch(() => {});
      next(e);
    }
  });
  
  // helper to generate a simple token & last4
function randToken(prefix = "card_", n = 12) {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let s = prefix;
    for (let i = 0; i < n; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
  }
  function randLast4() {
    return String(Math.floor(1000 + Math.random() * 9000));
  }
  
  // POST /api/accounts/:accountId/cards
  accountsRouter.post("/:accountId/cards", async (req, res, next) => {
    try {
      const accountId = Number(req.params.accountId);
      if (!Number.isInteger(accountId)) {
        return res.status(400).json({ error: "invalid accountId" });
      }
  
      // Ensure account exists
      const account = await get<{ id: number }>(
        "SELECT id FROM accounts WHERE id = ?",
        [accountId]
      );
      if (!account) return res.status(404).json({ error: "account not found" });
  
      // Generate card fields
      const now = new Date();
      const expiry_month = now.getMonth() + 1;              // 1..12
      const expiry_year = now.getFullYear() + 3;            // 3 years out
      const last4 = randLast4();
  
      // Try insert; if token collision (very unlikely), retry
      let cardId: number | null = null;
      for (let attempts = 0; attempts < 3; attempts++) {
        try {
          const card_token = randToken();
          const ins = await run(
            `INSERT INTO cards (account_id, card_token, last4, expiry_month, expiry_year, status)
             VALUES (?, ?, ?, ?, ?, 'ACTIVE')`,
            [accountId, card_token, last4, expiry_month, expiry_year]
          );
          cardId = ins.lastID;
          break;
        } catch (e: any) {
          // if UNIQUE constraint on card_token, loop and try a new token
          if (String(e?.message || "").includes("UNIQUE constraint failed: cards.card_token")) continue;
          throw e;
        }
      }
      if (!cardId) return res.status(500).json({ error: "failed to issue card" });
  
      const card = await get<{ id: number; last4: string; expiry_month: number; expiry_year: number; status: string }>(
        "SELECT id, last4, expiry_month, expiry_year, status FROM cards WHERE id = ?",
        [cardId]
      );
  
      res.status(201).json({ card });
    } catch (e) {
      next(e);
    }
  });
  
