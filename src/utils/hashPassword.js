import bcrypt from "bcrypt";

export const generateHash = async (password) => {
  const passwordHash = await bcrypt.hash(password, 10);

  return passwordHash;
};
