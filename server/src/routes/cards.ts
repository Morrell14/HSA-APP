import { Router } from "express";
import { get, run } from "../db";

export const cardsRouter = Router();

/**
 * POST /api/cards/:cardId/purchases
 * Body: { amount_cents: number, merchant?: string, category_code?: string, item_code?: string, note?: string }
 *
 * Flow:
 *  - Validate inputs
 *  - Load card + owning account (and balance); require ACTIVE status
 *  - Determine eligibility (category_code OR item_code must match catalog)
 *  - If eligible AND funds sufficient: APPROVED and decrement balance
 *  - Else: DECLINED with decline_reason ('INELIGIBLE_EXPENSE' | 'INSUFFICIENT_FUNDS')
 *  - Always write a transaction row; wrap in a DB transaction for atomicity
 */
cardsRouter.post("/:cardId/purchases", async (req, res, next) => {
  try {
    const cardId = Number(req.params.cardId);
    const { amount_cents, merchant, category_code, item_code, note } = req.body || {};

    if (!Number.isInteger(cardId)) {
      return res.status(400).json({ error: "invalid cardId" });
    }
    if (!Number.isInteger(amount_cents) || amount_cents <= 0) {
      return res.status(400).json({ error: "amount_cents must be a positive integer" });
    }
    if (!category_code && !item_code) {
      return res.status(400).json({ error: "Provide category_code or item_code for eligibility validation" });
    }

    // Load card + account + balance
    const card = await get<{ id: number; status: string; account_id: number }>(
      `SELECT c.id, c.status, c.account_id
         FROM cards c
        WHERE c.id = ?`,
      [cardId]
    );
    if (!card) return res.status(404).json({ error: "card not found" });
    if (card.status !== "ACTIVE") return res.status(400).json({ error: "card is not ACTIVE" });

    const acct = await get<{ balance_cents: number }>(
      "SELECT balance_cents FROM accounts WHERE id = ?",
      [card.account_id]
    );
    if (!acct) return res.status(404).json({ error: "account not found" });

    // Eligibility: match either category or item in the catalog
    let eligible = false;
    if (category_code) {
      const row = await get("SELECT 1 FROM eligibility_catalog WHERE category_code = ? LIMIT 1", [category_code]);
      if (row) eligible = true;
    }
    if (!eligible && item_code) {
      const row = await get("SELECT 1 FROM eligibility_catalog WHERE item_code = ? LIMIT 1", [item_code]);
      if (row) eligible = true;
    }

    // Decide approval
    let status: "APPROVED" | "DECLINED" = "DECLINED";
    let decline_reason: string | null = null;

    if (!eligible) {
      status = "DECLINED";
      decline_reason = "INELIGIBLE_EXPENSE";
    } else if (acct.balance_cents < amount_cents) {
      status = "DECLINED";
      decline_reason = "INSUFFICIENT_FUNDS";
    } else {
      status = "APPROVED";
    }

    // Atomic write (ledger + optional balance update)
    await run("BEGIN");
    const tx = await run(
      `INSERT INTO transactions
         (account_id, card_id, type, amount_cents, eligible, status, decline_reason,
          merchant, category_code, item_code, note)
       VALUES (?, ?, 'PURCHASE', ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        card.account_id,
        cardId,
        amount_cents,
        eligible ? 1 : 0,
        status,
        decline_reason,
        merchant ?? null,
        category_code ?? null,
        item_code ?? null,
        note ?? null
      ]
    );

    if (status === "APPROVED") {
      await run(
        "UPDATE accounts SET balance_cents = balance_cents - ? WHERE id = ?",
        [amount_cents, card.account_id]
      );
    }
    await run("COMMIT");

    const newBalance = await get<{ balance_cents: number }>(
      "SELECT balance_cents FROM accounts WHERE id = ?",
      [card.account_id]
    );

    res.status(201).json({
      transaction: {
        id: tx.lastID,
        type: "PURCHASE",
        status,
        eligible,
        decline_reason,
        amount_cents,
        merchant: merchant ?? null,
        category_code: category_code ?? null,
        item_code: item_code ?? null
      },
      new_balance_cents: newBalance?.balance_cents
    });
  } catch (e) {
    await run("ROLLBACK").catch(() => {});
    next(e);
  }
});
