import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import FormField from "./FormField";
import CommonButton from "./CommonButton";
import { motion } from "framer-motion";

export default function CommonForm({
  title,
  subtitle,
  fields,
  initialValues,
  validationSchema,
  onSubmit,
  columns = 1,
  submitText = "Submit",
}) {
  const gridCols = columns === 2 ? "md:grid-cols-2" : "grid-cols-1";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-8"
    >
      {title && (
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-teal-700">{title}</h2>
          {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
        </div>
      )}

      <Formik
        initialValues={initialValues}
        validationSchema={Yup.object(validationSchema)}
        onSubmit={onSubmit}
      >
        <Form className={`grid ${gridCols} gap-6`}>
          {fields.map((field) => (
            <FormField key={field.name} field={field} />
          ))}
          <div className={`${columns === 2 ? "md:col-span-2" : ""} mt-4`}>
            <CommonButton type="submit">{submitText}</CommonButton>
          </div>
        </Form>
      </Formik>
    </motion.div>
  );
}
