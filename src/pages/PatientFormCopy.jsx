import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
    ArrowPathIcon,
    CheckCircleIcon,
    UserIcon,
    MapPinIcon,
    HeartIcon,
    DocumentCheckIcon
} from "@heroicons/react/24/outline";
import { RELATIONSHIP_OPTIONS, TITLES, BLOOD_GROUPS, RESIDENTAL_STATUS, OCCUPATION_OPTIONS, IDENTIFICATION_TYPES } from "../utils/constants";
import { useRegisterPatientsMutation, useGetPatientByIdQuery, useUpdatePatientMutation } from "../redux/apiSlice";
import DiseaseSelect from "../components/DiseaseSelect";
import { useLocationData } from "../services/locationApi";
import { healthAlerts } from "../utils/healthSwal";
import { useParams, useNavigate } from "react-router-dom";
import { Input, Select, Button, baseInput } from "../components/FormControls";
import { useLazySearchDiseasesQuery } from "../redux/apiSlice";

const PatientRegistrationCopy = () => {
    const [searchDiseases] = useLazySearchDiseasesQuery();
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const { data: patientApiResponse, isLoading: isFetching } = useGetPatientByIdQuery(id, {
        skip: !isEdit,
    });
    const [createPatient, { isLoading: isCreating }] = useRegisterPatientsMutation();
    const [updatePatient, { isLoading: isUpdating }] = useUpdatePatientMutation();

    const [countryId, setCountryId] = useState("");
    const [stateId, setStateId] = useState("");

    const { countries, states, districts } = useLocationData(countryId, stateId);
    const [activeStep, setActiveStep] = useState(1);

    const nextStep = async () => {
        const errors = await formik.validateForm();

        if (activeStep === 1 && (errors.title || errors.name || errors.contactNumber)) {
            formik.setTouched({
                title: true,
                name: true,
                contactNumber: true,
            });
            return;
        }

        if (activeStep === 2 && (errors.country || errors.localAddressState)) {
            formik.setTouched({
                country: true,
                localAddressState: true,
            });
            return;
        }

        setActiveStep((prev) => prev + 1);
    };

    const prevStep = () => setActiveStep((prev) => prev - 1);

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
        enableReinitialize: true,
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
            CO: Yup.string().required("Co is required")
        }),

        onSubmit: async (values) => {
            try {
                const payload = buildPayload(values);
                if (!payload) {
                    healthAlerts.error("Patient detail missing please verify before proceeding.", "Error");
                    return;
                }

                if (isEdit) {
                    await updatePatient({ id, body: payload }).unwrap();
                    healthAlerts.success("Patient Updated Successfully", "Patient Updated");
                    navigate("/patient-list");
                } else {
                    await createPatient(payload).unwrap();
                    healthAlerts.success("Patient Data Saved Successfully", "Patient Saved");
                    handleReset();
                }
            } catch (err) {
                error.message("Submit error:", err);
                healthAlerts.error(err?.data?.message || "Operation failed", "Patient");
            }
        },
    });
    useEffect(() => {
        if (!id) {
            formik.resetForm();
            setCountryId("");
            setStateId("");
        }
    }, [id]);

    useEffect(() => {
        if (isEdit && patientApiResponse) {
            const p = patientApiResponse.data || patientApiResponse;
            const loadDiseases = async () => {
                let formattedDiseases = [];

                if (p.disease_ids?.length) {
                    try {
                        const res = await searchDiseases({ q: "" }).unwrap();

                        const diseaseList = res?.data || [];

                        formattedDiseases = diseaseList
                            .filter(d => p.disease_ids?.includes(d.id))
                            .map(d => ({
                                id: d.id,
                                name: d.name
                            })) || [];

                    } catch (error) {
                    }
                }

                formik.setValues({
                    title: p.title || "",
                    name: p.name || "",
                    dob: p.dateOfBirthOrAge?.split("T")[0] || "",
                    age: p.age ? `${p.age}y ${p.imonth || 0}m ${p.idays || 0}d` : "",
                    CO: p.co || "",
                    relationship: p.relationship || "",
                    gender: p.gender || "",
                    contactNumber: p.contactNumber || "",
                    residentialstatus: p.residentialstatus || "",
                    fincat: p.category || "",
                    country: String(p.country_id || ""),
                    localAddressState: String(p.state_id || ""),
                    localAddressDistrict: String(p.district_id || ""),
                    occupation: p.occupation || "",
                    healthCardNumber: p.healthCardNumber || "",
                    localAddress: p.localAddress || "",
                    pin: p.pin || "",
                    emergencyContactName: p.emergencyContactName || "",
                    emergencyContactNumber: p.emergencyContactNumber || "",
                    blood_group: p.blood_group || "",
                    diseases: formattedDiseases,
                    creditamount: p.creditamount || 0,
                    idProof_number: p.idProof_number || "",
                    idProof_name: p.idProof_name || "",
                });
            };


            loadDiseases();
            // Update local state to trigger address dropdowns
            setCountryId(p.country_id || "");
            setStateId(p.state_id || "");
        }
    }, [patientApiResponse, isEdit]);

    const buildPayload = (values) => {
        if (!values) return null;
        const ageValue = values?.age?.split(" ") ?? [];
        const iage = parseInt(ageValue[0], 10) || 0;
        const imonth = parseInt(ageValue[1], 10) || 0;
        const iday = parseInt(ageValue[2], 10) || 0;

        const disease_ids = values?.diseases.map(d => d.id) || [];

        const payload = {
            name: values.name,
            healthCardNumber: values.healthCardNumber,
            gender: values.gender,
            localAddress: values.localAddress,
            contactNumber: values.contactNumber,
            emergencyContactName: values.emergencyContactName,
            emergencyContactNumber: values.emergencyContactNumber,
            idProof_number: values.idProof_number,
            dateOfBirthOrAge: values.dob,
            idProof_name: values.idProof_name,
            blood_group: values.blood_group,
            age: iage,
            comingFromWebsite: 'B2B',
            pin: values.pin,
            iage: iage,
            idays: iday,
            imonth: imonth,
            disease_ids: disease_ids,
            country_id: Number(values.country),
            state_id: Number(values.localAddressState),
            district_id: Number(values.localAddressDistrict),
            category: values.fincat,
            occupation: values.occupation,
            residentialstatus: values.residentialstatus,
            title: values.title,
            co: values.CO,
            relationship: values.relationship
        };

        if (!isEdit) {
            payload.createdBy = "88";
        }

        return payload;
    };

    const handleReset = () => {
        formik.resetForm();
        setCountryId("");
        setStateId("");
    };

    const handleDOBChange = (e) => {
        const dob = e.target.value;
        formik.setFieldValue("dob", dob);
        if (!dob) {
            formik.setFieldValue("age", "");
            return;
        }
        const birth = new Date(dob);
        const today = new Date();
        let years = today.getFullYear() - birth.getFullYear();
        let months = today.getMonth() - birth.getMonth();
        let days = today.getDate() - birth.getDate();
        if (days < 0) {
            months -= 1;
            days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
        }
        if (months < 0) {
            years -= 1;
            months += 12;
        }
        formik.setFieldValue("age", `${years}y ${months}m ${days}d`);
    };

    if (isEdit && isFetching) {
        return <div className="text-center mt-10 font-bold text-sky-700">Loading Patient Data...</div>;
    }

    return (

        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 py-10">
          <div className="max-w-6xl mx-auto">

  {/* Header */}
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
                                className={`h-2 w-12 rounded-full ${activeStep >= s ? "bg-blue-600" : "bg-gray-200"
                                    }`}
                            />
                        ))}
                    </div>

                </div>
                    <div className="bg-white rounded-3xl shadow-xl shadow-blue-100 border border-gray-100 overflow-hidden">

                <div className="flex border-b mb-6">

                    {[
                        { id: 1, label: "Basic", icon: UserIcon },
                        { id: 2, label: "Address", icon: MapPinIcon },
                        { id: 3, label: "Emergency", icon: HeartIcon },
                        { id: 4, label: "Confirm", icon: DocumentCheckIcon }

                    ].map((step) => (

                        <button
                            key={step.id}
                            type="button"
                            onClick={() => setActiveStep(step.id)}
                            className={`flex-1 py-4 flex items-center justify-center gap-2
${activeStep === step.id
                                    ? "bg-white text-blue-600 shadow"
                                    : "text-gray-400"}`}
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
                                        value={formik.values.age}
                                        readOnly
                                        className="bg-sky-50 text-gray-600 cursor-not-allowed"
                                    />

                                    <Input
                                        {...formik.getFieldProps("CO")}
                                        label="C/O"
                                        required
                                        error={formik.touched.CO && formik.errors.CO} />

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
                                        label="Contact Number"
                                        required
                                        type="tel"
                                        inputMode="numeric"
                                        maxLength={10}
                                        value={formik.values.contactNumber}
                                        onChange={(e) => {
                                            const onlyNumbers = e.target.value.replace(/[^0-9]/g, "");
                                            formik.setFieldValue("contactNumber", onlyNumbers);
                                        }}
                                        error={formik.touched.contactNumber && formik.errors.contactNumber}
                                    />

                                </div>
                            </section>
                        )}
                        {activeStep === 2 && (
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

                                    <Select
                                        label="Country"
                                        required
                                        {...formik.getFieldProps("country")}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            formik.setFieldValue("country", value);
                                            setCountryId(value);
                                            setStateId("");
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
                                        {...formik.getFieldProps("localAddressState")}
                                        disabled={!formik.values.country}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            formik.setFieldValue("localAddressState", value);
                                            setStateId(value);
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
                                        {...formik.getFieldProps("localAddressDistrict")}
                                        disabled={!formik.values.localAddressState}
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
                        )}
                        {activeStep === 3 && (
                            <section>
                                <h3 className="text-lg font-semibold text-sky-700 mb-3 flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span> Emergency Details
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <Input {...formik.getFieldProps("emergencyContactName")} label="Emergency Contact Name" />
                                    <Input
                                        label="Emergency Contact Number"
                                        type="tel"
                                        inputMode="numeric"
                                        maxLength={10}
                                        value={formik.values.emergencyContactNumber}
                                        onChange={(e) => {
                                            const onlyNumbers = e.target.value.replace(/[^0-9]/g, "");
                                            formik.setFieldValue("emergencyContactNumber", onlyNumbers);
                                        }}
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

                                    <Select {...formik.getFieldProps("idProof_name")} label="Identification Type" required>
                                        <option value="">Select</option>
                                        {IDENTIFICATION_TYPES.map((b) => (
                                            <option key={b.value} value={b.value}>{b.label}</option>
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
                        )}
                        {activeStep === 4 && (

                            <div className="bg-gray-50 p-6 rounded-lg">

                                <h3 className="text-lg font-semibold">
                                    Confirm Patient Registration
                                </h3>

                                <p>Name : {formik.values.name}</p>
                                <p>Mobile : {formik.values.contactNumber}</p>
                                <p>Category : {formik.values.fincat}</p>
                                <section>
                                    <h3 className="text-lg font-semibold text-sky-700 mb-3 flex items-center gap-2">
                                        <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span> Payment Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <Input {...formik.getFieldProps("creditamount")} label="Credit Amount" disabled />
                                    </div>
                                </section>
                            </div>
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
                                <Button type="submit" variant="sky">
                                    <CheckCircleIcon className="w-5 h-5 inline mr-1" />
                                    {isEdit ? "Update" : "Save"}
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

            export default PatientRegistrationCopy;