import React, { useState, useMemo } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

import {
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
  CurrencyRupeeIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

import { useCenterComboListQuery, useGetTenantsQuery, useCreatePackageMutation,
 } from "../redux/apiSlice";

import { healthAlert } from "../utils/healthSwal";
import { Input, Select, Button } from "../components/FormControls";
import { PACKAGE_TYPES, TEST_MASTER } from "../utils/constants";

const TestPackageForm = () => {

  const { data: tenantData } = useGetTenantsQuery();

  const { data: centerData } = useCenterComboListQuery();

  const [createPackage, { isLoading }] =
    useCreatePackageMutation();

  const tenants = tenantData?.data?.data || [];
  const centers = centerData?.data?.data || [];
  const [activeStep, setActiveStep] = useState(1);
  const [search, setSearch] = useState({
    vitalSigns: "",
    clinicalExamination: "",
    laboratoryInvestigation: "",
    radiologySpecialTests: "",
  });
  const formik = useFormik({

    initialValues: {

      packageName: "",

      packageType: "",

      tenantId: "",

      centerId: "",

      packagePrice: "",

      selectedTests: {

        vitalSigns: [],

        clinicalExamination: [],

        laboratoryInvestigation: [],

        radiologySpecialTests: [],
      },
    },

    validationSchema: Yup.object({

      packageName: Yup.string().required(
        "Package Name is required"
      ),

      packageType: Yup.string().required(
        "Package Type is required"
      ),

      tenantId: Yup.string().required(
        "Tenant is required"
      ),

      centerId: Yup.string().required(
        "Center is required"
      ),
    }),

    onSubmit: async (values) => {

      try {

        await createPackage({

          package_name: values.packageName,

          package_type: values.packageType,

          tenant_id: Number(values.tenantId),

          center_id: Number(values.centerId),

          package_price:
            values.packagePrice === ""
              ? null
              : Number(values.packagePrice),

          package_list: values.selectedTests,

        }).unwrap();

        healthAlert({
          title: "Success",
          text: "Package created successfully",
          icon: "success",
        });

        formik.resetForm();

        setActiveStep(1);

      } catch (error) {

        healthAlert({
          title: "Error",
          text:
            error?.data?.message ||
            "Failed to create package",
          icon: "error",
        });

      }

    },

  });
  const nextStep = async () => {

    const errors = await formik.validateForm();

    if (
      activeStep === 1 &&
      (
        errors.packageName ||
        errors.packageType ||
        errors.tenantId ||
        errors.centerId
      )
    ) {

      formik.setTouched({

        packageName: true,

        packageType: true,

        tenantId: true,

        centerId: true,

      });

      return;
    }

    setActiveStep((prev) => prev + 1);

  };

  const prevStep = () =>
    setActiveStep((prev) => prev - 1);
  const handleReset = () => {
    formik.resetForm();
    setSearch({
      vitalSigns: "",
      clinicalExamination: "",
      laboratoryInvestigation: "",
      radiologySpecialTests: "",
    });
    setActiveStep(1);
  };
  const toggleTest = (category, test) => {
    const selected =
      formik.values.selectedTests[category];

    const updated = selected.includes(test)
      ? selected.filter((item) => item !== test)
      : [...selected, test];

    formik.setFieldValue(
      `selectedTests.${category}`,
      updated
    );
  };
  const selectAll = (category) => {
    formik.setFieldValue(
      `selectedTests.${category}`,
      TEST_MASTER[category]
    );
  };
  const removeAll = (category) => {
    formik.setFieldValue(
      `selectedTests.${category}`,
      []
    );

  };
  const filteredTests = useMemo(() => {
    return {
      vitalSigns:
        TEST_MASTER.vitalSigns.filter((x) =>
          x
            .toLowerCase()
            .includes(
              search.vitalSigns.toLowerCase()
            )
        ),
      clinicalExamination:
        TEST_MASTER.clinicalExamination.filter(
          (x) =>
            x
              .toLowerCase()
              .includes(
                search.clinicalExamination.toLowerCase()
              )
        ),
      laboratoryInvestigation:
        TEST_MASTER.laboratoryInvestigation.filter(
          (x) =>
            x
              .toLowerCase()
              .includes(
                search.laboratoryInvestigation.toLowerCase()
              )
        ),
      radiologySpecialTests:
        TEST_MASTER.radiologySpecialTests.filter(
          (x) =>
            x
              .toLowerCase()
              .includes(
                search.radiologySpecialTests.toLowerCase()
              )
        ),

    };

  }, [search]);
  const selectedTenant =
    tenants.find(
      (x) =>
        Number(x.id) ===
        Number(formik.values.tenantId)
    )?.name;

  const selectedCenter =
    centers.find(
      (x) =>
        Number(x.id) ===
        Number(formik.values.centerId)
    )?.name;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <span className="bg-blue-100 p-2 rounded-xl">
              <ClipboardDocumentCheckIcon className="w-6 h-6 text-blue-600" />
            </span>
            Package Registration
          </h1>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((step) => (

              <div
                key={step}
                className={`h-2 w-12 rounded-full ${activeStep >= step
                    ? "bg-sky-600"
                    : "bg-gray-200"
                  }`}
              />

            ))}

          </div>

        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-blue-100 border border-gray-100 overflow-hidden">

          <div className="flex border-b">
            {[
              {
                id: 1,
                label: "Package",
                icon: DocumentTextIcon,
              },
              {
                id: 2,
                label: "Tests",
                icon: ClipboardDocumentCheckIcon,
              },
              {
                id: 3,
                label: "Price",
                icon: CurrencyRupeeIcon,
              },
              {
                id: 4,
                label: "Preview",
                icon: CheckCircleIcon,
              },
            ].map((step) => (

              <button
                key={step.id}
                disabled
                type="button"
                className={`flex-1 py-4 flex items-center justify-center gap-2 transition-colors ${activeStep === step.id
                    ? "bg-white text-sky-600 font-bold"
                    : "text-gray-400"
                  }`}
              >

                <step.icon className="w-5 h-5" />

                {step.label}

              </button>

            ))}

          </div>

          <div className="p-10">

            <form
              onSubmit={(e) => e.preventDefault()}
              className="space-y-8"
            >
              {activeStep === 1 && (
                <section className="animate-in fade-in duration-500">
                  <h3 className="text-lg font-semibold text-sky-700 mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span>
                    Package Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Package Name"
                      required
                      placeholder="Enter Package Name"
                      {...formik.getFieldProps("packageName")}
                      error={
                        formik.touched.packageName &&
                        formik.errors.packageName
                      }
                    />

                    <Select
                      label="Package Type"
                      required
                      {...formik.getFieldProps("packageType")}
                      error={
                        formik.touched.packageType &&
                        formik.errors.packageType
                      }
                    >
                      <option value="">
                        Select Package Type
                      </option>
                      {PACKAGE_TYPES.map((item) => (
                        <option
                          key={item.value}
                          value={item.value}
                        >
                          {item.label}
                        </option>

                      ))}

                    </Select>

                    <Select
                      label="Assign Tenant"
                      required
                      {...formik.getFieldProps("tenantId")}
                      error={
                        formik.touched.tenantId &&
                        formik.errors.tenantId
                      }
                    >

                      <option value="">

                        Select Tenant

                      </option>

                      {tenants.map((tenant) => (

                        <option
                          key={tenant.id}
                          value={tenant.id}
                        >
                          {tenant.name}
                        </option>

                      ))}

                    </Select>

                    <Select
                      label="Assign Center"
                      required
                      {...formik.getFieldProps("centerId")}
                      error={
                        formik.touched.centerId &&
                        formik.errors.centerId
                      }
                    >

                      <option value="">

                        Select Center

                      </option>

                      {centers.map((center) => (

                        <option
                          key={center.id}
                          value={center.id}
                        >
                          {center.name}
                        </option>

                      ))}

                    </Select>

                  </div>

                </section>

              )}

              {activeStep === 2 && (
                <section className="animate-in fade-in duration-500">

                  <h3 className="text-lg font-semibold text-sky-700 mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span>
                    Select Package Tests
                  </h3>

                  <div className="space-y-8">

                    {Object.keys(TEST_MASTER).map((category) => {

                      const title = category
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase());

                      const selected =
                        formik.values.selectedTests[category];

                      const list = filteredTests[category];

                      const allSelected =
                        selected.length === TEST_MASTER[category].length;

                      return (

                        <div
                          key={category}
                          className="border border-gray-200 rounded-2xl overflow-hidden"
                        >

                          <div className="bg-slate-50 px-5 py-4 flex justify-between items-center">

                            <div>

                              <h4 className="font-semibold text-slate-800">
                                {title}
                              </h4>

                              <p className="text-xs text-slate-500 mt-1">
                                Selected : {selected.length}
                              </p>

                            </div>

                            <button
                              type="button"
                              className="text-sky-600 text-sm font-semibold hover:underline"
                              onClick={() =>
                                allSelected
                                  ? removeAll(category)
                                  : selectAll(category)
                              }
                            >
                              {allSelected
                                ? "Remove All"
                                : "Select All"}
                            </button>
                          </div>
                          <div className="p-5 border-t">
                            <Input
                              placeholder={`Search ${title}`}
                              value={search[category]}
                              onChange={(e) =>
                                setSearch((prev) => ({
                                  ...prev,
                                  [category]: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-5 pt-0">

                            {list.map((test) => {

                              const isSelected =
                                selected.includes(test);

                              return (

                                <div
                                  key={test}
                                  onClick={() =>
                                    toggleTest(category, test)
                                  }
                                  className={`cursor-pointer rounded-xl border p-3 transition-all flex justify-between items-center
                    ${isSelected
                                      ? "border-sky-500 bg-sky-50"
                                      : "border-gray-200 hover:border-sky-300 hover:bg-slate-50"
                                    }`}
                                >

                                  <span className="text-sm font-medium text-slate-700">
                                    {test}
                                  </span>

                                  {isSelected && (
                                    <CheckCircleIcon className="w-5 h-5 text-sky-600" />
                                  )}

                                </div>

                              );

                            })}

                          </div>
                          {selected.length > 0 && (

                            <div className="px-5 pb-5">

                              <div className="flex flex-wrap gap-2">

                                {selected.map((test) => (

                                  <span
                                    key={test}
                                    className="bg-sky-100 text-sky-700 border border-sky-200 px-3 py-1 rounded-full text-xs font-medium"
                                  >
                                    {test}
                                  </span>

                                ))}

                              </div>

                            </div>

                          )}

                        </div>

                      );

                    })}

                  </div>

                </section>
              )}


              {activeStep === 3 && (
                <section className="animate-in fade-in duration-500">

                  <h3 className="text-lg font-semibold text-sky-700 mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span>
                    Package Pricing
                  </h3>

                  <div className="grid md:grid-cols-2 gap-8">

                    <div>

                      <Input
                        label="Package Price"
                        placeholder="Enter Package Price"
                        type="number"
                        {...formik.getFieldProps("packagePrice")}
                      />

                      <p className="text-xs text-gray-500 mt-2">
                        This field is optional.
                      </p>

                    </div>

                    <div className="bg-sky-50 rounded-2xl border border-sky-100 p-6">

                      <h4 className="font-bold text-sky-700 mb-5">
                        Package Summary
                      </h4>

                      <div className="space-y-4 text-sm">

                        <div className="flex justify-between">
                          <span>Package</span>
                          <b>{formik.values.packageName || "-"}</b>
                        </div>

                        <div className="flex justify-between">
                          <span>Type</span>
                          <b>{formik.values.packageType || "-"}</b>
                        </div>

                        <div className="flex justify-between">
                          <span>Tenant</span>
                          <b>{selectedTenant || "-"}</b>
                        </div>

                        <div className="flex justify-between">
                          <span>Center</span>
                          <b>{selectedCenter || "-"}</b>
                        </div>

                        <div className="flex justify-between">
                          <span>Price</span>
                          <b>
                            {formik.values.packagePrice
                              ? `₹ ${formik.values.packagePrice}`
                              : "Not Set"}
                          </b>
                        </div>

                      </div>

                    </div>

                  </div>

                </section>
              )}


              {activeStep === 4 && (
                <section className="animate-in fade-in duration-500">

                  <div className="bg-sky-50 rounded-3xl border border-sky-100 p-8">

                    <h3 className="text-xl font-bold text-sky-700 mb-8">
                      Package Preview
                    </h3>

                    <div className="grid md:grid-cols-2 gap-6 mb-8">

                      <div>
                        <p className="text-xs uppercase text-gray-500">
                          Package Name
                        </p>

                        <p className="font-semibold">
                          {formik.values.packageName}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase text-gray-500">
                          Package Type
                        </p>

                        <p className="font-semibold">
                          {formik.values.packageType}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase text-gray-500">
                          Tenant
                        </p>

                        <p className="font-semibold">
                          {selectedTenant}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase text-gray-500">
                          Center
                        </p>

                        <p className="font-semibold">
                          {selectedCenter}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase text-gray-500">
                          Price
                        </p>

                        <p className="font-semibold">
                          {formik.values.packagePrice
                            ? `₹ ${formik.values.packagePrice}`
                            : "Not Set"}
                        </p>
                      </div>

                    </div>

                    {Object.entries(formik.values.selectedTests).map(
                      ([category, tests]) => {

                        if (tests.length === 0) return null;

                        const title = category
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase());

                        return (

                          <div
                            key={category}
                            className="mb-6"
                          >

                            <h4 className="font-semibold text-sky-700 mb-3">
                              {title}
                            </h4>

                            <div className="flex flex-wrap gap-2">

                              {tests.map((test) => (

                                <span
                                  key={test}
                                  className="px-3 py-1 rounded-full bg-white border border-sky-200 text-sky-700 text-xs"
                                >
                                  {test}
                                </span>

                              ))}

                            </div>

                          </div>

                        );

                      }
                    )}

                  </div>

                </section>
              )}
             <div className="flex justify-between items-center pt-6 border-t flex-wrap gap-3">

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
        onClick={handleReset}
      >
        <ArrowPathIcon className="w-5 h-5 inline mr-1" />
        Reset
      </Button>

    </div>

    {activeStep < 4 ? (

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
        onClick={formik.handleSubmit}
        disabled={isLoading}
      >
        <CheckCircleIcon className="w-5 h-5 inline mr-1" />

        {isLoading
          ? "Creating..."
          : "Create Package"}

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

export default TestPackageForm;