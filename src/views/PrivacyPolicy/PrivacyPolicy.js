import React, { Component } from 'react';
import { Card, CardBody, CardHeader, Col, Row, Button, CardFooter } from 'reactstrap';
import CKEditor from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { apiCall, displayLog } from '../../utils/common';

class SpamReports extends Component {
  state = {
    editorReady : false,
    text : ''
  }

  componentDidMount() {
    this.getData();
  }

  submitHandler = async () => {
    let reqData = {
      PK : 'PRIVACY#123',
      SK : 'POLICY#123',
      text: this.state.text
    };
    let response = await apiCall('POST', 'updateStaticPages', reqData);
    displayLog(response.code, response.message);
  
  }

  getData = async () => {
    let reqData = {
      PK : 'PRIVACY#123',
      SK : 'POLICY#123'
    };
    let response = await apiCall('POST', 'getStaticPages', reqData);
    console.log(response)
    if(response.code === 1){
      this.setState({ text : response.data.text})
    } else {
      displayLog(response.code, response.message);
    }
  }

  render() {
    return (
      <div className="animated fadeIn">
        <Row>
          <Col xl={12}>
            <Card>
              <CardHeader>
                <h4>Privacy Policy</h4>
              </CardHeader>
              <CardBody>
                <Row className="align-items-right">
                  <Col sm="12" md="12" className="mb-3 mb-xl-0">
                  <CKEditor
                    editor={ ClassicEditor }
                    config={{
                      removePlugins: [ 'ImageUpload', 'MediaEmbed', 'BlockQuote', 'Table' ],
                    }}
                    data={this.state.text}
                    onChange={ ( event, editor ) => {
                        const data = editor.getData();
                        this.setState({ text : data})
                    } }
                  />
                  </Col>
                </Row>
              </CardBody>
              <CardFooter>
                <Button color="primary" onClick={this.submitHandler} style={{ marginRight: '8px' }}>Submit</Button>
              </CardFooter>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

export default SpamReports;
