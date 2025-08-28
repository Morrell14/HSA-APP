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

// POST /api/accounts/:accountId/deposits  -> <we'll fill in Step 2 below>
