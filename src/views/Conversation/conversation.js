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
} from "reactstrap";
import { apiCall } from "../../utils/common";
import ReactPaginate from "react-paginate";
import moment from "moment";
class Conversation extends Component {
  state = {
    list: [],
    Offers: [],
    userList: [],
    selected_offer: "",
    selected_user: "",
    page_no: 1,
    limit: 15,
    total: "",
    lastEvaluatedKey: undefined,
    searchStr: "",
    order_by: "DESC",
    sort_by: "",
    sort_type: 1,
    sender_id: "",
    filter: "1",
    startDate: "",
    endDate: "",
  };

  isBottom(el) {
    return el.getBoundingClientRect().bottom <= window.innerHeight;
  }

  dateHandler = (e) => {
    console.log("\n\n\n $$$$", e.target.value);
    this.setState({ [e.target.name]: e.target.value });
  };

  async componentDidMount() {
    console.log("\n\n\n\nUSER BACK-->>", this.props.location.state);
    if (this.props.location.state) {
      await this.setState({ ...this.props.location.state });
      if (this.props.location.state.identifier == "user") {
        this.getUserList();
      } else {
        this.getOffers();
      }

      await this.props.history.replace({
        pathname: this.props.location.pathname,
        state: {},
      });
    } else {
      this.getOffers();
    }
  }

  componentWillUnmount() {
    // document.addEventListener('scroll', this.trackScrolling);
  }

  handlePageClick = (e) => {
    if (this.state.filter == 1) {
      this.setState({ page_no: e.selected + 1 }, () => {
        this.getOffers();
      });
    } else {
      this.setState({ page_no: e.selected + 1 }, () => {
        this.getUserList();
      });
    }
  };

  trackScrolling = () => {
    const wrappedElement = document.getElementsByClassName("main")[0];
    if (this.isBottom(wrappedElement)) {
      document.removeEventListener("scroll", this.trackScrolling);
      this.getConversaction();
    }
  };

  changeSearch = (e) => {
    let text = String(e.target.value);
    this.setState({ searchStr: text });
  };
  enterPressed = async (event) => {
    var code = event.keyCode || event.which;
    if (code === 13) {
      //13 is the enter keycode
      await this.setState({ page_no: 1 });
      this.search();
    }
  };
  search() {
    this.setState({ list: [], Offers: [] });
    if (this.state.filter == 1) {
      this.getOffers();
    } else {
      this.getUserList();
    }
  }

  view = (data) => {
    console.log("DATA IN VIEW ___>>", data);
    let name, identifier;
    if (this.state.filter == "1") {
      name = data.Title;
      identifier = "offer";
    } else {
      name = data.FirstName;
      identifier = "user";
    }
    let reqData = {
      page_no: this.state.page_no,
      limit: this.state.limit,
      order_by: this.state.order_by,
      sort_by: this.state.sort_by,
      sort_type: this.state.sort_type,
      sender_id: this.state.sender_id,
      filter: this.state.filter,
      searchStr: this.state.searchStr,
      userList: this.state.userList,

      name: name,
      identifier: identifier,
      id: data.Id,
    };
    if (this.state.filter == 1) {
      this.props.history.push(
        process.env.PUBLIC_URL + "/offerConversation/" + data.Id,
        reqData
      );
    } else {
      this.props.history.push(
        process.env.PUBLIC_URL + "/userConversation/" + data.Id,
        reqData
      );
    }
  };

  getOffers = async () => {
    let reqData = {
      is_conversation: 1,
      page_no: this.state.page_no,
      limit: this.state.limit,
      sort_by: this.state.sort_by,
      sort_type: this.state.sort_type,
      order_by: this.state.order_by,
    };
    if (this.state.startDate !== "") {
      reqData.startDate = this.state.startDate;
    }
    if (this.state.endDate !== "") {
      reqData.endDate = this.state.endDate;
    }
    if (this.state.searchStr !== "") {
      reqData.searchStr = this.state.searchStr.trim();
    }
    let res = await apiCall("POST", "getOffers", reqData);
    this.setState({ Offers: res.data, total: res.total });
  };

  Row = (user, index) => {
    return (
      <tr key={index}>
        <td className="text-center">
          {index + 1 + (this.state.page_no - 1) * this.state.limit}
        </td>
        <td className="text-left pl-3">{user.Title ? user.Title : "-"}</td>
        <td className="text-left pl-3">
          {moment(user.Date).format("YYYY-MM-DD")}
        </td>

        <td className="text-center">
          <span
            key={index}
            className="fa fa-eye action-icon"
            title="View convarsation"
            onClick={() => this.view(user)}
          ></span>
        </td>
      </tr>
    );
  };
  SortingHandler = (sort_by, flag) => {
    if (this.state.sort_type === 0) {
      this.setState({ sort_type: 1, sort_by: sort_by, order_by: "DESC" }, () =>
        flag == "user" ? this.getUserList() : this.getOffers()
      );
    } else {
      this.setState({ sort_type: 0, sort_by: sort_by, order_by: "ASC" }, () =>
        flag == "user" ? this.getUserList() : this.getOffers()
      );
    }
  };

  userRow = (user, index) => {
    return (
      <tr key={index}>
        <td className="text-center">
          {index + 1 + (this.state.page_no - 1) * this.state.limit}
        </td>
        <td className="text-left pl-3">{user.FirstName}</td>
        <td className="text-left pl-3">{user.LastName}</td>
        <td className="text-left pl-3">
          {moment(user.SentDate).format("YYYY-MM-DD")}
        </td>

        <td className="text-center">
          <span
            key={index}
            className="fa fa-eye action-icon"
            title="View Conversation"
            onClick={() => this.view(user)}
          ></span>
        </td>
      </tr>
    );
  };
  changeLimit = (e) => {
    this.setState({ limit: +e.target.value, page_no: 1 }, () => {
      if (this.state.filter == "1") {
        this.getOffers();
      } else if (this.state.filter == "2") {
        this.getUserList();
      }
    });
  };
  changeFilter = (e, flag) => {
    this.setState({ searchStr: "" });
    if (flag == 1) {
      if (e.target.value == 1) {
        this.setState(
          {
            filter: e.target.value,
            page_no: 1,
            startDate: "",
            endDate: "",
            list: [],
          },
          () => {
            this.getOffers();
          }
        );
      } else if (e.target.value == 2) {
        this.setState(
          {
            filter: e.target.value,
            page_no: 1,
            startDate: "",
            endDate: "",
            Offers: [],
          },
          () => {
            this.getUserList();
          }
        );
      }
    }
  };

  getUserList = async () => {
    let reqData = {
      page_no: this.state.page_no,
      limit: this.state.limit,
      is_conversation: true,
      sort_by: this.state.sort_by,
      sort_type: this.state.sort_type,
      order_by: this.state.order_by,
    };
    if (this.state.lastEvaluatedKey) {
      reqData.lastEvaluatedKey = this.state.lastEvaluatedKey;
    }
    if (this.state.searchStr !== "") {
      reqData.searchStr = this.state.searchStr.trim();
    }
    if (this.state.userType !== "") {
      reqData.userType = this.state.userType;
    }
    if (this.state.startDate !== "") {
      reqData.startDate = this.state.startDate;
    }
    if (this.state.endDate !== "") {
      reqData.endDate = this.state.endDate;
    }
    let response = await apiCall("POST", "users", reqData);
    let users = [...response.data.users];
    this.setState({
      list: users,
      lastEvaluatedKey: response.data.lastEvaluatedKey,
      total: response.data.total_users,
    });
    if (response.data.lastEvaluatedKey) {
      document.addEventListener("scroll", this.trackScrolling);
    }
  };

  onChange = (value) => {
    console.log("\n\n\nVALUE IS--->>", value);
    if (value.length !== 0) {
      this.getUserList(value[0].Id);
    }
  };

  clear() {
    this.setState({ startDate: "", endDate: "" }, () =>
      this.state.filter == "1" ? this.getOffers() : this.getUserList()
    );
  }

  render() {
    console.log("\n\n\nSTATE ##############>>>", this.state);
    return (
      <div className="animated fadeIn">
        <Row>
          <Col xl={12}>
            <Card>
              <CardHeader>
                <h4>Conversations</h4>
              </CardHeader>
              <CardBody>
                <Row className="align-items-right">
                  <Col sm="12" md="1" className="mb-3 mb-xl-0">
                    <Input
                      type="select"
                      name="limit"
                      value={this.state.limit}
                      onChange={(e) => this.changeLimit(e)}
                    >
                      <option value={15}>15</option>
                      <option value={30}>30</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </Input>
                  </Col>
                  <Col sm="12" md="2" className="mb-3 mb-xl-0">
                    <Input
                      type="select"
                      name="filter"
                      value={this.state.filter}
                      onChange={(e) => this.changeFilter(e, 1)}
                    >
                      <option value="">Select Filter</option>
                      <option value={1}>Offers</option>
                      <option value={2}>Users</option>
                    </Input>
                  </Col>
                  <Col sm="12" md="2" className="mb-3 mb-xl-0">
                    <Input
                      type="date"
                      name="startDate"
                      value={this.state.startDate}
                      onChange={(e) => this.dateHandler(e)}
                    ></Input>
                  </Col>
                  <Col sm="12" md="2" className="mb-3 mb-xl-0">
                    <Input
                      type="date"
                      placeholder="Date"
                      name="endDate"
                      value={this.state.endDate}
                      onChange={(e) => this.dateHandler(e)}
                    ></Input>
                  </Col>

                  <Col sm="12" md="2" xs className="mb-3 mb-xl-0">
                    <Input
                      type="text"
                      placeholder={`Search by name`}
                      value={this.state.searchStr}
                      name="searchStr"
                      onChange={(e) => this.changeSearch(e)}
                      onKeyPress={(e) => this.enterPressed(e)}
                    />
                  </Col>
                  <Col sm="2" md="2" className="mb-3 mb-xl-0">
                    <Button
                      block
                      color="primary"
                      size="sm"
                      onClick={() => this.search()}
                    >
                      Search
                    </Button>
                  </Col>
                  <Col sm="2" md="1" className="mb-3 mb-xl-0">
                    <Button
                      block
                      color="primary"
                      size="sm"
                      onClick={() => this.clear()}
                    >
                      Clear
                    </Button>
                  </Col>
                </Row>
                <Row>
                  <Col sm="12" md="10" className="mb-3 mb-xl-0"></Col>
                  {/* <Col sm="2" md="2" className="mb-3 mb-xl-0">
                                        <Button block color="primary" size="sm" onClick={() => this.search()}>Clear filter</Button>
                                    </Col> */}
                </Row>
              </CardBody>
              <CardBody>
                <Table bordered striped responsive size="sm">
                  {this.state.Offers.length > 0 && (
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
                          className="text-left align-left pl-3"
                        >
                          Name
                        </th>
                        <th
                          scope="col"
                          rowSpan="2"
                          className="text-left align-left pl-3"
                        >
                          Date{" "}
                          <i
                            className="fa fa-sort cursor-pointer"
                            aria-hidden="true"
                            onClick={() =>
                              this.SortingHandler("cnm.SentDate", "offer")
                            }
                          ></i>
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
                  )}
                  {this.state.list.length > 0 && (
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
                          className="text-left align-left pl-3"
                        >
                          First Name
                        </th>
                        <th
                          scope="col"
                          rowSpan="2"
                          className="text-left align-left pl-3"
                        >
                          Last Name
                        </th>
                        <th
                          scope="col"
                          rowSpan="2"
                          className="text-left align-left pl-3"
                        >
                          Date{" "}
                          <i
                            className="fa fa-sort cursor-pointer"
                            aria-hidden="true"
                            onClick={() =>
                              this.SortingHandler("cnm.SentDate", "user")
                            }
                          ></i>
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
                  )}
                  {this.state.Offers.length > 0 ? (
                    <tbody>
                      {this.state.Offers.map((user, index) =>
                        this.Row(user, index)
                      )}
                    </tbody>
                  ) : this.state.list.length > 0 ? (
                    <tbody>
                      {this.state.list.map((user, index) =>
                        this.userRow(user, index)
                      )}
                    </tbody>
                  ) : (
                    <tbody>
                      <tr className="text-center">
                        <td colSpan={8}> No Data Found </td>
                      </tr>
                    </tbody>
                  )}
                </Table>
              </CardBody>
            </Card>
            <Row>
              <Col>
                <ReactPaginate
                  pageCount={Math.ceil(this.state.total / this.state.limit)}
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
      </div>
    );
  }
}

export default Conversation;
