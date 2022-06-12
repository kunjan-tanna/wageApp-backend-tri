import Joi from "joi-browser";
import config from "./config";
import history from "./history";
import * as crypto from "crypto-js";
import axios from "axios";
import alertify from "alertifyjs";
import store from "./store";

export const buildSchema = (attributes) => {
  const joiKeys = {};
  for (const key in attributes) {
    let myJoi = Joi;
    if (
      attributes[key].type === "String" ||
      ((attributes[key].type === "Reference" ||
        attributes[key].type === "Select") &&
        attributes[key].multiple === false)
    ) {
      myJoi = myJoi.string().strict().trim();
    }
    if (
      (attributes[key].type === "Reference" ||
        attributes[key].type === "Select") &&
      attributes[key].multiple === true
    ) {
      myJoi = myJoi.array().items();
    }
    if (attributes[key].type === "Number") {
      myJoi = myJoi.number();
    }
    if (attributes[key].type === "Integer") {
      myJoi = myJoi.number().integer();
    }
    if (attributes[key].type === "Email") {
      myJoi = myJoi.string().strict().trim().email({ minDomainSegments: 2 });
    }
    if (attributes[key].type === "Boolean") {
      myJoi = myJoi.boolean().strict();
    }
    if (attributes[key].pattern) {
      myJoi = myJoi.pattern(attributes[key].pattern);
    }
    if (
      attributes[key].min &&
      (attributes[key].type === "String" ||
        attributes[key].type === "Number" ||
        attributes[key].type === "Integer" ||
        ((attributes[key].type === "Reference" ||
          attributes[key].type === "Select") &&
          attributes[key].multiple === false))
    ) {
      myJoi = myJoi.min(attributes[key].min);
    }
    if (
      attributes[key].max &&
      (attributes[key].type === "String" ||
        attributes[key].type === "Number" ||
        attributes[key].type === "Integer" ||
        ((attributes[key].type === "Reference" ||
          attributes[key].type === "Select") &&
          attributes[key].multiple === false))
    ) {
      myJoi = myJoi.max(attributes[key].max);
    }
    if (
      attributes[key].required === true &&
      (attributes[key].type === "Reference" ||
        attributes[key].type === "Select")
    ) {
      myJoi = myJoi.min(1);
    }
    if (attributes[key].required === true) {
      myJoi = myJoi.required();
    }
    joiKeys[key] = myJoi;
  }
  return Joi.object().keys(joiKeys);
};

export const validateSchema = (body, schema) => {
  return new Promise((resolve, reject) => {
    Joi.validate(body, schema, (error, value) => {
      if (error) {
        console.log("ERROR", error);
        let msg;
        let key =
          error.details[0].context.label || error.details[0].context.key;
        if (error.details[0].type.includes("empty")) {
          msg = key.replace(/_/g, " ") + " is required!";
          msg = msg.charAt(0).toUpperCase() + msg.slice(1);
        } else if (error.details[0].type.includes("string.min")) {
          msg =
            key.replace(/_/g, " ") +
            " length must be at least " +
            error.details[0].context.limit +
            " characters long!";
          msg = msg.charAt(0).toUpperCase() + msg.slice(1);
        } else if (error.details[0].type.includes("string.max")) {
          msg =
            key.replace(/_/g, " ") +
            " length must be less than or equal to " +
            error.details[0].context.limit +
            " characters long!";
          msg = msg.charAt(0).toUpperCase() + msg.slice(1);
        } else if (error.details[0].type.includes("number.min")) {
          msg =
            key.replace(/_/g, " ") +
            "should be greater than or equal to " +
            error.details[0].context.limit;
          msg = msg.charAt(0).toUpperCase() + msg.slice(1);
        } else if (error.details[0].type.includes("number.max")) {
          msg =
            key.replace(/_/g, " ") +
            " should be less than or equal to " +
            error.details[0].context.limit;
          msg = msg.charAt(0).toUpperCase() + msg.slice(1);
        } else if (error.details[0].type.includes("allowOnly")) {
          msg = "Password and confirm password must be same!";
          msg = msg.charAt(0).toUpperCase() + msg.slice(1);
        } else {
          msg = "Please enter a valid " + key.replace(/_/g, " ") + "!";
        }
        resolve({
          status: true,
          message: msg,
        });
      } else {
        resolve({
          status: false,
          message: "",
        });
      }
    });
  });
};

export const setDeep = (obj, path, value, setrecursively = false) => {
  let level = 0;
  path.reduce((a, b) => {
    level++;
    if (
      setrecursively &&
      typeof a[b] === "undefined" &&
      level !== path.length
    ) {
      a[b] = {};
      return a[b];
    }
    if (level === path.length) {
      a[b] = value;
      return value;
    } else {
      return a[b];
    }
  }, obj);
  return obj;
};

export const formValueChangeHandler = (e, formValue) => {
  // console.log(e.target, e.target.name, e.target.value, e.target.type, e.target.checked);
  let name = e.target.name;
  const value =
    e.target.type === "checkbox" ? e.target.checked : e.target.value;
  if (name.includes(".")) {
    const path = name.split(".");
    setDeep(formValue, path, value);
  } else if (name.match(/\[(.*?)\]/)) {
    let index = name.match(/\[(.*?)\]/)[1];
    name = name.split("[")[0];
    console.log(name, index);
    formValue[name][index] = value;
  } else {
    formValue[name] = value;
  }
  // console.log(formValue);
  return formValue;
};

export const formValueChangeHandlerFoArray = (
  e,
  formValue,
  arrayName,
  index
) => {
  const newFormValue = { ...formValue };
  const newArrayValue = formValueChangeHandler(e, formValue[arrayName][index]);
  newFormValue.attributes[index] = newArrayValue;
  return newFormValue;
};

export const encrypt = (message) => {
  // encrypt message
  let cipherText = crypto.AES.encrypt(message, config.KEY).toString();
  return cipherText;
};

export const decrypt = (cipherText) => {
  // decrypt cipherText
  let message = crypto.AES.decrypt(cipherText, config.KEY).toString(
    crypto.enc.Utf8
  );
  return message;
};

// export const apiCall = (method, url, reqData, params) => {
//   return new Promise((resolve, reject) => {
//     store.dispatch({
//       type: 'START_LOADER'
//     })
//     let headers = {
//       language: "en",
//     };
//     if (url !== 'login') {
//       headers.auth_token = localStorage.getItem('WAGE_AUTH_TOKEN');
//     } else {
//       headers.auth_token = config.DEFAULT_AUTH_TOKEN;
//     }
//     let finalData = {
//       data: {
//         body: reqData,
//         headers: headers,
//         method: url
//       }
//     }
//     axios({
//       method: method,
//       url: config.API_BASE_URL + url,
//       data: finalData,
//       params: params
//     })
//       .then((response) => {
//         console.log('===============success', response);
//         store.dispatch({
//           type: 'STOP_LOADER'
//         })
//         let data = response.data;
//         if (data.code === 401) {
//           store.dispatch({
//             type: 'SET_REDRECT_TO_LOGIN_TRUE',
//           })
//           displayLog(data.code, "Session Expired, Please Login Again");
//         } else if (data.code === 0) {
//           displayLog(data.code, data.message);
//         } else {
//           resolve(data);
//         }
//       })
//       .catch((error) => {
//         console.log('=================error', error);
//         store.dispatch({
//           type: 'STOP_LOADER'
//         })
//         displayLog(0, 'Network Error!');
//         // setTimeout(() => {
//         //   logOut();
//         // }, 500);
//         return error;
//       })
//   })
// }

export const apiCall = async (method, url, reqData, params, header) => {
  console.log("METHOID", method, "URL", config.API_BASE_URL);
  return new Promise((resolve, reject) => {
    store.dispatch({
      type: "START_LOADER",
    });
    let headers;
    if (header) {
      headers = header;
    } else {
      headers = {
        language: "en",
        token: localStorage.getItem("WAGE_AUTH_TOKEN"),
      };
    }
    if (localStorage.getItem("WAGE_AUTH_TOKEN") !== null) {
      headers.auth_token = localStorage.getItem("WAGE_AUTH_TOKEN");
    }
    axios({
      method: method,
      url: config.API_BASE_URL + url,
      data: reqData,
      headers: headers,
      params: params,
    })
      .then((response) => {
        store.dispatch({
          type: "STOP_LOADER",
        });
        let data = response.data;
        if (data.code === 401) {
          displayLog(data.code, "Session Expired, Please Login Again");
        } else if (data.code === 0) {
          displayLog(data.code, data.message);
        } else {
          resolve(data);
        }
      })
      .catch(async (error) => {
        console.log("=================error", error);
        store.dispatch({
          type: "STOP_LOADER",
        });
        if (error && error.response && error.response.status === 401) {
          displayLog(0, "Session Expired, Please Login Again");
          logOut(false);
        } else {
          logOut(true);
        }
        return error;
      });
  });
};

export const displayLog = (code, message) => {
  alertify.dismissAll();
  if (code === 1) {
    alertify.success(message);
  } else if (code === 0) {
    alertify.error(message);
  } else {
    alertify.log(message);
  }
};

export const logOut = (props) => {
  console.log("================logout===============", props);
  if (props) {
    history.push(+"/login");
  } else {
    history.go(+"/login");
  }
  localStorage.clear();
};

export const capitalizeFirstLetter = (text) => {
  text = text.replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const lowerCaseWithHypen = (text) => {
  return text.toLowerCase().replace(/ /g, "_");
};

export const confirmBox = (title, message) => {
  return new Promise((resolve, reject) => {
    alertify.confirm(
      title,
      message,
      () => {
        resolve(1);
      },
      () => {
        resolve(0);
      }
    );
  });
};

export const getCode = (codeLength) => {
  var code = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567890";

  for (var i = 0; i < codeLength; i++) {
    code += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return code;
};

export const getCurrentTimeStamp = () => {
  const date = new Date();
  return Math.floor(date.getTime() / 1000);
};
