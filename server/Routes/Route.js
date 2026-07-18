const express = require("express");
const { Login, Signup, getProfile, updateProfile } = require("../Controller/auth.js");
const {
  createGroup,
  getMyGroups,
  getGroupById,
  addMember,
  deleteGroup,
} = require("../Controller/group.js");

const {
  createExpense,
  getExpensesByGroup,
  getGroupBalance,
} = require("../Controller/expense.js");

const {
  getSettlementSummary,
  recordSettlement,
} = require("../Controller/settlement.js");

const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} = require("../Controller/notification.js");

const authMiddleware = require("../middleware/auth.js");

const router = express.Router();

router.post("/api/login", Login);
router.post("/api/signup", Signup);

router.post("/api/groups", authMiddleware, createGroup);
router.get("/api/groups", authMiddleware, getMyGroups);
router.get("/api/groups/:id", authMiddleware, getGroupById);
router.post("/api/groups/:id/members", authMiddleware, addMember);
router.delete("/api/groups/:id", authMiddleware, deleteGroup);
router.post("/api/expenses", authMiddleware, createExpense);
router.get("/api/expenses", authMiddleware, getExpensesByGroup);
router.get("/api/groups/:id/balance", authMiddleware, getGroupBalance);
router.get("/api/settlements/summary", authMiddleware, getSettlementSummary);
router.post("/api/settlements", authMiddleware, recordSettlement);
router.get("/api/notifications", authMiddleware, getMyNotifications);
router.patch("/api/notifications/:id/read", authMiddleware, markAsRead);
router.patch("/api/notifications/read-all", authMiddleware, markAllAsRead);
router.get("/api/profile", authMiddleware, getProfile);
router.put("/api/profile", authMiddleware, updateProfile);

module.exports = router;
