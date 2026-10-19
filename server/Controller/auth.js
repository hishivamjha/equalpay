const auth_data = require("../models/authSchema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendEmail = require("./sendEmail");
const saltRounds = 12;


// --- Helper Functions ---
const generateTempOTPToken = (userId, hashedOtp) => {
  return jwt.sign(
    { userId, hashedOtp },
    process.env.JWT_SECRET,
    { expiresIn: "10m" } // Token expires in 10 minutes
  );
};

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// --- Updated Signup Controller ---
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
      if (existingUser.isVerified) {
        return res.status(400).json({ success: false, message: "User already exists" });
      } else {
        // User exists but is NOT verified. Delete the old unverified record 
        // so they can try signing up again.
        await auth_data.findByIdAndDelete(existingUser._id);
      }
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 1. Create the user with isVerified: false
    // IMPORTANT: Make sure 'isVerified' is added to your MongoDB schema!
    const newUser = await auth_data.create({
      name,
      email,
      password: hashedPassword,
      isVerified: false
    });

    // 2. Generate OTP and Hash it
    const plainOtp = generateOTP();
    const hashedOtp = await bcrypt.hash(plainOtp, 10);

    // 3. Send Email
    try {
      await sendEmail({
        email: newUser.email,
        subject: "Your OTP for Equalpay Verification",
        message: `Welcome to Equalpay! Your verification OTP is: ${plainOtp}. It will expire in 10 minutes.`
      });
    } catch (err) {
      console.error("Email error: ", err);
      // Optional: You can delete the unverified user if the email fails to send
      // await auth_data.findByIdAndDelete(newUser._id);
      return res.status(500).json({ success: false, message: "Failed to send verification email" });
    }

    // 4. Create a temporary token holding the hashed OTP and userId
    const otpToken = generateTempOTPToken(newUser._id, hashedOtp);

    // 5. Send this token to the frontend so they can send it back when they submit the OTP
    return res.status(201).json({
      success: true,
      message: "OTP sent to your email",
      otpToken
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- New Verify OTP Controller ---
const VerifyOTP = async (req, res) => {
  const { otpToken, otp } = req.body;

  try {
    if (!otpToken || !otp) {
      return res.status(400).json({ success: false, message: "OTP and Token are required" });
    }

    // 1. Verify the JWT token (this checks if it hasn't expired and wasn't tampered with)
    const decoded = jwt.verify(otpToken, process.env.JWT_SECRET);

    // 2. Compare the plain OTP from the user with the hashed OTP in the token
    const isOtpValid = await bcrypt.compare(otp.toString(), decoded.hashedOtp);

    if (!isOtpValid) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // 3. Mark the user as verified in the database
    const user = await auth_data.findByIdAndUpdate(
      decoded.userId,
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // You can also generate your standard login token here and send it back to log them in automatically

    return res.status(200).json({
      success: true,
      message: "Account verified successfully"
    });

  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ success: false, message: "OTP has expired. Please sign up again." });
    }
    return res.status(500).json({ success: false, message: "Verification failed", error: error.message });
  }
};


// const Signup = async (req, res) => {
//   const { name, email, password, confirmPassword } = req.body;
//   const passwordRegex =
//     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?]).{8,}$/;

//   try {
//     if (!password || !passwordRegex.test(password)) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Password is required and must be at least 8 characters and include uppercase, lowercase, number, and special character",
//       });
//     }
//     if (password !== confirmPassword) {
//       return res
//         .status(400)
//         .json({ success: false, message: "password does not match" });
//     }

//     const existingUser = await auth_data.findOne({ email });
//     if (existingUser) {
//       return res
//         .status(409)
//         .json({ success: false, message: "user already exist" });
//     }

//     const data = await auth_data({
//       name,
//       email,
//       password: await bcrypt.hash(password, saltRounds),
//     }).save();

//     const token = jwt.sign({ email: data.email }, process.env.JWT_SECRET, {
//       expiresIn: "1d",
//     });

//     return res
//       .status(201)
//       .json({ success: true, message: "sign up", token });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ success: false, message: "Something went wrong" });
//   }
// };



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
  VerifyOTP,
  getProfile,
  updateProfile,
};
