import React, { useState } from "react";
import { Button, Col, Form, Input, Row, Modal, Radio } from "antd";
import { useLoginMutation } from "../redux/apiSlice";
import { healthAlert } from "../utils/healthSwal";
import { useNavigate } from "react-router-dom";
import { setCredentials } from "../redux/authSlice";
import { useDispatch } from "react-redux";
const Login = () => {
  const [form] = Form.useForm();
  const [deleteForm] = Form.useForm();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchType, setSearchType] = useState("email");

  const navigate = useNavigate();
  const [login] = useLoginMutation();
  const dispatch = useDispatch();

  const onLoginFinish = async (values) => {
    try {
      const data = await login(values).unwrap();
      debugger;
      dispatch(setCredentials(data));
      navigate("/patient-list");
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
        * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto; }

        .login-container {
          min-height: 100vh;
          background: #fff;
        }

        .min-height-100-vh {
          min-height: 100vh;
        }

        .login-bg {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(180deg, #c7dbf5 0%, #e6f0fb 100%);
        }

        .img-responsive {
          max-width: 82%;
          height: auto;
        }

        .login-box {
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .logo {
          text-align: center;
          margin-bottom: 30px;
        }

        .logo img {
          width: 240px;
        }

        .ant-form-item-label > label::before {
          display: none !important;
        }

        .custom-label {
          font-size: 15px;
          font-weight: 500;
          color: #222;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .required-star {
          color: #ff4d4f;
          font-size: 14px;
          line-height: 1;
        }

        .ant-input,
        .ant-input-affix-wrapper {
          height: 42px;
          border-radius: 6px;
          font-size: 15px;
          display: flex;
          align-items: center;
        }

        .ant-input-password input {
          line-height: 42px;
        }

        .ant-input-affix-wrapper input {
          height: 42px;
        }

        .login-btn {
          height: 44px;
          font-size: 16px;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .login-bg {
            height: 45vh;
          }
          .login-box {
            height: auto;
            padding: 30px 0;
          }
        }
      `}</style>

      <Row className="min-height-100-vh">
        <Col md={16} xs={24}>
          <div className="login-bg">
            <img
              src="/images/secure-login.png"
              className="img-responsive"
              alt="login"
            />
          </div>
        </Col>

        <Col md={8} xs={24}>
          <div className="login-box">
            <Col md={18} xs={22}>
              <div className="logo">
                <img src="/images/LMC_logo.webp" alt="logo" />
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
                  <Input />
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
                  <Input.Password />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    className="login-btn"
                  >
                    Sign In
                  </Button>
                </Form.Item>
              </Form>

              <div style={{ textAlign: "center", marginTop: 14 }}>
                <Button
                  type="link"
                  danger
                  onClick={() => setDeleteModalVisible(true)}
                  style={{ padding: 0 }}
                >
                  Delete Account
                </Button>
              </div>
            </Col>
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
