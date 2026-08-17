import React, { forwardRef } from "react";
import { useGetOrgProfilesQuery } from "../redux/apiSlice";
import { cookie } from "../utils/cookie";
import { formatDateTime2 } from "../utils/helper";

const safeFixed = (value) => Number(value || 0).toFixed(2);

const InvoiceTemplate = forwardRef(({ data }, ref) => {
  const center_id = cookie.get("center_id");
  const tenant_id = cookie.get("tenantId");

  const billDate = formatDateTime2(data?.AddedDate);

  const page = 1;
  const limit = 10;

  const filters = {
    center_id,
    tenant_id,
  };

  const { data: oragnisationData, isLoading } = useGetOrgProfilesQuery({
    page,
    limit,
    ...filters,
  });

  const profiles = oragnisationData?.data || {};
  const profile = profiles?.[0] || {};

  const BASE_URL = import.meta.env.VITE_API_URL.replace(/\/$/, "");

  const mainlogo = profile?.logo
    ? `${BASE_URL}${profile.logo}`
    : "/images/LMC_logo.webp";

  const secondaryLogo = profile?.secondary_logo
    ? `${BASE_URL}${profile.secondary_logo}`
    : null;

  const address = profile?.address || "N/A";
  const contact = profile?.mobile || "N/A";

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const services = Array.isArray(data?.opd_billing_data)
    ? data.opd_billing_data
    : [];

  return (
    <>
      <style>
        {`
          /* ============================================================
             PAGE
          ============================================================ */

          @page {
            size: A4 portrait;
            margin: 0;
          }

          * {
            box-sizing: border-box;
          }

          /* ============================================================
             MAIN INVOICE
          ============================================================ */

          .invoice-print-area {
            width: 100%;
            max-width: 210mm;
            min-height: 148.5mm;

            margin: 0 auto;
            padding: 4.5mm;

            background: #ffffff;
            color: #000000;

            font-family:
              Arial,
              Helvetica,
              sans-serif;

            font-size: 11.5px;
            line-height: 1.25;

            position: relative;
            overflow: visible;
          }

          .invoice-print-area table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }

          .invoice-print-area td,
          .invoice-print-area th {
            color: #000000;
            vertical-align: middle;
          }

          /* ============================================================
             PRINT
          ============================================================ */

          @media print {

            html,
            body {
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
              min-width: 0 !important;
              background: #ffffff !important;
            }

            /*
             * Hide everything except invoice.
             */
            body * {
              visibility: hidden;
            }

            .invoice-print-area,
            .invoice-print-area * {
              visibility: visible;
            }

            .invoice-print-area {
              position: relative !important;

              width: 100% !important;
              max-width: none !important;

              min-height: 148.5mm !important;
              height: auto !important;

              margin: 0 !important;
              padding: 4.5mm !important;

              box-sizing: border-box !important;

              overflow: visible !important;

              background: #ffffff !important;
              color: #000000 !important;

              font-size: 11.5px !important;
              line-height: 1.25 !important;

              /*
               * IMPORTANT:
               * Do not scale the invoice.
               */
              transform: none !important;
              zoom: 1 !important;

              page-break-before: avoid !important;
              page-break-after: auto !important;
              page-break-inside: auto !important;

              break-before: avoid !important;
              break-after: auto !important;
              break-inside: auto !important;
            }

            .invoice-print-area table {
              width: 100% !important;
              max-width: 100% !important;
              border-collapse: collapse !important;
              table-layout: fixed !important;
            }

            .invoice-print-area table,
            .invoice-print-area th,
            .invoice-print-area td,
            .invoice-print-area .border,
            .invoice-print-area .border-t,
            .invoice-print-area .border-b {
              border-color: #000000 !important;
            }

            .invoice-print-area,
            .invoice-print-area * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            /*
             * Keep individual rows together.
             */
            .invoice-print-area tr {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }

            /*
             * Repeat service table header on next page.
             */
            .invoice-print-area thead {
              display: table-header-group !important;
            }

            /*
             * Keep these sections together.
             */
            .invoice-patient-details,
            .invoice-bill-header,
            .invoice-summary,
            .invoice-signature,
            .invoice-footer {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }

            /*
             * Services can continue naturally.
             */
            .invoice-services {
              overflow: visible !important;

              page-break-inside: auto !important;
              break-inside: auto !important;
            }

            .invoice-print-area td,
            .invoice-print-area th {
              overflow-wrap: break-word !important;
              word-break: normal !important;
            }

            .invoice-print-area img {
              max-width: 100% !important;
            }

            .invoice-watermark {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}
      </style>

      <div
        ref={ref}
        className="
          invoice-print-area
          relative
          w-full
          max-w-[210mm]
          min-h-[148.5mm]
          mx-auto
          p-[4.5mm]
          box-border
          bg-white
          text-black
          font-sans
        "
      >
        {/* =========================================================
            WATERMARK
        ========================================================== */}

        <div
          className="invoice-watermark"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",

            transform: "translate(-50%, -50%) rotate(-45deg)",

            fontSize: "58px",
            fontWeight: "900",

            color: "#000000",
            opacity: 0.035,

            pointerEvents: "none",
            userSelect: "none",

            whiteSpace: "nowrap",

            zIndex: 0,
          }}
        >
          Last Mile Care Pvt Ltd
        </div>

        <div className="relative z-10">
          {/* =========================================================
              ORGANISATION HEADER

              Upper LMC logos intentionally removed.
          ========================================================== */}

          <div
            className="
              text-center
              mb-2
              border-b-2
              border-black
              pb-2
            "
          >
            <div className="flex items-center justify-between mb-4 ">
              <div className="flex-1 flex justify-start">
                <img
                  className="h-16 w-auto object-contain"
                  src="/images/LMC_1care_logo.webp"
                  alt="1Care Logo"
                />
              </div>

              <div className="flex-1 flex justify-center items-center gap-6">
                <img
                  src={mainlogo}
                  alt="organization logo"
                  className="h-16 w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "/images/LMC_logo.webp";
                  }}
                />

                {secondaryLogo && (
                  <img
                    src={secondaryLogo}
                    alt="secondary logo"
                    className="h-16 w-auto object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
              </div>

              {/* Second Logo */}
              <div className="flex-1 flex justify-end">
                <img
                  className="h-16 w-auto object-contain"
                  src="/images/LMC_mainlogo.webp"
                  alt="LMC Logo"
                />
              </div>
            </div>

            <div className="text-center mb-4 ">
              <h2 className="text-xl font-bold">HEALTH CENTRE</h2>

              <p className="text-sm mt-1">
                {address} • Contact: {contact}
              </p>
            </div>
          </div>

          {/* =========================================================
              INVOICE TITLE
          ========================================================== */}

          <h3
            className="
              text-center
              text-[13px]
              font-bold
              mb-2
              text-black
              tracking-wide
              underline
            "
          >
            Patient Invoice
          </h3>

          {/* =========================================================
              PATIENT DETAILS
          ========================================================== */}

          <div
            className="
              invoice-patient-details
              overflow-visible
              border-2
              border-black
              mb-2
              bg-white
            "
          >
            <table className="w-full border-collapse text-[11px]">
              <tbody>
                {/* UHID / TOKEN */}

                <tr>
                  <td
                    className="
                      border
                      border-black
                      p-[4px]
                      w-[15%]
                      font-bold
                      whitespace-nowrap
                    "
                  >
                    UHID :
                  </td>

                  <td
                    className="
                      border
                      border-black
                      p-[4px]
                      w-[35%]
                      font-semibold
                    "
                  >
                    {data?.uhid || "-"}
                  </td>

                  <td
                    className="
                      border
                      border-black
                      p-[4px]
                      w-[15%]
                      font-bold
                      whitespace-nowrap
                    "
                  >
                    Token No :
                  </td>

                  <td
                    className="
                      border
                      border-black
                      p-[4px]
                      w-[35%]
                      font-semibold
                    "
                  >
                    {data?.token || "-"}
                  </td>
                </tr>

                {/* NAME / AGE */}

                <tr>
                  <td
                    className="
                      border
                      border-black
                      p-[4px]
                      font-bold
                      whitespace-nowrap
                    "
                  >
                    Name :
                  </td>

                  <td
                    className="
                      border
                      border-black
                      p-[4px]
                      font-semibold
                    "
                  >
                    {data?.patient_name || "-"}
                  </td>

                  <td
                    className="
                      border
                      border-black
                      p-[4px]
                      font-bold
                      whitespace-nowrap
                    "
                  >
                    Age :
                  </td>

                  <td
                    className="
                      border
                      border-black
                      p-[4px]
                      font-semibold
                    "
                  >
                    {`${data?.iage ?? 0}y ${
                      data?.imonth ?? 0
                    }m ${data?.idays ?? 0}d`}
                  </td>
                </tr>

                {/* GENDER / CONSULTANT */}

                <tr>
                  <td
                    className="
                      border
                      border-black
                      p-[4px]
                      font-bold
                      whitespace-nowrap
                    "
                  >
                    Gender :
                  </td>

                  <td
                    className="
                      border
                      border-black
                      p-[4px]
                      font-semibold
                    "
                  >
                    {data?.gender || "-"}
                  </td>

                  <td
                    className="
                      border
                      border-black
                      p-[4px]
                      font-bold
                      whitespace-nowrap
                    "
                  >
                    Consultant :
                  </td>

                  <td
                    className="
                      border
                      border-black
                      p-[4px]
                      font-semibold
                    "
                  >
                    {data?.doctor_name || "-"}
                  </td>
                </tr>

                {/* ADDRESS */}

                <tr>
                  <td
                    className="
                      border
                      border-black
                      p-[4px]
                      font-bold
                      whitespace-nowrap
                    "
                  >
                    Address :
                  </td>

                  <td
                    className="
                      border
                      border-black
                      p-[4px]
                      font-semibold
                    "
                    colSpan={3}
                  >
                    {data?.localAddress || "-"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* =========================================================
              BILL HEADER
          ========================================================== */}

          <div
            className="
              invoice-bill-header
              flex
              justify-between
              items-center
              text-[11px]
              font-bold
              mb-2
              py-[4px]
              px-2
              border-2
              border-black
            "
          >
            <div>Bill No : {data?.bill_no || "-"}</div>

            <div
              className="
                font-bold
                text-[13px]
                uppercase
                underline
                tracking-wide
              "
            >
              Bill Receipt
            </div>

            <div>Bill Date : {billDate || "-"}</div>
          </div>

          {/* =========================================================
              SERVICES
          ========================================================== */}

          <div
            className="
              invoice-services
              overflow-visible
              border-2
              border-black
              mb-2
              bg-white
            "
          >
            <table
              className="
                w-full
                border-collapse
                text-[11px]
              "
            >
              <thead>
                <tr>
                  <th
                    className="
                      border
                      border-black
                      p-[4px]
                      text-center
                      font-bold
                      w-[45px]
                      whitespace-nowrap
                    "
                  >
                    SL.No
                  </th>

                  <th
                    className="
                      border
                      border-black
                      p-[4px]
                      text-left
                      font-bold
                    "
                  >
                    Particulars
                  </th>

                  <th
                    className="
                      border
                      border-black
                      p-[4px]
                      text-center
                      font-bold
                      w-[80px]
                      whitespace-nowrap
                    "
                  >
                    Charges
                  </th>

                  <th
                    className="
                      border
                      border-black
                      p-[4px]
                      text-center
                      font-bold
                      w-[55px]
                      whitespace-nowrap
                    "
                  >
                    Qty
                  </th>

                  <th
                    className="
                      border
                      border-black
                      p-[4px]
                      text-center
                      font-bold
                      w-[95px]
                      whitespace-nowrap
                    "
                  >
                    Net Total
                  </th>
                </tr>
              </thead>

              <tbody>
                {services.length > 0 ? (
                  services.map((item, idx) => (
                    <tr key={item?.ID ?? idx}>
                      <td
                        className="
                          border
                          border-black
                          p-[4px]
                          text-center
                          font-semibold
                        "
                      >
                        {idx + 1}
                      </td>

                      <td
                        className="
                          border
                          border-black
                          p-[4px]
                          font-semibold
                        "
                      >
                        {item?.ServiceName || "-"}
                      </td>

                      <td
                        className="
                          border
                          border-black
                          p-[4px]
                          text-center
                          font-semibold
                          whitespace-nowrap
                        "
                      >
                        {safeFixed(item?.ServiceAmount)}
                      </td>

                      <td
                        className="
                          border
                          border-black
                          p-[4px]
                          text-center
                          font-semibold
                        "
                      >
                        {item?.Qty ?? 0}
                      </td>

                      <td
                        className="
                          border
                          border-black
                          p-[4px]
                          text-center
                          font-bold
                          whitespace-nowrap
                        "
                      >
                        {safeFixed(
                          Number(item?.ServiceAmount || 0) *
                            Number(item?.Qty || 0),
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="
                        border
                        border-black
                        p-[5px]
                        text-center
                        font-semibold
                      "
                    >
                      No services
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* =========================================================
              SUMMARY / PAYMENT DETAILS
          ========================================================== */}

          <div
            className="
              invoice-summary
              grid
              grid-cols-2
              gap-6
              text-[11px]
            "
          >
            {/* LEFT */}

            <div className="space-y-1">
              <p>
                <span className="font-bold">Fin. Category:</span>{" "}
                <span className="font-semibold">
                  {data?.patient_type || "-"}
                </span>
              </p>

              <p>
                <span className="font-bold">Payment Mode:</span>{" "}
                <span className="font-semibold">
                  {data?.payment_mode || "-"}
                </span>
              </p>

              <p>
                <span className="font-bold">Refer From:</span>{" "}
                <span className="font-semibold">{data?.refer_to || "-"}</span>
              </p>

              <p>
                <span className="font-bold">Chief Complaint:</span>{" "}
                <span className="font-semibold">{data?.complaint || "-"}</span>
              </p>
            </div>

            {/* RIGHT */}

            <div className="space-y-1 text-right">
              <p>
                <span className="font-bold">Total Amount:</span>{" "}
                <span className="font-bold text-[12px]">
                  Rs {safeFixed(data?.TotalServiceAmount)}
                </span>
              </p>

              <p>
                <span className="font-bold">Paid Amount:</span>{" "}
                <span className="font-bold text-[12px]">
                  Rs {safeFixed(data?.PaidAmount)}
                </span>
              </p>

              <p>
                <span className="font-bold">Due Amount:</span>{" "}
                <span className="font-bold text-[12px]">
                  Rs {safeFixed(data?.DueAmount)}
                </span>
              </p>

              <p>
                <span className="font-bold">Balance Amount:</span>{" "}
                <span className="font-bold text-[12px]">
                  Rs {safeFixed(data?.balanceAmount)}
                </span>
              </p>

              <div
                className="
                  border-t
                  border-black
                  my-1.5
                "
              />

              <p>
                <span className="font-bold">Cash Amount:</span>{" "}
                <span className="font-bold text-[12px]">
                  Rs {safeFixed(data?.CashAmount)}
                </span>
              </p>

              <p>
                <span className="font-bold">UPI/Online:</span>{" "}
                <span className="font-bold text-[12px]">
                  Rs {safeFixed(data?.CardAmount)}
                </span>
              </p>
            </div>
          </div>

          {/* =========================================================
              SIGNATURE
          ========================================================== */}

          <div
            className="
              invoice-signature
              text-right
              mt-3
              mb-0.5
            "
          >
            <p className="font-bold text-[11px]">Signature</p>

            <div
              className="
                inline-block
                w-[100px]
                border-b-2
                border-black
                mt-3
              "
            />
          </div>

          {/* =========================================================
              FOOTER
          ========================================================== */}

          <div
            className="
              invoice-footer
              grid
              grid-cols-2
              text-[9px]
              italic
              text-black
              border-t-2
              border-black
              pt-1.5
              mt-1.5
            "
          >
            <p>Powered By : Last Mile Care</p>

            <p className="text-right">Prepared By : {data?.added_by || "-"}</p>
          </div>
        </div>
      </div>
    </>
  );
});

export default InvoiceTemplate;
