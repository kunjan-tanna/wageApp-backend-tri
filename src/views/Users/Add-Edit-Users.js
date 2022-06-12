import React, { Component } from "react";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Col,
  Row,
  FormGroup,
  Input,
  Label,
  Button,
  TabContent,
  TabPane,
  Table,
  Nav,
  NavItem,
  NavLink,
} from "reactstrap";
import {
  validateSchema,
  formValueChangeHandler,
  apiCall,
  displayLog,
  encrypt,
  decrypt,
  confirmBox,
} from "../../utils/common";
import Joi from "joi-browser";
import moment from "moment";
import classnames from "classnames";
import NumberFormat from "react-number-format";
import ReactPaginate from "react-paginate";

import "react-datetime/css/react-datetime.css";
import S3FileUpload from "react-s3";
import config from "../../utils/config";
import "react-responsive-modal/styles.css";
import { Modal } from "react-responsive-modal";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";

class AddEditCollection extends Component {
  state = {
    form: {
      FirstName: "",
      LastName: "",
      BusinessName: "",
      BusinessAddressCity: "",
      BusinessAddressStreet: "",
      BusinessPhoneNumber: "",
      BusinessWebAddress: "",
      Email: "",
      PhoneNumber: "",
      Zipcode: "",
      Note: "",
    },
    activeTab: "1",
    toggle: "1",
    setActiveTab: "1",
    pending_data: [],
    completed_data: [],
    page_no: 1,
    limit: 10,
    userType: "",
    image: "",
    photo: [],
    images: [],
    is_business: false,
    open: false,
    notes: "",
    reqData: {},
    admin_id: "",
    error: {
      status: false,
      message: "",
    },
  };

  //////////////FOR OFFER VIEW///////////////
  toggle = (tab) => {
    if (this.state.activeTab !== tab) {
      this.setState({ activeTab: tab, page_no: 1 }, () => this.getData());
    }
  };
  getData = async () => {
    let reqData = {
      user_id: this.props.match.params.userId,
      page_no: this.state.page_no,
      limit: this.state.limit,
    };
    const pendingRes = await apiCall("POST", "getPendingTask", reqData);
    const CompletedRes = await apiCall("POST", "getCompletedTask", reqData);

    // console.log("\n\n @@@@@getUserById", getUserById);
    this.setState({
      pending_data: pendingRes.data.data,
      completed_data: CompletedRes.data.data,

      total: pendingRes.data.total_offer,
    });
  };
  deletePendingOffer = async (data) => {
    let flag = await confirmBox(
      "Wage",
      "Are you sure you want to remove task??"
    );
    if (flag) {
      let res = await apiCall("POST", "removePendingOffer", {
        offer_id: data.Id,
      });
      displayLog(res.code, res.message);
      this.getData();
    }
  };
  editOffer = async (data) => {
    console.log("DATAA", data);
    let reqData = {
      isUser: true,
      userId: this.props.match.params.userId,
    };
    this.props.history.push({
      pathname: process.env.PUBLIC_URL + "/offers/edit/" + data.Id,
      state: reqData,
    });
  };
  duplicateOffer = async (data) => {
    let reqData = {
      isDuplicate: true,
      userdata: this.props.match.params.userId,
    };
    this.props.history.push({
      pathname: process.env.PUBLIC_URL + "/offers/edit/" + data.Id,
      state: reqData,
    });
  };
  deleteOffer = async (data) => {
    let flag = await confirmBox(
      "Wage",
      "Are you sure you want to remove task??"
    );
    if (flag) {
      let res = await apiCall("POST", "deleteOffer", { id: data.Id });
      displayLog(res.code, res.message);
      this.getData();
    }
  };
  handlePageClick = (e) => {
    this.setState({ page_no: e.selected + 1 }, () => {
      this.getData();
    });
  };
  //////////////FOR OFFER VIEW///////////////
  onOpenModal = () => {
    this.setState({ open: true });
  };
  onCloseModal = () => {
    this.setState({ open: false, notes: "" });
  };

  async componentDidMount() {
    let adminData = localStorage.getItem("WAGE");
    adminData = decrypt(adminData);
    adminData = JSON.parse(adminData);
    console.log("PROPS DAtA::::>>>", this.props.admin);
    if (window.location.pathname.includes("/business/edit") === true) {
      this.setState({ is_business: true });
    }
    if (this.props.match.params && this.props.match.params.userId) {
      let data = {
        id: this.props.match.params.userId,
      };
      const response = await apiCall("POST", "getUserById", data);
      console.log("response is-->>", response);
      let form = this.state.form;
      form.FirstName = response.data.FirstName ? response.data.FirstName : "";
      form.LastName = response.data.LastName ? response.data.LastName : "";
      form.BusinessName = response.data.BusinessName
        ? response.data.BusinessName
        : "";
      form.BusinessAddressCity = response.data.BusinessAddressCity
        ? response.data.BusinessAddressCity
        : "";
      form.BusinessAddressStreet = response.data.BusinessAddressStreet
        ? response.data.BusinessAddressStreet
        : "";
      form.BusinessPhoneNumber = response.data.BusinessPhoneNumber
        ? response.data.BusinessPhoneNumber
        : "";
      form.BusinessWebAddress = response.data.BusinessWebAddress
        ? response.data.BusinessWebAddress
        : "";
      form.Email = response.data.Email ? response.data.Email : "";
      form.PhoneNumber = response.data.PhoneNumber
        ? response.data.PhoneNumber
        : "";
      form.Zipcode = response.data.ZipCode ? response.data.ZipCode : "";
      form.Note = response.data.editedReason ? response.data.editedReason : "";

      this.setState({
        form,
        userType: response.data.AccountType,
        image: config.image_url + response.data.user_image,
        admin_id: adminData.id,
      });
    }
    this.getData();
  }

  submitHandler = async () => {
    let reqData = new FormData();
    if (this.props.match.params && this.props.match.params.userId) {
      for (let index = 0; index < this.state.photo.length; index++) {
        const photo = this.state.photo[index];
        reqData.append("image", photo);
      }
    }
    let formData = {};
    formData.Id = this.props.match.params.userId.trim();
    formData.FirstName = this.state.form.FirstName.trim();
    formData.LastName = this.state.form.LastName.trim();
    formData.BusinessName = this.state.form.BusinessName.trim();
    formData.BusinessAddressCity = this.state.form.BusinessAddressCity.trim();
    formData.BusinessAddressStreet =
      this.state.form.BusinessAddressStreet.trim();
    formData.BusinessPhoneNumber = this.state.form.BusinessPhoneNumber.trim();
    formData.BusinessWebAddress = this.state.form.BusinessWebAddress.trim();
    formData.Email = this.state.form.Email.trim();
    formData.PhoneNumber = this.state.form.PhoneNumber;
    formData.type = this.state.userType;
    formData.Zipcode = this.state.form.Zipcode;
    formData.Note = this.state.form.Note;

    if (this.props.match.params && this.props.match.params.userId) {
      //EDIT
      reqData.append("Id", this.props.match.params.userId.trim());
      reqData.append("FirstName", this.state.form.FirstName.trim());
      reqData.append("LastName", this.state.form.LastName.trim());
      reqData.append("BusinessName", this.state.form.BusinessName.trim());
      reqData.append(
        "BusinessAddressCity",
        this.state.form.BusinessAddressCity.trim()
      );
      reqData.append(
        "BusinessAddressStreet",
        this.state.form.BusinessAddressStreet.trim()
      );
      reqData.append(
        "BusinessPhoneNumber",
        this.state.form.BusinessPhoneNumber.trim()
      );
      reqData.append(
        "BusinessWebAddress",
        this.state.form.BusinessWebAddress.trim()
      );
      reqData.append("Email", this.state.form.Email.trim());
      reqData.append("PhoneNumber", this.state.form.PhoneNumber.trim());
      reqData.append("Zipcode", this.state.form.Zipcode);
      reqData.append("type", this.state.userType);
      reqData.append("Note", this.state.form.Note);
      await this.editUser(formData, reqData);
    }
  };
  editUser = async (form, reqData) => {
    console.log("\n\n\n FORM--->>>", form);
    let schema = Joi.object().keys({
      Id: Joi.string().strict().required(),
      FirstName: Joi.string().strict().label("First Name").required(),
      LastName: Joi.string().strict().label("Last Name").required(),
      type: Joi.number().label("Account Type").required(),
      BusinessName: Joi.string().strict().allow(""),
      BusinessAddressCity: Joi.string().allow(""),
      BusinessAddressStreet: Joi.string().allow(""),
      BusinessPhoneNumber: Joi.number().allow(""),
      BusinessWebAddress: Joi.string().allow(""),
      Email: Joi.string().allow(""),
      PhoneNumber: Joi.string().min(7).max(10).label("Phone Number").allow(""),
      Zipcode: this.state.is_business
        ? Joi.optional()
        : Joi.string().min(3).max(5).label("Zipcode").required().allow(""),
      image: Joi.optional(),
      Note: Joi.any().optional(),
      // Note: Joi.string().strict().required(),
    });
    this.setState({ error: await validateSchema(form, schema) });
    if (!this.state.error.status) {
      // await this.setState({ open: true, reqData: reqData })
      let res = await apiCall("POST", "editUserProfileByAdmin", reqData);
      if (res.code == 1) {
        displayLog(res.code, res.message);
        if (window.location.pathname.includes("/business/edit/")) {
          this.props.history.push(
            process.env.PUBLIC_URL + `/business`,
            this.props.location.state
          );
        } else {
          this.props.history.push(
            process.env.PUBLIC_URL + `/users`,
            this.props.location.state
          );
        }
      }
    } else {
      displayLog(0, this.state.error.message);
    }
  };

  callEditApi = async () => {
    let reqData = this.state.reqData;
    reqData.append("notes", this.state.notes);
    reqData.append("admin_id", this.state.admin_id);
    reqData.append("edited_id", this.props.match.params.userId);
    if (window.location.pathname.includes("/business/edit/")) {
      reqData.append("tab_type", 3);
    } else {
      reqData.append("tab_type", 1);
    }
    let res = await apiCall("POST", "editUserProfileByAdmin", reqData);
    if (res.code == 1) {
      displayLog(res.code, res.message);
      if (window.location.pathname.includes("/business/edit/")) {
        this.props.history.push(
          process.env.PUBLIC_URL + `/business`,
          this.props.location.state
        );
      } else {
        this.props.history.push(
          process.env.PUBLIC_URL + `/users`,
          this.props.location.state
        );
      }
    }
  };

  changeValuesHandler = (e) => {
    this.setState({ form: formValueChangeHandler(e, this.state.form) });
  };
  changeDate = (date) => {
    let form = this.state.form;
    form.dob = moment(date._d).format("DD-MM-YYYY");
    this.setState({ form });
  };

  changeSelectValue = (values, a) => {
    let newValues = [];
    for (let v of values) {
      newValues.push(v);
    }
    let newFormValues = { ...this.state.form };
    newFormValues[a] = newValues;
    this.setState({ form: newFormValues });
  };

  uploadHandler = (userId, file, newFileName) => {
    const s3config = {
      bucketName: config.S3_BUCKET_NAME,
      dirName: `${userId}/profile-pictures`,
      region: config.S3_REGION,
      accessKeyId: config.AWS_ACCESS_KEY,
      secretAccessKey: config.AWS_SECRET_KEY,
    };
    Object.defineProperty(file, "name", {
      writable: true,
      value: newFileName,
    });
    S3FileUpload.uploadFile(file, s3config)
      .then((data) => console.log(data))
      .catch((err) => console.error(err));
  };
  validation = (currentDate) => {
    return (
      currentDate.isBefore(moment(new Date())) &&
      currentDate.isAfter(moment(new Date("01/01/1920")))
    );
  };
  goBack = () => {
    this.props.history.push(process.env.PUBLIC_URL + "/users");
  };
  enterPressed = (event) => {
    var code = event.keyCode || event.which;
    if (code === 13) {
      //13 is the enter keycode
      this.submitHandler();
    }
  };
  changeFilter = (e) => {
    this.setState({ userType: +e.target.value });
  };
  fileSelectedHandler = (e, flag) => {
    const file = Array.from(e.target.files);

    if (file) {
      this.setState(
        {
          photo: file,
          image: " ",
        },
        () => console.log("\n\n\n %%%%%%%%>>>>>", this.state.photos)
      );
    }
    if (file) {
      file.map((f) => this.state.images.push(URL.createObjectURL(f)));
    }
  };

  async asignImage(index, id) {
    // console.log('\n\n ID IS ______________________>>>', id);
    // let arr = this.state.editedId
    // console.log('\n\n\n INCLUDE ', arr.includes(id));
    // if (!arr.includes(id)) {
    //   arr.push(id);
    // }
    // await this.setState({ index: index, id: id, editedId: arr })
  }
  render() {
    console.log("\n\n\n ********", this.state);
    return (
      <div className="animated fadeIn">
        <Row>
          <Col xl={12}>
            <Card>
              <CardHeader>
                <h4>
                  {this.state.is_business === true
                    ? "Edit Business"
                    : this.props.match.params && this.props.match.params.userId
                    ? "Edit User"
                    : "Add User"}
                </h4>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col xs="12" md="12" className="text-center">
                    <FormGroup>
                      <div className="email1">
                        {
                          <div className="profile-pic">
                            <img
                              className="profile-img"
                              src={
                                this.state.image != " "
                                  ? this.state.image
                                  : this.state.images[0]
                              }
                              alt="profile"
                              onError={(event) => {
                                event.target.onerror = null;
                                event.target.src = require("../../assets/default.png");
                              }}
                            ></img>
                            <div className="image-upload edit-image1">
                              <label for={"image"}>
                                <a href>
                                  <i className="fa fa-edit fa-lg"></i>
                                </a>
                              </label>
                              <input
                                className="file-input"
                                type="file"
                                id={"image"}
                                name={"image"}
                                multiple={false}
                                accept="image/jpg, image/png, image/jpeg"
                                onChange={(e) => this.fileSelectedHandler(e)}
                              />
                            </div>
                            {/* <div className="delete-image edit-image">
                              <a href>
                                <i className="fa fa-trash fa-lg" onClick={() => this.DeleteImageHandler()}></i>
                              </a>
                            </div> */}
                          </div>
                        }
                      </div>
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  {this.state.is_business === false && (
                    <>
                      <Col xs="12" md="6">
                        <FormGroup>
                          <Label className="label-weight">First Name</Label>
                          <Input
                            type="text"
                            placeholder={`Enter First Name`}
                            value={this.state.form["FirstName"]}
                            onKeyPress={(e) => this.enterPressed(e)}
                            name="FirstName"
                            onChange={(e) => this.changeValuesHandler(e)}
                          />
                        </FormGroup>
                      </Col>
                      <Col xs="12" md="6">
                        <FormGroup>
                          <Label className="label-weight">Last Name</Label>
                          <Input
                            type="text"
                            placeholder={`Enter Last Name`}
                            value={this.state.form["LastName"]}
                            onKeyPress={(e) => this.enterPressed(e)}
                            name="LastName"
                            onChange={(e) => this.changeValuesHandler(e)}
                          />
                        </FormGroup>
                      </Col>
                      <Col xs="12" md="6">
                        <FormGroup>
                          <Label className="label-weight">Email</Label>
                          <Input
                            type="text"
                            placeholder={`Enter Email`}
                            value={this.state.form["Email"]}
                            onKeyPress={(e) => this.enterPressed(e)}
                            name="Email"
                            onChange={(e) => this.changeValuesHandler(e)}
                          />
                        </FormGroup>
                      </Col>
                      <Col xs="12" md="6">
                        <FormGroup>
                          <Label className="label-weight">Phone Number</Label>
                          <Input
                            type="number"
                            placeholder={`Enter Phone Number`}
                            value={this.state.form["PhoneNumber"]}
                            min={0}
                            onKeyPress={(e) => this.enterPressed(e)}
                            name="PhoneNumber"
                            onChange={(e) => this.changeValuesHandler(e)}
                          />
                        </FormGroup>
                      </Col>
                      <Col xs="12" md="6">
                        <FormGroup>
                          <Label className="label-weight">Zipcode</Label>
                          <Input
                            type="number"
                            placeholder={`Enter Zipcode`}
                            value={this.state.form["Zipcode"]}
                            min={0}
                            onKeyPress={(e) => this.enterPressed(e)}
                            name="Zipcode"
                            onChange={(e) => this.changeValuesHandler(e)}
                          />
                        </FormGroup>
                      </Col>
                      {!(
                        this.state.userType == 100 || this.state.userType == 200
                      ) ? (
                        <Col sm="12" md="6" className="mb-3 mb-xl-0">
                          <FormGroup>
                            <Label className="label-weight">Account Type</Label>
                            <Input
                              type="select"
                              name="userType"
                              value={this.state.userType}
                              onChange={(e) => this.changeFilter(e)}
                            >
                              <option value="">Select Type</option>
                              <option value={1}>User</option>
                              <option value={2}>Business</option>
                            </Input>
                          </FormGroup>
                        </Col>
                      ) : null}
                      <Col sm="12" md="6" className="mb-3 mb-xl-0">
                        <FormGroup>
                          <Label className="label-weight">Note</Label>
                          <Input
                            type="textarea"
                            placeholder={`Enter Note`}
                            className="h150"
                            value={this.state.form["Note"]}
                            onKeyPress={(e) => this.enterPressed(e)}
                            name="Note"
                            onChange={(e) => this.changeValuesHandler(e)}
                          />
                        </FormGroup>
                      </Col>
                    </>
                  )}
                </Row>

                {/* Business Fields */}
                {this.state.userType == 2 ? (
                  <>
                    <Row>
                      {this.state.is_business === false && (
                        <Col xs="12" md="12" className="seoAlign">
                          Business Details
                        </Col>
                      )}
                    </Row>
                    <Row>
                      <Col xs="12" md="6">
                        <FormGroup>
                          <Label className="label-weight">Name</Label>
                          <Input
                            type="text"
                            placeholder={`Enter Business Name`}
                            value={this.state.form["BusinessName"]}
                            onKeyPress={(e) => this.enterPressed(e)}
                            name="BusinessName"
                            onChange={(e) => this.changeValuesHandler(e)}
                          />
                        </FormGroup>
                      </Col>
                      <Col xs="12" md="6">
                        <FormGroup>
                          <Label className="label-weight">City</Label>
                          <Input
                            type="text"
                            placeholder={`Business City`}
                            value={this.state.form["BusinessAddressCity"]}
                            onKeyPress={(e) => this.enterPressed(e)}
                            name="BusinessAddressCity"
                            onChange={(e) => this.changeValuesHandler(e)}
                          />
                        </FormGroup>
                      </Col>
                      <Col xs="12" md="6">
                        <FormGroup>
                          <Label className="label-weight">Street</Label>
                          <Input
                            type="text"
                            placeholder={`Business Street`}
                            value={this.state.form["BusinessAddressStreet"]}
                            onKeyPress={(e) => this.enterPressed(e)}
                            name="BusinessAddressStreet"
                            onChange={(e) => this.changeValuesHandler(e)}
                          />
                        </FormGroup>
                      </Col>
                      <Col xs="12" md="6">
                        <FormGroup>
                          <Label className="label-weight">Phone Number</Label>
                          <Input
                            type="text"
                            placeholder={`Business Phone Number`}
                            value={this.state.form["BusinessPhoneNumber"]}
                            onKeyPress={(e) => this.enterPressed(e)}
                            name="BusinessPhoneNumber"
                            onChange={(e) => this.changeValuesHandler(e)}
                          />
                        </FormGroup>
                      </Col>
                      <Col xs="12" md="6">
                        <FormGroup>
                          <Label className="label-weight">Web Address</Label>
                          <Input
                            type="text"
                            placeholder={`Business Web Address`}
                            value={this.state.form["BusinessWebAddress"]}
                            onKeyPress={(e) => this.enterPressed(e)}
                            name="BusinessWebAddress"
                            onChange={(e) => this.changeValuesHandler(e)}
                          />
                        </FormGroup>
                      </Col>

                      <Col sm="12" md="6" className="mb-3 mb-xl-0">
                        <FormGroup>
                          <Label className="label-weight">Note</Label>
                          <Input
                            type="textarea"
                            placeholder={`Enter Note`}
                            className="h150"
                            value={this.state.form["Note"]}
                            onKeyPress={(e) => this.enterPressed(e)}
                            name="Note"
                            onChange={(e) => this.changeValuesHandler(e)}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  </>
                ) : null}
              </CardBody>
              <CardFooter>
                <Button
                  color="primary"
                  onClick={this.submitHandler}
                  style={{ marginRight: "8px" }}
                >
                  Submit
                </Button>
              </CardFooter>
            </Card>
          </Col>
        </Row>
        <Modal open={this.state.open} onClose={this.onCloseModal} center>
          <div className="modal-body pt-0">
            <form>
              <div class="modal-header p-0 pb-2 mb-2">
                <h5 class="modal-title" id="exampleModalLabel">
                  Add Note
                </h5>
              </div>
              <div className="form-group">
                <label for="message-text" className="col-form-label">
                  Note:
                </label>
                <textarea
                  className="form-control"
                  id="message-text"
                  required
                  value={this.state.notes}
                  onChange={(e) => this.setState({ notes: e.target.value })}
                ></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => this.callEditApi()}
              disabled={this.state.notes == ""}
            >
              Submit
            </button>
          </div>
        </Modal>
        <div>
          <Nav tabs>
            <NavItem>
              <NavLink
                className={classnames({ active: this.state.activeTab === "1" })}
                onClick={() => {
                  this.toggle("1");
                }}
              >
                Offer Pending
              </NavLink>
            </NavItem>

            <NavItem>
              <NavLink
                className={classnames({ active: this.state.activeTab === "2" })}
                onClick={() => {
                  this.toggle("2");
                }}
              >
                Offer Completed
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={this.state.activeTab}>
            <TabPane tabId="1">
              <Row>
                <Col sm="12">
                  <Row className="align-items-right">
                    <Col sm="12">
                      <Card>
                        <CardBody>
                          <Row className="align-items-right pb-4"></Row>
                          <Table bordered striped responsive size="sm">
                            <thead>
                              <tr>
                                <th
                                  scope="col"
                                  rowSpan="2"
                                  className="text-center align-middle"
                                >
                                  No
                                </th>
                                <th
                                  scope="col"
                                  rowSpan="2"
                                  className="text-center align-middle"
                                >
                                  Title
                                </th>
                                <th
                                  scope="col"
                                  rowSpan="2"
                                  className="text-center align-middle"
                                >
                                  Description
                                </th>
                                <th
                                  scope="col"
                                  rowSpan="2"
                                  className="text-center align-middle"
                                >
                                  Price
                                </th>
                                <th
                                  scope="col"
                                  rowSpan="2"
                                  className="text-center align-middle"
                                >
                                  Posted Date
                                </th>
                                <th
                                  scope="col"
                                  rowSpan="2"
                                  className="text-center align-middle"
                                >
                                  Offer Link
                                </th>
                                <th
                                  scope="col"
                                  colSpan="3"
                                  rowSpan="2"
                                  className="text-center align-middle"
                                >
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {this.state.pending_data.length > 0 ? (
                                this.state.pending_data.map((p, index) => (
                                  <tr>
                                    <td className="text-center">
                                      {index +
                                        1 +
                                        (this.state.page_no - 1) *
                                          this.state.limit}
                                    </td>
                                    <td>{p.Title}</td>
                                    <td>{p.Description}</td>
                                    <td>
                                      {p.Price ? (
                                        <NumberFormat
                                          value={p.Price}
                                          displayType={"text"}
                                          thousandSeparator={true}
                                          prefix={"$"}
                                        />
                                      ) : (
                                        "-"
                                      )}
                                    </td>
                                    <td>
                                      {moment(p.DateCreated).format(
                                        "DD-MM-YYYY"
                                      )}
                                    </td>
                                    <td>
                                      <a
                                        href={
                                          config.web_url +
                                          `offer/${p.Id}/${String(p.Title)
                                            .replace(/\s/g, "-")
                                            .toLowerCase()}`
                                        }
                                        target="_blank"
                                        className="Font17"
                                      >
                                        <i
                                          class="fa fa-link"
                                          aria-hidden="true"
                                        ></i>
                                      </a>
                                    </td>
                                    <td>
                                      <span
                                        className="fa fa-files-o edit action-icon"
                                        title="Duplicate Offer"
                                        onClick={() => this.duplicateOffer(p)}
                                      ></span>
                                    </td>
                                    <td>
                                      <span
                                        className="fa fa-edit edit action-icon"
                                        title="Edit User"
                                        onClick={() => this.editOffer(p)}
                                      ></span>
                                    </td>
                                    <td>
                                      <span
                                        className="fa fa-trash action-icon"
                                        title="Delete Offer"
                                        onClick={() => this.deleteOffer(p)}
                                      ></span>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr className="text-center">
                                  <td colSpan={8}> No Data Found </td>
                                </tr>
                              )}
                            </tbody>
                          </Table>
                        </CardBody>
                      </Card>
                      <Row>
                        <Col>
                          <ReactPaginate
                            pageCount={Math.ceil(
                              this.state.total / this.state.limit
                            )}
                            onPageChange={this.handlePageClick}
                            previousLabel={"Previous"}
                            nextLabel={"Next"}
                            breakLabel={"..."}
                            breakClassName={"page-item"}
                            breakLinkClassName={"page-link"}
                            containerClassName={
                              "pagination justify-content-end"
                            }
                            pageClassName={"page-item"}
                            pageLinkClassName={"page-link"}
                            previousClassName={"page-item"}
                            previousLinkClassName={"page-link"}
                            nextClassName={"page-item"}
                            nextLinkClassName={"page-link"}
                            activeClassName={"active"}
                            forcePage={this.state.page_no - 1}
                          />
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </TabPane>
            <TabPane tabId="2">
              <Row>
                <Col sm="12">
                  <Row className="align-items-right">
                    <Col sm="12">
                      <Card>
                        <CardBody>
                          <Row className="align-items-right pb-4"></Row>
                          <Table bordered striped responsive size="sm">
                            <thead>
                              <tr>
                                <th
                                  scope="col"
                                  rowSpan="2"
                                  className="text-center align-middle"
                                >
                                  No
                                </th>
                                <th
                                  scope="col"
                                  rowSpan="2"
                                  className="text-center align-middle"
                                >
                                  Title
                                </th>
                                <th
                                  scope="col"
                                  rowSpan="2"
                                  className="text-center align-middle"
                                >
                                  Description
                                </th>
                                <th
                                  scope="col"
                                  rowSpan="2"
                                  className="text-center align-middle"
                                >
                                  Price
                                </th>
                                <th
                                  scope="col"
                                  rowSpan="2"
                                  className="text-center align-middle"
                                >
                                  Posted Date
                                </th>
                                <th
                                  scope="col"
                                  rowSpan="2"
                                  className="text-center align-middle"
                                >
                                  Offer Link
                                </th>

                                {/* <th scope="col" colSpan="3" rowSpan="2" className="text-center align-middle">Action</th> */}
                              </tr>
                            </thead>
                            <tbody>
                              {this.state.completed_data.length > 0 ? (
                                this.state.completed_data.map((c, index) => (
                                  <tr>
                                    <td className="text-center">
                                      {index +
                                        1 +
                                        (this.state.page_no - 1) *
                                          this.state.limit}
                                    </td>
                                    <td>{c.Title}</td>
                                    <td>{c.Description}</td>
                                    <td>
                                      {c.Price ? (
                                        <NumberFormat
                                          value={c.Price}
                                          displayType={"text"}
                                          thousandSeparator={true}
                                          prefix={"$"}
                                        />
                                      ) : (
                                        "-"
                                      )}
                                    </td>
                                    <td>
                                      {moment(c.DateCreated).format(
                                        "DD-MM-YYYY"
                                      )}
                                    </td>
                                    <td>
                                      <a
                                        href={
                                          config.web_url +
                                          `offer/${c.Id}/${String(c.Title)
                                            .replace(/\s/g, "-")
                                            .toLowerCase()}`
                                        }
                                        target="_blank"
                                        className="Font17"
                                      >
                                        <i
                                          class="fa fa-link"
                                          aria-hidden="true"
                                        ></i>
                                      </a>
                                    </td>

                                    {/* <td>
                                                                        <span className="fa fa-eye action-icon" title="View User" onClick={() => this.view(c)}></span>
                                                                    </td> */}
                                  </tr>
                                ))
                              ) : (
                                <tr className="text-center">
                                  <td colSpan={8}> No Data Found </td>
                                </tr>
                              )}
                            </tbody>
                          </Table>
                        </CardBody>
                      </Card>
                      <Row>
                        <Col>
                          <ReactPaginate
                            pageCount={Math.ceil(
                              this.state.total / this.state.limit
                            )}
                            onPageChange={this.handlePageClick}
                            previousLabel={"Previous"}
                            nextLabel={"Next"}
                            breakLabel={"..."}
                            breakClassName={"page-item"}
                            breakLinkClassName={"page-link"}
                            containerClassName={
                              "pagination justify-content-end"
                            }
                            pageClassName={"page-item"}
                            pageLinkClassName={"page-link"}
                            previousClassName={"page-item"}
                            previousLinkClassName={"page-link"}
                            nextClassName={"page-item"}
                            nextLinkClassName={"page-link"}
                            activeClassName={"active"}
                            forcePage={this.state.page_no - 1}
                          />
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </TabPane>
          </TabContent>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    admin: state.reducer.admin,
  };
};
export default withRouter(connect(mapStateToProps, null)(AddEditCollection));
// export default AddEditCollection;
