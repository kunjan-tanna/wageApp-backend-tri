import React, { Component } from 'react';
import { Card, CardBody, CardHeader, Col, Row, Table, Button, Input } from 'reactstrap';
import { apiCall, displayLog } from '../../utils/common';
import ReactPaginate from 'react-paginate';
import NumberFormat from 'react-number-format';
import XLSX from 'xlsx';
import moment from 'moment';


class MasterReport extends Component {
    state = {
        list: [],
        filter: "",
        startDate: "",
        endDate: ""
    }

    changeFilter = (e) => {
        if (e.target.name == 'filter') {
            this.setState({ [e.target.name]: e.target.value, startDate: "", endDate: "" })
        } else {
            this.setState({ [e.target.name]: e.target.value, filter: "" })
        }
    }

    getMasterReportData = async () => {
        let reqData = {}
        let resData;

        if (this.state.startDate == '' && this.state.endDate == '' && this.state.filter == '') {
            displayLog(0, 'Please select date or filter');
            return
        }
        if (this.state.filter != '') {
            reqData.filter = this.state.filter
            resData = await apiCall('POST', 'getMasterReport', reqData);
        } else {
            if (this.state.startDate == '') {
                displayLog(0, 'Please enter start date.');
                return
            }
            if (this.state.endDate == '') {
                displayLog(0, 'Please enter end date.');
                return
            }
            if ((this.state.startDate != '' && this.state.startDate != null) || (this.state.endDate != '' && this.state.endDate != null)) {
                if (this.state.startDate != '' && this.state.endDate == '') {
                    displayLog(0, 'Please enter end date.');
                    return
                }
                if (this.state.endDate != '' && this.state.startDate == '') {
                    displayLog(0, 'Please enter start date.');
                    return
                }
                if (moment(this.state.endDate).isBefore(moment(this.state.startDate))) {
                    displayLog(0, `End date can't be less than start date`);
                    return
                }
                else {
                    reqData.startDate = this.state.startDate
                    reqData.endDate = this.state.endDate
                    resData = await apiCall('POST', 'getMasterReport', reqData);
                }
            }
        }
        const fileName = 'Wage_Master_Report.xlsx';
        let tmpData = []
        let wb = XLSX.utils.book_new();
        if (resData.data.length > 0) {
            let tmpState = resData.data[0].StateFullName;
            for (let i = 0; i < resData.data.length; i++) {
                if (resData.data[i].StateFullName == tmpState) {
                    tmpData.push({
                        id: resData.data[i].id,
                        ['First Name']: resData.data[i].FirstName,
                        ['Last Name']: resData.data[i].LastName,
                        ['Offer Name']:resData.data[i].Title,
                        Description: resData.data[i].Description,
                        ['Posted Date']: moment(resData.data[i].DateCreated).format('DD-MM-YYYY'),
                        ['Category Name']:resData.data[i].category_name,
                        Type: resData.data[i].Type == 0 ? 'Gig' : 'Service',
                        Locality: resData.data[i].Locality,
                        StateFullName: resData.data[i].StateFullName,
                        StateShortName: resData.data[i].StateShortName,
                        price: resData.data[i].price != null ? "$" + resData.data[i].price : "",
                        status: resData.data[i].status == '1' ? "Pending" : resData.data[i].status == '2' ? "InProgress" : resData.data[i].status == '3' ? "Completed" : resData.data[i].status == '3' ? "Not declared" : "",
                    })
                } else {
                    const ws = XLSX.utils.json_to_sheet(tmpData, { dateNF: "YYYY-MM-DD" });
                    XLSX.utils.book_append_sheet(wb, ws, tmpState);
                    tmpData = []
                    tmpState = resData.data[i].StateFullName
                    i = i - 1
                }
            }
            XLSX.writeFile(wb, fileName);
        } else {
            displayLog(0, "No data found");
        }
    }

    // Row = (data, index) => {
    //     return (
    //         <tr key={index}>
    //             <td className="text-center">{index + 1 + ((this.state.page_no - 1) * this.state.limit)}</td>
    //             <td className="text-left pl-3">{data.FirstName ? data.FirstName : "-"}</td>
    //             <td className="text-left pl-3">{data.Title ? data.Title : "-"}</td>
    //             <td className="text-left pl-3">{data.category_name ? data.category_name : "-"}</td>
    //             <td className="text-left pl-3">{data.Type == 0 ? 'Gig' : data.Type == 1 ? 'Service' : null}</td>
    //             <td className="text-left pl-3">{data.StateFullName ? data.StateFullName : "-"}</td>
    //             <td className="text-left pl-3">
    //                 {data.Price ? <NumberFormat value={data.Price} displayType={'text'} thousandSeparator={true} prefix={'$'} /> : '-'}
    //             </td>
    //             <td className="text-left pl-3">{moment(data.DateCreated).format('DD-MM-YYYY')}</td>
    //             <td className="text-left pl-3">{data.Status == 3 ? "Completed" : data.Status == 1 ? "Pending" : data.Status == 2 ? "InProgress" : data.Status == 0 ? "Not declared" : ""}</td>
               
    //         </tr >
    //     )
    // }
    render() {
        return (
            <div className="animated fadeIn">
                <Row>
                    <Col xl={12}>
                        <Card>
                            <CardHeader>
                                <h4>Master Report</h4>
                            </CardHeader>
                            <CardBody>
                                <Row className="align-items-right">
                                    <Col sm="12" md="2" className="mb-3 mb-xl-0">
                                        <Input type="date" name="startDate" value={this.state.startDate} onChange={(e) => this.changeFilter(e)}></Input>
                                    </Col>
                                    <Col sm="12" md="2" className="mb-3 mb-xl-0">
                                        <Input type="date" placeholder="Date" name="endDate" value={this.state.endDate} onChange={(e) => this.changeFilter(e)}></Input>
                                    </Col>
                                    <Col sm="12" md="3" className="mb-3 mb-xl-0">
                                        <Input type="select" name="filter" value={this.state.filter} onChange={(e) => this.changeFilter(e)} >
                                            <option value=''>Select filter</option>
                                            <option value={1}>This Week</option>
                                            <option value={2}>Last Week</option>
                                            <option value={3}>This Month</option>
                                            <option value={4}>Last Month</option>
                                        </Input>
                                    </Col>
                                    <Col sm="12" md="3" xs className="mb-3 mb-xl-0"></Col>
                                    <Col sm="12" md="2" className="mb-3 mb-xl-0">
                                        <Button block color="primary" size="sm" onClick={() => this.getMasterReportData()}>Export CSV
                                        </Button>
                                    </Col>

                                </Row>

                            </CardBody>
                            {/* <CardBody>
                                <Table bordered striped responsive size="sm">
                                    <thead>
                                        <tr>
                                            <th scope="col" rowSpan="2" className="text-center align-middle">No</th>
                                            <th scope="col" rowSpan="2" className="text-left align-left pl-3">User Name <i className="fa fa-sort cursor-pointer" aria-hidden="true" onClick={() => this.SortingHandler('aspnetusers.FirstName')}></i></th>
                                            <th scope="col" rowSpan="2" className="text-left align-left pl-3 w-25">Discription<i className="fa fa-sort cursor-pointer" aria-hidden="true" onClick={() => this.SortingHandler('offers.Title')}></i></th>
                                            <th scope="col" rowSpan="2" className="text-left align-left pl-3">Posted On<i className="fa fa-sort cursor-pointer" aria-hidden="true" onClick={() => this.SortingHandler('offercategories.Name')}></i></th>
                                            <th scope="col" rowSpan="2" className="text-left align-left pl-3">Type <i className="fa fa-sort cursor-pointer" aria-hidden="true" onClick={() => this.SortingHandler('offercategories.Name')}></i></th>
                                            <th scope="col" rowSpan="2" className="text-left align-left pl-3">Locality <i className="fa fa-sort cursor-pointer" aria-hidden="true" onClick={() => this.SortingHandler('offers.StateFullName')}></i></th>
                                            <th scope="col" rowSpan="2" className="text-left align-left pl-3">StateFullName <i className="fa fa-sort cursor-pointer" aria-hidden="true" onClick={() => this.SortingHandler('offers.Price')}></i></th>
                                            <th scope="col" rowSpan="2" className="text-left align-left pl-3">StateShortName</th>
                                            <th scope="col" rowSpan="2" className="text-left align-left pl-3">Price</th>
                                            <th scope="col" rowSpan="2" className="text-left align-left pl-3">status</th>
                                        </tr>
                                    </thead>
                                    {this.state.list.length > 0 ?
                                        <tbody>
                                            {this.state.list.map((data, index) =>
                                                this.Row(data, index)
                                            )}
                                        </tbody>
                                        :
                                        <tbody>
                                            <tr className="text-center"><td colSpan={10}> No Data Found </td></tr>
                                        </tbody>
                                    }
                                </Table>
                            </CardBody> */}
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
        );
    }
}

export default MasterReport;