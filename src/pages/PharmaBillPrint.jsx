import React, { forwardRef } from "react";
import { cookie } from "../utils/cookie";
import { cleanCurrency } from "../utils/helper";
const PharmaInvoicePrint = forwardRef(({ data }, ref) => {
  const username = cookie.get("username");
  if (!data) return null;

  const header = data;
  const items = data.footerItems || [];

  function formatToIST(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }
  function formatExpiry(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);

    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      month: "short",
      year: "2-digit",
    });
  }
  const billDate = formatToIST(header.AddedDate);
  const add = import.meta.env.VITE_CENTER_ADD;
  const mobile = import.meta.env.VITE_CENTER_MOBILE;
  return (
    <div
      ref={ref}
      style={{
        width: "210mm",
        padding: "15mm",
        fontFamily: "Arial",
        fontSize: "12px",
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

      <hr />

      {/* TOP DETAILS */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 10,
        }}
      >
        <div>
          <div>
            <b>GST :</b> {`02AAECL5886P1Z7`}{" "}
            {/* Hardcoded as per GSTIN search */}
          </div>
          <div>
            <b>Bill No :</b> {header.BillNo}
          </div>
          <div>
            <b>UHID :</b> {header.PicasoID}
          </div>
          <div>
            <b>Name :</b> {header.CustommerName}
          </div>
          <div>
            <b>Mobile :</b> {header.Mobileno}
          </div>
        </div>

        <div>
          <div>
            <b>Licence :</b> {`MCDS1234E56789`}{" "}
            {/* Hardcoded as per GSTIN search */}
          </div>
          <div>
            <b>Date :</b> {billDate}
          </div>
          <div>
            <b>Age :</b> {header.Ages}
          </div>
          <div>
            <b>OPD Bill No :</b> {header.OPDBillNo}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <table
        style={{ width: "100%", borderCollapse: "collapse", marginTop: 15 }}
      >
        <thead>
          <tr>
            {[
              "Sl.",
              "Description",
              "Qty",
              "HSN Code",
              "Expiry On",
              "Rate",
              "Taxable",
              "Total",
            ].map((h) => (
              <th key={h} style={th}>
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {items.map((item, index) => (
            <tr key={item.BillFooterID}>
              <td style={tdCenter}>{index + 1}</td>
              <td style={td}>{item.ItemName}</td>
              <td style={tdCenter}>{item.IssueQty}</td>
              <td style={tdCenter}>{item.HSNCode}</td>
              <td style={tdCenter}>{formatExpiry(item.ExpiryDate)}</td>
              <td style={tdCenter}>{cleanCurrency(item.Rate)}</td>
              <td style={tdCenter}>{cleanCurrency(item.TaxableAmount)}</td>
              <td style={tdCenter}>{cleanCurrency(item.NetAmount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* TOTAL QTY */}
      <div style={{ textAlign: "center", marginTop: 5 }}>
        <b>Total</b> {header.TotalQty}
      </div>

      {/* SUMMARY */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 20,
        }}
      >
        <div>
          <div>
            <b>Fin. Category :</b> {header.PatientType}
          </div>
          <div>
            <b>Payment Mode :</b> {header.PayMode}
          </div>

          <div style={{ marginTop: 15 }}>
            <b>Note :</b>
            <div>
              Goods once sold cannot be return back or exchanged after 7 days of
              purchase.
            </div>
          </div>
          <div style={{ marginTop: 15 }}>
            <b>Prepared By :</b>
            {username || "Admin"}
          </div>
        </div>

        <div style={{ width: 300 }}>
          {[
            ["Gross Amount (Rs.)", cleanCurrency(header.GrossAmount)],
            ["Add CGST (Rs.)", cleanCurrency(header.CGSTAmount)],
            ["Add SGST (Rs.)", cleanCurrency(header.SGSTAmount)],
            ["Taxable Amount (Rs.)", cleanCurrency(header.TaxableAmount)],
            ["Total Amount (Rs.)", cleanCurrency(header.TotalAmount)],
            ["Disc. Amount (Rs.)", cleanCurrency(header.DiscountAmount)],
            ["Paid Amount (Rs.)", cleanCurrency(header.PaidAmount)],
            ["Due Amount (Rs.)", cleanCurrency(header.DueAmount)],
            ["Cash Amount (Rs.)", cleanCurrency(header.CashAmount)],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <span>{label}</span>
              <span>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 40,
        }}
      >
        <div>{formatToIST(new Date())}</div>
        <div>
          {" "}
          <b>This is a Computer Generated Invoice</b>
        </div>
        <div>Powered By : Last Mile Care</div>
      </div>
    </div>
  );
});

const th = {
  border: "1px solid black",
  padding: "5px",
  textAlign: "center",
};

const td = {
  border: "1px solid black",
  padding: "5px",
};

const tdCenter = {
  border: "1px solid black",
  padding: "5px",
  textAlign: "center",
};

export default PharmaInvoicePrint;
