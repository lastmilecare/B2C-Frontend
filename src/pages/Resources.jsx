import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
    KeyIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    ShieldCheckIcon,
    DocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { useCreateResourceMutation } from "../redux/apiSlice";

import { healthAlert } from "../utils/healthSwal";
import { Input, Button } from "../components/FormControls";

const Resources = () => {
    const [activeStep, setActiveStep] = useState(1);
    const [createResource] = useCreateResourceMutation();
    const formik = useFormik({
        initialValues: {
            name: "",
            description: "",
        },
        validationSchema: Yup.object({
            name: Yup.string().required("Name is required"),
            description: Yup.string().required("Description is required"),
        }),
        onSubmit: async (values) => {
            try {
                const res = await createResource(values).unwrap();

                healthAlert({
                    title: "Success",
                    text: res.message || "Resource created successfully",
                    icon: "success",
                });

                formik.resetForm();
                setActiveStep(1);
            } catch (err) {
                healthAlert({
                    title: "Error",
                    text: err?.data?.message || "Something went wrong",
                    icon: "error",
                });
            }
        },
    });

    const nextStep = async () => {
        const errors = await formik.validateForm();

        if (errors.name || errors.description) {
            formik.setTouched({
                name: true,
                description: true,
            });
            return;
        }

        setActiveStep(2);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 py-10 px-4">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <span className="bg-blue-100 p-2 rounded-xl">
                            <KeyIcon className="w-6 text-blue-600" />
                        </span>
                        Resource
                    </h1>

                    {/* Step Indicator */}
                    <div className="flex gap-2">
                        {[1, 2].map((s) => (
                            <div
                                key={s}
                                className={`h-2 w-16 rounded-full ${activeStep >= s ? "bg-sky-600" : "bg-gray-200"
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-blue-100 border border-gray-100 overflow-hidden">

                    {/* Tabs */}
                    <div className="flex border-b">
                        <div
                            className={`flex-1 py-4 flex items-center justify-center gap-2 ${activeStep === 1 ? "text-sky-600 font-bold" : "text-gray-400"
                                }`}
                        >
                            <ShieldCheckIcon className="w-5 h-5" />
                            Create
                        </div>

                        <div
                            className={`flex-1 py-4 flex items-center justify-center gap-2 ${activeStep === 2 ? "text-sky-600 font-bold" : "text-gray-400"
                                }`}
                        >
                            <DocumentCheckIcon className="w-5 h-5" />
                            Confirm
                        </div>
                    </div>

                    {/* Form */}
                    <div className="p-10">
                        <form onSubmit={(e) => e.preventDefault()}>

                            {/* Step 1 */}
                            {activeStep === 1 && (
                                <section>
                                    <h3 className="text-lg font-semibold text-sky-700 mb-6 flex items-center gap-2">
                                        <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span>
                                        Resource Details
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            label="Name"
                                            {...formik.getFieldProps("name")}
                                            error={formik.touched.name && formik.errors.name}
                                        />

                                        <Input
                                            label="Description"
                                            {...formik.getFieldProps("description")}
                                            error={
                                                formik.touched.description &&
                                                formik.errors.description
                                            }
                                        />
                                    </div>
                                </section>
                            )}

                            {/* Step 2 */}
                            {activeStep === 2 && (
                                <section>
                                    <div className="bg-sky-50 p-8 rounded-3xl border border-sky-100 space-y-6">
                                        <h3 className="text-xl font-bold text-sky-800">
                                            Confirm Resource
                                        </h3>

                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="bg-white p-4 rounded-2xl shadow-sm">
                                                <p className="text-gray-500 font-medium">Name</p>
                                                <p className="text-lg font-bold text-slate-800 uppercase">
                                                    {formik.values.name}
                                                </p>
                                            </div>

                                            <div className="bg-white p-4 rounded-2xl shadow-sm">
                                                <p className="text-gray-500 font-medium">
                                                    Description
                                                </p>
                                                <p className="text-lg font-bold text-slate-800 uppercase">
                                                    {formik.values.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Buttons */}
                            <div className="flex justify-between pt-8 border-t border-slate-50">
                                <div className="flex gap-3">
                                    {activeStep > 1 && (
                                        <Button
                                            type="button"
                                            variant="gray"
                                            onClick={() => setActiveStep(1)}
                                        >
                                            Back
                                        </Button>
                                    )}

                                    <Button
                                        type="button"
                                        variant="gray"
                                        onClick={() => formik.resetForm()}
                                    >
                                        <ArrowPathIcon className="w-5 h-5 inline mr-1" />
                                        Reset
                                    </Button>
                                </div>

                                {activeStep === 1 ? (
                                    <Button type="button" variant="sky" onClick={nextStep}>
                                        Continue
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        variant="sky"
                                        onClick={formik.handleSubmit}
                                    >
                                        <CheckCircleIcon className="w-5 h-5 inline mr-1" />
                                        Save Resource
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

export default Resources;