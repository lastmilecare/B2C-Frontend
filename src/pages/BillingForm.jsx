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
import * as Yup from "yup";
const BillingFormCopy = ({ refetchList }) => {
  const [activeStep, setActiveStep] = useState(1);
  const navigate = useNavigate();
  const nextStep = async () => {
    const errors = await formik.validateForm();
    if (activeStep === 1 && errors.opdBillNo) {
      formik.setTouched({
        opdBillNo: true,
      });
      return;
    }
    if (activeStep === 2) {
      if (formik.values.items.length === 0) {
        formik.setTouched({
          medicine: true,
          quantity: true,
        });

        healthAlert({
          title: "Warning",
          text: "Please add at least one medicine",
          icon: "warning",
        });

        return;
      }
    }
    if (activeStep === 3 && errors.payMode) {
      formik.setTouched({
        payMode: true,
      });

      return;
    }

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
  const { data: patientData, refetch: refetchPatientData, } = useGetOpdBillByIdQuery(
    selectedBill ? String(selectedBill) : skipToken,
  );
  const [selectedMedicine, setSelectedMedicine] = useState("");
  const [medicineSelectionCount, setMedicineSelectionCount] = useState(0);
  const [suggestionsList, setSuggestionsList] = useState([]);
  const [medicineSuggestions, setMedicineSuggestions] = useState([]);
  const { id } = useParams();
  const populatedUhidRef = useRef("");
  const { data: billData, refetch: refetchBillData, } = useGetMedicineBillByIdQuery(id, {
    skip: !id,
  });

  const {
    data: medicineResponse,
    refetch: refetchMedicineList,
  } = useGetMediceneListQuery(
    { searchTerm: debouncedMedicine || skipToken },
    { skip: !debouncedMedicine || debouncedMedicine.length < 2 }
  );
  const medicineList = React.useMemo(
    () => medicineResponse?.data || [],
    [medicineResponse],
  );
  const { data: suggestions = [],
    refetch: refetchBillSearch,
  } = useSearchOpdBillNoQuery(debouncedUhid, {
    skip: debouncedUhid.length < 1 || id,
  });
  const { data: paymodes, refetch: refetchPaymode, } = useGetComboQuery("paymode");
  const [createMedicineBill] = useCreateMedicineBillMutation();
  const [updateMedicineBill] = useUpdateMedicineBillMutation();
  const [triggerGetBillDetails] = useLazyGetBillingByBillNoQuery();
  const {
    data: stockDetails,
    refetch: refetchStock,
  } = useGetStockDetailsQuery(
    selectedMedicine
      ? { ItemID: String(selectedMedicine.id) }
      : skipToken
  );
  // const [isEditMedicineLoaded, setIsEditMedicineLoaded] = useState(false);
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
    if (selectedMedicine) return;
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
  }, [medicineList, debouncedMedicine, selectedMedicine]);
  const validationSchema = Yup.object({
    opdBillNo: Yup.string().required("Bill No is required"),
    payMode: Yup.string().required("Payment mode is required"),
  });
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
    validationSchema,
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
        Gender: values.Gender || "",
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
          stockDetailId: Number(i.stockDetailId || 0),
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
        navigate("/billing", {
          state: { goToList: true },
        });
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

        saleRate: cleanCurrency(item.Rate),
        discAmt: cleanCurrency(item.DiscountAmt),
        discountPercent: cleanCurrency(item.DiscountPC),

        cgstPercent: Number(item.CGST || 0),
        sgstPercent: Number(item.SGST || 0),

        cgstAmt: cleanCurrency(item.CGSTAmount),
        sgstAmt: cleanCurrency(item.SGSTAmount),

        taxableAmt: cleanCurrency(item.TaxableAmount),
        total: cleanCurrency(item.NetAmount),

        itemId: item.ItemID,
        stockId: item.StockID,
        stockNo: item.StockNo || "",

        basePrice: cleanCurrency(item.Baseprice),
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

      medicine: "",
      quantity: "",
      cp: "",
      cgst: 0,
      sgst: 0,
      discountPercent: 0,

      totalQuantity: Number(header.TotalQty || 0),
      totalAmount: Number(header.TotalAmount || 0),
      totalDiscount: Number(header.DiscountAmount || 0),
      paidAmount: Number(header.PaidAmount || 0),
      cgstAmount: Number(header.CGSTAmount || 0),
      sgstAmount: Number(header.SGSTAmount || 0),
      grossAmount: Number(header.GrossAmount || 0),
      taxableAmount: Number(header.TaxableAmount || 0),
      payMode: String(header.PayMode || ""),
      cashAmount: Number(header.CashAmount || 0),
      cardAmount: Number(header.CardAmount || 0),

      items: mappedItems,
    });

    // setMedicineSearch(firstItem?.description || "");
    setBillSearch(header.OPDBillNo || "");
    // setIsEditMedicineLoaded(true);
  }, [billData, id]);
  useEffect(() => {
    if (!patientData) return;
    if (patientData.ID !== selectedBill) return;
    if (populatedUhidRef.current === selectedBill) return;
    populatedUhidRef.current = selectedBill;

    const updates = {
      UHID: patientData.PicasoNo || "",
      Name: patientData.driverDetails[0]?.name || "",
      Gender: patientData.driverDetails[0]?.gender || "",
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

  //   useEffect(() => {

  //     const updates = {
  //       cgst: stockDetails?.data[0]?.CGST || 0,
  //       sgst: stockDetails?.data[0]?.SGST || 0,
  //       discountPercent: cleanCurrency(
  //         stockDetails?.data[0]?.DiscountPCperitem || 0,
  //       ),
  //       mrp: cleanCurrency(stockDetails?.data[0]?.MRPU || 0),
  //       cp: cleanCurrency(stockDetails?.data[0]?.CPU || 0),
  //     };
  //     formik.setValues({ ...formik.values, ...updates }, false);
  //   }, [stockDetails]);
  useEffect(() => {
    if (!stockDetails?.data?.length) return;

    const updates = {
      cgst: stockDetails.data[0].CGST || 0,
      sgst: stockDetails.data[0].SGST || 0,
      discountPercent: cleanCurrency(
        stockDetails.data[0].DiscountPCperitem || 0
      ),
      mrp: cleanCurrency(stockDetails.data[0].MRPU || 0),
      cp: cleanCurrency(stockDetails.data[0].CPU || 0),
    };

    formik.setValues(
      {
        ...formik.values,
        ...updates,
      },
      false
    );
  }, [stockDetails, medicineSelectionCount]);
  
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
    formik.setTouched({
      medicine: true,
      quantity: true,
    });
    if (!formik.values.medicine || !formik.values.quantity) {
      return;
    }
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

    const expDate = stockDetails?.data?.[0]?.ExpiryDate
      ? new Date(stockDetails.data[0].ExpiryDate).toISOString().split("T")[0]
      : null;
    const newItem = {
      description: formik.values.medicine,
      qty: sellingItemCost.qty,
      batchNo: stockDetails?.data[0]?.BatchNo || "N/A",
      hsn: stockDetails?.data[0]?.HSNCode || "N/A",
      expDate: expDate || null,
      saleRate: sellingItemCost.salePrice,
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
      basePrice: cleanCurrency(stockDetails?.data[0]?.CPU),
      stockDetailId: stockDetails?.data[0]?.ID || 0,
    };
    formik.setFieldValue("items", [...formik.values.items, newItem]);
    formik.setFieldValue("medicine", "");
    formik.setFieldValue("quantity", "");
    formik.setFieldValue("cp", "");
    formik.setFieldValue("mrp", "");
    formik.setFieldValue("discountPercent", 0);
    formik.setFieldValue("cgst", 0);
    formik.setFieldValue("sgst", 0);
    formik.setFieldTouched("medicine", false);
    formik.setFieldTouched("quantity", false);
    setMedicineSearch("");
    setSelectedMedicine(null);
    setMedicineSuggestions([]);
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
useEffect(() => {

  const paid = Number(formik.values.paidAmount || 0);

  if (formik.values.payMode === "1" || formik.values.payMode === "") {

    formik.setFieldValue("cashAmount", paid);
    formik.setFieldValue("cardAmount", 0);

  }

  else if (formik.values.payMode === "3") {

  }

  else {

    formik.setFieldValue("cashAmount", 0);
    formik.setFieldValue("cardAmount", paid);

  }

}, [
  formik.values.payMode,
  formik.values.paidAmount
]);
  useEffect(() => {
    if (selectedMedicine?.id) {
      refetchStock();
    }
  }, [selectedMedicine?.id]);
 

  return (
    <FormikProvider value={formik}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 py-10">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <span className="bg-blue-100 p-2 rounded-xl">
                <CreditCardIcon className="w-6 text-blue-600" />
              </span>
              {id ? "Edit Medicine Billing" : "Medicine Billing"}
            </h1>

            <div className="flex gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-2 w-12 rounded-full ${activeStep >= s ? "bg-sky-600" : "bg-sky-100"
                    }`}
                />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex border-b">
              {[
                { id: 1, label: "Patient", icon: ClipboardDocumentIcon },
                { id: 2, label: "Medicine", icon: BeakerIcon },
                // { id: 3, label: "Items", icon: CreditCardIcon },
                { id: 3, label: "Payment", icon: DocumentCheckIcon },
                { id: 4, label: "Summary", icon: CheckCircleIcon },
              ].map((step) => (
                <button
                  key={step.id}
                  type="button"
                  disabled
                  onClick={() => setActiveStep(step.id)}
                  className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-semibold
${activeStep === step.id ? "bg-white text-sky-600 shadow" : "text-gray-400"}
`}
                >
                  <step.icon className="w-4 h-4" />

                  {step.label}
                </button>
              ))}
            </div>
            <form onSubmit={formik.handleSubmit} className="space-y-6 p-6">
              {activeStep === 1 && (
                <section className="space-y-4">
                  <h3 className="text-sky-700 font-semibold text-lg">
                    Patient Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">


                      {/* <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className={`${baseInput} ${
                          formik.touched.opdBillNo && formik.errors.opdBillNo
                            ? "border-red-500"
                            : ""
                        }`}
                        placeholder="Search Bill no (e.g., 123)"
                        value={billSearch || formik.values.opdBillNo}
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
                      {formik.touched.opdBillNo && formik.errors.opdBillNo && (
  <p className="text-red-500 text-sm mt-1">
    {formik.errors.opdBillNo}
  </p>
)} */}
                      <Input
                        label="Bill No"
                        required
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Search Bill no (e.g., 123)"
                        value={formik.values.opdBillNo}
                        onBlur={() =>
                          formik.setFieldTouched("opdBillNo", true)
                        }
                        onChange={(e) => {
                          if (id) return;

                          const val = e.target.value.replace(/\D/g, "");

                          setBillSearch(val);

                          setSelectedBill("");

                          formik.setFieldValue("opdBillNo", val);

                          setSuggestionsList([]);

                          populatedUhidRef.current = "";
                        }}
                        error={
                          formik.touched.opdBillNo &&
                          formik.errors.opdBillNo
                        }
                        autoComplete="off"
                      />


                      {suggestionsList.length > 0 && billSearch.length >= 1 && (
                        <ul className="absolute z-20 bg-white border rounded-md shadow-md w-full max-h-48 overflow-auto">
                          {suggestionsList.map((item) => (
                            <li
                              key={item.ID}
                              onClick={() => {
                                setSelectedBill(item.ID);

                                formik.setValues({
                                  ...formik.values,
                                  opdBillNo: item.ID,
                                });

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
                    <Input
                      label="Name"
                      {...formik.getFieldProps("Name")}
                      readOnly
                    />
                    <Input
                      label="UHID"
                      {...formik.getFieldProps("UHID")}
                      readOnly
                      className="bg-sky-50"
                    />
                    <Input
                      label="Age"
                      {...formik.getFieldProps("Age")}
                      readOnly
                    />
                    <Input
                      label="Gender"
                      {...formik.getFieldProps("Gender")}
                      readOnly
                    />
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
                  </div>
                </section>
              )}

              {activeStep === 2 && (
                <section className="bg-sky-50/40 p-6 rounded-xl border border-sky-100 space-y-6 shadow-sm">
                  <h3 className="text-sky-700 font-semibold mb-3">
                    Medicine Entry
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                      <label className="text-sm text-gray-600 block mb-1">
                        Medicine <span className="text-red-500">*</span>
                      </label>

                      <input
                        type="text"
                        className={`${baseInput}
  ${formik.touched.medicine &&
                            !formik.values.medicine
                            ? "border-red-500"
                            : ""}
  ${!formik.values.opdBillNo
                            ? "bg-sky-50 cursor-not-allowed"
                            : ""}`}
                        placeholder="Search Medicine"
                        value={medicineSearch || formik.values.medicine}
                        disabled={!formik.values.opdBillNo}
                        onChange={(e) => {
                          setMedicineSearch(e.target.value);
                          setSelectedMedicine(null);
                          formik.setFieldValue("medicine", e.target.value);
                        }}
                        autoComplete="off"
                      />
                      {formik.touched.medicine && !formik.values.medicine && (
                        <p className="text-red-500 text-sm mt-1">
                          Medicine is required
                        </p>
                      )}

                      {medicineSuggestions.length > 0 && !selectedMedicine && (
                        <ul className="absolute z-20 bg-white border rounded-md shadow-md w-full max-h-48 overflow-auto">
                          {medicineSuggestions.map((item) => (
                            <li
                              key={item.id}

                              onClick={() => {
                                setSelectedMedicine(item);

                                setMedicineSelectionCount((prev) => prev + 1);

                                setMedicineSearch(item.descriptions);

                                formik.setFieldValue("medicine", item.descriptions);

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
                    <Input
                      label="MRPU"
                      {...formik.getFieldProps("mrp")}
                      readOnly
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                    <Input
                      label="Quantity"
                      required
                      error={
                        formik.touched.quantity &&
                          (
                            !formik.values.quantity ||
                            isNaN(formik.values.quantity)
                          )
                          ? "Quantity is required"
                          : ""
                      }
                      {...formik.getFieldProps("quantity")}
                      placeholder="Qty"
                      onChange={(e) => {
                        const value = e.target.value;

                        if (/^\d*$/.test(value)) {
                          formik.setFieldValue("quantity", value);
                        }
                      }}
                    />
                    <Input
                      label="CPU"
                      {...formik.getFieldProps("cp")}
                      readOnly
                    />
                    <Input
                      label="Discount (%)"
                      {...formik.getFieldProps("discountPercent")}
                      readOnly
                    />
                    <Input
                      label="Bill No"
                      {...formik.getFieldProps("billNo")}
                      readOnly
                    />
                    <Button
                      type="button"
                      onClick={addItemToList}
                      className="bg-emerald-600 text-white hover:bg-emerald-700 h-9"
                    >
                      <PlusIcon className="w-4 h-4 mr-1" /> Add Item
                    </Button>
                  </div>
                </section>
              )}

              {activeStep === 2 && (
                <section className="space-y-4">
                  <h3 className="text-sky-700 font-semibold mb-3">
                    Items List
                  </h3>

                  {formik.values.items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50 rounded-xl border border-dashed">
                      <BeakerIcon className="w-12 h-12 text-slate-400 mb-3" />

                      <h4 className="text-slate-600 font-semibold text-lg">
                        No Medicines Added
                      </h4>

                      <p className="text-slate-400 text-sm mt-1">
                        Please add medicines to continue billing
                      </p>

                      {/* <Button
                        type="button"
                        variant="sky"
                        className="mt-4"
                        onClick={() => setActiveStep(2)}
                      >
                        <PlusIcon className="w-4 h-4 mr-1" />
                        Add Medicine
                      </Button> */}
                    </div>
                  ) : (
                    <div className="mt-6 bg-white rounded-xl shadow-sm border border-sky-100 overflow-hidden">
                      <div className="px-4 py-3 border-b border-sky-100 bg-white">
                        <h2 className="text-sky-700 font-semibold text-sm">
                          Item List
                        </h2>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-sky-50 text-sky-700">
                            <tr>
                              <th className="px-3 py-3 text-left">SL</th>
                              <th className="px-3 py-3 text-left">
                                Description
                              </th>
                              <th className="px-3 py-3 text-center">Qty</th>
                              <th className="px-3 py-3 text-center">Batch</th>
                              <th className="px-3 py-3 text-center">HSN</th>
                              <th className="px-3 py-3 text-center">Exp</th>
                              <th className="px-3 py-3 text-right">
                                Sale Rate
                              </th>
                              <th className="px-3 py-3 text-right">Disc %</th>
                              <th className="px-3 py-3 text-right">Disc Amt</th>
                              <th className="px-3 py-3 text-right">CGST %</th>
                              <th className="px-3 py-3 text-right">CGST Amt</th>
                              <th className="px-3 py-3 text-right">SGST %</th>
                              <th className="px-3 py-3 text-right">SGST Amt</th>
                              <th className="px-3 py-3 text-right">
                                Taxable Amt
                              </th>
                              <th className="px-3 py-3 text-right">Total</th>
                              <th className="px-3 py-3 text-center">Action</th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-gray-100">
                            <FieldArray name="items">
                              {({ remove }) =>
                                formik.values.items.map((item, index) => (
                                  <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-3 py-3">{index + 1}</td>

                                    <td className="px-3 py-3 font-medium">
                                      {item.description}
                                    </td>

                                    <td className="px-3 py-3 text-center">
                                      {item.qty}
                                    </td>

                                    <td className="px-3 py-3 text-center text-xs">
                                      {item.batchNo}
                                    </td>

                                    <td className="px-3 py-3 text-center text-xs">
                                      {item.hsn}
                                    </td>

                                    <td className="px-3 py-3 text-center text-red-500 text-xs">
                                      {item.expDate
                                        ? new Date(item.expDate).toLocaleDateString("en-GB")
                                        : "-"}
                                    </td>

                                    <td className="px-3 py-3 text-right">
                                      Rs.{item.saleRate}
                                    </td>

                                    <td className="px-3 py-3 text-right">
                                      {item.discountPercent}
                                    </td>

                                    <td className="px-3 py-3 text-right">
                                      Rs.{item.discAmt}
                                    </td>

                                    <td className="px-3 py-3 text-right">
                                      {item.cgstPercent}
                                    </td>

                                    <td className="px-3 py-3 text-right">
                                      Rs.{item.cgstAmt}
                                    </td>

                                    <td className="px-3 py-3 text-right">
                                      {item.sgstPercent}
                                    </td>

                                    <td className="px-3 py-3 text-right">
                                      Rs.{item.sgstAmt}
                                    </td>

                                    <td className="px-3 py-3 text-right">
                                      {Number(item.taxableAmt || 0).toFixed(2)}
                                    </td>

                                    <td className="px-3 py-3 text-right font-bold text-sky-700">
                                      {/* Rs.{item.total.toFixed(2)} */}Rs.
                                      {Number(item.total || 0).toFixed(2)}
                                    </td>

                                    <td className="px-3 py-3 text-center">
                                      <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="text-red-500 hover:text-red-700"
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
                </section>
              )}

              {activeStep === 3 && (
                <section className="bg-gray-50 p-6 rounded-xl border">
                  <h3 className="text-sky-700 font-semibold mb-4">
                    Payment Summary
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
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
                        <Select
                        label="Pay Mode"
                        required
                        value={formik.values.payMode}
                        error={formik.touched.payMode && formik.errors.payMode}
                        onChange={(e) => {

                          const mode = e.target.value;

                          formik.setFieldValue("payMode", mode);

                          const paid = Number(formik.values.paidAmount || 0);

                          if (mode === "1") {

                            formik.setFieldValue("cashAmount", paid);
                            formik.setFieldValue("cardAmount", 0);

                          }

                          else if (mode === "3") {

                            formik.setFieldValue("cashAmount", "");
                            formik.setFieldValue("cardAmount", "");

                          }

                          else {

                            formik.setFieldValue("cashAmount", 0);
                            formik.setFieldValue("cardAmount", paid);

                          }

                        }}
                      >

                        <option value="">Select</option>

                        {Picaso_Paymode_Options.map((m) => (

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
  value={formik.values.paidAmount}
  onChange={(e) => {
    const value = e.target.value;

   
    if (!/^\d*\.?\d{0,2}$/.test(value)) return;

    formik.setFieldValue("paidAmount", value);

    const paid = Number(value || 0);

    if (formik.values.payMode === "1" || formik.values.payMode === "") {
      formik.setFieldValue("cashAmount", paid);
      formik.setFieldValue("cardAmount", 0);
    } else if (formik.values.payMode === "3") {
      
    } else {
      formik.setFieldValue("cashAmount", 0);
      formik.setFieldValue("cardAmount", paid);
    }
  }}
/>

                        <Input
                        label="Cash Amount"
                        value={formik.values.cashAmount}
                        readOnly={formik.values.payMode !== "3"}
                        onChange={(e) => {

                          const value = e.target.value;

if (/^\d*\.?\d{0,2}$/.test(value)) {
    formik.setFieldValue("cashAmount", value);
}

                          if (formik.values.payMode === "3") {

                         formik.setFieldValue(
    "paidAmount",
    Number(value || 0) +
    Number(formik.values.cardAmount || 0)
);

                          }

                        }}
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
                       <Input
                        label="Card / Online Amount / Cost Free"
                        value={formik.values.cardAmount}
                        readOnly={formik.values.payMode !== "3"}
                        onChange={(e) => {

                          const value = e.target.value;

if (/^\d*\.?\d{0,2}$/.test(value)) {
    formik.setFieldValue("cardAmount", value);
}

                          if (formik.values.payMode === "3") {

                           formik.setFieldValue(
    "paidAmount",
    Number(value || 0) +
    Number(formik.values.cashAmount || 0)
);

                          }

                        }}
                      />
                    </div>
                  </div>
                </section>
              )}
              {activeStep === 4 && (
                <div className="bg-sky-50 p-6 rounded-xl space-y-4 border border-sky-200">

                  <h3 className="text-lg font-semibold text-sky-700">
                    Confirm Bill
                  </h3>

                  {/* Patient Details */}
                  <div className="grid md:grid-cols-2 gap-4 text-sm">

                    <p>
                      <b>Bill No:</b> {formik.values.opdBillNo}
                    </p>

                    <p>
                      <b>UHID:</b> {formik.values.UHID}
                    </p>

                    <p>
                      <b>Name:</b> {formik.values.Name}
                    </p>

                    <p>
                      <b>Gender:</b> {formik.values.Gender}
                    </p>

                    <p>
                      <b>Age:</b> {formik.values.Age}
                    </p>

                    <p>
                      <b>Mobile:</b> {formik.values.Mobile}
                    </p>

                    <p>
                      <b>Category:</b> {formik.values.FinCategory}
                    </p>

                    <p>
                      <b>Payment Mode:</b>
                      {
                        Picaso_Paymode_Options.find(
                          (x) =>
                            String(x.id) ===
                            String(formik.values.payMode)
                        )?.name || "-"
                      }
                    </p>

                  </div>

                  {/* Payment Summary */}
                  <div className="border-t pt-3 text-sm grid md:grid-cols-3 gap-3">

                    <p>
                      <b>Total Qty:</b>{" "}
                      {formik.values.totalQuantity || 0}
                    </p>

                    <p>
                      <b>Gross Amount:</b> {" "}
                      {formik.values.grossAmount || 0}
                    </p>

                    <p>
                      <b>Discount:</b> {" "}
                      {formik.values.totalDiscount || 0}
                    </p>

                    <p>
                      <b>CGST:</b> {" "}
                      {formik.values.cgstAmount || 0}
                    </p>

                    <p>
                      <b>SGST:</b> {" "}
                      {formik.values.sgstAmount || 0}
                    </p>

                    <p>
                      <b>Taxable Amount:</b> {" "}
                      {formik.values.taxableAmount || 0}
                    </p>

                    <p>
                      <b>Paid Amount:</b> {" "}
                      {formik.values.paidAmount || 0}
                    </p>

                    <p>
                      <b>Due Amount:</b> {" "}
                      {formik.values.dueAmount || 0}
                    </p>

                    <p className="text-emerald-600 font-semibold">
                      <b>Final Amount:</b> {" "}
                      {formik.values.totalAmount || 0}
                    </p>

                  </div>

                  {/* Medicine Details */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-slate-700 mb-2">
                      Medicines ({formik.values.items?.length || 0})
                    </h4>

                    {formik.values.items?.length > 0 ? (
                      <div className="overflow-x-auto rounded-xl border border-sky-100">

                        <table className="min-w-full text-sm">

                          <thead className="bg-sky-100 text-slate-700">
                            <tr>
                              <th className="px-3 py-2 text-left">
                                Medicine
                              </th>

                              <th className="px-3 py-2 text-left">
                                Batch
                              </th>

                              <th className="px-3 py-2 text-left">
                                HSN
                              </th>

                              <th className="px-3 py-2 text-center">
                                Qty
                              </th>

                              <th className="px-3 py-2 text-right">
                                MRP
                              </th>

                              <th className="px-3 py-2 text-right">
                                Total
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {formik.values.items.map((item, idx) => (
                              <tr
                                key={idx}
                                className="border-t border-sky-50"
                              >
                                <td className="px-3 py-2 font-medium">
                                  {item.description || "-"}
                                </td>

                                <td className="px-3 py-2">
                                  {item.batchNo || "-"}
                                </td>

                                <td className="px-3 py-2">
                                  {item.hsn || "-"}
                                </td>

                                <td className="px-3 py-2 text-center">
                                  {item.qty || 0}
                                </td>

                                <td className="px-3 py-2 text-right">
                                  {item.saleRate || 0}
                                </td>

                                <td className="px-3 py-2 text-right font-semibold">
                                  {item.total || 0}
                                </td>
                              </tr>
                            ))}
                          </tbody>

                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500">
                        No medicines added
                      </p>
                    )}
                  </div>

                </div>
              )}
              <div className="flex justify-between items-center pt-6 border-t">
                <div className="flex gap-3">
                  {activeStep > 1 && (
                    <Button type="button" variant="gray" onClick={prevStep}>
                      Back
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="gray"
                    onClick={() => {

                      if (activeStep === 1) {
                        formik.setValues({
                          ...formik.values,
                          opdBillNo: "",
                          Name: "",
                          UHID: "",
                          Age: "",
                          Gender: "",
                          Mobile: "",
                          FinCategory: "",
                        });

                        setBillSearch("");
                        setSelectedBill("");
                        setSuggestionsList([]);
                        populatedUhidRef.current = "";
                      }
                      if (activeStep === 2) {
                        formik.setValues({
                          ...formik.values,
                          medicine: "",
                          quantity: "",
                          cp: "",
                          mrp: "",
                          discountPercent: 0,
                          cgst: 0,
                          sgst: 0,
                          billNo: "",

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
                        });

                        setMedicineSearch("");
                        setSelectedMedicine(null);
                        setMedicineSuggestions([]);
                        refetchMedicineList();
                        refetchStock();
                        refetchBillSearch();
                        refetchPatientData();
                        refetchBillData();
                        refetchPaymode();
                      }


                      if (activeStep === 3) {
                        formik.setValues({
                          ...formik.values,
                          payMode: "",
                          paidAmount: 0,
                          dueAmount: 0,
                        });
                      }

                      if (activeStep === 4) {

                        formik.resetForm();

                        setActiveStep(1);

                        setBillSearch("");

                        setSelectedBill("");

                        setSuggestionsList([]);

                        populatedUhidRef.current = "";

                        setMedicineSearch("");

                        setSelectedMedicine(null);

                        setMedicineSuggestions([]);
                      }
                    }}
                  >
                    <ArrowPathIcon className="w-5 h-5 mr-1" />
                    Reset
                  </Button>
                </div>

                <div>
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
                      {id ? "Update " : "Save "}
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

export default BillingFormCopy;

