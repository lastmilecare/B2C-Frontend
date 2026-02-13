import React, { forwardRef, useEffect } from "react";

const PrintOpdForm = forwardRef(({ data }, ref) => {
  console.log(data, "opd");
  const add = import.meta.env.VITE_CENTER_ADD;
  const mobile = import.meta.env.VITE_CENTER_MOBILE;
  function formatToIST(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const formatted = date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return formatted;
  }
  const dateR = formatToIST(data?.AddedDate);
  const rowLine = {
    display: "flex",
  };

  const label = {
    width: "120px", // fixed width for alignment
    fontWeight: "bold",
    position: "relative",
  };

  const value = {
    marginLeft: "5px",
  };
  const colon = {
    marginRight: "8px",
  };
  const colon1 = {
    marginRight: "2px",
  };
  const rowBlock = {
    display: "grid",
    gridTemplateColumns: "200px 15px 1fr", // label | colon | value
    alignItems: "start",
    marginTop: "12px",
  };

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
        <p className="text-[40px] font-extrabold text-gray-400 opacity-10 rotate-[310deg] tracking-widest">
          Last Mile Care Pvt Ltd
        </p>
      </div>
      <img src="/images/LMC_logo.webp" alt="logo" />
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

      {/* <hr style={{ margin: "5px 0", borderColor: "#00397A" }} /> */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          margin: "10px 0",
        }}
      >
        <div>
          <b>Date:</b> {dateR}
        </div>
        <div>
          <b>Bill No:</b> {data?.bill_no}
        </div>
        <div>
          <b>UHID:</b> {data?.uhid}
        </div>
      </div>

      {/* Patient & Doctor */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          margin: "10px 0",
        }}
      >
        <h3 style={sectionTitle}>PATIENT DETAILS</h3>
        <h3 style={sectionTitle}>DOCTOR DETAILS</h3>
      </div>

      <table style={table}>
        <tbody>
          <tr>
            <td style={td}>
              <div style={rowLine}>
                <span style={label}>Name</span>
                <span style={colon}>:</span>
                <span style={value}>{data?.patient_name}</span>
              </div>
            </td>

            <td style={td}>
              <div style={rowLine}>
                <span style={label}>Doctor</span>
                <span style={colon}>:</span>
                <span style={value}>{data?.doctor_name}</span>
              </div>
            </td>
          </tr>

          <tr>
            <td style={td}>
              <div style={rowLine}>
                <span style={label}>Age</span>
                <span style={colon}>:</span>
                <span style={value}>{data?.age}</span>
              </div>
            </td>

            <td style={td}>
              <div style={rowLine}>
                <span style={label}>Qualification</span>
                <span style={colon}>:</span>
                <span style={value}>{data?.qualification}</span>
              </div>
            </td>
          </tr>

          <tr>
            <td style={td}>
              <div style={rowLine}>
                <span style={label}>Gender</span>
                <span style={colon}>:</span>
                <span style={value}>{data?.gender}</span>
              </div>
            </td>

            <td style={td}>
              <div style={rowLine}>
                <span style={label}>Reg No</span>
                <span style={colon}>:</span>
                <span style={value}>{data?.registration_number}</span>
              </div>
            </td>
          </tr>

          <tr>
            <td style={td}>
              <div style={rowLine}>
                <span style={label}>Contact</span>
                <span style={colon}>:</span>
                <span style={value}>{data?.contactNumber}</span>
              </div>
            </td>

            <td style={td}>
              <div style={rowLine}>
                <span style={label}>Category</span>
                <span style={colon}>:</span>
                <span style={value}>{data?.patient_type}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <h3 style={sectionTitle}>VITALS</h3>
      <table style={tableBordered}>
        <thead>
          <tr>
            {[
              "BP (Sys)",
              "BP (Dia)",
              "Pulse",
              "SpO₂",
              "Temp",
              "Height",
              "Weight",
            ].map((h) => (
              <th key={h} style={th}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody style={{ height: "30px" }}>
          <tr>
            <td style={tdCenter}>{data?.bpSystolic}</td>
            <td style={tdCenter}>{data?.bpDiastolic}</td>
            <td style={tdCenter}>{data?.pulseRate}</td>
            <td style={tdCenter}>{data?.spo2}</td>
            <td style={tdCenter}>{data?.temperature}</td>
            <td style={tdCenter}>{data?.height}</td>
            <td style={tdCenter}>{data?.weight}</td>
          </tr>
        </tbody>
      </table>

      <div className="flex mt-6 min-h-[420px]">
        <div className="w-[30%] text-[12px] font-semibold pr-3">
          <p className="font-bold">
            Advised Diagnosis
            <br />
            and Others
          </p>
        </div>
        <div className="border-l border-black mx-2"></div>
        <div className="flex-1 space-y-3 text-[12px]">
          <p>
            <b>Chief Complaint : {data?.complaint || ""}</b>
          </p>
          <p>
            <b>History :</b>
          </p>
          <p>
            <b>Physical Findings :</b>
          </p>
          <p>
            <b>Provisional Diagnosis :</b>
          </p>
          <p>
            <b>Treatment Plan :</b>
          </p>
          <div className="h-[100px]"></div>
          <p>
            <b>Referrals :</b>
          </p>
          <p>
            <b>Other Advise :</b>
          </p>
          <p>
            <b>Next Follow Up :</b>
          </p>
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
  paddingBottom: "4px",
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
