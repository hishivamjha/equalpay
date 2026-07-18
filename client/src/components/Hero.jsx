import React from 'react';
import { Link } from 'react-router-dom';

function Hero(){
  return (

<section className="pt-28 pb-20">
  <div className="mx-auto max-w-6xl px-6">
    <div className="mx-auto max-w-3xl text-center">

      <p className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-sm font-medium text-slate-600">
        Simple expense splitting
      </p>

      <h1 className="mt-6 text-5xl font-bold tracking-tight text-slate-900 md:text-6xl">
        Keep track of shared
        <br />
        <span className="text-indigo-600">expenses together.</span>
      </h1>

      <p className="mt-6 text-lg leading-8 text-slate-600">
        Create a group, add expenses, and instantly know who owes whom.
        Perfect for trips, roommates, family, and everyday outings.
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          to="/signup"
          className="rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white shadow-sm transition hover:bg-indigo-700"
        >
          Get started
        </Link>

        <Link
          to="/login"
          className="rounded-xl border border-slate-300 px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Log in
        </Link>
      </div>

      <div className="mt-14 mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-semibold text-slate-900">Goa Trip</h3>
            <p className="text-sm text-slate-500">4 members • 8 expenses</p>
          </div>

          <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
            Active
          </span>
        </div>

        <div className="mt-5 space-y-4">
          <div className="flex justify-between">
            <div>
              <p className="font-medium text-slate-800">Dinner</p>
              <p className="text-sm text-slate-500">Paid by Rahul</p>
            </div>

            <div className="text-right">
              <p className="font-semibold">₹1,200</p>
              <p className="text-sm text-indigo-600">You owe ₹300</p>
            </div>
          </div>

          <div className="flex justify-between">
            <div>
              <p className="font-medium text-slate-800">Taxi</p>
              <p className="text-sm text-slate-500">Paid by You</p>
            </div>

            <div className="text-right">
              <p className="font-semibold">₹640</p>
              <p className="text-sm text-emerald-600">Others owe you</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>

  );
};

export default Hero;
