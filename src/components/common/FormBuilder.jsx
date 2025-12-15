import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

const inputBase =
  "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none text-gray-800 text-sm";

const FormBuilder = ({
  fields,
  initialValues,
  validationSchema,
  onSubmit,
  layout = "vertical",
}) => {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={Yup.object(validationSchema)}
      onSubmit={(values, { resetForm }) => {
        toast.success("Form submitted successfully!");
        onSubmit(values);
        resetForm();
      }}
    >
      {({ setFieldValue, values }) => (
        <Form
          className={`${
            layout === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"
              : "space-y-4"
          }`}
        >
          {fields.map((field, idx) => {
            if (field.type === "section") {
              return (
                <div
                  key={`section-${idx}`}
                  className="col-span-full mt-8 mb-2"
                >
                  <h3 className="text-lg font-semibold text-sky-700 border-b border-sky-200 pb-2">
                    {field.label}
                  </h3>
                </div>
              );
            }
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.02 }}
                className={field.className || ""}
              >
                <label className="block mb-1 font-medium text-sky-800 text-sm">
                  {field.label}
                  {field.required && (
                    <span className="text-red-500">*</span>
                  )}
                </label>

                {field.type === "select" ? (
                  <Select
                    options={field.options.map((opt) => ({
                      value: opt,
                      label: opt,
                    }))}
                    value={
                      values[field.name]
                        ? {
                            value: values[field.name],
                            label: values[field.name],
                          }
                        : null
                    }
                    onChange={(val) =>
                      setFieldValue(field.name, val.value)
                    }
                    className="text-gray-800 text-sm"
                  />
                ) : field.type === "date" ? (
                  <DatePicker
                    selected={values[field.name]}
                    onChange={(date) =>
                      setFieldValue(field.name, date)
                    }
                    className={inputBase}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Select date"
                  />
                ) : field.type === "textarea" ? (
                  <Field
                    as="textarea"
                    rows={3}
                    name={field.name}
                    placeholder={field.placeholder || ""}
                    className={inputBase}
                  />
                ) : (
                  <Field
                    type={field.type}
                    name={field.name}
                    placeholder={field.placeholder || ""}
                    className={inputBase}
                  />
                )}

                <ErrorMessage
                  name={field.name}
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </motion.div>
            );
          })}

          {/* Submit Button */}
          <div className="col-span-full">
            <motion.button
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-sky-600 text-white px-6 py-2 rounded-lg font-semibold w-full md:w-auto shadow hover:bg-sky-700 transition-all"
            >
              Submit
            </motion.button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default FormBuilder;
