import React, { forwardRef, useEffect, useMemo } from "react";
import { useGetOrgProfilesQuery } from "../redux/apiSlice";
import { cookie } from "../utils/cookie";
import { formatDateTime2 } from "../utils/helper";
import { getTenantFeatures } from "../config/tenantFeatures";
import {
  translatePrescriptionForHindiPrint,
  convertAddressForHindiPrint,
} from "../utils/prescriptionHindiPrint";

/**
 * Hindi compact A4 print for configured-tenant OHC Prescription List only.
 * Independent from OhcPrescriptionPrint (English).
 */
const OhcPrescriptionPrintHindi = forwardRef(({ data }, ref) => {
  useEffect(() => {
    const id = "noto-devanagari-prescription-print";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);

  const center_id = cookie.get("center_id");
  const tenant_id = cookie.get("tenantId");
  const tenantFeatures = getTenantFeatures(tenant_id);
  const printData = useMemo(
    () => translatePrescriptionForHindiPrint(data, tenantFeatures),
    [data, tenantFeatures],
  );

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
  const address = profile?.address
    ? convertAddressForHindiPrint(profile.address)
    : "उपलब्ध नहीं";
  const contact = profile?.mobile || "उपलब्ध नहीं";

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
        <div style={{ fontSize: "15px", fontWeight: 700 }}>स्वास्थ्य केंद्र</div>
        <div style={{ fontSize: "10px", marginTop: "2px" }}>
          {address} • संपर्क: {contact}
        </div>
      </div>

      <div style={{ marginBottom: "4px" }}>
        <b>तिथि:</b> {result}
      </div>
      <div style={metaRow}>
        <span>
          <b>बिल नंबर:</b> {printData?.billNo ?? "-"}
        </span>
        <span>
          <b>यूएचआईडी:</b> {printData?.picasoId ?? "-"}
        </span>
      </div>

      <div style={dualTitle}>
        <div style={sectionTitle}>मरीज का विवरण</div>
        <div style={sectionTitle}>चिकित्सक का विवरण</div>
      </div>

      <table style={table}>
        <colgroup>
          <col style={{ width: "50%" }} />
          <col style={{ width: "50%" }} />
        </colgroup>
        <tbody>
          <tr>
            <td style={td}>
              <b>नाम</b> : {printData?.patientName || "-"}
            </td>
            <td style={td}>
              <b>चिकित्सक</b> : {printData?.doctor?.name || "-"}
            </td>
          </tr>
          <tr>
            <td style={td}>
              <b>आयु</b> : {printData?.age || "-"}
            </td>
            <td style={td}>
              <b>योग्यता</b> : {printData?.doctor?.qualification || "-"}
            </td>
          </tr>
          <tr>
            <td style={td}>
              <b>लिंग</b> : {printData?.gender || "-"}
            </td>
            <td style={td}>
              <b>पंजीकरण संख्या</b> :{" "}
              {printData?.doctor?.registration_number || "-"}
            </td>
          </tr>
          <tr>
            <td style={td}>
              <b>संपर्क</b> : {printData?.contactNo || "-"}
            </td>
            <td style={td}>
              <b>श्रेणी</b> : {printData?.patientType || "-"}
            </td>
          </tr>
        </tbody>
      </table>

      <div style={sectionTitle}>महत्वपूर्ण संकेत (वाइटल)</div>
      <table style={table}>
        <thead>
          <tr>
            {[
              "बीपी (सिस)",
              "बीपी (डाय)",
              "नाड़ी",
              "SpO₂",
              "ताप",
              "ग्लूकोज",
              "ऊँचाई",
              "वज़न",
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

      <div style={sectionTitle}>निर्धारित दवाएँ</div>
      <table style={table}>
        <thead>
          <tr>
            {[
              "क्र.",
              "नाम",
              "प्रकार",
              "मात्रा",
              "निर्देश",
              "समय",
              "दिन",
            ].map((h) => (
              <th key={h} style={th}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {printData?.adviceList?.length > 0 ? (
            printData.adviceList.map((m, i) => (
              <tr key={i}>
                <td style={tdC}>{i + 1}</td>
                <td style={tdC}>{m.item}</td>
                <td style={tdC}>{m.typeOfMedicine}</td>
                <td style={tdC}>{m.dosage}</td>
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
            ["मुख्य शिकायतें", printData?.chiefComplaints],
            ["शिकायत पर टिप्पणी", printData?.remarks],
            ["प्रयोगशाला परीक्षण", printData?.labs],
            ["अन्य प्रयोगशाला", printData?.otherLabs],
            ["अनुवर्ती (दिन)", printData?.nextFollowup],
            ["निवारक सलाह", printData?.preventiveAdvice],
            ["इतिहास", printData?.history],
            ["अन्य निर्देश", printData?.otherInstructions],
            ...(showReferral
              ? [
                  ["रेफर किया गया", printData?.referrals],
                  ["रेफरल तात्कालिकता", printData?.referralUrgency],
                  ["रेफरल का कारण", printData?.referralReason],
                  ["रेफरल परिणाम", printData?.referralOutcome],
                ]
              : []),
            ...(showFitness
              ? [["फिटनेस स्थिति", printData?.fitnessStatus]]
              : []),
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
        <div>चिकित्सक के हस्ताक्षर एवं मुहर</div>
        <div style={{ marginTop: "4px" }}>{printData?.doctor?.name || ""}</div>
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
  fontFamily: "'Noto Sans Devanagari', Arial, Helvetica, sans-serif",
  fontSize: "11px",
  lineHeight: 1.35,
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

export default OhcPrescriptionPrintHindi;