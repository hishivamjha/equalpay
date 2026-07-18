import React from 'react';
import { FiPieChart, FiUsers, FiZap, FiSmartphone, FiShield } from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';



function Features (){
  const features = [
  {
    name: "Create a group",
    description: "Goa trip, flatmates, office lunch — one place for shared expenses.",
    icon: FiPieChart,
  },
  {
    name: "Add who paid",
    description: "Log the bill and split it equally. We'll do the division.",
    icon: FiUsers,
  },
  {
    name: "See who owes what",
    description: "No more ‘bro send UPI screenshot’ threads in the group chat.",
    icon: FaRupeeSign ,
  },
  
];
  return (
    <section id="features" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <p className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
            Everything you need to <br className="hidden md:block" /> share costs fairly
          </p>
          <p className="text-xl text-slate-500 leading-relaxed">
            Say goodbye to awkward money conversations. EqualPay handles the math and keeps the records, so you can focus on the fun.
          </p>
        </div>

        <div className="grid grid-cols-3  gap-x-8 gap-y-12">
          {features.map((feature) => (
            <div key={feature.name}
              className="group p-8 rounded-3xl bg-slate-50 hover:bg-white border border-transparent hover:border-slate-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors duration-300">
              <feature.icon className="w-7 h-7 text-indigo-600 group-hover:text-white transition-colors duration-300" aria-hidden="true" />
            </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.name}</h3>
              <p className="text-slate-600 leading-relaxed text-base">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
