import { Event, Observable } from "../utils/Observable.js";

class ChannelDataLoadedEvent extends Event {
    constructor(data) {
        super("ChannelDataLoaded", {data: data});
    }
}

class CreateChannelDataLoadedEvent extends Event {
    constructor(data) {
        super("CreateChannelDataLoaded", {data: data});
    }
}

class LeaveChannelDataLoadedEvent extends Event {
    constructor() {
        super("LeaveChannelDataLoaded", null);
    }
}

class ChannelController extends Observable {
    constructor() {
        super();
    }

    fetchChannelData(url) {
        event.preventDefault();
        let xhr = new XMLHttpRequest(),
            instance = this;
        console.log(url);
        xhr.open("GET", url, true);
        xhr.onload = function() {
            let data = JSON.parse(this.response).data;
            instance.notifyAll(new ChannelDataLoadedEvent(data));
        };
        xhr.send();
    }

    createChannel(channelName) {
        let xhr = new XMLHttpRequest(),
            instance = this;
        xhr.open("POST", "/api/channel/new/" + channelName, true);
        xhr.withCredentials = true;
        xhr.onload = function() {
            let data = JSON.parse(this.response).data;
            instance.notifyAll(new CreateChannelDataLoadedEvent(data));
        };
        xhr.send();
    }

    leaveChannel(channelId) {
        let xhr = new XMLHttpRequest(),
            instance = this;
        xhr.open("POST", "/api/channel/leave/" + channelId, true);
        xhr.withCredentials = true;
        xhr.onload = function() {
            console.log(this.response);
            instance.notifyAll(new LeaveChannelDataLoadedEvent());
        };
        xhr.send();
    }
}

export default ChannelController;