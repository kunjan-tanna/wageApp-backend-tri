import React, { Component } from 'react';
import { Card, CardBody, CardHeader, Col, Row, Table, Button, Input } from 'reactstrap';
import { apiCall, displayLog, confirmBox } from '../../utils/common';
import ReactPaginate from 'react-paginate';
import moment from 'moment'
import config from '../../utils/config';

class ReportedOffers extends Component {
    state = {
        list: [],
        page_no: 1,
        limit: 15,
        searchStr: '',
        total: '',
        order_by: "DESC",
        sort_by: "",
        sort_type: 1,
    }

    componentDidMount() {
        this.getData()
    }
    getData = async () => {
        let reqData = {
            page_no: this.state.page_no,
            limit: this.state.limit
        }
        let res = await apiCall('POST', 'getReportedOffers', reqData);
        this.setState({ list: res.data, total: res.total })
        console.log('\n rep', res);
    }
    Row = (data, index) => {
        return (
            <tr key={index}>
                <td className="text-center">{index + 1 + ((this.state.page_no - 1) * this.state.limit)}</td>
                <td className="text-center">{data.Title}</td>
                <td className="text-center">{data.FirstName + " " + data.LastName}</td>
                <td className="text-center">{moment(data.DateReported).format('YYYY-MM-DD')}</td>
                <td className="text-center"><a href={config.web_url + `offer/${data.OfferId}/${String(data.Title).replace(/\s/g, "-").toLowerCase()}`} target="_blank" className="Font17"><i class="fa fa-link" aria-hidden="true"></i></a></td>
            </tr>
        )
    }

    handlePageClick = (e) => {
        this.setState({ page_no: e.selected + 1 }, () => {
            this.getData();
        });
    }
    changeLimit = (e) => {
        this.setState({ limit: +e.target.value, page_no: 1 }, () => {
            this.getData();
        });
    }

    render() {
        return (
            <div className="animated fadeIn">
                <Row>
                    <Col xl={12}>
                        <Card>
                            <CardHeader>
                                <h4>{"Reported offers"}</h4>
                            </CardHeader>
                            <CardBody>
                                <Row className="align-items-right mb-3">
                                    <Col sm="12" md="1" className="mb-3 mb-xl-0">
                                        <Input type="select" name="limit" value={this.state.limit} onChange={(e) => this.changeLimit(e)} >
                                            <option value={15}>15</option>
                                            <option value={30}>30</option>
                                            <option value={50}>50</option>
                                            <option value={100}>100</option>
                                        </Input>
                                    </Col>
                                </Row>
                                <Table bordered striped responsive size="sm">
                                    <thead>
                                        <tr>
                                            <th scope="col" className="text-center">No</th>
                                            <th scope="col" className="text-center">Offer Name</th>
                                            {/* <th scope="col" className="text-center">Reported Reason</th> */}
                                            <th scope="col" className="text-center">Reported By</th>
                                            <th scope="col" className="text-center">Reported Date</th>
                                            <th scope="col" className="text-center">Offer Link</th>
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
                                            <tr className="text-center"><td colSpan={5}> No Data Found </td></tr>
                                        </tbody>
                                    }
                                </Table>
                            </CardBody>
                        </Card>
                        <Row>
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
                        </Row>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default ReportedOffers;