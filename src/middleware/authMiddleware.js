import jwt from "jsonwebtoken";
import prisma from "../prisma.js";

export const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ status: false, msg: "Access Denied" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(400).json({ status: false, message: "Invalid Token" });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
    });

    if (!user) {
      return res.status(400).json({ status: false, message: "Access Denied" });
    }
    console.log("Decoded User ID:", decoded.userId);
    req.userId = decoded.userId;

    next();
  });
};
