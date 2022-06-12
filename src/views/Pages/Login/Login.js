import React, { Component } from "react";
import { Redirect, withRouter } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  CardGroup,
  Col,
  Container,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Row,
  Alert,
} from "reactstrap";
import Joi from "joi-browser";
import {
  validateSchema,
  formValueChangeHandler,
  apiCall,
  displayLog,
  encrypt,
  decrypt,
} from "../../../utils/common";
import config from "../../../utils/config";
import { connect } from "react-redux";
import * as actions from "../../../store/actions";
class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      form: {
        email: "",
        password: "",
      },
      error: {
        status: false,
        message: "",
      },
    };
  }

  loginHandler = async () => {
    let schema = Joi.object().keys({
      email: Joi.string().trim().regex(config.EMAIL_REGEX).email().required(),
      password: Joi.string().trim().min(6).required(),
    });
    this.setState({ error: await validateSchema(this.state.form, schema) });
    if (!this.state.error.status) {
      const response = await apiCall("POST", "login", this.state.form);
      displayLog(response.code, response.message);
      if (response.code === 1) {
        let encryptRes = encrypt(JSON.stringify(response));
        localStorage.setItem("WAGE", encryptRes);
      }
      localStorage.setItem("WAGE_AUTH_TOKEN", response.token);

      await this.props.onSetAdmin(response);
      console.log("\n\n ADMIN DATAAAA->", this.props.admin);
      this.props.history.push(process.env.PUBLIC_URL + "/");
    }
  };

  changeValuesHandler = (e) => {
    this.setState({ form: formValueChangeHandler(e, this.state.form) });
  };
  enterPressed = (event) => {
    var code = event.keyCode || event.which;
    if (code === 13) {
      //13 is the enter keycode
      this.loginHandler();
    }
  };
  redirectHandler = () => {
    this.props.history.push(process.env.PUBLIC_URL + "/forgotPassword");
  };
  render() {
    if (localStorage.getItem("WAGE_AUTH_TOKEN")) return <Redirect to="/" />;

    return (
      <div className="app flex-row align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md="6">
              {/* <img src={oroomLogo} className="oroom-logo-login" /> */}
              <CardGroup>
                <Card className="p-4">
                  <CardBody>
                    {/* <Form> */}
                    <h1>Login</h1>
                    <p className="text-muted">Sign In to your account</p>
                    {this.state.error.status ? (
                      <Alert color="danger">{this.state.error.message}</Alert>
                    ) : null}
                    <InputGroup className="mb-3">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="icon-user"></i>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input
                        type="text"
                        placeholder="Username"
                        autoComplete="username"
                        name="email"
                        value={this.state.form.email}
                        onChange={(e) => this.changeValuesHandler(e)}
                        onKeyPress={(e) => this.enterPressed(e)}
                      />
                    </InputGroup>
                    <InputGroup className="mb-4">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="icon-lock"></i>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        name="password"
                        value={this.state.form.password}
                        onChange={(e) => this.changeValuesHandler(e)}
                        onKeyPress={(e) => this.enterPressed(e)}
                      />
                    </InputGroup>
                    <Row>
                      <Col xs="6">
                        <Button
                          color="primary"
                          className="px-4"
                          onClick={() => this.loginHandler()}
                        >
                          Login
                        </Button>
                      </Col>
                      <Col xs="6" className="text-right">
                        <Button
                          color="link"
                          className="px-0"
                          onClick={() => this.redirectHandler()}
                        >
                          Forgot password?
                        </Button>
                      </Col>
                    </Row>
                    {/* </Form> */}
                  </CardBody>
                </Card>
              </CardGroup>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onSetAdmin: (reqData) => dispatch(actions.setAdminData(reqData)),
  };
};

const mapStateToProps = (state) => {
  return {
    loading: state.reducer.loading,
    redirect_to_login: state.reducer.redirect_to_login,
    admin: state.reducer.admin,
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Login));

// export default Login;
