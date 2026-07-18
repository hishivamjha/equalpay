const Expense = require("../models/expenseSchema");
const Settlement = require("../models/settlementSchema");
const Group = require("../models/groupSchema");
const User = require("../models/authSchema");
const { notifyUser } = require("./notification.js");


const getMemberBalances = async (groupId) => {
    const group = await Group.findById(groupId).populate("members.user", "name email");
    if (!group) return null;

    const expenses = await Expense.find({ groupId });
    const settlements = await Settlement.find({ groupId });

    const balances = {};

    group.members.forEach((m) => {
        const userId = m.user._id.toString();
        balances[userId] = {
            userId,
            name: m.user.name,
            email: m.user.email,
            amount: 0,
        };
    });

    expenses.forEach((exp) => {
        const payerId = exp.paidBy.toString();

        exp.splits.forEach((split) => {
            const userId = split.user.toString();
            const share = split.share;

            if (payerId === userId) {
                balances[userId].amount += exp.amount - share;
            } else {
                balances[userId].amount -= share;
            }
        });
    });

    
    settlements.forEach((s) => {
        const fromId = s.fromUser.toString();
        const toId = s.toUser.toString();
        if (balances[fromId]) balances[fromId].amount += s.amount;
        if (balances[toId]) balances[toId].amount -= s.amount;
    });

    return Object.values(balances).map((b) => ({
        ...b,
        amount: Math.round(b.amount * 100) / 100,
    }));
};


const simplifyDebts = (balances) => {
    const creditors = balances
        .filter((b) => b.amount > 0.01)
        .map((b) => ({ ...b }));

    const debtors = balances
        .filter((b) => b.amount < -0.01)
        .map((b) => ({ ...b, amount: -b.amount }));

    const transactions = [];
    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
        const pay = Math.round(Math.min(debtors[i].amount, creditors[j].amount) * 100) / 100;

        transactions.push({
            from: { name: debtors[i].name, email: debtors[i].email },
            to: { name: creditors[j].name, email: creditors[j].email },
            amount: pay,
        });

        debtors[i].amount -= pay;
        creditors[j].amount -= pay;

        if (debtors[i].amount < 0.01) i++;
        if (creditors[j].amount < 0.01) j++;
    }

    return transactions;
};


const getSettlementSummary = async (req, res) => {
    try {
        const email = req.user.email;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const groups = await Group.find({ "members.user": user._id });

        let youOwe = 0;
        let youAreOwed = 0;
        const allDebts = [];
        const recentSettlements = [];

        for (const group of groups) {
            const balances = await getMemberBalances(group._id);
            if (!balances) continue;

            const debts = simplifyDebts(balances);

            debts.forEach((d) => {
                allDebts.push({ ...d, groupName: group.name, groupId: group._id });

                if (d.from.email === email) youOwe += d.amount;
                if (d.to.email === email) youAreOwed += d.amount;
            });

            const groupSettlements = await Settlement.find({ groupId: group._id })
                .populate("fromUser", "name email")
                .populate("toUser", "name email")
                .sort({ createdAt: -1 })
                .limit(5);

            groupSettlements.forEach((s) => {
                recentSettlements.push({
                    _id: s._id,
                    groupName: group.name,
                    from: s.fromUser.name,
                    to: s.toUser.name,
                    amount: s.amount,
                    date: s.createdAt,
                });
            });
        }

        recentSettlements.sort((a, b) => new Date(b.date) - new Date(a.date));

        return res.status(200).json({
            success: true,
            youOwe: Math.round(youOwe * 100) / 100,
            youAreOwed: Math.round(youAreOwed * 100) / 100,
            debts: allDebts,
            recentSettlements: recentSettlements.slice(0, 10),
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
};


const recordSettlement = async (req, res) => {
    try {
        const { groupId, toEmail, amount, note } = req.body;
        const fromEmail = req.user.email;

        if (!groupId || !toEmail || !amount) {
            return res.status(400).json({ success: false, message: "All fields required" });
        }

        const fromUser = await User.findOne({ email: fromEmail });
        const toUser = await User.findOne({ email: toEmail });

        if (!fromUser || !toUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const settlement = await Settlement.create({
            groupId,
            fromUser: fromUser._id,
            toUser: toUser._id,
            amount: Number(amount),
            note: note || "",
        });
        const group = await Group.findById(groupId);
        await notifyUser({
            userId: toUser._id,
            type: "settlement",
            title: "Payment received",
            message: `${fromUser.name} paid you ₹${amount} in ${group?.name || "a group"}.`,
            groupId,
        });

        const populated = await Settlement.findById(settlement._id)
            .populate("fromUser", "name email")
            .populate("toUser", "name email");

        return res.status(201).json({ success: true, settlement: populated });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
};

module.exports = { getSettlementSummary, recordSettlement };