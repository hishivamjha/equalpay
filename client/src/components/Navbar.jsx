import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="text-2xl font-black text-indigo-600 tracking-tight">
            EqualPay<span className="text-emerald-500">.</span>
          </Link>

          <div className="hidden md:flex items-center space-x-10 text-lg ">
            <a href="#features" className="font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
              Features
            </a>
            <a href="#about" className="font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
              How it Works
            </a>
            <a href="#contact" className="font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
              Contact
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="px-6 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 font-semibold transition-all duration-300 hover:bg-slate-200 hover:border-slate-300 hover:shadow-md">
              Log in
            </Link>

            <Link to="/signup" className="px-6 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 font-semibold transition-all duration-300 hover:bg-slate-200 hover:border-slate-300 hover:shadow-md">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;