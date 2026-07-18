import { useEffect, useState } from "react";
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiArrowUpRight,
} from "react-icons/fi";
import api from "../api";

function Expenses() {
  const email = localStorage.getItem("email");

  const [showModal, setShowModal] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [groupOptions, setGroupOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    title: "",
    groupId: "",
    category: "",
    paidByEmail: email,
    amount: "",
    date: "",
  });

  const fetchAllExpenses = async () => {
    setLoading(true);
    setErrors({});

    try {
      const groupsRes = await api.get(`/groups`);
      const groups = groupsRes.data.groups || [];

      setGroupOptions(groups);

      const expenseLists = await Promise.all(
        groups.map((group) =>
          api
            .get(`/expenses?groupId=${group._id}`)
            .then((res) =>
              (res.data.expenses || []).map((expense) => ({
                ...expense,
                groupName: group.name,
              }))
            )
            .catch(() => [])
        )
      );

      const allExpenses = expenseLists
        .flat()
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      setExpenses(allExpenses);
    } catch (error) {
      setErrors({
        message: error.response?.data?.message || "Failed to load expenses",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllExpenses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGroupChange = (e) => {
    const groupId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      groupId,
      paidByEmail: email,   
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    api
      .post(`/expenses`, {
        title: formData.title,
        amount: Number(formData.amount),
        category: formData.category,
        date: formData.date,
        groupId: formData.groupId,
        paidByEmail: email,   
      })
      .then(() => {
        setFormData({
          title: "",
          groupId: "",
          category: "",
          paidByEmail: email,
          amount: "",
          date: "",
        });
        setShowModal(false);
        fetchAllExpenses();
      })
      .catch((error) => {
        setErrors({
          message: error.response?.data?.message || "Failed to save expense",
        });
      });
  };

  const totalExpense = expenses.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  const averageExpense =
    expenses.length === 0 ? 0 : Math.round(totalExpense / expenses.length);

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Expenses</h1>
          <p className="text-slate-500 mt-2">
            View and manage all shared expenses.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all"
        >
          <FiPlus />
          Add Expense
        </button>
      </div>

      <div className="flex gap-5 mb-8">
        <div className="relative flex-1">
          <FiSearch
            className="absolute left-5 top-4 text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search Expenses..."
            className="w-full h-14 rounded-2xl border border-slate-200 bg-white pl-14 pr-5 outline-none focus:ring-4 focus:ring-indigo-100"
          />
        </div>

        <button className="flex items-center gap-2 bg-white border border-slate-200 px-6 rounded-2xl hover:bg-slate-100 transition-all">
          <FiFilter />
          Filter
        </button>
      </div>

      {errors.message && !showModal && (
        <p className="text-red-500 text-sm mb-4">{errors.message}</p>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr className="text-left">
              <th className="px-8 py-5">Expense</th>
              <th>Group</th>
              <th>Category</th>
              <th>Paid By</th>
              <th>Date</th>
              <th className="text-right pr-8">Amount</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="py-16 text-center text-slate-400">
                  Loading expenses...
                </td>
              </tr>
            ) : expenses.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-16 text-center text-slate-400">
                  No expenses added yet.
                </td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr
                  key={expense._id}
                  className="border-t border-slate-100 hover:bg-slate-50 transition-all"
                >
                  <td className="px-8 py-6 font-semibold">{expense.title}</td>
                  <td>{expense.groupName}</td>
                  <td>
                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
                      {expense.category}
                    </span>
                  </td>
                  <td>{expense.paidBy?.name}</td>
                  <td>
                    {new Date(expense.date).toLocaleDateString("en-IN")}
                  </td>
                  <td className="text-right pr-8 font-bold text-red-500">
                    ₹{expense.amount}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-3 gap-6 mt-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-6">
          <p className="text-slate-500">Total Expenses</p>
          <h2 className="text-3xl font-bold mt-3">₹{totalExpense}</h2>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6">
          <p className="text-slate-500">Total Records</p>
          <h2 className="text-3xl font-bold mt-3 text-indigo-600">
            {expenses.length}
          </h2>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6">
          <p className="text-slate-500">Average Expense</p>
          <div className="flex items-center gap-2 mt-3">
            <h2 className="text-3xl font-bold">₹{averageExpense}</h2>
            <FiArrowUpRight className="text-emerald-500" />
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-[650px] bg-white rounded-3xl p-8 shadow-2xl">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">
              Add Expense
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block mb-2 font-medium">Expense Name</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Dinner at BBQ Nation"
                  required
                  className="w-full h-12 border border-slate-300 rounded-xl px-4 outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block mb-2 font-medium">Group</label>
                  <select
                    name="groupId"
                    value={formData.groupId}
                    onChange={handleGroupChange}
                    required
                    className="w-full h-12 border border-slate-300 rounded-xl px-4 outline-none focus:ring-4 focus:ring-indigo-100"
                  >
                    <option value="">Select Group</option>
                    {groupOptions.map((group) => (
                      <option key={group._id} value={group._id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-medium">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
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
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block mb-2 font-medium">Paid By</label>
    <div className="w-full h-12 border border-slate-200 rounded-xl px-4 flex items-center bg-slate-50 text-slate-700">
      {localStorage.getItem("username")}
    </div>                  

                </div>

                <div>
                  <label className="block mb-2 font-medium">Amount</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="2500"
                    required
                    min="1"
                    className="w-full h-12 border border-slate-300 rounded-xl px-4 outline-none focus:ring-4 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full h-12 border border-slate-300 rounded-xl px-4 outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              {errors.message && (
                <p className="text-red-500 text-sm">{errors.message}</p>
              )}

              <div className="flex justify-end gap-4 pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({
                      title: "",
                      groupId: "",
                      category: "",
                      paidByEmail: "",
                      amount: "",
                      date: "",
                    });
                    setMembers([]);
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

export default Expenses;