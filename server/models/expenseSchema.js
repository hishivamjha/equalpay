const mongoose = require("mongoose");

const expenseSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: Date, required: true },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "auth_data",
      required: true,
    },
    splits: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "auth_data",
        },
        share: Number,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);