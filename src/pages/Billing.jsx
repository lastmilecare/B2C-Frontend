import React, { useState, useEffect } from "react";
import BillingFormCopy from "./BillingForm";
import BillingListCopy from "./BillingList";
import { useParams } from "react-router-dom";

import {
  ClipboardDocumentIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";

const BillingCopy = () => {

  const { id } = useParams();
  const [activeTab, setActiveTab] = useState(id ? "billing" : "history");

  useEffect(() => {
    if (id) {
      setActiveTab("billing");
    }
  }, [id]);

  return (

    <div className="max-w-[1400px] mx-auto mt-4">


       <div className="flex justify-center -mt-4 mb-6"> 

  <div className="flex bg-white shadow-md border border-gray-200 rounded-2xl overflow-hidden">

          <button
            onClick={() => setActiveTab("billing")}
            className={`px-8 py-2.5 text-sm font-semibold flex items-center gap-2 transition-all
            ${
              activeTab === "billing"
               ? "bg-emerald-500 text-white shadow-md"
          : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <ClipboardDocumentIcon className="w-4 h-4" />
            Billing Form
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`px-8 py-2.5 text-sm font-semibold flex items-center gap-2 transition-all
            ${
              activeTab === "history"
                ? "bg-emerald-500 text-white shadow-md"
          : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <CreditCardIcon className="w-4 h-4" />
            Billing List 
          </button>

        </div>

      </div>

      {/* <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100"> */}

        {activeTab === "billing"
          ? <BillingFormCopy />
          : <BillingListCopy />}

      {/* </div> */}

    </div>
  );
};

export default BillingCopy;