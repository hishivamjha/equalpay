import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import { FiArrowLeft, FiPlus, FiUsers } from "react-icons/fi";

function GroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const email = localStorage.getItem("email");

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balance, setBalance] = useState(0);
  const [memberEmail, setMemberEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [errors, setErrors] = useState({});

  const [expenseForm, setExpenseForm] = useState({
    title: "",
    category: "",
    paidByEmail: email,
    amount: "",
    date: "",
  });

  const fetchGroupData = async () => {
    setLoading(true);
    setErrors({});

    try {
      const [groupRes, expenseRes, balanceRes] = await Promise.all([
        api.get(`/groups/${groupId}`),
        api.get(`/expenses?groupId=${groupId}`),
        api.get(`/groups/${groupId}/balance`),
      ]);

      setGroup(groupRes.data.group);
      setExpenses(expenseRes.data.expenses || []);
      setBalance(balanceRes.data.balance);
    } catch (error) {
      setErrors({
        message: error.response?.data?.message || "Failed to load group",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  const handleAddMember = (e) => {
    e.preventDefault();
    setErrors({});

    api
      .post(`/groups/${groupId}/members`, { email: memberEmail })
      .then((res) => {
        setGroup(res.data.group);
        setMemberEmail("");
      })
      .catch((error) => {
        setErrors({
          message: error.response?.data?.message || "Failed to add member",
        });
      });
  };

  const handleExpenseChange = (e) => {
    const { name, value } = e.target;
    setExpenseForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    setErrors({});

    api
      .post(`/expenses`, {
        title: expenseForm.title,
        amount: Number(expenseForm.amount),
        category: expenseForm.category,
        date: expenseForm.date,
        groupId: groupId,
        paidByEmail:email,
      })
      .then(() => {
        setExpenseForm({
          title: "",
          category: "",
          paidByEmail:email,
          amount: "",
          date: "",
        });
        setShowExpenseModal(false);
        fetchGroupData();
      })
      .catch((error) => {
        setErrors({
          message: error.response?.data?.message || "Failed to add expense",
        });
      });
  };

  const handleDeleteGroup = () => {
    api
      .delete(`/groups/${groupId}`)
      .then(() => navigate("/panel/groups"))
      .catch((error) => {
        setErrors({
          message: error.response?.data?.message || "Failed to delete group",
        });
      });
  };

  if (loading) return <p className="text-slate-500">Loading group...</p>;
  if (!group) return <p className="text-red-500">{errors.message || "Group not found"}</p>;

  return (
    <div>
      <button
        onClick={() => navigate("/panel/groups")}
        className="flex items-center gap-2 text-slate-600 mb-6 hover:text-indigo-600"
      >
        <FiArrowLeft />
        Back to Groups
      </button>

      <div className="bg-white border border-slate-200 rounded-3xl p-8 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">{group.name}</h1>
            <p className="text-slate-500 mt-2">{group.type}</p>
            <p
              className={`text-2xl font-bold mt-4 ${
                balance > 0
                  ? "text-emerald-600"
                  : balance < 0
                  ? "text-red-500"
                  : "text-slate-600"
              }`}
            >
              {balance > 0
                ? `You are owed ₹${balance}`
                : balance < 0
                ? `You owe ₹${Math.abs(balance)}`
                : "All settled up"}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowExpenseModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
            >
              <FiPlus />
              Add Expense
            </button>

            <button
              onClick={handleDeleteGroup}
              className="px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100"
            >
              Delete Group
            </button>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <FiUsers />
            Members
          </h2>

          <div className="space-y-3">
            {group.members.map((member) => (
              <div
                key={member.user._id}
                className="flex justify-between items-center border border-slate-200 rounded-xl px-4 py-3"
              >
                <div>
                  <p className="font-semibold">{member.user.name}</p>
                  <p className="text-slate-500 text-sm">{member.user.email}</p>
                </div>
                <span className="text-sm text-indigo-600 capitalize">
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleAddMember} className="mt-8 flex gap-3">
          <input
            type="email"
            placeholder="Add member by email"
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
            required
            className="flex-1 h-12 border border-slate-300 rounded-xl px-4 outline-none focus:ring-4 focus:ring-indigo-100"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Add Member
          </button>
        </form>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-8">
        <h2 className="text-2xl font-bold mb-6">Expenses</h2>

        {expenses.length === 0 ? (
          <p className="text-slate-500 text-center py-10">
            No expenses in this group yet.
          </p>
        ) : (
          <div className="space-y-4">
            {expenses.map((expense) => (
              <div
                key={expense._id}
                className="flex justify-between items-center border border-slate-200 rounded-xl px-5 py-4"
              >
                <div>
                  <p className="font-semibold text-lg">{expense.title}</p>
                  <p className="text-slate-500 text-sm">
                    Paid by {expense.paidBy?.name} · {expense.category} ·{" "}
                    {new Date(expense.date).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <p className="text-xl font-bold text-red-500">₹{expense.amount}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {errors.message && (
        <p className="text-red-500 text-sm mt-4">{errors.message}</p>
      )}

      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-[650px] bg-white rounded-3xl p-8 shadow-2xl">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Add Expense</h2>

            <form onSubmit={handleAddExpense} className="space-y-5">
              <div>
                <label className="block mb-2 font-medium">Expense Name</label>
                <input
                  type="text"
                  name="title"
                  value={expenseForm.title}
                  onChange={handleExpenseChange}
                  required
                  className="w-full h-12 border border-slate-300 rounded-xl px-4 outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block mb-2 font-medium">Category</label>
                  <select
                    name="category"
                    value={expenseForm.category}
                    onChange={handleExpenseChange}
                    required
                    className="w-full h-12 border border-slate-300 rounded-xl px-4 outline-none focus:ring-4 focus:ring-indigo-100"
                  >
                    <option value="">Select Category</option>
                    <option value="Food">Food</option>
                    <option value="Travel">Travel</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Bills">Bills</option>
                    <option value="Stay">Stay</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-medium">Paid By</label>
            <div className="w-full h-12 border border-slate-200 rounded-xl px-4 flex items-center bg-slate-50 text-slate-700">
          {localStorage.getItem("username")}
           </div>                  

                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block mb-2 font-medium">Amount</label>
                  <input
                    type="number"
                    name="amount"
                    value={expenseForm.amount}
                    onChange={handleExpenseChange}
                    required
                    min="1"
                    className="w-full h-12 border border-slate-300 rounded-xl px-4 outline-none focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={expenseForm.date}
                    onChange={handleExpenseChange}
                    required
                    className="w-full h-12 border border-slate-300 rounded-xl px-4 outline-none focus:ring-4 focus:ring-indigo-100"
                  />
                </div>
              </div>

              {errors.message && (
                <p className="text-red-500 text-sm">{errors.message}</p>
              )}

              <div className="flex justify-end gap-4 pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setShowExpenseModal(false);
                    setExpenseForm({
                      title: "",
                      category: "",
                      paidByEmail: email,
                      amount: "",
                      date: "",
                    });
                    setErrors({});
                  }}
                  className="px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupDetail;