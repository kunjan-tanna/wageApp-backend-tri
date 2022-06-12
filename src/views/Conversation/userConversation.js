import React, { Component } from "react";
import { Card, CardBody, CardHeader, Col, Row, Table } from "reactstrap";
import { apiCall } from "../../utils/common";
import ScrollToBottom from "react-scroll-to-bottom";
import { animateScroll } from "react-scroll";
import moment from "moment";
import config from "../../utils/config";

import "./demo.css";

let id = null;

class UserConversation extends Component {
  state = {
    userList: [],
    selected_user: [],
    page_no: 1,
    limit: 15,
    total: "",
    lastEvaluatedKey: undefined,
    searchStr: "",
    order_by: "DESC",
    sort_by: "",
    sort_type: 1,
    sender_id: "",
    name: "",
    message: "",
  };

  isBottom(el) {
    return el.getBoundingClientRect().bottom <= window.innerHeight;
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  componentDidMount() {
    console.log("\n\n\nLOCATION DATA-->>>", this.props.location.state);
    this.scrollToBottom();
    this.getUserList();
  }

  scrollToBottom = () => {
    animateScroll.scrollToBottom({
      containerId: "asd",
    });
  };

  getUserList = async (id) => {
    let reqData = {
      userId: this.props.match.params.userId,
    };
    if (this.props.location.state.conversationId) {
      reqData["conversationId"] = this.props.location.state.conversationId;
    }
    let res = await apiCall("POST", "getConversationByUserId", reqData);
    await this.setState({ userList: res.data, selected_user: res.data[0] });
    this.getConversaction(res.data[0]);
  };

  handlePageClick = (e) => {
    this.setState({ page_no: e.selected + 1 }, () => {
      this.getConversaction();
    });
  };

  trackScrolling = () => {
    console.log("HELLO");
    const wrappedElement = document.getElementsByClassName("main")[0];
    if (this.isBottom(wrappedElement)) {
      document.removeEventListener("scroll", this.trackScrolling);
      this.getConversaction();
    }
  };
  getFilterData = async () => {
    let response = await apiCall("POST", "getReportFilters");
    this.setState({
      locations: response.locations,
      categories: response.category,
    });
  };

  getConversaction = async (data) => {
    if (data === undefined) {
      this.setState({ message: "No conversation found" });
    } else {
      this.setState({ message: "" });
      let reqData = {
        conversation_id: String(data.conversationId),
      };
      let response = await apiCall(
        "POST",
        "getConversationsByConversationId",
        reqData
      );
      console.log("RESPONSE", response);
      await this.setState({
        sender_id: response.data[0].SenderId,
        name: data.name,
      });
      let list = [...response.data];
      this.setState({
        list: list,
        lastEvaluatedKey: response.data.lastEvaluatedKey,
        total: response.total,
      });
      //   if (response.data.lastEvaluatedKey) {
      //     document.addEventListener("scroll", this.trackScrolling);
      //   }
    }
  };

  changeSearch = (e) => {
    let text = String(e.target.value).trim();
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
    this.setState({ users: [] });
    this.getOffers();
  }

  view = (data) => {
    this.props.history.push(
      process.env.PUBLIC_URL + "/offerConversation/" + data.Id
    );
  };

  getOffers = async () => {
    let reqData = {
      is_conversation: 1,
      page_no: this.state.page_no,
      limit: this.state.limit,
      searchStr: this.state.searchStr,
    };
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
  changeLimit = (e) => {
    this.setState({ limit: +e.target.value, page_no: 1 }, () => {
      this.getConversaction();
    });
  };
  changeFilter = (e) => {
    if (e.target.value != "") {
      this.setState({ searchStr: "" });
      this.setState({ selected_user: e.target.value, page_no: 1 }, () => {
        this.getConversaction();
      });
    }
  };
  redirect = () => {
    if (this.props.location.state.flag) {
      this.props.history.push(process.env.PUBLIC_URL + "/globalSearch", {
        data: this.props.location.state,
      });
    } else {
      this.props.history.push(
        process.env.PUBLIC_URL + "/conversations",
        this.props.location.state
      );
    }
  };

  redirectUser = (id) => {
    this.props.history.push(process.env.PUBLIC_URL + "/users", { user_id: id });
  };

  render() {
    console.log("\n\n\n STATE==>>", this.state);
    return (
      <div className="animated fadeIn">
        <Row>
          <Col xl={12}>
            <Card>
              <CardHeader>
                <div className="a">
                  <div onClick={() => this.redirect()}>
                    <img
                      width="30"
                      src={require("../../assets/left-arrow.png")}
                    ></img>
                    <h4 style={{ display: "inline" }}>Back</h4>
                  </div>
                </div>
              </CardHeader>
              <Row>
                <Col sm="12" md="4" className="mb-3 mb-xl-0 Col4">
                  <Card className="CardLeft">
                    <CardHeader className="AllMsg">
                      {this.state.list && this.state.list[0].SenderId ? (
                        <h5>
                          All Massages{" "}
                          <h5
                            className="float-right Clr crsrPntr"
                            onClick={() =>
                              this.redirectUser(this.state.list[0].SenderId)
                            }
                          >
                            {this.props.location.state.name != undefined
                              ? "User : " + this.props.location.state.name
                              : null}
                          </h5>
                        </h5>
                      ) : (
                        <h5>
                          All Massages{" "}
                          <h5 className="float-right Clr crsrPntr">
                            {this.props.location.state.name != undefined
                              ? "User : " + this.props.location.state.name
                              : null}
                          </h5>
                        </h5>
                      )}
                    </CardHeader>
                    <div className="chat-box">
                      <ul>
                        {this.state.message != "" ? (
                          <div className="text-center">
                            <span>{this.state.message}</span>
                          </div>
                        ) : (
                          this.state.userList.map((u) => (
                            <li onClick={() => this.getConversaction(u)}>
                              <div className="person-img">
                                {" "}
                                <img
                                  src={require("../../assets/User_ring.png")}
                                ></img>
                              </div>
                              <div className="person-detail">
                                <h3>{u.name} </h3>
                              </div>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  </Card>
                </Col>
                <Col sm="12" md="8" className="mb-3 mb-xl-0 Col8">
                  <Card id="asd" className="CardRight">
                    <CardHeader className="msgRight">
                      {/* <div className="user-detail"> */}
                      {this.state.message == "" ? (
                        <div className="person-img">
                          {" "}
                          <img
                            src={require("../../assets/User_ring.png")}
                          ></img>
                        </div>
                      ) : null}
                      <div className="person-detail">
                        <h3
                          className="crsrPntr"
                          onClick={() =>
                            this.redirectUser(this.state.selected_user.UserId)
                          }
                        >
                          {this.state.name}
                        </h3>
                      </div>
                      {/* </div> */}
                    </CardHeader>
                    <div className="user-chat-dec">
                      {this.state.list &&
                        this.state.list.map((l) => (
                          <div
                            className={
                              this.state.sender_id == l.SenderId
                                ? "user-chat-right clearfix"
                                : "user-chat clearfix"
                            }
                          >
                            <div
                              className={
                                this.state.sender_id == l.SenderId
                                  ? "Float-Right"
                                  : "user-chat clearfix"
                              }
                            >
                              {
                                <i
                                  onClick={() => this.redirectUser(l.SenderId)}
                                  className="crsrPntr"
                                >
                                  {l.name}
                                </i>
                              }
                            </div>
                            {l.MessageType == 1 ? (
                              <span>
                                {l.Message}
                                <em className="massage-time">
                                  {moment(l.SentDate).format(
                                    "DD/MM/YYYY HH:mm"
                                  )}
                                </em>
                              </span>
                            ) : (
                              <img
                                className={
                                  this.state.sender_id == l.SenderId
                                    ? "Image"
                                    : "user-chat clearfix"
                                }
                                width="200"
                                src={config.image_url + l.ImageUrl}
                              ></img>
                            )}
                          </div>
                        ))}
                    </div>
                  </Card>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default UserConversation;
