import React, { useState, useEffect, useRef } from "react";
import { useFormik } from "formik";
import {
  ArrowPathIcon,
  UserIcon,
  DocumentCheckIcon,
  PrinterIcon,
} from "@heroicons/react/24/outline";
import useDebounce from "../hooks/useDebounce";
import {
  useSearchOpdBillNoQuery,
  useGetOpdBillByIdQuery,
} from "../redux/apiSlice";
import { skipToken } from "@reduxjs/toolkit/query";
import { healthAlerts } from "../utils/healthSwal";
import { Input, Select, Button } from "../components/FormControls";
import { useNavigate } from "react-router-dom";

const FitnessCertificate = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [billSearch, setBillSearch] = useState("");
  const [selectedBill, setSelectedBill] = useState("");
  const [suggestionsList, setSuggestionsList] = useState([]);
  const navigate = useNavigate();
  const printRef = useRef();

  const debouncedBill = useDebounce(billSearch, 500);

  const { data: suggestions = [] } = useSearchOpdBillNoQuery(debouncedBill, {
    skip: debouncedBill.length < 1,
  });

  const { data: patientData } = useGetOpdBillByIdQuery(
    selectedBill ? String(selectedBill) : skipToken
  );

 
  useEffect(() => {
    if (!selectedBill && billSearch.length >= 1) {
      setSuggestionsList(suggestions);
    }
  }, [suggestions, billSearch, selectedBill]);

  
  useEffect(() => {
    if (!patientData) return;

    formik.setValues({
      ...formik.values,
      billno: selectedBill,
      Name: patientData.driverDetails?.[0]?.name || "",
      UHID: patientData.PicasoNo || "",
      Age: patientData.driverDetails?.[0]?.age || "",
    });
  }, [patientData]);

  const generateCertNo = () => "CERT-" + Date.now();

  const formik = useFormik({
    initialValues: {
      billno: "",
      Name: "",
      UHID: "",
      Age: "",
      certNo: generateCertNo(),
      issueDate: "",
      validity: "",
      fitnessStatus: "",
      doctor: "",
    },
    onSubmit: (values) => {

      console.log("FINAL DATA 👉", values);

      
      healthAlerts.success("Fitness Certificate Generated", "Success");

      
      navigate("/fitness-certificate", {
        state: { goToList: true }
      });
    }
  });

  const nextStep = () => {
    if (activeStep === 1 && !formik.values.billno) {
      healthAlerts.warning("Select Bill No");
      return;
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
            {[1,2,3,4].map((s)=>(
              <div key={s} className={`h-2 w-12 rounded ${
                activeStep>=s ? "bg-sky-600":"bg-blue-100"
              }`} />
            ))}
          </div>
        </div>

       
        <div className="bg-white rounded-3xl shadow-xl border overflow-hidden">

          
          <div className="flex border-b">
            {["Patient","Details","Preview","Download"].map((l,i)=>(
              <div key={i} className={`flex-1 py-4 text-center font-semibold ${
                activeStep===i+1 ? "text-sky-600":"text-gray-400"
              }`}>
                {l}
              </div>
            ))}
          </div>

          <form className="p-9 space-y-8">

           
            {activeStep === 1 && (
              <section>
                <h3 className="text-sky-700 font-semibold mb-4">
                  Patient Details
                </h3>

                <div className="grid md:grid-cols-3 gap-6 relative">

                 
                  <div className="relative">
                    <Input
                      label="Bill No"
                      value={billSearch}
                      onChange={(e)=>{
                        const val=e.target.value.replace(/\D/g,"");
                        setBillSearch(val);
                        setSelectedBill("");
                        formik.setFieldValue("billno","");
                      }}
                    />

                    {suggestionsList.length > 0 && (
                      <ul className="absolute z-50 bg-white border rounded-lg shadow w-full mt-1 max-h-48 overflow-auto">
                        {suggestionsList.map((item)=>(
                          <li
                            key={item.ID}
                            onClick={()=>{
                              setSelectedBill(item.ID);
                              setBillSearch(item.ID);
                              formik.setFieldValue("billno",item.ID);
                              setSuggestionsList([]);
                            }}
                            className="px-4 py-2 hover:bg-sky-100 cursor-pointer"
                          >
                            {item.ID}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <Input label="Name" {...formik.getFieldProps("Name")} readOnly />
                  <Input label="UHID" {...formik.getFieldProps("UHID")} readOnly />
                  <Input label="Age" {...formik.getFieldProps("Age")} readOnly />

                </div>
              </section>
            )}

            
            {activeStep === 2 && (
              <section>
                <h3 className="text-sky-700 font-semibold mb-4">
                  Certificate Details
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <Input label="Certificate No" value={formik.values.certNo} readOnly />
                  <Input type="date" label="Issue Date" {...formik.getFieldProps("issueDate")} />
                  <Input label="Validity" {...formik.getFieldProps("validity")} />

                  <Select
                    label="Fitness Status"
                    value={formik.values.fitnessStatus}
                    onChange={(e)=>formik.setFieldValue("fitnessStatus",e.target.value)}
                  >
                    <option value="">Select</option>
                    <option>Fit</option>
                    <option>Unfit</option>
                  </Select>

                  <Input label="Doctor Name" {...formik.getFieldProps("doctor")} />
                </div>
              </section>
            )}

            
            {activeStep === 3 && (
              <div ref={printRef} className="p-6 border rounded-xl bg-white">
                <h2 className="text-xl font-bold text-center mb-4">
                  FITNESS CERTIFICATE
                </h2>

                <p><b>Certificate No:</b> {formik.values.certNo}</p>
                <p><b>Name:</b> {formik.values.Name}</p>
                <p><b>UHID:</b> {formik.values.UHID}</p>
                <p><b>Status:</b> {formik.values.fitnessStatus}</p>
                <p><b>Doctor:</b> {formik.values.doctor}</p>
              </div>
            )}

            
            {activeStep === 4 && (
              <div className="flex gap-4">
                <Button onClick={handlePrint}>
                  <PrinterIcon className="w-4 mr-1 inline"/>
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
                <ArrowPathIcon className="w-4 mr-1 inline"/>
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