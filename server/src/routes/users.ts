import { Router } from "express";
import { db, run, get } from "../db";


export const usersRouter = Router();

usersRouter.post("/", async (req, res, next) => {
  try {
    let { name, email } = req.body || {};
    name = typeof name === 'string' ? name.trim() : '';
    email = typeof email === 'string' ? email.trim() : '';
    if (!name || !email) return res.status(400).json({ error: "Name and email are required" });
    // basic email validation
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) return res.status(400).json({ error: "Invalid email format" });

    await run("BEGIN");
    let u;
    try {
      u = await run("INSERT INTO users (name, email) VALUES (?,?)", [name, email]);
    } catch (err: any) {
      await run("ROLLBACK").catch(() => {});
      if (String(err?.message || "").includes("UNIQUE constraint failed: users.email")) {
        return res.status(409).json({ error: "Email already exists" });
      }
      return next(err);
    }
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
