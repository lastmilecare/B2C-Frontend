import React, { useState, useEffect, useRef } from "react";
import { useFormik } from "formik";
import {
  ArrowPathIcon,
  UserIcon,
  ClipboardDocumentIcon,
  CreditCardIcon,
  DocumentCheckIcon,
  BeakerIcon,
} from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/24/solid";
import useDebounce from "../hooks/useDebounce";
import {
  useCreateLabMutation,
  useUpdateLabMutation, useGetLabByIdQuery, useUploadLabFileMutation
} from "../redux/apiSlice";
import { skipToken } from "@reduxjs/toolkit/query";
import { healthAlerts } from "../utils/healthSwal";
import { Input, Select, Button, baseInput } from "../components/FormControls";
import { useNavigate, useParams } from "react-router-dom";
import PatientSelector from "../components/common/PatientSelector";

const LaboratoryInvestigation = () => {
  const [activeStep, setActiveStep] = useState(1);
  const navigate = useNavigate();

  const [bloodTestList, setBloodTestList] = useState([]);
  const { id } = useParams();
  const [uploadLabFile] = useUploadLabFileMutation();
  const [createLab] = useCreateLabMutation();
  const [updateLab] = useUpdateLabMutation();
  const { data: editData } = useGetLabByIdQuery(id, {
    skip: !id,
  });







  const formik = useFormik({
    initialValues: {
      EmployeeId: "",
      patient_id: "",
      Name: "",
      Gender: "",
      Age: "",
      testName: "",
      result: "",
      minRange: "",
      maxRange: "",
      remarks: "",

      reportFile: null,
    },
    onSubmit: async (values) => {
      let filePath = "";

      try {

        if (values.reportFile) {
         
          const formData = new FormData();
          formData.append("file", values.reportFile);
          
          const res = await uploadLabFile(formData).unwrap();
          filePath = res.path; 
        }


        const payload = {
          patient_id: values.patient_id,
          name: values.Name,
          gender: values.Gender,
          age: Number(values.Age),
          employee_id: values.EmployeeId,
          investigation_date: new Date(),
          remarks: values.remarks || "",

          tests: bloodTestList.map((t) => ({
            test_name: t.name,
            result_value: t.result,
            normal_range: `${t.min}-${t.max}`,
            remarks: t.remarks,
            report_url: filePath, 
          })),
        };


        if (id) {
          await updateLab({ id, body: payload }).unwrap();
        } else {
          await createLab(payload).unwrap();
        }

        healthAlerts.success("Saved successfully");
        navigate("/laboratory-investigation", {
          state: { goToList: true }
        });
      } catch (err) {
        healthAlerts.error("Save failed");
      }



    },
  });
  useEffect(() => {
    if (!editData) return;

    formik.setValues({
      EmployeeId: editData.employee_id || "",
      patient_id: editData.patient_id || "",
      Name: editData.name || "",
      Gender: editData.gender || "",
      Age: editData.age || "",

      testName: "",
      result: "",
      minRange: "",
      maxRange: "",
      remarks: "",
    });

    setBloodTestList(
      (editData.tests || []).map((t) => ({
        name: t.test_name,
        result: t.result_value,
        min: t.normal_range?.split("-")[0],
        max: t.normal_range?.split("-")[1],
        remarks: t.remarks,
      }))
    );

    setActiveStep(1);
  }, [editData]);
  const nextStep = () => {
    if (activeStep === 1 && !formik.values.Name) {
    healthAlerts.warning("Name is required");
    return;
  }

    if (activeStep === 2 && bloodTestList.length === 0) {
      healthAlerts.warning("Add at least one blood test");
      return;
    }

    setActiveStep((prev) => prev + 1);
  };

  const prevStep = () => setActiveStep((prev) => prev - 1);

  const handleAddTest = () => {
    const { testName, result, minRange, maxRange, remarks } = formik.values;

    if (!testName || !result) {
      healthAlerts.warning("Test Name & Result required");
      return;
    }

    const newTest = {
      name: testName,
      result,
      min: minRange,
      max: maxRange,
      remarks,
    };

    setBloodTestList((prev) => [...prev, newTest]);

    formik.setFieldValue("testName", "");
    formik.setFieldValue("result", "");
    formik.setFieldValue("minRange", "");
    formik.setFieldValue("maxRange", "");
    formik.setFieldValue("remarks", "");
  };
  const handleDeleteTest = (index) => {
    setBloodTestList((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 py-10">
      <div className="max-w-[1400px] mx-auto px-8">


        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <span className="bg-blue-100 p-2 rounded-xl">
              <BeakerIcon className="w-6 text-blue-600" />
            </span>
            Laboratory Investigation
          </h1>

          <div className="flex gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 w-12 rounded-full ${activeStep >= s ? "bg-sky-600" : "bg-blue-100"
                  }`}
              />
            ))}
          </div>
        </div>


        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">


          <div className="flex border-b">
            {[
              { id: 1, label: "Patient", icon: UserIcon },

              { id: 2, label: "Blood Test", icon: BeakerIcon },
              { id: 3, label: "Report", icon: CreditCardIcon },
              { id: 4, label: "Confirm", icon: DocumentCheckIcon },
            ].map((step) => (
              <button
                key={step.id}
                disabled
                className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-semibold
                ${activeStep === step.id
                    ? "bg-white text-sky-600 shadow"
                    : "text-gray-400"
                  }`}
              >
                <step.icon className="w-4 h-4" />
                {step.label}
              </button>
            ))}
          </div>


          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (activeStep === 4) {
                formik.handleSubmit();
              }
            }}
            className="space-y-8 p-9"
          >


            {activeStep === 1 && (
              <section>
                <PatientSelector formik={formik} />

              </section>
            )}



            {activeStep === 2 && (
              <section>
                <h3 className="text-lg font-semibold text-sky-700 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span>
                  Blood Test
                </h3>

                <div className="grid md:grid-cols-3 gap-8">

                  <Select
                    label="Select Test"
                    value={formik.values.testName}
                    onChange={(e) =>
                      formik.setFieldValue("testName", e.target.value)
                    }
                  >
                    <option value="">Select Test</option>
                    <option>Hemoglobin</option>
                    <option>CBC</option>
                    <option>Blood Sugar</option>
                    <option>Urine Analysis</option>
                    <option>Lipid Profile</option>
                    <option>LFT</option>
                    <option>KFT</option>
                  </Select>

                  <Input label="Result" {...formik.getFieldProps("result")} />
                  <Input label="Min Range" {...formik.getFieldProps("minRange")} />
                  <Input label="Max Range" {...formik.getFieldProps("maxRange")} />
                  <Input label="Remarks" {...formik.getFieldProps("remarks")} />
                </div>


                <div className="mt-3">
                  <button
                    type="button"
                    onClick={handleAddTest}
                    className="h-9 w-9 flex items-center justify-center rounded-full
                    bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </button>
                </div>


                {bloodTestList.length > 0 && (
                  <div className="mt-6 bg-white rounded-xl shadow-sm border border-sky-100">
                    <div className="px-4 py-3 border-b border-sky-100">
                      <h2 className="text-sky-700 font-semibold text-sm">
                        Added Tests
                      </h2>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-sky-50 text-sky-700">
                          <tr>
                            <th className="px-4 py-3 text-left">Test</th>
                            <th className="px-4 py-3 text-left">Result</th>
                            <th className="px-4 py-3 text-left">Range</th>
                            <th className="px-4 py-3 text-left">Remarks</th>
                            <th className="px-4 py-3 text-left">Action</th>
                          </tr>
                        </thead>

                        <tbody>
                          {bloodTestList.map((t, i) => (
                            <tr key={i} className="border-t">
                              <td className="px-4 py-3">{t.name}</td>
                              <td className="px-4 py-3">{t.result}</td>
                              <td className="px-4 py-3">
                                {t.min} - {t.max}
                              </td>
                              <td className="px-4 py-3">{t.remarks}</td>

                              <td className="px-4 py-3">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTest(i)}
                                  className="text-red-400 hover:text-red-600 font-semibold"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </section>
            )}


            {activeStep === 3 && (
              <section>
                <h3 className="text-lg font-semibold text-sky-700 mb-3">
                  Upload Report
                </h3>

                <input
                  type="file"
                  onChange={(e) =>
                    formik.setFieldValue("reportFile", e.target.files[0])
                  }
                />
              </section>
            )}


            {activeStep === 4 && (
              <section>
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 space-y-4">
                  <h3 className="text-lg font-semibold text-sky-600">
                   LABORATORY INVESTIGATION PREVIEW
                  </h3>

                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <p><b>Name:</b> {formik.values.Name}</p>
                    <p><b>Gender:</b> {formik.values.Gender}</p>
                    <p><b>Age:</b> {formik.values.Age}</p>
                    <p><b>patient_id:</b> {formik.values.patient_id}</p>
                  </div>

                  <div className="border-t pt-3 text-sm">
                    <p><b>testName:</b> {formik.values.testName}</p>
                    <p><b>Result:</b> {formik.values.result}</p>
                  </div>


                </div>
              </section>
            )}


            <div className="flex justify-between items-center pt-6 border-t">

              <div className="flex gap-2">
                {activeStep > 1 && (
                  <Button type="button" variant="gray" onClick={prevStep}>
                    Back
                  </Button>
                )}

                <Button type="button" variant="gray" onClick={formik.handleReset}>
                  <ArrowPathIcon className="w-5 inline mr-1" />
                  Reset
                </Button>
              </div>

              {activeStep < 4 ? (
                <Button type="button" variant="sky" onClick={nextStep}>
                  Continue
                </Button>
              ) : (
                <Button type="submit" variant="sky">
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

export default LaboratoryInvestigation;