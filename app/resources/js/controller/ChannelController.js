import { Event, Observable } from "../utils/Observable.js";
import {Config, EventKeys, SocketKeys} from "../utils/Config.js";
import ChannelModel from "../models/ChannelModel.js";
import SketchModel from "../models/SketchModel.js";

class ChannelDataLoadedEvent extends Event {
    constructor(channel) {
        super(EventKeys.CHANNEL_DATA_LOADED, {channel: channel});
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
        if (event) {
            event.preventDefault();
        }
        let xhr = new XMLHttpRequest(),
            instance = this;
        xhr.open(Config.HTTP_GET, url, true);
        xhr.onload = function() {
            let data = JSON.parse(this.response).data, channel,
                xhrSketch = new XMLHttpRequest();
            if (data) {
                channel = new ChannelModel(data.id, data.name, data.creation, data.creator.id, data.creator.name, data.members);
            }
            xhrSketch.open(Config.HTTP_GET, "/api/sketch/current/" + data.id, true);
            xhrSketch.onload = function () {
                let sketchData = JSON.parse(this.response).data;
                channel.currentSketch = new SketchModel(sketchData.id, sketchData.name, sketchData.multilayer);
                instance.notifyAll(new ChannelDataLoadedEvent(channel));
            };
            xhrSketch.send();
        };
        xhr.send();
    }

    createChannel(data) {
        let xhr = new XMLHttpRequest(),
            instance = this,
            channelName = data.name,
            sketchName = data.sketchName,
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