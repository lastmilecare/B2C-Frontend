import React, { useState, useRef, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  ShieldCheckIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  KeyIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import {
  useCreateRoleMutation,
  useGetAllTenantsQuery,
  useGetAllPermissionsComboQuery,
} from "../redux/apiSlice";
import { healthAlert } from "../utils/healthSwal";
import { Input, Select, Button } from "../components/FormControls";
import { cookie } from "../utils/cookie";

const Roles = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const { data: tenantData } = useGetAllTenantsQuery();
  const { data: permissionsData } = useGetAllPermissionsComboQuery();

  const userRole = cookie.get("role");
  const tenants = tenantData?.data?.data || [];
  const permissions = permissionsData?.data?.data || [];
  const [permissionSearch, setPermissionSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();

  const filteredPermissions =
    userRole === "LMC_ADMIN"
      ? permissions
      : permissions.filter(
          (p) => p.resource !== "tenant" && p.resource !== "role",
        );

  const formik = useFormik({
    initialValues: {
      name: "",
      tenantId: "",
      description: "",
      permissionIds: [],
    },
    validationSchema: Yup.object({
      // name: Yup.string().required("Role name is required"),
      name: Yup.string()
        .required("Role name is required")
        .test(
          "tenant-in-name",
          "Role name must include tenant name",
          function (value) {
            const { tenantId } = this.parent;
            if (!tenantId || !value) return true;

            const tenant = tenants.find((t) => t.id === Number(tenantId));
            if (!tenant) return true;

            const formattedTenant = tenant.name
              .trim()
              .replace(/\s+/g, "_")
              .toLowerCase();

            return value.toLowerCase().includes(formattedTenant);
          },
        ),
      tenantId: Yup.string().required("Tenant selection is required"),
      permissionIds: Yup.array().min(1, "At least one permission is required"),
    }),
    onSubmit: async (values) => {
      try {
        await createRole({
          ...values,
          tenantId: Number(values.tenantId),
        }).unwrap();

        healthAlert({
          title: "Success",
          text: "Role created successfully",
          icon: "success",
        });
        formik.resetForm();
        setActiveStep(1);
      } catch (error) {
        healthAlert({
          title: "Error",
          text: error?.data?.message || "Failed",
          icon: "error",
        });
      }
    },
  });
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const filteredPermissionList = filteredPermissions.filter((p) =>
    `${p.action} ${p.resource}`
      .toLowerCase()
      .includes(permissionSearch.toLowerCase())
  );

  const nextStep = async () => {
    const errors = await formik.validateForm();
    if (activeStep === 1 && (errors.name || errors.tenantId)) {
      formik.setTouched({ name: true, tenantId: true });
      return;
    }
    if (activeStep === 2 && errors.permissionIds) {
      formik.setTouched({ permissionIds: true });
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const prevStep = () => setActiveStep((prev) => prev - 1);

  const getSelectedPermissionNames = () => {
    return filteredPermissions
      .filter((p) => formik.values.permissionIds.includes(Number(p.id)))
      .map((p) => `${p.action}:${p.resource}`);
  };

  const selectedTenantName = tenants.find(
    (t) => t.id === Number(formik.values.tenantId),
  )?.name;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <span className="bg-blue-100 p-2 rounded-xl">
              <ShieldCheckIcon className="w-6 text-blue-600" />
            </span>
            Role Registration
          </h1>
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 w-12 rounded-full ${
                  activeStep >= s ? "bg-sky-600" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-blue-100 border border-gray-100 overflow-hidden">
          {/* Stepper Navigation */}
          <div className="flex border-b">
            {[
              { id: 1, label: "Basic Details", icon: DocumentTextIcon },
              { id: 2, label: "Permissions", icon: KeyIcon },
              { id: 3, label: "Confirm", icon: ClipboardDocumentCheckIcon },
            ].map((step) => (
              <button
                key={step.id}
                type="button"
                disabled
                className={`flex-1 py-4 flex items-center justify-center gap-2 transition-colors ${
                  activeStep === step.id
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
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              {activeStep === 1 && (
                <section className="animate-in fade-in duration-500">
                  <h3 className="text-lg font-semibold text-sky-700 mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span>{" "}
                    Role Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Role Name"
                      {...formik.getFieldProps("name")}
                      error={formik.touched.name && formik.errors.name}
                      placeholder="Enter role title"
                      required
                    />
                    <Select
                      label="Assign Tenant"
                      {...formik.getFieldProps("tenantId")}
                      error={formik.touched.tenantId && formik.errors.tenantId}
                      required
                    >
                      <option value="">Select Tenant</option>
                      {tenants.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </Select>
                    <div className="md:col-span-2">
                      <Input
                        label="Description"
                        {...formik.getFieldProps("description")}
                        placeholder="What can this role do?"
                      />
                    </div>
                  </div>
                </section>
              )}

             {activeStep === 2 && (
                <section className="animate-in fade-in duration-500">

                  <h3 className="text-lg font-semibold text-sky-700 mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span> Access Control
                  </h3>

                  <div className="space-y-4">

                    <label className="block text-sm font-medium text-slate-700">
                      Select Permissions <span className="text-red-500">*</span>
                    </label>

                    
                    <div className="relative" ref={dropdownRef}>

                      <input
                        type="text"
                        placeholder="Search permissions..."
                        value={permissionSearch}
                        onChange={(e) => {
                          setPermissionSearch(e.target.value);
                          setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        className={`w-full p-3 border-2 rounded-2xl bg-slate-50 transition-all 
          focus:ring-4 focus:ring-sky-100 outline-none text-sm
          ${formik.touched.permissionIds && formik.errors.permissionIds
                            ? "border-red-300"
                            : "border-slate-100 focus:border-sky-400"
                          }`}
                      />

                      
                      {showDropdown && (
                        <div className="absolute w-full bg-white border border-gray-200 rounded-xl mt-1 max-h-60 overflow-auto z-50 shadow-lg">

                          {filteredPermissionList.length > 0 ? (
                            filteredPermissionList.map((p) => {
                              const id = Number(p.id);

                              return (
                                <div
                                  key={p.id}
                                  onMouseDown={() => {
                                    if (!formik.values.permissionIds.includes(id)) {
                                      formik.setFieldValue("permissionIds", [
                                        ...formik.values.permissionIds,
                                        id,
                                      ]);
                                    }

                                    setShowDropdown(false); 
                                    setPermissionSearch(""); 
                                  }}
                                  className="px-3 py-2 text-sm hover:bg-sky-50 cursor-pointer"
                                >
                                  {p.action.toUpperCase()} : {p.resource.replace("_", " ")}
                                </div>
                              );
                            })
                          ) : (
                            <div className="p-3 text-xs text-gray-400">
                              No permissions found
                            </div>
                          )}

                        </div>
                      )}
                    </div>

                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formik.values.permissionIds.map((id) => {
                        const perm = filteredPermissions.find(
                          (p) => Number(p.id) === Number(id)
                        );

                        if (!perm) return null;

                        return (
                          <div
                            key={id}
                            className="flex items-center gap-2 bg-sky-100 text-sky-700 px-3 py-1 rounded-full text-xs border border-sky-200"
                          >
                            {perm.action}:{perm.resource}

                            <span
                              onClick={() => {
                                formik.setFieldValue(
                                  "permissionIds",
                                  formik.values.permissionIds.filter(
                                    (pid) => Number(pid) !== Number(id)
                                  )
                                );
                              }}
                              className="cursor-pointer text-red-500 font-bold"
                            >
                              ✕
                            </span>
                          </div>
                        );
                      })}
                    </div>

                  
                    {formik.touched.permissionIds && formik.errors.permissionIds && (
                      <p className="text-xs text-red-500 mt-1">
                        {formik.errors.permissionIds}
                      </p>
                    )}

                    
                    <p className="text-xs text-slate-400 italic">
                      Tip: Search and click to select permissions one by one.
                    </p>

                  </div>
                </section>
              )}


              {activeStep === 3 && (
                <section className="animate-in fade-in duration-500">
                  <div className="bg-sky-50 p-8 rounded-3xl border border-sky-100 space-y-6">
                    <h3 className="text-xl font-bold text-sky-800 flex items-center gap-2">
                      <ClipboardDocumentCheckIcon className="w-6 h-6" /> Confirm
                      Role Details
                    </h3>

                    <div className="grid md:grid-cols-2 gap-8 text-sm">
                      <div className="space-y-3">
                        <p className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                          Role Identity
                        </p>
                        <p className="text-slate-800 text-base">
                          <b>Name:</b> {formik.values.name}
                        </p>
                        <p className="text-slate-800 text-base">
                          <b>Tenant:</b> {selectedTenantName || "N/A"}
                        </p>
                      </div>
                      <div className="space-y-3">
                        <p className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                          Description
                        </p>
                        <p className="text-slate-700 italic">
                          {formik.values.description ||
                            "No description provided"}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-sky-200 pt-6">
                      <p className="text-slate-500 uppercase tracking-wider text-[10px] font-bold mb-3">
                        Assigned Permissions
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {getSelectedPermissionNames().map((name, i) => (
                          <span
                            key={i}
                            className="bg-white px-3 py-1 rounded-full text-sky-700 border border-sky-200 text-xs font-medium shadow-sm"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              <div className="flex justify-between pt-8 border-t border-slate-50">
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
                      formik.resetForm();
                      setActiveStep(1);
                    }}
                  >
                    <ArrowPathIcon className="w-5 h-5 inline mr-1" /> Reset
                  </Button>
                </div>

                {activeStep < 3 ? (
                  <Button type="button" variant="sky" onClick={nextStep}>
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="sky"
                    onClick={formik.handleSubmit}
                    disabled={isCreating}
                  >
                    <CheckCircleIcon className="w-5 h-5 inline mr-1" />
                    {isCreating ? "Creating..." : "Confirm & Save"}
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

export default Roles;
