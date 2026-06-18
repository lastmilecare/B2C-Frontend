import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { Input, Select, Button } from "../components/FormControls";

import { Picaso_Paymode_Options } from "../utils/constants";
import { healthAlert } from "../utils/healthSwal";
import { formatDateOnly } from "../utils/helper";

import {

useCreateSpectacleRevenueMutation,
useUpdateSpectacleRevenueMutation
} from "../redux/apiSlice";
import { ArrowPathIcon } from "@heroicons/react/24/outline";


const STEPS = [
  { id: 1, label: "Revenue Info" },
  { id: 2, label: "Amount" },
  { id: 3, label: "Confirm" },
];

const SpectacleRevenueForm = ({ editingId, editRow, onSuccess, onCancel }) => {
  const [activeStep, setActiveStep] = useState(1);

  const [createRevenue] = useCreateSpectacleRevenueMutation();
  const [updateRevenue] = useUpdateSpectacleRevenueMutation();

  const formik = useFormik({
    initialValues: {
      RevenueDate: editRow?.RevenueDate ? new Date(editRow.RevenueDate) : "",
      PaymentmodeID: editRow?.PaymentmodeID
        ? String(editRow.PaymentmodeID)
        : "",
      RevenueAmount: editRow?.RevenueAmount || "",
      DueAmount: editRow?.DueAmount || "",
    },

    enableReinitialize: true,

    validationSchema: Yup.object({
      RevenueDate: Yup.date().required("Revenue Date is required"),
      PaymentmodeID: Yup.string().required("Payment Mode is required"),
      RevenueAmount: Yup.number()
        .typeError("Revenue Amount must be numeric")
        .required("Revenue Amount is required"),
      DueAmount: Yup.number()
        .typeError("Due Amount must be numeric")
        .nullable(),
    }),

    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = {
          RevenueDate:
            values.RevenueDate instanceof Date
              ? values.RevenueDate.toISOString().split("T")[0]
              : values.RevenueDate,
          PaymentmodeID: values.PaymentmodeID,
          RevenueAmount: values.RevenueAmount,
          DueAmount: values.DueAmount || 0,
        };

        if (editingId) {
          await updateRevenue({ id: editingId, body: payload }).unwrap();
          healthAlert({
            title: "Success",
            text: "Revenue Updated Successfully",
            icon: "success",
          });
        } else {
          await createRevenue(payload).unwrap();
          healthAlert({
            title: "Success",
            text: "Revenue Saved Successfully",
            icon: "success",
          });
        }

        resetForm({
          values: {
            RevenueDate: "",
            PaymentmodeID: "",
            RevenueAmount: "",
            DueAmount: "",
          },
        });

        setActiveStep(1);
        onSuccess?.();
      } catch (error) {
        healthAlert({
          title: "Error",
          text: error?.data?.message || "Operation Failed",
          icon: "error",
        });
      }
    },
  });

  // ─── Step Navigation ────────────────────────────────────────────────────────

  const nextStep = async () => {
    
    if (activeStep === 1) {
      await formik.setTouched({ RevenueDate: true, PaymentmodeID: true });
      const errors = await formik.validateForm();
      if (errors.RevenueDate || errors.PaymentmodeID) return;
    }

 
    if (activeStep === 2) {
      await formik.setTouched({ RevenueAmount: true, DueAmount: true });
      const errors = await formik.validateForm();
      if (errors.RevenueAmount) return;
    }

    setActiveStep((prev) => prev + 1);
  };

  const prevStep = () => setActiveStep((prev) => prev - 1);

  const handleReset = () => {
  if (activeStep === 1) {
    formik.setValues({
      ...formik.values,
      RevenueDate: "",
      PaymentmodeID: "",
    });

    formik.setTouched({});
  }

  if (activeStep === 2) {
    formik.setValues({
      ...formik.values,
      RevenueAmount: "",
      DueAmount: "",
    });

    formik.setTouched({});
  }

  if (activeStep === 3) {
    formik.resetForm({
      values: {
        RevenueDate: "",
        PaymentmodeID: "",
        RevenueAmount: "",
        DueAmount: "",
      },
    });

    setActiveStep(1);
  }
};

 
  const getPaymentLabel = () =>
    Picaso_Paymode_Options.find(
      (x) => String(x.id) === String(formik.values.PaymentmodeID)
    )?.name || "-";



  return (
    <div className="min-h-fit">
      <div className="max-w-4xl mx-auto">

      
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            {/* pill icon */}
            <span className="bg-sky-100 p-2 rounded-xl">
              <svg
                className="w-5 h-5 text-sky-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </span>
            {editingId ? "Update Spectacle Revenue" : "Spectacle Revenue Entry"}
          </h1>

          {/* Step progress pills */}
          <div className="flex gap-2">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className={`h-2 w-12 rounded-full transition-colors duration-300 ${
                  activeStep >= s.id ? "bg-sky-600" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>

        
        <div className="bg-white rounded-3xl shadow-xl shadow-blue-100 border border-gray-100 overflow-hidden">

         
          <div className="flex border-b">
            {STEPS.map((step) => (
              <button
                key={step.id}
                type="button"
                disabled
                className={`flex-1 py-4 text-sm font-semibold transition-colors
                  ${
                    activeStep === step.id
                      ? "text-sky-600 border-b-2 border-sky-600 bg-white"
                      : "text-gray-400 bg-gray-50"
                  }`}
              >
                {step.label}
              </button>
            ))}
          </div>

          
          <div className="p-8">
            <form
              onSubmit={(e) => e.preventDefault()}
              className="space-y-5"
            >

           
              {activeStep === 1 && (
                <section>
                  <h3 className="text-base font-semibold text-sky-700 mb-5 flex items-center gap-2">
                    <span className="w-1.5 h-5 bg-sky-600 rounded-full" />
                    Revenue Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                
                    <div>
                      <label className="text-sm text-gray-600 block mb-1">
                        Revenue Date{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <DatePicker
                        selected={
                          formik.values.RevenueDate
                            ? new Date(formik.values.RevenueDate)
                            : null
                        }
                        onChange={(date) =>
                          formik.setFieldValue(
                            "RevenueDate",
                            formatDateOnly(date)
                          )
                        }
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
                      {formik.touched.RevenueDate &&
                        formik.errors.RevenueDate && (
                          <p className="text-red-500 text-xs mt-1">
                            {formik.errors.RevenueDate}
                          </p>
                        )}
                    </div>

                    
                    <Select
                      label="Payment Mode"
                      required
                      name="PaymentmodeID"
                      value={formik.values.PaymentmodeID}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.PaymentmodeID &&
                        formik.errors.PaymentmodeID
                      }
                    >
                      <option value="">Select Payment Mode</option>
                      {Picaso_Paymode_Options.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                </section>
              )}

             
              {activeStep === 2 && (
                <section>
                  <h3 className="text-base font-semibold text-sky-700 mb-5 flex items-center gap-2">
                    <span className="w-1.5 h-5 bg-sky-600 rounded-full" />
                    Amount Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input
  label="Revenue Amount"
  required
  name="RevenueAmount"
  value={formik.values.RevenueAmount}
  onChange={(e) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    formik.setFieldValue("RevenueAmount", value);
  }}
  error={
    formik.touched.RevenueAmount &&
    formik.errors.RevenueAmount
  }
/>

                 <Input
  label="Due Amount"
  name="DueAmount"
  value={formik.values.DueAmount}
  onChange={(e) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    formik.setFieldValue("DueAmount", value);
  }}
  error={
    formik.touched.DueAmount &&
    formik.errors.DueAmount
  }
/>
                  </div>
                </section>
              )}

              {/* ── STEP 3 : Confirm ── */}
              {activeStep === 3 && (
                <section>
                  <div className="bg-sky-50 rounded-xl border border-sky-200 p-6 space-y-5">
                    <h3 className="text-base font-semibold text-sky-700">
                      Confirm Revenue Entry
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
                      <div>
                        <p className="text-gray-400 text-xs mb-0.5">Revenue Date</p>
                        <p className="font-medium">
                          {formik.values.RevenueDate
                            ? new Date(
                                formik.values.RevenueDate
                              ).toLocaleDateString("en-IN")
                            : "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-400 text-xs mb-0.5">Payment Mode</p>
                        <p className="font-medium">{getPaymentLabel()}</p>
                      </div>

                      <div>
                        <p className="text-gray-400 text-xs mb-0.5">Revenue Amount</p>
                        <p className="font-semibold text-emerald-700">
                          ₹{Number(formik.values.RevenueAmount || 0).toFixed(2)}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-400 text-xs mb-0.5">Due Amount</p>
                        <p className="font-semibold text-orange-600">
                          ₹{Number(formik.values.DueAmount || 0).toFixed(2)}
                        </p>
                      </div>

                      <div className="col-span-full border-t pt-3">
                        <p className="text-gray-400 text-xs mb-0.5">Grand Total</p>
                        <p className="font-bold text-sky-700 text-lg">
                          ₹
                          {(
                            Number(formik.values.RevenueAmount || 0) +
                            Number(formik.values.DueAmount || 0)
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* ── Footer Buttons ── */}
              <div className="flex justify-between items-center pt-5 border-t flex-wrap gap-3">
                <div className="flex gap-2">
                  {activeStep > 1 && (
                    <Button type="button" variant="gray" onClick={prevStep}>
                      Back
                    </Button>
                  )}
                  <Button type="button" variant="gray" onClick={handleReset}>
                    <ArrowPathIcon className="w-5 h-5 inline mr-1" />
                    Reset
                  </Button>
                </div>

                {activeStep < 3 ? (
                  <Button type="button" variant="sky" onClick={nextStep}>
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="green"
                    onClick={formik.handleSubmit}
                  >
                    {editingId ? "Update" : "Save"}
                  </Button>
                )}
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SpectacleRevenueForm;
