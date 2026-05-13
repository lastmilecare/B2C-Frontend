import React from "react";
import { Link } from "react-router-dom";
import { ShieldExclamationIcon } from "@heroicons/react/24/outline";

const Unauthorized = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-red-50 to-white text-center px-6">
      <div className="bg-white p-10 rounded-2xl shadow-lg border border-red-100 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <ShieldExclamationIcon className="w-16 h-16 text-red-600" />
        </div>

        <h1 className="text-5xl font-extrabold text-red-700 mb-3">
          403
        </h1>

        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Access Denied
        </h2>

        <p className="text-gray-500 mb-8">
          You do not have permission to access this page.
        </p>

        <div className="flex gap-3 justify-center">
          <Link
            to="/"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
          >
            Go Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="border border-gray-300 hover:bg-gray-50 px-6 py-3 rounded-lg font-medium transition-all"
          >
            Go Back
          </button>
        </div>
      </div>

      <p className="mt-8 text-gray-400 text-sm">
        © {new Date().getFullYear()} LMC Medical Portal
      </p>
    </div>
  );
};

export default Unauthorized;