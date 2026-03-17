import React, { useState, useEffect } from "react";
import GRNForm from "./GRNForm";
import StockDetails from "./StockDetails";
import { useLocation } from "react-router-dom";
import { useParams } from "react-router-dom";
const PurchasedEntry = () => {
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
   <div className="max-w-[1400px] mx-auto mt-10 bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
      <div className="flex justify-center mb-8">
        <div className="flex border border-sky-500 rounded-md overflow-hidden">
          <button
            onClick={() => setActiveTab("grn")}
            className={`px-8 py-2 text-sm font-semibold ${
              activeTab === "grn"
                ? "bg-sky-600 text-white"
                : "text-sky-700"
            }`}
          >
            GRN Entry
          </button>

          <button
            onClick={() => setActiveTab("stock")}
            className={`px-8 py-2 text-sm font-semibold ${
              activeTab === "stock"
                ? "bg-sky-600 text-white"
                : "text-sky-700"
            }`}
          >
            Stock View
          </button>
        </div>
      </div>

      {activeTab === "grn" ? <GRNForm /> : <StockDetails />}
    </div>
  );
};

export default PurchasedEntry;