import {Config} from "../utils/Config.js";
import Helper from "../utils/Helper.js";

class MemberController {

    static fetchMemberData(url) {
        return new Promise(
            function (resolve, reject) {
                let xhr = new XMLHttpRequest();
                xhr.withCredentials = true;
                xhr.open(Config.HTTP.GET, url, true);
                xhr.onload = function() {
                    Helper.handleResponseWithCallbackParam(resolve, reject, xhr.response);
                };
                xhr.send();
            }
        );

    }
}

export default MemberController;