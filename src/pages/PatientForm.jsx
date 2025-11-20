import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ArrowPathIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { RELATIONSHIP_OPTIONS, TITLES, BLOOD_GROUPS, RESIDENTAL_STATUS, OCCUPATION_OPTIONS, IDENTIFICATION_TYPES } from "../utils/constants";
// import { useSearchDiseasesQuery } from "../redux/apiSlice";
import DiseaseSelect from "../components/DiseaseSelect";
import { useLocationData } from "../services/locationApi";



const baseInput =
  "border rounded-lg px-3 py-2 w-full text-sm focus:ring-2 focus:ring-sky-400 focus:outline-none";
const baseBtn =
  "px-4 py-2 rounded-lg text-sm font-medium focus:ring-2 focus:ring-offset-2";

const Input = ({ label, required, error, ...props }) => (
  <div className="mb-2">
    {label && (
      <label className="text-sm text-gray-600 block mb-1">
        {label}
        {required && <span className="text-red-500 font-bold ml-1">*</span>}
      </label>
    )}
    <input
      {...props}
      className={`${baseInput} ${error ? "border-red-500 ring-red-300" : "border-gray-300"
        }`}
    />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const Select = ({ label, required, error, children, ...props }) => (
  <div className="mb-2">
    {label && (
      <label className="text-sm text-gray-600 block mb-1">
        {label}
        {required && <span className="text-red-500 font-bold ml-1">*</span>}
      </label>
    )}
    <select
      {...props}
      className={`${baseInput} ${error ? "border-red-500 ring-red-300" : "border-gray-300"
        }`}
    >
      {children}
    </select>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const Button = ({ variant = "sky", children, ...props }) => {
  const variants = {
    sky: `${baseBtn} bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500`,
    gray: `${baseBtn} bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-300`,
  };
  return (
    <button {...props} className={variants[variant]}>
      {children}
    </button>
  );
};

const PatientRegistration = () => {
  const [age, setAge] = useState("");
  const [countryId, setCountryId] = useState("");
  const [stateId, setStateId] = useState("");

  const { countries, states, districts } = useLocationData(countryId, stateId);

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
      // email: "",
      residentialstatus: "",
      fincat: "",
      country: "",
      localAddressState: "",
      localAddressDistrict: "",
      occupation: "",
      healthCardNumber: "",
      localAddress: "",
      pin: "",
      emergencyContactName: "",
      emergencyContactNumber: "",
      blood_group: "",
      diseases: [],
      creditamount: "",
      idProof_number: "",
      idProof_name: "",

    },
    validationSchema: Yup.object({
      title: Yup.string().required("Title is required"),
      name: Yup.string().required("Full Name is required"),
      gender: Yup.string().required("Gender is required"),
      contactNumber: Yup.string()
        .matches(/^[0-9]{10}$/, "Must be 10 digits")
        .required("Contact Number is required"),
      fincat: Yup.string().required("Fin Category is required"),
      country: Yup.string().required("Country is required"),
      localAddressState: Yup.string().required("State is required"),
      occupation: Yup.string().required("Occupation is required"),
      // email: Yup.string().email("Invalid email"),
    }),
    onSubmit: (values, { resetForm }) => {
      alert("✅ Patient Registered Successfully!");
      resetForm();
      setAge("");
    },
  });

  // 🎂 Auto Age Calculation
  const handleDOBChange = (e) => {
    formik.handleChange(e);
    const dob = new Date(e.target.value);
    if (isNaN(dob)) return;
    const today = new Date();
    let years = today.getFullYear() - dob.getFullYear();
    let months = today.getMonth() - dob.getMonth();
    let days = today.getDate() - dob.getDate();
    if (days < 0) {
      months -= 1;
      days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    const ageString = `${years}y ${months}m ${days}d`;
    setAge(ageString);
    formik.setFieldValue("age", ageString);
  };

  return (
    <div className="max-w-6xl mx-auto mt-8 bg-white p-6 rounded-2xl shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold text-sky-700 mb-5 text-center">
        🏥 Patient Registration
      </h2>

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <section>
          <h3 className="text-lg font-semibold text-sky-700 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span> Basic Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Select
              {...formik.getFieldProps("title")}
              label="Title"
              required
              error={formik.touched.title && formik.errors.title}
            >
              <option value="">Select</option>
              {TITLES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>

            <Input
              {...formik.getFieldProps("name")}
              label="Full Name"
              required
              error={formik.touched.name && formik.errors.name}
            />

            <Input
              label="Date of Birth"
              type="date"
              {...formik.getFieldProps("dob")}
              onChange={handleDOBChange}
              max={new Date().toISOString().split("T")[0]}
            />

            <Input
              label="Age"
              value={age}
              readOnly
              className="bg-gray-100 text-gray-600 cursor-not-allowed"
            />

            <Input {...formik.getFieldProps("CO")} label="C/O" />

            <Select {...formik.getFieldProps("relationship")} label="Relationship">
              <option value="">Select</option>
              {RELATIONSHIP_OPTIONS.map((relation) => (
                <option key={relation}>{relation}</option>
              ))}

            </Select>

            <Select
              {...formik.getFieldProps("gender")}
              label="Gender"
              required
              error={formik.touched.gender && formik.errors.gender}
            >
              <option value="">Select</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </Select>

            <Input
              {...formik.getFieldProps("contactNumber")}
              label="Contact Number"
              required
              error={formik.touched.contactNumber && formik.errors.contactNumber}
            />

            {/* <Input
              {...formik.getFieldProps("email")}
              label="Email"
              error={formik.touched.email && formik.errors.email}
            /> */}
          </div>
        </section>

        {/* ================= ADDRESS DETAILS ================= */}
        <section>
          <h3 className="text-lg font-semibold text-sky-700 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span> Address Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Select {...formik.getFieldProps("residentialstatus")} label="Residential Status">
              <option value="">Select</option>
              {RESIDENTAL_STATUS.map((e) => (
                <option key={e}>{e}</option>
              ))}
            </Select>

            <Select
              {...formik.getFieldProps("fincat")}
              label="Fin Category"
              required
              error={formik.touched.fincat && formik.errors.fincat}
            >
              <option value="">Select</option>
              <option>APL</option>
              <option>BPL</option>
            </Select>

            {/* <Input
              {...formik.getFieldProps("country")}
              label="Country"
              required
              error={formik.touched.country && formik.errors.country}
            /> */}


            {/* <Input
              {...formik.getFieldProps("localAddressState")}
              label="State"
              required
              error={formik.touched.localAddressState && formik.errors.localAddressState}
            /> */}

            {/* <Input {...formik.getFieldProps("localAddressDistrict")} label="District" /> */}

            <Select
              label="Country"
              required
              value={countryId}
              onChange={(e) => {
                const value = e.target.value;
                setCountryId(value);
                formik.setFieldValue("country", value);
                setStateId(""); // reset when country changes
                formik.setFieldValue("localAddressState", "");
                formik.setFieldValue("localAddressDistrict", "");
              }}
              error={formik.touched.country && formik.errors.country}
            >
              <option value="">Select Country</option>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>

            <Select
              label="State"
              required
              value={stateId}
              disabled={!countryId}
              onChange={(e) => {
                const value = e.target.value;
                setStateId(value);
                formik.setFieldValue("localAddressState", value);
                formik.setFieldValue("localAddressDistrict", "");
              }}
              error={formik.touched.localAddressState && formik.errors.localAddressState}
            >
              <option value="">Select State</option>
              {states.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>

            <Select
              label="District"
              value={formik.values.localAddressDistrict}
              disabled={!stateId}
              onChange={(e) => formik.setFieldValue("localAddressDistrict", e.target.value)}
            >
              <option value="">Select District</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </Select>

            <Select {...formik.getFieldProps("occupation")} label="Occupation" error={formik.touched.occupation && formik.errors.occupation}>
              <option value="">Select</option>
              {OCCUPATION_OPTIONS.map((e) => (
                <option key={e}>{e}</option>
              ))}
            </Select>

            <Input {...formik.getFieldProps("healthCardNumber")} label="Health Card Number" />
            <Input {...formik.getFieldProps("localAddress")} label="Local Address" />
            <Input {...formik.getFieldProps("pin")} label="Pin Code" />
          </div>
        </section>

        {/* ================= EMERGENCY DETAILS ================= */}
        <section>
          <h3 className="text-lg font-semibold text-sky-700 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span> Emergency Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              {...formik.getFieldProps("emergencyContactName")}
              label="Emergency Contact Name"
            />
            <Input
              {...formik.getFieldProps("emergencyContactNumber")}
              label="Emergency Contact Number"
            />

            <Select {...formik.getFieldProps("blood_group")} label="Blood Group">
              <option value="">Select</option>
              {BLOOD_GROUPS.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </Select>

            <DiseaseSelect
              value={formik.values.diseases}
              label="Pre-existing Diseases"
              onChange={(selected) => formik.setFieldValue("diseases", selected)}
              required
            />


            <Select {...formik.getFieldProps("idProof_name")} label="Identification Type">
              <option value="">Select</option>
              {IDENTIFICATION_TYPES.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </Select>


            {formik.values.idProof_name && (
              <Input
                {...formik.getFieldProps("idProof_number")}
                label="Identification Number"
                required
                error={formik.touched.idProof_number && formik.errors.idProof_number}
              />
            )}


          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-sky-700 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span> Payment Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

            <Input {...formik.getFieldProps("creditamount")} label="Credit Amount" />
          </div>
        </section>

        {/* ================= ACTION BUTTONS ================= */}
        <div className="flex justify-center gap-4 pt-6 border-t border-gray-100">
          <Button type="submit" variant="sky">
            <CheckCircleIcon className="w-5 h-5 inline mr-1" /> Save
          </Button>
          <Button type="button" variant="gray" onClick={formik.handleReset}>
            <ArrowPathIcon className="w-5 h-5 inline mr-1" /> Reset
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PatientRegistration;
