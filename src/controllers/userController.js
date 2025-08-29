import prisma from "../prisma.js";

// Create user
export const createUser = async (req, res) => {
  try {
    if (!req.body) {
      return res
        .status(400)
        .json({ status: false, message: "Missing request body" });
    }
    const { name, monthlyBudget } = req.body;
    if (!name || !monthlyBudget) {
      return res
        .status(400)
        .json({ status: false, message: "Missing required fields" });
    }
    if (typeof monthlyBudget !== "number" || isNaN(monthlyBudget)) {
      return res
        .status(400)
        .json({ status: false, message: "Monthly budget must be a number" });
    }

    const existingUser = await prisma.user.findFirst({
      where: { name },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ status: false, message: "User with this name already exists" });
    }

    const user = await prisma.user.create({
      data: { name, monthlyBudget },
    });

    res.status(201).json({
      status: true,
      message: "User created successfully",
      data: user,
    });
  } catch (err) {
    console.error("Error at controllers/userController.js -> createUser:", err);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    if (users.length === 0) {
      return res.status(404).json({ status: false, message: "No users found" });
    }
    res.status(200).json({
      status: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (err) {
    console.error("Error at controllers/userController.js -> getUsers:", err);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    if (!req.params || !req.params.userId) {
      return res
        .status(400)
        .json({ status: false, message: "Missing Request Parameters" });
    }
    const { userId } = req.params;
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
    res.status(200).json({
      status: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (err) {
    console.error(
      "Error at controllers/userController.js -> getUserById:",
      err
    );
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const getUserBudget = async (req, res) => {
  try {
    if (!req.params || !req.params.userId) {
      return res
        .status(400)
        .json({ status: false, message: "Missing Request Parameters" });
    }
    const { userId } = req.params;
    if (!userId) {
      return res
        .status(400)
        .json({ status: false, message: "User Id is required" });
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { monthlyBudget: true },
    });
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }
    res.status(200).json({
      status: true,
      message: "User budget fetched successfully",
      data: { monthlyBudget: user.monthlyBudget },
    });
  } catch (err) {
    console.error(
      "Error at controllers/userController.js -> getUserBudget:",
      err
    );
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const getAvailableBalance = async (req, res) => {
  try {
    if (!req.params || !req.params.userId) {
      return res
        .status(400)
        .json({ status: false, message: "Missing Request Parameters" });
    }
    const { userId } = req.params;

    if (!userId) {
      return res
        .status(400)
        .json({ status: false, message: "User Id is required" });
    }

    // Get user with their budget
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        monthlyBudget: true,
        expenses: {
          select: { amount: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // Calculate total spent
    const totalExpenses = user.expenses.reduce((sum, e) => sum + e.amount, 0);

    // Available balance
    const availableBalance = user.monthlyBudget - totalExpenses;

    res.status(200).json({
      status: true,
      message: "Available balance fetched successfully",
      data: {
        availableBalance,
        totalExpenses,
        budget: user.monthlyBudget,
      },
    });
  } catch (error) {
    console.error(
      "Error at controllers/userController.js -> getAvailableBalance:",
      error
    );
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (!req.params || !req.params.userId) {
      return res
        .status(400)
        .json({ status: false, message: "Missing Request Parameters" });
    }
    const { userId } = req.params;

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

    // Delete user expenses first due to foreign key constraint
    await prisma.expense.deleteMany({
      where: { userId },
    });

    // Delete the user
    await prisma.user.delete({
      where: { id: userId },
    });

    res.status(200).json({
      status: true,
      message: "User and associated expenses deleted successfully",
    });
  } catch (error) {
    console.error(
      "Error at controllers/userController.js -> deleteUser:",
      error
    );
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const updateMonthlyBudget = async (req, res) => {
  try {
    if (!req.params || !req.params.userId) {
      return res
        .status(400)
        .json({ status: false, message: "Missing Request Parameters" });
    }
    const { userId } = req.params;

    if (!userId) {
      return res
        .status(400)
        .json({ status: false, message: "User Id is required" });
    }

    if (!req.body || req.body.monthlyBudget === undefined) {
      return res
        .status(400)
        .json({ status: false, message: "Missing request body" });
    }

    const { monthlyBudget } = req.body;

    if (typeof monthlyBudget !== "number" || isNaN(monthlyBudget)) {
      return res
        .status(400)
        .json({ status: false, message: "Monthly budget must be a number" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { monthlyBudget },
    });

    res.status(200).json({
      status: true,
      message: "Monthly budget updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error(
      "Error at controllers/userController.js -> updateMonthlyBudget:",
      error
    );
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};
