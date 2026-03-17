import React from "react";
import CopySidebar from "./CopySidebar";
import CopyHeader from "./CopyHeader";

const CopyLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-[#f3f6fb]">

      <CopySidebar />

      <div className="flex-1 flex flex-col">

        <CopyHeader />

        <div className="p-6 overflow-auto">
          {children}
        </div>

      </div>

    </div>
  );
};

export default CopyLayout;