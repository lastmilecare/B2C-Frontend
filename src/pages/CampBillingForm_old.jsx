import React, { useState, useEffect, useRef } from "react";
import { useFormik, FieldArray, FormikProvider } from "formik";
import {
  TrashIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import {
  useLazyGetBillingByBillNoQuery,
  useCreateMedicineBillMutation,
  useGetComboQuery,
  useGetOpdBillByIdQuery,
  useSearchOpdBillNoQuery,
  useGetMediceneListQuery,
  useGetStockDetailsQuery,
} from "../redux/apiSlice";
import useDebounce from "../hooks/useDebounce";
import { healthAlert } from "../utils/healthSwal";
import { Input, Select, Button, baseInput } from "../components/UIComponents";
import { skipToken } from "@reduxjs/toolkit/query";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { cleanCurrency } from "../utils/helper";
const CampBillingForm = ({ refetchList }) => {
  const [billSearch, setBillSearch] = useState("");
  const [medicineSearch, setMedicineSearch] = useState("");
  const debouncedUhid = useDebounce(billSearch, 500);
  const debouncedMedicine = useDebounce(medicineSearch, 500);
  const [selectedBill, setSelectedBill] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState("");
  const [suggestionsList, setSuggestionsList] = useState([]);
  const [prescriptionList, setPrescriptionList] = useState([]);
  const [medicineSuggestions, setMedicineSuggestions] = useState([]);
  const { id } = useParams();
  const populatedUhidRef = useRef("");
  const { data: patientData, isFetching } = useGetOpdBillByIdQuery(
    selectedBill ? String(selectedBill) : skipToken,
  );

  const { data: medicineResponse } = useGetMediceneListQuery(
     { searchTerm: debouncedMedicine || skipToken },
    { skip: !debouncedMedicine || debouncedMedicine.length < 2 },
  );
  const medicineList = React.useMemo(
    () => medicineResponse?.data || [],
    [medicineResponse],
  );
  const { data: suggestions = [] } = useSearchOpdBillNoQuery(debouncedUhid, {
    skip: debouncedUhid.length < 1,
  });
  const { data: paymodes } = useGetComboQuery("paymode");
  const [createMedicineBill] = useCreateMedicineBillMutation();
  const [triggerGetBillDetails] = useLazyGetBillingByBillNoQuery();

  const { data: stockDetails } = useGetStockDetailsQuery(
    selectedMedicine ? String(selectedMedicine.id) : skipToken,
    { skip: !selectedMedicine },
  );

  useEffect(() => {
    if (selectedBill) return;
    if (billSearch.length < 1) return;
    const isSame =
      suggestionsList.length === suggestions.length &&
      suggestionsList.every((x, i) => x.ID === suggestions[i].ID);

    if (!isSame) {
      setSuggestionsList(suggestions);
    }
  }, [suggestions, selectedBill, billSearch]);

  useEffect(() => {
    if (!debouncedMedicine) {
      if (medicineSuggestions.length > 0) setMedicineSuggestions([]);
      return;
    }

    if (medicineList && medicineList.length > 0) {
      const currentDataStr = JSON.stringify(medicineList);
      const existingDataStr = JSON.stringify(medicineSuggestions);

      if (currentDataStr !== existingDataStr) {
        setMedicineSuggestions(medicineList);
      }
    } else if (medicineList.length === 0 && medicineSuggestions.length > 0) {
      setMedicineSuggestions([]);
    }
  }, [medicineList, debouncedMedicine]);

  const formik = useFormik({
    initialValues: {
      opdBillNo: "",
      patientName: "",
      Age: "",
      Gender: "",
      UHID: "",
      Mobile: "",
      FinCategory: "",
      itemName: "",
      cp: "",
      mrp: "",
      discountPercent: 0,
      billNo: 0,
      quantity: "",
      cgst: 0,
      sgst: 0,
      items: [],
      totalQuantity: 0,
      totalDiscount: 0,
      grossAmount: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      taxableAmount: 0,
      totalAmount: 0,
      paidAmount: 0,
      dueAmount: 0,
      payMode: "",
    },
    onSubmit: async (values) => {
      if (values.items.length === 0)
        return healthAlert({
          title: "Empty",
          text: "Please add items first",
          icon: "warning",
        });
      try {
        await createMedicineBill(values).unwrap();
        healthAlert({
          title: "Success",
          text: "Bill Saved Successfully",
          icon: "success",
        });
        formik.resetForm();
        setBillSearch("");
        if (refetchList) refetchList();
      } catch (err) {
        healthAlert({
          title: "Error",
          text: err.data?.message || "Failed to save bill",
          icon: "error",
        });
      }
    },
  });
  useEffect(() => {
    if (!patientData) return;
    if (patientData.ID !== selectedBill) return;
    if (populatedUhidRef.current === selectedBill) return;
    populatedUhidRef.current = selectedBill;

    const updates = {
      UHID: patientData.PicasoNo || "",
      Name: patientData.driverDetails[0]?.name || "",
      Gender: patientData.driverDetails[0].gender || "",
      Mobile: patientData.Mobile || "",
      FinCategory: patientData.driverDetails[0]?.category || "",
      Age: patientData.driverDetails[0]?.age || "",
      consultingId: patientData.ConsultantDoctorID || "",
      hospitalId: patientData.HospitalID,
      Remarks: patientData.Remarks,
      ReferTo: patientData.ReferTo,
      AddedBy: patientData.AddedBy,
      ConsultantDoctorID: patientData.ConsultantDoctorID,
      CenterID: patientData.CenterID,
      PatientID: patientData.PatientID,
    };
    formik.setValues({ ...formik.values, ...updates }, false);
  }, [patientData, selectedBill]);

  useEffect(() => {
    const updates = {
      cgst: stockDetails?.CGST || 0,
      sgst: stockDetails?.SGST || 0,
      discountPercent: stockDetails?.DiscountPCperitem || 0,
      mrp: cleanCurrency(stockDetails?.MRP || 0),
      cp: cleanCurrency(stockDetails?.CPU || 0),
    };
    formik.setValues({ ...formik.values, ...updates }, false);
  }, [stockDetails]);

  const handleBillSelect = async (billNo) => {
    setBillSearch(billNo);
    const res = await triggerGetBillDetails(billNo).unwrap();
    if (res) {
      formik.setValues({
        ...formik.values,
        opdBillNo: res.bill_no,
        patientName: res.patient_name,
        UHID: res.UHID,
        Age: res.Age || "",
        Gender: res.gender || "",
        Mobile: res.contactNumber || "",
        FinCategory: res.category === "1" ? "BPL" : "APL",
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
    const taxable = rate * qty - discAmt;
    const cgstAmt = (taxable * formik.values.cgst) / 100;
    const sgstAmt = (taxable * formik.values.sgst) / 100;

    const newItem = {
      description: formik.values.itemName,
      qty,
      batchNo: "A24AM390",
      hsn: "3004",
      expDate: "01-10-2026",
      saleRate: rate,
      discAmt,
      cgstPercent: formik.values.cgst,
      sgstPercent: formik.values.sgst,
      cgstAmt,
      sgstAmt,
      taxableAmt: taxable,
      total: taxable + cgstAmt + sgstAmt,
      UHID: formik.values.UHID,
      opdBillNo: formik.values.opdBillNo,
    };
    formik.setFieldValue("items", [...formik.values.items, newItem]);
    formik.setFieldValue("itemName", "");
    formik.setFieldValue("quantity", "");
  };

  useEffect(() => {
    let totals = formik.values.items.reduce(
      (acc, i) => ({
        qty: acc.qty + i.qty,
        disc: acc.disc + i.discAmt,
        cgst: acc.cgst + i.cgstAmt,
        sgst: acc.sgst + i.sgstAmt,
        gross: acc.gross + i.total,
      }),
      { qty: 0, disc: 0, cgst: 0, sgst: 0, gross: 0 },
    );

    formik.setValues({
      ...formik.values,
      totalQuantity: totals.qty,
      totalAmount: totals.gross.toFixed(2),
      grossAmount: totals.gross.toFixed(2),
      cgstAmount: totals.cgst.toFixed(2),
      sgstAmount: totals.sgst.toFixed(2),
      totalDiscount: totals.disc.toFixed(2),
      taxableAmount: (totals.gross - totals.cgst - totals.sgst).toFixed(2),
      paidAmount: totals.gross.toFixed(2),
    });
  }, [formik.values.items]);

  useEffect(() => {
    formik.setFieldValue(
      "dueAmount",
      (
        Number(formik.values.totalAmount) - Number(formik.values.paidAmount)
      ).toFixed(2),
    );
  }, [formik.values.paidAmount, formik.values.totalAmount]);

  return (
    <FormikProvider value={formik}>
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <h2 className="text-lg font-bold text-sky-700 text-center uppercase border-b pb-2">
          💳 Medicine Camp Billing Form
        </h2>

        {/* Patient Details Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <label className="text-sm text-gray-600 block mb-1">
              Bill no <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className={baseInput}
              placeholder="Search Bill no (e.g., 123)"
              value={billSearch}
              onChange={(e) => {
                if (id) return;
                const val = e.target.value.replace(/\D/g, "");
                setBillSearch(val);
                setSelectedBill("");
                formik.setFieldValue("billno", "");
                setSuggestionsList([]);
                populatedUhidRef.current = "";
              }}
              autoComplete="off"
            />

            {suggestionsList.length > 0 && billSearch.length >= 1 && (
              <ul className="absolute z-20 bg-white border rounded-md shadow-md w-full max-h-48 overflow-auto">
                {suggestionsList.map((item) => (
                  <li
                    key={item.ID}
                    onClick={() => {
                      setSelectedBill(item.ID);
                      formik.setFieldValue("billno", item.ID);
                      setBillSearch(item.ID);
                      setSuggestionsList([]);
                    }}
                    className="px-3 py-2 hover:bg-sky-100 cursor-pointer"
                  >
                    {item.ID}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Input label="Name" {...formik.getFieldProps("Name")} readOnly />
          <Input
            label="UHID"
            {...formik.getFieldProps("UHID")}
            readOnly
            className="bg-sky-50"
          />
          <Input label="Age" {...formik.getFieldProps("Age")} readOnly />
          <Input label="Gender" {...formik.getFieldProps("Gender")} readOnly />
          <Input
            label="Mobile *"
            {...formik.getFieldProps("Mobile")}
            readOnly
          />
          <Input
            label="Fin. Category"
            {...formik.getFieldProps("FinCategory")}
            readOnly
          />
        </section>

        {/* Item Entry Section */}
        <section className="bg-sky-50/50 p-3 rounded-lg border border-sky-100 space-y-3 shadow-inner">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <label className="text-sm text-gray-600 block mb-1">
                Medicine <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                className={`${baseInput} 
                             ${!formik.values.billno ? "bg-sky-50 cursor-not-allowed" : ""}`}
                placeholder={"Search Medicine"}
                value={medicineSearch}
                disabled={!formik.values.billno}
                onChange={(e) => {
                  setMedicineSearch(e.target.value);
                  setSelectedMedicine(null);
                  formik.setFieldValue("medicine", e.target.value);
                }}
                autoComplete="off"
              />

              {/* Medicine Search Suggestions List */}
              {medicineSuggestions.length > 0 && (
                <ul className="absolute z-20 bg-white border rounded-md shadow-md w-full max-h-48 overflow-auto">
                  {medicineSuggestions.map((item) => (
                    <li
                      key={item.id}
                      onClick={() => {
                        setSelectedMedicine(item);
                        setMedicineSearch(item.descriptions);
                        formik.setFieldValue("medicine", item.descriptions);
                        formik.setFieldValue("medicineId", item.id);
                        formik.setFieldValue(
                          "typemedicine",
                          item.itemType?.Descriptions || "",
                        );
                        setMedicineSuggestions([]);
                      }}
                      className="px-3 py-2 hover:bg-sky-100 cursor-pointer text-sm"
                    >
                      {item.descriptions}
                      <span className="text-xs text-gray-400 ml-2">
                        ({item.itemType?.Code})
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="CGST (%)"
                {...formik.getFieldProps("cgst")}
                readOnly
              />
              <Input
                label="SGST (%)"
                {...formik.getFieldProps("sgst")}
                readOnly
              />
            </div>
            <Input label="MRP" {...formik.getFieldProps("mrp")} readOnly />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <Input
              label="Quantity"
              {...formik.getFieldProps("quantity")}
              placeholder="Qty"
            />
            <Input label="CP" {...formik.getFieldProps("cp")} readOnly />
            <Input
              label="Discount (%)"
              {...formik.getFieldProps("discountPercent")}
            />
            <Input label="Bill No" {...formik.getFieldProps("billNo")} />
            <Button
              type="button"
              onClick={addItemToList}
              className="bg-emerald-600 text-white hover:bg-emerald-700 h-9"
            >
              <PlusIcon className="w-4 h-4 mr-1" /> Add Item
            </Button>
          </div>
        </section>

        {/* Items Table Section */}
        {formik.values.items.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-sky-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-sky-100 bg-white">
              <h2 className="text-sky-700 font-semibold text-sm">Item List:</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sky-50 text-sky-700">
                  <tr>
                    <th className="px-3 py-3 text-left">SL</th>
                    <th className="px-3 py-3 text-left">Description</th>
                    <th className="px-3 py-3 text-center">Qty</th>
                    <th className="px-3 py-3 text-center">Batch</th>
                    <th className="px-3 py-3 text-center">HSN</th>
                    <th className="px-3 py-3 text-center">Exp</th>
                    <th className="px-3 py-3 text-right">Rate</th>
                    <th className="px-3 py-3 text-right">Disc</th>
                    <th className="px-3 py-3 text-right">Taxable</th>
                    <th className="px-3 py-3 text-right">Total</th>
                    <th className="px-3 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <FieldArray name="items">
                    {({ remove }) =>
                      formik.values.items.map((item, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-3 py-3 text-gray-600">
                            {index + 1}
                          </td>
                          <td className="px-3 py-3 font-medium text-gray-900">
                            {item.description}
                          </td>
                          <td className="px-3 py-3 text-center">{item.qty}</td>
                          <td className="px-3 py-3 text-center text-xs">
                            {item.batchNo}
                          </td>
                          <td className="px-3 py-3 text-center text-xs">
                            {item.hsn}
                          </td>
                          <td className="px-3 py-3 text-center text-red-500 text-xs">
                            {item.expDate}
                          </td>
                          <td className="px-3 py-3 text-right">
                            ₹{item.saleRate}
                          </td>
                          <td className="px-3 py-3 text-right text-gray-500">
                            {item.discAmt.toFixed(2)}
                          </td>
                          <td className="px-3 py-3 text-right">
                            {item.taxableAmt.toFixed(2)}
                          </td>
                          <td className="px-3 py-3 text-right font-bold text-sky-700">
                            ₹{item.total.toFixed(2)}
                          </td>
                          <td className="px-3 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="text-red-400 hover:text-red-600"
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

        {/* Calculations Summary Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border">
          <div className="space-y-1">
            <Input
              label="Total Quantity"
              value={formik.values.totalQuantity}
              readOnly
            />
            <Input
              label="Total Discount"
              value={formik.values.totalDiscount}
              readOnly
            />
            <Input
              label="Total Amount"
              value={formik.values.totalAmount}
              readOnly
            />
            <Select label="Pay Mode *" {...formik.getFieldProps("payMode")}>
              <option value="">-- Select --</option>
              {paymodes?.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <Input
              label="CGST Amount"
              value={formik.values.cgstAmount}
              readOnly
            />
            <Input
              label="Gross Amount"
              value={formik.values.grossAmount}
              readOnly
            />
            <Input
              label="Paid Amount"
              {...formik.getFieldProps("paidAmount")}
            />
          </div>
          <div className="space-y-1">
            <Input
              label="SGST Amount"
              value={formik.values.sgstAmount}
              readOnly
            />
            <Input
              label="Taxable Amount"
              value={formik.values.taxableAmount}
              readOnly
            />
            <Input
              label="Due Amount"
              value={formik.values.dueAmount}
              readOnly
            />
          </div>
        </section>

        <div className="flex justify-center gap-2 pb-2">
          <Button type="submit">
            <CheckCircleIcon className="w-5 h-5" /> Save Bill
          </Button>
          <Button
            type="button"
            variant="gray"
            onClick={() => {
              formik.resetForm();
              setBillSearch("");
            }}
          >
            <ArrowPathIcon className="w-5 h-5" /> Reset
          </Button>
        </div>
      </form>
    </FormikProvider>
  );
};

export default CampBillingForm;
