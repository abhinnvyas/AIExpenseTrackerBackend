import express from "express";
import {
  createExpense,
  deleteExpense,
  getExpenses,
  expenseCategorization,
  updateExpense,
  getExpenseById,
} from "../controllers/expenseController.js";

const router = express.Router();

router.post("/", createExpense); // Create expense
router.get("/u/", getExpenses); // Get expenses for a user
router.get("/e/:expenseId", getExpenseById); // Get an expense by ID
router.delete("/:expenseId", deleteExpense); // Delete an expense by ID
router.post("/categorize", expenseCategorization); // Categorize an expense using AI
router.put("/:expenseId", updateExpense); // Update an expense by ID

export default router;
