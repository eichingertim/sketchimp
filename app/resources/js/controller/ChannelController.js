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

class JoinNewChannelDataLoadedEvent extends Event {
    constructor() {
        super("JoinNewChannelDataLoaded", null);
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

    createChannel(channelName, sketchName) {
        let xhr = new XMLHttpRequest(),
            instance = this;
        xhr.open("POST", "/api/channel/new/" + channelName, true);
        xhr.withCredentials = true;
        xhr.onload = function() {
            let data = JSON.parse(this.response).data,
            xhrSketch = new XMLHttpRequest();
            xhrSketch.open("POST", "/api/sketch/new/" + data.id, true);
            xhrSketch.withCredentials = true;
            xhrSketch.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhrSketch.onload = function() {
                instance.notifyAll(new CreateChannelDataLoadedEvent(data));
            };
            xhrSketch.send("name=" + sketchName.split(" ").join("+"));
        };
        xhr.send();
    }

    joinNewChannel(channelId) {
        let xhr = new XMLHttpRequest(),
            instance = this;
        xhr.open("POST", "/api/channel/join/" + channelId, true);
        xhr.withCredentials = true;
        xhr.onload = function() {
            console.log(this.response);
            instance.notifyAll(new JoinNewChannelDataLoadedEvent());
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