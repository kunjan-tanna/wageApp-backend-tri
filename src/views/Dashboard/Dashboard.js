import React, { Component } from 'react';
import { Card, CardHeader, Col, Row, CardBody } from 'reactstrap';

import { apiCall } from '../../utils/common';

import './dashboard.css';
import NumberFormat from 'react-number-format';

class Dashboard extends Component {
    state = {
        all_counts: {}
    }
    async componentDidMount() {
        let AllCounts = await apiCall('GET', 'dashboard');
        this.setState({ all_counts: AllCounts.data })
    }

    redirectHandler = (data, table) => {
        if (table == "user") {
            this.props.history.push(process.env.PUBLIC_URL + '/users', { userType: data });
        }
        if (table == "offer") {
            this.props.history.push(process.env.PUBLIC_URL + '/reports', { status: data });
        }
    }

    render() {
        return (
            <div>
                <div>
                    <div>
                        <Row>
                            <Col xl={12}>
                                <Card>
                                    <CardHeader>
                                        <h4 className="card-header-custom">Dashboard</h4>
                                    </CardHeader>
                                    <CardBody>
                                        <div className="row Row">
                                            <div className="col-sm-6 mb-4" onClick={() => this.redirectHandler(1, "user")}>
                                                <div className="inforide">
                                                    <div className="row crsrPntr">
                                                        <div className="col-lg-3 col-md-4 col-sm-4 col-4 rideone">
                                                            <i className="fa fa-user useIcon" aria-hidden="true"></i>
                                                        </div>
                                                        <div className="col-lg-9 col-md-8 col-sm-8 col-8 fontsty">
                                                            <h4>Service Providers</h4>
                                                            <h2>{this.state.all_counts.service_provider}</h2>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-sm-6 mb-4" onClick={() => this.redirectHandler(2, "user")}>
                                                <div className="inforide">
                                                    <div className="row crsrPntr">
                                                        <div className="col-lg-3 col-md-4 col-sm-4 col-4 ridetwo">
                                                            <i className="fa fa-handshake-o useIcon" aria-hidden="true"></i>
                                                        </div>
                                                        <div className="col-lg-9 col-md-8 col-sm-8 col-8 fontsty">
                                                            <h4>Service Seekers</h4>
                                                            <h2>{this.state.all_counts.service_seeker}</h2>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-sm-6 mb-4" onClick={() => this.redirectHandler(3, "user")}>
                                                <div className="inforide">
                                                    <div className="row crsrPntr">
                                                        <div className="col-lg-3 col-md-4 col-sm-4 col-4 ride3">
                                                            <i className="fa fa-building-o useIcon" aria-hidden="true"></i>
                                                        </div>
                                                        <div className="col-lg-9 col-md-8 col-sm-8 col-8 fontsty">
                                                            <h4>Bussiness Accounts</h4>
                                                            <h2>{this.state.all_counts.business_account}</h2>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-sm-6 mb-4" onClick={() => this.redirectHandler('', "offer")}>
                                                <div className="inforide crsrPntr">
                                                    <div className="row">
                                                        <div className="col-lg-3 col-md-4 col-sm-4 col-4 ride4">
                                                            <i className="fa fa-briefcase useIcon" aria-hidden="true"></i>
                                                        </div>
                                                        <div className="col-lg-9 col-md-8 col-sm-8 col-8 fontsty">
                                                            <h4>Job Posted</h4>
                                                            <h2>{this.state.all_counts.job_posted}</h2>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-sm-6 mb-4" onClick={() => this.redirectHandler(2, "offer")}>
                                                <div className="inforide">
                                                    <div className="row crsrPntr">
                                                        <div className="col-lg-3 col-md-4 col-sm-4 col-4 ride5">
                                                            <i className="fa fa-briefcase useIcon" aria-hidden="true"></i>
                                                        </div>
                                                        <div className="col-lg-9 col-md-8 col-sm-8 col-8 fontsty">
                                                            <h4>Job in progress</h4>
                                                            <h2>{this.state.all_counts.job_process}</h2>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-sm-6 mb-4" onClick={() => this.redirectHandler(3, "offer")}>
                                                <div className="inforide">
                                                    <div className="row crsrPntr">
                                                        <div className="col-lg-3 col-md-4 col-sm-4 col-4 ride6">
                                                            <i className="fa fa-briefcase useIcon" aria-hidden="true"></i>
                                                        </div>
                                                        <div className="col-lg-9 col-md-8 col-sm-8 col-8 fontsty">
                                                            <h4>Job Completed</h4>
                                                            <h2>{this.state.all_counts.job_completed}</h2>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* #5d83ed */}
                                            <div className="col-sm-6 mb-4">
                                                <div className="inforide">
                                                    <div className="row">
                                                        <div className="col-lg-3 col-md-4 col-sm-4 col-4 ride7">
                                                            <i className="fa fa-usd useIcon" aria-hidden="true"></i>
                                                        </div>
                                                        <div className="col-lg-9 col-md-8 col-sm-8 col-8 fontsty">
                                                            <h4>Earning</h4>
                                                            <h2><NumberFormat value={this.state.all_counts.earnings} displayType={'text'} thousandSeparator={true} /></h2>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                </div>
            </div>
        );
    }
}

export default Dashboard;