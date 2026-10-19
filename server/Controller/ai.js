const { GoogleGenAI } = require("@google/genai");
const Expense = require("../models/expenseSchema");
const auth_data = require("../models/authSchema");

const askAI = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ success: false, message: "Question is required." });
    }

    // 1. Identify the authenticated user using the existing JWT middleware
    const user = await auth_data.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // 2. Retrieve ONLY the authenticated user's expense data
    const expenses = await Expense.find({
      $or: [{ paidBy: user._id }, { "splits.user": user._id }],
    })
      .populate("groupId", "name")
      .populate("paidBy", "name")
      .sort({ date: -1 });

    if (!expenses || expenses.length === 0) {
      return res.status(200).json({
        success: true,
        answer: "I couldn't find any expenses on your account yet.",
      });
    }

    // 3. Prepare relevant data
    const formattedExpenses = expenses.map((exp) => {
      // Calculate how much the user actually spent (their share)
      let userShare = 0;
      const userSplit = (exp.splits || []).find(
        (s) => s.user && s.user.toString() === user._id.toString()
      );
      if (userSplit) {
        userShare = userSplit.share;
      } else if (exp.paidBy && exp.paidBy._id.toString() === user._id.toString()) {
        userShare = exp.amount;
      }

      return {
        title: exp.title,
        totalAmount: exp.amount,
        yourShare: userShare,
        category: exp.category,
        date: exp.date ? exp.date.toISOString().split("T")[0] : null,
        groupName: exp.groupId ? exp.groupId.name : "Individual",
        paidBy: exp.paidBy ? exp.paidBy.name : "Unknown",
      };
    });

    const aiPrompt = `
      You are a helpful AI Expense Assistant for the "EqualPay" app.
      Your job is to answer the user's question accurately based ONLY on the following JSON expense data belonging to them.
      
      Guidelines:
      - If the user asks a question unrelated to their expenses, spending, groups, or balances, respond exactly with: "I can help you with questions about your EqualPay expenses, spending, groups, and balances."
      - Do NOT mention that you are reading from JSON or backend data. Respond in a friendly, conversational, natural-language way directly to the user.
      - If the data doesn't contain the answer (e.g., they ask about "food" but have no food expenses), say "I couldn't find any [category] expenses."
      - The "yourShare" field represents the actual amount the user spent on that expense out of their pocket. "totalAmount" is the total cost of the expense. When they ask "how much did I spend", use "yourShare".

      User's Expense Data:
      ${JSON.stringify(formattedExpenses)}

      User's Question: "${question}"
    `;

    // 4. Call Google Gemini API
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: aiPrompt,
    });

    return res.status(200).json({
      success: true,
      answer: response.text,
    });
  } catch (error) {
    console.error("AI Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred while processing your question with AI.",
    });
  }
};

module.exports = { askAI };
