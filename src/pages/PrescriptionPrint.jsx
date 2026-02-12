import React, { forwardRef } from "react";

const PrescriptionPrint = forwardRef(({ data }, ref) => {
  const followUpDate = data?.follow_up ? new Date(data.follow_up) : null;
  const today = new Date();

  let followup_days = "-";
  if (followUpDate) {
    const diffMs = followUpDate - today;
    followup_days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }
  function extractDate(val) {
    if (!val || typeof val !== "string") return null;

    const parts = val.split("T");
    return parts.length > 0 ? parts[0] : null;
  }

  const result = extractDate(data?.addedDate);

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
              <b>Name:</b> {data?.patientName}
            </td>
            <td style={td}>
              <b>Doctor:</b> {data?.doctor_name}
            </td>
          </tr>
          <tr>
            <td style={td}>
              <b>Age:</b> {data?.age}
            </td>
            <td style={td}>
              <b>Qualification:</b> {data?.qualification}
            </td>
          </tr>
          <tr>
            <td style={td}>
              <b>Gender:</b> {data?.gender}
            </td>
            <td style={td}>
              <b>Reg No:</b> {data?.registration_number}
            </td>
          </tr>
          <tr>
            <td style={td}>
              <b>Contact:</b> {data?.contactNo}
            </td>
            <td style={td}>
              <b>Category:</b> {data?.patientType}
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
        <tbody>
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

        <tbody>
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

      <div style={{ marginTop: "20px" }}>
        <b>Chief Complaints</b> {data?.chiefComplaints}
      </div>
      <div style={{ marginTop: "20px" }}>
        <b>Lab Tests :</b> {data?.labs}
      </div>
      <div style={{ marginTop: "20px" }}>
        <b>Other Lab:</b> {data?.otherLabs}
      </div>

      <div style={{ marginTop: "20px" }}>
        <b>Follow-up After (Days):</b> {data?.nextFollowup}
      </div>

      <div style={{ marginTop: "20px" }}>
        <b>Preventive Advice:</b> {data?.preventiveAdvice}
      </div>

      <div style={{ marginTop: "20px" }}>
        <b>History:</b> {data?.history}
      </div>
      <div style={{ marginTop: "20px" }}>
        <b>Other Instructions :</b> {data?.otherInstructions}
      </div>
      {/* Signature */}
      <div
        style={{ textAlign: "right", marginTop: "60px", fontWeight: "bold" }}
      >
        Doctor's Signature
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
