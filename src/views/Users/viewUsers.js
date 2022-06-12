import React, { Component } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Table,
  Button,
  Input,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  FormGroup,
  Label,
} from "reactstrap";
import { apiCall, displayLog, confirmBox } from "../../utils/common";
import ReactPaginate from "react-paginate";
import classnames from "classnames";
import NumberFormat from "react-number-format";
import moment from "moment";
import config from "../../utils/config";

class viewUser extends Component {
  state = {
    activeTab: "1",
    toggle: "1",
    setActiveTab: "1",
    res: "",
    pending_data: [],
    completed_data: [],
    page_no: 1,
    limit: 10,
    order_by: "DESC",
    sort_by: "",
    sort_type: 1,
    user_data: "",
    is_business: false,
    total: 0,
  };
  toggle = (tab) => {
    if (this.state.activeTab !== tab) {
      this.setState({ activeTab: tab, page_no: 1 }, () => this.getData());
    }
  };

  componentDidMount() {
    if (window.location.pathname.includes("/viewBusiness") === true) {
      this.setState({ is_business: true });
    }
    this.getData();
  }

  getData = async () => {
    let reqData = {
      user_id: this.props.match.params.userId,
      page_no: this.state.page_no,
      limit: this.state.limit,
    };
    const pendingRes = await apiCall("POST", "getPendingTask", reqData);
    const CompletedRes = await apiCall("POST", "getCompletedTask", reqData);
    const getUserById = await apiCall("POST", "getUserById", {
      id: this.props.match.params.userId,
    });
    console.log("\n\n @@@@@getUserById", getUserById);
    this.setState({
      pending_data: pendingRes.data.data,
      completed_data: CompletedRes.data.data,
      user_data: getUserById.data,
      total: pendingRes.data.total_offer,
    });
  };
  onSubmitHandler = async (flag) => {};
  changeLimit = (e) => {
    this.setState({ limit: +e.target.value, page_no: 1 }, () => {
      this.getData();
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

  render() {
    console.log("\n\n STATE:::::>>>", this.state);
    return (
      <>
        <div className="animated fadeIn">
          <Row>
            <Col xl={12}>
              <Card>
                <CardHeader>
                  <h4>
                    {window.location.pathname.includes("/viewBusiness") === true
                      ? "View business"
                      : "View user"}
                  </h4>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col xs="12" md="12">
                      <FormGroup>
                        <Label></Label>
                        <center>
                          <img
                            className="profile-img"
                            src={
                              config.image_url + this.state.user_data.user_image
                            }
                            alt=""
                            title=""
                            onError={(event) => {
                              event.target.onerror = null;
                              event.target.src = require("../../assets/default.png");
                            }}
                          />
                        </center>
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
                              placeholder={`Enter title`}
                              value={this.state.user_data["FirstName"]}
                              disabled={true}
                            />
                          </FormGroup>
                        </Col>
                        <Col xs="12" md="6">
                          <FormGroup>
                            <Label className="label-weight">Last Name</Label>
                            <Input
                              type="text"
                              placeholder={`Enter Description`}
                              value={this.state.user_data["LastName"]}
                              disabled={true}
                            />
                          </FormGroup>
                        </Col>
                        <Col xs="12" md="6">
                          <FormGroup>
                            <Label className="label-weight">Email</Label>
                            <Input
                              type="text"
                              placeholder={`Enter Price`}
                              value={this.state.user_data["Email"]}
                              disabled={true}
                            />
                          </FormGroup>
                        </Col>
                        <Col xs="12" md="6">
                          <FormGroup>
                            <Label className="label-weight">User Name</Label>
                            <Input
                              type="text"
                              placeholder={`Enter Price`}
                              value={this.state.user_data["UserName"]}
                              disabled={true}
                            />
                          </FormGroup>
                        </Col>
                      </>
                    )}
                    <Col xs="12" md="6">
                      <FormGroup>
                        <Label className="label-weight">Business Name</Label>
                        <Input
                          type="text"
                          placeholder={`Enter Price`}
                          value={
                            this.state.user_data["BusinessName"] != null
                              ? this.state.user_data["BusinessName"]
                              : "N/A"
                          }
                          disabled={true}
                        />
                      </FormGroup>
                    </Col>

                    <Col xs="12" md="6">
                      <FormGroup>
                        <Label className="label-weight">Business Website</Label>
                        <Input
                          type="text"
                          placeholder={`Enter Price`}
                          value={
                            this.state.user_data["BusinessWebAddress"] != null
                              ? this.state.user_data["BusinessWebAddress"]
                              : "N/A"
                          }
                          disabled={true}
                        />
                      </FormGroup>
                    </Col>

                    <Col xs="12" md="6">
                      <FormGroup>
                        <Label className="label-weight">Business Phone</Label>
                        <Input
                          type="text"
                          placeholder={`Enter Price`}
                          value={
                            this.state.user_data["BusinessPhoneNumber"] != null
                              ? this.state.user_data["BusinessPhoneNumber"]
                              : "N/A"
                          }
                          disabled={true}
                        />
                      </FormGroup>
                    </Col>

                    <Col xs="12" md="6">
                      <FormGroup>
                        <Label className="label-weight">Business City</Label>
                        <Input
                          type="text"
                          placeholder={`Enter Price`}
                          value={
                            this.state.user_data["BusinessAddressCity"] != null
                              ? this.state.user_data["BusinessAddressCity"]
                              : "N/A"
                          }
                          disabled={true}
                        />
                      </FormGroup>
                    </Col>

                    <Col xs="12" md="6">
                      <FormGroup>
                        <Label className="label-weight">Business Street</Label>
                        <Input
                          type="text"
                          placeholder={`Enter Price`}
                          value={
                            this.state.user_data["BusinessAddressStreet"] !=
                            null
                              ? this.state.user_data["BusinessAddressStreet"]
                              : "N/A"
                          }
                          disabled={true}
                        />
                      </FormGroup>
                    </Col>

                    <Col xs="12" md="6">
                      <FormGroup>
                        <Label className="label-weight">Phone Number</Label>
                        <Input
                          type="text"
                          placeholder={`Enter PhoneNumber`}
                          value={
                            this.state.user_data["PhoneNumber"] != null
                              ? this.state.user_data["PhoneNumber"]
                              : "N/A"
                          }
                          disabled={true}
                        />
                      </FormGroup>
                    </Col>

                    <Col xs="12" md="6">
                      <FormGroup>
                        <Label className="label-weight">Zipcode</Label>
                        <Input
                          type="text"
                          placeholder={`Enter zipcode`}
                          value={
                            this.state.user_data["ZipCode"] != null
                              ? this.state.user_data["ZipCode"]
                              : "N/A"
                          }
                          disabled={true}
                        />
                      </FormGroup>
                    </Col>

                    <Col xs="12" md="6">
                      <FormGroup>
                        <Label className="label-weight">App Version</Label>
                        <Input
                          type="text"
                          placeholder={`Enter App Version`}
                          value={
                            this.state.user_data["AppVersion"] != null
                              ? this.state.user_data["AppVersion"]
                              : "N/A"
                          }
                          disabled={true}
                        />
                      </FormGroup>
                    </Col>
                    <Col xs="12" md="6">
                      <FormGroup>
                        <Label className="label-weight">Note</Label>
                        <Input
                          type="textarea"
                          placeholder={`Enter Edit Note`}
                          className="h150"
                          value={
                            this.state.user_data["editedReason"] != null
                              ? this.state.user_data["editedReason"]
                              : "N/A"
                          }
                          disabled={true}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>

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
                                    {moment(p.DateCreated).format("DD-MM-YYYY")}
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
                          containerClassName={"pagination justify-content-end"}
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
                                    {moment(c.DateCreated).format("DD-MM-YYYY")}
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
                          containerClassName={"pagination justify-content-end"}
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
      </>
    );
  }
}

export default viewUser;
