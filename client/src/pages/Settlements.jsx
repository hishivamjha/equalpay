import { useEffect, useState } from "react";
import api from "../api";
import {
  FiArrowUpRight,
  FiArrowDownRight,
  FiCheckCircle,
} from "react-icons/fi";

function Settlements() {
  const email = localStorage.getItem("email");

  const [summary, setSummary] = useState({
    youOwe: 0,
    youAreOwed: 0,
    debts: [],
    recentSettlements: [],
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    groupId: "",
    toEmail: "",
    amount: "",
    note: "",
  });

  const fetchSummary = () => {
    setLoading(true);
    setErrors({});

    api
      .get(`/settlements/summary`)
      .then((res) => setSummary(res.data))
      .catch((error) => {
        setErrors({
          message: error.response?.data?.message || "Failed to load settlements",
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSettleUp = (debt) => {
    setFormData({
      groupId: debt.groupId,
      toEmail: debt.to.email,
      amount: debt.amount,
      note: "",
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    api
      .post(`/settlements`, {
        groupId: formData.groupId,
        toEmail: formData.toEmail,
        amount: Number(formData.amount),
        note: formData.note,
      })
      .then(() => {
        setShowModal(false);
        setFormData({ groupId: "", toEmail: "", amount: "", note: "" });
        fetchSummary();
      })
      .catch((error) => {
        setErrors({
          message: error.response?.data?.message || "Failed to record settlement",
        });
      });
  };

  const myDebts = summary.debts.filter((d) => d.from.email === email);
  const owedToMe = summary.debts.filter((d) => d.to.email === email);

  if (loading) {
    return <p className="text-slate-500">Loading settlements...</p>;
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-slate-900">Settlements</h1>
        <p className="text-slate-500 mt-2">
          Track your balances and recent payments.
        </p>
      </div>

      {errors.message && !showModal && (
        <p className="text-red-500 text-sm mb-4">{errors.message}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center text-xl">
              <FiArrowDownRight />
            </div>
            <p className="text-slate-500 font-medium uppercase tracking-wide text-sm">
              You Owe
            </p>
          </div>
          <h2 className="text-4xl font-bold text-red-500">₹{summary.youOwe}</h2>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center text-xl">
              <FiArrowUpRight />
            </div>
            <p className="text-slate-500 font-medium uppercase tracking-wide text-sm">
              You Are Owed
            </p>
          </div>
          <h2 className="text-4xl font-bold text-emerald-600">₹{summary.youAreOwed}</h2>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center text-xl">
              <FiCheckCircle />
            </div>
            <p className="text-slate-500 font-medium uppercase tracking-wide text-sm">
              Recent Settlement
            </p>
          </div>
          {summary.recentSettlements.length === 0 ? (
            <p className="text-slate-400 text-sm">No settlements yet</p>
          ) : (
            <>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">
                {summary.recentSettlements[0].from} paid {summary.recentSettlements[0].to} ₹
                {summary.recentSettlements[0].amount}
              </h2>
              <p className="mt-2 text-slate-400 text-sm">
                {summary.recentSettlements[0].groupName} ·{" "}
                {new Date(summary.recentSettlements[0].date).toLocaleDateString("en-IN")}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">You Owe</h2>

          {myDebts.length === 0 ? (
            <p className="text-slate-400">You don't owe anyone 🎉</p>
          ) : (
            <div className="space-y-4">
              {myDebts.map((debt, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center border border-slate-200 rounded-xl px-5 py-4"
                >
                  <div>
                    <p className="font-semibold">
                      Pay {debt.to.name} ₹{debt.amount}
                    </p>
                    <p className="text-slate-500 text-sm">{debt.groupName}</p>
                  </div>
                  <button
                    onClick={() => handleSettleUp(debt)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm hover:bg-indigo-700"
                  >
                    Settle Up
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">You Are Owed</h2>

          {owedToMe.length === 0 ? (
            <p className="text-slate-400">No one owes you</p>
          ) : (
            <div className="space-y-4">
              {owedToMe.map((debt, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center border border-slate-200 rounded-xl px-5 py-4"
                >
                  <div>
                    <p className="font-semibold">
                      {debt.from.name} owes you ₹{debt.amount}
                    </p>
                    <p className="text-slate-500 text-sm">{debt.groupName}</p>
                  </div>
                  <span className="text-emerald-600 text-sm font-medium">Pending</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Record Payment</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block mb-2 font-medium">Amount (₹)</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full h-12 border border-slate-300 rounded-xl px-4 outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Note (optional)</label>
                <input
                  type="text"
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="Paid via UPI"
                  className="w-full h-12 border border-slate-300 rounded-xl px-4 outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              {errors.message && (
                <p className="text-red-500 text-sm">{errors.message}</p>
              )}

              <div className="flex justify-end gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setErrors({});
                  }}
                  className="px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settlements;