import jwt from "jsonwebtoken";

export const getJwtToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1 day",
  });
};
