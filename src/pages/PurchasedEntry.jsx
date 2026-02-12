import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  PlusIcon,
  ArrowPathIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { healthAlerts } from "../utils/healthSwal";

/* ---------- Reusable UI Components ---------- */
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
        ${readOnly ? "bg-sky-50 cursor-not-allowed" : ""}
        ${className}
      `}
    />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const NumericInput = ({ label, ...props }) => (
  <Input
    {...props}
    label={label}
    type="number"
    inputMode="numeric"
    onKeyDown={(e) => {
      if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
    }}
  />
);

const Select = ({ label, children, error, className = "", ...props }) => (
  <div className="mb-2">
    {label && <label className="text-sm text-gray-600 block mb-1">{label}</label>}
    <select {...props} className={`${baseInput} border-gray-300 ${className}`}>
      {children}
    </select>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const Button = ({ variant = "sky", children, className = "", ...props }) => {
  const variants = {
    sky: `${baseBtn} bg-sky-600 text-white hover:bg-sky-700`,
    gray: `${baseBtn} bg-gray-100 text-gray-700 hover:bg-gray-200`,
  };
  return (
    <button {...props} className={`${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

/* ---------- MAIN COMPONENT ---------- */
const PurchasedEntry = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("grn");

  // Stock State
  const [stockFilters, setStockFilters] = useState({
    invoiceNo: "",
    supplier: "",
    itemType: "",
    itemName: "",
    dateFrom: "",
    dateTo: "",
  });
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

  const ITEM_TYPES = [
    "DROP", "SYRUP", "SUSPENSION", "TABLET", "CAPSULE", "CREAM",
    "OINTMENT", "MOUTH GEL", "SPRAY", "INJECTION", "IV",
    "OTHERS", "SHAMPOO", "POWDER", "LOTION", "JELLY", "SOLUTION", "SYRINGE"
  ];
  const validationSchema = Yup.object({
    invoiceDate: Yup.string().required("Required"),
    invoiceNo: Yup.string().required("Required"),
    supplier: Yup.string().required("Required"),
  });

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
      unitStrip: "",
      qtyPerStrip: "",
      recvQty: "",
      freeQty: "",
      cp: "",
      mrp: "",
      discountPer: "",
      cgstPer: "",
      sgstPer: "",

      // computed fields – initial value 0 (number)
      cpQty: 0,
      mrpQty: 0,
      totalCp: 0,
      totalMrp: 0,
      cgstAmt: 0,
      sgstAmt: 0,
    },
    validationSchema,
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
        items: values.items.map((item) => ({
          ...item,
          recvQty: Number(item.recvQty),
          freeQty: Number(item.freeQty || 0),
          cp: Number(item.cp),
          mrp: Number(item.mrp),
          discountPer: Number(item.discountPer),
          cgstPer: Number(item.cgstPer),
          sgstPer: Number(item.sgstPer),
        })),
      };

      
      console.log("✅ GRN PAYLOAD READY FOR API", payload);
      healthAlerts.success("GRN Saved Successfully", "Inventory");
      formik.resetForm();
    },
  });

  // Auto-calc Received Quantity
  useEffect(() => {
    const unit = Number(formik.values.unitStrip || 0);
    const qty = Number(formik.values.qtyPerStrip || 0);
    const total = unit * qty;
    formik.setFieldValue("recvQty", total > 0 ? total : "");
  }, [formik.values.unitStrip, formik.values.qtyPerStrip]);

  // Auto-calc Financials
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

  // ---------- ✅ FIXED: Item validation manually ----------
  const handleAddItem = () => {
    const v = formik.values;
    const requiredFields = [
      { field: "itemName", label: "Item Name" },
      { field: "batchNo", label: "Batch No" },
      { field: "mfgDate", label: "Mfg Date" },
      { field: "expiryDate", label: "Expiry Date" },
      { field: "unitStrip", label: "Unit / Strip" },
      { field: "qtyPerStrip", label: "Qty / Unit" },
      { field: "cp", label: "CP / Unit" },
      { field: "mrp", label: "MRP / Unit" },
      { field: "discountPer", label: "Discount %" },
      { field: "cgstPer", label: "CGST %" },
      { field: "sgstPer", label: "SGST %" },
    ];

    for (let req of requiredFields) {
      const val = v[req.field];
      if (val === undefined || val === null || val === "") {
        healthAlerts.error(`${req.label} is required`, "Item");
        return;
      }
    }

    
    const freeStrips = Number(v.freeQty || 0);
    const freePieces = freeStrips * Number(v.qtyPerStrip || 0);

    const recvQtyNum = Number(v.recvQty);
    const cpNum = Number(v.cp);
    const mrpNum = Number(v.mrp || 0);
    const discountPerNum = Number(v.discountPer || 0);
    const cgstPerNum = Number(v.cgstPer || 0);
    const sgstPerNum = Number(v.sgstPer || 0);

    const totalCp = recvQtyNum * cpNum;
    const discountAmt = (totalCp * discountPerNum) / 100;
    const taxable = totalCp - discountAmt;
    const cgstAmt = (taxable * cgstPerNum) / 100;
    const sgstAmt = (taxable * sgstPerNum) / 100;
    const totalGst = cgstAmt + sgstAmt;
    const total = taxable + totalGst;

    const newItem = {
      itemName: v.itemName,
      batchNo: v.batchNo,
      mfgDate: v.mfgDate,
      expiryDate: v.expiryDate,
      recvQty: recvQtyNum,
      freeQty: freePieces,
      unitStrip: v.unitStrip,
      qtyPerStrip: v.qtyPerStrip,
      cp: cpNum,
      mrp: mrpNum,
      discountPer: discountPerNum,
      discountAmt,
      cgstPer: cgstPerNum,
      sgstPer: sgstPerNum,
      cgstAmt,
      sgstAmt,
      totalGst,
      totalCp,
      total,
    };

    formik.setFieldValue("items", [...formik.values.items, newItem]);

    // Clear item fields
    [
      "itemName", "batchNo", "mfgDate", "expiryDate",
      "unitStrip", "qtyPerStrip", "recvQty", "freeQty",
      "cp", "mrp", "discountPer", "cgstPer", "sgstPer"
    ].forEach((f) => formik.setFieldValue(f, ""));
  };

  // GRN Totals
  const totals = formik.values.items.reduce(
    (acc, i) => {
      acc.qty += i.recvQty;
      acc.freeQty += i.freeQty || 0;
      acc.totalCp += i.totalCp;
      acc.discount += i.discountAmt;
      acc.gst += i.totalGst;
      acc.grand += i.total;
      return acc;
    },
    { qty: 0, freeQty: 0, totalCp: 0, discount: 0, gst: 0, grand: 0 }
  );

  // Stock Handlers
  const handleStockSearch = () => {
    console.log("Stock filters applied:", stockFilters);
    setStockSummary({
      totalCp: "12,450.00",
      totalMrp: "18,200.00",
      recvQty: "1,250",
      freeQty: "120",
      salesAmount: "5,670.00",
      balanceQty: "1,130",
      salesQty: "120",
      remainingCp: "6,780.00",
      condQty: "0",
    });
  };

  const handleStockReset = () => {
    setStockFilters({
      invoiceNo: "", supplier: "", itemType: "", itemName: "", dateFrom: "", dateTo: "",
    });
    setStockSummary({
      totalCp: "", totalMrp: "", recvQty: "", freeQty: "", salesAmount: "",
      balanceQty: "", salesQty: "", remainingCp: "", condQty: "",
    });
  };

  const handleStockPrint = () => {
    console.log("Print stock summary", stockSummary);
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 bg-white p-6 rounded-2xl shadow border">
      {/* Tab Switcher */}
      <div className="flex justify-center mb-4">
        <div className="flex border border-sky-500 rounded-md overflow-hidden bg-white">
          <button
            type="button"
            onClick={() => setActiveTab("grn")}
            className={`px-6 py-2 text-sm font-semibold transition
              ${activeTab === "grn" ? "bg-sky-600 text-white" : "text-sky-700 hover:bg-sky-100"}`}
          >
            GRN Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("stock")}
            className={`px-6 py-2 text-sm font-semibold transition
              ${activeTab === "stock" ? "bg-sky-600 text-white" : "text-sky-700 hover:bg-sky-100"}`}
          >
            Stock Details
          </button>
        </div>
      </div>

      {/* ----- GRN TAB ----- */}
      {activeTab === "grn" && (
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-bold text-sky-700 text-center mb-6">
            📦 Goods Received Note (GRN)
          </h2>

          {/* GRN Header */}
          <section>
            <h3 className="text-sky-700 font-semibold mb-3">GRN Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Input
                type="date"
                label="Invoice Date"
                required
                error={formik.touched.invoiceDate && formik.errors.invoiceDate}
                {...formik.getFieldProps("invoiceDate")}
              />
              <Input
                label="Invoice No"
                required
                error={formik.touched.invoiceNo && formik.errors.invoiceNo}
                {...formik.getFieldProps("invoiceNo")}
              />
              <Input
                label="Supplier"
                required
                error={formik.touched.supplier && formik.errors.supplier}
                {...formik.getFieldProps("supplier")}
              />
              <Input label="HSN" {...formik.getFieldProps("hsn")} />
              <Select label="Item Type" {...formik.getFieldProps("itemType")}>
                <option value="">-- Select --</option>
                <option>Medicine</option>
                <option>Consumable</option>
              </Select>
              <Input label="Rack No" {...formik.getFieldProps("rackNo")} />
            </div>
          </section>

          {/* Item Entry */}
          <section>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sky-700 font-semibold">Item Entry</h3>
              <Button type="button" onClick={() => navigate("/items-master")}>
                <PlusIcon className="w-4 h-4 inline mr-1" /> Add New Item
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              
              <Input
                label="Item Name"
                required
                {...formik.getFieldProps("itemName")}
              />
              <Input
                label="Batch No"
                required
                {...formik.getFieldProps("batchNo")}
              />
              <Input
                type="date"
                label="Mfg Date"
                required
                {...formik.getFieldProps("mfgDate")}
              />
              <Input
                type="date"
                label="Expiry Date"
                required
                {...formik.getFieldProps("expiryDate")}
              />
              <NumericInput
                label="Unit / Strip"
                required
                {...formik.getFieldProps("unitStrip")}
              />
              <NumericInput
                label="Qty / Unit"
                required
                {...formik.getFieldProps("qtyPerStrip")}
              />
              <Input
                label="Total Recv. Qty"
                value={formik.values.recvQty}
                readOnly
              />
              <NumericInput
                label="Free Qty (Strips)"
                {...formik.getFieldProps("freeQty")}
              />
              <NumericInput
                label="CP / Unit"
                required
                {...formik.getFieldProps("cp")}
              />
              <NumericInput
                label="MRP / Unit"
                required
                {...formik.getFieldProps("mrp")}
              />
              <NumericInput
                label="Discount %"
                required
                {...formik.getFieldProps("discountPer")}
              />
              <NumericInput
                label="CGST %"
                required
                {...formik.getFieldProps("cgstPer")}
              />
              <NumericInput
                label="SGST %"
                required
                {...formik.getFieldProps("sgstPer")}
              />
              <Input
                label="C.P / Qty"
                value={formik.values.cpQty}
                readOnly
              />
              <Input
                label="M.R.P / Qty"
                value={formik.values.mrpQty}
                readOnly
              />
              <Input
                label="Total C.P"
                value={formik.values.totalCp.toFixed(2)}
                readOnly
              />
              <Input
                label="Total M.R.P"
                value={formik.values.totalMrp.toFixed(2)}
                readOnly
              />
              <Input
                label="CGST Amount"
                value={formik.values.cgstAmt.toFixed(2)}
                readOnly
              />
              <Input
                label="SGST Amount"
                value={formik.values.sgstAmt.toFixed(2)}
                readOnly
              />
            </div>

            <Button type="button" onClick={handleAddItem} className="mt-4">
              <PlusIcon className="w-4 h-4 inline mr-1" /> Add Item
            </Button>
          </section>

          {/* Items Table */}
          {formik.values.items.length > 0 && (
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-sky-100 text-sky-700">
                  <tr>
                    <th className="border px-2 py-2 text-left">Item</th>
                    <th className="border px-2 py-2 text-center">Batch</th>
                    <th className="border px-2 py-2 text-right">Qty</th>
                    <th className="border px-2 py-2 text-right">Total C.P</th>
                    <th className="border px-2 py-2 text-right">GST</th>
                    <th className="border px-2 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {formik.values.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="border px-2 py-2">{item.itemName}</td>
                      <td className="border px-2 py-2 text-center">{item.batchNo}</td>
                      <td className="border px-2 py-2 text-right">{item.recvQty}</td>
                      <td className="border px-2 py-2 text-right">
                        ₹ {item.totalCp.toFixed(2)}
                      </td>
                      <td className="border px-2 py-2 text-right">
                        ₹ {item.totalGst.toFixed(2)}
                      </td>
                      <td className="border px-2 py-2 text-right font-semibold">
                        ₹ {item.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Totals */}
          <section className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <Input label="Total Qty" value={totals.qty} readOnly />
            <Input label="Total C.P" value={totals.totalCp.toFixed(2)} readOnly />
            <Input label="Discount Amount" value={totals.discount.toFixed(2)} readOnly />
            <Input label="Total GST Amount" value={totals.gst.toFixed(2)} readOnly />
            <Input label="Grand Total" value={totals.grand.toFixed(2)} readOnly />
          </section>

          {/* Actions */}
          <div className="flex justify-center gap-4 pt-4 border-t">
            <Button type="submit">
              <CheckCircleIcon className="w-5 h-5 inline mr-1" /> Save
            </Button>
            <Button type="button" variant="gray" onClick={formik.resetForm}>
              <ArrowPathIcon className="w-5 h-5 inline mr-1" /> Reset
            </Button>
          </div>
        </form>
      )}

      {/* ----- STOCK TAB ----- */}
      {activeTab === "stock" && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-sky-700 text-center mb-6">📊 Stock Details</h2>
          {/* Filters */}
          <section className="bg-sky-50 border rounded-xl p-4">
            <h3 className="text-sky-700 font-semibold mb-3">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Input label="Invoice No" value={stockFilters.invoiceNo}
                onChange={(e) => setStockFilters({...stockFilters, invoiceNo: e.target.value})} />
              <Select label="Supplier Name" value={stockFilters.supplier}
                onChange={(e) => setStockFilters({...stockFilters, supplier: e.target.value})}>
                <option value="">-- All --</option>
                <option>Supplier 1</option><option>Supplier 2</option>
              </Select>
              <Select label="Item Type" value={stockFilters.itemType}
                onChange={(e) => setStockFilters({...stockFilters, itemType: e.target.value})}>
                <option value="">-- All --</option>
                {ITEM_TYPES.map(t => <option key={t}>{t}</option>)}
              </Select>
              <Input label="Item Name" value={stockFilters.itemName}
                onChange={(e) => setStockFilters({...stockFilters, itemName: e.target.value})} />
              <Input type="date" label="Date From" value={stockFilters.dateFrom}
                onChange={(e) => setStockFilters({...stockFilters, dateFrom: e.target.value})} />
              <Input type="date" label="Date To" value={stockFilters.dateTo}
                onChange={(e) => setStockFilters({...stockFilters, dateTo: e.target.value})} />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button type="button" onClick={handleStockSearch}>Search</Button>
              <Button type="button" variant="gray" onClick={handleStockReset}>Cancel</Button>
              <Button type="button" variant="gray" onClick={handleStockPrint}>Print</Button>
            </div>
          </section>
          {/* Stock Summary */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
          <div className="flex justify-end mt-6">
            <Button>Update</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchasedEntry;