import React, { useMemo, useState } from "react";
import { useFormik } from "formik";
import { ArrowPathIcon, PrinterIcon } from "@heroicons/react/24/outline";
import { useGetInventoryQuery } from "../redux/apiSlice";
import * as XLSX from "xlsx";

/* ================== UI CLASSES ================== */
const baseInput =
  "border rounded-lg px-3 py-2 w-full text-sm focus:ring-2 focus:ring-sky-400 focus:outline-none";

/* ================== COMPONENT ================== */
const ExpiryItems = () => {
  const [filters, setFilters] = useState({});

  const { data, isLoading } = useGetInventoryQuery(filters);

  /* ================== EXPIRED LOGIC ================== */
  const expiredItems = useMemo(() => {
    if (!data?.data) return [];
    const today = new Date();
    return data.data.filter(
      (item) => new Date(item.expiryDate) < today
    );
  }, [data]);

  /* ================== FORMIK ================== */
  const formik = useFormik({
    initialValues: {
      fromDate: "",
      toDate: "",
    },
    onSubmit: (values) => {
      setFilters(values); // backend filters (optional)
    },
  });

  /* ================== EXPORT TO EXCEL ================== */
  const handleExportExcel = () => {
    if (!expiredItems.length) {
      alert("No expired medicines available");
      return;
    }

    const excelData = expiredItems.map((item, index) => ({
      "SL No": index + 1,
      "Batch No": item.batchNo,
      "Supplier Name": item.supplierName,
      "Receipt No": item.receiptNo,
      "Item Name": item.itemName,
      "C.P Rate": item.cpRate,
      "MRP": item.mrp,
      "Expiry Date": item.expiryDate,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Expired Medicines"
    );

    XLSX.writeFile(workbook, "Expired_Medicines_Report.xlsx");
  };

  return (
    <div className="max-w-6xl mx-auto mt-8 bg-white p-6 rounded-2xl shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold text-sky-700 mb-6 text-center">
        💊 Expired Medicines Report
      </h2>

      <form
        onSubmit={formik.handleSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5"
      >
        <input
          type="date"
          {...formik.getFieldProps("fromDate")}
          className={baseInput}
        />

        <input
          type="date"
          {...formik.getFieldProps("toDate")}
          className={baseInput}
        />

        <button
          type="submit"
          className="bg-sky-600 text-white rounded-lg px-4 py-2 hover:bg-sky-700"
        >
          Search
        </button>
      </form>

    
      <div className="flex justify-end mb-3">
        <button
          onClick={handleExportExcel}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
        >
          <PrinterIcon className="w-4 h-4" />
          Export to Excel / Print
        </button>
      </div>

    
      <div className="overflow-x-auto">
        {isLoading ? (
          <p className="text-center text-sky-600 font-medium">
            Loading expired medicines...
          </p>
        ) : expiredItems.length === 0 ? (
          <p className="text-center text-gray-500">
            No expired medicines found
          </p>
        ) : (
          <table className="w-full border border-gray-200 text-sm">
            <thead className="bg-sky-50 text-sky-700">
              <tr>
                <th className="border px-2 py-2">SL</th>
                <th className="border px-2">Batch No</th>
                <th className="border px-2">Supplier</th>
                <th className="border px-2">Receipt No</th>
                <th className="border px-2">Item Name</th>
                <th className="border px-2">C.P</th>
                <th className="border px-2">MRP</th>
                <th className="border px-2">Expiry Date</th>
              </tr>
            </thead>

            <tbody>
              {expiredItems.map((item, index) => (
                <tr
                  key={item.id}
                  className="text-center hover:bg-red-50"
                >
                  <td className="border px-2 py-1">{index + 1}</td>
                  <td className="border px-2">{item.batchNo}</td>
                  <td className="border px-2">{item.supplierName}</td>
                  <td className="border px-2">{item.receiptNo}</td>
                  <td className="border px-2 font-semibold text-red-600">
                    {item.itemName}
                  </td>
                  <td className="border px-2">{item.cpRate}</td>
                  <td className="border px-2">{item.mrp}</td>
                  <td className="border px-2 text-red-600 font-bold">
                    {item.expiryDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    
      <div className="flex justify-center mt-6">
        <button
          onClick={() => formik.resetForm()}
          className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200"
        >
          <ArrowPathIcon className="w-4 h-4" />
          Reset
        </button>
      </div>
    </div>
  );
};

export default ExpiryItems;
