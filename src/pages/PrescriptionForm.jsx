import React, { useState, useEffect, useRef } from "react";
import { Formik, useFormik } from "formik";
import * as Yup from "yup";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import DiseaseSelect from "../components/DiseaseSelect";
import useDebounce from "../hooks/useDebounce";
import {
  useSearchOpdBillNoQuery,
  useGetOpdBillByIdQuery,
  useGetMediceneListQuery,
  useSearchDiseasesQuery,
  useUpdatePrescriptionMutation,
  useGetComboQuery,
} from "../redux/apiSlice";
import { skipToken } from "@reduxjs/toolkit/query";
import { healthAlert, healthAlerts } from "../utils/healthSwal";
import PrescriptionPrint from "./PrescriptionPrint";
import { useReactToPrint } from "react-to-print";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import {
  PILL_CONSUMPTION_TIMES,
  MEDICINE_FREQUENCIES,
} from "../utils/constants";
import { useCreatePrescriptionMutation } from "../redux/apiSlice";
import { formatISO } from "date-fns";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Input, Select, Button, baseInput } from "../components/FormControls";

import { cookie } from "../utils/cookie";
const parseChiefComplaintNames = (value) => {
  if (!value || typeof value !== "string") return [];

  return value
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
};

const PrescriptionForm = () => {
  const [billSearch, setBillSearch] = useState("");
  const [medicineSearch, setMedicineSearch] = useState("");
  const debouncedUhid = useDebounce(billSearch, 500);
  const debouncedMedicine = useDebounce(medicineSearch, 500);
  const [selectedBill, setSelectedBill] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState("");
  const [suggestionsList, setSuggestionsList] = useState([]);
  const [prescriptionList, setPrescriptionList] = useState([]);
  const [medicineSuggestions, setMedicineSuggestions] = useState([]);
  const populatedUhidRef = useRef("");
  const [createPrescription, { isLoading }] = useCreatePrescriptionMutation();
  const { id } = useParams();
  const location = useLocation();
  const { data: diseaseSearchResponse } = useGetComboQuery("diseases-byname");
  const row = location.state?.row ?? null;
  const diseaseOptions = React.useMemo(
    () => diseaseSearchResponse || [],
    [diseaseSearchResponse],
  );
  const user_id = cookie.get("user_id");
  const [printRow, setPrintRow] = useState(null);
  const printRef = useRef();
  const [updatePrescription] = useUpdatePrescriptionMutation();
  const navigate = useNavigate();
  useEffect(() => {
    if (printRow && printRef.current) {
      handlePrint();

      setTimeout(() => {
        setPrintRow(null);
      }, 300);
    }
  }, [printRow]);

  const onPrintCS = (row) => {
    setPrintRow(row);
  };
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Opd",
  });

  const { data: patientData, isFetching } = useGetOpdBillByIdQuery(
    selectedBill ? String(selectedBill) : skipToken,
  );

  const { data: medicineResponse } = useGetMediceneListQuery(
    debouncedMedicine || skipToken,
    { skip: !debouncedMedicine || debouncedMedicine.length < 2 },
  );
  const medicineList = React.useMemo(
    () => medicineResponse?.data || [],
    [medicineResponse],
  );
  const { data: suggestions = [] } = useSearchOpdBillNoQuery(debouncedUhid, {
    skip: debouncedUhid.length < 1,
  });

  useEffect(() => {
    if (selectedBill) return;
    if (billSearch.length < 1) return;
    const isSame =
      suggestionsList.length === suggestions.length &&
      suggestionsList.every((x, i) => x.ID === suggestions[i].ID);

    if (!isSame) {
      setSuggestionsList(suggestions);
    }
  }, [suggestions, selectedBill, billSearch]);

  useEffect(() => {
    if (!debouncedMedicine) {
      if (medicineSuggestions.length > 0) setMedicineSuggestions([]);
      return;
    }

    if (medicineList && medicineList.length > 0) {
      const currentDataStr = JSON.stringify(medicineList);
      const existingDataStr = JSON.stringify(medicineSuggestions);

      if (currentDataStr !== existingDataStr) {
        setMedicineSuggestions(medicineList);
      }
    } else if (medicineList.length === 0 && medicineSuggestions.length > 0) {
      setMedicineSuggestions([]);
    }
  }, [medicineList, debouncedMedicine]);

  const buildPrescriptionPayload = (values, prescriptionList) => {
    const addedDate = formatISO(new Date());

    return {
      consultingId: values.consultingId,
      picasoId: values.UHID,
      billNo: values.billno ? Number(values.billno) : null,
      patientName: values.Name,
      contactNo: values.Mobile,
      age: values.Age ? Number(values.Age) : null,
      gender: values.Gender,
      patientType: values.FinCategory,
      bpSystolic: values.bpsystolic ? Number(values.bpsystolic) : null,
      bpDiastolic: values.bpdiastolic ? Number(values.bpdiastolic) : null,
      pulseRate: values.pulserate ? Number(values.pulserate) : null,
      spo2: values.spo2 ? Number(values.spo2) : null,
      temperature: values.temprature ? Number(values.temprature) : null,
      height: values.height ? Number(values.height) : null,
      weight: values.weight ? Number(values.weight) : null,
      chiefComplaints: values.ChiefComplaint?.map((c) => c.name).join(", "),
      history: values.history || "",
      physicalFindings: "", // TODO: need to figure out
      treatmentPlan: "", // TODO: need to figure out
      labs: values.labs || "",
      otherLabs: values.otherlabs || "",
      preventiveAdvice: values.advice || "",
      otherInstructions: values.otherinstrution || "",
      nextFollowup: values.followup || "",
      referrals: values.ReferTo,
      remarks: values.Remarks,
      hospitalId: values.hospitalId || 1,
      financialYearId: new Date().getFullYear(),
      addedBy: values.AddedBy,
      addedDate,
      isActive: true,
      doctor_id: patientData.ConsultantDoctorID,
      centerID: patientData.CenterID,
      driver_id: patientData.PatientID,
      modifiedDate: addedDate,
      modifiedBy: user_id,
      AdviceList: prescriptionList.map((item) => ({
        picasoId: values.UHID,
        consultingId: values.consultingId,
        itemId: item.itemId || 0,
        item: item.medicine,
        dosage: item.dosage,
        pillsConsumption: item.preferredTime,
        duration: Number(item.duration),
        remarks: item.instructions,
        typeOfMedicine: item.type,
        addedBy: values.AddedBy,
        addedDate,
        companyId: 10, // fix later
        isActive: true,
      })),
    };
  };
  const formik = useFormik({
    initialValues: {
      UHID: "",
      CenterName: "",
      diseases: [],
      Name: "",
      Mobile: "",
      Gender: "",
      Age: "",
      DOB: "",
      FinCategory: "",
      billno: "",
      Quantity: 1,
      medicine: "",
      typemedicine: "",
      dosage: "",
      duration: "",
      medicineId: "",
      ChiefComplaint: [],
      otherinstrution: "",
      labs: "",
      otherlabs: "",
      followup: "",
      advice: "",
      history: "",
      bpsystolic: "",
      bpdiastolic: "",
      pulserate: "",
      spo2: "",
      temprature: "",
      height: "",
      weight: "",
      dosageinstructions: "",
      preferredtime: "",
      consultingId: "",
      hospitalId: "",
      Remarks: "",
      ReferTo: "",
      ConsultantDoctorID: "",
      CenterID: "",
      PatientID: "",
    },
    validationSchema: Yup.object({
      UHID: Yup.string().required("UHID is required"),
      Name: Yup.string().required("Name is required"),
      Mobile: Yup.string()
        .matches(/^[0-9]{10}$/, "Must be 10 digits")
        .required("Mobile is required"),
      bpsystolic: Yup.number()
        .min(70, "Too low for systolic BP")
        .max(250, "Too high for systolic BP"),

      bpdiastolic: Yup.number()
        .min(40, "Too low for diastolic BP")
        .max(150, "Too high for diastolic BP"),

      pulserate: Yup.number()
        .min(30, "Pulse too low")
        .max(220, "Pulse too high"),

      spo2: Yup.number()
        .min(70, "Critically low SpO₂")
        .max(100, "Invalid SpO₂ value"),

      temprature: Yup.number()
        .min(35, "Hypothermia risk")
        .max(42, "Dangerously high temperature"),

      height: Yup.number().min(30, "Invalid height").max(250, "Invalid height"),

      weight: Yup.number().min(2, "Invalid weight").max(300, "Invalid weight"),
    }),
    onSubmit: async (values) => {
      if (prescriptionList.length === 0) {
        healthAlerts.warning("Please add at least one medicine");
        return;
      }

      const payload = buildPrescriptionPayload(values, prescriptionList);

      try {
        if (id) {
          await updatePrescription({ id, ...payload }).unwrap();
          healthAlerts.success("Prescription updated successfully");
          navigate(`/prescription-list`);
        } else {
          await createPrescription(payload).unwrap();
          healthAlerts.success("Prescription saved successfully");
          navigate(`/prescription-list`);
        }
      } catch (error) {
        healthAlert({
          title: "Prescription Error",
          text: error?.data?.message || "Something went wrong",
          icon: "error",
        });
      }
    },
  });

  useEffect(() => {
    if (!patientData) return;
    if (patientData.ID !== selectedBill) return;
    if (populatedUhidRef.current === selectedBill) return;
    populatedUhidRef.current = selectedBill;

    const updates = {
      UHID: patientData.PicasoNo || "",
      Name: patientData.driverDetails[0]?.name || "",
      Gender: patientData.driverDetails[0].gender || "",
      Mobile: patientData.Mobile || "",
      FinCategory: patientData.driverDetails[0]?.category || "",
      Age: patientData.driverDetails[0]?.age || "",
      consultingId: patientData.ConsultantDoctorID || "",
      hospitalId: patientData.HospitalID,
      Remarks: patientData.Remarks,
      ReferTo: patientData.ReferTo,
      AddedBy: patientData.AddedBy,
      ConsultantDoctorID: patientData.ConsultantDoctorID,
      CenterID: patientData.CenterID,
      PatientID: patientData.PatientID,
    };
    formik.setValues({ ...formik.values, ...updates }, false);
  }, [patientData, selectedBill]);

  useEffect(() => {
    if (!id || !row) return;
    if (!diseaseOptions.length) return; // wait until diseases loaded

    // Map advice list safely
    const mappedAdviceList = Array.isArray(row.adviceList)
      ? row.adviceList.map((item) => ({
          itemId: item.itemId,
          medicine: item.item,
          type: item.typeOfMedicine,
          dosage: item.dosage,
          instructions: "",
          preferredTime: item.pillsConsumption,
          duration: item.duration,
        }))
      : [];

    if (prescriptionList.length === 0) {
      setPrescriptionList(mappedAdviceList);
    }

    // Convert DB string -> array of names
    const complaintNames = parseChiefComplaintNames(row.chiefComplaints);

    // Create lookup map (O(1))
    const diseaseMap = new Map(
      diseaseOptions.map((d) => [d.name?.toLowerCase().trim(), d]),
    );

    const mappedComplaints = complaintNames
      .map((name) => diseaseMap.get(name.toLowerCase()))
      .filter(Boolean);
    const billNumber = row.billNo ?? "";

    setBillSearch(String(billNumber));
    setSelectedBill(String(billNumber));
    const updates = {
      UHID: row.picasoId ?? "",
      Name: row.patientName?.trim() ?? "",
      Gender: row.gender ?? "",
      Mobile: row.contactNo ?? "",
      FinCategory: row.patientType ?? "",
      Age: row.age ?? "",
      consultingId: row.consultingId ?? "",
      hospitalId: row.hospitalId ?? "",
      Remarks: row.remarks ?? "",
      ReferTo: row.referrals ?? "",
      AddedBy: row.addedBy ?? "",
      billno: billNumber || "",
      ChiefComplaint: mappedComplaints,
      otherinstrution: row.otherInstructions ?? "",
      labs: row.labs ?? "",
      otherlabs: row.otherLabs ?? "",
      followup: row.nextFollowup ?? "",
      advice: row.preventiveAdvice ?? "",
      history: row.history ?? "",
      bpsystolic: row.bpSystolic ?? "",
      bpdiastolic: row.bpDiastolic ?? "",
      pulserate: row.pulseRate ?? "",
      spo2: row.spo2 ?? "",
      temprature: row.temperature ?? "",
      height: row.height ?? "",
      weight: row.weight ?? "",
    };

    formik.setValues((prev) => ({ ...prev, ...updates }), false);
  }, [id, row, diseaseOptions]);

  const handleAddPrescription = () => {
    const {
      medicine,
      medicineId,
      typemedicine,
      dosage,
      dosageinstructions,
      preferredtime,
      duration,
    } = formik.values;
    if (
      !medicine ||
      !typemedicine ||
      !dosage ||
      !dosageinstructions ||
      !preferredtime ||
      !duration
    ) {
      healthAlerts.warning("Please fill all mandatory medicine fields");
      return;
    }

    const newItem = {
      itemId: medicineId,
      medicine,
      type: typemedicine,
      dosage,
      instructions: dosageinstructions,
      preferredTime: preferredtime,
      duration,
    };

    setPrescriptionList((prev) => [...prev, newItem]);

    formik.setValues({
      ...formik.values,
      medicine: "",
      medicineId: null,
      typemedicine: "",
      dosage: "",
      dosageinstructions: "",
      preferredtime: "",
      duration: "",
    });
    setMedicineSearch("");
    setSelectedMedicine(null);
    setMedicineSuggestions([]);
  };
  const handleDeletePrescription = (index) => {
    setPrescriptionList((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-6xl mx-auto mt-8 bg-white p-6 rounded-2xl shadow border border-gray-200">
      <h2 className="text-2xl font-bold text-sky-700 mb-5 text-center">
        💳 Prescription Form
      </h2>

      <form onSubmit={formik.handleSubmit} className="space-y-5">
        <section>
          <h3 className="text-lg font-semibold text-sky-700 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span> Patient
            Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <label className="text-sm text-gray-600 block mb-1">
                Bill no <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className={baseInput}
                placeholder="Search Bill no (e.g., 123)"
                value={billSearch}
                onChange={(e) => {
                  if (id) return;
                  const val = e.target.value.replace(/\D/g, "");
                  setBillSearch(val);
                  setSelectedBill("");
                  formik.setFieldValue("billno", "");
                  setSuggestionsList([]);
                  populatedUhidRef.current = "";
                }}
                autoComplete="off"
              />

              {suggestionsList.length > 0 && billSearch.length >= 1 && (
                <ul className="absolute z-20 bg-white border rounded-md shadow-md w-full max-h-48 overflow-auto">
                  {suggestionsList.map((item) => (
                    <li
                      key={item.ID}
                      onClick={() => {
                        setSelectedBill(item.ID);
                        formik.setFieldValue("billno", item.ID);
                        setBillSearch(item.ID);
                        setSuggestionsList([]);
                      }}
                      className="px-3 py-2 hover:bg-sky-100 cursor-pointer"
                    >
                      {item.ID}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Input
              label="Name"
              {...formik.getFieldProps("Name")}
              readOnly
              className="bg-sky-50 cursor-not-allowed"
            />

            <Input
              label="UHID"
              {...formik.getFieldProps("UHID")}
              readOnly
              className="bg-sky-50 cursor-not-allowed"
            ></Input>

            <Input
              label="Age"
              {...formik.getFieldProps("Age")}
              readOnly
              className="bg-sky-50 cursor-not-allowed"
            />

            <Input
              label="Gender"
              {...formik.getFieldProps("Gender")}
              readOnly
              className="bg-sky-50 cursor-not-allowed"
            ></Input>
            <Input
              label="Mobile"
              {...formik.getFieldProps("Mobile")}
              readOnly
              className="bg-sky-50 cursor-not-allowed"
            ></Input>

            <Input
              {...formik.getFieldProps("FinCategory")}
              className="bg-sky-50 cursor-not-allowed"
              label="Category"
              readOnly
            ></Input>
          </div>
        </section>
        <section className="mt-6">
          <h3 className="text-lg font-semibold text-sky-700 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span>
            Vitals & Examination
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Input
              {...formik.getFieldProps("bpsystolic")}
              label="BP Systolic (mmHg)"
              type="number"
              inputProps={{ min: 70, max: 250 }}
            />

            <Input
              {...formik.getFieldProps("bpdiastolic")}
              label="BP Diastolic (mmHg)"
              type="number"
              inputProps={{ min: 40, max: 150 }}
            />

            <Input
              {...formik.getFieldProps("pulserate")}
              label="Pulse (bpm)"
              type="number"
              inputProps={{ min: 30, max: 220 }}
            />

            <Input
              {...formik.getFieldProps("spo2")}
              label="SPO2 (%)"
              type="number"
              inputProps={{ min: 70, max: 100 }}
            />

            <Input
              {...formik.getFieldProps("temprature")}
              label="Temperature (°C)"
              type="number"
              inputProps={{
                step: "0.1",
                min: 35,
                max: 42,
              }}
            />

            <Input
              {...formik.getFieldProps("height")}
              label="Height (cm)"
              type="number"
              inputProps={{ min: 30, max: 250 }}
            />

            <Input
              {...formik.getFieldProps("weight")}
              label="Weight (kg)"
              type="number"
              inputProps={{ min: 1, max: 300 }}
            />
          </div>
        </section>
        {/* ================= BILLING DETAILS ================= */}{" "}
        <section>
          <h3 className="text-lg font-semibold text-sky-700 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span>{" "}
            Prescription Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              {...formik.getFieldProps("otherinstrution")}
              placeholder="Other Instructions "
              label="Other Instructions"
            />
            <DiseaseSelect
              label="Complaint"
              value={formik.values.ChiefComplaint}
              onChange={(selected) =>
                formik.setFieldValue("ChiefComplaint", selected)
              }
              required
            />
            <Input
              {...formik.getFieldProps("labs")}
              placeholder="Labs"
              label="Labs"
            />
            <Input
              {...formik.getFieldProps("otherlabs")}
              placeholder="Other Labs"
              label="Other Labs"
            />
            <Input
              {...formik.getFieldProps("followup")}
              placeholder="Next Follow-up days"
              label="Next Follow-up days"
            />
            <Input
              {...formik.getFieldProps("advice")}
              placeholder="Preventive Advice"
              label="Preventive Advice"
            />
            <Input
              {...formik.getFieldProps("history")}
              placeholder="History"
              label="History"
            />
          </div>
        </section>
        {/* ================= Medical Prescription DETAILS ================= */}
        <section>
          <h3 className="text-lg font-semibold text-sky-700 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span> Medical
            Prescription
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <label className="text-sm text-gray-600 block mb-1">
                Medicine <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                className={`${baseInput} 
        ${!formik.values.billno ? "bg-sky-50 cursor-not-allowed" : ""}`}
                placeholder={
                  
                     "Search Medicine"
                    
                }
                value={medicineSearch}
                disabled={!formik.values.billno}
                onChange={(e) => {
                  setMedicineSearch(e.target.value);
                  setSelectedMedicine(null);
                  formik.setFieldValue("medicine", e.target.value);
                }}
                autoComplete="off"
              />

              {/* Medicine Search Suggestions List */}
              {medicineSuggestions.length > 0 && (
                <ul className="absolute z-20 bg-white border rounded-md shadow-md w-full max-h-48 overflow-auto">
                  {medicineSuggestions.map((item) => (
                    <li
                      key={item.id}
                      onClick={() => {
                        setSelectedMedicine(item);
                        setMedicineSearch(item.descriptions);
                        formik.setFieldValue("medicine", item.descriptions);
                        formik.setFieldValue("medicineId", item.id);
                        formik.setFieldValue(
                          "typemedicine",
                          item.itemType?.Descriptions || "",
                        );
                        setMedicineSuggestions([]);
                      }}
                      className="px-3 py-2 hover:bg-sky-100 cursor-pointer text-sm"
                    >
                      {item.descriptions}
                      <span className="text-xs text-gray-400 ml-2">
                        ({item.itemType?.Code})
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Input
              {...formik.getFieldProps("typemedicine")}
              placeholder="Type of Medicine"
              label="Type of Medicine *"
              disabled={!formik.values.billno}
            />
            <Input
              {...formik.getFieldProps("dosage")}
              placeholder="Dosage pills "
              label="Dosage pills*"
              disabled={!formik.values.billno}
            />
            <Input
              {...formik.getFieldProps("dosageinstructions")}
              placeholder="Instructions "
              label="Instructions *"
              disabled={!formik.values.billno}
            />
            <Select
              label="Preferred Time *"
              required
              value={formik.values.preferredtime}
              onChange={(e) =>
                formik.setFieldValue("preferredtime", e.target.value)
              }
              error={
                formik.touched.preferredtime && formik.errors.preferredtime
              }
            >
              <option value="">Select Time</option>
              {PILL_CONSUMPTION_TIMES.map((time) => (
                <option key={time.value} value={time.value}>
                  {time.label}
                </option>
              ))}
            </Select>

            {/* <Input
              label="Duration (in days) *"
              inputMode="numeric"
              type="text"
              value={formik.values.duration}
              onChange={(e) => {
                const onlyNumbers = e.target.value.replace(/[^0-9]/g, "");
                formik.setFieldValue("duration", onlyNumbers);
              }}
            /> */}
            <Select
              label="Duration (in days) *"
              required
              value={formik.values.duration}
              onChange={(e) => formik.setFieldValue("duration", e.target.value)}
              error={formik.touched.duration && formik.errors.duration}
            >
              <option value="">Select Time</option>
              {MEDICINE_FREQUENCIES.map((time) => (
                <option key={time.value} value={time.value}>
                  {time.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="mt-3">
            <button
              type="button"
              onClick={handleAddPrescription}
              title="Add medicine"
              className="h-9 w-9 flex items-center justify-center rounded-full
             bg-emerald-600 text-white hover:bg-emerald-700
             focus:ring-2 focus:ring-emerald-500"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>

          {prescriptionList.length > 0 && (
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-sky-100">
              <div className="px-4 py-3 border-b border-sky-100">
                <h2 className="text-sky-700 font-semibold text-sm">
                  Prescribed Medicines
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-sky-40 text-sky-700">
                    <tr>
                      <th className="px-4 py-3 text-left">SL No</th>
                      <th className="px-4 py-3 text-left">Medicine</th>
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-left">Dosage</th>
                      <th className="px-4 py-3 text-left">Time</th>
                      <th className="px-4 py-3 text-left">Days</th>
                      <th className="px-4 py-3 text-center">Delete</th>
                    </tr>
                  </thead>

                  <tbody>
                    {prescriptionList.map((item, index) => (
                      <tr key={index} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3">{index + 1}</td>
                        <td className="px-4 py-3 font-medium">
                          {item.medicine}
                        </td>
                        <td className="px-4 py-3">{item.type}</td>
                        <td className="px-4 py-3">{item.dosage}</td>
                        <td className="px-4 py-3">
                          {item.preferredTime || "-"}
                        </td>
                        <td className="px-4 py-3">{item.duration}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeletePrescription(index)}
                            className="text-red-500 hover:text-red-700"
                            title="Delete"
                          >
                            🗑
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
        <div className="flex justify-center flex-wrap gap-3 pt-6 border-t border-gray-100">
          <Button type="submit" variant="sky" disabled={isLoading}>
            {isLoading ? "Saving..." : id ? "Update" : "Save"}
          </Button>

          <Button type="button" variant="gray" onClick={formik.handleReset}>
            <ArrowPathIcon className="w-5 h-5 inline mr-1" /> Reset
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onPrintCS(row)}
          >
            Print CS
          </Button>
        </div>
      </form>
      {printRow && (
        <div style={{ display: "none" }}>
          <PrescriptionPrint ref={printRef} data={printRow} />
        </div>
      )}
    </div>
  );
};

export default PrescriptionForm;
