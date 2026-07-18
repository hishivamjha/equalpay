import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';

function Logout() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-full min-h-[60vh] animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-sm border border-slate-200 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
          <FiLogOut />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Are you sure?
        </h2>
        <p className="text-slate-500 mb-8">
          Do you really want to logout from EqualPay?
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={
              () => {
                localStorage.clear();
                navigate("/");
              }
            }
            className="w-full py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all cursor-pointer"
          >
            Yes, Logout
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-all cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default Logout;
