import React from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';

function Footer() {
  return (

    <footer className="border-t border-slate-200 bg-white mt-32">
      <div className="max-w-6xl mx-auto px-6 py-16">

        <div className="grid gap-12 md:grid-cols-3">

          <div>
            <Link
              to="/"
              className="text-2xl font-bold text-slate-900"
            >
              Equal<span className="text-indigo-600">Pay</span>
            </Link>

            <p className="mt-4 max-w-sm text-slate-600 leading-7">
              A simple way to split bills, track shared expenses, and settle up
              with friends, roommates, and family.
            </p>


          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900">
              Navigation
            </h3>

            <ul className="mt-5 space-y-3">
              <li>
                <a
                  href="#features"
                  className="text-slate-600 hover:text-indigo-600 transition"
                >
                  Features
                </a>
              </li>

              <li>
                <Link
                  to="/login"
                  className="text-slate-600 hover:text-indigo-600 transition"
                >
                  Log in
                </Link>
              </li>

              <li>
                <Link
                  to="/signup"
                  className="text-slate-600 hover:text-indigo-600 transition"
                >
                  Sign up
                </Link>
              </li>

              <li>
                <a
                  href="#contact"
                  className="text-slate-600 hover:text-indigo-600 transition"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900">
              Connect
            </h3>

            <p className="mt-5 text-slate-600">
              Have feedback or found a bug? I'd love to hear from you.
            </p>

            <div className="mt-6 flex gap-4">
              <a
                href="#"
                className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-indigo-200 hover:text-indigo-600"
              >
                <FiGithub className="h-5 w-5" />
              </a>

              <a
                href="#"
                className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-blue-200 hover:text-blue-600"
              >
                <FiLinkedin className="h-5 w-5" />
              </a>

              <a
                href="#"
                className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-pink-200 hover:text-pink-600"
              >
                <FiInstagram className="h-5 w-5" />
              </a>
            </div>
          </div>

        </div>

        <div className="mt-14 border-t border-slate-200 pt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} EqualPay. All rights reserved.
          </p>

          <div className="flex gap-6 text-sm">
            <a
              href="#"
              className="text-slate-500 hover:text-indigo-600 transition"
            >
              Privacy
            </a>

            <a
              href="#"
              className="text-slate-500 hover:text-indigo-600 transition"
            >
              Terms
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
