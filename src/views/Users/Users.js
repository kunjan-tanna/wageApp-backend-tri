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
import { apiCall, displayLog, confirmBox } from "../../utils/common";
import ReactPaginate from "react-paginate";
import XLSX from "xlsx";
import DatePicker from "react-datepicker";
import moment from "moment";
import store from "../../utils/store";
import Geocode from "react-geocode";
import config from "../../utils/config";
import "react-datepicker/dist/react-datepicker.css";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { Dot } from "react-animated-dots";

Geocode.setApiKey(config.GOOGLE_KEY);
Geocode.setLanguage("en");
Geocode.setRegion("us");
Geocode.enableDebug();

class Users extends Component {
  state = {
    users: [],
    page_no: 1,
    limit: 15,
    lastEvaluatedKey: undefined,
    searchStr: "",
    total_users: "",
    userType: "",
    order_by: "DESC",
    sort_by: "",
    sort_type: 1,
    user_id: null,
    selectedChecBox: [],
    allIds: [],
    startDate: "",
    endDate: "",
    is_business: false,
    skel: false,
  };

  isBottom(el) {
    return el.getBoundingClientRect().bottom <= window.innerHeight;
  }

  getGeoLocation = (lat, long) => {
    Geocode.fromLatLng(lat, long).then((res) => {
      let result = String(res.results[0].formatted_address);
      console.log("33333333333333333333333", result);
      return result;
    });
  };

  getLocation = async (lat, long) => {
    // console.log('\n\n\n 111111111111111111111111', lat, long);
    let result = 0;
    if (lat && long) {
      result = await this.getGeoLocation(lat, long);
    } else {
      result = "-";
    }
    return result;
  };

  async componentDidMount() {
    var index = window.location.href.lastIndexOf("/");
    var activelink = window.location.href.slice(0, index);
    console.log(
      "\n\n ACTIVE LINK",
      window.location.pathname.includes("/business")
    );
    if (window.location.pathname.includes("/business")) {
      this.setState({ is_business: true });
    }
    if (this.props.location.state) {
      console.log("\n\n\n\n ### LOCATION###->", this.props.location.state);
      localStorage.setItem("str", this.props.location.state.searchString);
      this.setState({ ...this.props.location.state }, () => this.getUsers());
      await this.props.history.replace({
        pathname: this.props.location.pathname,
        state: {},
      });
    }

    // if (localStorage.getItem('UserFilters') !== null) {
    //   let data = JSON.parse(localStorage.getItem('UserFilters'));
    //   localStorage.removeItem('UserFilters');
    //   await this.setState({ ...data })
    // }
    this.checkLocalStrage();

    this.getUsers();
  }

  checkLocalStrage = async () => {
    if (window.location.pathname.includes("/business")) {
      if (localStorage.getItem("BusinessFilters") !== null) {
        let data = JSON.parse(localStorage.getItem("BusinessFilters"));
        localStorage.removeItem("BusinessFilters");
        await this.setState({ ...data });
      }
    } else {
      if (localStorage.getItem("UserFilters") !== null) {
        let data = JSON.parse(localStorage.getItem("UserFilters"));
        localStorage.removeItem("UserFilters");
        await this.setState({ ...data });
      }
    }
  };

  changeCheckBox = async (e) => {
    if (e.target.id === "selectAll") {
      if (e.target.checked) {
        let arr = this.state.allIds;
        this.setState({ selectedChecBox: arr });
      } else {
        this.setState({ selectedChecBox: [] });
      }
    } else {
      if (e.target.checked) {
        let arr = this.state.selectedChecBox;
        arr.push(e.target.id);
        this.setState({ selectedChecBox: arr });
      } else {
        let arr = [];
        var i = this.state.selectedChecBox.filter((element) => {
          return element !== e.target.id;
        });
        i.map((data) => {
          arr.push(data);
        });
        await this.setState({ selectedChecBox: i });
        if (this.state.selectedChecBox.length === 0) {
          console.log("\n\n\n @@@@@@@@@@@@");
          document.getElementById("selectAll").checked = false;
        }
      }
    }
  };

  handlePageClick = (e) => {
    this.setState({ page_no: e.selected + 1 }, () => {
      this.getUsers();
    });
  };

  trackScrolling = () => {
    const wrappedElement = document.getElementsByClassName("main")[0];
    if (this.isBottom(wrappedElement)) {
      document.removeEventListener("scroll", this.trackScrolling);
      console.log("header bottom reached");
      this.getUsers();
    }
  };

  getUsers = async () => {
    let response;
    if (this.state.user_id !== null) {
      response = await apiCall("POST", "getUserById", {
        id: String(this.state.user_id),
      });
      let users = [response.data];
      console.log("\n\n\n USERS", users);
      // lastEvaluatedKey: response.data.lastEvaluatedKey,
      this.setState({ users: users, total_users: response.data.total_users });
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
      if (window.location.pathname.includes("/business")) {
        reqData.is_business = true;
      }
      response = await apiCall("POST", "users", reqData);
      let users = [...response.data.users];
      console.log("\n\n USEEEEE->", users);
      this.setState({
        users: users,
        allIds: arr,
        lastEvaluatedKey: response.data.lastEvaluatedKey,
        total_users: response.data.total_users,
      });
      async function getLoc(lat, long, i) {
        console.log("\n\n in promise");
        if (lat && long) {
          // Geocode.fromLatLng(String(lat), String(long)).then(res => {
          //   response.data.users[i]['location'] = res.results[0].formatted_address;
          // })
          try {
            let res = await Geocode.fromLatLng(String(lat), String(long));
            response.data.users[i]["location"] =
              res.results[0].formatted_address;
          } catch (error) {
            console.log("\n\n ERR", error);
          }
        }
      }

      let arr = [];
      let promises = [];
      // store.dispatch({
      //   type: 'START_LOADER'
      // })
      for (let i = 0; i < response.data.users.length; i++) {
        arr.push(response.data.users[i].Id);
        this.setState({ skel: true });
        promises.push(
          await getLoc(
            response.data.users[i].Latitude,
            response.data.users[i].Longitude,
            i
          )
        );
        // if (response.data.users[i].Latitude && response.data.users[i].Longitude) {
        //   try {
        //     let loc = await Geocode.fromLatLng(String(response.data.users[i].Latitude), String(response.data.users[i].Longitude))
        //     response.data.users[i]['location'] = loc.results[0].formatted_address;
        //   } catch (error) {
        //     console.log('\n\n ERR',error);
        //   }
        // }
      }

      Promise.all(promises).then(() => {
        // setTimeout(()=>{
        this.setState({ users: response.data.users, skel: false });
        // },1000)
      });
      // store.dispatch({
      //   type: 'STOP_LOADER'
      // })

      // store.dispatch({
      //   type: 'START_LOADER'
      // })
      // response.data.users.map((m, index) => {
      //   arr.push(m.Id);
      //   if (m.Latitude != null && m.Longitude != null) {
      //   promises.push(Geocode.fromLatLng(String(m.Latitude), String(m.Longitude)))
      //   } else {
      //     promises.push([]);
      //   }
      // })
      // Promise.all(promises).then((res) => {
      //   console.log('promise res=>', res);
      //   for (let i = 0; i < res.length; i++) {
      //     users[i]['location'] = res[i].results[0].formatted_address;
      //   }
      // }).then(res => {
      //   this.setState({ users: users, allIds: arr, lastEvaluatedKey: response.data.lastEvaluatedKey, total_users: response.data.total_users });
      //   return
      // })
      // store.dispatch({
      //   type: 'STOP_LOADER'
      // })
      await this.setState({
        users: users,
        allIds: arr,
        lastEvaluatedKey: response.data.lastEvaluatedKey,
        total_users: response.data.total_users,
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
      this.getUsers();
    }
    displayLog(response.code, response.message);
  };

  addUser = () => {
    this.props.history.push(process.env.PUBLIC_URL + "/users/add");
  };

  editUser = (user) => {
    console.log("USER", user);
    let filterData = {
      page_no: this.state.page_no,
      limit: this.state.limit,
      userType: this.state.userType,
      order_by: this.state.order_by,
      sort_by: this.state.sort_by,
      sort_type: this.state.sort_type,
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      searchStr: this.state.searchStr,
      AccountType: user.AccountType,
    };

    if (this.state.is_business === true) {
      localStorage.setItem("BusinessFilters", JSON.stringify(filterData));
      this.props.history.push(
        process.env.PUBLIC_URL + "/business/edit/" + user.Id,
        filterData
      );
    } else {
      localStorage.setItem("UserFilters", JSON.stringify(filterData));
      this.props.history.push(
        process.env.PUBLIC_URL + "/users/edit/" + user.Id,
        filterData
      );
    }

    // localStorage.setItem('UserFilters', JSON.stringify(filterData));
    // window.location.pathname.includes('/business') === true ?
    //   this.props.history.push(process.env.PUBLIC_URL + '/business/edit/' + user.Id, filterData)
    //   :
    //   this.props.history.push(process.env.PUBLIC_URL + '/users/edit/' + user.Id, filterData)
  };

  clearFilters = async () => {
    await this.setState({
      page_no: 1,
      limit: 15,
      userType: "",
      order_by: "DESC",
      sort_by: "",
      sort_type: 1,
      startDate: "",
      endDate: "",
      searchStr: "",
    });
    this.getUsers();
  };

  view = (user) => {
    let filterData = {
      page_no: this.state.page_no,
      limit: this.state.limit,
      userType: this.state.userType,
      order_by: this.state.order_by,
      sort_by: this.state.sort_by,
      sort_type: this.state.sort_type,
    };
    if (this.state.is_business === true) {
      localStorage.setItem("BusinessFilters", JSON.stringify(filterData));
      this.props.history.push(
        process.env.PUBLIC_URL + "/viewBusiness/" + user.Id,
        filterData
      );
    } else {
      localStorage.setItem("UserFilters", JSON.stringify(filterData));
      this.props.history.push(
        process.env.PUBLIC_URL + "/viewUser/" + user.Id,
        filterData
      );
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
    if (
      (this.state.startDate != "" && this.state.startDate != null) ||
      (this.state.endDate != "" && this.state.endDate != null)
    ) {
      if (this.state.startDate != "" && this.state.endDate == "") {
        displayLog(0, "Please enter end date.");
        return;
      }
      if (this.state.endDate != "" && this.state.startDate == "") {
        displayLog(0, "Please enter start date.");
        return;
      } else {
        this.setState({ users: [], page_no: 1 }, () => this.getUsers());
      }
    } else {
      this.setState({ users: [], page_no: 1 }, () => this.getUsers());
    }
    //this.setState({ users: [] });
    //this.getUsers();
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
    let msg;
    if (this.state.is_business === true) {
      msg = "Are you sure,you want to delete business ?";
    } else {
      msg = "Are you sure,you want to delete user ?";
    }
    let confirm = await confirmBox("Wage", msg);
    if (confirm) {
      let response = await apiCall("POST", "deleteUser", reqData);
      if (response.code === 1) {
        this.getUsers();
      }
      if (response.code === 1) {
        await this.setState({ selectedChecBox: [], page_no: 1 });
        document.getElementById("selectAll").checked = false;
        this.getUsers();
      }
      displayLog(response.code, response.message);
    }
  };

  handleCheckbox = (e, id) => {
    if (e.target.checked) {
      this.state.selected.push();
    }
  };

  userRow = (user, index) => {
    return (
      <tr key={index}>
        <td>
          <input
            type="checkbox"
            id={user.Id}
            onClick={(e) => this.changeCheckBox(e)}
            checked={this.state.selectedChecBox.includes(user.Id)}
          ></input>
        </td>
        <td className="text-center">
          {index + 1 + (this.state.page_no - 1) * this.state.limit}
        </td>
        <td className="text-center">{user.FirstName}</td>
        <td className="text-center">{user.LastName}</td>
        <td className="text-center">{user.Email}</td>
        <td className="text-center">
          {user.AccountType == 2
            ? "Business"
            : user.AccountType == 100 || user.AccountType == 200
            ? "Admin"
            : "User"}
        </td>
        <td className="text-center">
          {user.PhoneNumber != null ? user.PhoneNumber : "-"}
        </td>
        <td className="text-center">
          {user.LoginDeviceType != null ? user.LoginDeviceType : "-"}
        </td>
        <td className="text-center">
          {this.state.skel === true ? (
            <h2>
              <Dot>.</Dot>
              <Dot>.</Dot>
              <Dot>.</Dot>
            </h2>
          ) : user.location ? (
            user.location
          ) : (
            "-"
          )}
        </td>
        <td className="text-center">{user.ZipCode || "-"}</td>
        <td className="text-center">{user.AppVersion || "-"}</td>
        <td className="text-center">
          {moment(user.DateCreated).format("YYYY-MM-DD")}
        </td>
        <td className="text-center editText">{user.editedReason || "-"}</td>

        <td>
          {user.IsBlocked == 1 ? (
            <span
              className={"fa fa-toggle-on active action-icon"}
              title={"Activate User"}
              onClick={() => this.activeClickHandler(user, 0, index)}
            ></span>
          ) : (
            <span
              className={"fa fa-toggle-off active action-icon"}
              title={"Deactivate User"}
              onClick={() => this.activeClickHandler(user, 1, index)}
            ></span>
          )}
        </td>
        <td className="text-center w8">
          <span
            className="fa fa-eye action-icon"
            title="View User"
            onClick={() => this.view(user)}
          ></span>
          <span
            className="fa fa-edit edit action-icon"
            title="Edit User"
            onClick={() => this.editUser(user)}
          ></span>
          <span
            className="fa fa-trash action-icon"
            title="Delete User"
            onClick={() => this.delete(user)}
          ></span>
        </td>
      </tr>
    );
  };

  businessRow = (data, index) => {
    return (
      <tr key={index}>
        <td>
          <input
            type="checkbox"
            id={data.Id}
            onClick={(e) => this.changeCheckBox(e)}
            checked={this.state.selectedChecBox.includes(data.Id)}
          ></input>
        </td>
        <td className="text-center">
          {index + 1 + (this.state.page_no - 1) * this.state.limit}
        </td>
        <td className="text-left pl-3">{data.Email}</td>
        <td className="text-left pl-3">{data.BusinessName}</td>
        <td className="text-left pl-3">{data.BusinessAddressCity}</td>
        <td className="text-left pl-3">{data.BusinessAddressStreet}</td>
        <td className="text-left pl-3">{data.LoginDeviceType}</td>
        <td className="text-left pl-3">{data.BusinessWebAddress}</td>
        <td className="text-center pl-3">
          {data.BusinessPhoneNumber != null ? data.BusinessPhoneNumber : "-"}
        </td>
        <td className="text-center pl-3">
          {moment(data.DateCreated).format("YYYY-MM-DD")}
        </td>
        <td className="text-center pl-3 editText">
          {data.editedReason || "-"}
        </td>

        <td>
          {data.IsBlocked == 1 ? (
            <span
              className={"fa fa-toggle-on active action-icon"}
              title={"Activate Business"}
              onClick={() => this.activeClickHandler(data, 0, index)}
            ></span>
          ) : (
            <span
              className={"fa fa-toggle-off active action-icon"}
              title={"Deactivate Business"}
              onClick={() => this.activeClickHandler(data, 1, index)}
            ></span>
          )}
        </td>
        <td className="text-center">
          <span
            className="fa fa-eye action-icon"
            title="View Business"
            onClick={() => this.view(data)}
          ></span>
          <span
            className="fa fa-edit edit action-icon"
            title="Edit Business"
            onClick={() => this.editUser(data)}
          ></span>
          <span
            className="fa fa-trash action-icon"
            title="Delete Business"
            onClick={() => this.delete(data)}
          ></span>
        </td>
      </tr>
    );
  };
  changeLimit = (e) => {
    this.setState({ limit: +e.target.value, page_no: 1 }, () => {
      this.getUsers();
    });
  };
  changeFilter = (e) => {
    this.setState({ userType: +e.target.value, page_no: 1 }, () => {
      this.getUsers();
    });
  };
  SortingHandler = (sort_by) => {
    if (this.state.sort_type === 0) {
      this.setState({ sort_type: 1, sort_by: sort_by, order_by: "DESC" }, () =>
        this.getUsers()
      );
    } else {
      this.setState({ sort_type: 0, sort_by: sort_by, order_by: "ASC" }, () =>
        this.getUsers()
      );
    }
  };

  download = () => {
    if (this.state.is_business === true) {
      const fileName = "Wage_businesses.xlsx";
      const finalData = [];
      for (let data of this.state.users) {
        if (this.state.selectedChecBox.includes(data.Id)) {
          console.log("\n\nDATA is---->>>", data);
          finalData.push({
            Id: data.Id,
            ["Email"]: data.Email,
            ["Business Name"]: data.BusinessName,
            ["City"]: data.BusinessAddressCity,
            ["Street"]: data.BusinessAddressStreet,
            ["Website"]: data.BusinessWebAddress,
            ["Phone Number"]: data.BusinessPhoneNumber,
          });
        }
      }
      const ws = XLSX.utils.json_to_sheet(finalData, { dateNF: "YYYY-MM-DD" });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Edit Business");

      XLSX.writeFile(wb, fileName);
    } else {
      const fileName = "Wage_Users.xlsx";
      const finalData = [];
      for (let data of this.state.users) {
        if (this.state.selectedChecBox.includes(data.Id)) {
          console.log("\n\nDATA is---->>>", data);
          finalData.push({
            Id: data.Id,
            ["First Name"]: data.FirstName,
            ["Last Name"]: data.LastName,
            ["Email"]: data.Email,
            ["Account Type"]:
              data.AccountType == 2
                ? "Business"
                : data.AccountType == 100
                ? "Admin"
                : "User",
            ["Phone Number"]: data.PhoneNumber,
            ["Business Name"]: data.BusinessName,
            ["City"]: data.BusinessAddressCity,
            ["Street"]: data.BusinessAddressStreet,
            ["Website"]: data.BusinessWebAddress,
            ["Business Phone Number"]: data.BusinessPhoneNumber,
          });
        }
      }
      const ws = XLSX.utils.json_to_sheet(finalData, { dateNF: "YYYY-MM-DD" });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Edit Users");

      XLSX.writeFile(wb, fileName);
    }
  };
  allEmails = async () => {
    let data = {};
    if (
      (this.state.startDate != "" && this.state.startDate != null) ||
      (this.state.endDate != "" && this.state.endDate != null)
    ) {
      if (this.state.startDate != "" && this.state.endDate == "") {
        displayLog(0, "Please enter end date.");
        return;
      }
      if (this.state.endDate != "" && this.state.startDate == "") {
        displayLog(0, "Please enter start date.");
        return;
      }
    }
    if (this.state.startDate !== "") {
      data.startDate = this.state.startDate;
    }
    if (this.state.endDate !== "") {
      data.endDate = this.state.endDate;
    }
    if (this.state.is_business === true) {
      data.is_business = this.state.is_business;
    }
    let res = await apiCall("POST", "getAllEmails", data);
    if (res.data && res.data.length > 0) {
      const fileName = "Wage_emails.xlsx";
      const finalData = [];
      for (let data of res.data) {
        store.dispatch({
          type: "START_LOADER",
        });
        finalData.push({
          ["Email"]: data.Email,
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
  dateHandler = (e) => {
    console.log("\n\n\n $$$$", e.target.value);
    this.setState({ [e.target.name]: e.target.value });
  };

  sendNotification = () => {
    let ids = this.state.selectedChecBox;
    this.props.history.push(process.env.PUBLIC_URL + "/notification", ids);
  };
  render() {
    console.log("STATE::::>>>>>", this.state);
    return (
      <div className="animated fadeIn">
        <Row>
          <Col xl={12}>
            <Card>
              <CardHeader>
                <h4>{this.state.is_business ? "Businesses" : "Users"}</h4>
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
                  {window.location.pathname.includes("/business") === true && (
                    <Col sm="12" md="2" className="mb-3 mb-xl-0"></Col>
                  )}
                  {window.location.pathname.includes("/business") === false && (
                    <Col sm="12" md="2" className="mb-3 mb-xl-0">
                      <Input
                        type="select"
                        name="userType"
                        value={this.state.userType}
                        onChange={(e) => this.changeFilter(e)}
                      >
                        <option value="">Select Filter</option>
                        <option value={1}>Service Provider</option>
                        <option value={2}>Service Seeker/User</option>
                        <option value={4}>Admin Users</option>
                      </Input>
                    </Col>
                  )}
                  <Col sm="12" md="2" className="mb-3 mb-xl-0">
                    <Input
                      type="date"
                      name="startDate"
                      value={this.state.startDate}
                      onChange={(e) => this.dateHandler(e)}
                    ></Input>
                    {/* <DatePicker
                      selected={this.state.startDate}
                      onChange={this.handleChange}
                    /> */}
                  </Col>
                  <Col sm="12" md="2" className="mb-3 mb-xl-0">
                    <Input
                      type="date"
                      placeholder="Date"
                      name="endDate"
                      value={this.state.endDate}
                      onChange={(e) => this.dateHandler(e)}
                    ></Input>

                    {/* <DatePicker
                      selected={this.state.endDate}
                      onChange={this.handleChangeEndDate}
                    /> */}
                  </Col>
                  <Col sm="12" md="2" xs className="mb-3 mb-xl-0">
                    <Input
                      type="text"
                      placeholder={`Search by name or email`}
                      value={this.state.searchStr}
                      name="searchStr"
                      onChange={(e) => this.changeSearch(e)}
                      onKeyPress={(e) => this.enterPressed(e)}
                    />
                  </Col>
                  <Col sm="12" md="2" xs className="mb-3 mb-xl-0">
                    <Button
                      block
                      color="primary"
                      size="sm"
                      onClick={() => this.search()}
                    >
                      Search
                    </Button>
                  </Col>
                  <Col sm="12" md="1" xs className="mb-3 mb-xl-0">
                    <Button
                      block
                      color="primary"
                      size="sm"
                      onClick={() => this.clearFilters()}
                    >
                      Clear
                    </Button>
                  </Col>
                </Row>
                {/* <Row>
                <Col sm="12" md="2" className="mb-3 mb-xl-0">
                    <Input type="select" name="userType" value={this.state.userType} onChange={(e) => this.changeFilter(e)} >
                      <option value=''>Select Type</option>
                      <option value={1}>Service Provider</option>
                      <option value={2}>Service Seeker</option>
                      <option value={3}>Business Account</option>
                      <option value={4}>Admin Users</option>
                    </Input>
                  </Col>
                </Row> */}
              </CardBody>
              {this.state.selectedChecBox.length > 0 && (
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
              )}
              <CardBody>
                {this.state.is_business === false ? (
                  <Table bordered striped responsive size="sm">
                    <thead>
                      <tr>
                        <th scope="col">
                          <input
                            type="checkbox"
                            id="selectAll"
                            onClick={(e) => this.changeCheckBox(e)}
                          ></input>
                        </th>
                        <th scope="col" className="text-center">
                          No
                        </th>
                        <th scope="col" className="text-center">
                          First Name{" "}
                          <i
                            className="fa fa-sort cursor-pointer"
                            aria-hidden="true"
                            onClick={() => this.SortingHandler("FirstName")}
                          ></i>
                        </th>
                        <th scope="col" className="text-center">
                          Last Name{" "}
                          <i
                            className="fa fa-sort cursor-pointer"
                            aria-hidden="true"
                            onClick={() => this.SortingHandler("LastName")}
                          ></i>
                        </th>
                        <th scope="col" className="text-center">
                          Email{" "}
                          <i
                            className="fa fa-sort cursor-pointer"
                            aria-hidden="true"
                            onClick={() => this.SortingHandler("Email")}
                          ></i>
                        </th>
                        <th scope="col" className="text-center">
                          Account Type
                        </th>
                        <th scope="col" className="text-center">
                          Phone Number
                        </th>
                        <th scope="col" className="text-center">
                          Platform
                        </th>
                        <th scope="col" className="text-center">
                          Location
                        </th>
                        <th scope="col" className="text-center">
                          Zipcode
                        </th>
                        <th scope="col" className="text-center">
                          App Version
                        </th>
                        <th scope="col" className="text-center">
                          Created date{" "}
                          <i
                            className="fa fa-sort cursor-pointer"
                            aria-hidden="true"
                            onClick={() => this.SortingHandler("DateCreated")}
                          ></i>
                        </th>
                        <th scope="col" className="text-center editNote">
                          Edit Note
                        </th>
                        <th scope="col" className="text-center">
                          Block
                        </th>
                        <th scope="col" className="text-center actionBlock">
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
                          <td colSpan={15}> No Data Found </td>
                        </tr>
                      </tbody>
                    )}
                  </Table>
                ) : (
                  <Table bordered striped responsive size="sm">
                    <thead>
                      <tr>
                        <th scope="col" rowSpan="2">
                          <input
                            type="checkbox"
                            id="selectAll"
                            onClick={(e) => this.changeCheckBox(e)}
                          ></input>
                        </th>
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
                          Email{" "}
                          <i
                            className="fa fa-sort cursor-pointer"
                            aria-hidden="true"
                            onClick={() => this.SortingHandler("Email")}
                          ></i>
                        </th>
                        <th
                          scope="col"
                          rowSpan="2"
                          className="text-center align-middle"
                        >
                          Business Name{" "}
                          <i
                            className="fa fa-sort cursor-pointer"
                            aria-hidden="true"
                            onClick={() => this.SortingHandler("BusinessName")}
                          ></i>
                        </th>
                        <th
                          scope="col"
                          rowSpan="2"
                          className="text-center align-middle"
                        >
                          City{" "}
                          <i
                            className="fa fa-sort cursor-pointer"
                            aria-hidden="true"
                            onClick={() =>
                              this.SortingHandler("BusinessAddressCity")
                            }
                          ></i>
                        </th>
                        <th
                          scope="col"
                          rowSpan="2"
                          className="text-center align-middle"
                        >
                          Street{" "}
                          <i
                            className="fa fa-sort cursor-pointer"
                            aria-hidden="true"
                            onClick={() =>
                              this.SortingHandler("BusinessAddressStreet")
                            }
                          ></i>
                        </th>
                        <th scope="col" className="text-center">
                          Platform
                        </th>
                        <th
                          scope="col"
                          rowSpan="2"
                          className="text-center align-middle"
                        >
                          Website
                        </th>
                        <th
                          scope="col"
                          rowSpan="2"
                          className="text-center align-middle"
                        >
                          Phone Number
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
                        <th scope="col" className="text-center editNote">
                          Edit Note
                        </th>
                        <th
                          scope="col"
                          rowSpan="2"
                          className="text-center align-middle"
                        >
                          Block
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
                          this.businessRow(user, index)
                        )}
                      </tbody>
                    ) : (
                      <tbody>
                        <tr className="text-center">
                          <td colSpan={12}> No Data Found </td>
                        </tr>
                      </tbody>
                    )}
                  </Table>
                )}
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

export default Users;
