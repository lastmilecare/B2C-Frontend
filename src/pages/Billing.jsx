import React, { useState, useEffect } from "react";
import { useFormik, FieldArray, FormikProvider } from "formik";
import {
  TrashIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  PrinterIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusIcon
} from "@heroicons/react/24/outline";
import {
  useSearchOpdBillNoQuery,
  useLazyGetBillingByBillNoQuery,
  useGetInventoryQuery,
  useCreateMedicineBillMutation,
  useGetComboQuery,
  useGetMedicineSalesQuery,
  useDeleteOpdBillMutation,
} from "../redux/apiSlice";
import useDebounce from "../hooks/useDebounce";
import { healthAlert } from "../utils/healthSwal";

/* ================= COMMON UI COMPONENTS ================= */
const baseInput = "border border-gray-300 rounded-lg px-3 py-1.5 w-full text-sm focus:ring-2 focus:ring-sky-400 focus:outline-none transition-all";
const labelStyle = "text-sm text-gray-600 block mb-1";

const Input = ({ label, required, error, ...props }) => (
  <div className="mb-1">
    {label && (
      <label className={labelStyle}>
        {label} {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    <input
      {...props}
      className={`${baseInput} ${props.readOnly ? "bg-sky-50 cursor-not-allowed" : "bg-white"} ${error ? "border-red-500" : ""}`} />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div className="mb-1">
    {label && <label className={labelStyle}>{label}</label>}
    <select {...props} className={baseInput}>
      {children}
    </select>
  </div>
);

const Button = ({ variant = "sky", children, ...props }) => {
  const variants = {
    sky: "bg-sky-600 text-white hover:bg-sky-700 px-4 py-1.5 rounded-lg text-sm font-medium transition shadow-md flex items-center gap-2",
    gray: "bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-1.5 rounded-lg text-sm font-medium transition",
  };
  return <button {...props} className={variants[variant]}>{children}</button>;
};

const Billing = () => {
  const [activeTab, setActiveTab] = useState("billing");
  const [billSearch, setBillSearch] = useState("");
  const debouncedBill = useDebounce(billSearch, 500);
  const [itemSearch, setItemSearch] = useState("");
  const debouncedItem = useDebounce(itemSearch, 500);
  const [filters, setFilters] = useState({
    billNo: "",
    patientName: "",
    startDate: "",
    endDate: "",
    status: "Active"
  });
  const { data: billingList, refetch: refetchList } = useGetMedicineSalesQuery({
    billNumber: filters.billNo,
    patientName: filters.patientName,
    startDate: filters.startDate,
    endDate: filters.endDate
  });

  const [deleteBill] = useDeleteOpdBillMutation();
  const { data: billSuggestions = [] } = useSearchOpdBillNoQuery(debouncedBill, { skip: debouncedBill.length < 1 });
  const [triggerGetBillDetails] = useLazyGetBillingByBillNoQuery();
  const { data: inventoryItems = [] } = useGetInventoryQuery({ name: debouncedItem }, { skip: debouncedItem.length < 1 });
  const { data: paymodes } = useGetComboQuery("paymode");
  const [createMedicineBill, { isLoading: isSaving }] = useCreateMedicineBillMutation();

  const formik = useFormik({
    initialValues: {
      opdBillNo: "", patientName: "", age: "", sex: "", uhid: "", contactNo: "", finCategory: "",
      itemName: "", cp: "", mrp: "", discountPercent: 0, billNo: 0, quantity: "",
      cgst: 0, sgst: 0, items: [],
      totalQuantity: 0, totalDiscount: 0, grossAmount: 0, cgstAmount: 0, sgstAmount: 0,
      taxableAmount: 0, totalAmount: 0, paidAmount: 0, dueAmount: 0, payMode: "",
    },
    onSubmit: async (values) => {
      console.log("Submitting Billing Form Data:", values);
      if (values.items.length === 0) return healthAlert({ title: "Empty", text: "Please add items first", icon: "warning" });
      try {
        await createMedicineBill(values).unwrap();
        healthAlert({ title: "Success", text: "Bill Saved Successfully", icon: "success" });
        formik.resetForm(); setBillSearch("");
        refetchList();
      } catch (err) {
        healthAlert({ title: "Error", text: err.data?.message || "Failed to save bill", icon: "error" });
      }
    }
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleBillSelect = async (billNo) => {
    setBillSearch(billNo);
    const res = await triggerGetBillDetails(billNo).unwrap();
    if (res) {
      formik.setValues({
        ...formik.values,
        opdBillNo: res.bill_no, patientName: res.patient_name, uhid: res.uhid,
        age: res.age || "", sex: res.gender || "", contactNo: res.contactNumber || "",
        finCategory: res.category === "1" ? "BPL" : "APL",
      });
    }
  };

  const handleItemSelect = (item) => {
    formik.setFieldValue("itemName", item.name);
    formik.setFieldValue("cp", item.cost_price || 0);
    formik.setFieldValue("mrp", item.mrp || 0);
    formik.setFieldValue("cgst", item.cgst || 0);
    formik.setFieldValue("sgst", item.sgst || 0);
    setItemSearch("");
  };

  const addItemToList = () => {
    if (!formik.values.itemName || !formik.values.quantity) return;
    const qty = Number(formik.values.quantity);
    const rate = Number(formik.values.mrp);
    const discAmt = (rate * qty * Number(formik.values.discountPercent)) / 100;
    const taxable = (rate * qty) - discAmt;
    const cgstAmt = (taxable * formik.values.cgst) / 100;
    const sgstAmt = (taxable * formik.values.sgst) / 100;

    const newItem = {
      description: formik.values.itemName, qty, batchNo: "A24AM390", hsn: "3004", expDate: "01-10-2026",
      saleRate: rate, discAmt, cgstPercent: formik.values.cgst, sgstPercent: formik.values.sgst,
      cgstAmt, sgstAmt, taxableAmt: taxable, total: taxable + cgstAmt + sgstAmt,
      uhid: formik.values.uhid, opdBillNo: formik.values.opdBillNo
    };
    formik.setFieldValue("items", [...formik.values.items, newItem]);
    formik.setFieldValue("itemName", ""); formik.setFieldValue("quantity", "");
  };

  useEffect(() => {
    let totals = formik.values.items.reduce((acc, i) => ({
      qty: acc.qty + i.qty, disc: acc.disc + i.discAmt, cgst: acc.cgst + i.cgstAmt,
      sgst: acc.sgst + i.sgstAmt, gross: acc.gross + i.total
    }), { qty: 0, disc: 0, cgst: 0, sgst: 0, gross: 0 });

    formik.setValues({
      ...formik.values,
      totalQuantity: totals.qty,
      totalAmount: totals.gross.toFixed(2),
      grossAmount: totals.gross.toFixed(2),
      cgstAmount: totals.cgst.toFixed(2),
      sgstAmount: totals.sgst.toFixed(2),
      totalDiscount: totals.disc.toFixed(2),
      taxableAmount: (totals.gross - totals.cgst - totals.sgst).toFixed(2),
      paidAmount: totals.gross.toFixed(2)
    });
  }, [formik.values.items]);

  useEffect(() => {
    formik.setFieldValue("dueAmount", (Number(formik.values.totalAmount) - Number(formik.values.paidAmount)).toFixed(2));
  }, [formik.values.paidAmount, formik.values.totalAmount]);

  return (
    <div className="max-w-[98%] mx-auto mt-6 bg-white p-4 rounded-xl shadow-lg border">
      {/* Toggle Bar */}
      <div className="flex justify-center mb-4">
        <div className="flex border border-sky-500 rounded-md overflow-hidden shadow-sm">
          <button type="button" onClick={() => setActiveTab("billing")} className={`px-8 py-1.5 text-xs font-bold transition ${activeTab === "billing" ? "bg-sky-600 text-white" : "text-sky-700 hover:bg-sky-50"}`}>Billing Forn</button>
          <button type="button" onClick={() => setActiveTab("history")} className={`px-8 py-1.5 text-xs font-bold transition ${activeTab === "history" ? "bg-sky-600 text-white" : "text-sky-700 hover:bg-sky-50"}`}>Billing List</button>
        </div>
      </div>

      {activeTab === "billing" ? (
        <FormikProvider value={formik}>
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <h2 className="text-lg font-bold text-sky-700 text-center uppercase border-b pb-2">💳 Medicine Billing Form</h2>

            {/* Detailed Patient Fields */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Input label="OPD Bill No *" value={billSearch} onChange={(e) => setBillSearch(e.target.value)} placeholder="Search..." />
                {billSuggestions.length > 0 && (
                  <ul className="absolute z-50 bg-white border rounded shadow-lg w-full mt-[-8px] max-h-40 overflow-auto">
                    {billSuggestions.map(b => (<li key={b.bill_no} onClick={() => handleBillSelect(b.bill_no)} className="p-2 hover:bg-sky-50 cursor-pointer text-[11px] border-b">{b.bill_no} - {b.patient_name}</li>))}
                  </ul>
                )}
              </div>
              <Input label="Name" {...formik.getFieldProps("patientName")} readOnly className="bg-gray-50 border rounded px-2 py-1.5 w-full text-xs" />
              <Input label="UHID" {...formik.getFieldProps("uhid")} readOnly className="bg-sky-50 border rounded px-2 py-1.5 w-full text-xs" />
              <Input label="Age" {...formik.getFieldProps("age")} readOnly className="bg-gray-50 border rounded px-2 py-1.5 w-full text-xs" />
              <Input label="Sex" {...formik.getFieldProps("sex")} readOnly className="bg-gray-50 border rounded px-2 py-1.5 w-full text-xs" />
              <Input label="Mobile *" {...formik.getFieldProps("contactNo")} readOnly className="bg-gray-50 border rounded px-2 py-1.5 w-full text-xs" />
              <Input label="Fin. Category" {...formik.getFieldProps("finCategory")} readOnly className="bg-gray-50 border rounded px-2 py-1.5 w-full text-xs" />
            </section>

            {/* Detailed Item Entry Fields */}
            <section className="bg-sky-50/50 p-3 rounded-lg border border-sky-100 space-y-3 shadow-inner">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="col-span-2 relative">
                  <Input label="Item Name *" value={formik.values.itemName} onChange={(e) => { setItemSearch(e.target.value); formik.setFieldValue("itemName", e.target.value); }} />
                  {inventoryItems.length > 0 && itemSearch && (
                    <ul className="absolute z-50 bg-white border rounded shadow-lg w-full mt-[-4px] max-h-40 overflow-auto text-xs">
                      {inventoryItems.map(i => (<li key={i.id} onClick={() => handleItemSelect(i)} className="p-2 hover:bg-sky-50 cursor-pointer border-b">{i.name}</li>))}
                    </ul>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input label="CGST (%)" {...formik.getFieldProps("cgst")} readOnly />
                  <Input label="SGST (%)" {...formik.getFieldProps("sgst")} readOnly />
                </div>
                <Input label="MRP" {...formik.getFieldProps("mrp")} readOnly />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                <Input label="Quantity" {...formik.getFieldProps("quantity")} placeholder="Qty" />
                <Input label="CP" {...formik.getFieldProps("cp")} readOnly />
                <Input label="Discount (%)" {...formik.getFieldProps("discountPercent")} />
                <Input label="Bill No" {...formik.getFieldProps("billNo")} />
                <button
                  type="button"
                  onClick={addItemToList}
                  className="h-9 px-4 flex items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 text-sm font-medium transition-all"
                >
                  <PlusIcon className="w-4 h-4 mr-1" /> Add Item
                </button>              
                </div>
            </section>

            {formik.values.items.length > 0 && (
              <div className="mt-6 bg-white rounded-xl shadow-sm border border-sky-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-sky-100 bg-white">
                  <h2 className="text-sky-700 font-semibold text-sm">
                    Item List:
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-sky-50 text-sky-700">
                      <tr>
                        <th className="px-3 py-3 text-left font-semibold">SL No</th>
                        <th className="px-3 py-3 text-left font-semibold">Description</th>
                        <th className="px-3 py-3 text-center font-semibold">Qty</th>
                        <th className="px-3 py-3 text-center font-semibold">Batch</th>
                        <th className="px-3 py-3 text-center font-semibold">HSN</th>
                        <th className="px-3 py-3 text-center font-semibold">Exp</th>
                        <th className="px-3 py-3 text-right font-semibold">Rate</th>
                        <th className="px-3 py-3 text-right font-semibold">Disc Amt</th>
                        <th className="px-3 py-3 text-right font-semibold">Taxable</th>
                        <th className="px-3 py-3 text-right font-semibold">Total</th>
                        <th className="px-3 py-3 text-center font-semibold">Delete</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      <FieldArray name="items">
                        {({ remove }) =>
                          formik.values.items.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                              <td className="px-3 py-3 text-gray-600">{index + 1}</td>
                              <td className="px-3 py-3 font-medium text-gray-900">
                                {item.description}
                              </td>
                              <td className="px-3 py-3 text-center">{item.qty}</td>
                              <td className="px-3 py-3 text-center text-gray-500 text-xs">
                                {item.batchNo}
                              </td>
                              <td className="px-3 py-3 text-center text-gray-500 text-xs">
                                {item.hsn}
                              </td>
                              <td className="px-3 py-3 text-center text-red-500 text-xs font-medium">
                                {item.expDate}
                              </td>
                              <td className="px-3 py-3 text-right text-gray-700">
                                ₹{item.saleRate}
                              </td>
                              <td className="px-3 py-3 text-right text-gray-500">
                                {item.discAmt.toFixed(2)}
                              </td>
                              <td className="px-3 py-3 text-right text-gray-700">
                                {item.taxableAmt.toFixed(2)}
                              </td>
                              <td className="px-3 py-3 text-right font-bold text-sky-700">
                                ₹{item.total.toFixed(2)}
                              </td>
                              <td className="px-3 py-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => remove(index)}
                                  className="text-red-400 hover:text-red-600 transition-all p-1"
                                  title="Delete Item"
                                >
                                  <TrashIcon className="w-5 h-5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        }
                      </FieldArray>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {/* Calculations Summary */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border">
              <div className="space-y-1">
                <Input label="Total Quantity" value={formik.values.totalQuantity} readOnly />
                <Input label="Total Discount" value={formik.values.totalDiscount} readOnly />
                <Input label="Total Amount" value={formik.values.totalAmount} readOnly className="bg-yellow-50 font-bold" />
                <Select label="Pay Mode *" {...formik.getFieldProps("payMode")}><option value="">-- Select --</option>{paymodes?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</Select>
              </div>
              <div className="space-y-1">
                <Input label="CGST Amount" value={formik.values.cgstAmount} readOnly />
                <Input label="Gross Amount" value={formik.values.grossAmount} readOnly />
                <Input label="Paid Amount" {...formik.getFieldProps("paidAmount")} />
              </div>
              <div className="space-y-1">
                <Input label="SGST Amount" value={formik.values.sgstAmount} readOnly />
                <Input label="Taxable Amount" value={formik.values.taxableAmount} readOnly />
                <Input label="Due Amount" value={formik.values.dueAmount} readOnly className="bg-red-50 text-red-600 font-bold" />
              </div>
            </section>

            <div className="flex justify-center items-end pb-1 gap-2">
              <Button type="submit"><CheckCircleIcon className="w-5 h-5" /> Save</Button>
              <Button type="button" variant="gray" onClick={() => { formik.resetForm(); setBillSearch(""); }}><ArrowPathIcon className="w-5 h-5" /> Reset</Button>
            </div>
          </form>
        </FormikProvider>
      ) : (
        /* ===== BILL LEDGER (HISTORY) SECTION ===== */
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-sky-700 text-center uppercase tracking-wider mb-2">📑 Medicine Billing List</h2>
          <section className="bg-sky-50 border rounded-lg p-3 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <Input label="Bill No" name="billNo" value={filters.billNo} onChange={handleFilterChange} placeholder="Ex: 681" />
              <Input label="Name" name="patientName" value={filters.patientName} onChange={handleFilterChange} placeholder="Ex: Sidhaesh" />
              <Input type="date" label="From" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
              <Input type="date" label="To" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
              <div className="flex items-end gap-1 mb-1">
                <Button onClick={refetchList}><MagnifyingGlassIcon className="w-4 h-4" /> Search</Button>
                <Button variant="gray" onClick={() => setFilters({ billNo: "", patientName: "", startDate: "", endDate: "", status: "Active" })}><ArrowPathIcon className="w-4 h-4" /></Button>
              </div>
            </div>
          </section>

          <div className="overflow-x-auto border rounded-lg shadow-md max-h-[400px]">
            <table className="w-full text-[10px] text-left">
              <thead className="bg-sky-600 text-white uppercase sticky top-0">
                <tr>
                  <th className="p-2 border-r">SL</th>
                  <th className="p-2 border-r">Bill No</th>
                  <th className="p-2 border-r">UHID</th>
                  <th className="p-2 border-r text-center">OPD Bill</th>
                  <th className="p-2 border-r">Patient Name</th>
                  <th className="p-2 border-r text-center">Qty</th>
                  <th className="p-2 border-r text-right">Taxable</th>
                  <th className="p-2 border-r text-right">Disc</th>
                  <th className="p-2 border-r text-right">Gross Amt</th>
                  <th className="p-2 border-r text-right">Paid</th>
                  <th className="p-2 border-r text-right text-red-100">Due</th>
                  <th className="p-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {billingList?.data?.map((bill, index) => (
                  <tr key={bill.id} className="hover:bg-sky-50 transition-colors odd:bg-white even:bg-gray-50">
                    <td className="p-2 border-r text-center font-bold text-gray-500">{index + 1}</td>
                    <td className="p-2 border-r font-bold text-sky-800">{bill.billNumber}</td>
                    <td className="p-2 border-r">{bill.uhid || 'N/A'}</td>
                    <td className="p-2 border-r text-center">{bill.opdBillNo || 'N/A'}</td>
                    <td className="p-2 border-r font-medium">{bill.patientName}</td>
                    <td className="p-2 border-r text-center">{bill.totalQuantity || 0}</td>
                    <td className="p-2 border-r text-right">₹{bill.taxableAmount || '0.00'}</td>
                    <td className="p-2 border-r text-right text-gray-500">₹{bill.totalDiscount || '0.00'}</td>
                    <td className="p-2 border-r text-right font-bold text-gray-800">₹{bill.totalAmount}</td>
                    <td className="p-2 border-r text-right text-emerald-600 font-bold">₹{bill.paidAmount}</td>
                    <td className="p-2 border-r text-right text-red-500 font-bold">₹{bill.dueAmount}</td>
                    <td className="p-2 text-center">
                      <div className="flex justify-center gap-2">
                        <button className="text-sky-600 hover:scale-125 transition-all"><PencilSquareIcon className="w-4 h-4" /></button>
                        <button onClick={() => deleteBill(bill.id)} className="text-red-500 hover:scale-125 transition-all"><TrashIcon className="w-4 h-4" /></button>
                        <button className="text-gray-600 hover:scale-125 transition-all"><PrinterIcon className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary footer with Total Paid Amount Fixed */}
          <div className="flex gap-4 text-[10px] font-bold text-sky-700 bg-sky-50 p-2.5 rounded-lg border shadow-sm overflow-x-auto whitespace-nowrap">
            <span>Total Issued Qty: {billingList?.summary?.totalQty || 0}</span>
            <span className="border-l border-sky-200 pl-4 text-emerald-700">Total Paid Amount: ₹ {billingList?.summary?.totalPaid || '0.00'}</span>
            <span className="border-l border-sky-200 pl-4">Total Discount: ₹ {billingList?.summary?.totalDisc || '0.00'}</span>
            <span className="border-l border-sky-200 pl-4">Total Bill Amount: ₹ {billingList?.summary?.totalGross || '0.00'}</span>
            <span className="border-l border-sky-200 pl-4 text-red-600">Total Due Amount: ₹ {billingList?.summary?.totalDue || '0.00'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;