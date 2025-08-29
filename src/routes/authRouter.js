import express from "express";
import { createUser, loginUser } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", createUser); // Create user
router.post("/login", loginUser); // User login

export default router;
