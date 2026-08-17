// import React, { useState } from "react";
// import { Button, Col, Form, Input, Row, Modal, Radio } from "antd";
// import { useLoginMutation } from "../redux/apiSlice";
// import { healthAlert } from "../utils/healthSwal";
// import { useNavigate } from "react-router-dom";
// import { setCredentials } from "../redux/authSlice";
// import { useDispatch } from "react-redux";
// import { cookie } from "../utils/cookie";
// const Login = () => {
//   const [form] = Form.useForm();
//   const [deleteForm] = Form.useForm();
//   const [deleteModalVisible, setDeleteModalVisible] = useState(false);
//   const [deleteLoading, setDeleteLoading] = useState(false);
//   const [searchType, setSearchType] = useState("email");
//   const navigate = useNavigate();
//   const [login] = useLoginMutation();
//   const dispatch = useDispatch();

//   const onLoginFinish = async (values) => {
//     try {
//       values.email = values.email?.trim();
//       const data = await login(values).unwrap();
//       dispatch(setCredentials(data));
//       // navigate("/");
//       const role = data?.data?.role;
//       const tenantType = data?.data?.tenantType;
//       let redirectPath = "/dashboard";

//       if (role === "LMC_ADMIN") {
//         redirectPath = "/dashboard";
//       } else if (tenantType === "ohc") {
//         redirectPath = "/ohc-dashboard";
//       } else if (tenantType === "company") {
//         redirectPath = "/dashboard";
//       }

//       window.location.href = redirectPath;
//     } catch (error) {
//       healthAlert({
//         icon: "error",
//         title: "Login Failed",
//         text: error?.data?.message || "An error occurred during login.",
//       });
//     }
//   };

//   return (
//     <div className="login-container">
//       <style>{`
//         * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto; }

//         .login-container {
//           min-height: 100vh;
//           background: #fff;
//         }

//         .min-height-100-vh {
//           min-height: 100vh;
//         }

//         .login-bg {
//           height: 100vh;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           background: linear-gradient(180deg, #c7dbf5 0%, #e6f0fb 100%);
//         }

//         .img-responsive {
//           max-width: 82%;
//           height: auto;
//         }

//         .login-box {
//           height: 100vh;
//           display: flex;
//           justify-content: center;
//           align-items: center;
//         }

//         .logo {
//           text-align: center;
//           margin-bottom: 30px;
//         }

//         .logo img {
//           width: 240px;
//         }

//         .ant-form-item-label > label::before {
//           display: none !important;
//         }

//         .custom-label {
//           font-size: 15px;
//           font-weight: 500;
//           color: #222;
//           display: inline-flex;
//           align-items: center;
//           gap: 4px;
//         }

//         .required-star {
//           color: #ff4d4f;
//           font-size: 14px;
//           line-height: 1;
//         }

//         .ant-input,
//         .ant-input-affix-wrapper {
//           height: 42px;
//           border-radius: 6px;
//           font-size: 15px;
//           display: flex;
//           align-items: center;
//         }

//         .ant-input-password input {
//           line-height: 42px;
//         }

//         .ant-input-affix-wrapper input {
//           height: 42px;
//         }

//         .login-btn {
//           height: 44px;
//           font-size: 16px;
//           font-weight: 600;
//         }

//         @media (max-width: 768px) {
//           .login-bg {
//             height: 45vh;
//           }
//           .login-box {
//             height: auto;
//             padding: 30px 0;
//           }
//         }
//       `}</style>

//       <Row className="min-height-100-vh">
//         <Col md={16} xs={24}>
//           <div className="login-bg">
//             <img
//               src="/images/secure-login.png"
//               className="img-responsive"
//               alt="login"
//             />
//           </div>
//         </Col>

//         <Col md={8} xs={24}>
//           <div className="login-box">
//             <Col md={18} xs={22}>
//               <div className="logo">
//                 <img src="/images/LMC_logo.webp" alt="logo" />
//               </div>

//               <Form form={form} layout="vertical" onFinish={onLoginFinish}>
//                 <Form.Item
//                   label={
//                     <span className="custom-label">
//                       Email <span className="required-star">*</span>
//                     </span>
//                   }
//                   name="email"
//                   rules={[{ required: true, message: "Email is required" }]}
//                 >
//                   <Input />
//                 </Form.Item>

//                 <Form.Item
//                   label={
//                     <span className="custom-label">
//                       Password <span className="required-star">*</span>
//                     </span>
//                   }
//                   name="password"
//                   rules={[{ required: true, message: "Password is required" }]}
//                 >
//                   <Input.Password />
//                 </Form.Item>

//                 <Form.Item>
//                   <Button
//                     type="primary"
//                     htmlType="submit"
//                     block
//                     className="login-btn"
//                   >
//                     Sign In
//                   </Button>
//                 </Form.Item>
//               </Form>

//               <div style={{ textAlign: "center", marginTop: 14 }}>
//                 <Button
//                   type="link"
//                   danger
//                   onClick={() => setDeleteModalVisible(true)}
//                   style={{ padding: 0 }}
//                 >
//                   Delete Account
//                 </Button>
//               </div>
//             </Col>
//           </div>
//         </Col>
//       </Row>

//       <Modal
//         title="Delete Account"
//         open={deleteModalVisible}
//         footer={null}
//         centered
//         onCancel={() => {
//           setDeleteModalVisible(false);
//           deleteForm.resetFields();
//         }}
//       >
//         <Form
//           form={deleteForm}
//           layout="vertical"
//           onFinish={() => setDeleteLoading(false)}
//         >
//           <Form.Item label="Search by">
//             <Radio.Group
//               value={searchType}
//               onChange={(e) => setSearchType(e.target.value)}
//             >
//               <Radio value="email">Email</Radio>
//               <Radio value="phone">Phone Number</Radio>
//             </Radio.Group>
//           </Form.Item>

//           <Form.Item
//             label={searchType === "email" ? "Email" : "Phone Number"}
//             name="emailOrPhone"
//             rules={[{ required: true }]}
//           >
//             <Input />
//           </Form.Item>

//           <Form.Item>
//             <Button
//               type="primary"
//               danger
//               block
//               loading={deleteLoading}
//               htmlType="submit"
//             >
//               Delete Account
//             </Button>
//           </Form.Item>
//         </Form>
//       </Modal>
//     </div>
//   );
// };

// export default Login;
import React, { useState } from "react";
import { Button, Col, Form, Input, Row, Modal, Radio } from "antd";
import {
  MailOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  UserDeleteOutlined,
} from "@ant-design/icons";
import { useLoginMutation } from "../redux/apiSlice";
import { healthAlert } from "../utils/healthSwal";
import { useNavigate } from "react-router-dom";
import { setCredentials } from "../redux/authSlice";
import { useDispatch } from "react-redux";
import { cookie } from "../utils/cookie";

const Login = () => {
  const [form] = Form.useForm();
  const [deleteForm] = Form.useForm();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchType, setSearchType] = useState("email");
  const navigate = useNavigate();
  const [login, { isLoading: signingIn }] = useLoginMutation();
  const dispatch = useDispatch();

  const onLoginFinish = async (values) => {
    try {
      values.email = values.email?.trim();
      const data = await login(values).unwrap();
      dispatch(setCredentials(data));
      // navigate("/");
      const role = data?.data?.role;
      const tenantType = data?.data?.tenantType;
      let redirectPath = "/dashboard";

      if (role === "LMC_ADMIN") {
        redirectPath = "/dashboard";
      } else if (tenantType === "ohc") {
        redirectPath = "/ohc-dashboard";
      } else if (tenantType === "company") {
        redirectPath = "/dashboard";
      }

      window.location.href = redirectPath;
    } catch (error) {
      healthAlert({
        icon: "error",
        title: "Login Failed",
        text: error?.data?.message || "An error occurred during login.",
      });
    }
  };

  return (
    <div className="login-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap');

        * { box-sizing: border-box; }

        .login-container {
          min-height: 100vh;
          background: linear-gradient(165deg, #EAF6F2 0%, #FBFEFD 55%);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .min-height-100-vh { min-height: 100vh; }

        /* ---------- Left panel: brand / signature ---------- */
        .brand-panel {
          height: 100vh;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px 56px;
          background: linear-gradient(160deg, #0A3532 0%, #0E5C55 55%, #147A6E 100%);
          color: #EAF6F2;
        }

        .brand-panel::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px);
          background-size: 22px 22px;
          pointer-events: none;
        }

        .brand-mark {
          display: flex;
          align-items: center;
          gap: 10px;
          position: relative;
          z-index: 1;
        }

        .brand-mark img {
          width: 52px;
          height: 52px;
          border-radius: 10px;
          background: rgba(255,255,255,0.9);
          padding: 6px;
          object-fit: contain;
        }

        .brand-mark span {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #BFE6DB;
          display: block;
        }

        .brand-tagline {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-style: italic;
          color: #8FCABB;
          margin: 3px 0 0;
          letter-spacing: 0.01em;
        }

        .brand-hero {
          position: relative;
          z-index: 1;
          max-width: 420px;
        }

        .brand-hero h1 {
          font-family: 'Fraunces', serif;
          font-weight: 500;
          font-size: 40px;
          line-height: 1.18;
          margin: 0 0 14px;
          color: #FFFFFF;
        }

        .brand-hero p {
          font-size: 15px;
          line-height: 1.6;
          color: #C7E7DE;
          margin: 0;
        }

        .pulse-wrap {
          position: relative;
          z-index: 1;
          margin-top: 36px;
        }

        .pulse-wrap svg {
          width: 100%;
          height: auto;
          display: block;
        }

        .pulse-line {
          fill: none;
          stroke: #6FE0C6;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 6 420;
          stroke-dashoffset: 0;
          animation: travel 3.4s linear infinite;
          filter: drop-shadow(0 0 6px rgba(111, 224, 198, 0.55));
        }

        .pulse-track {
          fill: none;
          stroke: rgba(255,255,255,0.14);
          stroke-width: 1.5;
        }

        @keyframes travel {
          0% { stroke-dashoffset: 426; }
          100% { stroke-dashoffset: 0; }
        }

        .status-row {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11.5px;
          letter-spacing: 0.04em;
          color: #A9DACC;
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #6FE0C6;
          box-shadow: 0 0 0 0 rgba(111,224,198,0.6);
          animation: dotpulse 2s ease-out infinite;
        }

        @keyframes dotpulse {
          0% { box-shadow: 0 0 0 0 rgba(111,224,198,0.55); }
          70% { box-shadow: 0 0 0 8px rgba(111,224,198,0); }
          100% { box-shadow: 0 0 0 0 rgba(111,224,198,0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .pulse-line, .status-dot { animation: none; }
        }

        /* ---------- Right panel: form ---------- */
        .form-panel {
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 24px;
        }

        .form-card {
          width: 100%;
          max-width: 380px;
          animation: rise 0.5s ease-out;
        }

        @keyframes rise {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .form-card { animation: none; }
        }

        .form-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #0E6E63;
          background: #E3F3EF;
          border-radius: 100px;
          padding: 5px 12px;
          margin-bottom: 20px;
        }

        .form-heading h2 {
          font-family: 'Fraunces', serif;
          font-weight: 500;
          font-size: 28px;
          margin: 0 0 6px;
          color: #0B2B27;
        }

        .form-heading p {
          font-size: 14px;
          color: #6B7C79;
          margin: 0 0 30px;
        }

        .custom-label {
          font-size: 13.5px;
          font-weight: 600;
          color: #2C3E3B;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          letter-spacing: 0.01em;
        }

        .required-star {
          color: #D64545;
          font-size: 13px;
          line-height: 1;
        }

        .ant-form-item-label > label::before { display: none !important; }

        .ant-form-item-label > label {
          height: auto;
          margin-bottom: 2px;
        }

        .field-wrap {
          position: relative;
        }

        .ant-input,
        .ant-input-affix-wrapper {
          height: 46px;
          border-radius: 8px;
          font-size: 14.5px;
          background: #F6FAF9;
          border: 1.5px solid #E3ECE9;
          transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
        }

        .ant-input::placeholder { color: #A6B4B1; }

        .ant-input-affix-wrapper input { height: 44px; background: transparent; }

        .ant-input:hover,
        .ant-input-affix-wrapper:hover {
          border-color: #B9D6CE !important;
        }

        .ant-input:focus,
        .ant-input-affix-wrapper-focused {
          background: #FFFFFF !important;
          border-color: #0E6E63 !important;
          box-shadow: 0 0 0 4px rgba(14,110,99,0.10) !important;
        }

        .ant-input-affix-wrapper .anticon,
        .ant-input-prefix .anticon {
          transition: color 0.18s ease;
        }

        .ant-input-affix-wrapper-focused .anticon {
          color: #0E6E63 !important;
        }

        .ant-input-password-icon {
          color: #A6B4B1 !important;
          transition: color 0.15s ease;
        }

        .ant-input-password-icon:hover {
          color: #0E6E63 !important;
        }

        .ant-form-item-explain-error {
          font-size: 12.5px;
          margin-top: 4px;
          color: #D64545;
        }

        .login-btn {
          height: 46px;
          font-size: 15px;
          font-weight: 600;
          border-radius: 8px;
          background: linear-gradient(135deg, #0E6E63 0%, #0B5951 100%);
          border-color: #0B5951;
          letter-spacing: 0.01em;
          box-shadow: 0 1px 2px rgba(11,89,81,0.16), 0 6px 16px rgba(11,89,81,0.14);
          transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
        }

        .login-btn:hover {
          filter: brightness(1.06);
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(11,89,81,0.18), 0 10px 22px rgba(11,89,81,0.18);
        }

        .login-btn:active {
          transform: translateY(0);
          filter: brightness(0.98);
          box-shadow: 0 1px 2px rgba(11,89,81,0.18);
        }

        .login-btn:focus-visible {
          outline: 2px solid #0E6E63;
          outline-offset: 2px;
        }

        .form-footer {
          margin-top: 18px;
          padding-top: 18px;
          border-top: 1px solid #EAF0EE;
          text-align: center;
        }

        .form-footer-link {
          font-size: 13px;
          color: #8A9793;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .form-footer-link:hover { color: #D64545; }

        @media (max-width: 768px) {
          .brand-panel { height: 38vh; padding: 32px 28px; }
          .brand-hero h1 { font-size: 28px; }
          .brand-hero p { display: none; }
          .pulse-wrap { margin-top: 20px; }
          .form-panel { height: auto; padding: 32px 20px; }
        }
      `}</style>

      <Row className="min-height-100-vh">
        <Col md={13} xs={24}>
          <div className="brand-panel">
            <div className="brand-mark">
              <img src="/images/LMC_logo.webp" alt="Last Mile Care logo" />
              <div>
                <span>Last Mile Care</span>
                <p className="brand-tagline">
                  Built for the workers between employers.
                </p>
              </div>
            </div>

            <div className="brand-hero">
              <h1>Every patient's&nbsp;record, one clear line.</h1>
              <p>
                OPD scheduling, registration, and clinical records in a single
                secure system built for how your hospital actually runs.
              </p>

              <div className="pulse-wrap">
                <svg viewBox="0 0 420 90" preserveAspectRatio="none">
                  <path
                    className="pulse-track"
                    d="M0 45 H130 L150 45 L162 15 L178 75 L190 45 H420"
                  />
                  <path
                    className="pulse-line"
                    d="M0 45 H130 L150 45 L162 15 L178 75 L190 45 H420"
                  />
                </svg>
              </div>
            </div>

            <div className="status-row">
              <span className="status-dot" />
              <span>
                OPD · REGISTRATION · RECORDS &nbsp;—&nbsp; ALL SYSTEMS
                OPERATIONAL
              </span>
            </div>
          </div>
        </Col>

        <Col md={11} xs={24}>
          <div className="form-panel">
            <div className="form-card">
              <div className="form-eyebrow">
                <SafetyCertificateOutlined />
                Secure hospital access
              </div>

              <div className="form-heading">
                <h2>Welcome back</h2>
                <p>Sign in to continue to your dashboard.</p>
              </div>

              <Form form={form} layout="vertical" onFinish={onLoginFinish}>
                <Form.Item
                  label={
                    <span className="custom-label">
                      Email <span className="required-star">*</span>
                    </span>
                  }
                  name="email"
                  rules={[{ required: true, message: "Email is required" }]}
                >
                  <Input
                    prefix={<MailOutlined style={{ color: "#8A9793" }} />}
                    placeholder="you@hospital.com"
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="custom-label">
                      Password <span className="required-star">*</span>
                    </span>
                  }
                  name="password"
                  rules={[{ required: true, message: "Password is required" }]}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: "#8A9793" }} />}
                    placeholder="••••••••"
                  />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    className="login-btn"
                    loading={signingIn}
                  >
                    {signingIn ? "Signing in" : "Sign In"}
                  </Button>
                </Form.Item>
              </Form>

              <div className="form-footer">
                <Button
                  type="link"
                  className="form-footer-link"
                  onClick={() => setDeleteModalVisible(true)}
                >
                  <UserDeleteOutlined />
                  Manage account access
                </Button>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <Modal
        title="Delete Account"
        open={deleteModalVisible}
        footer={null}
        centered
        onCancel={() => {
          setDeleteModalVisible(false);
          deleteForm.resetFields();
        }}
      >
        <Form
          form={deleteForm}
          layout="vertical"
          onFinish={() => setDeleteLoading(false)}
        >
          <Form.Item label="Search by">
            <Radio.Group
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
            >
              <Radio value="email">Email</Radio>
              <Radio value="phone">Phone Number</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label={searchType === "email" ? "Email" : "Phone Number"}
            name="emailOrPhone"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              danger
              block
              loading={deleteLoading}
              htmlType="submit"
            >
              Delete Account
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Login;
