import React from "react";

const StepWizard = ({ step }) => {

 const steps = [
  "Basic Details",
  "Address Details",
  "Emergency Details",
  "Payment"
 ];

 return (

  <div className="flex gap-6 mb-6">

   {steps.map((s,i)=>(
    <div key={i} className="flex items-center gap-2">

     <div
      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold
       ${step >= i
        ? "bg-blue-600 text-white"
        : "bg-gray-200 text-gray-600"}
      `}
     >
      {i+1}
     </div>

     <span className="text-sm text-gray-600">
      {s}
     </span>

    </div>
   ))}

  </div>

 );

};

export default StepWizard;