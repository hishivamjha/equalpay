import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUsers } from "react-icons/fi";
import api from "../api";

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
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [groups, setGroups] = useState([]);
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

      const allExpenses = expenseLists
        .flat()
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const thisMonthTotal = allExpenses
        .filter((exp) => {
          const d = new Date(exp.date);
          return (
            d.getMonth() === currentMonth && d.getFullYear() === currentYear
          );
        })
        .reduce((sum, exp) => sum + Number(exp.amount), 0);

      setStats({
        totalBalance: Math.round((youAreOwed - youOwe) * 100) / 100,
        youOwe,
        youAreOwed,
        activeGroups: groupsList.length,
      });

      setRecentExpenses(allExpenses.slice(0, 5));
      setGroups(groupsWithBalance.slice(0, 3));
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

      <div className="mt-8 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Recent Expenses</h2>
          <Link
            to="/panel/expenses"
            className="text-indigo-600 font-medium hover:underline"
          >
            View All
          </Link>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 text-left">
              <th className="pb-3">Expense</th>
              <th className="pb-3">Group</th>
              <th className="pb-3">Paid By</th>
              <th className="pb-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {recentExpenses.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-10 text-center text-slate-400">
                  No expenses yet.
                </td>
              </tr>
            ) : (
              recentExpenses.map((expense) => (
                <tr
                  key={expense._id}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="py-4 font-semibold">{expense.title}</td>
                  <td>{expense.groupName}</td>
                  <td>{expense.paidBy?.name}</td>
                  <td className="text-right font-bold text-red-500">
                    ₹{expense.amount}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Your Groups</h2>
            <Link
              to="/panel/groups"
              className="text-indigo-600 font-medium hover:underline"
            >
              View All
            </Link>
          </div>

          {groups.length === 0 ? (
            <p className="text-slate-400 text-center py-10">
              No groups yet. Create one from the Groups page.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {groups.map((group) => (
                <div
                  key={group._id}
                  onClick={() => navigate(`/panel/groups/${group._id}`)}
                  className="border border-slate-200 rounded-2xl p-5 hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <FiUsers className="text-4xl text-indigo-500" />
                    <span
                      className={`font-bold ${
                        group.balance > 0
                          ? "text-emerald-600"
                          : group.balance < 0
                          ? "text-red-500"
                          : "text-slate-600"
                      }`}
                    >
                      {group.balance > 0
                        ? `+₹${group.balance}`
                        : group.balance < 0
                        ? `-₹${Math.abs(group.balance)}`
                        : "₹0"}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mt-4">{group.name}</h3>
                  <p className="text-slate-500 text-sm">{group.type}</p>
                  <p className="text-slate-600 text-sm mt-2">
                    {group.members?.length || 0} Members ·{" "}
                    {group.expenseCount || 0} Expenses
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-6">Monthly Spending</h2>
          <div className="h-72 rounded-2xl bg-slate-100 flex flex-col items-center justify-center">
            <p className="text-4xl font-bold text-indigo-600">
              {formatCurrency(monthlySpending)}
            </p>
            <p className="text-slate-400 text-sm mt-2">
              {new Date().toLocaleString("en-IN", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;