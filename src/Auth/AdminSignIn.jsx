import React, { Fragment, useState, useContext } from "react";
import { Col, Container, Form, FormGroup, Input, Label, Row } from "reactstrap";
import { Btn, H4, P } from "../AbstractElements";
import { Password, SignIn } from "../Constant/indexmy";
import { useNavigate } from "react-router-dom";
import CustomizerContext from "../_helper/Customizer";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import logo from "../assets/images/logo/logo.png"

const AdminSignIn = ({ selected }) => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [togglePassword, setTogglePassword] = useState(false);
  const history = useNavigate();
  const { layoutURL } = useContext(CustomizerContext);

  const loginAuth = async (e) => {
    e.preventDefault();
    const deviceId = navigator.userAgent;

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/login/", {
        userId,
        password,
        deviceInfo: deviceId,
      });

      if (response.status === 200 && response.data.roleId === 1) {
        localStorage.setItem("login", JSON.stringify(true));
        localStorage.setItem("Name", response.data.name || userId);
        sessionStorage.setItem("staffId", response.data.staffId);
        sessionStorage.setItem("userType", "Admin");

        toast.success("Admin login successful!");
        history(`/admin-attendance/dashboard/`);
      } else {
        toast.error("Access denied: You're not an admin.");
      }
    } catch (error) {
      console.error("Login error", error);
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Login failed. Please try again.");
      }
    }
  };

  return (

    <Fragment>
      <Container fluid={true} className="p-0 login-page">
        <Row>
          <Col xs="12">
            <div className="login-card">
              <div className="login-main login-tab">
                <Form className="theme-form" onSubmit={loginAuth}>
                  <img
                    src={logo}
                    alt="logo-TF"
                    style={{
                      display: "block",
                      margin: "auto",
                      maxWidth: "150px",
                      width: "100%",
                      height: "auto",
                      objectFit: "contain",
                    }}
                  />
                  <H4
                    attrH4={{
                      style: {
                        fontSize: "1.5rem",
                        marginTop: "1.5rem",
                        marginBottom: "0.5rem",
                        textAlign: "center",
                      },
                    }}
                  >
                    {selected === "simpleLogin" ? "" : "Admin Sign In"}
                  </H4>
                  <P
                    attrPara={{
                      style: {
                        fontSize: "0.8rem",
                        marginBottom: "1rem",
                        textAlign: "center",
                      },
                    }}
                  >
                    Enter your user ID & password to login
                  </P>

                  <FormGroup>
                    <Label className="col-form-label">User ID</Label>
                    <Input
                      className="form-control"
                      type="text"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                    />
                  </FormGroup>

                  <FormGroup className="position-relative">
                    <Label className="col-form-label">{Password}</Label>
                    <div className="position-relative">
                      <Input
                        className="form-control"
                        type={togglePassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <div
                        className="show-hide"
                        onClick={() => setTogglePassword(!togglePassword)}
                      >
                        <span className={togglePassword ? "" : "show"}></span>
                      </div>
                    </div>
                  </FormGroup>

                  <div className="position-relative form-group mb-0">
                    <Btn
                      attrBtn={{
                        color: "primary",
                        className: "d-block w-100 mt-2",
                        type: "submit"
                      }}
                    >
                      {SignIn}
                    </Btn>
                    <p
                      style={{
                        textAlign: "center",
                        marginBottom: "5px",
                        marginTop: "15px",
                      }}
                    >
                      <a
                        href={`/time-force/login`}
                        style={{ textDecoration: "underline", color: "#007bff" }}
                      >
                        Go to Staff Panel
                      </a>
                    </p>
                  </div>
                </Form>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
      <ToastContainer />
    </Fragment>
  );
};

export default AdminSignIn;
