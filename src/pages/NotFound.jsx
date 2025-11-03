import React from "react";
import { Link } from "react-router-dom";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-sky-50 to-white text-center px-6">
      <div className="bg-white p-10 rounded-2xl shadow-lg border border-sky-100 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <ExclamationTriangleIcon className="w-16 h-16 text-sky-600" />
        </div>

        <h1 className="text-5xl font-extrabold text-sky-700 mb-3">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Page Not Found
        </h2>
        <p className="text-gray-500 mb-8">
          The page you’re looking for doesn’t exist or has been moved.
        </p>

        <Link
          to="/"
          className="inline-block bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
        >
          Go Back Home
        </Link>
      </div>

      <p className="mt-8 text-gray-400 text-sm">
        © {new Date().getFullYear()} LMC Medical Portal
      </p>
    </div>
  );
};

export default NotFound;
