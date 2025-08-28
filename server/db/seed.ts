import sqlite3 from "sqlite3";

const db = new sqlite3.Database("hsa.db");

function run(sql: string, params: any[] = []) {
  return new Promise<void>((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err); else resolve();
    });
  });
}

async function main() {
  // Clean tables (order matters due to FKs)
  await run("DELETE FROM transactions");
  await run("DELETE FROM cards");
  await run("DELETE FROM accounts");
  await run("DELETE FROM users");
  await run("DELETE FROM eligibility_catalog");

  // Seed one user + one account
  await run("INSERT INTO users (name, email) VALUES (?,?)", ["Morrell Nioble", "morrell@example.com"]);
  await run("INSERT INTO accounts (user_id, balance_cents, display_number) VALUES (?,?,?)", [1, 0, "HSA-0001"]);

  // Seed eligible categories
  await run("INSERT INTO eligibility_catalog (category_code, label) VALUES (?,?)", ["PHARMACY","Pharmacy"]);
  await run("INSERT INTO eligibility_catalog (category_code, label) VALUES (?,?)", ["DOCTOR","Doctor's Office"]);

  console.log("Seeded: userId=1 accountId=1 categories=[PHARMACY, DOCTOR]");
  db.close();
}

main().catch(err => {
  console.error(err);
  db.close();
});
