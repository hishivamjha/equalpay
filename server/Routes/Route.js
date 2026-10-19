const express = require("express");
const { Login, Signup, VerifyOTP, getProfile, updateProfile } = require("../Controller/auth.js");
const {
  createGroup,
  getMyGroups,
  getGroupById,
  addMember,
  deleteGroup,
  leaveGroup,
} = require("../Controller/group.js");

const {
  createExpense,
  getExpensesByGroup,
  getGroupBalance,
  updateExpense,
  deleteExpense,
} = require("../Controller/expense.js");

const {
  getSettlementSummary,
  recordSettlement,
} = require("../Controller/settlement.js");

const {
  getMyNotifications,
  deleteNotification,
  deleteAllNotifications,
} = require("../Controller/notification.js");

const { askAI } = require("../Controller/ai.js");

const authMiddleware = require("../middleware/auth.js");

const router = express.Router();

router.post("/api/login", Login);
router.post("/api/signup", Signup);
router.post("/api/verify-otp", VerifyOTP);
router.post("/api/groups", authMiddleware, createGroup);
router.get("/api/groups", authMiddleware, getMyGroups);
router.get("/api/groups/:id", authMiddleware, getGroupById);
router.post("/api/groups/:id/members", authMiddleware, addMember);
router.delete("/api/groups/:id", authMiddleware, deleteGroup);
router.post("/api/groups/:id/leave", authMiddleware, leaveGroup);
router.post("/api/expenses", authMiddleware, createExpense);
router.get("/api/expenses", authMiddleware, getExpensesByGroup);
router.put("/api/expenses/:id", authMiddleware, updateExpense);
router.delete("/api/expenses/:id", authMiddleware, deleteExpense);
router.get("/api/groups/:id/balance", authMiddleware, getGroupBalance);
router.get("/api/settlements/summary", authMiddleware, getSettlementSummary);
router.post("/api/settlements", authMiddleware, recordSettlement);
router.get("/api/notifications", authMiddleware, getMyNotifications);
router.delete("/api/notifications/all", authMiddleware, deleteAllNotifications);
router.delete("/api/notifications/:id", authMiddleware, deleteNotification);
router.get("/api/profile", authMiddleware, getProfile);
router.put("/api/profile", authMiddleware, updateProfile);
router.post("/api/ai/ask", authMiddleware, askAI);

module.exports = router;
