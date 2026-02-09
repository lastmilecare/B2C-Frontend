import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  PlusIcon,
  ArrowPathIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { healthAlerts } from "../utils/healthSwal";
import { useState, useEffect } from "react";
const baseInput =
  "border rounded-lg px-3 py-2 w-full text-sm focus:ring-2 focus:ring-sky-400 focus:outline-none";
const baseBtn =
  "px-4 py-2 rounded-lg text-sm font-medium focus:ring-2 focus:ring-offset-2";

const Input = ({ label, required, error, readOnly, className = "", ...props }) => (
  <div className="mb-2">
    {label && (
      <label className="text-sm text-gray-600 block mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    <input
      {...props}
      readOnly={readOnly}
      className={`
        ${baseInput}
        ${error ? "border-red-500" : "border-gray-300"}
        ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}
        ${className}
      `}
    />


    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div className="mb-2">
    <label className="text-sm text-gray-600 block mb-1">{label}</label>
    <select {...props} className={`${baseInput} border-gray-300`}>
      {children}
    </select>
  </div>
);

const Button = ({ variant = "sky", children, ...props }) => {
  const variants = {
    sky: `${baseBtn} bg-sky-600 text-white hover:bg-sky-700`,
    gray: `${baseBtn} bg-gray-100 text-gray-700 hover:bg-gray-200`,
  };
  return (
    <button {...props} className={variants[variant]}>
      {children}
    </button>
  );
};
const NumericInput = ({ label, ...props }) => (
  <Input
    {...props}
    label={label}
    type="number"
    inputMode="numeric"
    onKeyDown={(e) => {
      if (
        ["e", "E", "+", "-",].includes(e.key)
      ) {
        e.preventDefault();
      }
    }}
  />
);


/* ================= MAIN COMPONENT ================= */
const PurchasedEntry = () => {
  const ITEM_TYPES = [
    "DROP", "SYRUP", "SUSPENSION", "TABLET", "CAPSULE", "CREAM",
    "OINTMENT", "MOUTH GEL", "SPRAY", "INJECTION", "IV",
    "OTHERS", "SHAMPOO", "POWDER", "LOTION", "JELLY", "SOLUTION", "SYRINGE"
  ];
  const [stockSummary, setStockSummary] = useState({
    totalCp: "",
    totalMrp: "",
    recvQty: "",
    freeQty: "",
    salesAmount: "",
    balanceQty: "",
    salesQty: "",
    remainingCp: "",
    condQty: "",
  });


  const [activeTab, setActiveTab] = useState("grn");
  const formik = useFormik({
    initialValues: {
      invoiceDate: "",
      invoiceNo: "",
      supplier: "",
      hsn: "",
      itemType: "",
      rackNo: "",
      items: [],
      itemName: "",
      batchNo: "",
      mfgDate: "",
      expiryDate: "",
      recvQty: "",
      unitStrip: "",
      qtyPerStrip: "",
      freeQty: "",
      cp: "",
      mrp: "",
      discountPer: "",
      cgstPer: "",
      sgstPer: "",
      cpQty: "",
      mrpQty: "",
      totalCp: "",
      totalMrp: "",
      cgstAmt: "",
      sgstAmt: "",
    },

    validationSchema: Yup.object({
      invoiceDate: Yup.string().required("Required"),
      invoiceNo: Yup.string().required("Required"),
      supplier: Yup.string().required("Required"),
      itemName: Yup.string().required("Required"),
      mfgDate: Yup.string().required("Required"),
      expiryDate: Yup.string().required("Required"),
      recvQty: Yup.string().required("Required"),
      unitStrip: Yup.string().required("Required"),
      qtyPerStrip: Yup.string().required("Required"),
      mrp: Yup.string().required("Required"),
      discountPer: Yup.string().required("Required"),
      cgstPer: Yup.string().required("Required"),
      sgstPer: Yup.string().required("Required"),
    }),

    onSubmit: (values) => {
      if (values.items.length === 0) {
        healthAlerts.error("Add at least one item", "GRN");
        return;
      }

      const payload = {
        invoiceDate: values.invoiceDate,
        invoiceNo: values.invoiceNo,
        supplier: values.supplier,
        hsn: values.hsn,
        itemType: values.itemType,
        rackNo: values.rackNo,
        items: values.items,
      };

      console.log("FINAL GRN PAYLOAD", payload);
      healthAlerts.success("GRN Saved Successfully", "Inventory");
      formik.resetForm();
    },
  });
  useEffect(() => {
    const unit = Number(formik.values.unitStrip || 0);
    const qty = Number(formik.values.qtyPerStrip || 0);

    const total = unit * qty;

    formik.setFieldValue(
      "recvQty",
      total > 0 ? total : ""
    );
  }, [formik.values.unitStrip, formik.values.qtyPerStrip]);
  useEffect(() => {
    const qty = Number(formik.values.recvQty || 0);
    const cp = Number(formik.values.cp || 0);
    const mrp = Number(formik.values.mrp || 0);
    const cgstPer = Number(formik.values.cgstPer || 0);
    const sgstPer = Number(formik.values.sgstPer || 0);

    const totalCp = qty * cp;
    const totalMrp = qty * mrp;

    const cgstAmt = (totalCp * cgstPer) / 100;
    const sgstAmt = (totalCp * sgstPer) / 100;

    formik.setFieldValue("cpQty", cp);
    formik.setFieldValue("mrpQty", mrp);
    formik.setFieldValue("totalCp", totalCp);
    formik.setFieldValue("totalMrp", totalMrp);
    formik.setFieldValue("cgstAmt", cgstAmt);
    formik.setFieldValue("sgstAmt", sgstAmt);
  }, [
    formik.values.recvQty,
    formik.values.cp,
    formik.values.mrp,
    formik.values.cgstPer,
    formik.values.sgstPer,
  ]);



  /* ================= ADD ITEM ================= */
  const handleAddItem = () => {
    const v = formik.values;

    if (!v.itemName || !v.batchNo || !v.recvQty || !v.cp) {
      healthAlerts.error("Item Name, Batch, Qty & CP required", "Item");
      return;
    }

    const totalCp = v.recvQty * v.cp;
    const discountAmt = (totalCp * (v.discountPer || 0)) / 100;
    const taxable = totalCp - discountAmt;
    const cgstAmt = (taxable * (v.cgstPer || 0)) / 100;
    const sgstAmt = (taxable * (v.sgstPer || 0)) / 100;
    const totalGst = cgstAmt + sgstAmt;
    const total = taxable + totalGst;

    const newItem = {
      itemName: v.itemName,
      batchNo: v.batchNo,
      mfgDate: v.mfgDate,
      expiryDate: v.expiryDate,
      recvQty: Number(v.recvQty),
      freeQty: Number(v.freeQty || 0),
      unitStrip: v.unitStrip,
      qtyPerStrip: v.qtyPerStrip,
      cp: Number(v.cp),
      mrp: Number(v.mrp || 0),
      discountPer: Number(v.discountPer || 0),
      discountAmt,
      cgstPer: Number(v.cgstPer || 0),
      sgstPer: Number(v.sgstPer || 0),
      cgstAmt,
      sgstAmt,
      totalGst,
      totalCp,
      total,
      cpQty: v.cp,
      mrpQty: v.mrp,
    };

    formik.setFieldValue("items", [...formik.values.items, newItem]);

    [
      "itemName",
      "batchNo",
      "mfgDate",
      "expiryDate",
      "recvQty",
      "freeQty",
      "unitStrip",
      "qtyPerStrip",
      "cp",
      "mrp",
      "discountPer",
      "cgstPer",
      "sgstPer",
    ].forEach((f) => formik.setFieldValue(f, ""));
  };

  /* ================= TOTALS ================= */
  const totals = formik.values.items.reduce(
    (acc, i) => {
      acc.qty += i.recvQty;
      acc.freeQty += i.freeQty || 0;
      acc.totalCp += i.totalCp;
      acc.discount += i.discountAmt;
      acc.gst += i.totalGst;
      acc.grand += i.total;
      acc.salesQty += i.recvQty; // dummy (will come from API)
      acc.condQty += 0;          // dummy (will come from API)
      return acc;
    },
    {
      qty: 0,
      freeQty: 0,
      totalCp: 0,
      discount: 0,
      gst: 0,
      grand: 0,
      salesQty: 0,
      condQty: 0,
    }
  );


  return (
    <div className="max-w-7xl mx-auto mt-8 bg-white p-6 rounded-2xl shadow border">


      <div className="flex justify-center mb-4">
        <div className="flex border border-sky-500 rounded-md overflow-hidden bg-white">
          <button
            type="button"
            onClick={() => setActiveTab("grn")}
            className={`px-6 py-2 text-sm font-semibold transition
            ${activeTab === "grn"
                ? "bg-sky-600 text-white"
                : "text-sky-700 hover:bg-sky-100"
              }`}
          >
            GRN Details
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("stock")}
            className={`px-6 py-2 text-sm font-semibold transition
            ${activeTab === "stock"
                ? "bg-sky-600 text-white"
                : "text-sky-700 hover:bg-sky-100"
              }`}
          >
            Stock Details
          </button>
        </div>
      </div>


      <h2 className="text-2xl font-bold text-sky-700 text-center mb-6">
        📦 Goods Received Note (GRN)
      </h2>

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {activeTab === "grn" && (
          <>
            {/* INVOICE */}
            <section>
              <h3 className="text-sky-700 font-semibold mb-3">GRN Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Input type="date" label="Invoice Date" required {...formik.getFieldProps("invoiceDate")} />
                <Input label="Invoice No" required {...formik.getFieldProps("invoiceNo")} />
                <Input label="Supplier" required {...formik.getFieldProps("supplier")} />
                <Input label="HSN" {...formik.getFieldProps("hsn")} />
                <Select label="Item Type" {...formik.getFieldProps("itemType")}>
                  <option value="">-- Select --</option>
                  <option>Medicine</option>
                  <option>Consumable</option>
                </Select>
                <Input label="Rack No" {...formik.getFieldProps("rackNo")} />
              </div>
            </section>

            {/* ITEM ENTRY */}
            <section>
              <h3 className="text-sky-700 font-semibold mb-3">Item Entry</h3>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                <Input label="Item Name" {...formik.getFieldProps("itemName")} />
                <Input label="Batch No" {...formik.getFieldProps("batchNo")} />
                <Input type="date" label="Mfg Date" {...formik.getFieldProps("mfgDate")} />
                <Input type="date" label="Expiry Date" {...formik.getFieldProps("expiryDate")} />
                <NumericInput label="Unit / Strip" {...formik.getFieldProps("unitStrip")} />
                <NumericInput label="Qty / Unit" {...formik.getFieldProps("qtyPerStrip")} />
                <Input label="Total Recv. Qty" {...formik.getFieldProps("recvQty")} readOnly />
                {/* <NumericInput label="Free Qty" {...formik.getFieldProps("freeQty")} /> */}
                <NumericInput
                  label="Free Qty"
                  {...formik.getFieldProps("freeQty")}
                  onBlur={(e) => {
                    const freeQty = Number(e.target.value || 0);
                    const qtyPerUnit = Number(formik.values.qtyPerStrip || 0);

                    if (freeQty > 0 && qtyPerUnit > 0) {
                      formik.setFieldValue("freeQty", freeQty * qtyPerUnit);
                    }
                  }}
                />

                <NumericInput label="CP / Unit" {...formik.getFieldProps("cp")} />
                <NumericInput label="MRP / Unit" {...formik.getFieldProps("mrp")} />
                <NumericInput label="Discount %" {...formik.getFieldProps("discountPer")} />
                <NumericInput label="CGST %" {...formik.getFieldProps("cgstPer")} />
                <NumericInput label="SGST %" {...formik.getFieldProps("sgstPer")} />
                <Input label="C.P / Qty" value={formik.values.cpQty} readOnly />
                <Input label="M.R.P / Qty" value={formik.values.mrpQty} readOnly />

                <Input label="Total C.P" value={formik.values.totalCp} readOnly />
                <Input label="Total M.R.P" value={formik.values.totalMrp} readOnly />

                <Input label="CGST Amount" value={formik.values.cgstAmt} readOnly />
                <Input label="SGST Amount" value={formik.values.sgstAmt} readOnly />

              </div>

              <Button type="button" onClick={handleAddItem}>
                <PlusIcon className="w-4 h-4 inline mr-1" /> Add Item
              </Button>
            </section>

            {/* ITEM LIST */}
            {formik.values.items.length > 0 && (
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-sky-100 text-sky-700">
                    <tr>
                      <th className="border px-2 py-2 text-left w-[20%]">Item</th>
                      <th className="border px-2 py-2 text-center w-[10%]">Batch</th>
                      <th className="border px-2 py-2 text-right w-[10%]">Qty</th>
                      <th className="border px-2 py-2 text-right w-[15%]">Total C.P</th>
                      <th className="border px-2 py-2 text-right w-[15%]">GST</th>
                      <th className="border px-2 py-2 text-right w-[15%]">Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {formik.values.items.map((i, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="border px-2 py-2 text-left">{i.itemName}</td>
                        <td className="border px-2 py-2 text-center">{i.batchNo}</td>
                        <td className="border px-2 py-2 text-right">{i.recvQty}</td>
                        <td className="border px-2 py-2 text-right">
                          ₹ {i.totalCp.toFixed(2)}
                        </td>
                        <td className="border px-2 py-2 text-right">
                          ₹ {i.totalGst.toFixed(2)}
                        </td>
                        <td className="border px-2 py-2 text-right font-semibold">
                          ₹ {i.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TOTALS */}
            <section className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <Input label="Total Qty" value={totals.qty} readOnly />
              <Input label="Total C.P" value={totals.totalCp.toFixed(2)} readOnly />
              <Input label="Discount Amount" value={totals.discount.toFixed(2)} readOnly />
              <Input label="Total GST Amount" value={totals.gst.toFixed(2)} readOnly />
              <Input label="Grand Total" value={totals.grand.toFixed(2)} readOnly />
            </section>

            {/* ACTION */}
            <div className="flex justify-center gap-4 pt-4 border-t">
              <Button type="submit">
                <CheckCircleIcon className="w-5 h-5 inline mr-1" /> Save
              </Button>
              <Button type="button" variant="gray" onClick={formik.resetForm}>
                <ArrowPathIcon className="w-5 h-5 inline mr-1" /> Reset
              </Button>
            </div>
          </>
        )}
        {activeTab === "stock" && (
          <>
            {/* ===== STOCK FILTERS ===== */}
            <section className="bg-sky-50 border rounded-xl p-4">
              <h3 className="text-sky-700 font-semibold mb-3">Stock Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Input label="Invoice No" />

                <Select label="Supplier Name">
                  <option value="">-- All --</option>
                  <option>Supplier 1</option>
                  <option>Supplier 2</option>
                </Select>

                <Select label="Item Type">
                  <option value="">-- All --</option>
                  {ITEM_TYPES.map(t => <option key={t}>{t}</option>)}
                </Select>

                <Input label="Item Name" />
                <Input type="date" label="Date From" />
                <Input type="date" label="Date To" />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <Button
                  type="button"
                  onClick={() =>
                    setStockSummary({
                      totalCp: "—",
                      totalMrp: "—",
                      recvQty: "—",
                      freeQty: "—",
                      salesAmount: "—",
                      balanceQty: "—",
                      salesQty: "—",
                      remainingCp: "—",
                      condQty: "—",
                    })
                  }
                >
                  Search
                </Button>

                <Button
                  type="button"
                  variant="gray"
                  onClick={() =>
                    setStockSummary({
                      totalCp: "",
                      totalMrp: "",
                      recvQty: "",
                      freeQty: "",
                      salesAmount: "",
                      balanceQty: "",
                      salesQty: "",
                      remainingCp: "",
                      condQty: "",
                    })
                  }
                >
                  Cancel
                </Button>

                <Button variant="gray">Print</Button>
              </div>
            </section>

            {/* ===== STOCK SUMMARY (100% MATCH) ===== */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-6">
              <Input label="Total Cost Price (₹)" value={stockSummary.totalCp} readOnly />
              <Input label="Total MRP (₹)" value={stockSummary.totalMrp} readOnly />
              <Input label="Total Recv. Quantity" value={stockSummary.recvQty} readOnly />
              <Input label="Total Recv. Free Quantity" value={stockSummary.freeQty} readOnly />

              <Input label="Total Sales Amount (₹)" value={stockSummary.salesAmount} readOnly />
              <Input label="Total Balance Quantity" value={stockSummary.balanceQty} readOnly />
              <Input label="Total Sales Quantity" value={stockSummary.salesQty} readOnly />
              <Input label="Remaining Cost Price (₹)" value={stockSummary.remainingCp} readOnly />

              <Input label="Total Cond. Quantity" value={stockSummary.condQty} readOnly />

            </section>

            {/* ===== UPDATE BUTTON ===== */}
            <div className="flex justify-end mt-6">
              <Button>Update</Button>
            </div>
          </>
        )}


      </form>
    </div>

  );
};

export default PurchasedEntry;