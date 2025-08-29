import express from "express";
import bodyParser from "body-parser";

import userRouter from "./routes/userRouter.js";
import expenseRouter from "./routes/expenseRouter.js";

const app = express();

app.use(bodyParser.json());

// Routes
app.use("/api/users", userRouter);
app.use("/api/expenses", expenseRouter);

app.get("/", (req, res) => {
  res.send("The Backend is running");
});

const PORT = 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
