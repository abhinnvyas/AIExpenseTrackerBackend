import prisma from "../prisma";

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ status: false, msg: "All fields are required" });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({ status: false, msg: "User not found" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    console.log(isPasswordMatch);

    if (!isPasswordMatch) {
      return res
        .status(400)
        .json({ status: false, msg: "Invalid Credentials" });
    }

    const token = getJwtToken(user.id);

    return res
      .status(200)
      .json({ status: true, msg: "User Login Successfull", token });
  } catch (error) {
    console.log("Error at authController/login: ", error.message);
    return res.status(400).json({ status: false, msg: error.message });
  }
};
