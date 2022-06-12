import React, { Component } from 'react';
import { Card, CardBody, CardHeader, Col, Row, Table, Button, Input, Label, InputGroupText, InputGroupAddon, InputGroup } from 'reactstrap';
import { apiCall, displayLog, confirmBox, getZipCode } from '../../utils/common';
import ReactPaginate from 'react-paginate';
import NumberFormat from 'react-number-format';
import moment from 'moment';
import config from '../../utils/config';
import store from '../../utils/store';

class PromotionOffers extends Component {
    state = {
        page_no: 1,
        limit: 10,
        list: [],
        promotion_type:""
    }
    componentDidMount() {
        this.getOffers();
    }
    changeLimit = (e) => {
        this.setState({ limit: +e.target.value, page_no: 1 }, () => {
            this.getOffers();
        });
    }
    changePromotionType = (e) => {
        this.setState({ promotion_type: e.target.value, page_no: 1 }, () => {
            this.getOffers();
        });
    }
    getOffers = async () => {
        let reqData = {
            page_no: this.state.page_no,
            limit: this.state.limit
        }
        if(this.state.promotion_type != ""){
            reqData['promotion_type'] = this.state.promotion_type
        }
        let res = await apiCall('POST', 'getPromotionOffers', reqData);
        console.log('\n\n RES of PROMOTIN', res);
        this.setState({ list: res.data })
    }
    Row = (data, index) => {
        return (
            <tr key={index}>
                <td className="text-center align-middle">{index + 1 + ((this.state.page_no - 1) * this.state.limit)}</td>
                <td className="text-center align-middle">{data.Title}</td>
                <td className="text-center align-middle">{data.Description}</td>
                <td className="text-center align-middle">{<NumberFormat value={data.Price} displayType={'text'} thousandSeparator={true} prefix={'$'} />}</td>
                <td className="text-center align-middle">{data.StateFullName}</td>
                <td className="text-center align-middle">{data.promotionType}</td>
                <td className="text-center align-middle">{moment(data.DateCreated).format('YYYY-MM-DD')}</td>
                <td className="text-center align-middle"><a href={config.web_url + `offer/${data.Id}/${String(data.Title).replace(/\s/g, "-").toLowerCase()}`} target="_blank" className="Font17"><i class="fa fa-link" aria-hidden="true"></i></a></td>
            </tr>
        )
    }
    render() {
        return (
            <div className="animated fadeIn">
                <Row>
                    <Col xl={12}>
                        <Card>
                            <CardHeader>
                                <h4>Promotion Offers</h4>
                            </CardHeader>
                            <CardBody>
                                <Row className="align-items-right">
                                    <Col sm="12" md="2" className="mb-3 mb-xl-0">
                                        <Input type="select" name="limit" value={this.state.limit} onChange={(e) => this.changeLimit(e)} >
                                            <option value={15}>15</option>
                                            <option value={30}>30</option>
                                            <option value={50}>50</option>
                                            <option value={100}>100</option>
                                        </Input>
                                    </Col>
                                    <Col sm="12" md="2" className="mb-3 mb-xl-0">
                                        <Input type="select" name="promotion_type" value={this.state.promotion_type} onChange={(e) => this.changePromotionType(e)}>
                                            <option value={""}>All</option>
                                            <option value={1}>Local</option>
                                            <option value={2}>Statewide</option>
                                            <option value={3}>Nationwide</option>
                                        </Input>
                                    </Col>
                                </Row>
                            </CardBody>
                            <CardBody>
                                <Table bordered striped responsive size="sm">
                                    <thead>
                                        <tr>
                                            <th scope="col" rowSpan="2" className="text-center align-middle">No</th>
                                            <th scope="col" rowSpan="2" className="text-center align-middle">Title</th>
                                            <th scope="col" rowSpan="2" className="text-center align-middle">Description</th>

                                            <th scope="col" rowSpan="2" className="text-center align-middle">Price</th>
                                            <th scope="col" rowSpan="2" className="text-center align-middle">Location</th>
                                            <th scope="col" rowSpan="2" className="text-center align-middle">Promotion Type</th>

                                            <th scope="col" rowSpan="2" className="text-center align-middle">Created date <i className="fa fa-sort cursor-pointer" aria-hidden="true" onClick={() => this.SortingHandler('DateCreated')}></i></th>

                                            <th scope="col" rowSpan="2" className="text-center align-middle">Offer Link</th>

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
                                            <tr className="text-center"><td colSpan={8}> No Data Found </td></tr>
                                        </tbody>
                                    }
                                </Table>
                            </CardBody>

                            <Row>
                                <Col>
                                    <ReactPaginate
                                        pageCount={Math.ceil(this.state.total_users / this.state.limit)}
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
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default PromotionOffers;