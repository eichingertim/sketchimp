import {Config, EventKeys, SocketKeys} from "./Config.js";

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
                resolve()
            } else {
                reject(response.message)
            }
        } catch (error) {
            reject(error);
        }
    }

    static handleResponseWithCallbackParam(resolve, reject, jsonString) {
        try {
            let response = JSON.parse(jsonString);
            if (response.success !== Config.SUCCESS_ERROR) {
                resolve(response.data)
            } else {
                reject(response.message)
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
}

export default Helper;