import React, { useState, useEffect } from "react";
import VitalsForm from "./VitalsForm";
import VitalsList from "./VitalsList";
import { useLocation, useParams } from "react-router-dom";

import {
  ClipboardDocumentIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";

const VitalsPage = () => {
  const location = useLocation();
  const { id } = useParams();

  const [activeTab, setActiveTab] = useState("form");

  useEffect(() => {
    if (location.state?.goToList) {
      setActiveTab("list");
    } else if (id) {
      setActiveTab("form");
    }
  }, [id, location.state]);

  return (
    <div className="max-w-[1400px] mx-auto mt-4">

      
      <div className="flex justify-center -mt-4 mb-6">
        <div className="flex bg-white shadow-md border border-gray-200 rounded-2xl overflow-hidden">

          <button
            onClick={() => setActiveTab("form")}
            className={`px-8 py-2.5 text-sm font-semibold flex items-center gap-2
            ${activeTab === "form"
                ? "bg-emerald-500 text-white"
                : "text-gray-600 hover:bg-gray-50"}`}
          >
            <ClipboardDocumentIcon className="w-4 h-4" />
            Vitals Form
          </button>

          <button
            onClick={() => setActiveTab("list")}
            className={`px-8 py-2.5 text-sm font-semibold flex items-center gap-2
            ${activeTab === "list"
                ? "bg-emerald-500 text-white"
                : "text-gray-600 hover:bg-gray-50"}`}
          >
            <CreditCardIcon className="w-4 h-4" />
            Vitals List
          </button>

        </div>
      </div>

     
      {activeTab === "form" ? <VitalsForm /> : <VitalsList />}

    </div>
  );
};

export default VitalsPage;