import React, { Component } from 'react';
import { Card, CardBody, CardHeader, Col, Row, Table, Button, Input } from 'reactstrap';
import { apiCall, displayLog } from '../../utils/common';
import ReactPaginate from 'react-paginate';
import NumberFormat from 'react-number-format';
import XLSX from 'xlsx';
import moment from 'moment';


class Report extends Component {
  state = {
    list: [],
    locations: [],
    categories: [],
    page_no: 1,
    limit: 15,
    lastEvaluatedKey: undefined,
    searchStr: '',
    total: '',
    location: '',
    price: '',
    taskType: '',
    status: '',
    order_by: "DESC",
    sort_by: "",
    sort_type: 1,
    Type: '',
    selectedChecBox: [],
    allIds: []
  }

  clearState = async () => {
    await this.setState({
      searchStr: '',
      page_no: 1,
      limit: 15,
      location: '',
      price: '',
      taskType: '',
      status: '',
      order_by: "DESC",
      sort_by: "",
      sort_type: 1,
      list: [],
    })
    // this.getReports();
  }

  isBottom(el) {
    return el.getBoundingClientRect().bottom <= window.innerHeight;
  }

  async componentDidMount() {
    // document.addEventListener('scroll', this.trackScrolling);
    if (this.props.location.state) {
      console.log('\n\n\n\n ######->', this.props.location.state);
      this.setState({ ...this.props.location.state }, () => this.getReports())
      await this.props.history.replace({ pathname: this.props.location.pathname, state: {} })
    }
    // this.getReports();
    this.getFilterData();
  }

  componentWillUnmount() {
    // document.addEventListener('scroll', this.trackScrolling);
  }

  handlePageClick = (e) => {
    this.setState({ page_no: e.selected + 1 }, () => {
      this.getReports();
    });
  }

  trackScrolling = () => {
    const wrappedElement = document.getElementsByClassName('main')[0];
    if (this.isBottom(wrappedElement)) {
      document.removeEventListener('scroll', this.trackScrolling);
      this.getReports();
    }
  };
  getFilterData = async () => {
    let response = await apiCall('POST', 'getReportFilters');
    this.setState({ locations: response.locations, categories: response.category })
  }

  getReports = async () => {
    let reqData = {
      page_no: this.state.page_no,
      limit: this.state.limit,
      sort_by: this.state.sort_by,
      sort_type: this.state.sort_type,
      order_by: this.state.order_by
    };
    if (this.state.lastEvaluatedKey) {
      reqData.lastEvaluatedKey = this.state.lastEvaluatedKey;
    }
    if (this.state.searchStr !== '') {
      reqData.searchStr = this.state.searchStr.trim()
    }
    if (this.state.price !== '') {
      reqData.price = this.state.price
    }
    if (this.state.location !== '') {
      reqData.location = this.state.location
    }
    if (this.state.taskType !== '') {
      reqData.taskType = this.state.taskType
    }
    if (this.state.status !== '') {
      reqData.status = this.state.status.toString()
    }
    if (this.state.Type !== '') {
      reqData.type = this.state.Type
    }
    let response = await apiCall('POST', 'getReport', reqData);
    let list = [...response.data];
    let arr = []
    list.map(m => {
      arr.push(m.Id);
    })
    this.setState({ list: list, allIds: arr, lastEvaluatedKey: response.data.lastEvaluatedKey, total: response.total });
    if (response.data.lastEvaluatedKey) {
      document.addEventListener('scroll', this.trackScrolling);
    }
  }

  activeClickHandler = async (user, flag, index) => {
    let reqData = {
      id: user.Id,
      blockStatus: flag
    }
    let response = await apiCall('POST', 'changeBlockStatus', reqData);
    if (response.code === 1) {
      this.getReports();
    }
    displayLog(response.code, response.message);
  }

  addUser = () => {
    this.props.history.push(process.env.PUBLIC_URL + '/users/add');
  }

  editUser = (user) => {
    this.props.history.push(process.env.PUBLIC_URL + '/users/edit/' + user.Id);
  }

  changeSearch = (e) => {
    let text = String(e.target.value);
    this.setState({ searchStr: text })
  }
  enterPressed = async (event) => {
    var code = event.keyCode || event.which;
    if (code === 13) { //13 is the enter keycode
      await this.setState({ page_no: 1 })
      this.search()
    }
  }
  search() {
    this.setState({ users: [] });
    this.getReports();
  }

  delete = async (user) => {
    let reqData = {
      id: user.Id,
    }
    let response = await apiCall('POST', 'deleteUser', reqData);
    if (response.code === 1) {
      this.getReports();
    }
    displayLog(response.code, response.message);
  }
  view = () => {

  }

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
        arr.push(Number(e.target.id));
        this.setState({ selectedChecBox: arr })
      } else {
        let arr = []
        var i = this.state.selectedChecBox.filter((element) => {
          return element !== Number(e.target.id)
        });
        i.map((data) => {
          arr.push(data)
        })
        await this.setState({ selectedChecBox: i });
        if (this.state.selectedChecBox.length === 0) {
          console.log('\n\n\n @@@@@@@@@@@@');
          document.getElementById('selectAll').checked = false;
        }
      }
    }
  }

  Row = (data, index) => {
    return (
      < tr key={index} >
        <td><input type="checkbox" id={data.Id} onClick={(e) => this.changeCheckBox(e)} checked={this.state.selectedChecBox.includes(Number(data.Id))}></input></td>
        <td className="text-center">{index + 1 + ((this.state.page_no - 1) * this.state.limit)}</td>
        <td className="text-left pl-3">{data.FirstName ? data.FirstName : "-"}</td>
        <td className="text-left pl-3">{data.Title ? data.Title : "-"}</td>
        <td className="text-left pl-3">{data.category_name ? data.category_name : "-"}</td>
        <td className="text-left pl-3">{data.Type == 0 ? 'Gig' : data.Type == 1 ? 'Service' : null}</td>
        <td className="text-left pl-3">{data.StateFullName ? data.StateFullName : "-"}</td>
        <td className="text-left pl-3">
          {data.Price ? <NumberFormat value={data.Price} displayType={'text'} thousandSeparator={true} prefix={'$'} /> : '-'}
        </td>
        <td className="text-left pl-3">{moment(data.DateCreated).format('DD-MM-YYYY')}</td>
        <td className="text-left pl-3">{data.Status == 3 ? "Completed" : data.Status == 1 ? "Pending" : data.Status == 2 ? "InProgress" : data.Status == 0 ? "Not declared" : ""}</td>
        {/* <td className="text-center">
          <span key={index} className="fa fa-eye action-icon" title="View convarsation" onClick={() => this.view(data)}></span>
        </td> */}
      </tr >
    )
  }
  changeLimit = (e) => {
    this.setState({ limit: +e.target.value, page_no: 1 }, () => {
      this.getReports();
    });
  }
  changeFilter = (e, flag) => {
    // this.setState({ searchStr: '' })
    if (flag == 1) {
      this.setState({ location: e.target.value, page_no: 1 }, () => {
        this.getReports();
      });
    } else if (flag == 2) {
      this.setState({ taskType: e.target.value, page_no: 1 }, () => {
        this.getReports();
      });
    } else if (flag == 3) {
      this.setState({ price: e.target.value, page_no: 1 }, () => {
        this.getReports();
      });
    } else {
      this.setState({ status: e.target.value, page_no: 1 }, () => {
        this.getReports();
      });
    }

  }

  SortingHandler = (sort_by) => {
    if (this.state.sort_type === 0) {
      this.setState({ sort_type: 1, sort_by: sort_by, order_by: "DESC" }, () => this.getReports())
    } else {
      this.setState({ sort_type: 0, sort_by: sort_by, order_by: "ASC" }, () => this.getReports())

    }

  }

  download = (selectedData) => {
    const fileName = 'Wage_Report.xlsx';
    const finalData = []
    if (selectedData) {
      for (let data of this.state.list) {
        if (this.state.selectedChecBox.includes(data.Id)) {
          console.log('\n\nDATA is---->>>', data);
          finalData.push({
            Id: data.Id,
            ['First Name']: data.FirstName,
            ['Last Name']: data.LastName,
            ['Offer Name']: data.Title,
            ['Offer Description']: data.Description,
            ['Posted Date']: moment(data.DateCreated).format('DD-MM-YYYY'),
            ['Category Name']: data.category_name,
            ['Type']: data.Type == 0 ? 'Gig' : 'Service',
            Locality: data.Locality,
            StateFullName: data.StateFullName,
            StateShortName: data.StateShortName,
            Price: data.Price ? "$" + data.Price : "",
            Status: data.Status == '1' ? "Pending" : data.Status == '2' ? "InProgress" : data.Status == '3' ? "Completed" : data.Status == '3' ? "Not declared" : "",
          })
        }
      }
    } else {
      for (let data of this.state.list) {
        console.log('\n\nDATA is---->>>', data);
        finalData.push({
          Id: data.Id,
          ['First Name']: data.FirstName,
          ['Last Name']: data.LastName,
          ['Offer Name']: data.Title,
          ['Offer Description']: data.Description,
          ['Posted Date']: moment(data.DateCreated).format('DD-MM-YYYY'),
          ['Category Name']: data.category_name,
          ['Type']: data.Type == 0 ? 'Gig' : 'Service',
          Locality: data.Locality,
          StateFullName: data.StateFullName,
          StateShortName: data.StateShortName,
          Price: data.Price ? "$" + data.Price : "",
          Status: data.Status == '1' ? "Pending" : data.Status == '2' ? "InProgress" : data.Status == '3' ? "Completed" : data.Status == '3' ? "Not declared" : "",
        })
      }
    }
    const ws = XLSX.utils.json_to_sheet(finalData, { dateNF: "YYYY-MM-DD" });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Edit Report');

    XLSX.writeFile(wb, fileName);
  }

  changeType = (e) => {
    console.log('\n\n\n &^&^&^&^&^hhhhhh->');
    this.setState({ [e.target.name]: e.target.value }, () => this.getReports())
  }

  sendNotification = () => {
    let ids = [];
    this.state.list.filter(el => {
      console.log('\n\n&&&->', el);
      if (this.state.selectedChecBox.includes(el.Id)) {
        console.log('YYYYYYYYYYYYYYYYYyy', el.user_id);
        let user_id = el.user_id
        ids.push(user_id)
        return
      }
    })
    console.log('\n\n\n $%$%$%$%$%$%->', ids);
    this.props.history.push(process.env.PUBLIC_URL + '/notification', ids)
  }

  render() {
    console.log('\n\n\n---->>>', this.state);
    return (
      <div className="animated fadeIn">
        <Row>
          <Col xl={12}>
            <Card>
              <CardHeader>
                <h4>Reports</h4>
              </CardHeader>
              <CardBody>
                <Row className="align-items-right">
                  <Col sm="12" md="2" className="mb-3 mb-xl-0">
                    <Button block color="primary" size="sm" onClick={() => this.download()}>Export CSV
</Button>

                    {/* <Input type="select" name="limit" value={this.state.limit} onChange={(e) => this.changeLimit(e)} >
                      <option value={15}>15</option>
                      <option value={30}>30</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </Input> */}
                  </Col>
                  <Col sm="12" md="2" className="mb-3 mb-xl-0">
                    <Input type="select" name="Type" value={this.state.Type} onChange={(e) => this.changeType(e)} >
                      <option value=''>Select Type</option>
                      <option value={1}>Service</option>
                      <option value={0}>Gig</option>
                    </Input>
                  </Col>
                  <Col sm="12" md="1" xs className="mb-3 mb-xl-0"></Col>

                  <Col sm="12" md="3" xs className="mb-3 mb-xl-0">
                    <Input type="text" placeholder={`Search by name, category or location`}
                      value={this.state.searchStr}
                      name="searchStr" onChange={(e) => this.changeSearch(e)}
                      onKeyPress={(e) => this.enterPressed(e)} />
                  </Col>
                  <Col sm="12" md="2" xs className="mb-3 mb-xl-0">
                    <Button block color="primary" size="sm" onClick={() => this.search()}>Search</Button>
                  </Col>
                  <Col sm="12" md="2" xs className="mb-3 mb-xl-0">
                    <Button block color="primary" size="sm" onClick={() => this.clearState()}>Clear</Button>
                  </Col>
                </Row>
                <Row className="pt-4">
                  <Col sm="12" md="3" className="mb-3 mb-xl-0">
                    <Input type="select" name="location" value={this.state.location} onChange={(e) => this.changeFilter(e, 1)} >
                      <option value=''>Select Location</option>
                      {
                        this.state.locations.map((l, index) => (
                          <option value={l.StateFullName} key={l.StateFullName}>{l.StateFullName}</option>
                        ))
                      }
                    </Input>
                  </Col>
                  <Col sm="12" md="3" className="mb-3 mb-xl-0">
                    <Input type="select" name="taskType" value={this.state.taskType} onChange={(e) => this.changeFilter(e, 2)} >
                      <option value=''>Select category</option>
                      {
                        this.state.categories.map((c, index) => (
                          <option key={c.Name} value={c.Name}>{c.Name}</option>
                        ))
                      }
                    </Input>
                  </Col>
                  <Col sm="12" md="3" className="mb-3 mb-xl-0">
                    <Input type="select" name="price" value={this.state.price} onChange={(e) => this.changeFilter(e, 3)} >
                      <option value=''>Select Price</option>
                      <option value={1}>0 - 50</option>
                      <option value={2}>51 - 100</option>
                      <option value={3}>Above 100</option>
                    </Input>
                  </Col>
                  <Col sm="12" md="3" className="mb-3 mb-xl-0">
                    <Input type="select" name="status" value={this.state.status} onChange={(e) => this.changeFilter(e, 4)} >
                      <option value=''>Select Status</option>
                      <option value={3}>Completed</option>
                      <option value={0}>Open</option>
                      <option value={2}>InProgress</option>
                      <option value={1}>Pending</option>
                    </Input>
                  </Col>
                </Row>
              </CardBody>
              {
                this.state.selectedChecBox.length > 0 &&
                <Row className="pt-3 pl-4">
                  <Col sm="12" md="2" className="mb-3 mb-xl-0">
                    <Button block color="primary" size="sm" onClick={() => this.download(true)}>Export selected to CSV</Button>
                  </Col>
                  <Col sm="12" md="2" className="mb-3 mb-xl-0">
                    <Button block color="primary" size="sm" onClick={() => this.sendNotification()}>Send Notification</Button>
                  </Col>
                </Row>
              }
              <CardBody>
                <Table bordered striped responsive size="sm">
                  <thead>
                    <tr>
                      <th scope="col" rowSpan="2"><input type="checkbox" id="selectAll" onClick={(e) => this.changeCheckBox(e)}></input></th>
                      <th scope="col" rowSpan="2" className="text-center align-middle">No</th>
                      <th scope="col" rowSpan="2" className="text-left align-left pl-3">User Name <i className="fa fa-sort cursor-pointer" aria-hidden="true" onClick={() => this.SortingHandler('aspnetusers.FirstName')}></i></th>
                      <th scope="col" rowSpan="2" className="text-left align-left pl-3 w-25">Offer Name <i className="fa fa-sort cursor-pointer" aria-hidden="true" onClick={() => this.SortingHandler('offers.Title')}></i></th>
                      <th scope="col" rowSpan="2" className="text-left align-left pl-3">Category <i className="fa fa-sort cursor-pointer" aria-hidden="true" onClick={() => this.SortingHandler('offercategories.Name')}></i></th>
                      <th scope="col" rowSpan="2" className="text-left align-left pl-3">Type <i className="fa fa-sort cursor-pointer" aria-hidden="true" onClick={() => this.SortingHandler('offercategories.Name')}></i></th>
                      <th scope="col" rowSpan="2" className="text-left align-left pl-3">Location <i className="fa fa-sort cursor-pointer" aria-hidden="true" onClick={() => this.SortingHandler('offers.StateFullName')}></i></th>
                      <th scope="col" rowSpan="2" className="text-left align-left pl-3">Price <i className="fa fa-sort cursor-pointer" aria-hidden="true" onClick={() => this.SortingHandler('offers.Price')}></i></th>
                      <th scope="col" rowSpan="2" className="text-left align-left pl-3">Created On</th>                      
                      
                      <th scope="col" rowSpan="2" className="text-left align-left pl-3">status</th>
                      {/* <th scope="col" colSpan="3" rowSpan="2" className="text-center align-middle">Action</th> */}
                    </tr>
                  </thead>
                  {this.state.list.length > 0 ?
                    <tbody>
                      {this.state.list.map((user, index) =>
                        this.Row(user, index)
                      )}
                    </tbody>
                    :
                    <tbody>
                      <tr className="text-center"><td colSpan={10}> No Data Found </td></tr>
                    </tbody>
                  }
                </Table>
              </CardBody>
            </Card>
            {/* <Row>
              <Col>
                <ReactPaginate
                  pageCount={Math.ceil(this.state.total / this.state.limit)}
                  onPageChange={this.handlePageClick}
                  previousLabel={'Previous'}
                  nextLabel={'Next'}
                  breakLabel={'...'}
                  breakClassName={'page-item'}
                  breakLinkClassName={'page-link'}
                  containerClassName={'pagination justify-content-end'}
                  pageClassName={'page-item'}
                  pageLinkClassName={'page-link'}
                  previousClassName={'page-item'}
                  previousLinkClassName={'page-link'}
                  nextClassName={'page-item'}
                  nextLinkClassName={'page-link'}
                  activeClassName={'active'}
                  forcePage={this.state.page_no - 1}
                />
              </Col>
            </Row> */}
          </Col>
        </Row>
      </div>
    )
  }
}

export default Report;
