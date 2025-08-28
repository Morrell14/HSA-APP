import express from "express";
import cors from "cors";
import { usersRouter } from "./routes/users";
import { accountsRouter } from "./routes/accounts";
import { cardsRouter } from "./routes/cards";   

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/users", usersRouter);
app.use("/api/accounts", accountsRouter); 
app.use("/api/cards", cardsRouter); 

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
