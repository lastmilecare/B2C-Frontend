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

const BillingFormCopy = ({ refetchList }) => {
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
        selectedBill ? String(selectedBill) : skipToken
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

        }
    });
    useEffect(() => {
        if (!billData || !id) return;

        const header = billData.header;

        const mappedItems = billData.items?.map((item) => ({
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


            items: []
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
            { qty: 0, disc: 0, cgst: 0, sgst: 0, gross: 0 }
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
            paidAmount: id ? formik.values.paidAmount : totals.gross.toFixed(2),
        }, false);
    }, [formik.values.items]);
    useEffect(() => {
        const total = Number(formik.values.totalAmount) || 0;
        const paid = Number(formik.values.paidAmount) || 0;

        formik.setFieldValue(
            "dueAmount",
            (total - paid).toFixed(2)
        );
    }, [formik.values.paidAmount, formik.values.totalAmount]);

    return (

        
        <FormikProvider value={formik}>

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 py-10">

    <div className="max-w-[1400px] mx-auto px-8">
     <div className="flex justify-between items-center mb-10">

  <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
    <span className="bg-blue-100 p-2 rounded-xl">
      <CreditCardIcon className="w-6 text-blue-600" />
    </span>
    Medicine Billing
  </h1>

 
  <div className="flex gap-2">
    {[1, 2, 3, 4,5].map((s) => (
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
  { id: 1, label: "Patient", icon: ClipboardDocumentIcon },
  { id: 2, label: "Medicine", icon: BeakerIcon },
  { id: 3, label: "Items", icon: CreditCardIcon },
  { id: 4, label: "Payment", icon: DocumentCheckIcon },
  { id: 5, label: "Summary", icon: CheckCircleIcon }, 
].map((step) => (

                                <button
                                    key={step.id}
                                    type="button"
                                    disabled
                                    onClick={() => setActiveStep(step.id)}
                                    className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-semibold
${activeStep === step.id
                                            ? "bg-white text-sky-600 shadow"
                                            : "text-gray-400"}
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
                                            <label className="text-sm text-gray-600 block mb-1">
                                                Bill no <span className="text-red-500">*</span>
                                            </label>

                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                className={baseInput}
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

                                            {suggestionsList.length > 0 && billSearch.length >= 1 && (
                                                <ul className="absolute z-20 bg-white border rounded-md shadow-md w-full max-h-48 overflow-auto">
                                                    {suggestionsList.map((item) => (
                                                        <li
                                                            key={item.ID}
                                                            onClick={() => {
                                                                setSelectedBill(item.ID);

                                                                formik.setValues({
                                                                    ...formik.values,
                                                                    opdBillNo: item.ID
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
                             ${!formik.values.opdBillNo ? "bg-sky-50 cursor-not-allowed" : ""}`}
                                                placeholder={"Search Medicine"}
                                                value={medicineSearch || formik.values.medicine}
                                                disabled={!formik.values.opdBillNo}
                                                onChange={(e) => {
                                                    setMedicineSearch(e.target.value);
                                                    setSelectedMedicine(null);
                                                    formik.setFieldValue("medicine", e.target.value);
                                                }}
                                                autoComplete="off"
                                            />


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
                                        <Input label="Bill No" {...formik.getFieldProps("billNo")} readOnly />
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

                            {activeStep === 3 && (

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
                                                Please go back and add medicines to continue billing
                                            </p>

                                            <Button
                                                type="button"
                                                variant="sky"
                                                className="mt-4"
                                                onClick={() => setActiveStep(2)}
                                            >
                                                <PlusIcon className="w-4 h-4 mr-1" />
                                                Add Medicine
                                            </Button>

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
                                                            <th className="px-3 py-3 text-left">Description</th>
                                                            <th className="px-3 py-3 text-center">Qty</th>
                                                            <th className="px-3 py-3 text-center">Batch</th>
                                                            <th className="px-3 py-3 text-center">HSN</th>
                                                            <th className="px-3 py-3 text-center">Exp</th>
                                                            <th className="px-3 py-3 text-right">Sale Rate</th>
                                                            <th className="px-3 py-3 text-right">Disc %</th>
                                                            <th className="px-3 py-3 text-right">Disc Amt</th>
                                                            <th className="px-3 py-3 text-right">CGST %</th>
                                                            <th className="px-3 py-3 text-right">CGST Amt</th>
                                                            <th className="px-3 py-3 text-right">SGST %</th>
                                                            <th className="px-3 py-3 text-right">SGST Amt</th>
                                                            <th className="px-3 py-3 text-right">Taxable Amt</th>
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
                                                                            {item.expDate}
                                                                        </td>

                                                                        <td className="px-3 py-3 text-right">
                                                                            ₹{item.saleRate}
                                                                        </td>

                                                                        <td className="px-3 py-3 text-right">
                                                                            {item.discountPercent}
                                                                        </td>

                                                                        <td className="px-3 py-3 text-right">
                                                                            ₹{item.discAmt}
                                                                        </td>

                                                                        <td className="px-3 py-3 text-right">
                                                                            {item.cgstPercent}
                                                                        </td>

                                                                        <td className="px-3 py-3 text-right">
                                                                            ₹{item.cgstAmt}
                                                                        </td>

                                                                        <td className="px-3 py-3 text-right">
                                                                            {item.sgstPercent}
                                                                        </td>

                                                                        <td className="px-3 py-3 text-right">
                                                                            ₹{item.sgstAmt}
                                                                        </td>

                                                                        <td className="px-3 py-3 text-right">
                                                                            {Number(item.taxableAmt || 0).toFixed(2)}
                                                                        </td>

                                                                        <td className="px-3 py-3 text-right font-bold text-sky-700">
                                                                            ₹{item.total.toFixed(2)}
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


                            {activeStep === 4 && (
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
                                            <Select label="Pay Mode *" {...formik.getFieldProps("payMode")}>
                                                <option value="">-- Select --</option>
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
                                    </div>
                                </section>

                            )}
                            {activeStep === 5 && (
  <section className="bg-blue-50 p-6 rounded-xl border border-blue-200">

    <h3 className="text-sky-600 font-semibold mb-4">
      Final Summary
    </h3>

    <div className="grid md:grid-cols-2 gap-4 text-sm">

      <p><b>Name:</b> {formik.values.Name}</p>
      <p><b>UHID:</b> {formik.values.UHID}</p>
      <p><b>Mobile:</b> {formik.values.Mobile}</p>
      <p><b>Category:</b> {formik.values.FinCategory}</p>

      <p><b>Total Items:</b> {formik.values.items.length}</p>
      <p><b>Total Qty:</b> {formik.values.totalQuantity}</p>

      <p><b>Total Amount:</b> ₹ {formik.values.totalAmount}</p>
      <p><b>Discount:</b> ₹ {formik.values.totalDiscount}</p>

      <p><b>GST:</b> ₹ {Number(formik.values.cgstAmount) + Number(formik.values.sgstAmount)}</p>
      <p><b>Paid:</b> ₹ {formik.values.paidAmount}</p>

      <p><b>Due:</b> ₹ {formik.values.dueAmount}</p>
      <p><b>Payment Mode:</b> {formik.values.payMode}</p>

    </div>

  </section>
)}
               <div className="flex justify-between items-center pt-6 border-t">

  
  <div className="flex gap-3">
     {activeStep > 1 && (
      <Button type="button" variant="gray" onClick={prevStep}>
        Back
      </Button>
    )}


    <Button type="button" variant="gray" onClick={formik.handleReset}>
      <ArrowPathIcon className="w-5 h-5 mr-1" /> Reset
    </Button>

   
  </div>

  
  <div>
    {activeStep < 5 ? (
      <Button type="button" variant="sky" onClick={nextStep}>
        Continue
      </Button>
    ) : (
      <Button type="button" variant="sky" onClick={formik.handleSubmit}>
        Save Bill
      </Button>
    )}
  </div>


</div>
                        </form>

                    </div>
                </div>
            </div>

        </FormikProvider>

    )
};

export default BillingFormCopy;
