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

router.post("/", createUser); // Create user
router.post("/login", loginUser); // User login
router.get("/", getUsers); // Get all users
router.get("/:userId", getUserById); // Get user by ID
router.get("/budget/:userId", getUserBudget); // Get user budget details
router.get("/balance/:userId", getAvailableBalance); // Get available balance for a user
router.put("/budget/:userId", updateMonthlyBudget); // Update budget for a user
router.delete("/:userId", deleteUser);

export default router;
