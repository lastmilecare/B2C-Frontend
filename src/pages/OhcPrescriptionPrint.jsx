import React, { forwardRef } from "react";
import { useGetOrgProfilesQuery } from "../redux/apiSlice";
import { cookie } from "../utils/cookie";
import { formatDateTime2 } from "../utils/helper";
import { getTenantFeatures } from "../config/tenantFeatures";

/**
 * Compact one-page A4 print for configured-tenant OHC Prescription List only.
 * Does not replace shared PrescriptionPrint used by other tenants/screens.
 */
const OhcPrescriptionPrint = forwardRef(({ data }, ref) => {
  const center_id = cookie.get("center_id");
  const tenant_id = cookie.get("tenantId");
  const tenantFeatures = getTenantFeatures(tenant_id);

  const { data: oragnisationData, isLoading } = useGetOrgProfilesQuery({
    page: 1,
    limit: 10,
    center_id,
    tenant_id,
  });
  const profile = oragnisationData?.data?.[0] || {};
  const result = formatDateTime2(data?.addedDate);

  const BASE_URL = String(import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  const mainlogo = profile?.logo
    ? `${BASE_URL}${profile.logo}`
    : "/images/LMC_logo.webp";
  const secondaryLogo = profile?.secondary_logo
    ? `${BASE_URL}${profile.secondary_logo}`
    : null;
  const address = profile?.address || "N/A";
  const contact = profile?.mobile || "N/A";

  if (isLoading && !profile?.id) {
    return <div>Loading...</div>;
  }

  const showHb = tenantFeatures.enableHemoglobin;
  const showReferral = tenantFeatures.enableStructuredReferral;
  const showFitness = tenantFeatures.enableFitnessStatus;

  return (
    <div ref={ref} style={root}>
      <div style={logoRow}>
        <img src="/images/LMC_1care_logo.webp" alt="1Care" style={logoImg} />
        <div style={logoCenter}>
          <img
            src={mainlogo}
            alt="org"
            style={logoImg}
            onError={(e) => {
              e.currentTarget.src = "/images/LMC_logo.webp";
            }}
          />
          {secondaryLogo ? (
            <img
              src={secondaryLogo}
              alt="secondary"
              style={logoImg}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : null}
        </div>
        <img src="/images/LMC_mainlogo.webp" alt="LMC" style={logoImg} />
      </div>

      <div style={headerBlock}>
        <div style={{ fontSize: "15px", fontWeight: 700 }}>HEALTH CENTRE</div>
        <div style={{ fontSize: "10px", marginTop: "2px" }}>
          {address} • Contact: {contact}
        </div>
      </div>

      <div style={{ marginBottom: "4px" }}>
        <b>Date:</b> {result}
      </div>
      <div style={metaRow}>
        <span>
          <b>Bill No:</b> {data?.billNo ?? "-"}
        </span>
        <span>
          <b>UHID:</b> {data?.picasoId ?? "-"}
        </span>
      </div>

      <div style={dualTitle}>
        <div style={sectionTitle}>PATIENT DETAILS</div>
        <div style={sectionTitle}>DOCTOR DETAILS</div>
      </div>

      <table style={table}>
        <colgroup>
          <col style={{ width: "50%" }} />
          <col style={{ width: "50%" }} />
        </colgroup>
        <tbody>
          <tr>
            <td style={td}>
              <b>Name</b> : {data?.patientName || "-"}
            </td>
            <td style={td}>
              <b>Doctor</b> : {data?.doctor?.name || "-"}
            </td>
          </tr>
          <tr>
            <td style={td}>
              <b>Age</b> : {data?.age || "-"}
            </td>
            <td style={td}>
              <b>Qualification</b> : {data?.doctor?.qualification || "-"}
            </td>
          </tr>
          <tr>
            <td style={td}>
              <b>Gender</b> : {data?.gender || "-"}
            </td>
            <td style={td}>
              <b>Reg No</b> : {data?.doctor?.registration_number || "-"}
            </td>
          </tr>
          <tr>
            <td style={td}>
              <b>Contact</b> : {data?.contactNo || "-"}
            </td>
            <td style={td}>
              <b>Category</b> : {data?.patientType || "-"}
            </td>
          </tr>
        </tbody>
      </table>

      <div style={sectionTitle}>VITALS</div>
      <table style={table}>
        <thead>
          <tr>
            {[
              "BP Sys",
              "BP Dia",
              "Pulse",
              "SpO₂",
              "Temp",
              "Glucose",
              "Ht",
              "Wt",
              ...(showHb ? ["Hb"] : []),
            ].map((h) => (
              <th key={h} style={th}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={tdC}>{data?.bpSystolic ?? "-"}</td>
            <td style={tdC}>{data?.bpDiastolic ?? "-"}</td>
            <td style={tdC}>{data?.pulseRate ?? "-"}</td>
            <td style={tdC}>{data?.spo2 ?? "-"}</td>
            <td style={tdC}>{data?.temperature ?? "-"}</td>
            <td style={tdC}>{data?.glucose ?? "-"}</td>
            <td style={tdC}>{data?.height ?? "-"}</td>
            <td style={tdC}>{data?.weight ?? "-"}</td>
            {showHb ? <td style={tdC}>{data?.haemoglobin ?? "-"}</td> : null}
          </tr>
        </tbody>
      </table>

      <div style={sectionTitle}>PRESCRIBED MEDICINES</div>
      <table style={table}>
        <thead>
          <tr>
            {["S.no", "Name", "Type", "Dosage", "Instruction", "Time", "Days"].map(
              (h) => (
                <th key={h} style={th}>
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {data?.adviceList?.length > 0 ? (
            data.adviceList.map((m, i) => (
              <tr key={i}>
                <td style={tdC}>{i + 1}</td>
                <td style={tdC}>{m.item}</td>
                <td style={tdC}>{m.typeOfMedicine}</td>
                <td style={tdC}>
                  {m.typeOfMedicine?.toLowerCase() === "syrup"
                    ? `${m.dosage} mL`
                    : m.dosage}
                </td>
                <td style={tdC}>{m.remarks}</td>
                <td style={tdC}>{m.pillsConsumption}</td>
                <td style={tdC}>{m.duration}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td style={tdC} colSpan={7}>
                -
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <table style={{ ...table, border: "none", marginTop: "6px" }}>
        <colgroup>
          <col style={{ width: "28%" }} />
          <col style={{ width: "72%" }} />
        </colgroup>
        <tbody>
          {[
            ["Chief Complaints", data?.chiefComplaints],
            ["Complaint Remarks", data?.remarks],
            ["Lab Tests", data?.labs],
            ["Other Lab", data?.otherLabs],
            ["Follow-up (Days)", data?.nextFollowup],
            ["Preventive Advice", data?.preventiveAdvice],
            ["History", data?.history],
            ["Other Instructions", data?.otherInstructions],
            ...(showReferral
              ? [
                  ["Referred To", data?.referrals],
                  ["Referral Urgency", data?.referralUrgency],
                  ["Referral Reason", data?.referralReason],
                  ["Referral Outcome", data?.referralOutcome],
                ]
              : []),
            ...(showFitness ? [["Fitness Status", data?.fitnessStatus]] : []),
          ].map(([label, val]) => (
            <tr key={label}>
              <td
                style={{
                  ...tdPlain,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  width: "28%",
                }}
              >
                {label}
              </td>
              <td style={tdPlain}>: {val || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={signBlock}>
        <div>Doctor&apos;s Sign &amp; Stamp</div>
        <div style={{ marginTop: "4px" }}>{data?.doctor?.name || ""}</div>
      </div>
    </div>
  );
});

const root = {
  width: "190mm",
  maxWidth: "190mm",
  margin: "0 auto",
  padding: "0",
  boxSizing: "border-box",
  fontFamily: "Arial, Helvetica, sans-serif",
  fontSize: "11px",
  lineHeight: 1.3,
  color: "#000",
  background: "#fff",
};

const logoRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "6px",
};

const logoCenter = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const logoImg = {
  height: "42px",
  width: "auto",
  maxWidth: "120px",
  objectFit: "contain",
};

const headerBlock = {
  textAlign: "center",
  borderBottom: "1px solid #333",
  paddingBottom: "4px",
  marginBottom: "6px",
};

const metaRow = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "4px",
};

const dualTitle = {
  display: "flex",
  gap: "8px",
};

const sectionTitle = {
  flex: 1,
  margin: "6px 0 3px",
  fontSize: "12px",
  fontWeight: 700,
  color: "#00397A",
  borderBottom: "1px solid #4A6FA1",
  paddingBottom: "2px",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  tableLayout: "fixed",
  marginBottom: "4px",
};

const th = {
  border: "1px solid #000",
  padding: "3px 2px",
  background: "#EDF5FF",
  fontWeight: 700,
  textAlign: "center",
  fontSize: "9px",
  wordBreak: "break-word",
};

const td = {
  border: "1px solid #000",
  padding: "3px 4px",
  verticalAlign: "top",
  fontSize: "10px",
  wordBreak: "break-word",
};

const tdC = {
  ...td,
  textAlign: "center",
};

const tdPlain = {
  border: "none",
  padding: "2px 0",
  verticalAlign: "top",
  fontSize: "10px",
  wordBreak: "break-word",
};

const signBlock = {
  textAlign: "right",
  marginTop: "22px",
  fontWeight: 700,
  fontSize: "11px",
};

export default OhcPrescriptionPrint;
