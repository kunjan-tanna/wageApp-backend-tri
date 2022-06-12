import React, { Component } from 'react';
import { Button, Card, CardBody, CardGroup, Col, Container, Input, InputGroup, InputGroupAddon, InputGroupText, Row, Alert } from 'reactstrap';
import Joi from 'joi-browser';
import { validateSchema, formValueChangeHandler, apiCall, displayLog } from '../../../utils/common';
import config from '../../../utils/config';

class ForgotPassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            form: {
                email: '',
            },
            error: {
                status: false,
                message: ''
            }
        }
    }

    forgotPasswordHandler = async () => {
        let schema = Joi.object().keys({
            email: Joi.string().trim().regex(config.EMAIL_REGEX).email().required(),
        })
        this.setState({ error: await validateSchema(this.state.form, schema) });
        if (!this.state.error.status) {
            const response = await apiCall('POST', '/forgotPassword', this.state.form);
            displayLog(response.code, response.message);
        }
    }

    changeValuesHandler = (e) => {
        this.setState({ form: formValueChangeHandler(e, this.state.form) });
    }
    enterPressed = (event) => {
        var code = event.keyCode || event.which;
        if (code === 13) { //13 is the enter keycode
            this.forgotPasswordHandler()
        }
    }
    redirectHandler = () => {
        this.props.history.push(process.env.PUBLIC_URL +'/login');
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
                                        <h2>Forgot Password</h2>
                                        <p className="text-muted"></p>
                                        {
                                            this.state.error.status ?
                                                <Alert color="danger">
                                                    {this.state.error.message}
                                                </Alert>
                                                : null
                                        }
                                        <InputGroup className="mb-3">
                                            <InputGroupAddon addonType="prepend">
                                                <InputGroupText>
                                                    <i className="icon-user"></i>
                                                </InputGroupText>
                                            </InputGroupAddon>
                                            <Input type="text" placeholder="Email" autoComplete="Email" name="email" value={this.state.form.email} onChange={(e) => this.changeValuesHandler(e)} onKeyPress={(e) => this.enterPressed(e)} />
                                        </InputGroup>
                                        <Row>
                                            <Col xs="6" className="text-left">
                                                <Button color="primary" className="px-4" onClick={() => this.forgotPasswordHandler()}>Submit</Button>
                                            </Col>
                                            <Col xs="6" className="text-right">
                                                <Button color="link" className="px-0" onClick={() => this.redirectHandler()}>Login Here</Button>
                                            </Col>
                                        </Row>
                                    {/* </Form> */}
                                    </CardBody>
                                </Card>
                            </CardGroup>
                        </Col>
                    </Row>
                </Container>
            </div >
        );
    }
}

export default ForgotPassword;
