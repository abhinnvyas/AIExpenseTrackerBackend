import express from "express";
import {
  createUser,
  deleteUser,
  getAvailableBalance,
  getUserBudget,
  getUserById,
  getUsers,
  loginUser,
  updateMonthlyBudget,
} from "../controllers/userController.js";

const router = express.Router();

// router.get("/", getUsers); // Get all users
router.get("/", getUserById); // Get user by ID
router.get("/budget/", getUserBudget); // Get user budget details
router.get("/av/balance/", getAvailableBalance); // Get available balance for a user
router.put("/budget/", updateMonthlyBudget); // Update budget for a user
router.delete("/", deleteUser);

export default router;
