import React from "react";
import { Field, ErrorMessage } from "formik";
import Select from "react-select";
import DatePicker from "react-datepicker";

export default function FormField({ field }) {
  const { name, label, type, options, placeholder } = field;

  return (
    <div className="flex flex-col gap-1">
      {type === "select" ? (
        <>
          <label className="font-medium text-gray-700">{label}</label>
          <Field name={name}>
            {({ form }) => (
              <Select
                options={options}
                onChange={(opt) => form.setFieldValue(name, opt?.value)}
                placeholder={placeholder || "Select..."}
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderRadius: "0.75rem",
                    borderColor: "#d1d5db",
                    boxShadow: "none",
                    "&:hover": { borderColor: "#14b8a6" },
                  }),
                }}
              />
            )}
          </Field>
        </>
      ) : type === "date" ? (
        <>
          <label className="font-medium text-gray-700">{label}</label>
          <Field name={name}>
            {({ form, field }) => (
              <DatePicker
                selected={field.value}
                onChange={(date) => form.setFieldValue(name, date)}
                className="w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-teal-400 outline-none"
              />
            )}
          </Field>
        </>
      ) : type === "checkbox" ? (
        <label className="flex items-center gap-2 text-gray-700">
          <Field
            name={name}
            type="checkbox"
            className="w-5 h-5 accent-teal-600 rounded"
          />
          {label}
        </label>
      ) : (
        <>
          <label className="font-medium text-gray-700">{label}</label>
          <Field
            name={name}
            type={type || "text"}
            placeholder={placeholder}
            className="w-full border rounded-xl px-3 py-2 transition-all focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none"
          />
        </>
      )}
      <ErrorMessage name={name} component="div" className="text-red-500 text-sm" />
    </div>
  );
}
