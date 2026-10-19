import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUsers } from "react-icons/fi";
import api from "../api";

import AIAssistant from "../components/AIAssistant";

function Dashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalBalance: 0,
    youOwe: 0,
    youAreOwed: 0,
    activeGroups: 0,
  });
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [monthlySpending, setMonthlySpending] = useState(0);

  const formatCurrency = (amount) =>
  `₹${Number(amount).toLocaleString("en-IN")}`;

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");

    try {
      
      const summaryRes = await api.get(`/settlements/summary`);
      const { youOwe, youAreOwed } = summaryRes.data;

      
      const groupsRes = await api.get(`/groups`);
      const groupsList = groupsRes.data.groups || [];

      
      const groupsWithBalance = await Promise.all(
        groupsList.map(async (group) => {
          try {
            const balRes = await api.get(
              `/groups/${group._id}/balance`
            );
            return {
              ...group,
              balance: balRes.data.balance,
              expenseCount: balRes.data.expenseCount,
            };
          } catch {
            return { ...group, balance: 0, expenseCount: 0 };
          }
        })
      );

      
      const expenseLists = await Promise.all(
        groupsList.map((group) =>
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

      const email = localStorage.getItem("email");
      const allExpenses = expenseLists
        .flat()
        .filter((expense) => expense.paidBy?.email === email)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const thisMonthExpenses = allExpenses.filter((exp) => {
        const d = new Date(exp.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });

      const thisMonthTotal = thisMonthExpenses.reduce(
        (sum, exp) => sum + Number(exp.amount),
        0
      );

      const breakdown = {};
      thisMonthExpenses.forEach((exp) => {
        breakdown[exp.category] = (breakdown[exp.category] || 0) + Number(exp.amount);
      });

      const formattedBreakdown = Object.entries(breakdown)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount);

      setStats({
        totalBalance: Math.round((youAreOwed - youOwe) * 100) / 100,
        youOwe,
        youAreOwed,
        activeGroups: groupsList.length,
      });

      setCategoryBreakdown(formattedBreakdown);
      setMonthlySpending(thisMonthTotal);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const summaryCards = [
    {
      title: "Total Balance",
      amount: formatCurrency(stats.totalBalance),
      color:
        stats.totalBalance > 0
          ? "text-emerald-600"
          : stats.totalBalance < 0
          ? "text-red-500"
          : "text-indigo-600",
    },
    {
      title: "You Owe",
      amount: formatCurrency(stats.youOwe),
      color: "text-red-500",
    },
    {
      title: "You Are Owed",
      amount: formatCurrency(stats.youAreOwed),
      color: "text-emerald-600",
    },
    {
      title: "Active Groups",
      amount: stats.activeGroups,
      color: "text-slate-700",
    },
  ];

  if (loading) {
    return <p className="text-slate-500">Loading dashboard...</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-2">
            Manage your shared expenses with ease.
          </p>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((item) => (
          <div
            key={item.title}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-all"
          >
            <p className="text-slate-500 text-sm">{item.title}</p>
            <h2 className={`text-3xl font-bold mt-3 ${item.color}`}>
              {item.amount}
            </h2>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <AIAssistant />

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Monthly Spending</h2>
            <p className="text-slate-400 text-sm font-medium">
              {new Date().toLocaleString("en-IN", { month: "long", year: "numeric" })}
            </p>
          </div>
          
          <div className="mb-8 border-b border-slate-100 pb-6">
            <p className="text-4xl font-bold text-indigo-600">
              {formatCurrency(monthlySpending)}
            </p>
            <p className="text-slate-500 text-sm mt-1">Total this month</p>
          </div>
          
          <div className="flex-1 flex flex-col gap-5 overflow-y-auto pr-2">
            {categoryBreakdown.length === 0 ? (
              <p className="text-slate-400 text-sm text-center mt-4">No expenses this month.</p>
            ) : (
              categoryBreakdown.map((item) => {
                const percentage = monthlySpending > 0 ? (item.amount / monthlySpending) * 100 : 0;
                return (
                  <div key={item.category} className="w-full group">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-slate-700">{item.category}</span>
                      <span className="font-bold text-slate-900">{formatCurrency(item.amount)}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-full rounded-full transition-all duration-500 ease-out group-hover:bg-indigo-600" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;