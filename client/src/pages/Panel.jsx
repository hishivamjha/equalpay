import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiCreditCard,
  FiRepeat,
  FiBell,
  FiUser,
  FiLogOut,
  FiSearch,
} from "react-icons/fi";

function Panel() {
  const navigate = useNavigate();
  const [active, setActive] = useState("dashboard");
  const username = localStorage.getItem("username");

  return (
    <div className="min-h-screen bg-slate-50 flex ">


      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col">


        <div className="px-8 py-8">

          <h1 className="text-4xl font-black text-slate-900">
            EqualPay
            <span className="text-emerald-500">.</span>
          </h1>

        </div>


        <div className="flex-1 px-5 hover:cursor-pointer">

          <button onClick={() =>{ setActive("dashboard"); navigate("/panel/dashboard");}} className={`w-full flex items-center gap-4 rounded-2xl px-5 py-4 mb-3 hover:cursor-pointer ${active=="dashboard"?"bg-indigo-600 text-white":"text-slate-700 hover:bg-slate-100 "}`}><FiHome />Dashboard
          </button>

          <button onClick={() => {setActive("groups");navigate("/panel/groups")}} className={`w-full flex items-center gap-4 rounded-2xl px-5 py-4 mb-3 hover:cursor-pointer ${active=="groups"?"bg-indigo-600 text-white shadow-lg":"text-slate-700 hover:bg-slate-100"}`}> <FiUsers /> Groups
          </button>

          <button onClick={() => {setActive("expenses");navigate("/panel/expenses")}} className={`w-full flex items-center gap-4 rounded-2xl px-5 py-4 mb-3 hover:cursor-pointer ${active=="expenses"?"bg-indigo-600 text-white shadow-lg":"text-slate-700 hover:bg-slate-100"}`}><FiCreditCard />Expenses
          </button>

          <button onClick={() => {setActive("settlement");navigate("/panel/settlements")}} className={`w-full flex items-center gap-4 rounded-2xl px-5 py-4 mb-3 hover:cursor-pointer ${active=="settlement"?"bg-indigo-600 text-white shadow-lg":"text-slate-700 hover:bg-slate-100"}`}><FiRepeat />Settlement
          </button>

          <button onClick={() => {setActive("notification");navigate("/panel/notifications")}} className={`w-full flex items-center gap-4 rounded-2xl px-5 py-4 mb-3 hover:cursor-pointer ${active=="notification"?"bg-indigo-600 text-white shadow-lg":"text-slate-700 hover:bg-slate-100"}`}><FiBell />Notifications
          </button>

          <button onClick={() => {setActive("profile");navigate("/panel/profile")}} className={`w-full flex items-center gap-4 rounded-2xl px-5 py-4 mb-3 hover:cursor-pointer ${active=="profile"?"bg-indigo-600 text-white shadow-lg":"text-slate-700 hover:bg-slate-100"}`}>
            <FiUser />
            Profile
          </button>

        </div>


        <div className="px-5 py-6 border-t border-slate-200">

          <button 
            onClick={() => { setActive("logout"); navigate("/panel/logout"); }}
            className={`w-full flex items-center gap-4 rounded-2xl px-5 py-4 transition-all cursor-pointer ${
              active === "logout"
                ? "bg-red-50 text-red-600 font-medium"
                : "text-slate-700 hover:bg-red-50 hover:text-red-600"
            }`}
          >
            <FiLogOut />

            Logout

          </button>

        </div>

      </aside>


      <div className="flex-1 flex flex-col">


        <header className="bg-white h-24 border-b border-slate-200 px-10 flex items-center justify-between">

          <div>

            <h2 className="text-4xl font-bold text-slate-900">
              Good Morning,{username}!
            </h2>

            <p className="text-slate-500 mt-1">
              Welcome back! Here's what's happening with your expenses.
            </p>

          </div>

          <div className="flex items-center gap-6">

            <div className="relative">

              <FiSearch className="absolute left-4 top-4 text-slate-400" />

              <input
                placeholder="Search groups, expenses..."
                className="w-80 h-12 rounded-xl border border-slate-200 pl-12 pr-4 outline-none focus:ring-4 focus:ring-indigo-100"
              />

            </div>

            <button className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center">
              <FiBell size={20} />
            </button>

            <div className="flex items-center gap-3">

              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                {username.charAt(0).toUpperCase()}
              </div>

            </div>

          </div>

        </header>


        <main className="flex-1 p-8 overflow-auto">

          <Outlet />

        </main>

      </div>

    </div>
  );
}

export default Panel;