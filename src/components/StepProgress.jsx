import React from "react";

const StepProgress = ({ steps, activeStep }) => {
  return (
    <div className="flex justify-between items-center mb-10">

      <div className="flex gap-2">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`h-2 w-12 rounded-full ${
              activeStep >= index + 1 ? "bg-blue-600" : "bg-gray-200"
            }`}
          />
        ))}
      </div>

    </div>
  );
};

export default StepProgress;