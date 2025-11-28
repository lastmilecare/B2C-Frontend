import React, { forwardRef } from "react";

const safeFixed = (value) => Number(value || 0).toFixed(2);

const InvoiceTemplate = forwardRef(({ data }, ref) => {
  const add = import.meta.env.VITE_CENTER_ADD;
  const mobile = import.meta.env.VITE_CENTER_MOBILE;
  const center = import.meta.env.VITE_CENTER_NAME;
  const billDate = data?.AddedDate
    ? new Date(new Date(data.AddedDate).getTime() + 5.5 * 60 * 60 * 1000)
      .toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      })
    : "";

  return (
    <div
      ref={ref}
      className="relative w-[700px] mx-auto p-16 print:p-4 text-[11px] text-black font-sans bg-white"
    >

      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 pointer-events-none select-none z-0">
        <p className="text-[60px] font-extrabold text-gray-400 opacity-10 tracking-widest">
          Last Mile Care
        </p>
      </div>

      {/* MAIN CONTENT WRAPPER */}
      <div className="relative z-10">
        {/* Header */}
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

        {/* Section Title */}
        <h3 className="text-center text-[12px] font-bold mb-3 text-[#1A73E8] tracking-wide underline">
          Patient Invoice ({center})
        </h3>

        {/* Patient Details Table */}
        <div className="rounded-md overflow-hidden shadow-sm border border-gray-300 mb-4 bg-white">
          <table className="w-full border-collapse text-[11px]">
            <tbody>
              <tr className="bg-gray-50">
                <td className="border p-2 w-28 font-semibold">UHID :</td>
                <td className="border p-2">{data?.uhid}</td>
                <td className="border p-2 w-28 font-semibold">Token No :</td>
                <td className="border p-2">{data?.token}</td>
              </tr>
              <tr>
                <td className="border p-2 w-28 font-semibold">Name :</td>
                <td className="border p-2">{data?.patient_name}</td>
                <td className="border p-2 w-28 font-semibold">Age :</td>
                <td className="border p-2">{data?.age}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border p-2 w-28 font-semibold">Gender :</td>
                <td className="border p-2">{data?.gender}</td>
                <td className="border p-2 w-28 font-semibold">Consultant :</td>
                <td className="border p-2">Dr. {data?.doctor_name}</td>
              </tr>
              <tr>
                <td className="border p-2 w-28 font-semibold">Address :</td>
                <td className="border p-2" colSpan={3}>
                  {data?.localAddressDistrict}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bill Header Row */}
        <div className="flex justify-between items-center text-[11px] font-semibold mb-3 py-2 px-3 border border-gray-300 rounded-md shadow-sm bg-gray-50">
          <div>Bill No : {data?.bill_no || ""}</div>
          <div className="text-[#1A73E8] font-bold text-[12px] uppercase tracking-wide">
            Bill Receipt
          </div>
          <div>Bill Date: {billDate}</div>
        </div>

        {/* Items Table */}
        <div className="rounded-md shadow-sm overflow-hidden border border-gray-300 mb-4 bg-white">
          <table className="w-full border-collapse text-[11px]">
            <thead className="bg-[#1A73E8] text-white">
              <tr>
                <th className="border p-2 text-left w-[50px]">SL.No</th>
                <th className="border p-2 text-left">Particulars</th>
                <th className="border p-2 text-center w-[70px]">Charges</th>
                <th className="border p-2 text-center w-[50px]">Qty</th>
                <th className="border p-2 text-center w-[90px]">Net Total</th>
              </tr>
            </thead>
            <tbody>
              {(data?.opd_billing_data || []).map((item, idx) => (
                <tr key={idx} className="odd:bg-white even:bg-gray-50">
                  <td className="border p-2 text-center">{idx + 1}</td>
                  <td className="border p-2">{item?.ServiceName}</td>
                  <td className="border p-2 text-center">{safeFixed(item?.ServiceAmount)}</td>
                  <td className="border p-2 text-center">{item?.Qty}</td>
                  <td className="border p-2 text-center">{safeFixed(item?.ServiceAmount * item?.Qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Details */}
        <div className="grid grid-cols-2 gap-4 text-[11px]">
          <div className="space-y-1">
            <p><span className="font-semibold">Fin. Category:</span> {data?.patient_type}</p>
            <p><span className="font-semibold">Payment Mode:</span> {data?.payment_mode}</p>
            <p><span className="font-semibold">Refer From:</span> {data?.referFrom}</p>
            <p><span className="font-semibold">Chief Complaint:</span> {data?.complaint}</p>
            <p><span className="font-semibold">Remarks:</span> {data?.Remarks || "just for testing"}</p>
          </div>

          <div className="space-y-1 text-right">
            <p><span className="font-semibold">Total Amount:</span> Rs {safeFixed(data?.TotalServiceAmount)}</p>
            <p><span className="font-semibold">Balance Amount:</span> Rs {safeFixed(data?.balanceAmount)}</p>
            <p><span className="font-semibold">Paid Amount:</span> Rs {safeFixed(data?.PaidAmount)}</p>
            <p><span className="font-semibold">Due Amount:</span> Rs {safeFixed(data?.DueAmount)}</p>

            <hr className="my-2" />

            <p><span className="font-semibold">Cash Amount:</span> Rs {safeFixed(data?.CashAmount)}</p>
            <p><span className="font-semibold">UPI/Online:</span> Rs {safeFixed(data?.CardAmount)}</p>
          </div>
        </div>

        {/* Signature */}
        <div className="text-right mt-16 mb-4">
          <p className="font-semibold text-[12px]">Signature</p>
        </div>

        {/* Footer */}
        <div className="grid grid-cols-2 text-[10px] italic text-gray-600 mt-6 border-t pt-2">
          <p>Powered By : Last Mile Care</p>
          <p className="text-right">Prepared By : {data?.added_by}</p>
        </div>
      </div>
    </div>
  );
});

export default InvoiceTemplate;
