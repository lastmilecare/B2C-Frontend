import React from "react";
import { Bars3Icon } from "@heroicons/react/24/outline";

const Topbar = ({ onToggleSidebar }) => {
  return (
    <header className="bg-white shadow-sm h-14 flex items-center justify-between px-4 border-b border-gray-100">
      <button
        onClick={onToggleSidebar}
        className="block lg:hidden text-gray-600 hover:text-sky-600"
      >
        <Bars3Icon className="w-6 h-6" />
      </button>
      <h2 className="text-sky-700 font-semibold">Dashboard</h2>
      <div className="text-sm text-gray-600">Welcome 👋</div>
    </header>
  );
};

export default Topbar;
