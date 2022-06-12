import React, { Component } from 'react';
import { Card, CardBody, CardHeader, Col, Row, Table, Button, Input, Nav, NavItem, NavLink, TabPane } from 'reactstrap';
import { apiCall, displayLog, confirmBox } from '../../utils/common';
import ReactPaginate from 'react-paginate';
import NumberFormat from 'react-number-format';
import moment from 'moment';
import GoogleMapReact from 'google-map-react';
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from "react-google-maps";
import { StandaloneSearchBox } from "react-google-maps/lib/components/places/StandaloneSearchBox"
import classnames from 'classnames';
import config from '../../utils/config';


const Map = withScriptjs(withGoogleMap((props) => {
    return < GoogleMap
        defaultZoom={8}
        defaultCenter={props.location}
        center={props.location}
    >
        <Marker
            position={props.location}
        />
    </GoogleMap>
}))
class globalSearch extends Component {
    state = {
        offer_list: [],
        chat_list: [],
        user_list: [],
        page_no: 1,
        offer_page_no: 1,
        chat_page_no: 1,
        user_page_no: 1,
        offer_limit: 5,
        chat_limit: 5,
        user_limit: 5,
        lastEvaluatedKey: undefined,
        searchStr: '',
        total: '',
        user_data: [],
        offer_data: [],
        Latitude: 59.95,
        Longitude: 30.33,
        zoom: 11,
        refs: {},
        places: [],
        offer_total: 0,
        chat_total: 0,
        user_total: 0
    }
    async componentDidMount() {
        console.log('\n\n\nBACK ---->>>', this.props.location.state);
        if (this.props.location.state) {
            this.setState({ ...this.props.location.state.data })
            await this.props.history.replace({ pathname: this.props.location.pathname, state: {} })

        }

        if (localStorage.getItem('str') != null || localStorage.getItem('str') != undefined) {
            this.setState({ searchStr: localStorage.getItem('str') }, () => this.getData())
            localStorage.removeItem('str');
        }
    }
    onSearchBoxMounted = (ref) => {
        this.setState({ refs: { ...this.state.refs, searchBox: ref } })
    }

    onPlacesChanged = () => {
        const places = this.state.refs.searchBox.getPlaces();
        if (places.length > 0) {
            this.setState({
                store_lat: places[0].geometry.location.lat(), store_long: places[0].geometry.location.lng(),
                Latitude: places[0].geometry.location.lat(), Longitude: places[0].geometry.location.lng()
            });
        }
        else {
            displayLog(0, 'No geometry found!')
            this.setState({
                store_lat: '', store_long: ''
            });
        }
    }

    getData = async () => {
        if (this.state.searchStr == '') {
            displayLog(0, "Please enter text to search");
        } else {
            let reqData = {
                searchStr: this.state.searchStr.trim(),
                page_no: this.state.page_no,
                limit: this.state.limit
            }
            let res = await apiCall('POST', 'globalSearch', reqData);
            console.log('RES DATA ---->>', res);
            await this.setState({
                offer_list: res.Offer,
                chat_list: res.chat,
                user_list: res.user,
                user_total: res.user.total,
                offer_total: res.Offer.total,
                chat_total: res.chat.total
            })
        }
    }
    changeSearch = (e) => {
        let text = String(e.target.value);
        this.setState({ searchStr: text })
    }
    enterPressed = async (event) => {
        var code = event.keyCode || event.which;
        if (code === 13) { //13 is the enter keycode
            await this.setState({ page_no: 1 })
            this.search()
        }
    }
    search() {
        this.setState({ users: [] });
        this.getData();
    }

    viewUser = async (data) => {
        this.props.history.push(process.env.PUBLIC_URL + '/users', { user_id: data.user_id, searchString: this.state.searchStr });
    }

    viewOffer = async (data) => {
        this.props.history.push(process.env.PUBLIC_URL + '/offers', { offer_id: data.Id, searchString: this.state.searchStr });
    }

    viewChat = (data) => {
        console.log('data-21123->>', data);
        this.props.history.push(process.env.PUBLIC_URL + '/userConversation/' + data.user_id,
            {
                ...this.state,
                flag: 1,
                conversationId: data.conversation_id,
                name: data.user_name
            });
    }


    handleOfferPageClick = (e) => {
        this.setState({ offer_page_no: e.selected + 1 }, () => {
            this.getOffer();
        });
    }
    handleUserPageClick = (e) => {
        this.setState({ user_page_no: e.selected + 1 }, () => {
            this.getUser();
        });
    }
    handleChatPageClick = (e) => {
        this.setState({ chat_page_no: e.selected + 1 }, () => {
            this.getChat();
        });
    }

    getUser = async () => {
        let reqData = {
            searchStr: this.state.searchStr,
            user_page_no: this.state.user_page_no,
            user_limit: this.state.user_limit
        }
        let res = await apiCall('POST', 'globalSearchUser', reqData);
        console.log('\n\n\nGET OFFER=>', res);
        this.setState({ user_list: res })
    }

    getOffer = async () => {
        let reqData = {
            searchStr: this.state.searchStr,
            offer_page_no: this.state.offer_page_no,
            offer_limit: this.state.offer_limit
        }
        let res = await apiCall('POST', 'globalSearchOffer', reqData);
        console.log('\n\n\nGET OFFER=>', res);
        this.setState({ offer_list: res })
    }

    getChat = async () => {
        let reqData = {
            searchStr: this.state.searchStr,
            chat_page_no: this.state.chat_page_no,
            chat_limit: this.state.chat_limit
        }
        let res = await apiCall('POST', 'globalSearchChat', reqData);
        console.log('\n\n\nGET chat=>', res);
        this.setState({ chat_list: res })
    }
    changeLimit = (e) => {
        this.setState({ limit: +e.target.value, page_no: 1 }, () => {
            this.getData();
        });
    }

    blockUser = async () => {
        let reqData = {
            id: this.state.user_data.Id,
            blockStatus: 1
        }
        let flag = await confirmBox('Wage', 'Are you sure you want to block user??');
        if (flag) {
            let res = await apiCall('POST', 'changeBlockStatus', reqData);
            displayLog(res.code, res.message);
            window.$('#userModal').modal('hide');
            this.getData();
        }
    }

    deleteUser = async () => {
        let reqData = {
            id: this.state.user_data.Id,
        }
        let flag = await confirmBox('Wage', 'Are you sure you want to delete user??');
        if (flag) {
            let res = await apiCall('POST', 'deleteUser', reqData);
            displayLog(res.code, res.message);
            window.$('#userModal').modal('hide');
            this.getData();
        }
    }

    deleteOffer = async () => {
        let reqData = {
            id: this.state.offer_data.Id,
        }
        let flag = await confirmBox('Wage', 'Are you sure you want to delete offer??');
        if (flag) {
            let res = await apiCall('POST', 'deleteOffer', reqData);
            displayLog(res.code, res.message);
            window.$('#offerModal').modal('hide');
            this.getOffer();
        }
    }

    render() {
        console.log('\n\nSTATE::::>>>', this.state);
        return (
            <div className="animated fadeIn">
                <Row className="globalSearch">
                    <Col xl={12}>
                        <Row className="align-items-right">
                            <Col sm="12" md="1" xl className="mb-3 mb-xl-0">
                            </Col>
                            <Col sm="12" md="3" xs className="mb-3 mb-xl-0">
                                <Input type="text" placeholder={`Search by keyword`}
                                    value={this.state.searchStr}
                                    name="searchStr" onChange={(e) => this.changeSearch(e)}
                                    onKeyPress={(e) => this.enterPressed(e)} />
                            </Col>
                            <Col sm="12" md="2" xs className="mb-3 mb-xl-0">
                                <Button block color="primary" size="sm" onClick={() => this.search()}>Search</Button>
                            </Col>
                        </Row>
                    </Col>
                </Row>

                <Nav tabs>
                    <NavItem>
                        <NavLink
                            className={classnames({ active: 1 })}
                        >
                            Offers
                        </NavLink>
                    </NavItem>
                </Nav>
                <TabPane tabId="1">
                    <Row>
                        <Col sm="12">
                            <Row className="align-items-right">
                                <Col sm="12">
                                    <Card>
                                        <CardBody>
                                            <Row className="align-items-right pb-4">
                                            </Row>
                                            <Table bordered striped responsive size="sm">
                                                <thead>
                                                    <tr>
                                                        <th scope="col" rowSpan="2" className="text-center align-middle">No</th>
                                                        <th scope="col" rowSpan="2" className="text-left align-left pl-3">Title</th>
                                                        <th scope="col" rowSpan="2" className="text-center align-left pl-3">Description</th>
                                                        <th scope="col" colSpan="3" rowSpan="2" className="text-center align-middle">Action</th>
                                                    </tr>
                                                </thead>
                                                {this.state.offer_list.data && this.state.offer_list.data.length > 0 ?
                                                    <tbody>
                                                        {this.state.offer_list.data.map((o, index) =>
                                                            <>
                                                                <tr>
                                                                    <td className="text-center">{index + 1 + ((this.state.offer_page_no - 1) * this.state.offer_limit)}</td>
                                                                    <td>{o.Title}</td>
                                                                    <td>{o.Description}</td>
                                                                    <td><span className="fa fa-tag GlobalSearchIcons action-icon" title="View Offer" onClick={() => this.viewOffer(o)}></span></td>

                                                                </tr>
                                                            </>
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
                                            <Col className="GS-Pagination">

                                                <ReactPaginate
                                                    pageCount={Math.ceil(this.state.offer_total / this.state.offer_limit)}
                                                    onPageChange={this.handleOfferPageClick}
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
                        </Col>
                    </Row>
                </TabPane>



                <Nav tabs>
                    <NavItem>
                        <NavLink
                            className={classnames({ active: 2 })}
                        >
                            Chat
                        </NavLink>
                    </NavItem>
                </Nav>
                <TabPane tabId="2">
                    <Row>
                        <Col sm="12">
                            <Row className="align-items-right">
                                <Col sm="12">
                                    <Card>
                                        <CardBody>
                                            <Table bordered striped responsive size="sm">
                                                <thead>
                                                    <tr>
                                                        <th scope="col" rowSpan="2" className="text-center align-middle">No</th>
                                                        <th scope="col" rowSpan="2" className="text-left align-left pl-3">Sender Name</th>
                                                        <th scope="col" rowSpan="2" className="text-center align-left pl-3 w-50">Message</th>
                                                        <th scope="col" rowSpan="2" className="text-left align-left pl-3">Offer Name</th>

                                                        <th scope="col" colSpan="3" rowSpan="2" className="text-center align-middle">Action</th>
                                                    </tr>
                                                </thead>
                                                {this.state.chat_list.data && this.state.chat_list.data.length > 0 ?
                                                    <tbody>
                                                        {this.state.chat_list.data.map((c, index) =>
                                                            <>
                                                                <tr>
                                                                    <td className="text-center">{index + 1 + ((this.state.chat_page_no - 1) * this.state.chat_limit)}</td>
                                                                    <td>{c.user_name}</td>
                                                                    <td>{c.Message}</td>
                                                                    <td>{c.Title}</td>
                                                                    <td>
                                                                        <span className="fa fa-user-o GlobalSearchIcons action-icon pr-1" title="View User" onClick={() => this.viewUser(c)}></span>
                                                                        <span className="fa fa-comment-o GlobalSearchIcons action-icon" title="View Chat" onClick={() => this.viewChat(c)}></span>
                                                                    </td>
                                                                </tr>
                                                            </>
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
                                            <Col className="GS-Pagination">
                                                <ReactPaginate
                                                    pageCount={Math.ceil(this.state.chat_total / this.state.chat_limit)}
                                                    onPageChange={this.handleChatPageClick}
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
                        </Col>
                    </Row>
                </TabPane>


                <Nav tabs>
                    <NavItem>
                        <NavLink
                            className={classnames({ active: 1 })}
                        >
                            Users
                        </NavLink>
                    </NavItem>
                </Nav>
                <TabPane tabId="1">
                    <Row>
                        <Col sm="12">
                            <Row className="align-items-right">
                                <Col sm="12">
                                    <Card>
                                        <CardBody>
                                            <Row className="align-items-right pb-4">
                                            </Row>
                                            <Table bordered striped responsive size="sm">
                                                <thead>
                                                    <tr>
                                                        <th scope="col" rowSpan="2" className="text-center align-middle">No</th>
                                                        <th scope="col" rowSpan="2" className="text-left align-left pl-3">First Name</th>
                                                        <th scope="col" rowSpan="2" className="text-center align-left pl-3">Last Name</th>
                                                        <th scope="col" colSpan="3" rowSpan="2" className="text-center align-middle">Action</th>
                                                    </tr>
                                                </thead>
                                                {this.state.user_list.data && this.state.user_list.data.length > 0 ?
                                                    <tbody>
                                                        {this.state.user_list.data.map((o, index) =>
                                                            <>
                                                                <tr>
                                                                    <td className="text-center">{index + 1 + ((this.state.user_page_no - 1) * this.state.user_limit)}</td>
                                                                    <td>{o.FirstName}</td>
                                                                    <td>{o.LastName}</td>
                                                                    <td><span className="fa fa-user-o GlobalSearchIcons action-icon" title="View User" onClick={() => this.viewUser(o)}></span></td>

                                                                </tr>
                                                            </>
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
                                            <Col className="GS-Pagination">

                                                <ReactPaginate
                                                    pageCount={Math.ceil(this.state.user_total / this.state.user_limit)}
                                                    onPageChange={this.handleUserPageClick}
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
                        </Col>
                    </Row>
                </TabPane>

                {/* USER DATA */}

                <div className="modal fade" id="userModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLabel">User Details</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <form>
                                    <div className="GlobalSearchImg">
                                        <img width="100" src={config.image_url + this.state.user_data.user_image}></img>
                                    </div>
                                    <div className="form-group">
                                        <label for="recipient-name" className="col-form-label">First Name:</label>
                                        <input type="text" className="form-control" id="recipient-name" value={this.state.user_data.FirstName} />
                                    </div>
                                    <div className="form-group">
                                        <label for="recipient-name" className="col-form-label">Last Name:</label>
                                        <input type="text" className="form-control" id="recipient-name" value={this.state.user_data.LastName} />
                                    </div>
                                    <div className="form-group">
                                        <label for="recipient-name" className="col-form-label">User Name:</label>
                                        <input type="text" className="form-control" id="recipient-name" value={this.state.user_data.UserName} />
                                    </div>
                                    <div className="form-group">
                                        <label for="recipient-name" className="col-form-label">Email:</label>
                                        <input type="text" className="form-control" id="recipient-name" value={this.state.user_data.Email} />
                                    </div>
                                    <div>
                                        <button type="button" className="btn btn-secondary mr-3" onClick={() => this.blockUser()}>Block</button>
                                        <button type="button" className="btn btn-secondary" onClick={() => this.deleteUser()}>Delete</button>
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" data-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* OFFER DATA */}

                <div class="modal fade" id="offerModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="exampleModalLabel">Offer Details</h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body">
                                <form>
                                    <div className="GlobalSearchImg">
                                        <img width="100" src={config.image_url + this.state.offer_data.image_url}></img>
                                    </div>
                                    <div class="form-group">
                                        <label for="recipient-name" class="col-form-label">Title:</label>
                                        <input type="text" class="form-control" id="recipient-name" value={this.state.offer_data.Title} />
                                    </div>
                                    <div class="form-group">
                                        <label for="recipient-name" class="col-form-label">Description:</label>
                                        <textarea class="form-control" id="message-text" value={this.state.offer_data.Description}></textarea>
                                    </div>
                                    <div class="form-group">
                                        <label for="recipient-name" class="col-form-label">Price:</label>
                                        <input type="text" class="form-control" id="recipient-name" value={this.state.offer_data.Price == null ? "Negotiable" : '$ ' + this.state.offer_data.Price} />
                                    </div>
                                    <div class="form-group" style={{ height: '50vh', width: '100%' }}>
                                        <label for="recipient-name" class="col-form-label">Location:</label>
                                        <Map
                                            googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyClNYOEkRO4TLHlXKXHCwGnH4RZ3xO6WJY&v=3.exp&libraries=geometry,drawing,places"
                                            loadingElement={<div style={{ height: `100%` }} />}
                                            containerElement={<div style={{ height: `300px` }} />}
                                            mapElement={<div style={{ height: `100%` }} />}
                                            onSearchBoxMounted={this.onSearchBoxMounted}
                                            location={{
                                                lat: this.state.Latitude,
                                                lng: this.state.Longitude
                                            }}
                                            onPlacesChanged={this.onPlacesChanged}
                                        />
                                    </div>
                                </form>
                                <div class="form-group pt-3">
                                    <button type="button" class="btn btn-secondary" onClick={() => this.deleteOffer()}>Delete</button>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-primary" data-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
export default globalSearch;