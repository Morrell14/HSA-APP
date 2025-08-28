import { Router } from "express";
import { get, all, run } from "../db";

export const accountsRouter = Router();

// GET /api/accounts/:accountId  -> balance + recent transactions
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

    const transactions = await all(
      `SELECT id, type, amount_cents, status, eligible, decline_reason,
              merchant, category_code, item_code, note, created_at
         FROM transactions
        WHERE account_id = ?
        ORDER BY datetime(created_at) DESC
        LIMIT 25`,
      [accountId]
    );

    res.json({ account, transactions });
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
  
