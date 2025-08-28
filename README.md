# HSA-APP

A local demo of the HSA lifecycle: create account → deposit → issue virtual card → purchase with eligibility validation.

## Prerequisites
- Node.js ≥ 18

## Run the Backend (API)
```bash
cd server
npm install
npm run migrate    # creates server/hsa.db from db/schema.sql
npm run dev        # starts API at http://localhost:3001
# health check:
# curl http://localhost:3001/api/health -> {"ok":true}
npm run migrate
npm run seed

Database

SQLite file: server/hsa.db
Schema file: server/db/schema.sql
Seed: (coming next) npm run seed to load demo data
API (current & planned)
GET /api/health → { ok: true }
(Planned)
POST /api/users
GET /api/accounts/:id
POST /api/accounts/:id/deposits
POST /api/accounts/:id/cards
POST /api/cards/:cardId/purchases

Project Structure

HSA-APP/
  server/   # Express + TypeScript + SQLite
  web/      # React + TypeScript (to be wired)
