import React, { useState, useEffect } from "react";
import GRNForm from "./GRNFormCopy";
import StockDetailsCopy from "./StockDetailsCopy";
import { useLocation, useParams } from "react-router-dom";

import {
  ClipboardDocumentIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";

const PurchasedEntryCopy = () => {

  const location = useLocation();
  const { id } = useParams();

  const [activeTab, setActiveTab] = useState("grn");

  useEffect(() => {
    if (location.state?.goToStock) {
      setActiveTab("stock");
    } else if (id) {
      setActiveTab("grn");
    }
  }, [id, location.state]);

  return (
    <div className="max-w-[1400px] mx-auto mt-10">


      <div className="flex justify-center mb-8">

        <div className="flex bg-white shadow-lg border rounded-xl overflow-hidden">

          <button
            onClick={() => setActiveTab("grn")}
            className={`px-8 py-3 text-sm font-semibold flex items-center gap-2 transition
            ${
              activeTab === "grn"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <ClipboardDocumentIcon className="w-4 h-4" />
            GRN Entry
          </button>

          <button
            onClick={() => setActiveTab("stock")}
            className={`px-8 py-3 text-sm font-semibold flex items-center gap-2 transition
            ${
              activeTab === "stock"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <CreditCardIcon className="w-4 h-4" />
            Stock View
          </button>

        </div>
      </div>


      <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">

        {activeTab === "grn" ? (
          <GRNForm />
        ) : (
          <StockDetailsCopy />
        )}

      </div>

    </div>
  );
};

export default PurchasedEntryCopy;