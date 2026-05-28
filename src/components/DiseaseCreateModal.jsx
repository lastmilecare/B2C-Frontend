import React from "react";
import { useCreateDiseaseMutation } from "../redux/apiSlice";
import { healthAlert } from "../utils/healthSwal";

const initialForm = {
    name: "",
    code: "",
    category: "",
    description: "",
};

const maxShortFieldLength = 255;

const DiseaseCreateModal = ({ isOpen, onClose, onCreated }) => {
    const [form, setForm] = React.useState(initialForm);
    const [errors, setErrors] = React.useState({});
    const [createDisease, { isLoading }] = useCreateDiseaseMutation();

    React.useEffect(() => {
        if (!isOpen) {
            setForm(initialForm);
            setErrors({});
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleClose = () => {
        if (isLoading) return;
        onClose();
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));
        setErrors((currentErrors) => ({
            ...currentErrors,
            [name]: "",
        }));
    };

    const validateForm = () => {
        const nextErrors = {};
        const trimmedForm = {
            name: form.name.trim(),
            code: form.code.trim(),
            category: form.category.trim(),
            description: form.description.trim(),
        };

        if (!trimmedForm.name) {
            nextErrors.name = "Disease name is required.";
        } else if (trimmedForm.name.length > maxShortFieldLength) {
            nextErrors.name = `Name cannot exceed ${maxShortFieldLength} characters.`;
        }

        if (!trimmedForm.code) {
            nextErrors.code = "Disease code is required.";
        } else if (trimmedForm.code.length > maxShortFieldLength) {
            nextErrors.code = `Code cannot exceed ${maxShortFieldLength} characters.`;
        }

        if (trimmedForm.category.length > maxShortFieldLength) {
            nextErrors.category = `Category cannot exceed ${maxShortFieldLength} characters.`;
        }

        setErrors(nextErrors);

        return {
            isValid: Object.keys(nextErrors).length === 0,
            trimmedForm,
        };
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        event.stopPropagation();

        const { isValid, trimmedForm } = validateForm();

        if (!isValid) return;

        const payload = {
            name: trimmedForm.name,
            code: trimmedForm.code,
            ...(trimmedForm.category ? { category: trimmedForm.category } : {}),
            ...(trimmedForm.description
                ? { description: trimmedForm.description }
                : {}),
        };

        try {
            const createdDisease = await createDisease(payload).unwrap();

            onCreated(createdDisease);
            healthAlert({
                title: "Disease",
                text: "Disease added successfully.",
                type: "success",
            });
            onClose();
        } catch (error) {
            const message =
                error?.data?.message ||
                error?.data?.error ||
                "Unable to add disease. Please try again.";

            healthAlert({
                title: "Disease",
                text: Array.isArray(message) ? message.join(", ") : message,
                type: "error",
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4">
            <div className="w-full max-w-lg rounded-lg bg-white shadow-2xl">
                <div className="border-b border-gray-100 px-5 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-semibold text-gray-900">
                                Add Disease
                            </h3>
                            <p className="mt-1 text-xs text-gray-500">
                                Name and code are required.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="cursor-pointer rounded-md px-2 py-1 text-xl leading-none text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={isLoading}
                            aria-label="Close add disease modal"
                        >
                            x
                        </button>
                    </div>
                </div>

                <div
                    className="space-y-4 px-5 py-5"
                    noValidate
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleInputChange}
                                className={`w-full rounded-lg border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 disabled:bg-gray-50 ${
                                    errors.name
                                        ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                                        : "border-gray-300 focus:border-sky-400 focus:ring-sky-100"
                                }`}
                                disabled={isLoading}
                                aria-invalid={Boolean(errors.name)}
                            />
                            {errors.name && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="code"
                                value={form.code}
                                onChange={handleInputChange}
                                className={`w-full rounded-lg border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 disabled:bg-gray-50 ${
                                    errors.code
                                        ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                                        : "border-gray-300 focus:border-sky-400 focus:ring-sky-100"
                                }`}
                                disabled={isLoading}
                                aria-invalid={Boolean(errors.code)}
                            />
                            {errors.code && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.code}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Category
                        </label>
                        <input
                            type="text"
                            name="category"
                            value={form.category}
                            onChange={handleInputChange}
                            className={`w-full rounded-lg border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 disabled:bg-gray-50 ${
                                errors.category
                                    ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                                    : "border-gray-300 focus:border-sky-400 focus:ring-sky-100"
                            }`}
                            disabled={isLoading}
                            aria-invalid={Boolean(errors.category)}
                        />
                        {errors.category && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.category}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100 disabled:bg-gray-50"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="cursor-pointer rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={isLoading}
                        >
                            {isLoading ? "Saving..." : "Save Disease"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiseaseCreateModal;
