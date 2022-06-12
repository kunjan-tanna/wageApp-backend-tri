import React, { Component } from 'react';
import { Card, CardBody, CardHeader, Col, Row, Table, Button, Input } from 'reactstrap';
import { apiCall, displayLog, confirmBox, decrypt } from '../../utils/common';
import ReactPaginate from 'react-paginate';
import config from '../../utils/config';
import moment from 'moment';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';



class AdminAccounts extends Component {
    state = {
        limit: 10,
        page_no: 1,
        users: [],
        total_users: 0
    }

    async componentDidMount() {
        let adminData = localStorage.getItem('WAGE');
        adminData = decrypt(adminData)
        adminData = JSON.parse(adminData)
        console.log('AFDMIN', adminData)
        if (adminData.type != 100) {
            this.props.history.push(process.env.PUBLIC_URL + '/dashboard');
        }
        this.getData();
    }

    getData = async () => {
        let reqData = {
            page_no: this.state.page_no,
            limit: this.state.limit
        }
        let response = await apiCall('POST', 'admins', reqData);
        this.setState({ users: response.data.users, total_users: response.data.total_users })
        console.log('\n\n\n RES of adimns ->', response);
    }
    delete = async (id) => {
        let flag = await confirmBox('Wage', 'Are you sure, want to delete admin ?');
        if (flag) {
            let reqData = {
                Id: id
            }
            let res = await apiCall('POST', 'deleteAdmin', reqData);
            displayLog(res.code, res.message);
            this.getData();
        }
    }

    userRow = (user, index) => {
        return (
            <tr key={index}>
                <td className="text-center">{index + 1 + ((this.state.page_no - 1) * this.state.limit)}</td>
                <td className="text-center">{user.FirstName}</td>
                <td className="text-center">{user.LastName}</td>
                <td className="text-center">{user.Email}</td>
                <td className="text-center">{moment(user.DateCreated).format('YYYY-MM-DD')}</td>
                <td className="text-center w8">
                    <span className="fa fa-trash action-icon" title="Delete User" onClick={() => this.delete(user.Id)}></span>
                </td>
            </tr >
        )
    }

    changeLimit = (e) => {
        this.setState({ limit: +e.target.value, page_no: 1 }, () => {
            this.getData();
        });
    }

    add = () => {
        this.props.history.push(process.env.PUBLIC_URL + '/admins/add');

    }

    render() {
        return (
            <div className="animated fadeIn">
                <Row>
                    <Col xl={12}>
                        <Card>
                            <CardHeader>
                                <h4>Admins</h4>
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
                                    <Col sm="12" md="8" className="mb-3 mb-xl-0"></Col>
                                    <Col sm="12" md="2" xs className="mb-3 mb-xl-0">
                                        <Button block color="primary" size="sm" onClick={() => this.add()}>Add Admin</Button>
                                    </Col>
                                </Row>
                            </CardBody>
                            <CardBody>
                                <Table bordered striped responsive size="sm">
                                    <thead>
                                        <tr>
                                            <th scope="col" className="text-center">No</th>
                                            <th scope="col" className="text-center">First Name</th>
                                            <th scope="col" className="text-center">Last Name</th>
                                            <th scope="col" className="text-center">Email</th>
                                            <th scope="col" className="text-center">Created date</th>
                                            <th scope="col" className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    {this.state.users.length > 0 ?
                                        <tbody>
                                            {this.state.users.map((user, index) =>
                                                this.userRow(user, index)
                                            )}
                                        </tbody>
                                        :
                                        <tbody>
                                            <tr className="text-center"><td colSpan={7}> No Data Found </td></tr>
                                        </tbody>
                                    }
                                </Table>
                            </CardBody>
                        </Card>
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
                    </Col>
                </Row>
            </div>

        );
    }
}


const mapStateToProps = state => {
    return {
        admin: state.reducer.admin
    }
}
export default withRouter(connect(mapStateToProps, null)(AdminAccounts));
// export default AdminAccounts;