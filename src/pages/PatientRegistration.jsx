import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  UserIcon,
  MapPinIcon,
  HeartIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";

import {
  RELATIONSHIP_OPTIONS,
  TITLES,
  BLOOD_GROUPS,
  IDENTIFICATION_TYPES,
} from "../utils/constants";

import {
  useRegisterPatientsMutation,
  useGetPatientByIdQuery,
  useUpdatePatientMutation,
} from "../redux/apiSlice";

import { useLocationData } from "../services/locationApi";
import { healthAlerts } from "../utils/healthSwal";
import { useParams, useNavigate } from "react-router-dom";

import { Input, Select, Button } from "../components/FormControls";
import DiseaseSelect from "../components/DiseaseSelect";
import { useLazySearchDiseasesQuery } from "../redux/apiSlice";
const PatientFormCopy = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(1);

  const [countryId, setCountryId] = useState("");
  const [stateId, setStateId] = useState("");

  const { countries, states, districts } = useLocationData(
    countryId,
    stateId
  );

  const { data: patientApiResponse } = useGetPatientByIdQuery(id, {
    skip: !isEdit,
  });

  const [createPatient, { isLoading: isCreating }] =
    useRegisterPatientsMutation();

  const [updatePatient, { isLoading: isUpdating }] =
    useUpdatePatientMutation();

  const formik = useFormik({
    initialValues: {
      title: "",
      name: "",
      dob: "",
      age: "",
      CO: "",
      relationship: "",
      gender: "",
      contactNumber: "",
      country: "",
      localAddressState: "",
      localAddressDistrict: "",
      localAddress: "",
      pin: "",
      diseases: [],
      blood_group: "",
      idProof_name: "",
      idProof_number: "",
    },

    validationSchema: Yup.object({
      title: Yup.string().required("Required"),
      name: Yup.string().required("Required"),
      gender: Yup.string().required("Required"),
      contactNumber: Yup.string()
        .matches(/^[0-9]{10}$/, "Invalid")
        .required("Required"),
      country: Yup.string().required("Required"),
      localAddressState: Yup.string().required("Required"),
      CO: Yup.string().required("Required"),
    }),

    onSubmit: async (values) => {
      try {
        const payload = {
          ...values,
          age: parseInt(values.age) || 0,
          country_id: Number(values.country),
          state_id: Number(values.localAddressState),
          district_id: Number(values.localAddressDistrict),
          disease_ids: values.diseases.map((d) => d.id),
          co: values.CO,
          comingFromWebsite: "B2B",
        };

        if (isEdit) {
          await updatePatient({ id, body: payload }).unwrap();
          healthAlerts.success("Patient Updated");
        } else {
          await createPatient(payload).unwrap();
          healthAlerts.success("Patient Registered");
          formik.resetForm();
        }

        navigate("/patient-list-copy");
      } catch (err) {
        healthAlerts.error("Operation Failed");
      }
    },
  });

  const handleDOBChange = (e) => {
    const dob = e.target.value;
    formik.setFieldValue("dob", dob);

    if (!dob) return;

    const birth = new Date(dob);
    const today = new Date();

    let years = today.getFullYear() - birth.getFullYear();

    formik.setFieldValue("age", years);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 py-10">
      <div className="max-w-6xl mx-auto">

       

        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <span className="bg-blue-100 p-2 rounded-xl">
              <UserIcon className="w-6 text-blue-600" />
            </span>
            {isEdit ? "Edit Patient" : "Patient Registration"}
          </h1>

          <div className="flex gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 w-12 rounded-full ${
                  activeStep >= s ? "bg-blue-600" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>



        <div className="bg-white rounded-3xl shadow-xl shadow-blue-100 border border-gray-100 overflow-hidden">

        

          <div className="flex border-b">

            {[
              { id: 1, label: "Basic", icon: UserIcon },
              { id: 2, label: "Address", icon: MapPinIcon },
              { id: 3, label: "Medical", icon: HeartIcon },
              { id: 4, label: "Review", icon: CreditCardIcon },
            ].map((step) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`flex-1 py-4 flex items-center justify-center gap-2 font-semibold text-sm
                ${
                  activeStep === step.id
                    ? "bg-white text-blue-600 shadow"
                    : "text-gray-400"
                }`}
              >
                <step.icon className="w-5" />
                {step.label}
              </button>
            ))}

          </div>

          <div className="p-10">

            <form onSubmit={formik.handleSubmit}>

              

              {activeStep === 1 && (

                <div className="grid md:grid-cols-3 gap-6">

                  <Select label="Title" {...formik.getFieldProps("title")}>
                    <option value="">Select</option>
                    {TITLES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </Select>

                  <Input
                    label="Full Name"
                    {...formik.getFieldProps("name")}
                  />

                  <Input
                    label="Date Of Birth"
                    type="date"
                    {...formik.getFieldProps("dob")}
                    onChange={handleDOBChange}
                  />

                  <Input
                    label="Age"
                    value={formik.values.age}
                    readOnly
                  />

                  <Input
                    label="Guardian"
                    {...formik.getFieldProps("CO")}
                  />

                  <Select label="Gender" {...formik.getFieldProps("gender")}>
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                  </Select>

                  <Input
                    label="Mobile"
                    maxLength={10}
                    {...formik.getFieldProps("contactNumber")}
                  />

                  <Select
                    label="Relationship"
                    {...formik.getFieldProps("relationship")}
                  >
                    <option value="">Select</option>
                    {RELATIONSHIP_OPTIONS.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </Select>

                </div>
              )}

             

              {activeStep === 2 && (

                <div className="grid md:grid-cols-3 gap-6">

                  <Select
                    label="Country"
                    {...formik.getFieldProps("country")}
                    onChange={(e) => {
                      formik.handleChange(e);
                      setCountryId(e.target.value);
                    }}
                  >
                    <option value="">Select</option>

                    {countries.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>

                  <Select
                    label="State"
                    {...formik.getFieldProps("localAddressState")}
                    onChange={(e) => {
                      formik.handleChange(e);
                      setStateId(e.target.value);
                    }}
                  >
                    <option value="">Select</option>

                    {states.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </Select>

                  <Select
                    label="District"
                    {...formik.getFieldProps("localAddressDistrict")}
                  >
                    <option value="">Select</option>

                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </Select>

                  <Input
                    label="Local Address"
                    className="md:col-span-2"
                    {...formik.getFieldProps("localAddress")}
                  />

                  <Input
                    label="Pin Code"
                    {...formik.getFieldProps("pin")}
                  />

                </div>
              )}

             

              {activeStep === 3 && (

                <div className="grid md:grid-cols-3 gap-6">

                  <Select
                    label="Blood Group"
                    {...formik.getFieldProps("blood_group")}
                  >
                    <option value="">Select</option>

                    {BLOOD_GROUPS.map((b) => (
                      <option key={b}>{b}</option>
                    ))}
                  </Select>

                  <DiseaseSelect
                    label="Diseases"
                    value={formik.values.diseases}
                    onChange={(s) =>
                      formik.setFieldValue("diseases", s)
                    }
                  />

                  <Select
                    label="ID Proof"
                    {...formik.getFieldProps("idProof_name")}
                  >
                    <option value="">Select</option>

                    {IDENTIFICATION_TYPES.map((i) => (
                      <option key={i.value} value={i.value}>
                        {i.label}
                      </option>
                    ))}
                  </Select>

                  <Input
                    label="ID Number"
                    {...formik.getFieldProps("idProof_number")}
                  />

                </div>
              )}

             

              <div className="flex justify-between mt-10 pt-6 border-t">

                <Button
                  type="button"
                  variant="gray"
                  onClick={() =>
                    setActiveStep((prev) => prev - 1)
                  }
                  disabled={activeStep === 1}
                >
                  Back
                </Button>

                {activeStep < 3 ? (
                  <Button
                    type="button"
                    variant="sky"
                    onClick={() =>
                      setActiveStep((prev) => prev + 1)
                    }
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="sky"
                    disabled={isCreating || isUpdating}
                  >
                    Save Patient
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

export default PatientFormCopy;


// import React, { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import { ArrowPathIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

// import {
//   RELATIONSHIP_OPTIONS,
//   TITLES,
//   BLOOD_GROUPS,
//   RESIDENTAL_STATUS,
//   OCCUPATION_OPTIONS,
//   IDENTIFICATION_TYPES,
// } from "../utils/constants";

// import {
//   useRegisterPatientsMutation,
//   useGetPatientByIdQuery,
//   useUpdatePatientMutation,
//   useLazySearchDiseasesQuery,
// } from "../redux/apiSlice";

// import DiseaseSelect from "../components/DiseaseSelect";
// import { useLocationData } from "../services/locationApi";
// import { healthAlerts } from "../utils/healthSwal";
// import { useParams, useNavigate } from "react-router-dom";
// import { Input, Select, Button } from "../components/FormControls";

// const cardAnim = {
//   hidden: { opacity: 0, y: 20 },
//   visible: { opacity: 1, y: 0 },
// };

// const PatientRegistration = () => {
//   const { id } = useParams();
//   const isEdit = Boolean(id);
//   const navigate = useNavigate();

//   const { data: patientApiResponse, isLoading } =
//     useGetPatientByIdQuery(id, { skip: !isEdit });

//   const [createPatient] = useRegisterPatientsMutation();
//   const [updatePatient] = useUpdatePatientMutation();

//   const [countryId, setCountryId] = useState("");
//   const [stateId, setStateId] = useState("");

//   const { countries, states, districts } = useLocationData(countryId, stateId);

//   const formik = useFormik({
//     initialValues: {
//       title: "",
//       name: "",
//       dob: "",
//       age: "",
//       CO: "",
//       gender: "",
//       contactNumber: "",
//       country: "",
//       localAddressState: "",
//       localAddressDistrict: "",
//       localAddress: "",
//       pin: "",
//       emergencyContactName: "",
//       emergencyContactNumber: "",
//       blood_group: "",
//       diseases: [],
//       creditamount: "",
//       idProof_number: "",
//       idProof_name: "",
//     },

//     validationSchema: Yup.object({
//       name: Yup.string().required("Required"),
//       gender: Yup.string().required("Required"),
//       contactNumber: Yup.string().required("Required"),
//     }),

//     onSubmit: async (values) => {
//       try {
//         if (isEdit) {
//           await updatePatient({ id, body: values }).unwrap();
//           healthAlerts.success("Patient Updated");
//         } else {
//           await createPatient(values).unwrap();
//           healthAlerts.success("Patient Saved");
//           formik.resetForm();
//         }
//       } catch {
//         healthAlerts.error("Operation Failed");
//       }
//     },
//   });

//   useEffect(() => {
//     if (isEdit && patientApiResponse) {
//       const p = patientApiResponse.data || patientApiResponse;
//       formik.setValues({
//         ...formik.values,
//         name: p.name || "",
//         gender: p.gender || "",
//         contactNumber: p.contactNumber || "",
//       });
//     }
//   }, [patientApiResponse]);

//   if (isEdit && isLoading) {
//     return <div className="text-center mt-10">Loading...</div>;
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-200 via-sky-100 to-white p-6">

//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         className="max-w-7xl mx-auto"
//       >

//         <div className="bg-white rounded-2xl shadow-xl p-6">

//           {/* HEADER */}
//           <div className="flex items-center gap-3 mb-6 border-b pb-3">
//             <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-lg">
//               🩺
//             </div>
//             <div>
//               <h2 className="text-xl font-semibold text-gray-700">
//                 Patient Registration
//               </h2>
//               {/* <p className="text-sm text-gray-400">
//                 Patient Registration
//               </p> */}
//             </div>
//           </div>

//           <form
//             onSubmit={formik.handleSubmit}
//             className="grid grid-cols-1 lg:grid-cols-2 gap-6"
//           >

//             {/* BASIC DETAILS */}
//             <motion.section
//               variants={cardAnim}
//               initial="hidden"
//               animate="visible"
//               transition={{ duration: 0.3 }}
//               className="bg-gradient-to-br from-white to-blue-50 p-5 rounded-xl border border-blue-100 shadow-md hover:shadow-xl transition"
//             >
//               <h3 className="font-semibold text-blue-700 mb-4 flex items-center gap-2">
//                 🧑 Basic Details
//               </h3>

//               <div className="grid grid-cols-2 gap-3">

//                 <Select {...formik.getFieldProps("title")} label="Title">
//                   <option value="">Select</option>
//                   {TITLES.map((t) => (
//                     <option key={t}>{t}</option>
//                   ))}
//                 </Select>

//                 <Input {...formik.getFieldProps("name")} label="Full Name" />

//                 <Input type="date" {...formik.getFieldProps("dob")} label="DOB" />

//                 <Input value={formik.values.age} label="Age" readOnly />

//                 <Select {...formik.getFieldProps("gender")} label="Gender">
//                   <option value="">Select</option>
//                   <option>Male</option>
//                   <option>Female</option>
//                 </Select>

//                 <Input
//                   label="Contact"
//                   value={formik.values.contactNumber}
//                   onChange={(e) =>
//                     formik.setFieldValue(
//                       "contactNumber",
//                       e.target.value.replace(/[^0-9]/g, "")
//                     )
//                   }
//                 />

//                 <Input {...formik.getFieldProps("CO")} label="C/O" />
//               </div>
//             </motion.section>

//             {/* ADDRESS */}
//             <motion.section
//               variants={cardAnim}
//               initial="hidden"
//               animate="visible"
//               transition={{ duration: 0.4 }}
//               className="bg-gradient-to-br from-white to-sky-50 p-5 rounded-xl border border-sky-100 shadow-md hover:shadow-xl transition"
//             >
//               <h3 className="font-semibold text-sky-700 mb-4 flex items-center gap-2">
//                 📍 Address Details
//               </h3>

//               <div className="grid grid-cols-2 gap-3">

//                 <Select
//                   {...formik.getFieldProps("country")}
//                   label="Country"
//                   onChange={(e) => {
//                     formik.setFieldValue("country", e.target.value);
//                     setCountryId(e.target.value);
//                   }}
//                 >
//                   <option value="">Select</option>
//                   {countries.map((c) => (
//                     <option key={c.id} value={c.id}>
//                       {c.name}
//                     </option>
//                   ))}
//                 </Select>

//                 <Select
//                   {...formik.getFieldProps("localAddressState")}
//                   label="State"
//                   onChange={(e) => {
//                     formik.setFieldValue("localAddressState", e.target.value);
//                     setStateId(e.target.value);
//                   }}
//                 >
//                   <option value="">Select</option>
//                   {states.map((s) => (
//                     <option key={s.id} value={s.id}>
//                       {s.name}
//                     </option>
//                   ))}
//                 </Select>

//                 <Select
//                   {...formik.getFieldProps("localAddressDistrict")}
//                   label="District"
//                 >
//                   <option value="">Select</option>
//                   {districts.map((d) => (
//                     <option key={d.id} value={d.id}>
//                       {d.name}
//                     </option>
//                   ))}
//                 </Select>

//                 <Input {...formik.getFieldProps("localAddress")} label="Address" />

//                 <Input {...formik.getFieldProps("pin")} label="Pin Code" />

//               </div>
//             </motion.section>

//             {/* EMERGENCY */}
//             <motion.section
//               variants={cardAnim}
//               initial="hidden"
//               animate="visible"
//               transition={{ duration: 0.5 }}
//               className="bg-gradient-to-br from-white to-indigo-50 p-5 rounded-xl border border-indigo-100 shadow-md hover:shadow-xl transition"
//             >
//               <h3 className="font-semibold text-indigo-700 mb-4 flex items-center gap-2">
//                 🚑 Emergency Details
//               </h3>

//               <div className="grid grid-cols-2 gap-3">

//                 <Input
//                   {...formik.getFieldProps("emergencyContactName")}
//                   label="Emergency Name"
//                 />

//                 <Input
//                   label="Emergency Contact"
//                   value={formik.values.emergencyContactNumber}
//                   onChange={(e) =>
//                     formik.setFieldValue(
//                       "emergencyContactNumber",
//                       e.target.value.replace(/[^0-9]/g, "")
//                     )
//                   }
//                 />

//                 <DiseaseSelect
//                   label="Diseases"
//                   value={formik.values.diseases}
//                   onChange={(v) => formik.setFieldValue("diseases", v)}
//                 />

//                 <Select
//                   {...formik.getFieldProps("idProof_name")}
//                   label="ID Type"
//                 >
//                   <option value="">Select</option>
//                   {IDENTIFICATION_TYPES.map((i) => (
//                     <option key={i.value} value={i.value}>
//                       {i.label}
//                     </option>
//                   ))}
//                 </Select>

//                 <Input
//                   {...formik.getFieldProps("idProof_number")}
//                   label="ID Number"
//                 />

//               </div>
//             </motion.section>

//             {/* PAYMENT */}
//             <motion.section
//               variants={cardAnim}
//               initial="hidden"
//               animate="visible"
//               transition={{ duration: 0.6 }}
//               className="bg-gradient-to-br from-white to-teal-50 p-5 rounded-xl border border-teal-100 shadow-md hover:shadow-xl transition"
//             >
//               <h3 className="font-semibold text-teal-700 mb-4 flex items-center gap-2">
//                 💳 Payment
//               </h3>

//               <Input
//                 {...formik.getFieldProps("creditamount")}
//                 label="Credit Amount"
//                 disabled
//               />
//             </motion.section>

//             {/* BUTTONS */}
//             <div className="lg:col-span-2 flex justify-end gap-3 pt-4 border-t">

//               <Button
//                 type="submit"
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition hover:scale-105"
//               >
//                 <CheckCircleIcon className="w-5 h-5 inline mr-1" />
//                 Save
//               </Button>

//               <Button
//                 type="button"
//                 onClick={() => formik.resetForm()}
//                 className="bg-gray-200 hover:bg-gray-300 px-6 py-2 rounded-lg transition"
//               >
//                 <ArrowPathIcon className="w-5 h-5 inline mr-1" />
//                 Reset
//               </Button>

//             </div>

//           </form>

//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default PatientRegistration;