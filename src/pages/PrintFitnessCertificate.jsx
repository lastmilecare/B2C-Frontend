import React, { forwardRef } from "react";
import { useGetOrgProfilesQuery } from "../redux/apiSlice";
import { cookie } from "../utils/cookie";

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-IN");
};

const val = (value) => (value !== null && value !== undefined && value !== "" ? value : "");

const displayHistory = (value) => {
  if (!value) return "";
  const v = String(value).toLowerCase();
  if (v === "yes" || v === "no") return v.charAt(0).toUpperCase() + v.slice(1);
  return value;
};

const isChecked = (value) => value === true || value === "true" || value === 1;

const Checkbox = ({ checked }) => (
  <span
    style={{
      display: "inline-block",
      width: "12px",
      height: "12px",
      border: "1px solid #000",
      marginRight: "6px",
      marginTop: "2px",
      textAlign: "center",
      fontSize: "10px",
      lineHeight: "11px",
      flexShrink: 0,
      fontWeight: 700,
    }}
  >
    {checked ? "✓" : ""}
  </span>
);

const CheckLine = ({ checked, children }) => (
  <p
    style={{
      margin: "0 0 5px",
      textAlign: "justify",
      display: "flex",
      alignItems: "flex-start",
    }}
  >
    <Checkbox checked={checked} />
    <span style={{ flex: 1 }}>{children}</span>
  </p>
);

const TextLine = ({ children }) => (
  <p style={{ margin: "0 0 5px", textAlign: "justify" }}>{children}</p>
);

const PrintFitnessCertificate = forwardRef(({ data = {} }, ref) => {
  const center_id = cookie.get("center_id");
  const tenant_id = cookie.get("tenantId");

  const { data: organisationData, isLoading } = useGetOrgProfilesQuery({
    page: 1,
    limit: 10,
    tenant_id,
    center_id,
  });

  const profile = organisationData?.data?.[0] || {};
  const projectName = data.project_name || profile.display_name || "";
  const issueDate = formatDate(data.created_at || new Date());

  const pageStyle = {
    width: "210mm",
    minHeight: "297mm",
    padding: "15mm 20mm 14mm",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "12px",
    color: "#000",
    lineHeight: 1.45,
    boxSizing: "border-box",
    position: "relative",
    background: "#fff",
  };

  const underline = (text, width = "100%") => (
    <span
      style={{
        borderBottom: "1px solid #000",
        display: "inline-block",
        minWidth: width,
        padding: "0 2px 1px",
        lineHeight: 1.2,
        verticalAlign: "bottom",
      }}
    >
      {val(text) || "\u00a0"}
    </span>
  );

  const dotted = (text) => (
    <span
      style={{
        borderBottom: "1px dotted #000",
        display: "inline-block",
        flex: 1,
        minWidth: "220px",
        padding: "0 2px 1px",
        verticalAlign: "bottom",
      }}
    >
      {val(text) || "\u00a0"}
    </span>
  );

  const fieldRow = (num, labelText, content) => (
    <div style={{ marginBottom: "12px" }}>
      {num} {labelText} {content}
    </div>
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const physicalRows = [
    ["a)", "Height", data.height],
    ["b)", "Weight", data.weight],
    ["c)", "Blood Pressure", data.blood_pressure],
    ["d)", "Pulse", data.pulse],
    ["e)", "Hearing", data.hearing],
    ["f)", "Refractive Error", data.refractive_error],
    ["g)", "Colour Vision", data.color_vision],
    ["h)", "Any Disability", data.any_disability],
    ["i)", "Arm Function & Grip", data.arm_grip],
    ["j)", "Leg & Foot Function", data.leg_foot_function],
  ];

  const historyRows = [
    ["a)", "Varicose", displayHistory(data.prev_varicose)],
    ["b)", "Seizure", displayHistory(data.prev_seizure)],
    ["c)", "Vertigo", displayHistory(data.prev_vertigo)],
    ["d)", "Acrophobia", displayHistory(data.prev_acrophobia)],
    ["e)", "Diabetes", displayHistory(data.prev_diabetes)],
    ["f)", "Stroke", displayHistory(data.prev_stroke)],
    ["g)", "Heart Diseases", displayHistory(data.prev_heart_diseases)],
    ["h)", "Major Illness or Surgery", displayHistory(data.prev_major_illness_surgery)],
    ["i)", "Symptoms Visible", data.prev_symptoms_visible],
    ["j)", "Others, if any", data.prev_others],
  ];

  const cell = {
    border: "1px solid #000",
    padding: "4px 6px",
    verticalAlign: "top",
    fontSize: "11px",
    lineHeight: 1.35,
  };

  const headerCell = {
    ...cell,
    fontWeight: 700,
    textAlign: "center",
  };

  return (
    <div ref={ref}>
      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 0;
            }
            .fitness-cert-page {
              page-break-after: always;
              break-after: page;
            }
            .fitness-cert-page:last-child {
              page-break-after: auto;
              break-after: auto;
            }
          }
        `}
      </style>

      {/* PAGE 1 — Certificate of Medical Examination */}
      <div className="fitness-cert-page" style={pageStyle}>
        <div style={{ textAlign: "center", fontSize: "11px", marginBottom: "10px" }}>
          [(see rule 111 (c)]
        </div>

        <h1
          style={{
            textAlign: "center",
            fontWeight: 700,
            fontSize: "14px",
            margin: "0 0 18px",
            letterSpacing: "0.3px",
          }}
        >
          CERTIFICATE OF MEDICAL EXAMINATION
        </h1>

        <div style={{ marginBottom: "14px" }}>
          Name of the Project : {underline(projectName, "68%")}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "16px",
            gap: "16px",
          }}
        >
          <div style={{ flex: 1 }}>
            Certificate Serial No. {underline(data.certificate_number || "", "52%")}
          </div>
          <div style={{ minWidth: "170px", textAlign: "right" }}>
            Date : {underline(issueDate, "110px")}
          </div>
        </div>

        {fieldRow("1.", "Name of the workman :", underline(data.workman_name, "60%"))}
        {fieldRow("2.", "**Trade of the workman :", underline(data.trade, "56%"))}

        <div style={{ marginBottom: "12px" }}>
          3. Identification marks :
          <div style={{ marginTop: "6px", paddingLeft: "24px" }}>
            <div style={{ marginBottom: "8px" }}>
              (1) {underline(data.identification_mark_1, "72%")}
            </div>
            <div style={{ paddingLeft: "12px" }}>
              (2) {underline(data.identification_mark_2, "70%")}
            </div>
          </div>
        </div>

        {fieldRow(
          "4.",
          "Father's/ Husband's/ wife's Name :",
          underline(data.guardian_name, "50%"),
        )}
        {fieldRow("5.", "Sex :", underline(data.sex, "22%"))}
        {fieldRow("6.", "Residence Address :", underline(data.residence_address, "58%"))}

        <div style={{ marginBottom: "14px" }}>
          7. Date of birth, if available : {underline(formatDate(data.date_of_birth), "120px")}
          <span style={{ marginLeft: "6px" }}>and/or certificate age</span>{" "}
          {underline(data.certificate_age, "90px")}
        </div>

        <p style={{ textAlign: "justify", margin: "16px 0 18px", lineHeight: 1.5 }}>
          I hereby certify that I have personally examined as per the physical &amp; medical
          examinations prescribed in the given annexure-I (name){" "}
          {underline(data.workman_name, "170px")} who is desirous of being employed in building
          and construction work and that he/she is fit for employment in{" "}
          {underline(projectName, "170px")}.
        </p>

        <div style={{ marginBottom: "6px" }}>8. Reason for--</div>
        <div style={{ display: "flex", alignItems: "flex-end", marginBottom: "10px", gap: "8px" }}>
          <span>(1) Refusal of certificate</span>
          {dotted(data.reason_refusal)}
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", marginBottom: "32px", gap: "8px" }}>
          <span>(2) Certificate being revoked</span>
          {dotted(data.reason_revoked)}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginTop: "44px",
            gap: "20px",
          }}
        >
          <div style={{ width: "50%", fontWeight: 700, fontSize: "11px", lineHeight: 1.4 }}>
            Signature/Left hand Thumb impression of building worker
          </div>
          <div
            style={{
              width: "50%",
              fontWeight: 700,
              fontSize: "11px",
              textAlign: "right",
              lineHeight: 1.4,
            }}
          >
            Signature with Seal Medical Inspector/ C.M.O
          </div>
        </div>

        <div style={{ marginTop: "36px", fontSize: "11px", lineHeight: 1.45 }}>
          <div>
            <span style={{ fontWeight: 700 }}>Note :</span> 1. Exact details of cause of physical
            disability should be clearly stated.
          </div>
          <div style={{ paddingLeft: "38px" }}>
            2. Functional/productive abilities should also be stated if disability is stated.
          </div>
        </div>
      </div>

      {/* PAGE 2 — Anex-1 */}
      <div className="fitness-cert-page" style={pageStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <span style={{ fontWeight: 700, fontSize: "12px" }}>
            Medical Examination for all workmen
          </span>
          <span style={{ fontWeight: 700, fontSize: "12px" }}>Anex-1</span>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "16px" }}>
          <thead>
            <tr>
              <th style={{ ...headerCell, width: "24%" }}>Physical Examination</th>
              <th style={{ ...headerCell, width: "26%" }} />
              <th style={{ ...headerCell, width: "24%" }}>Enquiry of previous history</th>
              <th style={{ ...headerCell, width: "26%" }} />
            </tr>
          </thead>
          <tbody>
            {physicalRows.map(([prefix, label, value], index) => {
              const [hPrefix, hLabel, hValue] = historyRows[index];
              return (
                <tr key={label}>
                  <td style={cell}>
                    {prefix} {label}
                  </td>
                  <td style={cell}>{val(value)}</td>
                  <td style={cell}>
                    {hPrefix} {hLabel}
                  </td>
                  <td style={cell}>{val(hValue)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{ marginBottom: "12px" }}>
          <div style={{ fontWeight: 700, textDecoration: "underline", marginBottom: "6px" }}>
            Additional checks for Operators &amp; Drivers (As Per Bocw Act &amp; Rules)
          </div>
          <CheckLine checked={isChecked(data.op_general_physique)}>
            <span style={{ fontWeight: 700 }}>(i) General Physique;</span>
          </CheckLine>
          <CheckLine checked={isChecked(data.op_vision)}>
            <span style={{ fontWeight: 700 }}>(ii) Vision—</span> Total visual performance using
            standard orthorator like Titmus Vision Tester should be estimated and suitability for
            placement ascertaines in accordance with the prescribed job standards.
          </CheckLine>
          <CheckLine checked={isChecked(data.op_hearing)}>
            <span style={{ fontWeight: 700 }}>(iii) Hearing—</span> Persons with normal hearing must
            be able to hear a forced whisper at twenty-four feet. Person using hearing aids must be
            able to hear a warning shout under noisy working conditions.
          </CheckLine>
          <CheckLine checked={isChecked(data.op_breathing)}>
            <span style={{ fontWeight: 700 }}>(iv) Breathing—</span> Peak flow rate using standard
            peak flow meter and the average peak flow rate determined out of these readings of the
            test performed. The results recorded at pre-placement medical examination could be used
            as a standard for the same individual at the same altitude for reference during
            subsequent examination.
          </CheckLine>
          <CheckLine checked={isChecked(data.op_upper_limbs)}>
            <span style={{ fontWeight: 700 }}>(v) Upper Limbs—</span> Adequate arm function and
            grip (both arms).
          </CheckLine>
          <CheckLine checked={isChecked(data.op_lower_limbs)}>
            <span style={{ fontWeight: 700 }}>(vi) Lower Limbs—</span> Adequate leg and foot
            function.
          </CheckLine>
          <CheckLine checked={isChecked(data.op_spine)}>
            <span style={{ fontWeight: 700 }}>(vii) Spine—</span> Adequately flexible for the job
            concerned.
          </CheckLine>
          <CheckLine checked={isChecked(data.op_general_mental_alertness)}>
            <span style={{ fontWeight: 700 }}>(viii) General—</span> Mental alertness and stability
            with good eye, hand and foot coordination.
          </CheckLine>
          <TextLine>
            <span style={{ fontWeight: 700 }}>(c) Any other tests</span> which the examining doctor
            considers necessary. {underline(data.op_other_examination, "140px")}
          </TextLine>
        </div>

        <div style={{ marginBottom: "12px" }}>
          <div style={{ fontWeight: 700, textDecoration: "underline", marginBottom: "6px" }}>
            Additional checks for Food Handlers (Workmen involved in preparation &amp; supply)
          </div>
          <CheckLine checked={isChecked(data.fh_skin_diseases)}>
            Careful examination for skin diseases
          </CheckLine>
          <CheckLine checked={isChecked(data.fh_personal_hygiene)}>
            Personal hygiene such as hair, nails etc.
          </CheckLine>
          <TextLine>
            Chest X-ray if preliminary examination reveals chest congestion (Separate reports to be
            attached, if conducted) {underline(data.fh_chest_xray, "120px")}
          </TextLine>
        </div>

        <div>
          <div style={{ fontWeight: 700, textDecoration: "underline", marginBottom: "6px" }}>
            Additional checks for Welders
          </div>
          <CheckLine checked={isChecked(data.welder_respiratory_diseases)}>
            Examine &amp; check for symptoms of respiratory diseases.
          </CheckLine>
          <TextLine>
            If suspected Chest X-ray taken to confirm fitness (Separate reports to be attached, if
            conducted) {underline(data.welder_chest_xray, "120px")}
          </TextLine>
        </div>
      </div>
    </div>
  );
});

PrintFitnessCertificate.displayName = "PrintFitnessCertificate";

export default PrintFitnessCertificate;
