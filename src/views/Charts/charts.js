import React, { Component } from 'react';
import { Chart } from "react-google-charts";
import { apiCall } from '../../utils/common';
import { Card, CardBody, CardHeader, Col, Row, Table, Button, Input, Label } from 'reactstrap';

class Charts extends Component {
    state = {
        locations: [],
        category: [],
        selectedLocation: "",
        selectedCatId: "",
        selectedCatName: "",
        stateChart: [],
        catChart: [],
        statePrev: false,
        stateNext: false,
        catPrev: false,
        catNext: false,
        page_noState: 1,
        page_noCat: 1,
        limitState: 10,
        limitCat: 10
    }
    async componentDidMount() {
        await this.getStateAndCats();
        await this.stateWiseChart();
        await this.categoryWiseChart();
    }
    getStateAndCats = async () => {
        let res = await apiCall('GET', 'getStateCategories');
        await this.setState({
            locations: res.locations,
            category: res.category,
            selectedLocation: res.locations[0].StateFullName,
            selectedCat: String(res.category[0].Id),
            selectedCatName:res.category[0].Name
        })
        console.log('\n\n #########', res, res.locations[0].StateFullName);
    }
    changeLocation = (e) => {
        this.setState({ selectedLocation: e.target.value, page_no: 1 }, () => {
            this.stateWiseChart();
        });
    }
    stateWiseChart = async () => {
        let reqData = {
            page_no: this.state.page_noState,
            limit: this.state.limitState,
            state_name: this.state.selectedLocation
        }
        let res = await apiCall('POST', 'getStateChartData', reqData);
        console.log('\n\n ctart->', res.data.total, this.state.page_noState * this.state.limitState);
        if (res.data.total <= this.state.page_noState * this.state.limitState) {
            this.setState({ stateNext: true })
        } else {
            this.setState({ stateNext: false })
        }
        if (this.state.page_noState == 1) {
            this.setState({ statePrev: true })
        }
        this.setState({ stateChart: res.data.data, stateTotal: res.data.total })
    }
    nextState = async () => {
        let count = this.state.page_noState + 1;
        await this.setState({ page_noState: count })
        this.stateWiseChart();
    }
    prevState = async () => {
        let count = this.state.page_noState - 1;
        await this.setState({ page_noState: count })
        this.stateWiseChart();
    }
    changeCat = async (e) => {
        let name;
        this.state.category.map(c => {
            if (c.Id == e.target.value) {
                name = c.Name
                return
            }
        })
        this.setState({ selectedCat: e.target.value, selectedCatName: name, page_no: 1 }, () => {
            this.categoryWiseChart();
        });
    }

    categoryWiseChart = async () => {
        let reqData = {
            cat_id: this.state.selectedCat,
            page_no: this.state.page_noCat,
            limit: this.state.limitCat
        }
        let res = await apiCall('POST', 'getCatChartData', reqData);
        console.log('\n\n RES is-->', res);
        if (res.data.total <= this.state.page_noCat * this.state.limitCat) {
            console.log('\n\n $$%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
            this.setState({ catNext: true })
        } else {
            this.setState({ catNext: false })
        }
        if (this.state.page_noCat == 1) {
            this.setState({ catPrev: true })
        }
        this.setState({ catChart: res.data.data, catTotal: res.data.total })
    }
    nextCat = async () => {
        let count = this.state.page_noCat + 1;
        await this.setState({ page_noCat: count })
        this.categoryWiseChart();
    }
    prevCat = async () => {
        let count = this.state.page_noCat - 1;
        await this.setState({ page_noCat: count })
        this.categoryWiseChart();
    }
    render() {
        return (
            <div className="animated fadeIn">
                <Row>
                    <Col xl={12}>
                        <CardBody>
                            <Label className="fw-500">State Wise Chart</Label>
                            <Row className="mb-2">
                                <Col sm="2" md="3" className="mb-3 mb-xl-0">
                                    <Input type="select" name="selectedLocation" value={this.state.selectedLocation} onChange={(e) => this.changeLocation(e)} >
                                        {/* <option value={0}>All</option> */}
                                        {
                                            this.state.locations.map((l, index) => (
                                                <option key={index} value={l.StateFullName}>{l.StateFullName}</option>
                                            ))
                                        }
                                    </Input>
                                </Col>

                            </Row>
                            <Row className="mb-2">
                                <Col sm="12" md="12" className="mb-3 mb-xl-0">

                                    <Chart
                                        width={'100%'}
                                        height={'400px'}
                                        chartType="Bar"
                                        legendToggle
                                        loader={<div>Loading Chart</div>}
                                        data={[
                                            ['Categories', 'Gig', 'services'],
                                            ...this.state.stateChart
                                        ]}
                                        options={{
                                            chart: {
                                                title: this.state.selectedLocation,
                                            },
                                            legend: "none",
                                            allowHtml: true,
                                            showRowNumber: false,
                                            cssClassNames: {
                                                tableCell: 'game-cell'
                                            },
                                        }}
                                        rootProps={{ 'data-testid': '2' }}
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Col sm="12" md="3" xs className="mb-3 mb-xl-0">
                                        <Button block color="primary" disabled={this.state.page_noState > 1 ? false : true} size="sm" onClick={() => this.prevState()}>Previous</Button>
                                    </Col>
                                </Col>
                                <Col>
                                    <Col sm="12" md="3" xs className="mb-3 mb-xl-0 float-right">
                                        <Button block color="primary" disabled={this.state.stateNext} size="sm" onClick={() => this.nextState()}>Next</Button>
                                    </Col>
                                </Col>
                            </Row>
                        </CardBody>
                    </Col>
                </Row>

                <Row>
                    <Col xl={12}>
                        <CardBody>
                            <Label className="fw-500">Category Wise Chart </Label>
                            <Row className="mb-2">
                                <Col sm="2" md="3" className="mb-3 mb-xl-0">
                                    <Input type="select" name="selectedCat" value={this.state.selectedCat} onChange={(e) => this.changeCat(e)} >
                                        {/* <option value={""}>All</option> */}
                                        {
                                            this.state.category.map((c, index) => (
                                                <option key={index} value={c.Id}>{c.Name}</option>
                                            ))
                                        }

                                    </Input>
                                </Col>

                            </Row>
                            <Row className="mb-2">
                                <Col sm="12" md="12" className="mb-3 mb-xl-0">
                                    <Chart
                                        width={'100%'}
                                        height={'300px'}
                                        chartType="Bar"
                                        legendToggle
                                        loader={<div>Loading Chart</div>}
                                        data={[
                                            ['States', 'Gig', 'services'],
                                            ...this.state.catChart
                                        ]}
                                        options={{
                                            chart: {
                                                title: this.state.selectedCatName,
                                            },
                                            legend: "none",
                                            allowHtml: true,
                                            showRowNumber: false,
                                            cssClassNames: {
                                                tableCell: 'game-cell'
                                            },
                                        }}
                                        rootProps={{ 'data-testid': '2' }}
                                    />
                                </Col>
                            </Row>
                            <Row sm="12" md="10">
                                <Col>
                                    <Col sm="12" md="3" className="mb-3 mb-xl-0">
                                        <Button block color="primary" disabled={this.state.page_noCat > 1 ? false : true} size="sm" onClick={() => this.prevCat()}>Previous</Button>
                                    </Col>
                                </Col>
                                <Col>
                                    <Col sm="12" md="3" className="mb-3 mb-xl-0 float-right">
                                        <Button block color="primary" disabled={this.state.catNext} size="sm" onClick={() => this.nextCat()}>Next</Button>
                                    </Col>
                                </Col>
                            </Row>
                        </CardBody>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default Charts;