import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import CommonButton from "../components/CommonButton";
import { motion } from "framer-motion";

const SignupSchema = Yup.object().shape({
  name: Yup.string().required("Full name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6, "At least 6 characters").required("Password is required"),
});

export default function Signup() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-teal-700 mb-6 text-center">Create Account 🏥</h2>
        <Formik
          initialValues={{ name: "", email: "", password: "" }}
          validationSchema={SignupSchema}
          onSubmit={(values) => {
            console.log(values);
            navigate("/login");
          }}
        >
          {() => (
            <Form className="space-y-5">
              <div>
                <label className="block mb-1 font-medium text-gray-700">Full Name</label>
                <Field
                  name="name"
                  type="text"
                  className="w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-teal-400 outline-none"
                />
                <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700">Email</label>
                <Field
                  name="email"
                  type="email"
                  className="w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-teal-400 outline-none"
                />
                <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700">Password</label>
                <Field
                  name="password"
                  type="password"
                  className="w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-teal-400 outline-none"
                />
                <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <CommonButton type="submit">Sign Up</CommonButton>

              <p className="text-sm text-center mt-4 text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="text-teal-600 font-medium hover:underline">
                  Login
                </Link>
              </p>
            </Form>
          )}
        </Formik>
      </motion.div>
    </div>
  );
}
