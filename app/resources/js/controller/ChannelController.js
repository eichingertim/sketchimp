import { Event, Observable } from "../utils/Observable.js";
import {Config, EventKeys, SocketKeys} from "../utils/Config.js";

class ChannelDataLoadedEvent extends Event {
    constructor(data, sketchData) {
        super(EventKeys.CHANNEL_DATA_LOADED, {data: data, sketchData: sketchData});
    }
}

class CreateChannelAndSketchDataLoadedEvent extends Event {
    constructor(channelData, sketchData) {
        super(EventKeys.CREATED_CHANNEL_DATA_LOADED, {data: channelData, sketchData: sketchData});
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
            let data = JSON.parse(this.response).data,
                xhrSketch = new XMLHttpRequest();
            xhrSketch.open(Config.HTTP_GET, "/api/sketch/current/" + data.id, true);
            xhrSketch.onload = function () {
                let sketchData = JSON.parse(this.response).data;
                instance.notifyAll(new ChannelDataLoadedEvent(data, sketchData));
            };
            xhrSketch.send();
        };
        xhr.send();
    }

    createChannel(data) {
        let xhr = new XMLHttpRequest(),
            instance = this,
            channelName = data.name,
            sketchName = data.sketchData,
            isMultiLayer = data.isMultiLayer;
        xhr.open(Config.HTTP_POST, Config.API_URL_NEW_CHANNEL + channelName, true);
        xhr.withCredentials = true;
        xhr.onload = function() {
            let channelData = JSON.parse(this.response).data,
                name = sketchName,
            xhrSketch = new XMLHttpRequest();
            xhrSketch.open(Config.HTTP_POST, Config.API_URL_NEW_SKETCH + channelData.id, true);
            xhrSketch.withCredentials = true;
            xhrSketch.setRequestHeader("Content-Type", Config.CONTENT_TYPE_URL_ENCODED);
            xhrSketch.onload = function() {
                let sketchData = JSON.parse(this.response).data;
                instance.notifyAll(new CreateChannelAndSketchDataLoadedEvent(channelData, sketchData));
            };

            if (sketchName === "" || sketchName === " ") {
                name = Config.DEFAULT_SKETCH_NAME;
            }
            xhrSketch.send("name=" + name.split(" ").join("+") + "&multilayer="+isMultiLayer);
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