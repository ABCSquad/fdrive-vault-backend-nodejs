import asyncHandler from "express-async-handler";

const login = asyncHandler(async (req, res) => {
  console.log(req.body);
  res.status(200).json({ message: "Login route hit", data: {} });
});

export { login };
