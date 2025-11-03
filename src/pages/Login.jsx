import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import CommonButton from "../components/CommonButton";
import { motion } from "framer-motion";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-teal-700 mb-6 text-center">Welcome Back 👨‍⚕️</h2>
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={LoginSchema}
          onSubmit={(values) => {
            console.log(values);
            navigate("/dashboard");
          }}
        >
          {() => (
            <Form className="space-y-5">
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

              <CommonButton type="submit">Login</CommonButton>

              <p className="text-sm text-center mt-4 text-gray-600">
                Don’t have an account?{" "}
                <Link to="/signup" className="text-teal-600 font-medium hover:underline">
                  Sign up
                </Link>
              </p>
            </Form>
          )}
        </Formik>
      </motion.div>
    </div>
  );
}
