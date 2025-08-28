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

  // Seed eligible categories (MCC-like 4-digit codes to match UI)
  // 5912: Drug Stores and Pharmacies
  await run("INSERT INTO eligibility_catalog (category_code, label) VALUES (?,?)", ["5912","Drug Stores & Pharmacies"]);
  // 8062: Doctors and Physicians
  await run("INSERT INTO eligibility_catalog (category_code, label) VALUES (?,?)", ["8062","Doctors/Physicians"]);

  console.log("Seeded: userId=1 accountId=1 MCCs=[5912:Pharmacy, 8062:Doctor]");
  db.close();
}

main().catch(err => {
  console.error(err);
  db.close();
});
