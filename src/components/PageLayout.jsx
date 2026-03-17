import React from "react";

const PageLayout = ({ title, icon: Icon, children, rightContent }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 py-10">
      
      <div className="max-w-[1400px] mx-auto px-8">

        <div className="flex justify-between items-center mb-10">

          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            
            {Icon && (
              <span className="bg-blue-100 p-2 rounded-xl">
                <Icon className="w-6 text-blue-600" />
              </span>
            )}

            {title}

          </h1>

          {rightContent}

        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {children}
        </div>

      </div>

    </div>
  );
};

export default PageLayout;