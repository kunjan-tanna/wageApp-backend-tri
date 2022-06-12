import React, { Component } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Table,
  Button,
  Input,
} from "reactstrap";
import { apiCall } from "../../utils/common";
import ReactPaginate from "react-paginate";

class Chat extends React.Component {
  render() {
    return (
      <>
        <div className="massage-box">
          <div className="massage-Left">
            <h2>All Massages</h2>
            <div className="chat-box">
              <ul>
                {this.state.message != "" ? (
                  <div className="text-center">
                    <span>{this.state.message}</span>
                  </div>
                ) : (
                  this.state.userList.map((u) => (
                    <li onClick={() => this.getConversaction(u)}>
                      <div className="person-img">
                        {" "}
                        <img src={require("../../assets/User_ring.png")}></img>
                      </div>
                      <div className="person-detail">
                        <h3>{u.user_name} </h3>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
          <div className="massage-right">
            <div className="user-detail">
              {this.state.message == "" ? (
                <div className="person-img">
                  {" "}
                  <img src={require("../../assets/User_ring.png")}></img>
                </div>
              ) : null}
              <div className="person-detail">
                <h3>{this.state.name}</h3>
              </div>
            </div>
            <div className="user-chat-dec">
              {this.state.list &&
                this.state.list.map((l) => (
                  <div
                    className={
                      this.state.sender_id == l.SenderId
                        ? "user-chat clearfix"
                        : "user-chat-right clearfix"
                    }
                  >
                    {l.MessageType == 1 ? (
                      <span>
                        {l.Message}
                        <em className="massage-time">{l.SentDate}</em>
                      </span>
                    ) : (
                      <img
                        width="200"
                        src={
                          "http://drive.google.com/uc?export=view&id=115os7MTfhY2JBOTOH3mOnysgJCf9cZfJ"
                        }
                      ></img>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default Chat;

{
  /* <li>
                                    <div className="person-img"> <img src={require('../../assets/Mask Group-1.png')}></img></div>
                                    <div className="person-detail">
                                        <h3>Jack P. Angulo <span className="chat-time">07:15 PM</span></h3>

                                    </div>
                                </li>
                                <li>
                                    <div className="person-img"> <img src={require('../../assets/Mask Group-1.png')}></img></div>
                                    <div className="person-detail">
                                        <h3>Jack P. Angulo <span className="chat-time">07:15 PM</span></h3>

                                    </div>
                                </li>

                            </ul>
                            <ul className="old-chat">
                                <li>
                                    <div className="person-img"> <img src={require('../../assets/Mask Group-1.png')}></img></div>
                                    <div className="person-detail">
                                        <h3>Jack P. Angulo <span className="chat-time">Yesterday</span></h3>

                                    </div>
                                </li>
                                <li>
                                    <div className="person-img"> <img src={require('../../assets/Mask Group-1.png')}></img></div>
                                    <div className="person-detail">
                                        <h3>Jack P. Angulo <span className="chat-time">Yesterday</span></h3>

                                    </div>
                                </li> */
}

{
  /* <div className="user-chat clearfix">
                                <span>I am fine <em className="massage-time">07:15 AM</em></span>
                            </div>
                            <div className="user-chat clearfix">
                                <span>I am fine <em className="massage-time">07:15 AM</em></span>
                            </div>
                            <div className="user-chat-right clearfix">
                                <span>I am fine <em className="massage-time">07:15 AM</em></span>
                            </div>
                            <div className="user-chat-right clearfix">
                                <span>I am fine <em className="massage-time">07:15 AM</em></span>
                            </div>
                            <div className="user-chat clearfix">
                                <span>Lorem Ipsum is simply dummy text of the printing and typesetting industry <em className="massage-time">07:15 AM</em></span>
                            </div>
                            <div className="user-chat clearfix">
                                <span>I am fine <em className="massage-time">07:15 AM</em></span>
                            </div>
                            <div className="user-chat clearfix">
                                <span>I am fine <em className="massage-time">07:15 AM</em></span>
                            </div>
                            <div className="user-chat-right clearfix">
                                <span>I am fine <em className="massage-time">07:15 AM</em></span>
                            </div>
                            <div className="user-chat-right clearfix">
                                <span>I am fine <em className="massage-time">07:15 AM</em></span>
                            </div>
                            <div className="user-chat clearfix">
                                <span>Lorem Ipsum is simply dummy text of the printing and typesetting industry <em className="massage-time">07:15 AM</em></span>
                            </div>
                            <div className="user-chat clearfix">
                                <span>I am fine <em className="massage-time">07:15 AM</em></span>
                            </div>
                            <div className="user-chat clearfix">
                                <span>I am fine <em className="massage-time">07:15 AM</em></span>
                            </div>
                            <div className="user-chat-right clearfix">
                                <span>I am fine <em className="massage-time">07:15 AM</em></span>
                            </div>
                            <div className="user-chat-right clearfix">
                                <span>I am fine <em className="massage-time">07:15 AM</em></span>
                            </div>
                            <div className="user-chat clearfix">
                                <span>Lorem Ipsum is simply dummy text of the printing and typesetting industry <em className="massage-time">07:15 AM</em></span>
                            </div> */
}
