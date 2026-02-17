import React, { useEffect } from "react";
import {
  PlusIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { healthAlerts } from "../utils/healthSwal";
import {
  Input,
  NumericInput,
  Select,
  Button,
} from "../components/UIComponents";
import { useCreateMedicineStockMutation } from "../redux/apiSlice";

const GRNForm = () => {
  const navigate = useNavigate();
  const [createMedicineStock, { isLoading }] = useCreateMedicineStockMutation();

  const validationSchema = Yup.object({
    InvoiceDate: Yup.string().required("Required"),

    RecieptNo: Yup.string().required("Required"),
    SupplierName: Yup.string().required("Required"),
  });

  const formik = useFormik({
    initialValues: {
      InvoiceDate: "",
      StockID: "",
      StockNo: "",
      RecieptNo: "",
      ItemTypeID: 0,
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
      UserloginID: 0,
      AddedBy: 0, // To be set from auth state
      ModifiedDate: new Date(),
      ModifiedBy: 0, // To be set from auth state
      Isopen: false,
      StockStatus: 0,
    },
    validationSchema,
    onSubmit: async (values) => {
      if (values.items.length === 0) {
        healthAlerts.error("Add at least one item", "GRN");
        return;
      }
      const payload = {
        ...values,
        items: values.items.map((item) => ({
          ...item,
          recvQty: Number(item.recvQty),
          freeQty: Number(item.freeQty || 0),
          cp: Number(item.cp),
          mrp: Number(item.mrp),
        })),
      };
      await createMedicineStock(payload);

      healthAlerts.success("GRN Saved Successfully", "Inventory");
      formik.resetForm();
    },
  });

  // Auto-calc Qty & Financials
  useEffect(() => {
    const unit = Number(formik.values.unitStrip || 0);
    const qty = Number(formik.values.qtyPerStrip || 0);
    formik.setFieldValue("recvQty", unit * qty > 0 ? unit * qty : "");
  }, [formik.values.unitStrip, formik.values.qtyPerStrip]);

  useEffect(() => {
    const qty = Number(formik.values.recvQty || 0);
    const cp = Number(formik.values.cp || 0);
    const mrp = Number(formik.values.mrp || 0);
    const totalCp = qty * cp;
    formik.setValues({
      ...formik.values,
      cpQty: cp,
      mrpQty: mrp,
      totalCp: totalCp,
      totalMrp: qty * mrp,
      cgstAmt: (totalCp * Number(formik.values.cgstPer || 0)) / 100,
      sgstAmt: (totalCp * Number(formik.values.sgstPer || 0)) / 100,
    });
  }, [
    formik.values.recvQty,
    formik.values.cp,
    formik.values.mrp,
    formik.values.cgstPer,
    formik.values.sgstPer,
  ]);

  const handleAddItem = () => {
    const v = formik.values;
    if (!v.ItemName || !v.BatchNo || !v.cp)
      return healthAlerts.error("Missing Item Details", "Item");

    const totalCp = Number(v.recvQty) * Number(v.cp);
    const discountAmt = (totalCp * Number(v.discountPer || 0)) / 100;
    const taxable = totalCp - discountAmt;
    const cgstAmt = (taxable * Number(v.cgstPer || 0)) / 100;
    const sgstAmt = (taxable * Number(v.sgstPer || 0)) / 100;

    const newItem = {
      ItemName: v.ItemName,
      BatchNo: v.BatchNo,
      mfgDate: v.mfgDate,
      expiryDate: v.expiryDate,
      recvQty: Number(v.recvQty),
      freeQty: Number(v.freeQty || 0) * Number(v.qtyPerStrip || 0),
      cp: Number(v.cp),
      mrp: Number(v.mrp),
      discountAmt,
      totalGst: cgstAmt + sgstAmt,
      totalCp,
      total: taxable + cgstAmt + sgstAmt,
    };

    formik.setFieldValue("items", [...v.items, newItem]);
    [
      "ItemName",
      "BatchNo",
      "mfgDate",
      "expiryDate",
      "unitStrip",
      "qtyPerStrip",
      "recvQty",
      "freeQty",
      "cp",
      "mrp",
      "discountPer",
      "cgstPer",
      "sgstPer",
    ].forEach((f) => formik.setFieldValue(f, ""));
  };

  const totals = formik.values.items.reduce(
    (acc, i) => {
      acc.qty += i.recvQty;
      acc.totalCp += i.totalCp;
      acc.discount += i.discountAmt;
      acc.gst += i.totalGst;
      acc.grand += i.total;
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
            error={formik.touched.InvoiceDate && formik.errors.InvoiceDate}
            {...formik.getFieldProps("InvoiceDate")}
          />
          <Input
            label="Invoice No"
            required
            error={formik.touched.RecieptNo && formik.errors.RecieptNo}
            {...formik.getFieldProps("RecieptNo")}
          />
          <Input
            label="SupplierName"
            required
            error={formik.touched.SupplierName && formik.errors.SupplierName}
            {...formik.getFieldProps("SupplierName")}
          />
          <Input label="HSNCode" {...formik.getFieldProps("HSNCode")} />
          <Select label="Item Type" {...formik.getFieldProps("ItemTypeID")}>
            <option value="">-- Select --</option>
            <option>Medicine</option>
            <option>Consumable</option>
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
          <Input
            label="Item Name"
            required
            {...formik.getFieldProps("ItemName")}
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
          <Input label="C.P / Qty" value={formik.values.cpQty} readOnly />
          <Input label="M.R.P / Qty" value={formik.values.mrpQty} readOnly />
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
                    {item.recvQty}
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
        <Button type="submit">
          <CheckCircleIcon className="w-5 h-5 mr-1" /> Save
        </Button>
        <Button type="button" variant="gray" onClick={formik.resetForm}>
          <ArrowPathIcon className="w-5 h-5 mr-1" /> Reset
        </Button>
      </div>
    </form>
  );
};

export default GRNForm;
