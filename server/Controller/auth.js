const auth_data = require("../models/authSchema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const saltRounds = 12;

const Signup = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?]).{8,}$/;

  try {
    if (!password || !passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password is required and must be at least 8 characters and include uppercase, lowercase, number, and special character",
      });
    }
    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "password does not match" });
    }

    const existingUser = await auth_data.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "user already exist" });
    }

    const data = await auth_data({
      name,
      email,
      password: await bcrypt.hash(password, saltRounds),
    }).save();

    const token = jwt.sign({ email: data.email }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res
      .status(201)
      .json({ success: true, message: "sign up", token });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

const Login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const User = await auth_data.findOne({ email });
    if (!User) {
      return res
        .status(409)
        .json({ success: false, message: "User Does not Exist" });
    }

    const validPassword = await bcrypt.compare(password, User.password);
    if (!validPassword) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = jwt.sign({ email: User.email }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      username: User.name,
      token,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

const getProfile = async (req, res) => {
  try {
    const email = req.user.email;

    const user = await auth_data
      .findOne({ email })
      .select("-password -confirmPassword");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const email = req.user.email;
    const { name, currentPassword, newPassword, confirmPassword } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });
    }

    const user = await auth_data.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.name = name;

    if (newPassword || currentPassword) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message:
            "Current password, new password and confirm password are required",
        });
      }

      if (newPassword !== confirmPassword) {
        return res
          .status(400)
          .json({ success: false, message: "Passwords do not match" });
      }

      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?]).{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
          success: false,
          message:
            "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
        });
      }

      const validPassword = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!validPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      user.password = await bcrypt.hash(newPassword, saltRounds);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated",
      user: { name: user.name, email: user.email },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

module.exports = {
  Login,
  Signup,
  getProfile,
  updateProfile,
};
