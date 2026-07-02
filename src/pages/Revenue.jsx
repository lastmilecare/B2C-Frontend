import React, { useState, useEffect } from "react";
import PharmacyRevenueForm from "./PharmacyRevenue";
import PharmacyRevenueList from "./PharmacyRevenueList";
import { useLocation } from "react-router-dom";

import {
  ClipboardDocumentIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";

const Revenue = () => {
  const [activeTab, setActiveTab] = useState("form");
  const [editingId, setEditingId] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const location = useLocation();

 
  const handleEdit = (row) => {
    setEditingId(row.RevenueID);
    setEditRow(row);
    setActiveTab("form"); 
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

 
  const handleFormSuccess = () => {
    setEditingId(null);
    setEditRow(null);
    setRefreshKey((k) => k + 1);
    setActiveTab("list");
  };

  
  const handleFormCancel = () => {
    setEditingId(null);
    setEditRow(null);
  };
  useEffect(() => {
  if (location.state?.goToList) {
    setActiveTab("list");
  } else if (location.state?.goToForm) {
    setActiveTab("form");
    setEditingId(null);
    setEditRow(null);
  }
}, [location.state]);

  return (
    <div className="max-w-[1400px] mx-auto mt-4">

    
      <div className="flex justify-center -mt-4 mb-6">
        <div className="flex bg-white shadow-md border border-gray-200 rounded-2xl overflow-hidden">

          <button
            onClick={() => {
              setActiveTab("form");
             
              if (activeTab === "list") {
                setEditingId(null);
                setEditRow(null);
              }
            }}
            className={`px-8 py-2.5 text-sm font-semibold flex items-center gap-2 transition-all
              ${
                activeTab === "form"
                  ? "bg-emerald-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
          >
            <ClipboardDocumentIcon className="w-4 h-4" />
            {editingId ? "Update Revenue" : "Pharmacy Revenue"}
          </button>

          <button
            onClick={() => setActiveTab("list")}
            className={`px-8 py-2.5 text-sm font-semibold flex items-center gap-2 transition-all
              ${
                activeTab === "list"
                  ? "bg-emerald-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
          >
            <CreditCardIcon className="w-4 h-4" />
            Revenue List
          </button>

        </div>
      </div>

      
      {activeTab === "form" ? (
        <PharmacyRevenueForm
          editingId={editingId}
          editRow={editRow}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      ) : (
        <PharmacyRevenueList
          key={refreshKey}
          onEdit={handleEdit}
        />
      )}

    </div>
  );
};

export default Revenue;
