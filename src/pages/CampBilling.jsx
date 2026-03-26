import React, { useState, useEffect } from "react";
import CampBillingFormCopy from "./CampBillingForm";
import BillingList from "./BillingList_old";
import { useParams } from "react-router-dom";

import {
  ClipboardDocumentIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";

const CampBillingCopy = () => {

  const { id } = useParams();
  const [activeTab, setActiveTab] = useState(id ? "billing" : "history");

  useEffect(() => {
    if (id) {
      setActiveTab("billing");
    }
  }, [id]);

  return (

    <div className="max-w-[1400px] mx-auto mt-10">

      {/* Toggle */}
      <div className="flex justify-center mb-6">

        <div className="flex border rounded-xl overflow-hidden shadow">

          <button
            onClick={() => setActiveTab("billing")}
            className={`px-8 py-3 flex items-center gap-2 text-sm font-semibold
            ${activeTab === "billing"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-50"
              }`}
          >
            <ClipboardDocumentIcon className="w-4 h-4" />
            Billing Form
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`px-8 py-3 flex items-center gap-2 text-sm font-semibold
            ${activeTab === "history"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-50"
              }`}
          >
            <CreditCardIcon className="w-4 h-4" />
            Billing List
          </button>

        </div>

      </div>

      {/* Content */}

      <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">

        {activeTab === "billing"
          ? <CampBillingFormCopy />
          : <BillingList />}

      </div>

    </div>
  );
};

export default CampBillingCopy;