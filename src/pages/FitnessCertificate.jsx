import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  DocumentCheckIcon,
  HeartIcon,
  UserIcon,
  BeakerIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import {
  useCreateFitnessMutation,
  useUpdateFitnessMutation,
  useGetFitnessByIdQuery,
  useGetOrgProfilesQuery,
  usePreviewFitnessCertificatePdfMutation,
} from "../redux/apiSlice";
import { healthAlerts } from "../utils/healthSwal";
import { getApiErrorMessage, downloadBlob } from "../utils/helper";
import { Input, Select, Button } from "../components/UIComponents";
import { useNavigate, useParams } from "react-router-dom";
import { cookie } from "../utils/cookie";

const STEPS = [
  { id: 1, label: "Workman Details", icon: UserIcon },
  { id: 2, label: "Physical Exam", icon: HeartIcon },
  { id: 3, label: "Previous History", icon: ClipboardDocumentIcon },
  { id: 4, label: "Operator & Drivers", icon: EyeIcon },
  { id: 5, label: "Food & Welders", icon: BeakerIcon },
  { id: 6, label: "Preview", icon: DocumentCheckIcon },
];

const YES_NO_FIELDS = [
  { key: "prev_varicose", label: "Varicose" },
  { key: "prev_seizure", label: "Seizure" },
  { key: "prev_vertigo", label: "Vertigo" },
  { key: "prev_acrophobia", label: "Acrophobia" },
  { key: "prev_diabetes", label: "Diabetes" },
  { key: "prev_stroke", label: "Stroke" },
  { key: "prev_heart_diseases", label: "Heart Diseases" },
  { key: "prev_major_illness_surgery", label: "Major Illness or Surgery" },
];

const OPERATOR_CHECKS = [
  { key: "op_general_physique", label: "General Physique" },
  { key: "op_vision", label: "Vision" },
  { key: "op_hearing", label: "Hearing" },
  { key: "op_breathing", label: "Breathing" },
  { key: "op_upper_limbs", label: "Upper Limbs" },
  { key: "op_lower_limbs", label: "Lower Limbs" },
  { key: "op_spine", label: "Spine" },
  {
    key: "op_general_mental_alertness",
    label: "General (Mental Alertness and Stability)",
  },
];

const initialValues = {
  project_name: "",
  certificate_number: "",
  workman_name: "",
  trade: "",
  identification_mark_1: "",
  identification_mark_2: "",
  guardian_name: "",
  sex: "",
  residence_address: "",
  date_of_birth: "",
  certificate_age: "",
  reason_refusal: "",
  reason_revoked: "",
  height: "",
  weight: "",
  blood_pressure: "",
  pulse: "",
  hearing: "",
  refractive_error: "",
  color_vision: "",
  any_disability: "",
  arm_grip: "",
  leg_foot_function: "",
  prev_varicose: "",
  prev_seizure: "",
  prev_vertigo: "",
  prev_acrophobia: "",
  prev_diabetes: "",
  prev_stroke: "",
  prev_heart_diseases: "",
  prev_major_illness_surgery: "",
  prev_symptoms_visible: "",
  prev_others: "",
  op_general_physique: false,
  op_vision: false,
  op_hearing: false,
  op_breathing: false,
  op_upper_limbs: false,
  op_lower_limbs: false,
  op_spine: false,
  op_general_mental_alertness: false,
  op_other_examination: "",
  fh_skin_diseases: false,
  fh_personal_hygiene: false,
  fh_chest_xray: "",
  welder_respiratory_diseases: false,
  welder_chest_xray: "",
};

const YesNoSelect = ({ label, value, onChange }) => (
  <Select label={label} value={value} onChange={onChange}>
    <option value="">Select</option>
    <option value="yes">Yes</option>
    <option value="no">No</option>
  </Select>
);

const CheckboxField = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 text-sm text-gray-700">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
    />
    {label}
  </label>
);

const PreviewSection = ({ title, children }) => (
  <div>
    <h4 className="font-semibold text-slate-700 mb-3 border-b pb-2">{title}</h4>
    <div className="grid md:grid-cols-2 gap-3 text-sm">{children}</div>
  </div>
);

const PreviewItem = ({ label, value }) => (
  <p>
    <b>{label}:</b> {value || "-"}
  </p>
);

const PreviewChecked = ({ label, checked }) => (
  <p>
    <b>{label}:</b> {checked ? "Yes" : "No"}
  </p>
);

const FitnessCertificate = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const tenant_id = cookie.get("tenantId");
  const center_id = cookie.get("center_id");

  const [createFitness] = useCreateFitnessMutation();
  const [updateFitness] = useUpdateFitnessMutation();
  const [previewPdf] = usePreviewFitnessCertificatePdfMutation();
  const { data: editData } = useGetFitnessByIdQuery(id, { skip: !id });
  const { data: organisationData } = useGetOrgProfilesQuery({
    page: 1,
    limit: 10,
    tenant_id,
    center_id,
  });

  const orgProfile = organisationData?.data?.[0] || {};

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const payload = {
          ...values,
          project_name: values.project_name || orgProfile.display_name || "",
        };

        if (id) {
          await updateFitness({ id, body: payload }).unwrap();
          healthAlerts.success("Certificate updated successfully", "Updated");
        } else {
          await createFitness(payload).unwrap();
          healthAlerts.success("Certificate created successfully", "Created");
        }

        navigate("/fitness-certificate", { state: { goToList: true } });
      } catch (err) {
        healthAlerts.error(getApiErrorMessage(err, "Save failed"), "Error");
      }
    },
  });

  useEffect(() => {
    if (orgProfile.display_name && !formik.values.project_name) {
      formik.setFieldValue("project_name", orgProfile.display_name);
    }
  }, [orgProfile.display_name]);

  useEffect(() => {
    if (!editData) return;

    formik.setValues({
      ...initialValues,
      project_name: editData.project_name || orgProfile.display_name || "",
      certificate_number: editData.certificate_number || "",
      workman_name: editData.workman_name || "",
      trade: editData.trade || "",
      identification_mark_1: editData.identification_mark_1 || "",
      identification_mark_2: editData.identification_mark_2 || "",
      guardian_name: editData.guardian_name || "",
      sex: editData.sex || "",
      residence_address: editData.residence_address || "",
      date_of_birth: editData.date_of_birth?.split("T")[0] || "",
      certificate_age: editData.certificate_age || "",
      reason_refusal: editData.reason_refusal || "",
      reason_revoked: editData.reason_revoked || "",
      height: editData.height || "",
      weight: editData.weight || "",
      blood_pressure: editData.blood_pressure || "",
      pulse: editData.pulse || "",
      hearing: editData.hearing || "",
      refractive_error: editData.refractive_error || "",
      color_vision: editData.color_vision || "",
      any_disability: editData.any_disability || "",
      arm_grip: editData.arm_grip || "",
      leg_foot_function: editData.leg_foot_function || "",
      prev_varicose: editData.prev_varicose || "",
      prev_seizure: editData.prev_seizure || "",
      prev_vertigo: editData.prev_vertigo || "",
      prev_acrophobia: editData.prev_acrophobia || "",
      prev_diabetes: editData.prev_diabetes || "",
      prev_stroke: editData.prev_stroke || "",
      prev_heart_diseases: editData.prev_heart_diseases || "",
      prev_major_illness_surgery: editData.prev_major_illness_surgery || "",
      prev_symptoms_visible: editData.prev_symptoms_visible || "",
      prev_others: editData.prev_others || "",
      op_general_physique: Boolean(editData.op_general_physique),
      op_vision: Boolean(editData.op_vision),
      op_hearing: Boolean(editData.op_hearing),
      op_breathing: Boolean(editData.op_breathing),
      op_upper_limbs: Boolean(editData.op_upper_limbs),
      op_lower_limbs: Boolean(editData.op_lower_limbs),
      op_spine: Boolean(editData.op_spine),
      op_general_mental_alertness: Boolean(editData.op_general_mental_alertness),
      op_other_examination: editData.op_other_examination || "",
      fh_skin_diseases: Boolean(editData.fh_skin_diseases),
      fh_personal_hygiene: Boolean(editData.fh_personal_hygiene),
      fh_chest_xray: editData.fh_chest_xray || "",
      welder_respiratory_diseases: Boolean(editData.welder_respiratory_diseases),
      welder_chest_xray: editData.welder_chest_xray || "",
    });
  }, [editData, orgProfile.display_name]);

  const certificatePreviewData = {
    ...formik.values,
    project_name: formik.values.project_name || orgProfile.display_name || "",
    certificate_number: formik.values.certificate_number || "PREVIEW",
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      const blob = await previewPdf(certificatePreviewData).unwrap();
      downloadBlob(
        blob,
        `Fitness-Certificate-${certificatePreviewData.certificate_number || "Preview"}.pdf`,
      );
    } catch (err) {
      healthAlerts.error(getApiErrorMessage(err, "PDF download failed"), "Error");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const validateStep = (step) => {
    if (step === 1) {
      const required = [
        ["workman_name", "Workman name"],
        ["trade", "Trade"],
        ["guardian_name", "Guardian name"],
        ["sex", "Sex"],
        ["residence_address", "Residence address"],
        ["date_of_birth", "Date of birth"],
        ["certificate_age", "Certificate age"],
      ];
      const missing = required.find(([field]) => !formik.values[field]?.toString()?.trim());
      if (missing) return `${missing[1]} is required`;
    }

    return null;
  };

  const nextStep = () => {
    const error = validateStep(activeStep);
    if (error) {
      healthAlerts.warning(error);
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const prevStep = () => setActiveStep((prev) => prev - 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 py-10">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span className="bg-blue-100 p-2 rounded-xl">
              <ClipboardDocumentIcon className="w-6 h-6 text-blue-600" />
            </span>
            {id ? "Edit Fitness Certificate" : "Fitness Certificate"}
          </h1>

          <div className="flex gap-2">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`h-2 w-10 rounded-full ${
                  activeStep >= step.id ? "bg-sky-600" : "bg-blue-100"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border overflow-hidden">
          <div className="flex border-b overflow-x-auto">
            {STEPS.map((step) => (
              <button
                key={step.id}
                type="button"
                disabled
                className={`flex-1 min-w-[140px] py-4 flex items-center justify-center gap-2 text-sm font-semibold ${
                  activeStep === step.id
                    ? "text-sky-600 border-b-2 border-sky-600"
                    : "text-gray-400"
                }`}
              >
                <step.icon className="w-4 h-4" />
                {step.label}
              </button>
            ))}
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="p-9 space-y-8">
            {activeStep === 1 && (
              <section className="space-y-6">
                <h3 className="text-sky-700 font-semibold text-lg">Section 1: Workman Details</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <Input label="Name of the Workman" required {...formik.getFieldProps("workman_name")} />
                  <Input label="Trade of the Workman" required {...formik.getFieldProps("trade")} />
                  <Input label="Identification Mark 1" {...formik.getFieldProps("identification_mark_1")} />
                  <Input label="Identification Mark 2" {...formik.getFieldProps("identification_mark_2")} />
                  <Input
                    label="Father's / Husband's / Wife's Name"
                    required
                    {...formik.getFieldProps("guardian_name")}
                  />
                  <Select label="Sex" required {...formik.getFieldProps("sex")}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Select>
                  <div className="md:col-span-3">
                    <label className="text-sm text-gray-600 block mb-1 font-medium">
                      Residence Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="residence_address"
                      value={formik.values.residence_address}
                      onChange={formik.handleChange}
                      rows={2}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-400"
                    />
                  </div>
                  <Input type="date" label="Date of Birth" required {...formik.getFieldProps("date_of_birth")} />
                  <Input label="Certificate Age" required {...formik.getFieldProps("certificate_age")} />
                  <div className="md:col-span-3 space-y-4 pt-2">
                    <h4 className="text-gray-700 font-semibold text-base">Reason for:</h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      <Input
                        label="Refusal of certificate"
                        {...formik.getFieldProps("reason_refusal")}
                      />
                      <Input
                        label="Certificate being revoked"
                        {...formik.getFieldProps("reason_revoked")}
                      />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeStep === 2 && (
              <section className="space-y-6">
                <h3 className="text-sky-700 font-semibold text-lg">Section 2: Physical Examination</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <Input label="Height" {...formik.getFieldProps("height")} />
                  <Input label="Weight" {...formik.getFieldProps("weight")} />
                  <Input label="Blood Pressure" {...formik.getFieldProps("blood_pressure")} />
                  <Input label="Pulse" {...formik.getFieldProps("pulse")} />
                  <Input label="Hearing" {...formik.getFieldProps("hearing")} />
                  <Input label="Refractive Error" {...formik.getFieldProps("refractive_error")} />
                  <Input label="Color Vision" {...formik.getFieldProps("color_vision")} />
                  <Input label="Any Disability" {...formik.getFieldProps("any_disability")} />
                  <Input label="Arm Function & Grip" {...formik.getFieldProps("arm_grip")} />
                  <Input label="Leg & Foot Function" {...formik.getFieldProps("leg_foot_function")} />
                </div>
              </section>
            )}

            {activeStep === 3 && (
              <section className="space-y-6">
                <h3 className="text-sky-700 font-semibold text-lg">Section 3: Enquiry of Previous History</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {YES_NO_FIELDS.map(({ key, label }) => (
                    <YesNoSelect
                      key={key}
                      label={label}
                      value={formik.values[key]}
                      onChange={(e) => formik.setFieldValue(key, e.target.value)}
                    />
                  ))}
                  <div className="md:col-span-3">
                    <Input label="Symptoms Visible" {...formik.getFieldProps("prev_symptoms_visible")} />
                  </div>
                  <div className="md:col-span-3">
                    <Input label="Others / If any" {...formik.getFieldProps("prev_others")} />
                  </div>
                </div>
              </section>
            )}

            {activeStep === 4 && (
              <section className="space-y-6">
                <h3 className="text-sky-700 font-semibold text-lg">
                  Section 4: Additional Checks for Operator and Drivers
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {OPERATOR_CHECKS.map(({ key, label }) => (
                    <CheckboxField
                      key={key}
                      label={label}
                      checked={Boolean(formik.values[key])}
                      onChange={(e) => formik.setFieldValue(key, e.target.checked)}
                    />
                  ))}
                </div>
                <Input label="Other Examination" {...formik.getFieldProps("op_other_examination")} />
              </section>
            )}

            {activeStep === 5 && (
              <section className="space-y-8">
                <h3 className="text-sky-700 font-semibold text-lg">
                  Section 5: Additional Checks for Food Handlers & Welders
                </h3>

                <div className="space-y-4 p-5 rounded-xl border border-sky-100 bg-sky-50/40">
                  <h4 className="text-gray-800 font-semibold text-base">Food Handlers</h4>
                  <p className="text-sm text-gray-600">
                    Careful examination for skin diseases, personal hygiene (hair, nails, etc.), and Chest X-ray.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <CheckboxField
                      label="Skin diseases"
                      checked={formik.values.fh_skin_diseases}
                      onChange={(e) => formik.setFieldValue("fh_skin_diseases", e.target.checked)}
                    />
                    <CheckboxField
                      label="Personal hygiene (hair, nails, etc.)"
                      checked={formik.values.fh_personal_hygiene}
                      onChange={(e) => formik.setFieldValue("fh_personal_hygiene", e.target.checked)}
                    />
                  </div>
                  <Input label="Chest X-ray" {...formik.getFieldProps("fh_chest_xray")} />
                </div>

                <div className="space-y-4 p-5 rounded-xl border border-sky-100 bg-sky-50/40">
                  <h4 className="text-gray-800 font-semibold text-base">Welders</h4>
                  <p className="text-sm text-gray-600">
                    Examine and check for symptoms of respiratory diseases and Chest X-ray.
                  </p>
                  <CheckboxField
                    label="Respiratory diseases"
                    checked={formik.values.welder_respiratory_diseases}
                    onChange={(e) =>
                      formik.setFieldValue("welder_respiratory_diseases", e.target.checked)
                    }
                  />
                  <Input label="Chest X-ray" {...formik.getFieldProps("welder_chest_xray")} />
                </div>
              </section>
            )}

            {activeStep === 6 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h3 className="text-sky-700 font-semibold text-lg">Section 6: Preview</h3>
                  <Button
                    type="button"
                    variant="sky"
                    onClick={handleDownloadPdf}
                    disabled={downloadingPdf}
                  >
                    {downloadingPdf ? "Downloading..." : "Download PDF"}
                  </Button>
                </div>

                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 space-y-6">
                  <PreviewSection title="Workman Details">
                    <PreviewItem label="Name of the Workman" value={formik.values.workman_name} />
                    <PreviewItem label="Trade of the Workman" value={formik.values.trade} />
                    <PreviewItem label="Identification Mark 1" value={formik.values.identification_mark_1} />
                    <PreviewItem label="Identification Mark 2" value={formik.values.identification_mark_2} />
                    <PreviewItem
                      label="Father's / Husband's / Wife's Name"
                      value={formik.values.guardian_name}
                    />
                    <PreviewItem label="Sex" value={formik.values.sex} />
                    <PreviewItem label="Date of Birth" value={formik.values.date_of_birth} />
                    <PreviewItem label="Certificate Age" value={formik.values.certificate_age} />
                    <p className="md:col-span-2">
                      <b>Residence Address:</b> {formik.values.residence_address || "-"}
                    </p>
                    <PreviewItem label="Refusal of certificate" value={formik.values.reason_refusal} />
                    <PreviewItem label="Certificate being revoked" value={formik.values.reason_revoked} />
                  </PreviewSection>

                  <PreviewSection title="Physical Examination">
                    <PreviewItem label="Height" value={formik.values.height} />
                    <PreviewItem label="Weight" value={formik.values.weight} />
                    <PreviewItem label="Blood Pressure" value={formik.values.blood_pressure} />
                    <PreviewItem label="Pulse" value={formik.values.pulse} />
                    <PreviewItem label="Hearing" value={formik.values.hearing} />
                    <PreviewItem label="Refractive Error" value={formik.values.refractive_error} />
                    <PreviewItem label="Color Vision" value={formik.values.color_vision} />
                    <PreviewItem label="Any Disability" value={formik.values.any_disability} />
                    <PreviewItem label="Arm Function & Grip" value={formik.values.arm_grip} />
                    <PreviewItem label="Leg & Foot Function" value={formik.values.leg_foot_function} />
                  </PreviewSection>

                  <PreviewSection title="Enquiry of Previous History">
                    {YES_NO_FIELDS.map(({ key, label }) => (
                      <PreviewItem key={key} label={label} value={formik.values[key]} />
                    ))}
                    <PreviewItem label="Symptoms Visible" value={formik.values.prev_symptoms_visible} />
                    <PreviewItem label="Others / If any" value={formik.values.prev_others} />
                  </PreviewSection>

                  <PreviewSection title="Additional Checks for Operator and Drivers">
                    {OPERATOR_CHECKS.map(({ key, label }) => (
                      <PreviewChecked
                        key={key}
                        label={label}
                        checked={Boolean(formik.values[key])}
                      />
                    ))}
                    <p className="md:col-span-2">
                      <b>Other Examination:</b> {formik.values.op_other_examination || "-"}
                    </p>
                  </PreviewSection>

                  <PreviewSection title="Food Handlers">
                    <PreviewChecked label="Skin diseases" checked={formik.values.fh_skin_diseases} />
                    <PreviewChecked
                      label="Personal hygiene (hair, nails, etc.)"
                      checked={formik.values.fh_personal_hygiene}
                    />
                    <PreviewItem label="Chest X-ray" value={formik.values.fh_chest_xray} />
                  </PreviewSection>

                  <PreviewSection title="Welders">
                    <PreviewChecked
                      label="Respiratory diseases"
                      checked={formik.values.welder_respiratory_diseases}
                    />
                    <PreviewItem label="Chest X-ray" value={formik.values.welder_chest_xray} />
                  </PreviewSection>
                </div>
              </section>
            )}

            <div className="flex justify-between items-center pt-6 border-t flex-wrap gap-3">
              <div className="flex gap-3">
                {activeStep > 1 && (
                  <Button type="button" variant="gray" onClick={prevStep}>
                    Back
                  </Button>
                )}
                <Button type="button" variant="gray" onClick={() => formik.resetForm()}>
                  <ArrowPathIcon className="w-5 h-5 inline mr-1" />
                  Reset
                </Button>
              </div>

              <div className="flex gap-3">
                {activeStep < STEPS.length ? (
                  <Button type="button" variant="sky" onClick={nextStep}>
                    Continue
                  </Button>
                ) : (
                  <Button type="button" variant="sky" onClick={formik.handleSubmit}>
                    <CheckCircleIcon className="w-5 h-5 inline mr-1" />
                    {id ? "Update Certificate" : "Save Certificate"}
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

export default FitnessCertificate;
