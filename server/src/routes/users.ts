import { Router } from "express";
import { db, run, get } from "../db";


export const usersRouter = Router();

usersRouter.post("/", async (req, res, next) => {
  try {
    const { name, email } = req.body || {};
    if (!name || !email) return res.status(400).json({ error: "name and email are required" });

    await run("BEGIN");
    const u = await run("INSERT INTO users (name, email) VALUES (?,?)", [name, email]);
    const userId = u.lastID;

    const a = await run(
      "INSERT INTO accounts (user_id, balance_cents, display_number) VALUES (?,?,?)",
      [userId, 0, `HSA-${String(userId).padStart(4, "0")}`]
    );
    const accountId = a.lastID;

    await run("COMMIT");

    const account = await get<{ id: number; balance_cents: number; display_number: string }>(
      "SELECT id, balance_cents, display_number FROM accounts WHERE id = ?",
      [accountId]
    );

    res.status(201).json({
      user: { id: userId, name, email },
      account
    });
  } catch (e) {
    await run("ROLLBACK").catch(() => {});
    next(e);
  }
});
