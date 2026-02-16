import React, { useState } from "react";
import BillingForm from "./BillingForm";
import BillingList from "./BillingList";

const Billing = () => {
  const [activeTab, setActiveTab] = useState("billing");

  return (
    <div className="max-w-[98%] mx-auto mt-6 bg-white p-4 rounded-xl shadow-lg border">
      <div className="flex justify-center mb-4">
        <div className="flex border border-sky-500 rounded-md overflow-hidden shadow-sm">
          <button onClick={() => setActiveTab("billing")} className={`px-8 py-1.5 text-xs font-bold transition ${activeTab === "billing" ? "bg-sky-600 text-white" : "text-sky-700 hover:bg-sky-50"}`}>
            Billing Form
          </button>
          <button onClick={() => setActiveTab("history")} className={`px-8 py-1.5 text-xs font-bold transition ${activeTab === "history" ? "bg-sky-600 text-white" : "text-sky-700 hover:bg-sky-50"}`}>
            Billing List
          </button>
        </div>
      </div>

      {activeTab === "billing" ? <BillingForm /> : <BillingList />}
    </div>
  );
};

export default Billing;