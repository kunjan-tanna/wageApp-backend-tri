import React, { Component } from 'react';
import { Button, Card, CardBody, CardGroup, Col, Container, Input, InputGroup, InputGroupAddon, InputGroupText, Row, Alert } from 'reactstrap';
import Joi from 'joi-browser';
import { validateSchema, formValueChangeHandler, apiCall, displayLog } from '../../../utils/common';

class ForgotPassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            form: {
                newPassword: '',
                confirmPassword: ''
            },
            error: {
                status: false,
                message: ''
            }
        }
    }

    resetPasswordHandler = async () => {
        let schema = Joi.object().keys({
            newPassword: Joi.string().trim().min(6).required(),
            confirmPassword: Joi.string().trim().min(6).required()
        })
        this.setState({ error: await validateSchema(this.state.form, schema) });
        if (!this.state.error.status) {
            if (this.props.match.params.token) {
                if (String(this.state.form.newPassword) !== String(this.state.form.confirmPassword)) {
                    this.setState({ error: { message: "Confirm password must be same.", status: true } })
                } else {
                    let token = this.props.match.params.token;
                    const response = await apiCall('POST', '/resetPassword/' + token, this.state.form);
                    displayLog(response.code, response.message);
                    this.props.history.push(process.env.PUBLIC_URL +'/login');
                }
            } else {
                localStorage.removeItem('WAGE_AUTH_TOKEN');
            }
        }
    }

    changeValuesHandler = (e) => {
        this.setState({ form: formValueChangeHandler(e, this.state.form) });
    }
    enterPressed = (event) => {
        var code = event.keyCode || event.which;
        if (code === 13) { //13 is the enter keycode
            this.resetPasswordHandler()
        }
    }
    render() {
        return (
            <div className="app flex-row align-items-center">
                <Container>
                    <Row className="justify-content-center">
                        <Col md="6">
                            <CardGroup>
                                <Card className="p-4">
                                    <CardBody>
                                        <h1>Reset Password</h1>
                                        <p className="text-muted"></p>
                                        {
                                            this.state.error.status ?
                                                <Alert color="danger">
                                                    {this.state.error.message}
                                                </Alert>
                                                : null
                                        }
                                        <InputGroup className="mb-4">
                                            <InputGroupAddon addonType="prepend">
                                                <InputGroupText>
                                                    <i className="icon-lock"></i>
                                                </InputGroupText>
                                            </InputGroupAddon>
                                            <Input type="password" placeholder="New Password" autoComplete="current-password" name="newPassword" value={this.state.form.newPassword} onChange={(e) => this.changeValuesHandler(e)} onKeyPress={(e) => this.enterPressed(e)} />
                                        </InputGroup>
                                        <InputGroup className="mb-4">
                                            <InputGroupAddon addonType="prepend">
                                                <InputGroupText>
                                                    <i className="icon-lock"></i>
                                                </InputGroupText>
                                            </InputGroupAddon>
                                            <Input type="password" placeholder="Confirm Password" autoComplete="current-password" name="confirmPassword" value={this.state.form.confirmPassword} onChange={(e) => this.changeValuesHandler(e)} onKeyPress={(e) => this.enterPressed(e)} />
                                        </InputGroup>
                                        <Row>
                                            <Col xs="12" className="text-center">
                                                <Button color="primary" className="px-4" onClick={() => this.resetPasswordHandler()}>Submit</Button>
                                            </Col>
                                            <Col xs="6" className="text-right">
                                                {/* <Button color="link" className="px-0">Forgot password?</Button> */}
                                            </Col>
                                        </Row>
                                        {/* </Form> */}
                                    </CardBody>
                                </Card>
                            </CardGroup>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}

export default ForgotPassword;
