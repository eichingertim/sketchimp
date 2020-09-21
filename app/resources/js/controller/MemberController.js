import { Event, Observable } from "../utils/Observable.js";

class MemberDataLoadedEvent extends Event {
    constructor(data) {
        super("MemberDataLoaded", data);
    }
}

class MemberController extends Observable {
    constructor() {
        super();
    }

    fetchMemberData(url) {
        let xhr = new XMLHttpRequest(),
            instance = this;
        xhr.open("GET", url, true);
        xhr.onload = function() {
            console.log(this.response);
            instance.notifyAll(new MemberDataLoadedEvent(this.response));
        };
        xhr.send();
    }
}

export default MemberController;