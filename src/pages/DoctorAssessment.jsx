import React, { useState, useEffect, useRef } from "react";
import { useFormik } from "formik";
import {
  ArrowPathIcon,
  UserIcon,
  ClipboardDocumentIcon,
  DocumentCheckIcon,
} from "@heroicons/react/24/outline";

import {
  useCreateDoctorAssessmentMutation,
  useUpdateDoctorAssessmentMutation,
} from "../redux/apiSlice";

import { healthAlerts } from "../utils/healthSwal";
import { Input, Select, Button } from "../components/FormControls";
import { useNavigate } from "react-router-dom";
import PatientSelector from "../components/common/PatientSelector";
import { useParams } from "react-router-dom";
import { useGetDoctorAssessmentByIdQuery } from "../redux/apiSlice";
import * as Yup from "yup";
const DoctorAssessment = () => {
  const [activeStep, setActiveStep] = useState(1);
  const navigate = useNavigate();
  const [createDoctorAssessment] = useCreateDoctorAssessmentMutation();
  const [updateDoctorAssessment] = useUpdateDoctorAssessmentMutation();
  const { id } = useParams();
  const { data: editData } = useGetDoctorAssessmentByIdQuery(id, {
    skip: !id,
  });

  const formik = useFormik({
    initialValues: {
      EmployeeId: "",
      patient_id: "",
      Name: "",
      Gender: "",
      Age: "",

      healthStatus: "",
      fitness: "",
      restrictions: "",
      recommendations: "",
      followUp: "",
      comments: "",
    },
    validationSchema: Yup.object({
      patient_id: Yup.string().required("Patient is required"),

      fitness: Yup.string().required("Fitness Category is required"),

      followUp: Yup.string().required("Follow Up Required is required"),
    }),
    onSubmit: async (values) => {
      try {
        const payload = {
          patient_id: values.patient_id,
          name: values.Name,
          gender: values.Gender,
          age: Number(values.Age) || null,
          employee_id: values.EmployeeId,

          overall_health_status: values.healthStatus,
          fitness_category: values.fitness,

          restrictions: values.restrictions,
          recommendations: values.recommendations,

          follow_up_required: values.followUp === "true",

          comments: values.comments,
        };

        

        if (id) {

          await updateDoctorAssessment({ id, body: payload }).unwrap();
          healthAlerts.success("Updated Successfully");
        } else {

          await createDoctorAssessment(payload).unwrap();
          healthAlerts.success("Saved Successfully");
        }

        navigate("/doctor-assessment", {
          state: { goToList: true }
        });

      } catch (err) {
        console.error(err);
        healthAlerts.error("Save Failed");
      }
    },
  });
  useEffect(() => {
    if (editData) {
      formik.setValues({
        EmployeeId: editData.employee_id || "",
        patient_id: editData.patient_id || "",
        Name: editData.name || "",
        Gender: editData.gender || "",
        Age: editData.age || "",

        healthStatus: editData.overall_health_status || "",
        fitness: editData.fitness_category || "",
        restrictions: editData.restrictions || "",
        recommendations: editData.recommendations || "",
        followUp: editData.follow_up_required ? "true" : "false",
        comments: editData.comments || "",
      });
    }
  }, [editData]);

  const nextStep = async () => {

    const errors = await formik.validateForm();


    if (activeStep === 1 && !formik.values.Name) {
      healthAlerts.warning("Please Fill Name");
      return;
    }


    if (
      activeStep === 2 &&
      errors.fitness
    ) {

      formik.setTouched({
        fitness: true,
      });

      healthAlerts.warning(errors.fitness);

      return;
    }


    if (
      activeStep === 3 &&
      errors.followUp
    ) {

      formik.setTouched({
        followUp: true,
      });

      healthAlerts.warning(errors.followUp);

      return;
    }

    setActiveStep((p) => p + 1);
  };

  const prevStep = () => setActiveStep((p) => p - 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 py-10">
      <div className="max-w-[1400px] mx-auto px-8">

        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-slate-800">
            Doctor Assessment
          </h1>

          <div className="flex gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`h-2 w-12 rounded-full ${activeStep >= s ? "bg-sky-600" : "bg-blue-100"
                }`} />
            ))}
          </div>
        </div>


        <div className="bg-white rounded-3xl shadow-xl border overflow-hidden">


          <div className="flex border-b">
            {[
              { id: 1, label: "Patient", icon: UserIcon },
              { id: 2, label: "Assessment", icon: ClipboardDocumentIcon },
              { id: 3, label: "Additional", icon: ClipboardDocumentIcon },
              { id: 4, label: "Confirm", icon: DocumentCheckIcon },
            ].map((step) => (
              <button
                key={step.id}
                disabled
                className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-semibold ${activeStep === step.id
                    ? "bg-white text-sky-600 shadow"
                    : "text-gray-400"
                  }`}
              >
                <step.icon className="w-4 h-4" />
                {step.label}
              </button>
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
                  Assessment
                </h3>

                <div className="grid md:grid-cols-3 gap-6">
                  <Select
                    label="Fitness Category"
                    required
                    error={
                      formik.touched.fitness &&
                      formik.errors.fitness
                    }
                    value={formik.values.fitness}
                    onChange={(e) => formik.setFieldValue("fitness", e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="FIT">Fit</option>
                    <option value="FIT_WITH_RESTRICTIONS">Fit with Restrictions</option>
                    <option value="UNFIT">Unfit</option>
                  </Select>

                  <Input label="Health Status" {...formik.getFieldProps("healthStatus")} />
                  <Input label="Restrictions" {...formik.getFieldProps("restrictions")} />
                </div>
              </section>
            )}


            {activeStep === 3 && (
              <section>
                <div className="grid md:grid-cols-2 gap-6">
                  <Input label="Recommendations" {...formik.getFieldProps("recommendations")} />

                  <Select
                    label="Follow Up Required"
                    required
                    error={
                      formik.touched.followUp &&
                      formik.errors.followUp
                    }

                    value={formik.values.followUp}
                    onChange={(e) => formik.setFieldValue("followUp", e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </Select>
                </div>

                <Input label="Comments" {...formik.getFieldProps("comments")} />
              </section>
            )}


            {activeStep === 4 && (
              <section>
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 space-y-4">
                  <h3 className="text-lg font-semibold text-sky-600">
                    DOCTOR ASSESSMENT PREVIEW
                  </h3>


                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <p><b>Name:</b> {formik.values.Name}</p>
                    <p><b>Gender:</b> {formik.values.Gender}</p>
                    <p><b>Age:</b> {formik.values.Age}</p>
                    <p><b>Patient ID:</b> {formik.values.patient_id}</p>
                  </div>


                  <div className="border-t pt-3 text-sm space-y-1">
                    <p><b>Fitness Category:</b> {formik.values.fitness}</p>
                    <p><b>Health Status:</b> {formik.values.healthStatus}</p>
                    <p><b>Restrictions:</b> {formik.values.restrictions}</p>
                  </div>


                  <div className="border-t pt-3 text-sm space-y-1">
                    <p><b>Recommendations:</b> {formik.values.recommendations}</p>
                    <p><b>Follow Up Required:</b> {formik.values.followUp === "true" ? "Yes" : "No"}</p>
                    <p><b>Comments:</b> {formik.values.comments}</p>
                  </div>
                </div>
              </section>
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
                <Button type="button" variant="sky" onClick={formik.handleSubmit}>
                  {id ? "Update" : "Save"}
                </Button>
              )}

            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorAssessment;