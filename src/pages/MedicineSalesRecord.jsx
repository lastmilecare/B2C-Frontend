import React, { useState, useMemo } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  ArrowPathIcon,
  PrinterIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

import {
  useSearchUHIDQuery,
  useLazyGetMedicineSalesQuery,
  useGetComboQuery,
} from "../redux/apiSlice";

/* ================== COMMON UI (SAME AS PATIENT PAGE) ================== */

const baseInput =
  "border rounded-lg px-3 py-2 w-full text-sm focus:ring-2 focus:ring-sky-400 focus:outline-none";
const baseBtn =
  "px-4 py-2 rounded-lg text-sm font-medium focus:ring-2 focus:ring-offset-2";

const Input = ({ label, required, error, ...props }) => (
  <div>
    <label className="text-sm text-gray-600 block mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      {...props}
      className={`${baseInput} ${
        error ? "border-red-500" : "border-gray-300"
      }`}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div>
    <label className="text-sm text-gray-600 block mb-1">{label}</label>
    <select {...props} className={baseInput}>
      {children}
    </select>
  </div>
);

const Button = ({ variant = "sky", children, ...props }) => {
  const map = {
    sky: `${baseBtn} bg-sky-600 text-white hover:bg-sky-700`,
    gray: `${baseBtn} bg-gray-100 text-gray-700 hover:bg-gray-200`,
  };
  return (
    <button {...props} className={map[variant]}>
      {children}
    </button>
  );
};

/* ================== PAGE ================== */

const MedicineSalesRecord = () => {
  const [searchSales, { data, isFetching }] =
    useLazyGetMedicineSalesQuery();

  const [selectedUHID, setSelectedUHID] = useState("");

  /* ---------- Patient Auto Suggest ---------- */
  const { data: patientList } = useSearchUHIDQuery(selectedUHID, {
    skip: selectedUHID.length < 2,
  });

  /* ---------- Issued By Combo ---------- */
  const { data: staffList } = useGetComboQuery("STAFF");

  /* ---------- Formik ---------- */
  const formik = useFormik({
    initialValues: {
      patientName: "",
      medicineName: "",
      startDate: "",
      endDate: "",
      issuedBy: "",
    },
    validationSchema: Yup.object({}),
    onSubmit: (values) => {
      searchSales({
        patientName: values.patientName,
        medicineName: values.medicineName,
        startDate: values.startDate,
        endDate: values.endDate,
        issuedBy: values.issuedBy,
      });
    },
  });

  /* ---------- Table Data ---------- */
  const records = data?.data || [];

  /* ---------- Totals ---------- */
  const totals = useMemo(() => {
    let qty = 0,
      amount = 0;
    records.forEach((r) => {
      qty += Number(r.qty || 0);
      amount += Number(r.netAmount || 0);
    });
    return { qty, amount };
  }, [records]);

  return (
    <div className="max-w-7xl mx-auto mt-8 bg-white p-6 rounded-2xl shadow border">
      <h2 className="text-2xl font-bold text-sky-700 text-center mb-6">
        💊 Medicine Sales Record
      </h2>

      {/* ================= FILTER ================= */}
      <form
        onSubmit={formik.handleSubmit}
        className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6"
      >
        {/* Patient Name */}
        <div className="relative md:col-span-2">
          <Input
            label="Patient Name"
            value={formik.values.patientName}
            onChange={(e) => {
              formik.setFieldValue("patientName", e.target.value);
              setSelectedUHID(e.target.value);
            }}
          />

          {patientList?.data?.length > 0 && (
            <ul className="absolute z-10 bg-white border rounded shadow w-full">
              {patientList.data.map((p) => (
                <li
                  key={p.uhid}
                  className="px-3 py-2 text-sm hover:bg-sky-50 cursor-pointer"
                  onClick={() => {
                    formik.setFieldValue("patientName", p.name);
                    setSelectedUHID("");
                  }}
                >
                  {p.name} ({p.uhid})
                </li>
              ))}
            </ul>
          )}
        </div>

        <Input
          label="Medicine Name"
          {...formik.getFieldProps("medicineName")}
        />

        <Input
          label="Date From"
          type="date"
          {...formik.getFieldProps("startDate")}
        />

        <Input
          label="Date To"
          type="date"
          {...formik.getFieldProps("endDate")}
        />

        <Select
          label="Issued By"
          {...formik.getFieldProps("issuedBy")}
        >
          <option value="">-- All --</option>
          {staffList?.data?.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>

        {/* Buttons */}
        <div className="md:col-span-5 flex justify-end gap-3">
          <Button type="submit">
            <MagnifyingGlassIcon className="w-4 h-4 inline mr-1" />
            Search
          </Button>
          <Button
            type="button"
            variant="gray"
            onClick={formik.resetForm}
          >
            <ArrowPathIcon className="w-4 h-4 inline mr-1" />
            Reset
          </Button>
          <Button type="button" variant="gray" onClick={window.print}>
            <PrinterIcon className="w-4 h-4 inline mr-1" />
            Print
          </Button>
        </div>
      </form>

      {/* ================= TABLE ================= */}
      <div className="border rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-sky-50 text-sky-700">
            <tr>
              <th>SL</th>
              <th>Bill No</th>
              <th>UHID</th>
              <th>Customer</th>
              <th>Fin Cat</th>
              <th>Item</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Net</th>
              <th>Issued By</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {isFetching ? (
              <tr>
                <td colSpan="11" className="text-center p-4">
                  Loading...
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan="11" className="text-center p-4 text-gray-500">
                  No records found
                </td>
              </tr>
            ) : (
              records.map((r, i) => (
                <tr key={i} className="border-t">
                  <td>{i + 1}</td>
                  <td>{r.billNo}</td>
                  <td>{r.uhid}</td>
                  <td>{r.customerName}</td>
                  <td>{r.finCategory}</td>
                  <td>{r.itemName}</td>
                  <td>{r.qty}</td>
                  <td>{r.rate}</td>
                  <td>{r.netAmount}</td>
                  <td>{r.issuedBy}</td>
                  <td>{r.billDate}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ================= TOTAL ================= */}
      <div className="mt-4 text-right font-semibold text-sky-700">
        Total Quantity: {totals.qty} | Total Bill Amount: ₹
        {totals.amount.toFixed(2)}
      </div>
    </div>
  );
};

export default MedicineSalesRecord;
