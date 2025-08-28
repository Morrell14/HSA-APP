# HSA-APP

A local demo of the HSA lifecycle: create account → deposit → issue virtual card → purchase with eligibility validation.

## Run Locally (No third-party services)

Everything runs locally using open-source libraries only (Express, SQLite, React, Vite). Follow these steps and you should be up and running within a few minutes.

### Prerequisites
- Node.js ≥ 18

### 1) Start the Backend (API)
```bash
cd server
npm install
npm run migrate    # creates server/hsa.db from db/schema.sql
npm run seed       # seeds demo user and eligibility MCCs (5912, 8062)
npm run dev        # starts API at http://localhost:3001
# health check:
# curl http://localhost:3001/api/health -> {"ok":true}
```

### API Endpoints
GET  /api/health → { ok: true }
POST /api/users → create user + HSA account
GET  /api/accounts/:id → account, latest card, recent transactions
POST /api/accounts/:id/deposits → add funds
POST /api/accounts/:id/cards → issue virtual card
POST /api/cards/:cardId/purchases → validate and process purchase

### Purchase requirements
- Provide amount, merchant, and a 4-digit MCC category_code.
- Eligible MCCs seeded: 5912 (Pharmacy), 8062 (Doctor).
- Purchase is approved only if MCC is eligible AND balance is sufficient.

### 2) Start the Frontend (Web)
```bash
cd web/vite-project
npm install
npm run dev   # http://localhost:5173
```

If port 5173 is busy, Vite will pick another port (shown in the terminal).

### 3) Happy Path Walkthrough
1. Open the frontend URL (e.g., http://localhost:5173 or the printed port).
2. Click Get Started → Create your account (enter name + unique email).
3. On the dashboard:
   - Deposit Funds: enter e.g., 100.00 and click Deposit.
   - Issue Card: click Issue Card.
   - Make Purchase: enter amount (e.g., 10.00), merchant (e.g., Walgreens), and MCC (use 5912 or 8062) → Submit. Should be APPROVED if funds suffice.
   - Try an ineligible MCC (e.g., 5812) to see DECLINED.

### Troubleshooting
- If the API isn’t reachable, ensure the backend terminal shows “Server running on http://localhost:3001”. Re-run migrate/seed if needed:
  - `cd server && npm run migrate && npm run seed && npm run dev`
- If seed fails, make sure `server/hsa.db` is writable and that you ran `npm install`.
- If the frontend shows CORS/network errors, confirm the backend is running on port 3001.

### Project Structure

HSA-APP/
  server/   # Express + TypeScript + SQLite
  web/      # React + TypeScript (Vite)
