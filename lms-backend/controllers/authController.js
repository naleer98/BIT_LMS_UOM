const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in .env file");
  }

  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

const formatUserResponse = (user) => {
  return {
    _id: user._id,
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

const registerUser = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;
    const role = req.body.role;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const allowedRoles = ["student", "teacher", "admin"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role selected",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token: generateToken(user),
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error("Register error:", error.message);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0]?.message;

      return res.status(400).json({
        success: false,
        message: firstError || "Invalid registration data",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;
    const role = req.body.role;

    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Please fill email, password, and role",
      });
    }

    const allowedRoles = ["student", "teacher", "admin"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role selected",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `This account is registered as ${user.role}, not ${role}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: generateToken(user),
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};