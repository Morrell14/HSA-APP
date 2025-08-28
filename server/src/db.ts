import sqlite3 from "sqlite3";
sqlite3.verbose();

export const db = new sqlite3.Database("hsa.db");

db.serialize(() => {
  db.run("PRAGMA foreign_keys = ON;");
});

export function run(sql: string, params: any[] = []) {
  return new Promise<{ lastID: number; changes: number }>((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: (this as any).lastID, changes: (this as any).changes });
    });
  });
}

export function get<T = any>(sql: string, params: any[] = []) {
  return new Promise<T | undefined>((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row as T)));
  });
}

export function all<T = any>(sql: string, params: any[] = []) {
  return new Promise<T[]>((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows as T[])));
  });
}
