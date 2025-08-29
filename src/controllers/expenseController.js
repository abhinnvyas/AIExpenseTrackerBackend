import prisma from "../prisma.js";
import OpenAI from "openai";
import { aiExpenseCategorizer } from "../utils/aiExpenseCategorizer.js";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const createExpense = async (req, res) => {
  try {
    if (!req.body) {
      return res
        .status(400)
        .json({ status: false, message: "Missing request body" });
    }
    const userId = req.userId;
    const { description } = req.body;

    if (!userId || !description) {
      return res
        .status(400)
        .json({ status: false, message: "Missing required fields" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const response = await aiExpenseCategorizer(description);
    if (!response.status) {
      return res.status(500).json({ status: false, message: response.message });
    }

    const { amount, category } = response.data;

    if (user.monthlyBudget < amount) {
      return res.status(400).json({
        status: false,
        message: "Expense amount exceeds monthly budget",
      });
    }

    const expense = await prisma.expense.create({
      data: {
        amount,
        description,
        raw_category: category,
        category,
        user: {
          connect: { id: userId },
        },
      },
    });

    res.status(201).json({
      status: true,
      message: "Expense created successfully",
      data: expense,
    });
  } catch (error) {
    console.error(
      "Error at controllers/expenseController.js -> createExpense:",
      error
    );
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const getExpenses = async (req, res) => {
  try {
    // const { userId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res
        .status(400)
        .json({ status: false, message: "User Id is required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const expenses = await prisma.expense.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (expenses.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "No expenses found for this user" });
    }

    res.status(200).json({
      status: true,
      message: "Expenses fetched successfully",
      data: expenses,
    });
  } catch (error) {
    console.error(
      "Error at controllers/expenseController.js -> getExpenses:",
      error
    );
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const getExpenseById = async (req, res) => {
  try {
    if (!req.params || !req.params.expenseId) {
      return res
        .status(400)
        .json({ status: false, message: "Missing Request Parameters" });
    }
    const { expenseId } = req.params;

    if (!expenseId) {
      return res
        .status(400)
        .json({ status: false, message: "Expense Id is required" });
    }
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });
    if (!expense) {
      return res
        .status(404)
        .json({ status: false, message: "Expense not found" });
    }
    res.status(200).json({
      status: true,
      message: "Expense fetched successfully",
      data: expense,
    });
  } catch (error) {
    console.error(
      "Error at controllers/expenseController.js -> getExpenseById:",
      error
    );
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const updateExpense = async (req, res) => {
  try {
    if (!req.params || !req.params.expenseId) {
      return res
        .status(400)
        .json({ status: false, message: "Missing Request Parameters" });
    }
    const { expenseId } = req.params;

    if (!expenseId) {
      return res
        .status(400)
        .json({ status: false, message: "Expense Id is required" });
    }

    if (!req.body) {
      return res
        .status(400)
        .json({ status: false, message: "Missing request body" });
    }

    const { amount, category } = req.body;

    if (!amount && !category) {
      return res.status(400).json({
        status: false,
        message:
          "At least one field (amount, description, category) is required",
      });
    }

    if (amount && (typeof amount !== "number" || isNaN(amount))) {
      return res
        .status(400)
        .json({ status: false, message: "Amount must be a number" });
    }

    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) {
      return res
        .status(404)
        .json({ status: false, message: "Expense not found" });
    }

    const updatedExpense = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        amount: amount || expense.amount,
        category: category || expense.category,
        raw_category: category || expense.raw_category,
      },
    });

    res.status(200).json({
      status: true,
      message: "Expense updated successfully",
      data: updatedExpense,
    });
  } catch (error) {
    console.error(
      "Error at controllers/expenseController.js -> updateExpense:",
      error
    );
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    if (!req.params || !req.params.expenseId) {
      return res
        .status(400)
        .json({ status: false, message: "Missing Request Parameters" });
    }
    const { expenseId } = req.params;

    if (!expenseId) {
      return res
        .status(400)
        .json({ status: false, message: "Expense Id is required" });
    }

    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) {
      return res
        .status(404)
        .json({ status: false, message: "Expense not found" });
    }

    await prisma.expense.delete({
      where: { id: expenseId },
    });

    res.status(200).json({
      status: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error(
      "Error at controllers/expenseController.js -> deleteExpense:",
      error
    );
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const expenseCategorization = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        status: false,
        message: "Missing request body",
      });
    }

    const { description } = req.body;

    if (!description) {
      return res
        .status(400)
        .json({ status: false, message: "Description is required" });
    }

    const response = await aiExpenseCategorizer(description);

    if (!response.status) {
      return res.status(500).json({ status: false, message: response.message });
    }

    res.status(200).json({
      status: true,
      message: "Expense categorized successfully",
      data: response.data,
    });
  } catch (error) {
    console.error(
      "Error at controllers/expenseController.js -> expenseCategorization:",
      error
    );
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};
