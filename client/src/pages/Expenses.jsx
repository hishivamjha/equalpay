import { useEffect, useState, useMemo } from "react";
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiArrowUpRight,
  FiEdit,
  FiTrash2,
} from "react-icons/fi";
import api from "../api";

function Expenses() {
  const email = localStorage.getItem("email");

  const [showModal, setShowModal] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [groupOptions, setGroupOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    groupId: "",
    dateRange: "all",
    customStartDate: "",
    customEndDate: "",
    minAmount: "",
    maxAmount: "",
  });

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
        .filter((expense) => expense.paidBy?.email === email)
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

    const payload = {
      title: formData.title,
      amount: Number(formData.amount),
      category: formData.category,
      date: formData.date,
      groupId: formData.groupId,
      paidByEmail: formData.paidByEmail,
    };

    const request = editingExpenseId 
      ? api.put(`/expenses/${editingExpenseId}`, payload)
      : api.post(`/expenses`, payload);

    request
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
        setEditingExpenseId(null);
        fetchAllExpenses();
      })
      .catch((error) => {
        setErrors({
          message: error.response?.data?.message || "Failed to save expense",
        });
      });
  };

  const handleEdit = (expense) => {
    setEditingExpenseId(expense._id);
    setFormData({
      title: expense.title,
      groupId: expense.groupId?._id || expense.groupId,
      category: expense.category,
      paidByEmail: expense.paidBy?.email || email,
      amount: expense.amount,
      date: new Date(expense.date).toISOString().split("T")[0],
    });
    setShowModal(true);
  };

  const handleDeleteClick = (expense) => {
    setExpenseToDelete(expense);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!expenseToDelete) return;
    try {
      await api.delete(`/expenses/${expenseToDelete._id}`);
      setShowDeleteModal(false);
      setExpenseToDelete(null);
      fetchAllExpenses();
    } catch (error) {
      setErrors({
        message: error.response?.data?.message || "Failed to delete expense",
      });
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      if (searchQuery && !expense.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filters.category && expense.category !== filters.category) return false;
      
      const expGroupId = expense.groupId?._id || expense.groupId;
      if (filters.groupId && expGroupId !== filters.groupId) return false;
      
      const amount = Number(expense.amount);
      if (filters.minAmount && amount < Number(filters.minAmount)) return false;
      if (filters.maxAmount && amount > Number(filters.maxAmount)) return false;
      
      if (filters.dateRange && filters.dateRange !== 'all') {
        const expenseDate = new Date(expense.date);
        const today = new Date();
        
        if (filters.dateRange === 'today') {
          if (expenseDate.toDateString() !== today.toDateString()) return false;
        } else if (filters.dateRange === 'week') {
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          startOfWeek.setHours(0,0,0,0);
          if (expenseDate < startOfWeek) return false;
        } else if (filters.dateRange === 'month') {
          if (expenseDate.getMonth() !== today.getMonth() || expenseDate.getFullYear() !== today.getFullYear()) return false;
        } else if (filters.dateRange === 'custom') {
          const eDate = new Date(expenseDate);
          eDate.setHours(0,0,0,0);
          if (filters.customStartDate && eDate < new Date(filters.customStartDate)) return false;
          if (filters.customEndDate && eDate > new Date(filters.customEndDate)) return false;
        }
      }
      return true;
    });
  }, [expenses, searchQuery, filters]);

  const totalExpense = filteredExpenses.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  const averageExpense =
    filteredExpenses.length === 0 ? 0 : Math.round(totalExpense / filteredExpenses.length);

  const clearFilters = () => {
    setFilters({
      category: "",
      groupId: "",
      dateRange: "all",
      customStartDate: "",
      customEndDate: "",
      minAmount: "",
      maxAmount: "",
    });
  };

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

      <div className="flex flex-col gap-4 mb-8">
        <div className="flex gap-5 relative">
          <div className="relative flex-1">
            <FiSearch
              className="absolute left-5 top-4 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search Expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 rounded-2xl border border-slate-200 bg-white pl-14 pr-5 outline-none focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 border px-6 rounded-2xl transition-all ${showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 hover:bg-slate-100'}`}
          >
            <FiFilter />
            Filter {Object.values(filters).some(v => v && v !== 'all') && <span className="w-2 h-2 rounded-full bg-indigo-600"></span>}
          </button>
        </div>

        {showFilters && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col gap-5">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-slate-800">Filter Expenses</h3>
              <button onClick={clearFilters} className="text-sm text-indigo-600 font-medium hover:underline">
                Clear Filters
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div>
                <label className="block text-sm text-slate-500 mb-1">Category</label>
                <select 
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="w-full h-10 border border-slate-200 rounded-lg px-3 outline-none focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">All Categories</option>
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
                <label className="block text-sm text-slate-500 mb-1">Group</label>
                <select 
                  value={filters.groupId}
                  onChange={(e) => setFilters({...filters, groupId: e.target.value})}
                  className="w-full h-10 border border-slate-200 rounded-lg px-3 outline-none focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">All Groups</option>
                  {groupOptions.map(g => (
                    <option key={g._id} value={g._id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-500 mb-1">Date</label>
                <select 
                  value={filters.dateRange}
                  onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                  className="w-full h-10 border border-slate-200 rounded-lg px-3 outline-none focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-500 mb-1">Amount Range</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    placeholder="Min" 
                    value={filters.minAmount}
                    onChange={(e) => setFilters({...filters, minAmount: e.target.value})}
                    className="w-1/2 h-10 border border-slate-200 rounded-lg px-3 outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                  <input 
                    type="number" 
                    placeholder="Max" 
                    value={filters.maxAmount}
                    onChange={(e) => setFilters({...filters, maxAmount: e.target.value})}
                    className="w-1/2 h-10 border border-slate-200 rounded-lg px-3 outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>
            </div>

            {filters.dateRange === 'custom' && (
              <div className="flex gap-4 mt-2 p-4 bg-slate-50 rounded-xl">
                <div>
                  <label className="block text-sm text-slate-500 mb-1">Start Date</label>
                  <input 
                    type="date" 
                    value={filters.customStartDate}
                    onChange={(e) => setFilters({...filters, customStartDate: e.target.value})}
                    className="h-10 border border-slate-200 rounded-lg px-3 outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-500 mb-1">End Date</label>
                  <input 
                    type="date" 
                    value={filters.customEndDate}
                    onChange={(e) => setFilters({...filters, customEndDate: e.target.value})}
                    className="h-10 border border-slate-200 rounded-lg px-3 outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {errors.message && !showModal && (
        <p className="text-red-500 text-sm mb-4">{errors.message}</p>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="max-h-[360px] overflow-y-auto">
          <table className="w-full relative">
            <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              <tr className="text-left">
              <th className="px-8 py-5">Expense</th>
              <th>Group</th>
              <th>Category</th>
              <th>Paid By</th>
              <th>Date</th>
              <th className="text-right pr-8">Amount</th>
              <th className="text-center pr-8">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="py-16 text-center text-slate-400">
                  Loading expenses...
                </td>
              </tr>
            ) : filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-16 text-center text-slate-400">
                  No expenses found.
                </td>
              </tr>
            ) : (
              filteredExpenses.map((expense) => (
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
                  <td className="text-center pr-8">
                    <button onClick={() => handleEdit(expense)} className="text-indigo-600 hover:text-indigo-800 mr-4" title="Edit">
                      <FiEdit size={18} />
                    </button>
                    <button onClick={() => handleDeleteClick(expense)} className="text-red-500 hover:text-red-700" title="Delete">
                      <FiTrash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mt-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-6">
          <p className="text-slate-500">Total Expenses</p>
          <h2 className="text-3xl font-bold mt-3">₹{totalExpense}</h2>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6">
          <p className="text-slate-500">Total Records</p>
          <h2 className="text-3xl font-bold mt-3 text-indigo-600">
            {filteredExpenses.length}
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
              {editingExpenseId ? "Edit Expense" : "Add Expense"}
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
                    setEditingExpenseId(null);
                    setFormData({
                      title: "",
                      groupId: "",
                      category: "",
                      paidByEmail: "",
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
                  {editingExpenseId ? "Update Expense" : "Save Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-[400px] bg-white rounded-3xl p-8 shadow-2xl text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Delete Expense</h2>
            <p className="text-slate-500 mb-8">Are you sure you want to delete this expense?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => { setShowDeleteModal(false); setExpenseToDelete(null); }}
                className="px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Expenses;