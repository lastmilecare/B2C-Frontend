import React, { useState } from "react";
import TestPackageForm from "./TestPackageForm";
import TestPackageList from "./TestPackageList";
import {
  BeakerIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

const TestPackagePage = () => {
  const [activeTab, setActiveTab] = useState("form");
  const [editData, setEditData] = useState(null);

  const handleEdit = (pkg) => {
    setEditData(pkg);
    setActiveTab("form");
  };

  const handleSaved = () => {
    setEditData(null);
    setActiveTab("list");
    
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className="max-w-[1400px] mx-auto mt-4">
      
      <div className="flex justify-center mb-6">
        <div className="flex bg-white shadow-md border border-gray-200 rounded-2xl overflow-hidden">
          <button
            onClick={() => {
              setActiveTab("form");
              setEditData(null);
            }}
            className={`px-8 py-2.5 text-sm font-semibold flex items-center gap-2 transition-colors
              ${
                activeTab === "form"
                  ? "bg-emerald-500 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
          >
            <BeakerIcon className="w-4 h-4" />
            {editData ? "Edit Package" : "Create Package"}
          </button>

          <button
            onClick={() => setActiveTab("list")}
            className={`px-8 py-2.5 text-sm font-semibold flex items-center gap-2 transition-colors
              ${
                activeTab === "list"
                  ? "bg-emerald-500 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
          >
            <ClipboardDocumentListIcon className="w-4 h-4" />
            Package List
          </button>
        </div>
      </div>

     
      {activeTab === "form" ? (
        <TestPackageForm editData={editData} onSaved={handleSaved} />
      ) : (
        <TestPackageList onEdit={handleEdit} />
      )}
    </div>
  );
};

export default TestPackagePage;