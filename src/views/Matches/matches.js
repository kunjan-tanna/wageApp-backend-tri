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
  Label,
  InputGroupText,
  InputGroupAddon,
  InputGroup,
} from "reactstrap";
import {
  apiCall,
  displayLog,
  confirmBox,
  getZipCode,
} from "../../utils/common";
import ReactPaginate from "react-paginate";
import NumberFormat from "react-number-format";
import moment from "moment";
import XLSX from "xlsx";
import config from "../../utils/config";
import store from "../../utils/store";
import Geocode from "react-geocode";
import { CSVLink, CSVDownload } from "react-csv";

Geocode.setApiKey(config.GOOGLE_KEY);
Geocode.setLanguage("en");
Geocode.setRegion("us");
Geocode.enableDebug();

let arr = [];
class Matches extends Component {
  state = {
    users: [],
    page_no: 1,
    limit: 15,
    lastEvaluatedKey: undefined,
    searchStr: "",
    total_users: "",
    mounthFilter: "",
    status: "",
    offer_id: null,
    selectedChecBox: [],
    selectedUserIds: [],
    allIds: [],
    locations: [],
    categories: [],
    location: "",
    min: "",
    max: "",
    Type: "",
    userIds: [],
    picture: "",
    description: "",
    promotionType: 0,
    category: "",
  };

  isBottom(el) {
    return el.getBoundingClientRect().bottom <= window.innerHeight;
  }

  async componentDidMount() {
    console.log("\n\n PRP ==>", this.props);
    if (this.props.location.state) {
      console.log("\n\n PROP DATA==>", this.props.location.state);
      localStorage.setItem("str", this.props.location.state.searchString);
      this.setState({ ...this.props.location.state }, () => this.getOffers());
      await this.props.history.replace({
        pathname: this.props.location.pathname,
        state: {},
      });
    }
    if (localStorage.getItem("OfferFilters") !== null) {
      let data = JSON.parse(localStorage.getItem("OfferFilters"));
      localStorage.removeItem("OfferFilters");
      await this.setState({ ...data });
    }
    this.getFilterData();
    await this.getOffers();
  }

  handlePageClick = (e) => {
    document.getElementById("selectAll").checked = false;
    this.setState(
      { page_no: e.selected + 1, selectedChecBox: [], selectedUserIds: [] },
      () => {
        this.getOffers();
      }
    );
  };

  trackScrolling = () => {
    const wrappedElement = document.getElementsByClassName("main")[0];
    if (this.isBottom(wrappedElement)) {
      document.removeEventListener("scroll", this.trackScrolling);
      console.log("header bottom reached");
      this.getOffers();
    }
  };

  SortingHandler = (sort_by) => {
    if (this.state.sort_type === 0) {
      this.setState({ sort_type: 1, sort_by: sort_by, order_by: "DESC" }, () =>
        this.getOffers()
      );
    } else {
      this.setState({ sort_type: 0, sort_by: sort_by, order_by: "ASC" }, () =>
        this.getOffers()
      );
    }
  };

  getOffers = async () => {
    console.log(
      "LOCATION",
      this.state.location,
      "category",
      this.state.category
    );
    let response;
    if (this.state.offer_id !== null) {
      response = await apiCall("POST", "getOffersById", {
        offer_id: Number(this.state.offer_id),
      });
      console.log("\n\n\n- by id data->>", response);
    } else {
      let reqData = {
        page_no: this.state.page_no,
        limit: this.state.limit,
        sort_by: this.state.sort_by,
        sort_type: this.state.sort_type,
        order_by: this.state.order_by,
      };
      if (this.state.lastEvaluatedKey) {
        reqData.lastEvaluatedKey = this.state.lastEvaluatedKey;
      }
      if (this.state.status != "") {
        reqData.status = this.state.status.toString();
      }
      if (this.state.searchStr != "") {
        reqData.searchStr = this.state.searchStr.trim();
      }
      if (this.state.location != "") {
        reqData.location = this.state.location;
      }
      if (this.state.category != "") {
        reqData.category = this.state.category;
      }
      if (this.state.min != "") {
        reqData.min = this.state.min;
      }
      if (this.state.max != "") {
        reqData.max = this.state.max;
      }
      if (this.state.Type != "") {
        reqData.type = this.state.Type;
      }

      if (this.state.mounthFilter != "") {
        let date = moment()
          .subtract(this.state.mounthFilter, "months")
          .format("YYYY-MM-DD HH:mm:ss");
        reqData.mounthFilter = date;
      }
      if (this.state.picture != "") {
        reqData.picture = this.state.picture;
      }
      if (this.state.description != "") {
        reqData.description = this.state.description;
      }
      if (this.state.promotionType != 0) {
        reqData.promotionType = this.state.promotionType;
      }
      console.log("reqData", reqData);
      response = await apiCall("POST", "getOffers", reqData);
      console.log("RESDD", response);
      for (let data of response.data) {
        store.dispatch({
          type: "START_LOADER",
        });
        let res = await Geocode.fromLatLng(data.Latitude, data.Longitude);
        let result = res.results[0];
        console.log("\n\n @@@@", result);
        if (result) {
          data["StateFullName"] = result.formatted_address;
          result.address_components.map((r) => {
            console.log("\n\n $$$$$$$$$$$$$4", r);

            if (r.types.includes("postal_code")) {
              data["zipcode"] = r.short_name;
            }
          });
        }
      }
      store.dispatch({
        type: "STOP_LOADER",
      });
    }
    let users = [...response.data];
    let arr = [];
    let userIds = [];

    response.data.map((m) => {
      arr.push(m.Id);
      if (!userIds.includes(m.TaskerId)) {
        userIds.push(m.TaskerId);
      }
    });

    console.log("\n1111111111111111111111111111", users);
    this.setState({
      users: users,
      userIds: userIds,
      allIds: arr,
      lastEvaluatedKey: response.data.lastEvaluatedKey,
      total_users: response.total,
    });
    // GET THE CATEGORIES
    response = await apiCall("POST", "getOfferCategories");
    if (response.code == 1) {
      this.setState({
        categories: response.data,
      });
    }
  };

  activeClickHandler = async (user, flag, index) => {
    let reqData = {
      id: user.Id,
      blockStatus: flag,
    };
    let response = await apiCall("POST", "changeBlockStatus", reqData);
    if (response.code === 1) {
      this.getOffers();
    }
    displayLog(response.code, response.message);
  };

  addUser = () => {
    // this.props.history.push(process.env.PUBLIC_URL + '/users/add');
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
    if (
      (this.state.min != "" && this.state.min != null) ||
      (this.state.max != "" && this.state.max != null)
    ) {
      if (this.state.min != " " && this.state.max == "") {
        displayLog(0, "Please enter max price.");
        return;
      }
      if (this.state.max != " " && this.state.min == "") {
        displayLog(0, "Please enter min price.");
        return;
      }
      if (this.state.min < 0 || this.state.max < 0) {
        displayLog(0, "Price cant be a negative value.");
        return;
      }
      if (this.state.min > this.state.max) {
        displayLog(0, "Invalid min price.");
        return;
      } else {
        this.setState({ users: [], page_no: 1 }, () => this.getOffers());
      }
    } else {
      this.setState({ users: [], page_no: 1 }, () => this.getOffers());
    }
  }

  delete = async (user) => {
    let reqData;
    if (this.state.selectedChecBox.length > 0) {
      reqData = {
        IdArr: this.state.selectedChecBox,
      };
    } else {
      reqData = {
        id: user.Id,
      };
    }

    let confirm = await confirmBox(
      "Wage",
      "Are you sure,you want to delete offer(s)?"
    );
    if (confirm) {
      let response = await apiCall("POST", "deleteOffer", reqData);
      if (response.code === 1) {
        document.getElementById("selectAll").checked = false;
        this.getOffers();
      }
      displayLog(response.code, response.message);
    }
  };

  view = (data) => {
    this.props.history.push(
      process.env.PUBLIC_URL + "/conversations/" + data.Id
    );
  };

  insertId = (id) => {};

  userRow = (user, index) => {
    return (
      <tr key={index}>
        {/* <td>
          <input
            type="checkbox"
            id={user.Id}
            onClick={(e) => this.changeCheckBox(e, user.TaskerId)}
            checked={this.state.selectedChecBox.includes(Number(user.Id))}
          ></input>
        </td> */}
        <td className="text-center align-middle">
          {index + 1 + (this.state.page_no - 1) * this.state.limit}
        </td>
        <td className="text-left pl-3 align-middle">{user.Title}</td>
        <td className="text-center">
          {user.Path != null ? (
            <img
              className="offerImg"
              width="45px"
              height="45px"
              src={config.image_url + user.Path}
            ></img>
          ) : (
            "-"
          )}
        </td>
        <td className="text-left pl-3 w-50 align-middle desp">
          {user.Description ? user.Description : "-"}
        </td>
        <td className="text-left pl-3 w-50 align-middle">{user.category}</td>

        <td className="text-left pl-3 align-middle">
          {user.Price ? (
            <NumberFormat
              value={user.Price}
              displayType={"text"}
              thousandSeparator={true}
              prefix={"$"}
            />
          ) : (
            "-"
          )}{" "}
        </td>
        <td className="text-left pl-3 align-middle editText">
          {user.StateFullName ? user.StateFullName : "-"}
        </td>
        <td className="text-left pl-3 align-middle">
          {user.promotionType
            ? user.promotionType == "1"
              ? "Local"
              : user.promotionType == "2"
              ? "Statewide"
              : user.promotionType == "3"
              ? "Nationalwide"
              : "-"
            : ""}
        </td>
        <td className="text-left pl-3 align-middle">{user.zipcode}</td>

        <td className="text-left pl-3 align-middle">
          <span
            className="crsrPntr"
            onClick={() => this.redirectUser(user.TaskerId)}
          >
            {user.PostedBy}
          </span>
        </td>
        <td className="text-left pl-3 align-middle">{user.Email}</td>

        <td className="text-left pl-3 align-middle TypeDrop">
          <Input
            type="select"
            name="Type"
            value={Number(user.Type)}
            onChange={(e) => this.updateTypeHandler(e, user.Id)}
          >
            <option value={1}>Service</option>
            <option value={0}>Gig</option>
          </Input>
          {/* {user.Type == "0" ? "Gig" : "Service"} */}
        </td>
        <td className="text-left pl-3 align-middle">
          {moment(user.DateCreated).format("YYYY-MM-DD")}
        </td>

        <td className="text-left pl-3 align-middle">
          {user.Status == 3
            ? "Completed"
            : user.Status == 1
            ? "Pending"
            : user.Status == 2
            ? "InProgress"
            : user.Status == 0
            ? "Not declared"
            : ""}
        </td>
        <td className="text-left pl-3 align-middle">
          <a
            href={
              config.web_url +
              `offer/${user.Id}/${String(user.Title)
                .replace(/\s/g, "-")
                .toLowerCase()}`
            }
            target="_blank"
            className="Font17"
          >
            <i class="fa fa-link" aria-hidden="true"></i>
          </a>
        </td>
        <td className="text-center pl-3 align-middle editText">
          {user.editedReason || "-"}
        </td>
        <td className="text-center align-middle">
          {/* <span className="fa fa-eye action-icon" title="View Offer" onClick={() => this.view(user)}></span> */}
          <span
            className="fa fa-edit edit action-icon"
            title="Edit Offer"
            onClick={() => this.edit(user)}
          ></span>
          <span
            className="fa fa-trash action-icon"
            title="Delete Offer"
            onClick={() => this.delete(user)}
          ></span>
        </td>
      </tr>
    );
  };
  changeLimit = (e) => {
    this.setState({ limit: +e.target.value, page_no: 1 }, () => {
      this.getOffers();
    });
  };
  changeFilter = (e, flag) => {
    console.log("\n\n\n\n -->>kkkkkkkkk", e.target);
    // if (flag === 1) {
    if (e.target.name == "min" || e.target.name == "max") {
      console.log("\n\n\n\n = NAME =>>", e.target.name);
      this.setState({ [e.target.name]: e.target.value });
    } else if (e.target.name == "mounthFilter") {
      this.setState({ mounthFilter: +e.target.value, page_no: 1 }, () => {
        this.getOffers();
      });
    } else {
      this.setState({ [e.target.name]: e.target.value, page_no: 1 }, () => {
        this.getOffers();
      });
    }
    // } else {
    //     this.setState({ mounthFilter: +e.target.value, page_no: 1 }, () => {
    //         this.getOffers();
    //     });
    // }
  };
  changeFilterCategoryLocation = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value, page_no: 1 });
  };

  changeType = (e) => {
    this.setState({ [e.target.name]: e.target.value, page_no: 1 }, () =>
      this.getOffers()
    );
  };
  searchData = (e) => {
    this.getOffers();
  };
  add = () => {
    this.props.history.push(process.env.PUBLIC_URL + "/offers/add");
  };
  edit = (data) => {
    console.log("\n\n\nDATA -->>>", data);
    let filterData = {
      page_no: this.state.page_no,
      limit: this.state.limit,
      searchStr: this.state.searchStr,
      mounthFilter: this.state.mounthFilter,
      status: this.state.status,
      location: this.state.location,
      min: this.state.min,
      max: this.state.max,
      Type: this.state.Type,
    };
    localStorage.setItem("OfferFilters", JSON.stringify(filterData));
    this.props.history.push(
      process.env.PUBLIC_URL + "/offers/edit/" + data.Id,
      filterData
    );
  };

  updateTypeHandler = async (e, id) => {
    let type = e.target.value;
    console.log("\n\n EEEEEEEEEEE", e.target.value);
    let flag = await confirmBox(
      "Wage",
      "Are you sure,you want to change Type?"
    );
    if (flag) {
      let reqData = {
        offer_id: id,
        type: type,
      };
      let res = await apiCall("POST", "updateTypeOfOffer", reqData);
      displayLog(res.code, res.message);
      this.getOffers();
    }
  };

  changeCheckBox = (e, posted_by) => {
    if (e.target.id === "selectAll") {
      if (e.target.checked) {
        let arr = this.state.allIds;
        let userIds = this.state.userIds;
        this.setState({ selectedChecBox: arr, selectedUserIds: userIds });
      } else {
        this.setState({ selectedChecBox: [], selectedUserIds: [] });
      }
    } else {
      if (e.target.checked) {
        let arr = this.state.selectedChecBox;
        let userIds = this.state.selectedUserIds;

        arr.push(Number(e.target.id));
        if (!userIds.includes(posted_by)) {
          userIds.push(posted_by);
        }
        this.setState({ selectedChecBox: arr, selectedUserIds: userIds });
      } else {
        let arr = [];
        let userIds = [];
        var i = this.state.selectedChecBox.filter((element) => {
          return element !== Number(e.target.id);
        });

        var t = this.state.selectedUserIds.filter((e) => {
          return e != posted_by;
        });

        i.map((data) => {
          console.log("\n\n DATA is->", data);
          arr.push(data);
          // userIds.push()
        });

        t.map((data) => {
          userIds.push(data);
        });
        this.setState({ selectedChecBox: i, selectedUserIds: t });
      }
    }
  };

  download = () => {
    const fileName = "Wage_Offers.xlsx";
    const finalData = [];
    for (let data of this.state.users) {
      console.log("\n\nDATA is---->>>===", data);
      finalData.push({
        Id: data.Id,
        ["Offer Name"]: data.Title,
        ["Description"]: data.Description,
        ["Category"]: data.category,
        ["Posted By"]: data.PostedBy,
        ["Email"]: data.Email,
        ["asign To"]: data.asignTo,
        ["Posted Date"]: moment(data.DateCreated).format("DD-MM-YYYY"),
        Location: data.StateFullName,
        Price: data.Price ? "$" + data.Price : "",
        Status:
          data.Status == "1"
            ? "Pending"
            : data.Status == "2"
            ? "InProgress"
            : data.Status == "3"
            ? "Completed"
            : data.Status == "3"
            ? "Not declared"
            : "",
        ["Offer Link"]:
          config.web_url +
          `offer/${data.Id}/${String(data.Title)
            .replace(/\s/g, "-")
            .toLowerCase()}`,
      });
      // console.log("finalData", finalData);
      // if (this.state.selectedChecBox.includes(data.Id)) {
      //   console.log("\n\nDATA is---->>>", data);
      //   finalData.push({
      //     Id: data.Id,
      //     ["Offer Name"]: data.Title,
      //     ["Description"]: data.Description,
      //     ["Category"]: data.category,
      //     ["Posted By"]: data.PostedBy,
      //     ["Email"]: data.Email,
      //     ["asign To"]: data.asignTo,
      //     ["Posted Date"]: moment(data.DateCreated).format("DD-MM-YYYY"),
      //     Location: data.StateFullName,
      //     Price: data.Price ? "$" + data.Price : "",
      //     Status:
      //       data.Status == "1"
      //         ? "Pending"
      //         : data.Status == "2"
      //         ? "InProgress"
      //         : data.Status == "3"
      //         ? "Completed"
      //         : data.Status == "3"
      //         ? "Not declared"
      //         : "",
      //     ["Offer Link"]:
      //       config.web_url +
      //       `offer/${data.Id}/${String(data.Title)
      //         .replace(/\s/g, "-")
      //         .toLowerCase()}`,
      //   });
      // }
    }
    const ws = XLSX.utils.json_to_sheet(finalData, { dateNF: "YYYY-MM-DD" });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Edit Offers");

    XLSX.writeFile(wb, fileName);
  };

  getFilterData = async () => {
    let response = await apiCall("POST", "getReportFilters");
    this.setState({
      locations: response.locations,
      categories: response.category,
    });
  };

  redirectUser = (id) => {
    this.props.history.push(process.env.PUBLIC_URL + "/users", { user_id: id });
  };

  sendNotification = () => {
    this.props.history.push(
      process.env.PUBLIC_URL + "/notification",
      this.state.selectedUserIds
    );
  };

  yesNoFilters = async (e) => {
    await this.setState({ [e.target.name]: e.target.value, page_no: 1 });
    this.getOffers();
  };

  allEmails = async () => {
    let data = {};
    let res = await apiCall("POST", "getEmailsOfOfferCreators", data);
    console.log("\n\n RESSSWWWWWW_>", res.data.data);
    if (res.data && res.data.data.length > 0) {
      const fileName = "Wage_offer_emails.xlsx";
      const finalData = [];
      for (let data of res.data.data) {
        store.dispatch({
          type: "START_LOADER",
        });
        finalData.push({
          ["EmailS"]: data.Email,
        });
      }
      store.dispatch({
        type: "STOP_LOADER",
      });
      const ws = XLSX.utils.json_to_sheet(finalData, { dateNF: "YYYY-MM-DD" });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Edit Emails");

      XLSX.writeFile(wb, fileName);
    } else {
      displayLog(0, "No data found to export.");
    }
  };

  render() {
    const csvData = [
      ["firstname", "lastname", "email"],
      ["Ahmed", "Tomi", "ah@smthing.co.com"],
      ["Raed", "Labes", "rl@smthing.co.com"],
      ["Yezzi", "Min l3b", "ymin@cocococo.com"],
    ];
    return (
      <div className="animated fadeIn">
        <Row>
          <Col xl={12}>
            <Card>
              <CardHeader>
                <h4>Matches</h4>
              </CardHeader>
              <CardBody>
                <Row className="align-items-right">
                  {/* <Col sm="12" md="2" xs className="mb-3 mb-xl-0">
                    <Button
                      block
                      color="primary"
                      size="sm"
                      onClick={() => this.add()}
                    >
                      Add
                    </Button>
                  </Col> */}
                </Row>
              </CardBody>
              <Row className="pl-3 pr-3">
                <Col sm="12" md="2" className="mb-3 mb-xl-0">
                  <Input
                    type="select"
                    name="location"
                    value={this.state.location}
                    onChange={(e) => this.changeFilterCategoryLocation(e, 1)}
                  >
                    <option value="">Select Location</option>
                    {this.state.locations.map((l, index) => (
                      <option value={l.StateFullName} key={l.StateFullName}>
                        {l.StateFullName}
                      </option>
                    ))}
                  </Input>
                </Col>
                <Col sm="12" md="2" className="mb-3 mb-xl-0">
                  <Input
                    type="select"
                    name="category"
                    value={this.state.category}
                    // onChange={(e) => this.changeFilter(e, 1)}
                    onChange={(e) => this.changeFilterCategoryLocation(e, 1)}
                  >
                    <option value="">Select Category</option>
                    {this.state.categories.map((l, index) => (
                      <option value={l.Id} key={l.Name}>
                        {l.Name}
                      </option>
                    ))}
                  </Input>
                </Col>

                {/* <Col sm="12" md="1" className="mb-3 mb-xl-0 p-1">
                                    <Button block color="primary" size="sm" onClick={() => this.delete()}>ok</Button>
                                </Col> */}
                {/* <Col sm="12" md="2" xs className="mb-3 mb-xl-0">
                  <Input
                    type="text"
                    placeholder={`Search by Title`}
                    value={this.state.searchStr}
                    name="searchStr"
                    onChange={(e) => this.changeSearch(e)}
                    onKeyPress={(e) => this.enterPressed(e)}
                  />
                </Col> */}
                <Col sm="12" md="2" xs className="mb-3 mb-xl-0">
                  <Button
                    block
                    color="primary"
                    size="sm"
                    onClick={() => this.searchData()}
                  >
                    Search
                  </Button>
                </Col>
              </Row>
              <Row className="pl-3 pr-3">
                <Col sm="12" md="2" className="mb-3 mt-3 mb-xl-0">
                  <Button
                    block
                    color="primary"
                    size="sm"
                    onClick={() => this.download()}
                  >
                    Export to CSV
                  </Button>
                </Col>
              </Row>
              {/* //TEMPORARILY DOWNLOAD CSV FILES NOTICATION ETC..// */}
              {/* {this.state.selectedChecBox.length > 0 && (
                <Row className="pt-3 pl-4">
                  <Col sm="12" md="2" className="mb-3 mb-xl-0">
                    <Button
                      block
                      color="primary"
                      size="sm"
                      onClick={() => this.delete()}
                    >
                      Delete All Selected
                    </Button>
                  </Col>
                  <Col sm="12" md="2" className="mb-3 mb-xl-0">
                    <Button
                      block
                      color="primary"
                      size="sm"
                      onClick={() => this.download()}
                    >
                      Export selected to CSV
                    </Button>
                  </Col>
                  <Col sm="12" md="2" className="mb-3 mb-xl-0">
                    <Button
                      block
                      color="primary"
                      size="sm"
                      onClick={() => this.allEmails()}
                    >
                      Export all to CSV
                    </Button>
                  </Col>
                  <Col sm="12" md="2" className="mb-3 mb-xl-0">
                    <Button
                      block
                      color="primary"
                      size="sm"
                      onClick={() => this.sendNotification()}
                    >
                      Send Notification
                    </Button>
                  </Col>
                </Row>
              )} */}
              {/* //TEMPORARILY DOWNLOAD CSV FILES NOTICATION ETC..// */}
              <CardBody>
                <Table bordered striped responsive size="sm">
                  <thead>
                    <tr>
                      {/* <th scope="col" rowSpan="2">
                        <input
                          type="checkbox"
                          id="selectAll"
                          onClick={(e) => this.changeCheckBox(e)}
                        ></input>
                      </th> */}
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
                        Title{" "}
                        <i
                          className="fa fa-sort cursor-pointer"
                          aria-hidden="true"
                          onClick={() => this.SortingHandler("Title")}
                        ></i>
                      </th>
                      <th
                        scope="col"
                        rowSpan="2"
                        className="text-center align-middle"
                      >
                        Image
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
                        Category
                      </th>

                      <th
                        scope="col"
                        rowSpan="2"
                        className="text-center align-middle"
                      >
                        Price{" "}
                        <i
                          className="fa fa-sort cursor-pointer"
                          aria-hidden="true"
                          onClick={() => this.SortingHandler("Price")}
                        ></i>
                      </th>
                      <th
                        scope="col"
                        rowSpan="2"
                        className="text-center align-middle editNote"
                      >
                        Location
                      </th>
                      <th
                        scope="col"
                        rowSpan="2"
                        className="text-center align-middle"
                      >
                        Promotion Type
                      </th>

                      {/* <i className="fa fa-sort cursor-pointer" aria-hidden="true" onClick={() => this.SortingHandler('StateFullName')}></i> */}
                      <th
                        scope="col"
                        rowSpan="2"
                        className="text-center align-middle"
                      >
                        Zipcode
                      </th>

                      <th
                        scope="col"
                        rowSpan="2"
                        className="text-center align-middle"
                      >
                        Posted By
                      </th>
                      <th
                        scope="col"
                        rowSpan="2"
                        className="text-center align-middle"
                      >
                        Email
                      </th>

                      <th
                        scope="col"
                        rowSpan="2"
                        className="text-center align-middle"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        rowSpan="2"
                        className="text-center align-middle"
                      >
                        Created date{" "}
                        <i
                          className="fa fa-sort cursor-pointer"
                          aria-hidden="true"
                          onClick={() => this.SortingHandler("DateCreated")}
                        ></i>
                      </th>

                      <th
                        scope="col"
                        rowSpan="2"
                        className="text-center align-middle"
                      >
                        Status
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
                        rowSpan="2"
                        className="text-center align-middle editNote"
                      >
                        Edit Note
                      </th>

                      <th
                        scope="col"
                        colSpan="3"
                        rowSpan="2"
                        className="text-center align-middle actionBlock"
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  {this.state.users.length > 0 ? (
                    <tbody>
                      {this.state.users.map((user, index) =>
                        this.userRow(user, index)
                      )}
                    </tbody>
                  ) : (
                    <tbody>
                      <tr className="text-center">
                        <td colSpan={18}> No Data Found </td>
                      </tr>
                    </tbody>
                  )}
                </Table>
              </CardBody>
            </Card>
            <Row>
              <Col>
                <ReactPaginate
                  pageCount={Math.ceil(
                    this.state.total_users / this.state.limit
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
      </div>
    );
  }
}

export default Matches;
