import {Config} from "./Config.js";

class Helper {
    static setLabelColor (element, role) {
        if(role === "admins"){
            element.textContent = "admins";
            element.classList.remove("label-info","label-danger");
            element.classList.add("label-success");
        } else if(role === "collaborators"){
            element.textContent = "collaborators";
            element.classList.remove("label-success", "label-danger");
            element.classList.add("label-info");
        } else {
            element.textContent = "viewers";
            element.classList.remove("label-success", "label-info");
            element.classList.add("label-danger");
        }
    }

    static handleSimpleResponse(resolve, reject, jsonString) {
        try {
            let response = JSON.parse(jsonString);
            if (response.success !== Config.SUCCESS_ERROR) {
                resolve();
            } else {
                reject(response.message);
            }
        } catch (error) {
            reject(error);
        }
    }

    static handleResponseWithCallbackParam(resolve, reject, jsonString) {
        try {
            let response = JSON.parse(jsonString);
            if (response.success !== Config.SUCCESS_ERROR) {
                resolve(response.data);
            } else {
                reject(response.message);
            }
        } catch (error) {
            reject(error);
        }
    }

    static getCookiePosition(cookies) {
        for (let i = 0; i < cookies.length; i++) {
            if (cookies[i].includes("user-id")) {
                return i;
            }
        }
    }

    static createUUID() {
        let dt = new Date().getTime();
        return Config.UUID_PATTERN.replace(/[xy]/g, function (c) {
            let r = (dt + Math.random() * Config.LENGTH_UUID) % Config.LENGTH_UUID | 0;
            dt = Math.floor(dt / Config.LENGTH_UUID);
            return (c === "x" ? r : (r & Config.UUID_BYTE_3 | Config.UUID_BYTE_8)).toString(Config.LENGTH_UUID);
        });
    }
}

export default Helper;