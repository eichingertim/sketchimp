import {Config} from "../utils/Config.js";
import Helper from "../utils/Helper.js";

/**
 * Class with static Methods to handle AJAX and therefore all XMLHttpRequests belonging to users/members
 */
class MemberController {

    /**
     * fetches data of members that was hovered over in the dashboard
     * @param url api-url with the memberId to call for
     * @returns {Promise<>} wait for request to finish
     */
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