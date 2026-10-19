import { useState } from "react";
import api from "../api";
import { FiSend, FiMessageSquare } from "react-icons/fi";

function AIAssistant() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userMsg = { sender: "user", text: question };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await api.post("/ai/ask", { question: userMsg.text });
      const aiMsg = { sender: "ai", text: res.data.answer };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = {
        sender: "ai",
        text: err.response?.data?.message || "Sorry, I couldn't process that right now. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col h-full">
      <div className="flex items-center mb-6">
        <FiMessageSquare className="text-2xl text-indigo-600 mr-3" />
        <h2 className="text-xl font-bold">AI Expense Assistant</h2>
      </div>
      
      <p className="text-slate-500 mb-4 text-sm">
        Ask natural-language questions about your expenses (e.g., "How much did I spend on food this month?")
      </p>

      {/* Chat Area */}
      <div className="flex-1 min-h-[16rem] overflow-y-auto bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100 flex flex-col gap-3">
        {messages.length === 0 ? (
          <div className="text-center text-slate-400 mt-auto mb-auto text-sm">
            No messages yet. Ask me a question!
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                msg.sender === "user"
                  ? "bg-indigo-600 text-white self-end rounded-br-none"
                  : "bg-white text-slate-700 border border-slate-200 self-start rounded-bl-none shadow-sm"
              }`}
            >
              {msg.text}
            </div>
          ))
        )}
        {loading && (
          <div className="bg-white text-slate-500 border border-slate-200 self-start rounded-2xl rounded-bl-none px-4 py-3 text-sm shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleAsk} className="flex gap-2 relative">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask something..."
          disabled={loading}
          className="flex-1 h-12 pl-4 pr-12 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="absolute right-2 top-2 w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
        >
          <FiSend className="text-sm" />
        </button>
      </form>
    </div>
  );
}

export default AIAssistant;
