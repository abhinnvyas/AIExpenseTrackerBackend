import express from "express";
import bodyParser from "body-parser";

import userRouter from "./routes/userRouter.js";
import expenseRouter from "./routes/expenseRouter.js";
import authRouter from "./routes/authRouter.js";
import { verifyToken } from "./middleware/authMiddleware.js";

const app = express();

app.use(bodyParser.json());

// Routes
app.use("/api/users", verifyToken, userRouter);
app.use("/api/expenses", verifyToken, expenseRouter);
app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  res.send("The Backend is running");
});

const PORT = 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
