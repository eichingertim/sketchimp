import {Config, EventKeys, SocketKeys} from "../utils/Config.js";

class MemberController {

    static fetchMemberData(url) {
        return new Promise(
            function (resolve, reject) {
                let xhr = new XMLHttpRequest();
                xhr.open(Config.HTTP_GET, url, true);
                xhr.onload = function() {
                    resolve(this.response);
                };
                xhr.send();
            }
        );

    }
}

export default MemberController;