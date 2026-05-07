import React, { useState, useRef, useCallback, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  DocumentCheckIcon,
  UserIcon
} from "@heroicons/react/24/outline";
import { Input, Select, Button } from "../components/FormControls";
import { healthAlerts } from "../utils/healthSwal";
import {
  useGetComboQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
} from "../redux/apiSlice";

import { useLocation, useNavigate } from "react-router-dom";
import {
  formatDate,
  formatTime,
  combineDateTime,
} from "../utils/dateTime";
import PatientSelector from "../components/common/PatientSelector";
const AppointmentVisit = () => {
  const [activeStep, setActiveStep] = useState(1);


  const dateRef = useRef(null);
  const timeRef = useRef(null);
  const checkInRef = useRef(null);
  const checkOutRef = useRef(null);


  // const doctors = ["Dr. Sharma", "Dr. Gupta", "Dr. Khan"];
  const locations = ["Noida OHC", "Delhi OHC", "Plant Site"];
  const { data: doctors = [], isLoading: doctorsComboLoading } = useGetComboQuery("doctor");
  const navigate = useNavigate();
  const locationHook = useLocation();
  const editData = locationHook.state?.editData;
  const [createAppointment, { isLoading: createLoading }] =
    useCreateAppointmentMutation();

  const [updateAppointment, { isLoading: updateLoading }] =
    useUpdateAppointmentMutation();

  const isLoading = createLoading || updateLoading;
  //   const combineDateTime = (date, time) => {
  //   if (!date || !time) return null;
  //     const local = new Date(`${date}T${time}:00`);
  //   return local.toISOString();
  // };

  // const formatTime = (iso) => {
  //   if (!iso) return "";
  //   const d = new Date(iso);

  //   return d.toLocaleTimeString("en-GB", {
  //     hour: "2-digit",
  //     minute: "2-digit",
  //     hour12: false,
  //   });
  // };

  // const formatDate = (iso) => {
  //   if (!iso) return "";

  //   const d = new Date(iso);
  //   return d.toLocaleDateString("en-CA"); 
  // };
  const isPastTime = (date, time) => {
    if (!date || !time) return false;
    const now = new Date();
    const selected = new Date(`${date}T${time}:00`);
    return selected < now;
  };
  const formik = useFormik({
    initialValues: {
      appointmentDate: "",
      appointmentTime: "",
      location: "",
      doctorId: "",
      visitType: "",
      tokenNumber: "",
      checkIn: "",
      checkOut: "",
      status: "Scheduled",
      remarks: "",
      EmployeeId: "",
      patient_id: "",
      Name: "",
      Gender: "",
      Age: "",
    },

    validationSchema: Yup.object({
      appointmentDate: Yup.string().required("Date Required"),
      patient_id: Yup.string().required("patient ID Required"),
      appointmentTime: Yup.string().required("Time Required"),
      doctorId: Yup.string().required("Doctor Required"),
      location: Yup.string().required("Location Required"),
      visitType: Yup.string().required("Visit Type Required"),
    }),


    onSubmit: async (values) => {

      if (isPastTime(values.appointmentDate, values.appointmentTime)) {
        healthAlerts.error("Past date/time not allowed");
        return;
      }
      try {
        const payload = {
          employee_id: values.EmployeeId,
          patient_id: values.patient_id,
          name: values.Name,
          gender: values.Gender,
          age: Number(values.Age),
          appointment_datetime: combineDateTime(
            values.appointmentDate,
            values.appointmentTime
          ),

          ohc_location: values.location,
          doctor_id: Number(values.doctorId),
          visit_type: values.visitType,
          token_number: Number(values.tokenNumber || 0),
          check_in_time: values.checkIn
            ? combineDateTime(values.appointmentDate, values.checkIn)
            : null,

          check_out_time: values.checkOut
            ? combineDateTime(values.appointmentDate, values.checkOut)
            : null,



          status: values.status.toUpperCase(),
          remark: values.remarks,
        };

        if (editData) {
          await updateAppointment({
            id: editData.id,
            body: payload,
          }).unwrap();

          healthAlerts.success("Updated Successfully");
        } else {
          await createAppointment(payload).unwrap();
          healthAlerts.success("Saved Successfully");
        }

        navigate("/appointment", { state: { goToList: true } });

      } catch (err) {
        healthAlerts.error(err?.data?.message || "Error");
      }
    },

  });
  useEffect(() => {
    console.log("EDIT DATA:", editData);

    if (!editData) return;

    formik.setValues({
      EmployeeId: editData.employeeId || "",
      patient_id: editData.patientId || "",
      Name: editData.name || "",
      Gender: editData.gender || "",
      Age: editData.age || "",
      appointmentDate: editData.appointmentDate || formatDate(editData.appointment_datetime),
      appointmentTime: editData.appointmentTime || formatTime(editData.appointment_datetime),
      location: editData.location || "",
      doctorId: editData.doctorId || "",
      visitType: editData.visitType || "",
      tokenNumber: editData.tokenNumber || "",
      checkIn: editData.checkIn || "",
      checkOut: editData.checkOut || "",
      status:
        editData.status?.charAt(0).toUpperCase() +
        editData.status?.slice(1).toLowerCase(),
      remarks: editData.remark || "",
    });
  }, [editData]);

 


  const openPicker = useCallback((ref) => {
    if (ref?.current?.showPicker) {
      ref.current.showPicker();
    } else {
      ref.current?.focus();
    }
  }, []);


  const nextStep = useCallback(async () => {
    const errors = await formik.validateForm();

    if (activeStep === 1 && !formik.values.patient_id) {
      healthAlerts.warning("Patient is required");
      return;
    }

    if (
      activeStep === 2 &&
      (
        errors.appointmentDate ||
        errors.appointmentTime ||
        errors.doctorId ||
        errors.location ||
        errors.visitType
      )
    ) {
      formik.setTouched({
        appointmentDate: true,
        appointmentTime: true,
        doctorId: true,
        location: true,
        visitType: true,
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
              <CalendarIcon className="w-6 text-blue-600" />
            </span>
            Appointment & Visit
          </h1>

          <div className="flex gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 w-12 rounded-full ${activeStep >= s ? "bg-sky-600" : "bg-gray-200"
                  }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-blue-100 border border-gray-100 overflow-hidden">


          <div className="flex border-b mb-6">
            {[
              { id: 1, label: "Patient", icon: UserIcon },
              { id: 2, label: "Appointment", icon: CalendarIcon },
              { id: 3, label: "Visit", icon: MapPinIcon },

              { id: 4, label: "Confirm", icon: DocumentCheckIcon },
            ].map((step) => (
              <button
                key={step.id}
                type="button"
                disabled
                onClick={() => setActiveStep(step.id)}
                className={`flex-1 py-4 flex items-center justify-center gap-2 ${activeStep === step.id
                  ? "bg-white text-sky-600 shadow"
                  : "text-gray-400"
                  }`}
              >
                <step.icon className="w-4 h-4" />
                {step.label}
              </button>
            ))}
          </div>

          <div className="p-10">
            <form onSubmit={formik.handleSubmit} className="space-y-5">
              {activeStep === 1 && (
                <section>
                  <PatientSelector formik={formik} />

                </section>
              )}


              {activeStep === 2 && (
                <section>
                  <h3 className="text-lg font-semibold text-sky-700 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span>
                    Appointment Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">


                    <div>
                      <label>
                        Appointment Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        ref={dateRef}
                        type="date"
                        {...formik.getFieldProps("appointmentDate")}
                        className={`w-full border rounded-lg px-3 py-2 outline-none ${formik.touched.appointmentDate && formik.errors.appointmentDate
                          ? "border-red-500 ring-1 ring-red-500"
                          : "focus:ring-2 focus:ring-sky-500 border-gray-300"
                          }`}
                        min={new Date().toISOString().split("T")[0]}
                      />
                      {formik.touched.appointmentDate && formik.errors.appointmentDate && (
                        <p className="text-red-500 text-xs mt-1">{formik.errors.appointmentDate}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm mb-1">Appointment Time <span className="text-red-500">*</span> </label>
                      <input
                        ref={timeRef}
                        type="time"
                        {...formik.getFieldProps("appointmentTime")}
                        onClick={() => openPicker(timeRef)}
                        onFocus={() => openPicker(timeRef)}
                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none"
                      />
                    </div>

                    <Select label="OHC Location" {...formik.getFieldProps("location")}>
                      <option value="">Select</option>
                      {locations.map((l) => <option key={l}>{l}</option>)}
                    </Select>

                    <Select label="Doctor Assigned" {...formik.getFieldProps("doctorId")} >
                      
                      <option value="">Select</option>
                      {doctors.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name || d.doctor_name}
                        </option>
                      ))}
                    </Select>

                    <Select label="Visit Type" {...formik.getFieldProps("visitType")}>
                      <option value="">Select</option>
                      <option>PEME</option>
                      <option>OPD</option>
                      <option>Emergency</option>
                    </Select>

                  </div>
                </section>
              )}


              {activeStep === 3 && (
                <section>
                  <h3 className="text-lg font-semibold text-sky-700 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span>
                    Visit Info
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input label="Token Number" {...formik.getFieldProps("tokenNumber")} />
                    <div>
                      <label className="block text-sm mb-1">Check-in Time</label>
                      <input
                        ref={checkInRef}
                        type="time"
                        {...formik.getFieldProps("checkIn")}
                        onClick={() => openPicker(checkInRef)}
                        onFocus={() => openPicker(checkInRef)}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-1">Check-out Time</label>
                      <input
                        ref={checkOutRef}
                        type="time"
                        {...formik.getFieldProps("checkOut")}
                        onClick={() => openPicker(checkOutRef)}
                        onFocus={() => openPicker(checkOutRef)}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>

                    <Select label="Status" {...formik.getFieldProps("status")}>
                      <option>Scheduled</option>
                      <option>Completed</option>
                      <option>Pending</option>
                    </Select>

                    <Input label="Remarks" {...formik.getFieldProps("remarks")} />
                  </div>
                </section>
              )}





              {activeStep === 4 && (
                <section>
                  <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 space-y-4">
                    <h3 className="text-lg font-semibold text-sky-600">
                      APPOINTMENT PREVIEW
                    </h3>

                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <p><b>Name:</b> {formik.values.Name}</p>
                      <p><b>Gender:</b> {formik.values.Gender}</p>
                      <p><b>Age:</b> {formik.values.Age}</p>
                      <p><b> patient_id:</b> {formik.values.patient_id}</p>
                    </div>

                    <div className="border-t pt-3 text-sm">
                      <p><b>Appointment Date:</b> {formik.values.appointmentDate}</p>
                      <p><b>Appointment Time:</b> {formik.values.appointmentTime}</p>
                    </div>


                    <div className="border-t pt-3 text-sm">
                      <p><b>Check-in Time: </b> {formik.values.checkIn}</p>
                      <p><b>Check-out Time</b> {formik.values.checkOut}</p>
                    </div>


                    <div className="border-t pt-3 text-sm">
                      <p>
                        <b>OHC Location:</b>{formik.values.location}

                      </p>
                    </div>


                    <div className="border-t pt-3 text-sm">
                      <p><b>Visit Type:</b> {formik.values.visitType}</p>
                    </div>

                  </div>
                </section>
              )}


              <div className="flex justify-between pt-6 border-t border-gray-100">
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

export default AppointmentVisit;