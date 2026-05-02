import React, { useState, useCallback, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  DocumentCheckIcon,
  EyeIcon,
  IdentificationIcon,
  UserIcon
} from "@heroicons/react/24/outline";
import { Input, Select, Button } from "../components/FormControls";
import { healthAlerts } from "../utils/healthSwal";
import { useNavigate } from "react-router-dom";
import PatientSelector from "../components/common/PatientSelector";
import {
  useCreateClinicalExamMutation,
  useUpdateClinicalExamMutation,
  useGetClinicalExamByIdQuery
} from "../redux/apiSlice";
import { useLocation } from "react-router-dom";
import { useParams } from "react-router-dom";

const ClinicalExamination = () => {
  const [activeStep, setActiveStep] = useState(1);
  const navigate = useNavigate();
 const { id } = useParams();
const { data: editData, isLoading } = useGetClinicalExamByIdQuery(id, {
  skip: !id,
});
const [createClinicalExam] = useCreateClinicalExamMutation();
const [updateClinicalExam] = useUpdateClinicalExamMutation();
  const formik = useFormik({
    initialValues: {
      generalAppearance: "",
      vision: "",
      colorBlindness: "",
      ear: "",
      nose: "",
      throat: "",
      cardiovascular: "",
      respiratory: "",
      abdomen: "",
      nervousSystem: "",
      musculoskeletal: "",
      skin: "",
      EmployeeId: "",
      patient_id: "",
      Name: "",
      Gender: "",
      Age: "",
    },

   validationSchema: Yup.object({
  patient_id: Yup.string().required("Patient is required"),

  generalAppearance: Yup.string().required("General Appearance required"),

  vision: Yup.string().required("Vision required"),

  colorBlindness: Yup.string().required("Color blindness required"),

  ear: Yup.string().required("Ear required"),

  nose: Yup.string().required("Nose required"),

  throat: Yup.string().required("Throat required"),

  cardiovascular: Yup.string().required("Cardio required"),

  respiratory: Yup.string().required("Respiratory required"),

  abdomen: Yup.string().required("Abdomen required"),

  nervousSystem: Yup.string().required("Nervous system required"),

  musculoskeletal: Yup.string().required("Musculoskeletal required"),

  skin: Yup.string().required("Skin condition required"),
}),

    onSubmit: async (values) => {
  try {
    const payload = {
      patient_id: values.patient_id,
      employee_id: values.EmployeeId,
      name: values.Name,
      gender: values.Gender,
      age: Number(values.Age),

      general_appearance: values.generalAppearance,
      eye_examination: values.vision,
      ear: values.ear,
      nose: values.nose,
      throat: values.throat,
      cardiovascular_system: values.cardiovascular,
      respiratory_system: values.respiratory,
      abdomen: values.abdomen,
      nervous_system: values.nervousSystem,
      musculoskeletal_system: values.musculoskeletal,
      skin_condition: values.skin,
      color_blindness: values.colorBlindness,
    };

    if (id) {
      await updateClinicalExam({
        id,
        body: payload,
      }).unwrap();

      healthAlerts.success("Updated Successfully");
    } else {
      await createClinicalExam(payload).unwrap();
      healthAlerts.success("Saved Successfully");
    }

    navigate("/clinical-examination", { state: { goToList: true } });

  } catch (err) {
    healthAlerts.error(err?.data?.message || "Error");
  }
}

    
  });
 useEffect(() => {
  if (!editData || !editData.length) return;

  const data = editData[0]; // 👈 fix

  formik.setValues({
    generalAppearance: data.general_appearance || "",
    vision: data.eye_examination || "",
    ear: data.ear || "",
    nose: data.nose || "",
    throat: data.throat || "",
    cardiovascular: data.cardiovascular_system || "",
    respiratory: data.respiratory_system || "",
    abdomen: data.abdomen || "",
    nervousSystem: data.nervous_system || "",
    musculoskeletal: data.musculoskeletal_system || "",
    skin: data.skin_condition || "",

    EmployeeId: data.employee_id || "",
    patient_id: data.patient_id || "",
    Name: data.name || "",
    Gender: data.gender || "",
    Age: data.age || "",
    colorBlindness: data.color_blindness || "",
  });
}, [editData]);

  const nextStep = useCallback(async () => {
  const errors = await formik.validateForm();

  
  if (activeStep === 1 && !formik.values.Name) {
    healthAlerts.warning("Name is required");
    return;
  }

 
  if (
    activeStep === 2 &&
    (
      errors.generalAppearance ||
      errors.vision ||
      errors.colorBlindness ||
      errors.ear ||
      errors.nose ||
      errors.throat
    )
  ) {
    formik.setTouched({
      generalAppearance: true,
      vision: true,
      colorBlindness: true,
      ear: true,
      nose: true,
      throat: true,
    });

    const firstError = Object.values(errors)[0];
    healthAlerts.warning(firstError);
    return;
  }

 
  if (
    activeStep === 3 &&
    (
      errors.cardiovascular ||
      errors.respiratory ||
      errors.abdomen ||
      errors.nervousSystem ||
      errors.musculoskeletal ||
      errors.skin
    )
  ) {
    formik.setTouched({
      cardiovascular: true,
      respiratory: true,
      abdomen: true,
      nervousSystem: true,
      musculoskeletal: true,
      skin: true,
    });

    const firstError = Object.values(errors)[0];
    healthAlerts.warning(firstError);
    return;
  }

  setActiveStep((prev) => prev + 1);
}, [activeStep, formik]);

  const prevStep = useCallback(() => {
    setActiveStep((prev) => prev - 1);
  }, []);

  const handleReset = useCallback(() => {
  formik.resetForm();
  setActiveStep(1);
}, [formik]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 py-10">
      <div className="max-w-6xl mx-auto">

       
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <span className="bg-blue-100 p-2 rounded-xl">
              <ClipboardDocumentCheckIcon className="w-6 text-blue-600" />
            </span>
            Clinical Examination
          </h1>

          <div className="flex gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`h-2 w-12 rounded-full ${activeStep >= s ? "bg-sky-600" : "bg-gray-200"}`} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border overflow-hidden">

         
          <div className="flex border-b mb-6">
            {[
              { id: 1, label: "Patient", icon: UserIcon },
              { id: 2, label: "Basic", icon: ClipboardDocumentCheckIcon },
              { id: 3, label: "Systems", icon: EyeIcon },
              { id: 4, label: "Confirm", icon: DocumentCheckIcon },
            ].map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStep(step.id)}
                className={`flex-1 py-4 flex items-center justify-center gap-2 ${
                  activeStep === step.id ? "bg-white text-sky-600 shadow" : "text-gray-400"
                }`}
              >
                <step.icon className="w-4 h-4" />
                {step.label}
              </button>
            ))}
          </div>

          <div className="p-10">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
             {activeStep === 1 && (
          <section>
              <PatientSelector formik={formik} />
                      
                      </section>
                    )}
              
              {activeStep === 2 && (
                <section className="space-y-6">

                 
                  <div>
                    <h3 className="text-sky-700 font-semibold mb-2">General Appearance</h3>
                    <Input
                      label="General Appearance *"
                      {...formik.getFieldProps("generalAppearance")}
                      error={formik.touched.generalAppearance && formik.errors.generalAppearance}
                    />
                  </div>

                  
                  <div>
                    <h3 className="text-sky-700 font-semibold mb-2">Eye Examination *</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      <Input label="Vision *" {...formik.getFieldProps("vision")} />
                      <Select label="Color Blindness *" {...formik.getFieldProps("colorBlindness")}>
                        <option value="">Select</option>
                        <option>No</option>
                        <option>Yes</option>
                      </Select>
                    </div>
                  </div>

                 
                  <div>
                    <h3 className="text-sky-700 font-semibold mb-2">ENT *</h3>
                    <div className="grid md:grid-cols-3 gap-3">
                      <Input label="Ear *" {...formik.getFieldProps("ear")} />
                      <Input label="Nose *" {...formik.getFieldProps("nose")} />
                      <Input label="Throat *" {...formik.getFieldProps("throat")} />
                    </div>
                  </div>

                </section>
              )}

              
              {activeStep === 3 && (
                <section>
                  <h3 className="text-sky-700 font-semibold mb-4">System Examination</h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Input label="Cardiovascular System *" {...formik.getFieldProps("cardiovascular")} />
                    <Input label="Respiratory System *" {...formik.getFieldProps("respiratory")} />
                    <Input label="Abdomen *" {...formik.getFieldProps("abdomen")} />
                    <Input label="Nervous System *" {...formik.getFieldProps("nervousSystem")} />
                    <Input label="Musculoskeletal System *" {...formik.getFieldProps("musculoskeletal")} />
                    <Input label="Skin Condition *" {...formik.getFieldProps("skin")} />
                  </div>
                </section>
              )}

              
                {activeStep === 4 && (
                <section>
                  <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 space-y-4">
                    <h3 className="text-lg font-semibold text-sky-600">
                       CLINICAL EXAMINATION PREVIEW
                    </h3>

                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <p><b>Name:</b> {formik.values.Name}</p>
                      <p><b>Gender:</b> {formik.values.Gender}</p>
                      <p><b>Age:</b> {formik.values.Age}</p>
                      <p><b>patient_id:</b> {formik.values.patient_id}</p>
                    </div>

                    <div className="border-t pt-3 text-sm">
                      <p><b>Vision:</b> {formik.values.vision}</p>
                      <p><b>Color Blindness:</b> {formik.values.colorBlindness}</p>
                    </div>


                    <div className="border-t pt-3 text-sm">
                      <p><b>Ear </b> {formik.values.ear}</p>
                      <p><b>Nose</b> {formik.values.nose}</p>
                      <p><b>Throat</b> {formik.values.throat}</p>
                    </div>


                    <div className="border-t pt-3 text-sm">
                      <p>
                        <b>Cardiovascular System:</b>{formik.values.cardiovascular}
                        <b>Nervous System:</b>{formik.values.nervousSystem}

                      </p>
                    </div>


                    <div className="border-t pt-3 text-sm">
                      <p><b>Respiratory System:</b> {formik.values.respiratory}</p>
                       <p><b>Musculoskeletal System:</b> {formik.values.musculoskeletal}</p>
                    </div>

                    <div className="border-t pt-3 text-sm">
                      <p><b>Abdomen:</b> {formik.values.abdomen}</p>
                      <p><b>Skin Condition:</b> {formik.values.skin}</p>
                    </div>

                  </div>
                </section>
              )}


              
              <div className="flex justify-between pt-6 border-t">

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

                {activeStep < 4 ? (
                  <Button type="button" variant="sky" onClick={nextStep}>
                    Continue
                  </Button>
                ) : (
                  <Button type="button" variant="sky" onClick={formik.handleSubmit}>
                    <CheckCircleIcon className="w-5 h-5 inline mr-1" />
                    Save
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

export default ClinicalExamination;