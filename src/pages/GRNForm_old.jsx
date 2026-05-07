import React, { useEffect, useMemo, useState } from "react";
import {
  PlusIcon,
  CheckCircleIcon,
  ArrowPathIcon,
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
const username = cookie.get("username"); 
const userId = cookie.get("user_id");
const GRNForm = () => {
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
    InvoiceDate: Yup.string().required("Required"),

    RecieptNo: Yup.string().required("Required"),
    SupplierName: Yup.string().required("Required"),
    HSNCode: Yup.string().required("HSN Code is required"),
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
    ? HSNCode.map((t) => ({ value: t.HSNID, label: t.HSNCode, CGST: t.CGST, SGST: t.SGST }))
    : [];

  const SupplierOptions = Supplier
    ? Supplier.map((t) => ({ value: t.ID, label: t.name }))
    : [];


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
        0
      );

      const totalDiscount = values.items.reduce(
        (sum, item) => sum + Number(item.DiscountAmt || 0),
        0
      );

      const grandTotal = values.items.reduce(
        (sum, item) => sum + Number(item.total || 0),
        0
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
          "Inventory"
        );
      }
    }
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
      MenufacturingDate:
        editData.MenufacturingDate?.split("T")[0] ?? "",
      ExpiryDate:
        editData.ExpiryDate?.split("T")[0] ?? "",

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

      items: [],
    });


    setMedicineSearch(editData.ItemName ?? "");

  }, [editData]);
  useEffect(() => {
    if (!medicineTypeOptions.length) return;
    if (!formik.values.ItemTypeID) return;

    const found = medicineTypeOptions.find(
      (t) => t.value === formik.values.ItemTypeID
    );

    if (found && formik.values.ItemType !== found.label) {
      formik.setFieldValue("ItemType", found.label);
    }

  }, [medicineTypeOptions, formik.values.ItemTypeID]);
  useEffect(() => {

    if (!debouncedMedicine || debouncedMedicine.length < 2) {
      setMedicineSuggestions([]);
      return;
    }
    if (debouncedMedicine === formik.values.ItemName && formik.values.ItemID !== 0) {
      setMedicineSuggestions([]);
      return;
    }

    if (medicineList && medicineList.length > 0) {
      setMedicineSuggestions(medicineList);
    } else {
      setMedicineSuggestions([]);
    }
  }, [medicineList, debouncedMedicine, formik.values.ItemName, formik.values.ItemID]);

  
  useEffect(() => {
    const unit = Number(formik.values.NoStrip || 0);
    const qty = Number(formik.values.NoQtyperStrip || 0);
    formik.setFieldValue("RecvQty", unit * qty > 0 ? unit * qty : "");
  }, [formik.values.NoStrip, formik.values.NoQtyperStrip]);

  const calculatedValues = useMemo(() => {
    const qty = Number(formik.values.RecvQty || 0);
    const cp = Number(formik.values.CP || 0);
    const mrp = Number(formik.values.MRP || 0);
    const cgst = Number(formik.values.CGST || 0);
    const sgst = Number(formik.values.SGST || 0);

    const totalCp = qty * cp;
    const totalMrp = qty * mrp;
    const cgstAmt = (totalCp * cgst) / 100;
    const sgstAmt = (totalCp * sgst) / 100;

    return {
      totalCp,
      totalMrp,
      cgstAmt,
      sgstAmt,
    };
  }, [
    formik.values.RecvQty,
    formik.values.CP,
    formik.values.MRP,
    formik.values.CGST,
    formik.values.SGST,
  ]);
  useEffect(() => {
    if (centerIdFromCookie) {
      formik.setFieldValue("CentreID", Number(centerIdFromCookie));
    }
  }, [centerIdFromCookie]);

  const handleAddItem = () => {
    const v = formik.values;
    if (!v.ItemName || !v.BatchNo || !v.CP)
      return healthAlerts.error("Missing Item Details", "Item");

    const totalCp = Number(v.RecvQty) * Number(v.CP);
    const discountPercent = Number(v.DiscountPCperitem || 0);
    const discountAmt = (totalCp * discountPercent) / 100;

    const taxable = totalCp - discountAmt;
    const cgstAmt = (taxable * Number(v.CGST || 0)) / 100;
    const sgstAmt = (taxable * Number(v.SGST || 0)) / 100;

    const newItem = {
      ItemName: v.ItemName,
      BatchNo: v.BatchNo,
      MenufacturingDate: v.MenufacturingDate,
      ExpiryDate: v.ExpiryDate,
      RecvQty: Number(v.RecvQty),
      FreeRecvQty: Number(v.FreeRecvQty || 0) * Number(v.NoQtyperStrip || 0),
      CP: Number(v.CP),
      MRP: Number(v.MRP),
      DiscountPercent: discountPercent,
      DiscountAmt: discountAmt,
      totalGst: cgstAmt + sgstAmt,
      totalCp,
      total: taxable + cgstAmt + sgstAmt,
      CGST: Number(v.CGST || 0),
      SGST: Number(v.SGST || 0),
      CGSTAmount: cgstAmt,
      SGSTAmount: sgstAmt,
      ItemID: v.ItemID,
      ItemTypeID: v.ItemTypeID,
      NoQtyperStrip: Number(v.NoQtyperStrip),
      NoStrip: Number(v.NoStrip),
    };

    formik.setFieldValue("items", [...v.items, newItem]);
    [
      "ItemName",
      "ItemTypeID",
      "ItemType",
      "BatchNo",
      "MenufacturingDate",
      "ExpiryDate",
      "NoStrip",
      "NoQtyperStrip",
      "RecvQty",
      "FreeRecvQty",
      "CP",
      "MRP",
      "DiscountPCperitem",
      "CGST",
      "SGST",
    ].forEach((f) => formik.setFieldValue(f, ""));
    setMedicineSearch("");
  };

  const totals = formik.values.items?.reduce(
    (acc, i) => {
      acc.qty += i?.RecvQty;
      acc.totalCp += i?.totalCp;
      acc.discount += i.DiscountAmt || 0;
      acc.gst += i?.totalGst;
      acc.grand += i?.total;
      return acc;
    },
    { qty: 0, totalCp: 0, discount: 0, gst: 0, grand: 0 },
  );

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-sky-700 text-center mb-6">
        📦 Goods Received Note (GRN)
      </h2>

      <section>
        <h3 className="text-sky-700 font-semibold mb-3">GRN Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input
            type="date"
            label="Invoice Date"
            required
            disabled={isEditMode}
            error={formik.touched.InvoiceDate && formik.errors.InvoiceDate}
            {...formik.getFieldProps("InvoiceDate")}
          />
          <Input
            label="Invoice No"
            required
            error={formik.touched.RecieptNo && formik.errors.RecieptNo}
            {...formik.getFieldProps("RecieptNo")}
          />
          <Select
            label="Select Supplier"
            required
            value={formik.values.SupplierID}
            disabled={isEditMode}
            onChange={(e) => {
              const id = e.target.value;
              const supplier = SupplierOptions.find(
                (s) => s.value == id
              );

              formik.setFieldValue("SupplierID", Number(id));
              formik.setFieldValue("SupplierName", supplier?.label || "");
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

      <section>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sky-700 font-semibold">Item Entry</h3>
          <Button type="button" onClick={() => navigate("/items-master")}>
            <PlusIcon className="w-4 h-4 mr-1" /> New Item
          </Button>
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
                formik.setFieldValue("ItemName", e.target.value);
              }}
              autoComplete="off"
            />
            {/* Medicine Search Suggestions List */}
            {!isEditMode && medicineSuggestions.length > 0 && (
              <ul className="absolute z-20 bg-white border rounded-md shadow-md w-full max-h-48 overflow-auto">
                {medicineSuggestions.map((item) => (
                  <li
                    key={item.id}
                    onClick={() => {

                      setMedicineSearch(item.descriptions);
                      formik.setFieldValue("ItemName", item.descriptions);
                      formik.setFieldValue("ItemID", item.id);

                      const typeId = item.itemType?.ID || 0;

                      formik.setFieldValue("ItemTypeID", typeId);
                      formik.setFieldValue("ItemType", item.itemType?.Descriptions || "");



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
            {...formik.getFieldProps("BatchNo")}
          />
          <Input
            type="date"
            label="Mfg Date"
            required
            {...formik.getFieldProps("MenufacturingDate")}
          />
          <Input
            type="date"
            label="Expiry Date"
            required
            {...formik.getFieldProps("ExpiryDate")}
          />
          <NumericInput
            label="Unit / Strip"
            required
            {...formik.getFieldProps("NoStrip")}
          />
          <NumericInput
            label="Qty / Unit"
            required
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
            {...formik.getFieldProps("CP")}
          />
          <NumericInput
            label="MRP / Strip"
            required
            {...formik.getFieldProps("MRP")}
          />
          <NumericInput
            label="Discount %"
            required
            {...formik.getFieldProps("DiscountPCperitem")}
          />
          <Select
            label="HSN Code"
            required
            value={formik.values.HSNCode}
            error={formik.touched.HSNCode && formik.errors.HSNCode}   
            onBlur={formik.handleBlur}
            onChange={(e) => {
              const selectedId = e.target.value;

              formik.setFieldValue("HSNCode", selectedId);

              const selectedHSN = hsnCodeOptions.find(
                (h) => h.value.toString() === selectedId.toString()
              );

              if (selectedHSN) {
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
            {...formik.getFieldProps("CGST")}
          />
          <NumericInput
            label="SGST %"
            required
            {...formik.getFieldProps("SGST")}
          />
          {/* <Input label="C.P / Qty" value={formik.values.cpQty} readOnly />
          <Input label="M.R.P / Qty" value={formik.values.mrpQty} readOnly /> */}
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

      {formik.values.items.length > 0 && (
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
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
                  <td className="border px-2 py-2">{item.ItemName}</td>
                  <td className="border px-2 py-2 text-center">
                    {item.BatchNo}
                  </td>
                  <td className="border px-2 py-2 text-right">
                    {item.RecvQty}
                  </td>
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

      <section className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <Input label="Total Qty" value={totals.qty} readOnly />
        <Input label="Total C.P" value={totals.totalCp.toFixed(2)} readOnly />
        <Input
          label="Discount Amount"
          value={totals.discount.toFixed(2)}
          readOnly
        />
        <Input
          label="Total GST Amount"
          value={totals.gst.toFixed(2)}
          readOnly
        />
        <Input label="Grand Total" value={totals.grand.toFixed(2)} readOnly />
      </section>

      <div className="flex justify-center gap-4 pt-4 border-t">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            "Saving..."
          ) : (
            <>
              <CheckCircleIcon className="w-5 h-5 mr-1" /> Save
            </>
          )}
        </Button>
        <Button type="button" variant="gray" onClick={formik.resetForm}>
          <ArrowPathIcon className="w-5 h-5 mr-1" /> Reset
        </Button>
      </div>
    </form>
  );
};

export default GRNForm;
