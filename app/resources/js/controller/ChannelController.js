import { Event, Observable } from "../utils/Observable.js";
import {Config, EventKeys, SocketKeys} from "../utils/Config.js";

class ChannelDataLoadedEvent extends Event {
    constructor(data) {
        super(EventKeys.CHANNEL_DATA_LOADED, {data: data});
    }
}

class CreateChannelDataLoadedEvent extends Event {
    constructor(data) {
        super(EventKeys.CREATED_CHANNEL_DATA_LOADED, {sketchData: data});
    }
}

class JoinNewChannelDataLoadedEvent extends Event {
    constructor() {
        super(EventKeys.JOIN_NEW_CHANNEL_DATA_LOADED, null);
    }
}

class LeaveChannelDataLoadedEvent extends Event {
    constructor() {
        super(EventKeys.LEAVE_CHANNEL_DATA_LOADED, null);
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
        xhr.open(Config.HTTP_GET, url, true);
        xhr.onload = function() {
            let data = JSON.parse(this.response).data;
            instance.notifyAll(new ChannelDataLoadedEvent(data));
        };
        xhr.send();
    }

    createChannel(channelName, sketchName) {
        let xhr = new XMLHttpRequest(),
            instance = this;
        xhr.open(Config.HTTP_POST, Config.API_URL_NEW_CHANNEL + channelName, true);
        xhr.withCredentials = true;
        xhr.onload = function() {
            let data = JSON.parse(this.response).data,
                name = sketchName,
            xhrSketch = new XMLHttpRequest();
            xhrSketch.open(Config.HTTP_POST, Config.API_URL_NEW_SKETCH + data.id, true);
            xhrSketch.withCredentials = true;
            xhrSketch.setRequestHeader("Content-Type", Config.CONTENT_TYPE_URL_ENCODED);
            xhrSketch.onload = function() {
                instance.notifyAll(new CreateChannelDataLoadedEvent(data));
            };

            if (sketchName === "" || sketchName === " ") {
                name = Config.DEFAULT_SKETCH_NAME;
            }
            xhrSketch.send("name=" + name.split(" ").join("+"));
        };
        xhr.send();
    }

    joinNewChannel(channelId) {
        let xhr = new XMLHttpRequest(),
            instance = this;
        xhr.open(Config.HTTP_POST, Config.API_URL_JOIN_CHANNEL + channelId, true);
        xhr.withCredentials = true;
        xhr.onload = function() {
            instance.notifyAll(new JoinNewChannelDataLoadedEvent());
        };
        xhr.send();
    }

    leaveChannel(channelId) {
        let xhr = new XMLHttpRequest(),
            instance = this;
        xhr.open(Config.HTTP_POST, Config.API_URL_LEAVE_CHANNEL + channelId, true);
        xhr.withCredentials = true;
        xhr.onload = function() {
            instance.notifyAll(new LeaveChannelDataLoadedEvent());
        };
        xhr.send();
    }
}

export default ChannelController;