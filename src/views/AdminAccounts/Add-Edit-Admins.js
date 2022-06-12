import React, { Component } from 'react';
import { Card, CardBody, CardFooter, CardHeader, Col, Row, FormGroup, Input, Label, Button } from 'reactstrap';
import { validateSchema, formValueChangeHandler, apiCall, displayLog } from '../../utils/common';
import Joi from 'joi-browser';
import moment from 'moment';
import 'react-datetime/css/react-datetime.css';
import S3FileUpload from 'react-s3';
import config from '../../utils/config';


class AddEditAdmins extends Component {
    state = {
        form: {
            FirstName: '',
            LastName: '',
            Email: '',
            Password: ''
        },
        error: {
            status: false,
            message: '',
        },
    }
    async componentDidMount() {
        console.log('PROPS DAtA::::>>>', this.props.location);

        if (this.props.match.params && this.props.match.params.adminId) {
            let data = {
                id: this.props.match.params.adminId
            }
            const response = await apiCall('POST', 'getAdminById', data);
            console.log('response is-->>', response);
            let form = this.state.form;
            form.FirstName = response.data.FirstName ? response.data.FirstName : ''
            form.LastName = response.data.LastName ? response.data.LastName : ''
            form.Email = response.data.Email ? response.data.Email : ''
            form.Password = response.data.Password ? response.data.Password : ''

            this.setState({ form })
        }
    }
    changeValuesHandler = (e) => {
        this.setState({ form: formValueChangeHandler(e, this.state.form) });
    }
    submitHandler = async () => {
        let schema = Joi.object().keys({
            FirstName: Joi.string().strict().label('First Name').required(),
            LastName: Joi.string().strict().label('Last Name').required(),
            Email: Joi.string().email({ minDomainAtoms: 2 }).label('Email').required(),
            Password: Joi.string().min(6).label('Password').required(),
        })
        this.setState({ error: await validateSchema(this.state.form, schema) });
        if (!this.state.error.status) {
            let res = await apiCall('POST', 'addAdmin', this.state.form);
            displayLog(res.code, res.message)
            this.props.history.push(process.env.PUBLIC_URL + '/admins');
        } else {
            displayLog(0, this.state.error.message)
        }
    }
    render() {
        return (
            <div className="animated fadeIn">
                <Row>
                    <Col xl={12}>
                        <Card>
                            <CardHeader>
                                <h4>{this.props.match.params.adminId ? "Edit Admin" : "Add Admin"}</h4>
                            </CardHeader>
                            <CardBody>
                                <Row>
                                    <Col xs="12" md="6">
                                        <FormGroup>
                                            <Label className="label-weight">First Name</Label>
                                            <Input type="text" placeholder={`Enter First Name`}
                                                value={this.state.form['FirstName']}
                                                name="FirstName" onChange={(e) => this.changeValuesHandler(e)} />
                                        </FormGroup>
                                    </Col>
                                    <Col xs="12" md="6">
                                        <FormGroup>
                                            <Label className="label-weight">Last Name</Label>
                                            <Input type="text" placeholder={`Enter Last Name`}
                                                value={this.state.form['LastName']}
                                                name="LastName" onChange={(e) => this.changeValuesHandler(e)} />
                                        </FormGroup>
                                    </Col>
                                    <Col xs="12" md="6">
                                        <FormGroup>
                                            <Label className="label-weight">Email</Label>
                                            <Input type="text" placeholder={`Enter Email`}
                                                value={this.state.form['Email']}
                                                name="Email" onChange={(e) => this.changeValuesHandler(e)} />
                                        </FormGroup>
                                    </Col>
                                    <Col xs="12" md="6">
                                        <FormGroup>
                                            <Label className="label-weight">Password</Label>
                                            <Input type="password" placeholder={`Enter Password`}
                                                value={this.state.form['Password']}
                                                name="Password" onChange={(e) => this.changeValuesHandler(e)} />
                                        </FormGroup>
                                    </Col>
                                </Row>
                            </CardBody>
                            <CardFooter>
                                <Button color="primary" onClick={this.submitHandler}>Submit</Button>
                            </CardFooter>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default AddEditAdmins;