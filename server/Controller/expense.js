const Expense = require("../models/expenseSchema");
const Group = require("../models/groupSchema");
const User = require("../models/authSchema");
const Settlement = require("../models/settlementSchema");
const { notifyGroupMembers } = require("./notification.js");

const createExpense = async (req, res) => {
  try {
    const { title, amount, category, date, groupId } = req.body;
    const paidByEmail = req.body.paidByEmail || req.user.email;

    if (!title || !amount || !category || !date || !groupId) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    const group = await Group.findById(groupId).populate("members.user");
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    const payer = await User.findOne({ email: paidByEmail });
    if (!payer) {
      return res.status(404).json({ success: false, message: "Payer not found" });
    }

    const memberCount = group.members.length;
    const sharePerPerson = Math.round((amount / memberCount) * 100) / 100;

    const splits = group.members.map((m) => ({
      user: m.user._id ?? m.user,
      share: sharePerPerson,
    }));

    const expense = await Expense.create({
      title,
      amount,
      category,
      date,
      groupId,
      paidBy: payer._id,
      splits,
    });

    const populated = await Expense.findById(expense._id)
      .populate("paidBy", "name email")
      .populate("splits.user", "name email");
    await notifyGroupMembers({
      groupId: group._id,
      type: "expense",
      title: "New Expense",
      message: `${payer.name} has added a new expense: ${title} for ${amount}`,
    });

    return res.status(201).json({ success: true, expense: populated });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};


const getExpensesByGroup = async (req, res) => {
  try {
    const { groupId } = req.query;

    const expenses = await Expense.find({ groupId })
      .populate("paidBy", "name email")
      .populate("splits.user", "name email")
      .sort({ date: -1 });

    return res.status(200).json({ success: true, expenses });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

const getGroupBalance = async (req, res) => {
  try {
    const email = req.user.email;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const groupId = req.params.id;
    const expenses = await Expense.find({ groupId });
    const settlements = await Settlement.find({ groupId });

    let balance = 0;
    let expenseCount = expenses.length;

    
    expenses.forEach((exp) => {
      const userSplit = exp.splits.find(
        (s) => s.user.toString() === user._id.toString()
      );
      const share = userSplit ? userSplit.share : 0;

      if (exp.paidBy.toString() === user._id.toString()) {
        balance += exp.amount - share;
      } else {
        balance -= share;
      }
    });

    
    settlements.forEach((s) => {
      const fromId = s.fromUser.toString();
      const toId = s.toUser.toString();

      if (fromId === user._id.toString()) {
        balance += s.amount; 
      }
      if (toId === user._id.toString()) {
        balance -= s.amount; 
      }
    });

    return res.status(200).json({
      success: true,
      balance: Math.round(balance * 100) / 100,
      expenseCount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

module.exports = { createExpense, getExpensesByGroup, getGroupBalance };