import React, { Component } from 'react';
import { Card, CardBody, CardHeader, Col, Row, Table, Button, Input } from 'reactstrap';
import { apiCall, displayLog, confirmBox } from '../../utils/common';
import ReactPaginate from 'react-paginate';
import moment from 'moment';
import 'react-responsive-modal/styles.css';
import { Modal } from 'react-responsive-modal';

class EditedNotes extends Component {
    state = {
        limit: 10,
        page_no: 1,
        list: [],
        total: 0,
        filter: 0,
        open: false,
        notes: '',
        editableId: '',
        admins: [],
        selectedAdmin: 0
    }
    onOpenModal = (id, notes) => {
        this.setState({ open: true, notes: notes, editableId: id })
    }
    onCloseModal = () => {
        this.setState({ open: false, notes: '', editableId: '' })
    }

    callEditNote = async () => {
        let reqData = {
            id: this.state.editableId,
            note: this.state.notes
        }
        let res = await apiCall('POST', 'editNote', reqData);
        displayLog(res.code, res.message)
        this.onCloseModal()
        this.getData()
    }

    async componentDidMount() {
        this.getData();
    }

    getData = async () => {
        let reqData = {
            page_no: this.state.page_no,
            limit: this.state.limit
        }
        if (this.state.filter != 0) {
            reqData['filter'] = this.state.filter
        }
        if (this.state.selectedAdmin != 0) {
            reqData['admin_id'] = this.state.selectedAdmin

        }
        let response = await apiCall('POST', 'getNotes', reqData);
        this.setState({ list: response.data.notes, total: response.data.total, admins: response.data.admins })
        console.log('\n\n\n RES of adimns ->', response);
    }
    delete = async (id) => {
        let flag = await confirmBox('Wage', 'Are you sure, want to delete note ?');
        if (flag) {
            let reqData = {
                id: id
            }
            let res = await apiCall('POST', 'deleteNote', reqData);
            displayLog(res.code, res.message);
            this.getData();
        }
    }

    userRow = (data, index) => {
        return (
            <tr key={index}>
                <td className="text-center">{index + 1 + ((this.state.page_no - 1) * this.state.limit)}</td>
                <td className="text-center">{data.admin_name}</td>
                <td className="text-center">{data.note || 'N/A'}</td>
                {this.state.filter == 0 || this.state.filter == 1 ? <td className="text-center">{data.user_name || '-'}</td> : null}
                {this.state.filter == 0 || this.state.filter == 3 ? <td className="text-center">{data.business_name || '-'}</td> : null}
                {this.state.filter == 0 || this.state.filter == 2 ? <td className="text-center">{data.offer_title || '-'}</td> : null}
                <td className="text-center">{moment(data.DateCreated).format('YYYY-MM-DD')}</td>
                <td className="text-center w8">
                    <span className="fa fa-edit action-icon" title="Edit Note" onClick={() => this.onOpenModal(data.Id, data.note)}></span>
                    {/* <span className="fa fa-trash action-icon" title="Delete Note" onClick={() => this.delete(data.Id)}></span> */}
                </td>
            </tr>
        )
    }

    changeLimit = (e) => {
        this.setState({ limit: +e.target.value, page_no: 1 }, () => {
            this.getData();
        });
    }
    changeFilter = (e) => {
        this.setState({ filter: +e.target.value }, () => {
            this.getData();
        });
    }

    changeAdmin = (e) => {
        this.setState({ selectedAdmin: e.target.value }, () => {
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
                                <h4>Notes</h4>
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
                                        <Input type="select" name="filter" value={this.state.filter} onChange={(e) => this.changeFilter(e)} >
                                            <option value={0}>All Notes</option>
                                            <option value={1}>User edit notes</option>
                                            <option value={3}>Business edit notes</option>
                                            <option value={2}>Offer edit notes</option>
                                        </Input>
                                    </Col>
                                    <Col sm="12" md="2" className="mb-3 mb-xl-0">
                                        <Input type="select" name="filter" value={this.state.selectedAdmin} onChange={(e) => this.changeAdmin(e)} >
                                            <option value={0}>All Admins</option>
                                            {
                                                this.state.admins.map(a => (
                                                    <option value={a.Id}>{a.admin_name}</option>
                                                ))
                                            }
                                        </Input>
                                    </Col>
                                    <Col sm="12" md="4" className="mb-3 mb-xl-0"></Col>
                                </Row>
                            </CardBody>
                            <CardBody>
                                <Table bordered striped responsive size="sm">
                                    <thead>
                                        <tr>
                                            <th scope="col" className="text-center">No</th>
                                            <th scope="col" className="text-center">Admin</th>
                                            <th scope="col" className="text-center">Edit Note</th>
                                            {this.state.filter == 0 || this.state.filter == 1 ? <th scope="col" className="text-center">User</th> : null}
                                            {this.state.filter == 0 || this.state.filter == 3 ? <th scope="col" className="text-center">Business</th> : null}
                                            {this.state.filter == 0 || this.state.filter == 2 ? <th scope="col" className="text-center">Offer</th> : null}
                                            <th scope="col" className="text-center">Created date</th>
                                            <th scope="col" className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    {this.state.list.length > 0 ?
                                        <tbody>
                                            {this.state.list.map((data, index) =>
                                                this.userRow(data, index)
                                            )}
                                        </tbody>
                                        :
                                        <tbody>
                                            <tr className="text-center"><td colSpan={8}> No Data Found </td></tr>
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
                <Modal open={this.state.open} onClose={this.onCloseModal} center>
                    <div className="modal-body pt-0">
                        <form>
                            <div class="modal-header p-0 pb-2 mb-2">
                                <h5 class="modal-title" id="exampleModalLabel">Edit Note</h5>
                            </div>
                            <div className="form-group">
                                <label for="message-text" className="col-form-label">Note:</label>
                                <textarea className="form-control" id="message-text" required value={this.state.notes} onChange={(e) => this.setState({ notes: e.target.value })}></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" className="btn btn-primary" onClick={() => this.callEditNote()} disabled={this.state.notes == ''}>Submit</button>
                    </div>
                </Modal>
            </div>

        );
    }
}

export default EditedNotes;