import React, { useState, useEffect, useRef } from "react";
import { useFormik } from "formik";
import {
  ArrowPathIcon,
  UserIcon,
  DocumentCheckIcon,
  PrinterIcon,
} from "@heroicons/react/24/outline";

import {
  useCreateFitnessMutation,
  useUpdateFitnessMutation,
  useGetFitnessByIdQuery,
  useGetTemplatesByTenantQuery,
  useGetAllTemplatesQuery,
  usePreviewTemplateMutation,
} from "../redux/apiSlice";
import { skipToken } from "@reduxjs/toolkit/query";
import { healthAlerts } from "../utils/healthSwal";
import { Input, Select, Button } from "../components/FormControls";
import { useNavigate } from "react-router-dom";
import PatientSelector from "../components/common/PatientSelector";
import { useParams } from "react-router-dom";
import { cookie } from "../utils/cookie";
import { useLocation } from "react-router-dom";
const FitnessCertificate = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [previewTemplate] = usePreviewTemplateMutation();
  const navigate = useNavigate();
  const printRef = useRef();
  const { id } = useParams();
  const location = useLocation();

const isTemplateRoute =
  location.pathname.includes("/template/");
  const [createFitness] = useCreateFitnessMutation();
  const [updateFitness] = useUpdateFitnessMutation();

  const { data: editData } = useGetFitnessByIdQuery(id, {
  skip: !id || isTemplateRoute,
});
  const tenantId = cookie.get("tenant_id");
  const ROLE_ADMIN = "LMC_ADMIN";
  const role = cookie.get("role");

  const isAdmin = role === ROLE_ADMIN;
  const { data: allTemplates } = useGetAllTemplatesQuery(undefined, {
    skip: !isAdmin,
    refetchOnMountOrArgChange: true,
  });

  const { data: tenantTemplates } = useGetTemplatesByTenantQuery(tenantId, {
    skip: isAdmin,
    refetchOnMountOrArgChange: true,
  });
  const [previewHtml, setPreviewHtml] = useState("");

  const templates = isAdmin ? allTemplates || [] : tenantTemplates || [];
  const formik = useFormik({
    initialValues: {
      EmployeeId: "",
      patient_id: "",
      Name: "",
      Gender: "",
      Age: "",
      certNo: "",
      issue_date: "",
      valid_till: "",
      fitness_status: "",
      doctor_signature: "",
      restrictions: "",
      recommendations: "",
      template_id: "",
    },

    onSubmit: async (values) => {
      try {
        const payload = {
          patient_id: values.patient_id,
          name: values.Name,
          gender: values.Gender,
          age: Number(values.Age),
          employee_id: values.EmployeeId,
          fitness_status: values.fitness_status,
          restrictions: values.restrictions,
          recommendations: values.recommendations,
          doctor_signature: values.doctor_signature,
          valid_till: values.valid_till ? new Date(values.valid_till) : null,
          issue_date: values.issue_date ? new Date(values.issue_date) : null,
          template_id: Number(values.template_id),
        };

        if (id) {
          await updateFitness({ id, body: payload }).unwrap();
          healthAlerts.success("Updated Successfully");
        } else {
          await createFitness(payload).unwrap();
          healthAlerts.success("Created Successfully");
        }

        navigate("/fitness-certificate");
      } catch {
        healthAlerts.error("Save Failed");
      }
    },
  });
  const generatePreview = async () => {
    if (!formik.values.template_id) return;

    try {
      const html = await previewTemplate({
        template_id: formik.values.template_id,
        data: { ...formik.values },
      }).unwrap();

      setPreviewHtml(html);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    if (activeStep === 3) {
      generatePreview();
    }
  }, [activeStep, formik.values.template_id]);

  useEffect(() => {
    if (editData) {
      formik.setValues({
        EmployeeId: editData.employee_id || "",
        patient_id: editData.patient_id || "",
        Name: editData.name || "",
        Gender: editData.gender || "",
        Age: editData.age || "",
        certNo: editData.certificate_number || "",
        issue_date: editData.issue_date?.split("T")[0] || "",
        valid_till: editData.valid_till?.split("T")[0] || "",
        fitness_status: editData.fitness_status || "",
        doctor_signature: editData.doctor_signature || "",
        restrictions: editData.restrictions || "",
        recommendations: editData.recommendations || "",
        template_id: editData.template_id || "",
      });
    }
  }, [editData]);

  const nextStep = () => {
    if (activeStep === 1 && !formik.values.Name) {
      healthAlerts.warning("Name is required");
      return;
    }

    if (activeStep === 2) {
      if (!formik.values.template_id) {
        healthAlerts.warning("Template is required");
        return;
      }

      if (!formik.values.issue_date) {
        healthAlerts.warning("Issue Date required");
        return;
      }

      if (!formik.values.valid_till) {
        healthAlerts.warning("Validity required");
        return;
      }

      if (!formik.values.fitness_status) {
        healthAlerts.warning("Fitness Status required");
        return;
      }

      if (!formik.values.doctor_signature) {
        healthAlerts.warning("Doctor name required");
        return;
      }
    }

    setActiveStep((p) => p + 1);
  };

  const prevStep = () => setActiveStep((p) => p - 1);

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const win = window.open("", "", "width=800,height=600");
    win.document.write(printContent);
    win.document.close();
    win.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 py-10">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-slate-800">
            Fitness Certificate
          </h1>

          <div className="flex gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 w-12 rounded ${
                  activeStep >= s ? "bg-sky-600" : "bg-blue-100"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border overflow-hidden">
          <div className="flex border-b">
            {["Patient", "Details", "Preview", "Download"].map((l, i) => (
              <div
                key={i}
                className={`flex-1 py-4 text-center font-semibold ${
                  activeStep === i + 1 ? "text-sky-600" : "text-gray-400"
                }`}
              >
                {l}
              </div>
            ))}
          </div>

          <form className="p-9 space-y-8">
            {activeStep === 1 && (
              <section>
                <PatientSelector formik={formik} />
              </section>
            )}

            {activeStep === 2 && (
              <section>
                <h3 className="text-sky-700 font-semibold mb-4">
                  Certificate Details
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    type="date"
                    label="Issue Date"
                    {...formik.getFieldProps("issue_date")}
                  />
                  {/* <Input label="Validity" {...formik.getFieldProps("valid_till")} /> */}
                  <Input
                    type="date"
                    label="Validity"
                    {...formik.getFieldProps("valid_till")}
                  />
                  <Select
                    label="Fitness Status"
                    value={formik.values.fitness_status}
                    onChange={(e) =>
                      formik.setFieldValue("fitness_status", e.target.value)
                    }
                  >
                    <option value="">Select</option>
                    <option value="FIT">Fit</option>
                    <option value="FIT_WITH_RESTRICTIONS">
                      Fit with Restrictions
                    </option>
                    <option value="UNFIT">Unfit</option>
                  </Select>
                  <Select
                    label="Select Template *"
                    value={formik.values.template_id}
                    onChange={(e) =>
                      formik.setFieldValue("template_id", e.target.value)
                    }
                  >
                    <option value="">Select Template</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </Select>
                  <Input
                    label="Doctor Name"
                    {...formik.getFieldProps("doctor_signature")}
                  />
                  <Input
                    label="Restrictions"
                    {...formik.getFieldProps("restrictions")}
                  />
                  <Input
                    label="Recommendations"
                    {...formik.getFieldProps("recommendations")}
                  />
                </div>
              </section>
            )}

            {activeStep === 3 && (
              <div className="bg-white border p-4 rounded">
                <iframe
                  title="preview"
                  className="w-full h-[800px] rounded border bg-white"
                  srcDoc={previewHtml}
                />
              </div>
            )}

            {activeStep === 4 && (
              <div className="flex gap-4">
                {/* <Button onClick={handlePrint}>
                  <PrinterIcon className="w-4 mr-1 inline" />
                  Print / Download
                </Button> */}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6 border-t">
              {activeStep > 1 && (
                <Button type="button" variant="gray" onClick={prevStep}>
                  Back
                </Button>
              )}

              <Button type="button" variant="gray" onClick={formik.handleReset}>
                <ArrowPathIcon className="w-4 mr-1 inline" />
                Reset
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
                  Save
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FitnessCertificate;
