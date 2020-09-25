import { Event, Observable } from "../utils/Observable.js";
import {Config, EventKeys, SocketKeys} from "../utils/Config";

class MemberDataLoadedEvent extends Event {
    constructor(data) {
        super(EventKeys.DATA_OF_ONE_MEMBER_LOADED, data);
    }
}

class MemberController extends Observable {
    constructor() {
        super();
    }

    fetchMemberData(url) {
        let xhr = new XMLHttpRequest(),
            instance = this;
        xhr.open(Config.HTTP_GET, url, true);
        xhr.onload = function() {
            instance.notifyAll(new MemberDataLoadedEvent(this.response));
        };
        xhr.send();
    }
}

export default MemberController;