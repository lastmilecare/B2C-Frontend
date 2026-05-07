import React, { useState, useEffect } from "react";
import FitnessCertificate from "./FitnessCertificate";
import FitnessCertificateList from "./FitnessCertificateList";
import { useLocation, useParams } from "react-router-dom";

import {
  ClipboardDocumentIcon,
  CreditCardIcon,
  DocumentPlusIcon,
} from "@heroicons/react/24/outline";
import TemplateUpload from "./TemplateUpload";
import TemplateList from "./TemplateList";
const FitnessCertificatePage = () => {
  const location = useLocation();
  const { id } = useParams();

  const [activeTab, setActiveTab] = useState("form");

 useEffect(() => {
  if (location.state?.goToList) {
    setActiveTab("list");
  } else if (location.state?.goToTemplateList) {
    setActiveTab("templateList");
  } else if (
    location.pathname.includes("/template/")
  ) {
    setActiveTab("template");
  } else if (id) {
    setActiveTab("form");
  }
}, [id, location]);

  return (
    <div className="max-w-[1400px] mx-auto mt-4">
      <div className="flex justify-center -mt-4 mb-6">
        <div className="flex bg-white shadow-md border border-gray-200 rounded-2xl overflow-hidden">
          <button
            onClick={() => setActiveTab("form")}
            className={`px-8 py-2.5 text-sm font-semibold flex items-center gap-2 transition-all
            ${activeTab === "form"
                ? "bg-emerald-500 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50"
              }`}
          >
            <ClipboardDocumentIcon className="w-4 h-4" />
            Certificate Form
          </button>

          <button
            onClick={() => setActiveTab("list")}
            className={`px-8 py-2.5 text-sm font-semibold flex items-center gap-2 transition-all
            ${activeTab === "list"
                ? "bg-emerald-500 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50"
              }`}
          >
            <CreditCardIcon className="w-4 h-4" />
            Certificate List
          </button>

          <button
            onClick={() => setActiveTab("template")}
            className={`px-8 py-2.5 text-sm font-semibold flex items-center gap-2 transition-all
  ${activeTab === "template"
                ? "bg-emerald-500 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50"
              }`}
          >
            <DocumentPlusIcon className="w-4 h-4" />
            Template Upload
          </button>
          <button
            onClick={() => setActiveTab("templateList")}
            className={`px-8 py-2.5 text-sm font-semibold flex items-center gap-2 transition-all
    ${activeTab === "templateList"
                ? "bg-emerald-500 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50"
              }`}
          >
            <CreditCardIcon className="w-4 h-4" />
            Template List
          </button>
        </div>
      </div>

      {activeTab === "form" ? (
        <FitnessCertificate />
      ) : activeTab === "list" ? (
        <FitnessCertificateList />
      ) : activeTab === "template" ? (
        <TemplateUpload />
      ) : (
        <TemplateList />
      )}
    </div>
  );
};

export default FitnessCertificatePage;
