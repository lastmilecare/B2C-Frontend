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
  useGetFitnessByIdQuery
} from "../redux/apiSlice";
import { skipToken } from "@reduxjs/toolkit/query";
import { healthAlerts } from "../utils/healthSwal";
import { Input, Select, Button } from "../components/FormControls";
import { useNavigate } from "react-router-dom";
import PatientSelector from "../components/common/PatientSelector";
import { useParams } from "react-router-dom";
const FitnessCertificate = () => {
  const [activeStep, setActiveStep] = useState(1);

  const navigate = useNavigate();
  const printRef = useRef();
  const { id } = useParams();
  const [createFitness] = useCreateFitnessMutation();
  const [updateFitness] = useUpdateFitnessMutation();

  const { data: editData } = useGetFitnessByIdQuery(id, {
    skip: !id,
  });

 
  const formik = useFormik({
    initialValues: {
      EmployeeId: "",
      patient_id: "",
      Name: "",
      Gender: "",
      Age: "",
      certNo: "",
      issueDate: "",
      validity: "",
      fitnessStatus: "",
      doctor: "",
      restrictions: "",
      recommendations: "",
    },

    onSubmit: async (values) => {
       
      try {
        const payload = {
          patient_id: values.patient_id,
          name: values.Name,
          gender: values.Gender,
          age: Number(values.Age),
          employee_id: values.EmployeeId,
          fitness_status: values.fitnessStatus,
          restrictions: values.restrictions,
          recommendations: values.recommendations,
          doctor_signature: values.doctor,
          valid_till: values.validity ? new Date(values.validity) : null ,
          issue_date: values.issueDate,
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
    }
  });
  useEffect(() => {
    if (editData) {
      formik.setValues({
        EmployeeId: editData.employee_id || "",
        patient_id: editData.patient_id || "",
        Name: editData.name || "",
        Gender: editData.gender || "",
        Age: editData.age || "",
        certNo: editData.certificate_number || "",
        issueDate: editData.issue_date?.split("T")[0] || "",
        validity: editData.valid_till?.split("T")[0] || "",
        fitnessStatus: editData.fitness_status || "",
        doctor: editData.doctor_signature || "",
        restrictions: editData.restrictions || "",
        recommendations: editData.recommendations || "",
      });
    }
  }, [editData]);

 const nextStep = () => {


  if (activeStep === 1 && !formik.values.Name) {
    healthAlerts.warning("Name is required");
    return;
  }

 
  if (activeStep === 2) {
    if (!formik.values.issueDate) {
      healthAlerts.warning("Issue Date required");
      return;
    }

    if (!formik.values.validity) {
      healthAlerts.warning("Validity required");
      return;
    }

    if (!formik.values.fitnessStatus) {
      healthAlerts.warning("Fitness Status required");
      return;
    }

    if (!formik.values.doctor) {
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
              <div key={s} className={`h-2 w-12 rounded ${activeStep >= s ? "bg-sky-600" : "bg-blue-100"
                }`} />
            ))}
          </div>
        </div>


        <div className="bg-white rounded-3xl shadow-xl border overflow-hidden">


          <div className="flex border-b">
            {["Patient", "Details", "Preview", "Download"].map((l, i) => (
              <div key={i} className={`flex-1 py-4 text-center font-semibold ${activeStep === i + 1 ? "text-sky-600" : "text-gray-400"
                }`}>
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
                 
                  <Input type="date" label="Issue Date" {...formik.getFieldProps("issueDate")} />
                  {/* <Input label="Validity" {...formik.getFieldProps("validity")} /> */}
                  <Input type="date" label="Validity" {...formik.getFieldProps("validity")} />
                  <Select
                    label="Fitness Status"
                    value={formik.values.fitnessStatus}
                    onChange={(e) => formik.setFieldValue("fitnessStatus", e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="FIT">Fit</option>
                    <option value="FIT_WITH_RESTRICTIONS">Fit with Restrictions</option>
                    <option value="UNFIT">Unfit</option>
                  </Select>

                  <Input label="Doctor Name" {...formik.getFieldProps("doctor")} />
                  <Input label="Restrictions" {...formik.getFieldProps("restrictions")} />
                  <Input label="Recommendations" {...formik.getFieldProps("recommendations")} />
                </div>
              </section>
            )}


            {activeStep === 3 && (
  <div ref={printRef} className="bg-blue-50 p-6 rounded-xl border border-blue-200 space-y-4">
    <h2 className="text-xl font-bold text-center mb-4">
      FITNESS CERTIFICATE PREVIEW
    </h2>

   
    <div className="border-b pb-2">
      <p><b>Name:</b> {formik.values.Name}</p>
      <p><b>Gender:</b> {formik.values.Gender}</p>
      <p><b>Age:</b> {formik.values.Age}</p>
      <p><b>Patient ID:</b> {formik.values.patient_id}</p>
    </div>

    
    <div className="border-b pb-2">
      
      <p><b>Issue Date:</b> {formik.values.issueDate}</p>
      <p><b>Validity:</b> {formik.values.validity}</p>
    </div>

  
    <div className="border-b pb-2">
      <p><b>Fitness Status:</b> {formik.values.fitnessStatus}</p>
      <p><b>Doctor:</b> {formik.values.doctor}</p>
    </div>

  
    <div>
      <p><b>Restrictions:</b> {formik.values.restrictions}</p>
      <p><b>Recommendations:</b> {formik.values.recommendations}</p>
    </div>
  </div>
)}


            {activeStep === 4 && (
              <div className="flex gap-4">
                <Button onClick={handlePrint}>
                  <PrinterIcon className="w-4 mr-1 inline" />
                  Print / Download
                </Button>
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
                <Button type="button" variant="sky" onClick={formik.handleSubmit}>
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