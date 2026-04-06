import React, { useState, useEffect, useRef } from "react";
import { useFormik, FieldArray, FormikProvider } from "formik";
import {
  TrashIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  PlusIcon,
  ClipboardDocumentIcon,
  DocumentCheckIcon,
  BeakerIcon,
  CreditCardIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import {
  useLazyGetBillingByBillNoQuery,
  useCreateMedicineBillMutation,
  useGetComboQuery,
  useGetOpdBillByIdQuery,
  useSearchOpdBillNoQuery,
  useGetMediceneListQuery,
  useGetStockDetailsQuery,
  useGetMedicineBillByIdQuery,
  useUpdateMedicineBillMutation,
} from "../redux/apiSlice";
import useDebounce from "../hooks/useDebounce";
import { healthAlert } from "../utils/healthSwal";
import { Input, Select, Button, baseInput } from "../components/UIComponents";
import { skipToken } from "@reduxjs/toolkit/query";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { cleanCurrency, getPharmaSellingFromCP } from "../utils/helper";
import { Picaso_Paymode_Options } from "../utils/constants";

const StaffForm = ({ refetchList }) => {
  const [activeStep, setActiveStep] = useState(1);

  const nextStep = () => {
    setActiveStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setActiveStep((prev) => prev - 1);
  };
  const [billSearch, setBillSearch] = useState("");
  const [medicineSearch, setMedicineSearch] = useState("");
  const debouncedUhid = useDebounce(billSearch, 500);
  const debouncedMedicine = useDebounce(medicineSearch, 500);
  const [selectedBill, setSelectedBill] = useState("");
  const { data: patientData } = useGetOpdBillByIdQuery(
    selectedBill ? String(selectedBill) : skipToken,
  );
  const [selectedMedicine, setSelectedMedicine] = useState("");
  const [suggestionsList, setSuggestionsList] = useState([]);
  const [medicineSuggestions, setMedicineSuggestions] = useState([]);
  const { id } = useParams();
  const populatedUhidRef = useRef("");
  const { data: billData } = useGetMedicineBillByIdQuery(id, {
    skip: !id,
  });

  const { data: medicineResponse } = useGetMediceneListQuery(
    debouncedMedicine || skipToken,
    { skip: !debouncedMedicine || debouncedMedicine.length < 2 },
  );
  const medicineList = React.useMemo(
    () => medicineResponse?.data || [],
    [medicineResponse],
  );
  const { data: suggestions = [] } = useSearchOpdBillNoQuery(debouncedUhid, {
    skip: debouncedUhid.length < 1 || id,
  });
  const { data: paymodes } = useGetComboQuery("paymode");
  const [createMedicineBill] = useCreateMedicineBillMutation();
  const [updateMedicineBill] = useUpdateMedicineBillMutation();
  const [triggerGetBillDetails] = useLazyGetBillingByBillNoQuery();
  const { data: stockDetails } = useGetStockDetailsQuery(
    selectedMedicine ? { ItemID: String(selectedMedicine.id) } : skipToken,
    { skip: !selectedMedicine },
  );

  const billingItemValues = [];
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
      cashAmount: 0,
      cardAmount: 0,
      chequeAmount: 0,
    },
    onSubmit: async (values) => {
      if (values.items.length === 0) {
        return healthAlert({
          title: "Empty",
          text: "Please add items first",
          icon: "warning",
        });
      }

      const payload = {
        ...values,
        UHID: values.UHID || null,
        Name: values.Name || "",
        Age: values.Age || "",
        Mobile: values.Mobile || "",
        FinCategory: values.FinCategory || "",
        opdBillNo: values.opdBillNo || "",

        payMode: Number(values.payMode || 0),

        totalQuantity: Number(values.totalQuantity || 0),
        totalAmount: Number(values.totalAmount || 0),
        totalDiscount: Number(values.totalDiscount || 0),

        paidAmount: Number(values.paidAmount || 0),

        cgstAmount: Number(values.cgstAmount || 0),
        sgstAmount: Number(values.sgstAmount || 0),
        grossAmount: Number(values.grossAmount || 0),
        taxableAmount: Number(values.taxableAmount || 0),

        cashAmount: Number(values.cashAmount || 0),
        cardAmount: Number(values.cardAmount || 0),
        chequeAmount: Number(values.chequeAmount || 0),

        hospitalId: Number(values.hospitalId || 1),
        finYearId: Number(values.finYearId || 1),

        AddedBy: Number(values.AddedBy || 1),
        items: values.items.map((i) => ({
          itemId: Number(i.itemId || 0),
          stockId: Number(i.stockId || 0),
          stockNo: i.stockNo || "",

          description: i.description || "",

          batchNo: i.batchNo || "",
          hsn: i.hsn || "",

          expDate: i.expDate || null,

          qty: Number(i.qty || 0),

          saleRate: Number(i.saleRate || 0),
          basePrice: Number(i.basePrice || 0),

          discountPercent: Number(i.discountPercent || 0),
          discAmt: Number(i.discAmt || 0),

          cgstPercent: Number(i.cgstPercent || 0),
          sgstPercent: Number(i.sgstPercent || 0),

          cgstAmt: Number(i.cgstAmt || 0),
          sgstAmt: Number(i.sgstAmt || 0),

          taxableAmt: Number(i.taxableAmt || 0),

          total: Number(i.total || 0),
        })),
      };

      try {
        if (id) {
          await updateMedicineBill({
            id,
            data: payload,
          }).unwrap();

          healthAlert({
            title: "Updated",
            text: "Bill Updated Successfully",
            icon: "success",
          });
        } else {
          await createMedicineBill(payload).unwrap();

          healthAlert({
            title: "Success",
            text: "Bill Saved Successfully",
            icon: "success",
          });
        }
      } catch (err) {
        healthAlert({
          title: "Error",
          text: err.data?.message || "Failed",
          icon: "error",
        });
      }
    },
  });
  useEffect(() => {
    if (!billData || !id) return;

    const header = billData.header;

    const mappedItems =
      billData.items?.map((item) => ({
        description: item.ItemName || "",
        qty: Number(item.IssueQty || 0),
        batchNo: item.BatchNo || "",
        hsn: item.HSNCode || "",
        expDate: item.ExpiryDate
          ? new Date(item.ExpiryDate).toISOString().split("T")[0]
          : null,
        saleRate: Number(item.Rate || 0),
        discAmt: Number(item.DiscountAmt || 0),
        discountPercent: Number(item.DiscountPC || 0),
        cgstPercent: Number(item.CGST || 0),
        sgstPercent: Number(item.SGST || 0),
        cgstAmt: Number(item.CGSTAmount || 0),
        sgstAmt: Number(item.SGSTAmount || 0),
        taxableAmt: Number(item.TaxableAmount || 0),
        total: Number(item.NetAmount || 0),
        itemId: item.ItemID,
        stockId: item.StockID,
        stockNo: item.StockNo || "",
        basePrice: Number(item.Baseprice || 0),
      })) || [];

    const firstItem = mappedItems[0];

    formik.setValues({
      ...formik.values,

      billNo: header.BillNo,
      opdBillNo: header.OPDBillNo,
      UHID: header.PicasoID,
      Name: header.CustommerName,
      Age: header.Ages,
      Mobile: header.Mobileno,
      Gender: header.Gender || "",
      FinCategory: header.PatientType,

      medicine: firstItem?.description || "",
      quantity: firstItem?.qty || "",
      cp: firstItem?.basePrice || "",
      cgst: firstItem?.cgstPercent || 0,
      sgst: firstItem?.sgstPercent || 0,
      discountPercent: firstItem?.discountPercent || 0,

      totalQuantity: Number(header.TotalQty || 0),
      totalAmount: Number(header.TotalAmount || 0),
      totalDiscount: Number(header.DiscountAmount || 0),
      paidAmount: Number(header.PaidAmount || 0),
      cgstAmount: Number(header.CGSTAmount || 0),
      sgstAmount: Number(header.SGSTAmount || 0),
      grossAmount: Number(header.GrossAmount || 0),
      taxableAmount: Number(header.TaxableAmount || 0),
      payMode: header.PayMode || "",

      items: [],
    });

    setMedicineSearch(firstItem?.description || "");
    setBillSearch(header.OPDBillNo || "");
  }, [billData, id]);
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
    console.log(stockDetails, "stock details");
    const updates = {
      cgst: stockDetails?.data[0].CGST || 0,
      sgst: stockDetails?.data[0].SGST || 0,
      discountPercent: stockDetails?.data[0].DiscountPCperitem || 0,
      mrp: cleanCurrency(stockDetails?.data[0].MRP || 0),
      cp: cleanCurrency(stockDetails?.data[0].CP || 0),
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

  const addItemToList = async () => {
    console.log("Adding item with values:", formik.values);
    const canAdd =
      formik.values.medicine && formik.values.quantity && formik.values.cp;
    if (!canAdd) {
      healthAlert({
        title: "Missing Fields",
        text: "Please select an item, quantity and cost price before adding",
        icon: "warning",
      });
      return;
    }
    const item = {
      CP: formik.values.cp,
      CGST: formik.values.cgst,
      SGST: formik.values.sgst,
    };
    const sellingItemCost = await getPharmaSellingFromCP(
      item,
      Number(formik.values.quantity),
      Number(cleanCurrency(formik.values.discountPercent)),
    );
    console.log("Calculated selling item cost:", sellingItemCost);
    const expDate = stockDetails?.data?.[0]?.ExpiryDate
      ? new Date(stockDetails.data[0].ExpiryDate).toISOString().split("T")[0]
      : null;
    const newItem = {
      description: formik.values.medicine,
      qty: sellingItemCost.qty,
      batchNo: stockDetails?.data[0]?.BatchNo || "N/A",
      hsn: stockDetails?.data[0]?.HSNCode || "N/A",
      expDate: expDate || null,
      saleRate: sellingItemCost.total,
      discAmt: sellingItemCost.discountAmount,
      discountPercent: formik.values.discountPercent,
      cgstPercent: formik.values.cgst,
      sgstPercent: formik.values.sgst,
      cgstAmt: sellingItemCost.cgstAmount,
      sgstAmt: sellingItemCost.sgstAmount,
      taxableAmt: sellingItemCost.priceBeforeGST,
      total: sellingItemCost.total,
      UHID: formik.values.UHID,
      opdBillNo: formik.values.opdBillNo,
      itemId: selectedMedicine.id,
      stockId: stockDetails?.data[0]?.StockID,
      stockNo: stockDetails?.data[0]?.StockNo,
      basePrice: cleanCurrency(stockDetails?.data[0]?.CP),
    };
    formik.setFieldValue("items", [...formik.values.items, newItem]);
    formik.setFieldValue("medicine", "");
    formik.setFieldValue("quantity", "");
    formik.setFieldValue("cp", "");
    formik.setFieldValue("mrp", "");
    formik.setFieldValue("discountPercent", 0);
    formik.setFieldValue("cgst", 0);
    formik.setFieldValue("sgst", 0);
    setMedicineSearch("");
    setSelectedMedicine(null);
  };
  useEffect(() => {
    let totals = formik.values.items.reduce(
      (acc, i) => ({
        qty: acc.qty + (Number(i.qty) || 0),
        disc: acc.disc + (Number(i.discAmt) || 0),
        cgst: acc.cgst + (Number(i.cgstAmt) || 0),
        sgst: acc.sgst + (Number(i.sgstAmt) || 0),
        gross: acc.gross + (Number(i.total) || 0),
      }),
      { qty: 0, disc: 0, cgst: 0, sgst: 0, gross: 0 },
    );
    formik.setValues(
      {
        ...formik.values,
        totalQuantity: totals.qty,
        totalAmount: totals.gross.toFixed(2),
        grossAmount: totals.gross.toFixed(2),
        cgstAmount: totals.cgst.toFixed(2),
        sgstAmount: totals.sgst.toFixed(2),
        totalDiscount: totals.disc.toFixed(2),
        taxableAmount: (totals.gross - totals.cgst - totals.sgst).toFixed(2),
        paidAmount: id ? formik.values.paidAmount : totals.gross.toFixed(2),
      },
      false,
    );
  }, [formik.values.items]);
  useEffect(() => {
    const total = Number(formik.values.totalAmount) || 0;
    const paid = Number(formik.values.paidAmount) || 0;

    formik.setFieldValue("dueAmount", (total - paid).toFixed(2));
  }, [formik.values.paidAmount, formik.values.totalAmount]);

  return (
    <FormikProvider value={formik}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 py-10">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <span className="bg-blue-100 p-2 rounded-xl">
                <UserPlusIcon className="w-6 text-blue-600" />
              </span>
              Add Staff
            </h1>
            <div className="flex gap-2">
    {[1, 2, 3, 4].map((s) => (
      <div
        key={s}
        className={`h-2 w-12 rounded-full ${
          activeStep >= s ? "bg-sky-600" : "bg-sky-100"
        }`}
      />
    ))}
  </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex border-b">
              {[
                { id: 1, label: "Staff", icon: ClipboardDocumentIcon },
                { id: 2, label: "Roles", icon: UserPlusIcon },
                { id: 3, label: "Basic Info", icon: ClipboardDocumentIcon },
                { id: 4, label: "Summary", icon: DocumentCheckIcon },
              ].map((step) => (
                <button
                  key={step.id}
                  type="button"
                   disabled
                  onClick={() => setActiveStep(step.id)}
                  className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-semibold
                  ${activeStep === step.id ? "bg-white text-blue-600 shadow" : "text-gray-400"}`}
                >
                  <step.icon className="w-4 h-4" />

                  {step.label}
                </button>
              ))}
            </div>
            <form
  onSubmit={(e) => {
    e.preventDefault();
    
  }}
  className="space-y-6 p-6"
>
           
              {activeStep === 1 && (
                <section className="space-y-4">
                  <h3 className="text-sky-700 font-semibold text-lg">
                    Staff Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input label="Name" {...formik.getFieldProps("Name")} />
                    <Input
                      label="Employee Number"
                      {...formik.getFieldProps("EmployeeNo")}
                    />
                    <Input
                      label="Date of Birth"
                      type="date"
                      {...formik.getFieldProps("DOB")}
                      max={new Date().toISOString().split("T")[0]}
                    />

                    <Input
                      label="Date of Joining"
                      type="date"
                      {...formik.getFieldProps("DOJ")}
                      max={new Date().toISOString().split("T")[0]}
                    />
                    <Input label="Gender" {...formik.getFieldProps("Gender")} />

                    <Input
                      label="Mobile *"
                      {...formik.getFieldProps("phone")}
                    />
                    <Input label="Email *" {...formik.getFieldProps("email")} />
                    <Input label="Password *"
                    type="password"
                    {...formik.getFieldProps("password")} />
                    <Input label="Confirm Password *"
                    type="password"
                     {...formik.getFieldProps("confirm password")} />
                  </div>
                </section>
              )}

              {activeStep === 2 && (
                <section className="bg-sky-50/40 p-6 rounded-xl border border-sky-100 space-y-6 shadow-sm">
                  <h3 className="text-sky-700 font-semibold text-lg">Roles</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select
                      label=" Designation *"
                      {...formik.getFieldProps("designation")}
                    >
                      <option value="">-- Select --</option>
                      {Picaso_Paymode_Options.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </Select>
                    <Select
                      label="Employee Type *"
                      {...formik.getFieldProps("employeeType")}
                    >
                      <option value="">-- Select --</option>
                      {Picaso_Paymode_Options.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </Select>
                    <Select
                      label="Department *"
                      {...formik.getFieldProps("department")}
                    >
                      <option value="">-- Select --</option>
                      {Picaso_Paymode_Options.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </Select>
                    <Input
                      label="Education/Qualification"
                      {...formik.getFieldProps("education")}
                    />
                    <Input
                      label="Timings"
                      {...formik.getFieldProps("timings")}
                    />
                  </div>
                </section>
              )}

              {activeStep === 3 && (
                <section className="space-y-4">
                  <h3 className="text-sky-700 font-semibold mb-3">Basic</h3>

                  <Input
                    label="Emergency Contact No"
                    {...formik.getFieldProps("emergencyContact")}
                  />
                  <Input
                    label="Doctor Registration No"
                    {...formik.getFieldProps("doctorRegistrationNo")}
                  />
                  <Input
                    label="Previous Employer/Work Details"
                    {...formik.getFieldProps("previousEmployer")}
                  />
                  <Input
                    label="Permanent Address"
                    {...formik.getFieldProps("permanentAddress")}
                  />
                </section>
              )}

              {activeStep === 4 && (
  <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 space-y-4">

    <h3 className="text-lg font-semibold text-sky-600">
      Confirm Staff Details
    </h3>

    
    <div className="grid md:grid-cols-2 gap-3 text-sm">
      <p><b>Name:</b> {formik.values.Name}</p>
      <p><b>Employee No:</b> {formik.values.EmployeeNo}</p>
      <p><b>Mobile:</b> {formik.values.phone}</p>
      <p><b>Email:</b> {formik.values.email}</p>
    </div>

    
    <div className="border-t pt-3 text-sm grid md:grid-cols-2 gap-3">
      <p><b>Designation:</b> {formik.values.designation}</p>
      <p><b>Department:</b> {formik.values.department}</p>
      <p><b>Employee Type:</b> {formik.values.employeeType}</p>
      <p><b>Timings:</b> {formik.values.timings}</p>
    </div>

    
    <div className="border-t pt-3 text-sm grid md:grid-cols-2 gap-3">
      <p><b>Emergency Contact:</b> {formik.values.emergencyContact}</p>
      <p><b>Address:</b> {formik.values.permanentAddress}</p>
      <p><b>Qualification:</b> {formik.values.education}</p>
    </div>

  </div>
)}
              <div className="flex justify-between items-center pt-6 border-t">
                <div>
                  {activeStep > 1 && (
                    <Button type="button" variant="gray" onClick={prevStep}>
                      Back
                    </Button>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="gray"
                    onClick={formik.handleReset}
                  >
                    <ArrowPathIcon className="w-5 h-5 mr-1" /> Reset
                  </Button>

                  {activeStep < 4 ? (
                    <Button type="button" variant="sky" onClick={nextStep}>
                      Continue
                    </Button>
                  ) : (
                   <Button
  type="button"
  variant="sky"
  onClick={formik.handleSubmit}
>
  <CheckCircleIcon className="w-5 h-5 mr-1" />
  Save
</Button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </FormikProvider>
  );
};

export default StaffForm;
