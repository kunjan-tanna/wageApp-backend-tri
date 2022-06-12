import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import {
  UncontrolledDropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Nav,
  Button,
  Input,
} from "reactstrap";
import PropTypes from "prop-types";
import Joi from "joi-browser";

import {
  validateSchema,
  formValueChangeHandler,
  apiCall,
  displayLog,
} from "../../utils/common";
import { AppNavbarBrand, AppSidebarToggler } from "@coreui/react";
import logo from "../../assets/oroom_logos/wage_web_logo.png";
// import sygnet from '../../assets/img/brand/sygnet.svg'
import oroomLogo from "../../assets/oroom_logos/wage_web_logo.png";
import Dialog from "./Dialog";

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class DefaultHeader extends Component {
  state = {
    isDialogOpen: false,
    form: {
      old_password: "",
      new_password: "",
      confirm_new_password: "",
    },
    error: {
      status: false,
      message: "",
    },
  };

  isDialogOpenHandler = (flag) => {
    this.resetChangeFormState();
    this.setState({ isDialogOpen: flag });
  };

  resetChangeFormState() {
    this.setState({
      isDialogOpen: false,
      form: {
        old_password: "",
        new_password: "",
        confirm_new_password: "",
      },
      error: {
        status: false,
        message: "",
      },
    });
  }

  submitClickHandler = async () => {
    let schema = Joi.object().keys({
      old_password: Joi.string()
        .strict()
        .trim()
        .min(6)
        .label("Old Password")
        .required(),
      new_password: Joi.string()
        .strict()
        .trim()
        .min(6)
        .label("New Password")
        .required(),
      confirm_new_password: Joi.string()
        .strict()
        .trim()
        .min(6)
        .label("Confirm Password")
        .required(),
    });
    this.setState({ error: await validateSchema(this.state.form, schema) });
    if (!this.state.error.status) {
      let data = {
        old_password: this.state.form.old_password,
        new_password: this.state.form.new_password,
        confirm_new_password: this.state.form.confirm_new_password,
        token: localStorage.getItem("WAGE_AUTH_TOKEN"),
      };
      const response = await apiCall("POST", "changePassword", data);
      displayLog(response.code, response.message);
      localStorage.removeItem("WAGE_AUTH_TOKEN");
      this.props.history.push(process.env.PUBLIC_URL + "/login");
      this.resetChangeFormState();
    } else {
      displayLog(0, this.state.error.message);
    }
  };
  inputChangeHandler = (e) => {
    this.setState({ form: formValueChangeHandler(e, this.state.form) });
  };
  render() {
    const { children, ...attributes } = this.props;
    return (
      <React.Fragment>
        <Dialog
          modalTitle="Change Password"
          modalBody={
            <form>
              <Input
                className="cp-dialog-input"
                type="password"
                name="old_password"
                id="old_password"
                value={this.state.form.old_password}
                onChange={this.inputChangeHandler}
                placeholder="Old Password"
              />
              <Input
                className="cp-dialog-input"
                type="password"
                name="new_password"
                id="new_password"
                value={this.state.form.new_password}
                onChange={this.inputChangeHandler}
                placeholder="New Password"
              />
              <Input
                className="cp-dialog-input"
                type="password"
                name="confirm_new_password"
                id="confirm_new_password"
                value={this.state.form.confirm_new_password}
                onChange={this.inputChangeHandler}
                placeholder="Confirm Password"
              />
            </form>
          }
          modalFooter={
            <React.Fragment>
              <Button color="primary" onClick={this.submitClickHandler}>
                Submit
              </Button>{" "}
              <Button
                color="secondary"
                onClick={() => this.isDialogOpenHandler(false)}
              >
                Cancel
              </Button>
            </React.Fragment>
          }
          isModalOpen={this.state.isDialogOpen}
          toggle={this.isDialogOpenHandler}
        />
        <AppSidebarToggler className="d-lg-none" display="md" mobile />
        <AppNavbarBrand
          full={{ src: logo, width: 89, height: 35, alt: "Wage Logo" }}
          minimized={{
            src: oroomLogo,
            width: 35,
            height: 35,
            alt: "Wage Logo",
          }}
        />
        <AppSidebarToggler className="d-md-down-none" display="lg" />
        <Nav className="ml-auto" navbar>
          <span>Hello Admin</span>
          {/* <NavItem className="d-md-down-none">
            <NavLink to="#" className="nav-link"><i className="icon-bell"></i><Badge pill color="danger">5</Badge></NavLink>
          </NavItem> */}
          <UncontrolledDropdown nav direction="down">
            <DropdownToggle nav>
              <i className="icon-arrow-down"></i>
              {/* <img src={'../../assets/img/avatars/6.jpg'} className="img-avatar" alt="admin@bootstrapmaster.com" /> */}
            </DropdownToggle>
            <DropdownMenu right>
              {/* <DropdownItem><i className="fa fa-user"></i> Profile</DropdownItem> */}
              <DropdownItem onClick={() => this.isDialogOpenHandler(true)}>
                <i className="fa fa-key"></i> Change Password
              </DropdownItem>
              {/* <DropdownItem><i className="fa fa-wrench"></i> Settings</DropdownItem> */}
              <DropdownItem onClick={(e) => this.props.onLogout(e)}>
                <i className="fa fa-lock"></i> Logout
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </Nav>
        {/*<AppAsideToggler className="d-lg-none" mobile />*/}
      </React.Fragment>
    );
  }
}

DefaultHeader.propTypes = propTypes;
DefaultHeader.defaultProps = defaultProps;

export default withRouter(DefaultHeader);
