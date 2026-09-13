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
  useGetComboQuery,
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
  { key: "op_general_physique", label: "(i) General Physique" },
  { key: "op_vision", label: "(ii) Vision" },
  { key: "op_hearing", label: "(iii) Hearing" },
  { key: "op_breathing", label: "(iv) Breathing" },
  { key: "op_upper_limbs", label: "(v) Upper Limbs" },
  { key: "op_lower_limbs", label: "(vi) Lower Limbs" },
  { key: "op_spine", label: "(vii) Spine" },
  { key: "op_general_mental_alertness", label: "(viii) General (Mental Alertness and Stability)" },
];

const toTextField = (value) => {
  if (value === true) return "Yes";
  if (value === false || value === null || value === undefined) return "";
  return String(value);
};

const validateOptionalNumber = (value, min, max, label) => {
  if (!value?.toString().trim()) return null;
  const num = Number(value);
  if (Number.isNaN(num) || num < min || num > max) {
    return `${label} must be between ${min} and ${max}`;
  }
  return null;
};

const initialValues = {
  project_name: "",
  certificate_number: "",
  doctor_id: 0,
  doctor_name: "",
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
  op_general_physique: "",
  op_vision: "",
  op_hearing: "",
  op_breathing: "",
  op_upper_limbs: "",
  op_lower_limbs: "",
  op_spine: "",
  op_general_mental_alertness: "",
  op_other_examination: "",
  fh_skin_diseases: "",
  fh_personal_hygiene: "",
  fh_chest_xray: "",
  welder_respiratory_diseases: "",
  welder_chest_xray: "",
};

const YesNoSelect = ({ label, value, onChange }) => (
  <Select label={label} value={value} onChange={onChange}>
    <option value="">Select</option>
    <option value="yes">Yes</option>
    <option value="no">No</option>
  </Select>
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
  const { data: doctors = [] } = useGetComboQuery("doctor");

  const orgProfile = organisationData?.data?.[0] || {};

  const resolveDoctorName = (doctorId, fallbackName = "") => {
    if (!doctorId) return fallbackName || "";
    const doctor = doctors.find((d) => Number(d.id) === Number(doctorId));
    return doctor?.name || doctor?.doctor_name || fallbackName || "";
  };

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const doctorName = resolveDoctorName(values.doctor_id, values.doctor_name);
        const payload = {
          ...values,
          project_name: values.project_name || orgProfile.display_name || "",
          doctor_id: values.doctor_id ? Number(values.doctor_id) : null,
          doctor_name: doctorName,
          height: values.height?.toString() || "",
          weight: values.weight?.toString() || "",
          pulse: values.pulse?.toString() || "",
          certificate_age: values.certificate_age?.toString() || "",
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
      doctor_id: editData.doctor_id || "",
      doctor_name: editData.doctor_name || "",
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
      op_general_physique: toTextField(editData.op_general_physique),
      op_vision: toTextField(editData.op_vision),
      op_hearing: toTextField(editData.op_hearing),
      op_breathing: toTextField(editData.op_breathing),
      op_upper_limbs: toTextField(editData.op_upper_limbs),
      op_lower_limbs: toTextField(editData.op_lower_limbs),
      op_spine: toTextField(editData.op_spine),
      op_general_mental_alertness: toTextField(editData.op_general_mental_alertness),
      op_other_examination: editData.op_other_examination || "",
      fh_skin_diseases: toTextField(editData.fh_skin_diseases),
      fh_personal_hygiene: toTextField(editData.fh_personal_hygiene),
      fh_chest_xray: editData.fh_chest_xray || "",
      welder_respiratory_diseases: toTextField(editData.welder_respiratory_diseases),
      welder_chest_xray: editData.welder_chest_xray || "",
    });
  }, [editData, orgProfile.display_name]);

  const certificatePreviewData = {
    ...formik.values,
    doctor_id:Number(formik.values.doctor_id),
    project_name: formik.values.project_name || orgProfile.display_name || "",
    certificate_number: formik.values.certificate_number || "PREVIEW",
    doctor_name: resolveDoctorName(formik.values.doctor_id, formik.values.doctor_name),
    height: formik.values.height?.toString() || "",
    weight: formik.values.weight?.toString() || "",
    pulse: formik.values.pulse?.toString() || "",
    certificate_age: formik.values.certificate_age?.toString() || "",
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
        ["certificate_age", "Certificate age"],
        ["doctor_id", "Medical Inspector / Doctor"],
      ];
      const missing = required.find(([field]) => !formik.values[field]?.toString()?.trim());
      if (missing) return `${missing[1]} is required`;
    }

    if (step === 2) {
      const physicalErrors = [
        validateOptionalNumber(formik.values.height, 30, 250, "Height (cm)"),
        validateOptionalNumber(formik.values.weight, 2, 300, "Weight (kg)"),
        validateOptionalNumber(formik.values.pulse, 30, 220, "Pulse (bpm)"),
      ].filter(Boolean);
      if (physicalErrors.length) return physicalErrors[0];

      const bp = formik.values.blood_pressure?.trim();
      if (bp && !/^\d{2,3}\/\d{2,3}$/.test(bp)) {
        return "Blood Pressure must be in format 120/80 (mmHg)";
      }
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
                  <Select label="Medical Inspector / Doctor" required {...formik.getFieldProps("doctor_id")}>
                    <option value="">Select Doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name || doctor.doctor_name}
                      </option>
                    ))}
                  </Select>
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
                  <Input type="date" label="Date of Birth" {...formik.getFieldProps("date_of_birth")} />
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
                  <Input
                    label="Height (cm)"
                    type="number"
                    min={30}
                    max={250}
                    {...formik.getFieldProps("height")}
                  />
                  <Input
                    label="Weight (kg)"
                    type="number"
                    min={2}
                    max={300}
                    {...formik.getFieldProps("weight")}
                  />
                  <Input
                    label="Blood Pressure (mmHg)"
                    placeholder="120/80"
                    {...formik.getFieldProps("blood_pressure")}
                  />
                  <Input
                    label="Pulse (bpm)"
                    type="number"
                    min={30}
                    max={220}
                    {...formik.getFieldProps("pulse")}
                  />
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
                    <Input key={key} label={label} {...formik.getFieldProps(key)} />
                  ))}
                </div>
                <Input
                  label="(c) Any other tests / Other Examination"
                  {...formik.getFieldProps("op_other_examination")}
                />
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
                  <Input
                    label="Skin diseases"
                    {...formik.getFieldProps("fh_skin_diseases")}
                  />
                  <Input
                    label="Personal hygiene (hair, nails, etc.)"
                    {...formik.getFieldProps("fh_personal_hygiene")}
                  />
                  <Input label="Chest X-ray" {...formik.getFieldProps("fh_chest_xray")} />
                </div>

                <div className="space-y-4 p-5 rounded-xl border border-sky-100 bg-sky-50/40">
                  <h4 className="text-gray-800 font-semibold text-base">Welders</h4>
                  <p className="text-sm text-gray-600">
                    Examine and check for symptoms of respiratory diseases and Chest X-ray.
                  </p>
                  <Input
                    label="Respiratory diseases"
                    {...formik.getFieldProps("welder_respiratory_diseases")}
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
                    <PreviewItem
                      label="Medical Inspector / Doctor"
                      value={resolveDoctorName(formik.values.doctor_id, formik.values.doctor_name)}
                    />
                    <PreviewItem label="Date of Birth" value={formik.values.date_of_birth} />
                    <PreviewItem label="Certificate Age" value={formik.values.certificate_age} />
                    <p className="md:col-span-2">
                      <b>Residence Address:</b> {formik.values.residence_address || "-"}
                    </p>
                    <PreviewItem label="Refusal of certificate" value={formik.values.reason_refusal} />
                    <PreviewItem label="Certificate being revoked" value={formik.values.reason_revoked} />
                  </PreviewSection>

                  <PreviewSection title="Physical Examination">
                    <PreviewItem label="Height (cm)" value={formik.values.height} />
                    <PreviewItem label="Weight (kg)" value={formik.values.weight} />
                    <PreviewItem label="Blood Pressure (mmHg)" value={formik.values.blood_pressure} />
                    <PreviewItem label="Pulse (bpm)" value={formik.values.pulse} />
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
                      <PreviewItem key={key} label={label} value={formik.values[key]} />
                    ))}
                    <PreviewItem
                      label="(c) Any other tests / Other Examination"
                      value={formik.values.op_other_examination}
                    />
                  </PreviewSection>

                  <PreviewSection title="Food Handlers">
                    <PreviewItem label="Skin diseases" value={formik.values.fh_skin_diseases} />
                    <PreviewItem
                      label="Personal hygiene (hair, nails, etc.)"
                      value={formik.values.fh_personal_hygiene}
                    />
                    <PreviewItem label="Chest X-ray" value={formik.values.fh_chest_xray} />
                  </PreviewSection>

                  <PreviewSection title="Welders">
                    <PreviewItem
                      label="Respiratory diseases"
                      value={formik.values.welder_respiratory_diseases}
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
