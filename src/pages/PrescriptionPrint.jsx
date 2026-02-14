import React, { forwardRef } from "react";

const PrescriptionPrint = forwardRef(({ data }, ref) => {
  const followUpDate = data?.follow_up ? new Date(data.follow_up) : null;
  const today = new Date();

  let followup_days = "-";
  if (followUpDate) {
    const diffMs = followUpDate - today;
    followup_days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }
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

  const result = formatToIST(data?.addedDate);

  const add = import.meta.env.VITE_CENTER_ADD;
  const mobile = import.meta.env.VITE_CENTER_MOBILE;
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
      <img src="/images/LMC_logo.webp" alt="logo" />
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <h2 style={{ color: "#00397A", margin: 0, fontWeight: "800" }}>
          MEDI KAVACH
        </h2>
        <h3 style={{ color: "#4A6FA1", margin: 0, fontWeight: "600" }}>
          HEALTH CENTRE
        </h3>
        <p style={{ fontSize: "11px", color: "#4A6FA1" }}>
          {`Address: ${add ?? ""} • Phone: ${mobile ?? ""}`}
        </p>
      </div>

      <hr style={{ margin: "5px 0", borderColor: "#00397A" }} />

      {/* Basic */}
      <div>
        <b>Date:</b> {result}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          margin: "20px 0",
        }}
      >
        <div>
          <b>Bill No:</b> {data?.billNo}
        </div>
        <div style={{ paddingRight: "10%" }}>
          <b>UHID:</b> {data?.picasoId}
        </div>
      </div>

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
                <span style={value}>{data?.patientName}</span>
              </div>
            </td>

            <td style={td}>
              <div style={rowLine}>
                <span style={label}>Doctor</span>
                <span style={colon}>:</span>
                <span style={value}>{data?.doctor?.name}</span>
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
                <span style={value}>{data?.doctor?.qualification}</span>
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
                <span style={value}>{data?.doctor?.registration_number}</span>
              </div>
            </td>
          </tr>

          <tr>
            <td style={td}>
              <div style={rowLine}>
                <span style={label}>Contact</span>
                <span style={colon}>:</span>
                <span style={value}>{data?.contactNo}</span>
              </div>
            </td>

            <td style={td}>
              <div style={rowLine}>
                <span style={label}>Category</span>
                <span style={colon}>:</span>
                <span style={value}>{data?.patientType}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Vitals */}
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

      {/* Medicines */}
      <h3 style={sectionTitle}>PRESCRIBED MEDICINES</h3>
      <table style={tableBordered}>
        <thead>
          <tr>
            {[
              "S.no",
              "Name",
              "Type",
              "Dosage",
              "Instruction",
              "Time",
              "Days",
            ].map((h) => (
              <th key={h} style={th}>
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody style={{ minHeight: "120px" }}>
          {data?.adviceList?.length > 0 ? (
            data.adviceList.map((m, i) => (
              <tr key={i}>
                <td style={tdCenter}>{i + 1}</td>
                <td style={tdCenter}>{m.item}</td>
                <td style={tdCenter}>{m.typeOfMedicine}</td>
                <td style={tdCenter}>{m.dosage}</td>
                <td style={tdCenter}>{m.remarks}</td>
                <td style={tdCenter}>{m.pillsConsumption}</td>
                <td style={tdCenter}>{m.duration}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td style={tdCenter} colSpan={6}>
                {" "}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={rowBlock}>
        <span style={label}>Chief Complaints</span>
        <span style={colon1}>:</span>
        <span style={value}>{data?.chiefComplaints}</span>
      </div>

      <div style={rowBlock}>
        <span style={label}>Lab Tests</span>
        <span style={colon1}>:</span>
        <span style={value}>{data?.labs}</span>
      </div>

      <div style={rowBlock}>
        <span style={label}>Other Lab</span>
        <span style={colon1}>:</span>
        <span style={value}>{data?.otherLabs}</span>
      </div>

      <div style={rowBlock}>
        <span style={label}>Follow-up After (Days)</span>
        <span style={colon1}>:</span>
        <span style={value}>{data?.nextFollowup}</span>
      </div>

      <div style={rowBlock}>
        <span style={label}>Preventive Advice</span>
        <span style={colon1}>:</span>
        <span style={value}>{data?.preventiveAdvice}</span>
      </div>

      <div style={rowBlock}>
        <span style={label}>History</span>
        <span style={colon1}>:</span>
        <span style={value}>{data?.history}</span>
      </div>

      <div style={rowBlock}>
        <span style={label}>Other Instructions</span>
        <span style={colon1}>:</span>
        <span style={value}>{data?.otherInstructions}</span>
      </div>

      {/* Signature */}
      <div
        style={{ textAlign: "right", marginTop: "60px", fontWeight: "bold" }}
      >
        Doctor's Sign & Stamp
      </div>
      <div
        style={{ textAlign: "right", marginTop: "10px", fontWeight: "bold" }}
      >
        {data?.doctor.name}
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

export default PrescriptionPrint;
