import React, { Component } from 'react';
import { Card, CardBody, CardHeader, Col, Row, Button, CardFooter, Label, Input, FormGroup } from 'reactstrap';
import Joi from 'joi-browser';
import { apiCall, displayLog, formValueChangeHandler, validateSchema } from '../../utils/common';
import { Multiselect } from 'multiselect-react-dropdown';
//import Multiselect from 'react-widgets/lib/Multiselect'

class BulkNotification extends Component {
    state = {
        idArr: [],
        category: [],
        location: [],
        startDate: '',
        selectedLocation: '',
        selectedCategory: '',
        objectArray: [
            {
                "name": "Users",
                "options": [
                    {
                        "key": "All Users",
                        "id": "1"
                    },
                    {
                        "key": "All Business",
                        "id": "2"
                    },
                ]
            },
            {
                "name": "Offers",
                "options": [
                    {
                        "key": "All Gigs",
                        "id": "3"
                    },
                    {
                        "key": "All Services",
                        "id": "4"
                    },
                ]
            },
        ],
        options: [{ name: 'All Users', id: 1 }, { name: 'All Businesses', id: 2 }],
        offer_options: [{ name: 'All Gigs', id: 1 }, { name: 'All Services', id: 2 }],
        form: {
            Title: '',
            message: '',
            Type: "1",
            url: ''
        },
        userType: '',
        offerType: '',

    }

    onSelect(selectedList, selectedItem) {
        console.log('\n SELECTED-->', selectedItem);
    }

    onRemove(selectedList, removedItem) {

    }

    resetState = () => {
        this.setState({

        })
    }

    dateHandler = (e) => {
        this.setState({ [e.target.name]: e.target.value })
    }

    getFilterData = async () => {
        let response = await apiCall('POST', 'getReportFilters');
        this.setState({ location: response.locations, category: response.category })
    }

    async componentDidMount() {
        console.log('$$$$$$$$$$$$$$--->>', this.props.location.state);
        this.getFilterData();
    }

    submitHandler = async () => {
        console.log('\n\n\n\nIMAGE VLI-->>', this.state.offer_logo);
        let schema = Joi.object().keys({
            Title: Joi.string().strict().trim().label('Title').required(),
            message: Joi.string().strict().trim().label('Message').required(),
            Type: Joi.string().strict().label('Type').required(),
            url: Joi.string().uri().allow('')
        })
        this.setState({
            error: await validateSchema({
                Title: this.state.form.Title,
                message: this.state.form.message,
                Type: this.state.form.Type,
                url: this.state.form.url
            }, schema)
        });
        if (Number(this.state.form.Type) === 3 && this.state.form.url.length == 0) {
            displayLog(0, "Url is required!")
            this.setState({
                error: {
                    status: true,
                    message: "Url is required!"
                }
            })
        }

        if (!this.state.error.status) {
            let data = {
                user_ids: this.props.location.state,
                title: this.state.form.Title,
                message: this.state.form.message,
                Type: this.state.form.Type,
                url: this.state.form.url
            }
            let res = await apiCall('POST', 'sendNotification', data);
            displayLog(res.code, res.message)
        }

        else {
            displayLog(0, this.state.error.message)
        }
    }

    changeValuesHandler = (e) => {
        this.setState({ form: formValueChangeHandler(e, this.state.form) });
    }

    changeSelectValue = (e) => {
        let newFormValues = { ...this.state.form };
        newFormValues['Type'] = e.target.value;
        this.setState({ form: newFormValues })
    }

    changeFilter = (e, flag) => {
        this.setState({ [e.target.name]: e.target.value }, () => {
        });

    }



    enterPressed = (event) => {
        var code = event.keyCode || event.which;
        if (code === 13) { //13 is the enter keycode
            this.submitHandler()
        }
    }

    handleSelectScrollBottom = () => {
        if (this.state.lastEvaluatedKey) {
            this.getUsers();
        }
    }

    onSearchBoxMounted = (ref) => {
        this.setState({ refs: { ...this.state.refs, searchBox: ref } })
    }



    changeType = (e) => {
        this.setState({ [e.target.name]: e.target.value })
    }

    render() {
        console.log('STATE-->>', this.state);
        return (
            <>
                <div className="animated fadeIn">
                    <Row>
                        <Col xl={12}>
                            <Card>
                                <CardBody>

                                    <Row>
                                        <Col sm="12" md="6">
                                            <FormGroup>
                                                <Label className="label-weight">Select User Type</Label>
                                                <Multiselect
                                                    options={this.state.options}
                                                    displayValue="name"
                                                    showCheckbox={true}
                                                    onSelect={this.onSelect}
                                                    onRemove={this.onRemove}
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col sm="12" md="6">
                                            <FormGroup>
                                                <Label className="label-weight">Select Offer Type</Label>
                                                <Multiselect
                                                    options={this.state.offer_options}
                                                    displayValue="name"
                                                    showCheckbox={true}
                                                    onSelect={this.onSelect}
                                                    onRemove={this.onRemove}
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm="12" md="6">
                                            <FormGroup>
                                                <Label className="label-weight">Select Location</Label>
                                                <Input type="select" name="selectedLocation" value={this.state.selectedLocation} onChange={(e) => this.changeFilter(e, 1)} >
                                                    <option value=''>All Locations</option>
                                                    {
                                                        this.state.location.map((l, index) => (
                                                            <option value={l.StateFullName} key={l.StateFullName}>{l.StateFullName}</option>
                                                        ))
                                                    }

                                                </Input>
                                            </FormGroup>
                                        </Col>
                                        <Col sm="12" md="6">
                                            <FormGroup>
                                                <Label className="label-weight">Select Category</Label>
                                                <Input type="select" name="selectedCategory" value={this.state.selectedCategory} onChange={(e) => this.changeFilter(e, 1)} >
                                                    <option value=''>All Categories</option>
                                                    {
                                                        this.state.category.map((l, index) => (
                                                            <option value={l.Name} key={l.Name}>{l.Name}</option>
                                                        ))
                                                    }

                                                </Input>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm="12" md="6">
                                            <FormGroup>
                                                <Label className="label-weight">From Date</Label>
                                                <Input type="date" name="startDate" value={this.state.startDate} onChange={(e) => this.dateHandler(e)}></Input>

                                            </FormGroup>
                                        </Col>
                                    </Row>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </div>
                <div className="animated fadeIn">
                    <Row>
                        <Col xl={12}>
                            <Card>
                                <CardHeader>
                                    <h4>Notification</h4>
                                </CardHeader>
                                <CardBody>
                                   
                                    <Row>
                                        <Col xs="12" md="6">
                                            <FormGroup>
                                                <Label className="label-weight">Title</Label>
                                                <Input type="text" placeholder={`Enter title`}
                                                    value={this.state.form['Title']}
                                                    onKeyPress={(e) => this.enterPressed(e)}
                                                    name="Title" onChange={(e) => this.changeValuesHandler(e)} />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col xs="12" md="6">
                                            <FormGroup>
                                                <Label className="label-weight">Message</Label>
                                                <Input type="textarea" placeholder={`Enter Message`}
                                                    value={this.state.form['message']}
                                                    onKeyPress={(e) => this.enterPressed(e)}
                                                    name="message" onChange={(e) => this.changeValuesHandler(e)} />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm="12" md="6">
                                            <FormGroup>
                                                <Label className="label-weight">Associated action</Label>
                                                <Input type="select" name="Type" value={this.state.form.Type} onChange={(e) => this.changeSelectValue(e)} >
                                                    <option value={1}>Go to list of offers</option>
                                                    <option value={2}>Go to offer creation</option>
                                                    <option value={3}>Open Link</option>
                                                </Input>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    {
                                        this.state.form.Type == "3" &&

                                        <Row>
                                            <Col xs="12" md="6">
                                                <FormGroup>
                                                    <Label className="label-weight">URL</Label>
                                                    <Input type="text" placeholder={`Enter url`}
                                                        value={this.state.form['url']}
                                                        onKeyPress={(e) => this.enterPressed(e)}
                                                        name="url" onChange={(e) => this.changeValuesHandler(e)} />
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                    }

                                </CardBody>
                                <CardFooter>
                                    <Button color="primary" onClick={this.submitHandler} style={{ marginRight: '8px' }}>Send</Button>
                                    <Button color="primary" onClick={this.resetState} style={{ marginRight: '8px' }}>Reset</Button>
                                </CardFooter>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </>
        )
    }
}

export default BulkNotification;
