import React, { useEffect } from "react";

const PrintOpdForm = () => {
  useEffect(() => {
    setTimeout(() => window.print(), 300);
  }, []);

  return (
    <div
      className="
        bg-white mx-auto text-black font-sans text-[12px]
        w-[210mm] h-[297mm] p-[15mm]
        overflow-hidden box-border print:bg-white print:overflow-hidden
        print:m-0 print:p-[15mm]
      "
      style={{
        boxSizing: "border-box",
        pageBreakInside: "avoid",
        pageBreakAfter: "avoid",
        height: "calc(297mm - 0.5mm)", // fix overflow rounding issue
      }}
    >
      {/* ====== Header ====== */}
      <div className="text-center mb-3">
        <h2 className="text-[18px] font-extrabold text-[#00397A]">MEDI KAVACH</h2>
        <h3 className="text-[14px] font-semibold text-[#4A6FA1]">HEALTH CENTRE</h3>
        <p className="text-[11px] text-[#4A6FA1]">
          Address: Demo Road, Demo City, Phone: +91-9876543210
        </p>
      </div>

      <hr className="border-t border-black my-2" />

      {/* ====== Date + UHID ====== */}
      <div className="flex justify-between mb-2">
        <p><b>Date :</b></p>
        <p><b>Patient's UHID :</b></p>
      </div>

      {/* ====== Patient & Doctor Details ====== */}
      <div className="flex justify-between mt-2">
        <div className="w-[48%]">
          <h4 className="text-[13px] underline font-bold mb-1">PATIENT'S DETAILS</h4>
          <p><b>Name :</b></p>
          <p><b>Age :</b></p>
          <p><b>Gender :</b></p>
          <p><b>Contact No :</b></p>
        </div>

        <div className="w-[48%]">
          <h4 className="text-[13px] underline font-bold mb-1">DOCTOR'S DETAILS</h4>
          <p><b>Doctor Name :</b></p>
          <p><b>Qualification :</b></p>
          <p><b>Reg. No :</b></p>
          <p><b>Fin. Category :</b></p>
        </div>
      </div>

      <hr className="border-t border-black my-2" />

      {/* ====== Vitals ====== */}
      <h4 className="text-[13px] underline font-bold mb-1">VITALS :</h4>
      <table className="w-full border border-black border-collapse text-[11px] mb-4">
        <thead>
          <tr>
            {["BP (mmHg)", "PR (xx/min)", "SPO2 (%)", "Temp (°F)", "Weight (kg)", "Height (cm)"].map(
              (header) => (
                <th key={header} className="border border-black p-1 text-center">
                  {header}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          <tr>
            {[...Array(6)].map((_, i) => (
              <td key={i} className="border border-black p-4 text-center">&nbsp;</td>
            ))}
          </tr>
        </tbody>
      </table>

      {/* ====== Diagnosis and Others (Vertical Line Layout) ====== */}
      <div className="flex mt-6 min-h-[420px]">
        {/* Left Section */}
        <div className="w-[30%] text-[12px] font-semibold pr-3">
          <p className="font-bold">Advised Diagnosis<br />and Others</p>
        </div>

        {/* Vertical Line */}
        <div className="border-l border-black mx-2"></div>

        {/* Right Section */}
        <div className="flex-1 space-y-3 text-[12px]">
          <p><b>Chief Complaint :</b></p>
          <p><b>History :</b></p>
          <p><b>Physical Findings :</b></p>
          <p><b>Provisional Diagnosis :</b></p>
          <p><b>Treatment Plan :</b></p>
          <div className="h-[100px]"></div>
          <p><b>Referrals :</b></p>
          <p><b>Other Advise :</b></p>
          <p><b>Next Follow Up :</b></p>
        </div>
      </div>

      {/* ====== Doctor Signature ====== */}
      <div className="text-right mt-8 text-[12px] font-semibold">
        Doctor's Sign & Stamp
      </div>
    </div>
  );
};

export default PrintOpdForm;
