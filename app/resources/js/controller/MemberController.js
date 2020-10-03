import {Config, EventKeys, SocketKeys} from "../utils/Config.js";

class MemberController {

    static fetchMemberData(url) {
        console.log(url);
        return new Promise(
            function (resolve, reject) {
                let xhr = new XMLHttpRequest();
                xhr.withCredentials = true;
                xhr.open(Config.HTTP_GET, url, true);
                xhr.onload = function() {
                    let data = JSON.parse(this.response).data;
                    resolve(data);
                };
                xhr.send();
            }
        );

    }
}

export default MemberController;