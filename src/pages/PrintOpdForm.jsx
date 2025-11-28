import React, { forwardRef, useEffect } from "react";

const PrintOpdForm = forwardRef(({ data }, ref) => {
  const add = import.meta.env.VITE_CENTER_ADD;
  const mobile = import.meta.env.VITE_CENTER_MOBILE;
  const addedDate = data.AddedDate ? new Date(data.AddedDate).toISOString().split("T")[0] : "-";
  return (
    <div
      ref={ref}
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "12mm 15mm",
        fontFamily: "Arial, sans-serif",
        fontSize: "13px",
        color: "#000",
        lineHeight: "1.45",
      }}
    >
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 pointer-events-none select-none z-0">
        <p className="text-[60px] font-extrabold text-gray-400 opacity-10 rotate-[310deg] tracking-widest">
          Last Mile Care Pvt Ltd
        </p>
      </div>
      {/* <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <h2 style={{ color: "#00397A", margin: 0, fontWeight: "800" }}>MEDI KAVACH</h2>
        <h3 style={{ color: "#4A6FA1", margin: 0, fontWeight: "600" }}>HEALTH CENTRE</h3>
        <p style={{ fontSize: "11px", color: "#4A6FA1" }}>
          {`Address: ${add ?? ""} • Phone: ${mobile ?? ""}`}
        </p>
      </div> */}

      <div className="text-center mb-6 border-b pb-6 pt-4">
        <h1 className="text-[#00397A] text-[32px] font-extrabold tracking-wide leading-none">
          MEDI KAVACH
        </h1>
        <h2 className="text-[#4A6FA1] text-[13px] font-semibold tracking-[0.25em] mt-1">
          HEALTH CENTRE
        </h2>
        <p className="text-[10px] text-[#4A6FA1] mt-2">
          {add || ""} • Contact: {mobile || ""}
        </p>
      </div>




      <hr style={{ margin: "5px 0", borderColor: "#00397A" }} />


      <div style={{ display: "flex", justifyContent: "space-between", margin: "10px 0" }}>
        <div><b>Date:</b> {addedDate}</div>
        <div><b>UHID:</b> {data?.uhid}</div>
      </div>

      {/* Patient & Doctor */}
      <div style={{ display: "flex", justifyContent: "space-between", margin: "10px 0" }}>
        <h3 style={sectionTitle}>PATIENT DETAILS</h3>
        <h3 style={sectionTitle}>DOCTOR DETAILS</h3>
      </div>

      <table style={table}>
        <tbody>
          <tr>
            <td style={td}><b>Name:</b> {data?.patient_name}</td>
            <td style={td}><b>Doctor:</b> {data?.doctor_name}</td>
          </tr>
          <tr>
            <td style={td}><b>Age:</b> {data?.age}</td>
            <td style={td}><b>Qualification:</b> {data?.qualification}</td>
          </tr>
          <tr>
            <td style={td}><b>Gender:</b> {data?.gender}</td>
            <td style={td}><b>Reg No:</b> {data?.registration_number}</td>
          </tr>
          <tr>
            <td style={td}><b>Contact:</b> {data?.contactNumber}</td>
            <td style={td}><b>Category:</b> {data?.patient_type}</td>
          </tr>
        </tbody>
      </table>
      <h3 style={sectionTitle}>VITALS</h3>
      <table style={tableBordered}>
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
            <td style={tdCenter}>{data?.vitals?.systolicBP}</td>
            <td style={tdCenter}>{data?.vitals?.diastolicBP}</td>
            <td style={tdCenter}>{data?.vitals?.pulse}</td>
            <td style={tdCenter}>{data?.vitals?.spo2}</td>
            <td style={tdCenter}>{data?.vitals?.temperature}</td>
            <td style={tdCenter}>{data?.vitals?.height || "-"}</td>
            <td style={tdCenter}>{data?.vitals?.weight}</td>
          </tr>
        </tbody>
      </table>
      <div className="flex mt-6 min-h-[420px]">
        <div className="w-[30%] text-[12px] font-semibold pr-3">
          <p className="font-bold">Advised Diagnosis<br />and Others</p>
        </div>
        <div className="border-l border-black mx-2"></div>
        <div className="flex-1 space-y-3 text-[12px]">
          <p><b>Chief Complaint : {data?.complaint || ""}</b></p>
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

      <div className="text-right mt-8 text-[12px] font-semibold">
        Doctor's Sign & Stamp
      </div>
    </div>
  );

});
const sectionTitle = {
  marginTop: "20px",
  marginBottom: "8px",
  fontSize: "15px",
  fontWeight: "bold",
  color: "#00397A",
  borderBottom: "1px solid #4A6FA1",
  paddingBottom: "4px"
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  marginBottom: "10px",
};

const tableBordered = {
  width: "100%",
  borderCollapse: "collapse",
  border: "1px solid #000",
  marginBottom: "10px",
};

const td = {
  border: "1px solid #000",
  padding: "5px",
};

const tdCenter = {
  border: "1px solid #000",
  padding: "5px",
  textAlign: "center",
};

const th = {
  border: "1px solid #000",
  padding: "6px",
  background: "#EDF5FF",
  fontWeight: "bold",
  textAlign: "center",
};

export default PrintOpdForm;
