import React, { Component } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Button,
  CardFooter,
  Label,
  Input,
  FormGroup,
} from "reactstrap";
import Joi from "joi-browser";
import {
  apiCall,
  displayLog,
  confirmBox,
  formValueChangeHandler,
  validateSchema,
  getCode,
  getCurrentTimeStamp,
  capitalizeFirstLetter,
  lowerCaseWithHypen,
  encrypt,
  decrypt,
} from "../../utils/common";
import config from "../../utils/config";
import S3FileUpload from "react-s3";
import store from "../../utils/store";
import GoogleMapReact from "google-map-react";
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
} from "react-google-maps";
import { StandaloneSearchBox } from "react-google-maps/lib/components/places/StandaloneSearchBox";
import Carousel, { Dots } from "@brainhubeu/react-carousel";
import "@brainhubeu/react-carousel/lib/style.css";
import "react-responsive-modal/styles.css";
import { Modal } from "react-responsive-modal";

let profilePic = null;
let location = null;
const Map = withScriptjs(
  withGoogleMap((props) => {
    console.log("====================POspd==============");
    console.log(props);
    return (
      <GoogleMap
        defaultZoom={8}
        defaultCenter={props.location}
        center={props.location}
      >
        <StandaloneSearchBox
          ref={props.onSearchBoxMounted}
          onPlacesChanged={props.onPlacesChanged}
          value={props.locality}
        >
          <input
            type="text"
            placeholder="Search location"
            style={{
              boxSizing: `border-box`,
              border: `1px solid transparent`,
              width: `240px`,
              height: `40px`,
              padding: `0 12px`,
              margin: `10px 0`,
              borderRadius: `3px`,
              boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
              fontSize: `14px`,
              outline: `none`,
              textOverflow: `ellipses`,
              position: "absolute",
              top: 0,
              left: "220px",
            }}
          />
        </StandaloneSearchBox>
        <Marker position={props.location} />
      </GoogleMap>
    );
  })
);
class AddEditOffer extends Component {
  state = {
    category: [],
    offer_logo: "",
    form: {
      Description: "",
      Title: "",
      Price: "",
      selectedCategory: "",
      TaskerId: "",
      Note: null,
    },
    zoom: 11,
    refs: {},
    places: [],
    Latitude: -34.397,
    Longitude: 150.644,
    StateShortName: "",
    StateFullName: "",
    Locality: "",
    image_url: "",
    media_id: "",
    type: "",
    images: [],
    photos: [],
    deletedId: [],
    editedId: [],
    reqData: {},
    admin_id: "",
    notes: "",
    want_to_promotion: false,
    promotion: "",
  };

  resetState = () => {
    this.setState({
      deletedId: [],
      editedId: [],
    });
    profilePic = "";
  };

  onOpenModal = () => {
    this.setState({ open: true });
  };
  onCloseModal = () => {
    this.setState({ open: false, notes: "" });
  };

  async componentDidMount() {
    let adminData = localStorage.getItem("WAGE");
    adminData = decrypt(adminData);
    adminData = JSON.parse(adminData);
    if (this.props.match.params && this.props.match.params.offerId) {
      let res = await apiCall("POST", "getOffersById", {
        offer_id: this.props.match.params.offerId,
      });
      let images = await apiCall("POST", "getImages", {
        offer_id: this.props.match.params.offerId,
      });
      console.log("\n\n JKKKKKK", res);
      let arr = [];
      images.data.map((i) => {
        arr.push({
          Id: i.Id,
          IsTemporary: i.IsTemporary,
          IsVerified: i.IsVerified,
          NoFile: i.NoFile,
          OfferId: i.OfferId,
          Path: config.image_url + i.Path,
          Type: String(i.Type),
          UserId: i.UserId,
        });
      });
      console.log("images is====>>>", res.data);
      this.setState({
        Latitude: res.data[0].Latitude,
        Longitude: res.data[0].Longitude,
        StateShortName: res.data[0].StateShortName,
        StateFullName: res.data[0].StateFullName,
        Locality: res.data[0].Locality,
        TaskerId: res.data[0].TaskerId,
        media_id: res.data[0].media_id,
        type: String(res.data[0].Type),
        images: arr,
        user_name: res.data[0].user_name,
        email: res.data[0].Email,
        admin_id: adminData.id,
        // image_url: res.data[0].image_url
      });
      profilePic = res.data[0].image_url;
      this.setState({
        form: {
          Title: res.data[0].Title,
          Description: res.data[0].Description,
          Price: res.data[0].Price,
          selectedCategory: res.data[0].CategoryId,
          offer_logo: res.data[0].image_url,
          Note: res.data[0].editedReason,
        },
      });
    }
    this.getCategories();
  }

  getCategories = async () => {
    let res = await apiCall("POST", "getOfferCategories");
    await this.setState({ category: res.data });
  };

  submitHandler = async () => {
    const userData = this.props.location && this.props.location.state;
    console.log("PROPSSSSSS", userData);
    let data = JSON.parse(localStorage.getItem("UserFilters"));
    console.log("DATTTTTTTTAAA", data);
    console.log("\n\n\n\nIMAGE VLI-->>", this.state.form);
    let schema = Joi.object().keys({
      //  images: Joi.array().min(1).label('Image').required(),
      //  offer_logo: Joi.string().label('Image').optional(),
      images: Joi.optional(),
      Title: Joi.string().strict().trim().label("Title").required(),
      Description: Joi.any().optional(),
      Price: Joi.string().label("Price").required(),
      selectedCategory: Joi.string().label("Category").required(),
      Latitude: Joi.number().required(),
      Longitude: Joi.number().required(),
      StateShortName: Joi.string().label("Location").required(),
      StateFullName: Joi.string().label("Location").required(),
      Locality: Joi.string().required(),
      base64Pic: Joi.optional(),
      deletedId: Joi.any().optional(),
      Type: Joi.string().label("Type").required(),
      Note: Joi.any().optional(),
    });
    this.setState({
      error: await validateSchema(
        {
          //   offer_logo: this.state.form.offer_logo,
          Latitude: this.state.Latitude,
          Longitude: this.state.Longitude,
          StateShortName: this.state.StateFullName,
          StateFullName: this.state.StateFullName,
          Locality: this.state.Locality,
          Title: this.state.form.Title,
          Description: this.state.form.Description,
          Price: String(this.state.form.Price),
          selectedCategory: String(this.state.form.selectedCategory),
          Type: this.state.type,
          images: this.state.images,
          Note: this.state.form.Note,
        },
        schema
      ),
    });
    console.log("ERROR", this.state.error);
    if (!this.state.error.status) {
      let reqData = new FormData();
      console.log("userData", userData);

      if (
        userData.isDuplicate == undefined &&
        this.props.match.params &&
        this.props.match.params.offerId
      ) {
        ///// EDIT OFFER //////
        for (let index = 0; index < this.state.photos.length; index++) {
          const photo = this.state.photos[index];
          reqData.append("image", photo);
        }
        reqData.append("offer_id", this.props.match.params.offerId);
        reqData.append(
          "Title",
          capitalizeFirstLetter(this.state.form.Title.trim())
        );
        reqData.append("Description", this.state.form.Description.trim());
        reqData.append("Price", Number(this.state.form.Price));
        reqData.append("CategoryId", this.state.form.selectedCategory);
        reqData.append("TaskerId", localStorage.getItem("WAGE_AUTH_TOKEN"));
        reqData.append("Latitude", this.state.Latitude);
        reqData.append("Longitude", this.state.Longitude);
        reqData.append("StateShortName", this.state.StateShortName);
        reqData.append("StateFullName", this.state.StateFullName);
        reqData.append("Locality", this.state.Locality);
        reqData.append("media_id", this.state.media_id);
        reqData.append("type", this.state.type);
        reqData.append("deletedId", this.state.deletedId);
        reqData.append("editedId", this.state.editedId);
        reqData.append("Note", this.state.form.Note);

        // if (typeof (profilePic) !== "string") {
        //     reqData.append('image', this.state.images);
        // }
        console.log("\n\n\n", reqData);
        //await this.setState({ open: true, reqData: reqData })
        let res = await apiCall("POST", "editOffer", reqData);
        displayLog(res.code, res.message);
        if (userData.isUser == true) {
          console.log("TRUUUUEEE");
          //AccountType == 2 = business & AccountType = 1 => Users
          if (data.AccountType == 2) {
            this.props.history.push(
              process.env.PUBLIC_URL + "/business/edit/" + userData.userId
            );
          } else if (data.AccountType == 1) {
            this.props.history.push(
              process.env.PUBLIC_URL + "/users/edit/" + userData.userId
            );
          }
        } else {
          console.log("FALSSSSEEE");
          this.props.history.push(
            process.env.PUBLIC_URL + "/offers",
            this.props.location.state
          );
          // this.props.history.push(process.env.PUBLIC_URL + "/offers");
        }
      } else if (userData.isDuplicate == false) {
        ///// ADD OFFER //////
        this.resetState();
        if (
          this.state.want_to_promotion == true &&
          this.state.promotion == ""
        ) {
          displayLog(0, "Please select promotion type");
        } else {
          for (let index = 0; index < this.state.photos.length; index++) {
            const photo = this.state.photos[index];
            reqData.append("image", photo);
          }
          reqData.append(
            "Title",
            capitalizeFirstLetter(this.state.form.Title.trim())
          );
          reqData.append("Description", this.state.form.Description.trim());
          reqData.append("Price", Number(this.state.form.Price));
          reqData.append("CategoryId", this.state.form.selectedCategory);
          reqData.append("TaskerId", localStorage.getItem("WAGE_AUTH_TOKEN"));
          reqData.append("Latitude", this.state.Latitude);
          reqData.append("Longitude", this.state.Longitude);
          // reqData.append('image', this.state.images);
          reqData.append("StateShortName", this.state.StateShortName);
          reqData.append("StateFullName", this.state.StateFullName);
          reqData.append("Locality", this.state.Locality);
          reqData.append("type", this.state.type);
          reqData.append(
            "PromotionType",
            this.state.promotion == "" ? 0 : Number(this.state.promotion)
          );

          console.log("REQQDASA", reqData);
          let res = await apiCall("POST", "insertOffer", reqData);
          displayLog(res.code, res.message);
          this.props.history.push(
            process.env.PUBLIC_URL + "/offers",
            this.props.location.state
          );
        }
      } else if (userData.isDuplicate == true) {
        ///// DUPLICATE OFFER //////
        for (let index = 0; index < this.state.photos.length; index++) {
          const photo = this.state.photos[index];
          reqData.append("image", photo);
        }

        reqData.append(
          "Title",

          capitalizeFirstLetter(this.state.form.Title.trim())
        );
        reqData.append("Description", this.state.form.Description.trim());
        reqData.append("Price", Number(this.state.form.Price));
        reqData.append("CategoryId", this.state.form.selectedCategory);
        reqData.append("TaskerId", userData.userdata);
        reqData.append("Latitude", this.state.Latitude);
        reqData.append("Longitude", this.state.Longitude);
        reqData.append("StateShortName", this.state.StateShortName);
        reqData.append("StateFullName", this.state.StateFullName);
        reqData.append("Locality", this.state.Locality);
        reqData.append("insertType", "copy");
        reqData.append("type", this.state.type);
        reqData.append(
          "PromotionType",
          this.state.promotion == "" ? 0 : Number(this.state.promotion)
        );

        let res = await apiCall("POST", "insertOffer", reqData);
        displayLog(res.code, res.message);
        console.log("RESPONSEEE", res);
        //AccountType == 2 = business & AccountType = 1 => Users
        if (data.AccountType == 2) {
          this.props.history.push(
            process.env.PUBLIC_URL + "/business/edit/" + userData.userdata
          );
        } else if (data.AccountType == 1) {
          this.props.history.push(
            process.env.PUBLIC_URL + "/users/edit/" + userData.userdata
          );
        }
      }

      // if (userData.isDuplicate == true) {
      //   console.log("\n\n\n hghghghgh", userData);
      //   for (let index = 0; index < this.state.photos.length; index++) {
      //     const photo = this.state.photos[index];
      //     reqData.append("image", photo);
      //   }
      //   //   reqData.append("offer_id", this.props.match.params.offerId);
      //   reqData.append(
      //     "Title",
      //     //   this.state.form.Title
      //     capitalizeFirstLetter(this.state.form.Title.trim())
      //   );
      //   reqData.append("Description", this.state.form.Description.trim());
      //   reqData.append("Price", Number(this.state.form.Price));
      //   reqData.append("CategoryId", this.state.form.selectedCategory);
      //   reqData.append("TaskerId", userData.userdata);
      //   reqData.append("Latitude", this.state.Latitude);
      //   reqData.append("Longitude", this.state.Longitude);
      //   reqData.append("StateShortName", this.state.StateShortName);
      //   reqData.append("StateFullName", this.state.StateFullName);
      //   reqData.append("Locality", this.state.Locality);
      //   reqData.append("insertType", "copy");
      //   reqData.append("type", this.state.type);
      //   reqData.append(
      //     "PromotionType",
      //     this.state.promotion == "" ? 0 : Number(this.state.promotion)
      //   );
      //   // reqData.append("deletedId", this.state.deletedId);
      //   // reqData.append("editedId", this.state.editedId);
      //   // reqData.append("Note", this.state.form.Note);
      //   let res = await apiCall("POST", "insertOffer", reqData);
      //   displayLog(res.code, res.message);
      //   console.log("RESPONSEEE", res);
      //   //AccountType == 2 = business & AccountType = 1 => Users
      //   if (data.AccountType == 2) {
      //     this.props.history.push(
      //       process.env.PUBLIC_URL + "/business/edit/" + userData.userdata
      //     );
      //   } else if (data.AccountType == 1) {
      //     this.props.history.push(
      //       process.env.PUBLIC_URL + "/users/edit/" + userData.userdata
      //     );
      //   }
      //   // this.props.history.push(
      //   //   process.env.PUBLIC_URL + "/offers",
      //   //   this.props.location.state
      //   // );
      //   // let res = await apiCall("POST", "editOffer", reqData);
      // } else if (this.props.match.params && this.props.match.params.offerId) {
    } else {
      displayLog(0, this.state.error.message);
    }
  };

  callEditApi = async () => {
    const userData = this.props.location && this.props.location.state;
    console.log("PROPSSSSSS", userData);
    let reqData = this.state.reqData;
    reqData.append("notes", this.state.notes);
    reqData.append("admin_id", this.state.admin_id);
    reqData.append("edited_id", this.props.match.params.offerId);
    reqData.append("tab_type", 2);

    let res = await apiCall("POST", "editOffer", this.state.reqData);
    displayLog(res.code, res.message);
    if (userData.isUser == true) {
      console.log("TRUUUUEEE");
      this.props.history.push(
        process.env.PUBLIC_URL + "/offers/edit/" + userData.userId
      );
    } else {
      console.log("FALSSSSEEE");
      this.props.history.push(
        process.env.PUBLIC_URL + "/offers",
        this.props.location.state
      );
      // this.props.history.push(process.env.PUBLIC_URL + "/offers");
    }
  };

  changeValuesHandler = (e) => {
    this.setState({ form: formValueChangeHandler(e, this.state.form) });
  };

  changeSelectValue = (e) => {
    let newFormValues = { ...this.state.form };
    newFormValues["selectedLeagues"] = e.target.value;
    this.setState({ form: newFormValues });
  };

  enterPressed = (event) => {
    var code = event.keyCode || event.which;
    if (code === 13) {
      //13 is the enter keycode
      this.submitHandler();
    }
  };

  handleSelectScrollBottom = () => {
    if (this.state.lastEvaluatedKey) {
      this.getUsers();
    }
  };
  // fileSelectHandler = (e, index, id) => {
  //     console.log('\n\n\n\n %%%%%%%%%%%%%%% IN FILE SELECT %%%%%%%%%%%%%%%%%%%%%%%', index, id);
  //     var form = { ...this.state.form };
  //     if (e.target.files && e.target.files[0]) {
  //         console.log('1111111111111111111111111111');
  //         let imageType = e.target.files[0].type;
  //         if (imageType === 'image/jpeg' || imageType === 'image/png' || imageType === 'image/jpg') {
  //             profilePic = e.target.files[0];
  //             this.setState({ form: form })
  //             let reader = new FileReader();
  //             reader.onload = (e) => {
  //                 form.offer_logo = e.target.result;
  //                 form.base64Pic = e.target.result;
  //                 this.setState({ form: form });
  //             };
  //             if (this.state.index && this.state.id) {
  //                 console.log('222222222222222222222222222222');

  //                 let images = this.state.images
  //                 reader.onload = (e) => {
  //                     images[this.state.index].Path = e.target.result
  //                     console.log('\n\n\n --()()()()->>>', images);
  //                     this.setState({ images: images })
  //                 }
  //             }
  //             reader.readAsDataURL(e.target.files[0]);
  //         }
  //         else {
  //             displayLog(0, 'Please select valid image!')
  //         }
  //     }
  // }

  fileSelectedHandler = (e, flag) => {
    console.log(
      "\n\n 1111111111111111111111",
      this.state.images.length,
      e.target.files.length
    );
    const file = Array.from(e.target.files);
    if (
      flag &&
      Number(this.state.images.length) + Number(e.target.files.length) > 7
    ) {
      displayLog(0, "Cant add more then 7 images");
    } else {
      if (flag) {
        this.setState(
          {
            photos: file,
          },
          () => console.log("\n\n\n %%%%%%%%>>>>>", this.state.photos)
        );
      } else {
        let arr = this.state.photos;
        arr.push(file[0]);
        console.log("\n\n\n $$$$$$$$$$>>>>>", arr);

        this.setState({
          photos: arr,
        });
      }
      if (file) {
        if (this.props.match.params && this.props.match.params.offerId) {
          let arr = this.state.images;
          if (flag) {
            file.map((f) =>
              this.state.images.push({ Path: URL.createObjectURL(f) })
            );
          }
          for (let y = 0; y < this.state.images.length; y++) {
            if (
              this.state.images[y].Id &&
              this.state.images[y].Id == this.state.id
            ) {
              console.log("\n IN LOOP CONDI");
              file.map((f) => (arr[y].Path = URL.createObjectURL(f)));
            }
          }
          console.log("\n\n ARR", arr);
          this.setState({ images: arr, id: null });
        } else {
          file.map((f) => this.state.images.push(URL.createObjectURL(f)));
        }
      }
    }
  };

  fileSelectedHandler1 = (e, flag) => {
    console.log("\n\n 11111111111********************11111111111", flag);
    const file = Array.from(e.target.files);
    this.setState({
      photos: file,
    });
    if (file) {
      console.log("222222222222222222222222222");
      if (this.props.match.params && this.props.match.params.offerId) {
        console.log("\n\n 33333333333333333", this.state.images.length);
        let arr = this.state.images;
        if (flag) {
          console.log("\n IN FLAG");
          file.map((f) =>
            this.state.images.push({ Path: URL.createObjectURL(f) })
          );
        }
        for (let y = 0; y < this.state.images.length; y++) {
          if (
            this.state.images[y].Id &&
            this.state.images[y].Id == this.state.id
          ) {
            console.log("\n IN LOOP CONDI");
            file.map((f) => (arr[y].Path = URL.createObjectURL(f)));
          }
        }
        console.log("\n\n ARR", arr);
        this.setState({ images: arr, id: null });
      } else {
        file.map((f) => this.state.images.push(URL.createObjectURL(f)));
      }
    }
  };

  uploadHandler = async (userId, file, newFileName) => {
    store.dispatch({
      type: "START_LOADER",
    });
    let query;
    const s3config = {
      bucketName: config.S3_BUCKET_NAME,
      dirName: `${userId}/team`,
      region: config.S3_REGION,
      accessKeyId: config.AWS_ACCESS_KEY,
      secretAccessKey: config.AWS_SECRET_KEY,
    };
    Object.defineProperty(file, "name", {
      writable: true,
      value: newFileName,
    });

    let data = await S3FileUpload.uploadFile(file, s3config);
    this.setState({ image_url: data.key });
    store.dispatch({
      type: "STOP_LOADER",
    });
  };
  onSearchBoxMounted = (ref) => {
    this.setState({ refs: { ...this.state.refs, searchBox: ref } });
  };

  onPlacesChanged = async () => {
    const places = this.state.refs.searchBox.getPlaces();
    console.log("\n\n\n\n\nPLACE---------->>>", places);
    if (places.length > 0) {
      await this.setState({
        store_lat: places[0].geometry.location.lat(),
        store_long: places[0].geometry.location.lng(),
        Locality: places[0].name,
      });
      console.log("==============dfgndfg", this.state.Locality);
      await this.setState({
        Latitude: places[0].geometry.location.lat(),
        Longitude: places[0].geometry.location.lng(),
      });
      for (let i = 0; i < places[0].address_components.length; i++) {
        for (let j = 0; j < places[0].address_components[i].types.length; j++) {
          if (
            places[0].address_components[i].types[j] ==
            "administrative_area_level_1"
          ) {
            this.setState({
              StateFullName: places[0].address_components[i].long_name,
              StateShortName: places[0].address_components[i].short_name,
              Latitude: places[0].geometry.location.lat(),
              Longitude: places[0].geometry.location.lng(),
              Locality: places[0].name,
            });
            break;
          }
        }
      }
    }
  };

  changeType = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  DeleteImageHandler(id, index) {
    let arr = this.state.images;
    arr.splice(index, 1);
    if (id) {
      let arr = this.state.deletedId;
      arr.push(id);
      this.setState({ deletedId: arr });
    }
    this.setState({ images: arr });
  }

  async asignImage(index, id) {
    console.log("\n\n ID IS ______________________>>>", id);
    let arr = this.state.editedId;
    console.log("\n\n\n INCLUDE ", arr.includes(id));
    if (!arr.includes(id)) {
      arr.push(id);
    }
    await this.setState({ index: index, id: id, editedId: arr });
  }

  checkRadio = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  checkBox = (e) => {
    this.setState({ want_to_promotion: !this.state.want_to_promotion });
    if (!this.state.want_to_promotion == false) {
      this.setState({ promotion: "" });
    }
  };

  render() {
    console.log("offer state-->>", this.state);
    const userData = this.props.location && this.props.location.state;
    console.log("PROPSSSSSS", userData);
    return (
      <div className="animated fadeIn">
        <Row>
          <Col xl={12}>
            <Card>
              <CardHeader>
                <h4>
                  {this.props.match.params && this.props.match.params.offerId
                    ? "Edit Offer"
                    : "Add Offer"}
                </h4>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col xs="12" md="12">
                    <FormGroup>
                      <Label>Offer Image</Label>
                      {/* <div className="email1">
                                                <tr className="table-row">
                                                    <td className="column-1">
                                                        {
                                                            this.state.images.map((img, index) => (
                                                                <div className="profile-pic ">
                                                                    <img className="profile-img" src={img.Path} alt="" title="" onError={(event) => { event.target.onerror = null; event.target.src = require('../../assets/default.png') }} />
                                                                    <div className="image-upload edit-image"><label for="file-input">
                                                                        <a href><i className="fa fa-edit fa-lg" onClick={() => this.asignImage(index, img.Id)}></i></a></label>
                                                                        <input
                                                                            className="file-input"
                                                                            type="file"
                                                                            id={index}
                                                                            name="file-input"
                                                                            accept="image/jpg, image/png, image/jpeg"
                                                                            onChange={(e) => this.fileSelectHandler(e)} />
                                                                    </div>
                                                                    <div className="delete-image"><a href><i className="fa fa-trash fa-lg" onClick={() => this.DeleteImageHandler(img.Id)}></i></a></div>
                                                                </div>
                                                            ))

                                                        }

                                                    </td>
                                                </tr>
                                            </div> */}
                      <div className="email1">
                        {this.state.images.map((image, index) => (
                          <div className="profile-pic">
                            <img
                              className="profile-img"
                              src={
                                this.props.match.params &&
                                this.props.match.params.offerId
                                  ? image.Path
                                  : image
                              }
                              alt="profile"
                            ></img>
                            <div className="image-upload edit-image">
                              <label for={index}>
                                <a href>
                                  <i
                                    className="fa fa-edit fa-lg"
                                    onClick={() =>
                                      this.asignImage(index, image.Id)
                                    }
                                  ></i>
                                </a>
                              </label>
                              <input
                                className="file-input"
                                type="file"
                                id={index}
                                name={index}
                                multiple={false}
                                accept="image/jpg, image/png, image/jpeg"
                                onChange={(e) => this.fileSelectedHandler(e)}
                              />
                            </div>
                            <div className="delete-image edit-image">
                              <a href>
                                <i
                                  className="fa fa-trash fa-lg"
                                  onClick={() =>
                                    this.DeleteImageHandler(image.Id, index)
                                  }
                                ></i>
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* <center>
                                                {
                                                    (profilePic != null) &&
                                                    <img className="profile-img" src={this.state.form.base64Pic ? this.state.form.base64Pic : config.image_url + profilePic} alt="" title="" onError={(event) => { event.target.onerror = null; event.target.src = require('../../assets/default.png') }} />
                                                }
                                            </center> */}

                      <input
                        type="file"
                        id="file-input"
                        name="file-input"
                        className="file-input"
                        accept="image/jpg, image/png, image/jpeg"
                        multiple
                        onChange={(e) => this.fileSelectedHandler(e, true)}
                      />

                      {/* <Input className="file-input" type="file" id="file-input" name="file-input" accept="image/jpg, image/png, image/jpeg" multiple onChange={(e) => this.fileSelectedHandler(e)} /> */}
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  {this.props.match.params && this.props.match.params.offerId && (
                    <>
                      <Col xs="12" md="6">
                        <FormGroup>
                          <Label className="label-weight">User Name</Label>
                          <Input
                            type="text"
                            value={this.state["user_name"]}
                            disabled={true}
                          />
                        </FormGroup>
                      </Col>
                      <Col xs="12" md="6">
                        <FormGroup>
                          <Label className="label-weight">Email</Label>
                          <Input
                            type="text"
                            value={this.state["email"]}
                            disabled={true}
                          />
                        </FormGroup>
                      </Col>
                    </>
                  )}
                  <Col xs="12" md="6">
                    <FormGroup>
                      <Label className="label-weight">Title</Label>
                      <Input
                        type="text"
                        placeholder={`Enter title`}
                        value={this.state.form["Title"]}
                        onKeyPress={(e) => this.enterPressed(e)}
                        name="Title"
                        onChange={(e) => this.changeValuesHandler(e)}
                      />
                    </FormGroup>
                  </Col>
                  <Col xs="12" md="6">
                    <FormGroup>
                      <Label className="label-weight">Description</Label>
                      <Input
                        type="text"
                        placeholder={`Enter Description`}
                        value={this.state.form["Description"]}
                        onKeyPress={(e) => this.enterPressed(e)}
                        name="Description"
                        onChange={(e) => this.changeValuesHandler(e)}
                      />
                    </FormGroup>
                  </Col>
                  <Col xs="12" md="6">
                    <FormGroup>
                      <Label className="label-weight">Price</Label>
                      <Input
                        type="number"
                        placeholder={`Enter Price`}
                        value={this.state.form["Price"]}
                        onKeyPress={(e) => this.enterPressed(e)}
                        name="Price"
                        onChange={(e) => this.changeValuesHandler(e)}
                      />
                    </FormGroup>
                  </Col>
                  <Col xs="12" md="6">
                    <FormGroup>
                      <Label className="label-weight">Category</Label>
                      <Input
                        type="select"
                        name="selectedCategory"
                        value={this.state.form.selectedCategory}
                        onChange={(e) => {
                          this.changeValuesHandler(e);
                        }}
                      >
                        <option value="">Select Category</option>
                        {this.state.category.map((c, index) => (
                          <option key={index} value={c.Id}>
                            {c.Name}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col sm="12" md="6" className="mb-3 mb-xl-0">
                    <FormGroup>
                      <Label className="label-weight">Type</Label>
                      <Input
                        type="select"
                        name="type"
                        value={this.state.type}
                        onChange={(e) => this.changeType(e)}
                      >
                        <option value="">Select Type</option>
                        <option value={1}>Service</option>
                        <option value={0}>Gig</option>
                      </Input>
                    </FormGroup>
                  </Col>
                  {this.props.match.params &&
                  this.props.match.params.offerId ? (
                    <>
                      <Col sm="12" md="6" className="mb-3 mb-xl-0 OfferLink">
                        <Label className="label-weight">Offer Link</Label>
                        <a
                          href={
                            config.web_url +
                            `offer/${this.props.match.params.offerId}/${String(
                              this.state.form.Title
                            )
                              .replace(/\s/g, "-")
                              .toLowerCase()}`
                          }
                          target="_blank"
                        >
                          Click to open
                        </a>
                      </Col>
                      <Col sm="12" md="6" className="mb-3 mb-xl-0">
                        <FormGroup>
                          <Label className="label-weight">Note</Label>
                          <Input
                            type="textarea"
                            placeholder={`Enter Note`}
                            value={this.state.form["Note"]}
                            className="h150"
                            onKeyPress={(e) => this.enterPressed(e)}
                            name="Note"
                            onChange={(e) => this.changeValuesHandler(e)}
                          />
                        </FormGroup>
                      </Col>
                    </>
                  ) : (
                    <>
                      <Col sm="12" md="6" className="mb-3 mb-xl-0"></Col>
                      <Col sm="12" md="6" className="mb-3 mb-xl-0 p34">
                        <Input
                          type="checkbox"
                          name="want_to_promotion"
                          value={this.state.want_to_promotion}
                          checked={this.state.want_to_promotion}
                          onChange={(e) => this.checkBox(e)}
                        />
                        <Label>Want to promotion</Label>
                      </Col>

                      <Col sm="12" md="6" className="mb-3 mb-xl-0"></Col>
                      <Col sm="12" md="6" className="mb-3 mb-xl-0 p34">
                        {this.state.want_to_promotion === true && (
                          <>
                            <Input
                              type="radio"
                              id="Local"
                              name="promotion"
                              value="1"
                              checked={this.state.promotion === "1"}
                              onChange={(e) => this.checkRadio(e)}
                            />
                            <label for="male">Local</label> <br />
                            <Input
                              type="radio"
                              id="StateWide"
                              name="promotion"
                              value="2"
                              checked={this.state.promotion === "2"}
                              onChange={(e) => this.checkRadio(e)}
                            />
                            <label for="female">StateWide</label> <br />
                            <Input
                              type="radio"
                              id="NationWide"
                              name="promotion"
                              value="3"
                              checked={this.state.promotion === "3"}
                              onChange={(e) => this.checkRadio(e)}
                            />
                            <label for="other">NationWide</label>
                          </>
                        )}
                      </Col>
                    </>
                  )}

                  <Col xs="12" md="12">
                    <Map
                      googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyClNYOEkRO4TLHlXKXHCwGnH4RZ3xO6WJY&v=3.exp&libraries=geometry,drawing,places"
                      loadingElement={<div style={{ height: `100%` }} />}
                      containerElement={<div style={{ height: `300px` }} />}
                      mapElement={<div style={{ height: `100%` }} />}
                      onSearchBoxMounted={this.onSearchBoxMounted}
                      location={{
                        lat: this.state.Latitude,
                        lng: this.state.Longitude,
                      }}
                      onPlacesChanged={this.onPlacesChanged}
                      locality={this.state.Locality}
                    />
                  </Col>
                </Row>
              </CardBody>
              <CardFooter>
                <Button
                  color="primary"
                  onClick={this.submitHandler}
                  style={{ marginRight: "8px" }}
                >
                  Submit
                </Button>
              </CardFooter>
            </Card>
          </Col>
        </Row>
        <Modal open={this.state.open} onClose={this.onCloseModal} center>
          <div className="modal-body pt-0">
            <form>
              <div class="modal-header p-0 pb-2 mb-2">
                <h5 class="modal-title" id="exampleModalLabel">
                  Add Note
                </h5>
              </div>
              <div className="form-group">
                <label for="message-text" className="col-form-label">
                  Note:
                </label>
                <textarea
                  className="form-control"
                  id="message-text"
                  required
                  value={this.state.notes}
                  onChange={(e) => this.setState({ notes: e.target.value })}
                ></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => this.callEditApi()}
              disabled={this.state.notes == ""}
            >
              Submit
            </button>
          </div>
        </Modal>
      </div>
    );
  }
}

export default AddEditOffer;
