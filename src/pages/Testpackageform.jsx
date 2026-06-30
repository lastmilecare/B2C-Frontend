import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  BeakerIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  PlusIcon,
  TrashIcon,
  UserIcon
} from "@heroicons/react/24/outline";
import { healthAlert } from "../utils/healthSwal";
import { Input, Select, Button } from "../components/FormControls";
import { useNavigate } from "react-router-dom";
import { BLOOD_GROUPS, RADIOLOGY_TESTS, PACKAGE_LEVELS, PACKAGES_STORAGE_KEY, getStoredPackages, BLOOD_TESTS } from "../utils/constants";
// ─── Static master test catalogue ───────────────────────────────────────────
import PatientSelector from "../components/common/PatientSelector";

const savePackageToStorage = (pkg) => {
  const existing = getStoredPackages();
  const updated = [...existing, pkg];
  localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(updated));
};

const updatePackageInStorage = (id, pkg) => {
  const existing = getStoredPackages();
  const updated = existing.map((p) => (p.id === id ? { ...p, ...pkg } : p));
  localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(updated));
};

// ─── Component ────────────────────────────────────────────────────────────────
const TestPackageForm = ({ editData, onSaved }) => {
  const [activeStep, setActiveStep] = useState(1);
  const [bloodSearch, setBloodSearch] = useState("");
  const [radSearch, setRadSearch] = useState("");
  const navigate = useNavigate();

  const isEditMode = Boolean(editData?.id);

  const formik = useFormik({
    initialValues: {
      packageName: editData?.packageName || "",
      level: editData?.level || "",
      description: editData?.description || "",
      bloodTestIds: editData?.bloodTestIds || [],
      radiologyTestIds: editData?.radiologyTestIds || [],
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      packageName: Yup.string().required("Package name is required"),
      level: Yup.string().required("Level is required"),
      bloodTestIds: Yup.array().min(1, "Select at least one blood/lab test"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const pkg = {
          id: editData?.id || Date.now().toString(),
          packageName: values.packageName,
          level: values.level,
          description: values.description,
          bloodTestIds: values.bloodTestIds,
          radiologyTestIds: values.radiologyTestIds,
          bloodTests: BLOOD_TESTS.filter((t) =>
            values.bloodTestIds.includes(t.id)
          ),
          radiologyTests: RADIOLOGY_TESTS.filter((t) =>
            values.radiologyTestIds.includes(t.id)
          ),
          createdAt: editData?.createdAt || new Date().toISOString(),
        };

        if (isEditMode) {
          updatePackageInStorage(editData.id, pkg);
        } else {
          savePackageToStorage(pkg);
        }

        healthAlert({
          title: "Success",
          text: isEditMode
            ? "Package updated successfully"
            : "Package created successfully",
          icon: "success",
        });

        resetForm();
        setActiveStep(1);
        if (onSaved) onSaved();
      } catch {
        healthAlert({
          title: "Error",
          text: "Failed to save package",
          icon: "error",
        });
      }
    },
  });

  const nextStep = async () => {
    const errors = await formik.validateForm();
    if (
      activeStep === 2 &&
      (errors.packageName || errors.level)
    ) {
      formik.setTouched({ packageName: true, level: true });
      return;
    }
    if (activeStep === 3 && errors.bloodTestIds) {
      formik.setTouched({ bloodTestIds: true });
      healthAlert({
        title: "Warning",
        text: errors.bloodTestIds,
        icon: "warning",
      });
      return;
    }
    setActiveStep((p) => p + 1);
  };

  const prevStep = () => setActiveStep((p) => p - 1);

  const toggleBlood = (id) => {
    const current = formik.values.bloodTestIds;
    formik.setFieldValue(
      "bloodTestIds",
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    );
  };

  const toggleRad = (id) => {
    const current = formik.values.radiologyTestIds;
    formik.setFieldValue(
      "radiologyTestIds",
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    );
  };

  const toggleAllBlood = () => {
    const filtered = BLOOD_TESTS.filter((t) =>
      t.name.toLowerCase().includes(bloodSearch.toLowerCase())
    );
    const allIds = filtered.map((t) => t.id);
    const allSelected = allIds.every((id) =>
      formik.values.bloodTestIds.includes(id)
    );
    if (allSelected) {
      formik.setFieldValue(
        "bloodTestIds",
        formik.values.bloodTestIds.filter((id) => !allIds.includes(id))
      );
    } else {
      formik.setFieldValue("bloodTestIds", [
        ...new Set([...formik.values.bloodTestIds, ...allIds]),
      ]);
    }
  };

  const toggleAllRad = () => {
    const filtered = RADIOLOGY_TESTS.filter((t) =>
      t.name.toLowerCase().includes(radSearch.toLowerCase())
    );
    const allIds = filtered.map((t) => t.id);
    const allSelected = allIds.every((id) =>
      formik.values.radiologyTestIds.includes(id)
    );
    if (allSelected) {
      formik.setFieldValue(
        "radiologyTestIds",
        formik.values.radiologyTestIds.filter((id) => !allIds.includes(id))
      );
    } else {
      formik.setFieldValue("radiologyTestIds", [
        ...new Set([...formik.values.radiologyTestIds, ...allIds]),
      ]);
    }
  };

  const filteredBlood = BLOOD_TESTS.filter((t) =>
    t.name.toLowerCase().includes(bloodSearch.toLowerCase())
  );
  const filteredRad = RADIOLOGY_TESTS.filter((t) =>
    t.name.toLowerCase().includes(radSearch.toLowerCase())
  );

  const selectedBloodTests = BLOOD_TESTS.filter((t) =>
    formik.values.bloodTestIds.includes(t.id)
  );
  const selectedRadTests = RADIOLOGY_TESTS.filter((t) =>
    formik.values.radiologyTestIds.includes(t.id)
  );

  const selectedLevel = PACKAGE_LEVELS.find(
    (l) => l.value === formik.values.level
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <span className="bg-blue-100 p-2 rounded-xl">
              <BeakerIcon className="w-6 text-blue-600" />
            </span>
            {isEditMode ? "Edit Test Package" : "Create Test Package"}
          </h1>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 w-12 rounded-full transition-all ${
                  activeStep >= s ? "bg-sky-600" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Tab Bar */}
          <div className="flex border-b">
            {[
                { id: 1, label: "Worker Details", icon: UserIcon },
              { id: 2, label: "Package Info", icon: DocumentTextIcon },
              { id: 3, label: "Select Tests", icon: BeakerIcon },
              { id: 4, label: "Confirm", icon: ClipboardDocumentCheckIcon },
            ].map((step) => (
              <button
                key={step.id}
                type="button"
                disabled
                className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-semibold transition-colors ${
                  activeStep === step.id
                    ? "bg-white text-sky-600 shadow-sm border-b-2 border-sky-600"
                    : "text-gray-400"
                }`}
              >
                <step.icon className="w-4 h-4" />
                {step.label}
              </button>
            ))}
          </div>

          <div className="p-8">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">

                 {activeStep === 1 && (
                          <section>
                            <PatientSelector formik={formik} />
                
                          </section>
                        )}
              {/* ── Step 1: Package Info ── */}
              {activeStep === 2 && (
                <section>
                  <h3 className="text-lg font-semibold text-sky-700 mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-sky-600 rounded-full" />
                    Package Information
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      label="Package Name"
                      required
                      placeholder="e.g. Annual Health Check"
                      {...formik.getFieldProps("packageName")}
                      error={
                        formik.touched.packageName && formik.errors.packageName
                      }
                    />

                    <Select
                      label="Package Level"
                      required
                      {...formik.getFieldProps("level")}
                      error={formik.touched.level && formik.errors.level}
                    >
                      <option value="">Select Level</option>
                      {PACKAGE_LEVELS.map((l) => (
                        <option key={l.value} value={l.value}>
                          {l.label}
                        </option>
                      ))}
                    </Select>

                    <div className="md:col-span-2">
                      <Input
                        label="Description"
                        placeholder="Brief description of this package"
                        {...formik.getFieldProps("description")}
                        error={
                          formik.touched.description &&
                          formik.errors.description
                        }
                      />
                    </div>
                  </div>

                  {/* Level badge preview */}
                  {formik.values.level && (
                    <div className="mt-6">
                      <p className="text-xs text-gray-500 mb-2">Preview</p>
                      <span
                        className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold ${
                          formik.values.level === "BASIC"
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : formik.values.level === "MEDIUM"
                            ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                            : "bg-purple-100 text-purple-700 border border-purple-200"
                        }`}
                      >
                        {selectedLevel?.label} Package
                      </span>
                    </div>
                  )}
                </section>
              )}

              {/* ── Step 2: Select Tests ── */}
              {activeStep === 3 && (
                <section className="space-y-8">
                  {/* Blood / Lab Tests */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-sky-700 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-sky-600 rounded-full" />
                        Blood / Lab Tests
                        <span className="ml-2 text-xs bg-sky-100 text-sky-600 px-2 py-0.5 rounded-full">
                          {formik.values.bloodTestIds.length} selected
                        </span>
                      </h3>
                      <button
                        type="button"
                        onClick={toggleAllBlood}
                        className="text-xs text-sky-600 font-semibold hover:underline"
                      >
                        {filteredBlood.every((t) =>
                          formik.values.bloodTestIds.includes(t.id)
                        )
                          ? "Remove All"
                          : "Select All"}
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Search blood tests..."
                      value={bloodSearch}
                      onChange={(e) => setBloodSearch(e.target.value)}
                      className="w-full mb-3 p-2.5 border-2 border-slate-100 rounded-xl bg-slate-50 text-sm
                        focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-50"
                    />

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {filteredBlood.map((test) => {
                        const selected = formik.values.bloodTestIds.includes(
                          test.id
                        );
                        return (
                          <button
                            key={test.id}
                            type="button"
                            onClick={() => toggleBlood(test.id)}
                            className={`text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                              selected
                                ? "border-sky-500 bg-sky-50 text-sky-700"
                                : "border-gray-100 bg-white text-gray-600 hover:border-sky-200 hover:bg-sky-50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{test.name}</span>
                              {selected && (
                                <CheckCircleIcon className="w-4 h-4 text-sky-500 flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {formik.touched.bloodTestIds &&
                      formik.errors.bloodTestIds && (
                        <p className="text-xs text-red-500 mt-2">
                          {formik.errors.bloodTestIds}
                        </p>
                      )}
                  </div>

                  {/* Radiology Tests */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-sky-700 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                        Radiology Tests
                        <span className="ml-2 text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">
                          {formik.values.radiologyTestIds.length} selected
                        </span>
                      </h3>
                      <button
                        type="button"
                        onClick={toggleAllRad}
                        className="text-xs text-sky-600 font-semibold hover:underline"
                      >
                        {filteredRad.every((t) =>
                          formik.values.radiologyTestIds.includes(t.id)
                        )
                          ? "Remove All"
                          : "Select All"}
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Search radiology tests..."
                      value={radSearch}
                      onChange={(e) => setRadSearch(e.target.value)}
                      className="w-full mb-3 p-2.5 border-2 border-slate-100 rounded-xl bg-slate-50 text-sm
                        focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-50"
                    />

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {filteredRad.map((test) => {
                        const selected =
                          formik.values.radiologyTestIds.includes(test.id);
                        return (
                          <button
                            key={test.id}
                            type="button"
                            onClick={() => toggleRad(test.id)}
                            className={`text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                              selected
                                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                : "border-gray-100 bg-white text-gray-600 hover:border-emerald-200 hover:bg-emerald-50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{test.name}</span>
                              {selected && (
                                <CheckCircleIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </section>
              )}

              {/* ── Step 3: Confirm ── */}
              {activeStep === 4 && (
                <section>
                  <div className="bg-sky-50 p-8 rounded-3xl border border-sky-100 space-y-6">
                    <h3 className="text-xl font-bold text-sky-800 flex items-center gap-2">
                      <ClipboardDocumentCheckIcon className="w-6 h-6" />
                      Confirm Package Details
                    </h3>

                    {/* Basic info */}
                    <div className="grid md:grid-cols-3 gap-6 text-sm">
                      <div>
                        <p className="text-slate-500 text-[10px] uppercase font-bold mb-1">
                          Package Name
                        </p>
                        <p className="text-slate-800 font-semibold text-base">
                          {formik.values.packageName}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-[10px] uppercase font-bold mb-1">
                          Level
                        </p>
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                            formik.values.level === "BASIC"
                              ? "bg-green-100 text-green-700"
                              : formik.values.level === "MEDIUM"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {selectedLevel?.label}
                        </span>
                      </div>
                      <div>
                        <p className="text-slate-500 text-[10px] uppercase font-bold mb-1">
                          Description
                        </p>
                        <p className="text-slate-700 italic">
                          {formik.values.description || "—"}
                        </p>
                      </div>
                    </div>

                    {/* Blood tests */}
                    <div className="border-t border-sky-200 pt-5">
                      <p className="text-slate-500 text-[10px] uppercase font-bold mb-3">
                        Blood / Lab Tests ({selectedBloodTests.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedBloodTests.map((t) => (
                          <span
                            key={t.id}
                            className="bg-sky-100 text-sky-700 border border-sky-200 px-3 py-1 rounded-full text-xs font-medium"
                          >
                            {t.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Radiology tests */}
                    {selectedRadTests.length > 0 && (
                      <div className="border-t border-sky-200 pt-5">
                        <p className="text-slate-500 text-[10px] uppercase font-bold mb-3">
                          Radiology Tests ({selectedRadTests.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {selectedRadTests.map((t) => (
                            <span
                              key={t.id}
                              className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-medium"
                            >
                              {t.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-100">
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
                      if (activeStep === 2) {
                        formik.setValues({
                          ...formik.values,
                          packageName: "",
                          level: "",
                          description: "",
                        });
                      } else if (activeStep === 3) {
                        formik.setFieldValue("bloodTestIds", []);
                        formik.setFieldValue("radiologyTestIds", []);
                        setBloodSearch("");
                        setRadSearch("");
                      } else {
                        formik.resetForm();
                        setActiveStep(1);
                      }
                    }}
                  >
                    <ArrowPathIcon className="w-4 h-4 inline mr-1" /> Reset
                  </Button>
                </div>

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
                    <CheckCircleIcon className="w-5 h-5 inline mr-1" />
                    {isEditMode ? "Update Package" : "Create Package"}
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