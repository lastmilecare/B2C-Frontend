import React, { useEffect, useMemo, useState } from "react";
import {
  PlusIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ClipboardDocumentIcon,
  DocumentCheckIcon,
  BeakerIcon,
  CreditCardIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { healthAlerts } from "../utils/healthSwal";
import useDebounce from "../hooks/useDebounce";
import {
  Input,
  NumericInput,
  Select,
  Button,
} from "../components/UIComponents";
import {
  useCreateMedicineStockMutation,
  useGetComboQuery,
  useGetMediceneListQuery,
  useUpdateStockDetailsMutation,
} from "../redux/apiSlice";
import { cookie } from "../utils/cookie";
import { skipToken } from "@reduxjs/toolkit/query";
import { useLocation } from "react-router-dom";
import { useParams } from "react-router-dom";
import StepProgress from "../components/StepProgress";
import PageLayout from "../components/PageLayout";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { formatDateOnly } from "../utils/helper";
const username = cookie.get("username");
const userId = cookie.get("user_id");
const GRNFormCopy = () => {
  const [activeStep, setActiveStep] = useState(1);

  const nextStep = async () => {
    const errors = await formik.validateForm();

    if (
      activeStep === 1 &&
      (errors.InvoiceDate || errors.RecieptNo || errors.SupplierName)
    ) {
      formik.setTouched({
        InvoiceDate: true,
        RecieptNo: true,
        SupplierName: true,
      });

      return;
    }
    if (
      activeStep === 2 &&
      formik.values.items.length === 0
    ) {
      healthAlerts.warning(
        "Please add at least one item"
      );

      return;
    }



    setActiveStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setActiveStep((prev) => prev - 1);
  };
  const centerIdFromCookie = cookie.get("center_id");
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const editData = location.state?.editData;
  const [createMedicineStock, { isLoading }] = useCreateMedicineStockMutation();
  const [updateStockDetails] = useUpdateStockDetailsMutation();
  const { data: itemType, isLoading: doctorsComboLoading } =
    useGetComboQuery("medicine-type");
  const { data: HSNCode, isLoading: HSNCodeLoading } =
    useGetComboQuery("hsn-code");
  const { data: Supplier, isLoading: SupplierLoading } =
    useGetComboQuery("mediciene-supplier");
  const validationSchema = Yup.object({
    InvoiceDate: Yup.string().required(
      "Invoice Date is required"
    ),

    RecieptNo: Yup.string().required(
      "Invoice No is required"
    ),

    SupplierName: Yup.string().required(
      "Supplier is required"
    ),


  });
  const [medicineSuggestions, setMedicineSuggestions] = useState([]);

  const [medicineSearch, setMedicineSearch] = useState("");
  const debouncedMedicine = useDebounce(medicineSearch, 500);

  const { data: medicineResponse } = useGetMediceneListQuery(
    { searchTerm: debouncedMedicine || skipToken },
    { skip: !debouncedMedicine || debouncedMedicine.length < 2 },
  );
  const medicineList = React.useMemo(
    () => medicineResponse?.data || [],
    [medicineResponse],
  );
  const medicineTypeOptions = itemType
    ? itemType.map((t) => ({ value: t.ID, label: t.Descriptions }))
    : [];

  const hsnCodeOptions = HSNCode
    ? HSNCode.map((t) => ({
      value: t.HSNID,
      label: t.HSNCode,
      CGST: t.CGST,
      SGST: t.SGST,
    }))
    : [];

  const SupplierOptions = Supplier
    ? Supplier.map((t) => ({ value: t.ID, label: t.name }))
    : [];
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  const formik = useFormik({
    initialValues: {
      InvoiceDate: "",
      StockID: "",
      StockNo: "",
      RecieptNo: "",
      ItemTypeID: 0,
      ItemType: "",
      ItemID: 0,
      ItemName: "",
      BatchNo: "",
      SupplierName: "",
      SupplierID: 0,
      CentreID: 0,
      CGST: "",
      SGST: "",
      CGSTAmount: 0,
      SGSTAmount: 0,
      MenufacturingDate: "",
      ExpiryDate: "",
      RagNo: "",
      HSNCode: "",
      HSNID: "",
      TotalAmount: 0,
      TotalDiscount: 0,
      GrandTotal: 0,
      NoStrip: 0,
      NoQtyperStrip: 0,
      CPperStrip: 0,
      MRPperStrip: 0,
      CP: 0,
      MRP: 0,
      FreeRecvQty: 0,
      RecvQty: 0,
      DiscountPCperitem: 0,
      Discountperitem: 0,
      CPU: 0,
      MRPU: 0,
      BalQty: 0,
      IssueQty: 0,
      CondmQty: 0,
      ReturnQty: 0,
      IsDeathStock: 0,
      Remarks: "",
      UserloginID: Number(userId) || 0,
      AddedBy: Number(userId) || 0,
      ModifiedDate: new Date(),
      ModifiedBy: 0,
      Isopen: false,
      StockStatus: 0,
      items: [],
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!values.items?.length) {
        healthAlerts.error("Add at least one item", "GRN");
        return;
      }

      const totalAmount = values.items.reduce(
        (sum, item) => sum + Number(item.totalCp || 0),
        0,
      );

      const totalDiscount = values.items.reduce(
        (sum, item) => sum + Number(item.DiscountAmt || 0),
        0,
      );

      const grandTotal = values.items.reduce(
        (sum, item) => sum + Number(item.total || 0),
        0,
      );

      const payload = {
        ...values,
        TotalAmount: totalAmount,
        TotalDiscount: totalDiscount,
        GrandTotal: grandTotal,
        ModifiedDate: new Date(),
        CentreID: values.CentreID || Number(cookie.get("center_id")),
        items: values.items.map((item) => ({
          ...item,
          RecvQty: Number(item.RecvQty),
          FreeRecvQty: Number(item.FreeRecvQty || 0),
          CP: Number(item.CP),
          MRP: Number(item.MRP),
        })),
      };

      try {
        let res;

        if (isEditMode) {
          res = await updateStockDetails({
            id,
            body: payload,
          }).unwrap();
        } else {
          res = await createMedicineStock(payload).unwrap();
        }

        healthAlerts.success(res.message, "Inventory");

        resetForm();
        navigate("/purchased-entry", {
          state: { goToStock: true },
        });
      } catch (error) {
        healthAlerts.error(
          error?.data?.message || "Operation failed",
          "Inventory",
        );
      }
    },
  });
  useEffect(() => {
    if (!editData) return;
    const cleanNumber = (val) => {
      if (!val) return 0;
      return Number(String(val).replace(/[$,]/g, ""));
    };

    formik.setValues({
      ...formik.initialValues,

      InvoiceDate: editData.InvoiceDate?.split("T")[0] ?? "",
      RecieptNo: editData.RecieptNo ?? "",
      SupplierID: editData.SupplierID ?? 0,
      SupplierName: editData.SupplierName ?? "",
      RagNo: editData.RagNo ?? "",
      CentreID: editData.CentreID ?? 0,
      ItemID: editData.ItemID ?? 0,
      ItemName: editData.ItemName ?? "",
      ItemTypeID: editData.ItemTypeID ?? 0,
      ItemType: "",
      BatchNo: editData.BatchNo ?? "",
      MenufacturingDate: editData.MenufacturingDate?.split("T")[0] ?? "",
      ExpiryDate: editData.ExpiryDate?.split("T")[0] ?? "",

      NoStrip: editData.NoStrip ?? 0,
      NoQtyperStrip: editData.NoQtyperStrip ?? 0,
      RecvQty: editData.RecvQty ?? 0,
      FreeRecvQty: editData.FreeRecvQty ?? 0,

      CP: cleanNumber(editData.CP),
      MRP: cleanNumber(editData.MRP),

      DiscountPCperitem: cleanNumber(editData.DiscountPCperitem),
      Discountperitem: cleanNumber(editData.Discountperitem),

      CGST: editData.CGST ?? 0,
      SGST: editData.SGST ?? 0,
      HSNCode: editData.HSNCode ?? "",
      HSNID:
        editData.HSNID ||
        hsnCodeOptions.find(
          (h) => h.label === editData.HSNCode
        )?.value ||
        "",
      items: [],
    });

    setMedicineSearch(editData.ItemName ?? "");
  }, [editData]);

  useEffect(() => {
    if (!medicineTypeOptions.length) return;
    if (!formik.values.ItemTypeID) return;

    const found = medicineTypeOptions.find(
      (t) => t.value === formik.values.ItemTypeID,
    );

    if (found && formik.values.ItemType !== found.label) {
      formik.setFieldValue("ItemType", found.label);
    }
  }, [medicineTypeOptions, formik.values.ItemTypeID]);
  useEffect(() => {
    if (selectedMedicine) return;
    if (!debouncedMedicine || debouncedMedicine.length < 2) {
      setMedicineSuggestions([]);
      return;
    }
    // if (debouncedMedicine === formik.values.ItemName && formik.values.ItemID !== 0) {
    //   setMedicineSuggestions([]);
    //   return;
    // }

    if (medicineList && medicineList.length > 0) {
      setMedicineSuggestions(medicineList);
    } else {
      setMedicineSuggestions([]);
    }
  }, [medicineList, debouncedMedicine, selectedMedicine]);

  useEffect(() => {
    const unit = Number(formik.values.NoStrip || 0);
    const qty = Number(formik.values.NoQtyperStrip || 0);
    formik.setFieldValue("RecvQty", unit * qty > 0 ? unit * qty : "");
  }, [formik.values.NoStrip, formik.values.NoQtyperStrip]);

  const calculatedValues = useMemo(() => {
    const noStrip = Number(formik.values.NoStrip || 0);

    const qtyPerStrip = Number(formik.values.NoQtyperStrip || 0);

    const recvQty = Number(formik.values.RecvQty || 0);

    // Price Per Strip
    const cpPerStrip = Number(formik.values.CP || 0);

    const mrpPerStrip = Number(formik.values.MRP || 0);

    // GST
    const cgst = Number(formik.values.CGST || 0);

    const sgst = Number(formik.values.SGST || 0);

    // Discount
    const discountPercent = Number(formik.values.DiscountPCperitem || 0);

    /**
     * Derived Per Qty Price
     */
    const cpPerQty = qtyPerStrip > 0 ? cpPerStrip / qtyPerStrip : 0;

    const mrpPerQty = qtyPerStrip > 0 ? mrpPerStrip / qtyPerStrip : 0;

    /**
     * Totals
     */
    const totalCp = recvQty * cpPerQty;

    const totalMrp = recvQty * mrpPerQty;

    /**
     * Discount
     */
    const discountAmt = (totalCp * discountPercent) / 100;

    /**
     * Taxable Amount
     */
    const taxableAmount = totalCp - discountAmt;

    /**
     * GST Amounts
     */
    const cgstAmt = (taxableAmount * cgst) / 100;

    const sgstAmt = (taxableAmount * sgst) / 100;

    /**
     * Final Total
     */
    const grandTotal = taxableAmount + cgstAmt + sgstAmt;

    return {
      noStrip,
      qtyPerStrip,
      recvQty,
      cpPerStrip,
      mrpPerStrip,
      cpPerQty,
      mrpPerQty,
      totalCp,
      totalMrp,
      discountPercent,
      discountAmt,
      taxableAmount,
      cgst,
      sgst,
      cgstAmt,
      sgstAmt,
      grandTotal,
    };
  }, [
    formik.values.NoStrip,
    formik.values.NoQtyperStrip,
    formik.values.RecvQty,
    formik.values.CP,
    formik.values.MRP,
    formik.values.CGST,
    formik.values.SGST,
    formik.values.DiscountPCperitem,
  ]);
  useEffect(() => {
    if (centerIdFromCookie) {
      formik.setFieldValue("CentreID", Number(centerIdFromCookie));
    }
  }, [centerIdFromCookie]);

  const handleAddItem = async () => {
    const v = formik.values;

    const requiredFields = [
      "ItemName",
      "BatchNo",
      "MenufacturingDate",
      "ExpiryDate",
      "NoStrip",
      "NoQtyperStrip",
      "CP",
      "MRP",
      // "DiscountPCperitem",
      "HSNCode",
      "CGST",
      "SGST",
    ];
    requiredFields.forEach((field) => {
      formik.setFieldTouched(field, true, false);

      if (!v[field]) {
        formik.setFieldError(
          field,
          `${field} is required`
        );
      }
    });

    const hasErrors = requiredFields.some((field) => {
      return !v[field];
    });

    if (hasErrors) {
      healthAlerts.warning(
        "Please fill all required item fields"
      );

      return;
    }

    if (
      v.MenufacturingDate &&
      v.ExpiryDate &&
      new Date(v.MenufacturingDate) >
      new Date(v.ExpiryDate)
    ) {

      formik.setFieldError(
        "MenufacturingDate",
        "Mfg Date cannot be greater than Expiry Date"
      );

      formik.setFieldError(
        "ExpiryDate",
        "Expiry Date cannot be less than Mfg Date"
      );

      return;
    }
    // Expired medicine check
if (
  v.ExpiryDate &&
  new Date(v.ExpiryDate) < new Date(new Date().toDateString())
) {
  formik.setFieldError(
    "ExpiryDate",
    "Expired medicine cannot be added"
  );

  healthAlerts.warning(
    "Expired medicine cannot be added"
  );

  return;
}
// CP should not be greater than MRP
if (Number(v.CP) > Number(v.MRP)) {
  formik.setFieldError(
    "CP",
    "CP cannot be greater than MRP"
  );

  formik.setFieldError(
    "MRP",
    "MRP must be greater than or equal to CP"
  );

  healthAlerts.warning(
    "CP cannot be greater than MRP"
  );

  return;
}

    const recvQty = Number(v.RecvQty || 0);
    const qtyPerStrip = Number(v.NoQtyperStrip || 0);
    const cpPerStrip = Number(v.CP || 0);
    const mrpPerStrip = Number(v.MRP || 0);
    /**
     * Per Qty Rates
     */
    const cpPerQty = qtyPerStrip > 0 ? cpPerStrip / qtyPerStrip : 0;
    const mrpPerQty = qtyPerStrip > 0 ? mrpPerStrip / qtyPerStrip : 0;
    /**
     * Totals
     */
    const totalCp = recvQty * cpPerQty;
    const totalMrp = recvQty * mrpPerQty;
    /**
     * Discount
     */
    const discountPercent = Number(v.DiscountPCperitem || 0);
    const discountAmt = (totalCp * discountPercent) / 100;
    /**
     * Taxable
     */
    const taxableAmount = totalCp - discountAmt;
    /**
     * GST
     */
    const cgstAmt = (taxableAmount * Number(v.CGST || 0)) / 100;
    const sgstAmt = (taxableAmount * Number(v.SGST || 0)) / 100;
    /**
     * Grand Total
     */
    const grandTotal = taxableAmount + cgstAmt + sgstAmt;

    const newItem = {
      SLNo: v.items.length + 1,
      ItemName: v.ItemName,
      BatchNo: v.BatchNo,
      HSNCode:
        hsnCodeOptions.find(
          (h) =>
            h.value.toString() ===
            v.HSNID.toString()
        )?.label || "",

      HSNID: v.HSNID,
      MenufacturingDate: v.MenufacturingDate,
      ExpiryDate: v.ExpiryDate,
      InvoiceDate: v.InvoiceDate,
      RagNo: v.RagNo,
      RecvQty: recvQty,
      FreeRecvQty: Number(v.FreeRecvQty || 0) * qtyPerStrip,
      CP: cpPerStrip,
      MRP: mrpPerStrip,
      CPPerQty: cpPerQty,
      MRPPerQty: mrpPerQty,
      totalCp,
      totalMrp,
      DiscountPercent: discountPercent,
      DiscountAmt: discountAmt,
      CGST: Number(v.CGST || 0),
      SGST: Number(v.SGST || 0),
      CGSTAmount: cgstAmt,
      SGSTAmount: sgstAmt,
      totalGst: cgstAmt + sgstAmt,
      total: grandTotal,
      ItemID: v.ItemID,
      ItemTypeID: v.ItemTypeID,
      NoQtyperStrip: qtyPerStrip,
      NoStrip: Number(v.NoStrip || 0),
    };

    formik.setValues({
      ...formik.values,

      items: [...formik.values.items, newItem],

      ItemName: "",
      ItemTypeID: "",
      ItemType: "",
      BatchNo: "",
      MenufacturingDate: "",
      ExpiryDate: "",
      NoStrip: "",
      NoQtyperStrip: "",
      RecvQty: "",
      FreeRecvQty: "",
      CP: "",
      MRP: "",
      DiscountPCperitem: "",
      CGST: "",
      SGST: "",
      HSNCode: "",
      HSNID: "",
    });
    formik.setTouched({
      ...formik.touched,

      ItemName: false,
      BatchNo: false,
      MenufacturingDate: false,
      ExpiryDate: false,
      NoStrip: false,
      NoQtyperStrip: false,
      CP: false,
      MRP: false,
      DiscountPCperitem: false,
      HSNCode: false,
      CGST: false,
      SGST: false,
    });

    setMedicineSearch("");
    setSelectedMedicine(null);
  };

  const totals = formik.values.items?.reduce(
    (acc, i) => {
      const recvQty = Number(i?.RecvQty || 0);
      const freeQty = Number(i?.FreeRecvQty || 0);

      acc.qty += freeQty > 0 ? recvQty + freeQty : recvQty;

      acc.totalCp += i?.totalCp;
      acc.discount += i.DiscountAmt || 0;
      acc.gst += i?.totalGst;
      acc.grand += i?.total;
      return acc;
    },
    { qty: 0, totalCp: 0, discount: 0, gst: 0, grand: 0 },
  );

  const handleDeleteItem = (index) => {
    const updatedItems = formik.values.items
      .filter((_, i) => i !== index)
      .map((item, idx) => ({
        ...item,
        SLNo: idx + 1,
      }));

    formik.setFieldValue("items", updatedItems);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 py-10">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <span className="bg-blue-100 p-2 rounded-xl">
              <ClipboardDocumentIcon className="w-6 text-blue-600" />
            </span>
            {isEditMode ? "Edit Goods Received Note" : "Goods Received Note"}
          </h1>

          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 w-12 rounded-full ${activeStep >= s ? "bg-sky-600" : "bg-gray-200"
                  }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="flex border-b">
            {[
              { id: 1, label: "GRN Details", icon: ClipboardDocumentIcon },
              { id: 2, label: "Item Entry", icon: BeakerIcon },
              // { id: 3, label: "Items List", icon: CreditCardIcon },
              { id: 3, label: "Summary", icon: DocumentCheckIcon },
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
          {/* <form onSubmit={formik.handleSubmit} className="space-y-8 p-9"> */}
          <form
            onSubmit={(e) => {
              e.preventDefault();

              if (activeStep !== 3) return;

              formik.handleSubmit(e);
            }}
            className="space-y-8 p-9"
          >
            {activeStep === 1 && (
              <section>
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-lg font-semibold text-sky-700 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span>
                    GRN Details
                  </h3>

                  <Button
                    type="button"
                    onClick={() => navigate("/items-master")}
                    className="flex items-center gap-1"
                  >
                    <PlusIcon className="w-4" />
                    New Item
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Invoice Date  <span className="text-red-500">*</span>
                    </label>
                    
                    <DatePicker
                      selected={
                        formik.values.InvoiceDate
                          ? new Date(formik.values.InvoiceDate)
                          : null
                      }
                      onChange={(date) => {
                        formik.setFieldValue(
                          "InvoiceDate",
                          formatDateOnly(date)
                        );
                      }}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="DD/MM/YYYY"
                      maxDate={new Date()}
                      showMonthDropdown
                      showYearDropdown
                      scrollableYearDropdown
                      yearDropdownItemNumber={100}
                      wrapperClassName="w-full"
                      className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm
    outline-none focus:ring-2 focus:ring-sky-400"
                    />
                    {formik.touched.InvoiceDate && formik.errors.InvoiceDate && (
    <p className="text-red-500 text-xs mt-1">
      {formik.errors.InvoiceDate}
    </p>
  )}
                  </div>
                  <Input
                    label="Invoice No"
                    required
                    error={formik.touched.RecieptNo && formik.errors.RecieptNo}
                    {...formik.getFieldProps("RecieptNo")}
                  />
                  <Select
                    label="Select Supplier"
                    required
                    error={
                      formik.touched.SupplierName && formik.errors.SupplierName
                    }
                    value={formik.values.SupplierID}
                    disabled={isEditMode}
                    onChange={(e) => {
                      const id = e.target.value;
                      const supplier = SupplierOptions.find(
                        (s) => s.value == id,
                      );

                      formik.setFieldValue("SupplierID", Number(id));
                      formik.setFieldValue(
                        "SupplierName",
                        supplier?.label || "",
                      );
                    }}
                  >
                    <option value="">Select Supplier</option>
                    {SupplierOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>
                  <Input label="Rack No" {...formik.getFieldProps("RagNo")} />
                </div>
              </section>
            )}
            {activeStep === 2 && (
              <section>
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-sky-700 font-semibold">Item Entry</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                  <div className="relative">
                    <Input
                      label="Item Name"
                      type="text"
                      placeholder={"Search Medicine"}
                      value={medicineSearch}
                      required
                      disabled={isEditMode}
                      onChange={(e) => {
                        setMedicineSearch(e.target.value);
                        setSelectedMedicine(null);
                        formik.setFieldValue("ItemName", e.target.value);
                      }}
                      error={
                        formik.touched.ItemName &&
                        formik.errors.ItemName
                      }
                      autoComplete="off"

                    />

                    {!isEditMode &&
                      medicineSuggestions.length > 0 &&
                      !selectedMedicine && (
                        <ul className="absolute z-20 bg-white border rounded-md shadow-md w-full max-h-48 overflow-auto">
                          {medicineSuggestions.map((item) => (
                            <li
                              key={item.id}
                              onClick={() => {
                                setSelectedMedicine(item);
                                setMedicineSearch(item.descriptions);
                                formik.setFieldValue(
                                  "ItemName",
                                  item.descriptions,
                                );
                                formik.setFieldValue("ItemID", item.id);

                                const typeId = item.itemType?.ID || 0;

                                formik.setFieldValue("ItemTypeID", typeId);
                                formik.setFieldValue(
                                  "ItemType",
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
                  <Input
                    label="Item Type"
                    readOnly
                    {...formik.getFieldProps("ItemType")}
                  />
                  <Input
                    label="Batch No"
                    required
                    error={formik.touched.BatchNo && formik.errors.BatchNo}
                    {...formik.getFieldProps("BatchNo")}
                  />
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Mfg Date <span className="text-red-500">*</span>
                    </label>

                    <DatePicker
                      selected={
                        formik.values.MenufacturingDate
                          ? new Date(formik.values.MenufacturingDate)
                          : null
                      }
                      onChange={(date) => {
                        formik.setFieldValue(
                          "MenufacturingDate",
                          formatDateOnly(date)
                        );
                      }}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="DD/MM/YYYY"
                      maxDate={new Date()}
                      showMonthDropdown
                      showYearDropdown
                      scrollableYearDropdown
                      yearDropdownItemNumber={100}
                      wrapperClassName="w-full"
                      popperClassName="z-50"
                      className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm
    outline-none focus:ring-2 focus:ring-sky-400"
                    />
                    {formik.errors.MenufacturingDate && (
  <p className="text-red-500 text-xs mt-1">
    {formik.errors.MenufacturingDate}
  </p>
)}
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Expiry Date <span className="text-red-500">*</span>
                    </label>

                    <DatePicker
                      selected={
                        formik.values.ExpiryDate
                          ? new Date(formik.values.ExpiryDate)
                          : null
                      }
                      onChange={(date) => {
                        formik.setFieldValue(
                          "ExpiryDate",
                          formatDateOnly(date)
                        );
                      }}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="DD/MM/YYYY"
                      showMonthDropdown
                      showYearDropdown
                      scrollableYearDropdown
                      yearDropdownItemNumber={100}
                      wrapperClassName="w-full"
                      popperClassName="z-50"
                      className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm
    outline-none focus:ring-2 focus:ring-sky-400"
                    />
                    {formik.errors.ExpiryDate && (
  <p className="text-red-500 text-xs mt-1">
    {formik.errors.ExpiryDate}
  </p>
)}
                  </div>
                  <NumericInput
                    label="No Unit / Strip"
                    required
                    error={formik.touched.NoStrip && formik.errors.NoStrip}
                    {...formik.getFieldProps("NoStrip")}
                  />
                  <NumericInput
                    label="No Qty / Unit"
                    required
                    error={
                      formik.touched.NoQtyperStrip &&
                      formik.errors.NoQtyperStrip
                    }
                    {...formik.getFieldProps("NoQtyperStrip")}
                  />
                  <Input
                    label="Total Recv. Qty"
                    value={formik.values.RecvQty}
                    readOnly
                  />
                  <NumericInput
                    label="Free Qty (Strips)"
                    {...formik.getFieldProps("FreeRecvQty")}
                  />
                  <NumericInput
                    label="CP / Strip"
                    required
                    error={formik.touched.CP && formik.errors.CP}
                    {...formik.getFieldProps("CP")}
                  />
                  <NumericInput
                    label="MRP / Strip"
                    required
                    error={formik.touched.MRP && formik.errors.MRP}
                    {...formik.getFieldProps("MRP")}
                  />
                  <NumericInput
                    label="Discount %"
                    
                    
                    {...formik.getFieldProps("DiscountPCperitem")}
                  />
                  <Select
                    label="HSN Code"
                    required
                    value={formik.values.HSNID || ""}
                    error={formik.touched.HSNCode && formik.errors.HSNCode}
                    onBlur={formik.handleBlur}
                    onChange={(e) => {
                      const selectedId = e.target.value;

                      const selectedHSN = hsnCodeOptions.find(
                        (h) => h.value.toString() === selectedId.toString(),
                      );

                      if (selectedHSN) {
                        formik.setFieldValue("HSNID", selectedId);

                        // store actual label/code
                        formik.setFieldValue("HSNCode", selectedHSN.label);

                        formik.setFieldValue("CGST", selectedHSN.CGST);
                        formik.setFieldValue("SGST", selectedHSN.SGST);
                      }
                    }}
                  >
                    <option value="">Select HSN</option>

                    {hsnCodeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>

                  <NumericInput
                    label="CGST %"
                    required
                    error={formik.touched.CGST && formik.errors.CGST}
                    {...formik.getFieldProps("CGST")}
                  />
                  <NumericInput
                    label="SGST %"
                    required
                    error={formik.touched.SGST && formik.errors.SGST}
                    {...formik.getFieldProps("SGST")}
                  />
                  <Input
                    label="C.P / Qty"
                    value={calculatedValues.cpPerQty.toFixed(2)}
                    readOnly
                  />

                  <Input
                    label="M.R.P / Qty"
                    value={calculatedValues.mrpPerQty.toFixed(2)}
                    readOnly
                  />
                  <Input
                    label="Total C.P"
                    value={calculatedValues.totalCp.toFixed(2)}
                    readOnly
                  />

                  <Input
                    label="Total M.R.P"
                    value={calculatedValues.totalMrp.toFixed(2)}
                    readOnly
                  />
                  <Input
                    label="CGST Amount"
                    value={calculatedValues.cgstAmt.toFixed(2)}
                    readOnly
                  />
                  <Input
                    label="SGST Amount"
                    value={calculatedValues.sgstAmt.toFixed(2)}
                    readOnly
                  />
                </div>
                <Button type="button" onClick={handleAddItem} className="mt-4">
                  <PlusIcon className="w-4 h-4 mr-1" /> Add Item
                </Button>
              </section>
            )}
            {/* {activeStep === 2 && (
              <section>
                {formik.values.items.length === 0 && (
                  <div className="text-center text-gray-400 py-10">
                    No items added yet
                  </div>
                )}
                {formik.values.items.length > 0 && (
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-sky-100 text-sky-700">
                        <tr>
                          <th className="border px-2 py-2 text-left">Item</th>
                          <th className="border px-2 py-2 text-center">
                            Batch
                          </th>
                          <th className="border px-2 py-2 text-right">
                            Hsn Code
                          </th>
                          <th className="border px-2 py-2 text-right">Qty</th>
                          <th className="border px-2 py-2 text-right">
                            Total C.P
                          </th>
                          <th className="border px-2 py-2 text-right">GST</th>
                          <th className="border px-2 py-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formik.values.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="border px-2 py-2">
                              {item.ItemName}
                            </td>
                            <td className="border px-2 py-2 text-center">
                              {item.BatchNo}
                            </td>
                            <td className="border px-2 py-2 text-center">
                              {item.HSNCode}
                            </td>
                            <td className="border px-2 py-2 text-right">
                              {item.RecvQty}
                            </td>
                            <td className="border px-2 py-2 text-right">
                              Rs. {item.totalCp.toFixed(2)}
                            </td>
                            <td className="border px-2 py-2 text-right">
                              Rs. {item.totalGst.toFixed(2)}
                            </td>
                            <td className="border px-2 py-2 text-right font-semibold">
                              Rs. {item.total.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )} */}
            {activeStep === 2 && (
              <section className="mt-8">
                {formik.values.items.length === 0 ? (
                  <div className="text-center py-14 border border-dashed rounded-2xl bg-slate-50 text-gray-400">
                    No items added yet
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gradient-to-r from-sky-600 to-blue-600 text-white">
                          <tr>
                            <th className="px-4 py-3 text-center whitespace-nowrap">
                              SL No.
                            </th>

                            <th className="px-4 py-3 text-left whitespace-nowrap">
                              Description
                            </th>

                            <th className="px-4 py-3 text-center whitespace-nowrap">
                              Batch No
                            </th>

                            <th className="px-4 py-3 text-center whitespace-nowrap">
                              HSN Code
                            </th>

                            <th className="px-4 py-3 text-right whitespace-nowrap">
                              CP (Rs.)
                            </th>

                            <th className="px-4 py-3 text-right whitespace-nowrap">
                              MRP (Rs.)
                            </th>

                            <th className="px-4 py-3 text-right whitespace-nowrap">
                              Recv.Qty
                            </th>

                            <th className="px-4 py-3 text-right whitespace-nowrap">
                              Free.Qty
                            </th>

                            <th className="px-4 py-3 text-center whitespace-nowrap">
                              CGST(%)
                            </th>

                            <th className="px-4 py-3 text-center whitespace-nowrap">
                              SGST(%)
                            </th>

                            <th className="px-4 py-3 text-right whitespace-nowrap">
                              CGST Amt (Rs.)
                            </th>

                            <th className="px-4 py-3 text-right whitespace-nowrap">
                              SGST Amt (Rs.)
                            </th>

                            <th className="px-4 py-3 text-center whitespace-nowrap">
                              Mfg.Date
                            </th>

                            <th className="px-4 py-3 text-center whitespace-nowrap">
                              Exp.Date
                            </th>

                            <th className="px-4 py-3 text-center whitespace-nowrap">
                              Invoice Date
                            </th>

                            <th className="px-4 py-3 text-right whitespace-nowrap">
                              Dis (%)
                            </th>

                            <th className="px-4 py-3 text-center whitespace-nowrap">
                              Rack No.
                            </th>

                            <th className="px-4 py-3 text-right whitespace-nowrap">
                              Total
                            </th>

                            <th className="px-4 py-3 text-center whitespace-nowrap">
                              Delete
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {formik.values.items.map((item, idx) => (
                            <tr
                              key={idx}
                              className="border-b hover:bg-sky-50 transition"
                            >
                              <td className="px-4 py-3 text-center font-medium">
                                {item.SLNo}
                              </td>

                              <td className="px-4 py-3 min-w-[220px] font-medium text-slate-700">
                                {item.ItemName}
                              </td>

                              <td className="px-4 py-3 text-center">
                                {item.BatchNo}
                              </td>

                              <td className="px-4 py-3 text-center">
                                {item.HSNCode}
                              </td>

                              <td className="px-4 py-3 text-right">
                                {Number(item.CP).toFixed(2)}
                              </td>

                              <td className="px-4 py-3 text-right">
                                {Number(item.MRP).toFixed(2)}
                              </td>

                              <td className="px-4 py-3 text-right font-semibold">
                                {item.RecvQty}
                              </td>

                              <td className="px-4 py-3 text-right">
                                {item.FreeRecvQty}
                              </td>

                              <td className="px-4 py-3 text-center">
                                {item.CGST}
                              </td>

                              <td className="px-4 py-3 text-center">
                                {item.SGST}
                              </td>

                              <td className="px-4 py-3 text-right">
                                {Number(item.CGSTAmount).toFixed(2)}
                              </td>

                              <td className="px-4 py-3 text-right">
                                {Number(item.SGSTAmount).toFixed(2)}
                              </td>

                              <td className="px-4 py-3 text-center whitespace-nowrap">
                                {item.MenufacturingDate || "-"}
                              </td>

                              <td className="px-4 py-3 text-center whitespace-nowrap">
                                {item.ExpiryDate || "-"}
                              </td>

                              <td className="px-4 py-3 text-center whitespace-nowrap">
                                {item.InvoiceDate || "-"}
                              </td>

                              <td className="px-4 py-3 text-right">
                                {item.DiscountPercent}%
                              </td>

                              <td className="px-4 py-3 text-center">
                                {item.RagNo || "-"}
                              </td>

                              <td className="px-4 py-3 text-right font-bold text-green-700">
                                {Number(item.total).toFixed(2)}
                              </td>

                              <td className="px-4 py-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteItem(idx)}
                                  className="inline-flex items-center justify-center rounded-lg p-2 text-red-500 hover:bg-red-100 transition"
                                >
                                  <TrashIcon className="w-5 h-5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>

                        <tfoot className="bg-slate-100 font-semibold text-slate-700">
                          <tr>
                            <td colSpan={6} className="px-4 py-4 text-right">
                              Totals (Recv.Qty + Free.Qty)
                            </td>

                            <td className="px-4 py-4 text-right">
                              {totals.qty}
                            </td>

                            <td colSpan={2}></td>

                            <td className="px-4 py-4 text-right">
                              Rs. {totals.gst.toFixed(2)}
                            </td>

                            <td colSpan={5}></td>

                            <td className="px-4 py-4 text-right">
                              Rs. {totals.discount.toFixed(2)}
                            </td>

                            <td></td>

                            <td className="px-4 py-4 text-right text-green-700">
                              {totals.grand.toFixed(2)}
                            </td>

                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </section>
            )}
            {activeStep === 3 && (
              <section>
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 space-y-6">
                  <h3 className="text-lg font-semibold text-sky-600">
                    Confirm GRN Summary
                  </h3>

                  {/* GRN Info */}
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <p>
                      <b>Invoice No:</b> {formik.values.RecieptNo}
                    </p>

                    <p>
                      <b>Invoice Date:</b> {formik.values.InvoiceDate}
                    </p>

                    <p>
                      <b>Supplier:</b> {formik.values.SupplierName}
                    </p>

                    <p>
                      <b>Rack No:</b> {formik.values.RagNo || "-"}
                    </p>
                  </div>

                  {/* Items Preview */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-slate-700 mb-3">
                      Items Preview
                    </h4>

                    <div className="overflow-x-auto rounded-lg border">
                      <table className="min-w-full text-sm">
                        <thead className="bg-sky-100 text-sky-700">
                          <tr>
                            <th className="px-3 py-2 text-left">Item</th>

                            <th className="px-3 py-2 text-center">Batch</th>

                            <th className="px-3 py-2 text-center">HSN</th>

                            <th className="px-3 py-2 text-right">Recv Qty</th>
                            <th className="px-3 py-2 text-right">Free Qty</th>

                            <th className="px-3 py-2 text-right">GST</th>

                            <th className="px-3 py-2 text-right">Total</th>
                          </tr>
                        </thead>

                        <tbody>
                          {formik.values.items.map((item, idx) => (
                            <tr key={idx} className="border-t">
                              <td className="px-3 py-2">{item.ItemName}</td>

                              <td className="px-3 py-2 text-center">
                                {item.BatchNo}
                              </td>

                              <td className="px-3 py-2 text-center">
                                {item.HSNCode || "-"}
                              </td>

                              <td className="px-3 py-2 text-right">
                                {item.RecvQty}
                              </td>
                              <td className="px-3 py-2 text-right">
                                {item.FreeRecvQty}
                              </td>

                              <td className="px-3 py-2 text-right">
                                Rs. {Number(item.totalGst || 0).toFixed(2)}
                              </td>

                              <td className="px-3 py-2 text-right font-semibold text-green-700">
                                Rs. {Number(item.total || 0).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="border-t pt-4 grid md:grid-cols-2 gap-3 text-sm">
                    <p>
                      <b>Total Items:</b> {formik.values.items.length}
                    </p>

                    <p>
                      <b>Total Qty (Recv + Free) :</b> {totals.qty}
                    </p>

                    <p>
                      <b>Total CP:</b> Rs. {totals.totalCp.toFixed(2)}
                    </p>

                    <p>
                      <b>Discount:</b> Rs. {totals.discount.toFixed(2)}
                    </p>

                    <p>
                      <b>GST:</b> Rs. {totals.gst.toFixed(2)}
                    </p>

                    <p className="text-base font-bold text-green-700">
                      <b>Grand Total:</b> Rs. {totals.grand.toFixed(2)}
                    </p>
                  </div>
                </div>
              </section>
            )}
            <div className="flex justify-between items-center pt-6 border-t">

              {/* LEFT SIDE */}
              <div className="flex gap-3">

                {activeStep > 1 && (
                  <Button
                    type="button"
                    variant="gray"
                    onClick={prevStep}
                  >
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
                        InvoiceDate: "",
                        RecieptNo: "",
                        SupplierName: "",
                        SupplierID: "",
                        RagNo: "",
                      });

                      formik.setTouched({});
                    }

                    if (activeStep === 2) {
                      formik.setValues({
                        ...formik.values,
                        items: [],
                        ItemName: "",
                        ItemTypeID: "",
                        ItemType: "",
                        BatchNo: "",
                        MenufacturingDate: "",
                        ExpiryDate: "",
                        NoStrip: "",
                        NoQtyperStrip: "",
                        RecvQty: "",
                        FreeRecvQty: "",
                        CP: "",
                        MRP: "",
                        DiscountPCperitem: "",
                        Discountperitem: "",
                        CGST: "",
                        SGST: "",
                        HSNCode: "",
                        HSNID: "",
                      });

                      setMedicineSearch("");
                      setSelectedMedicine(null);

                      formik.setTouched({});
                    }

                    if (activeStep === 3) {
                      formik.resetForm();

                      setMedicineSearch("");
                      setSelectedMedicine(null);
                    }
                  }}
                >
                  <ArrowPathIcon className="w-5 h-5 mr-1" />
                  Reset
                </Button>
              </div>


              <div>
                {activeStep < 3 ? (
                  <Button
                    type="button"
                    variant="sky"
                    onClick={nextStep}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="sky"
                    disabled={isLoading}
                    onClick={() => {
                      if (activeStep !== 3) return;

                      formik.handleSubmit();
                    }}
                  >
                    {isLoading ? "Saving..." : "Save"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GRNFormCopy;
