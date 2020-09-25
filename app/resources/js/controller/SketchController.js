import {Event, Observable} from "../utils/Observable.js";
import {Config, EventKeys, SocketKeys} from "../utils/Config.js";

class SketchSavedEvent extends Event {
    constructor() {
        super(EventKeys.SKETCH_SAVED_IN_DB, null);
    }
}

class LoadedHistoryEvent extends Event {
    constructor(images) {
        super(EventKeys.LOADED_SKETCH_HISTORY_FOR_CHANNEL, {images: images});
    }
}

class SketchCreateEvent extends Event {
    constructor(sketchData) {
        super(EventKeys.FINALIZED_AND_CREATED_SKETCH, {data: sketchData});
    }
}

class SketchController extends Observable {

    constructor(socket) {
        super();
        this.socket = socket;
    }

    saveSketch(channelId) {
        let socketId = this.socket.id,
            instance = this;
        this.socket.emit(SocketKeys.CHANNEL_LINE_HISTORY, {channelId: channelId, socketId: socketId});
        this.socket.on(SocketKeys.CHANNEL_LINE_HISTORY, function (data) {
            let xhr = new XMLHttpRequest(),
                url = Config.API_URL_SKETCH_SAVE + channelId;
            xhr.open(Config.HTTP_POST, url, true);
            xhr.setRequestHeader("Content-Type", Config.CONTENT_TYPE_JSON);
            xhr.onload = function () {
                instance.notifyAll(new SketchSavedEvent());
            };
            xhr.send(JSON.stringify(data.channel));
        });

    }

    finalizeSketch(channelId, imageBase64, sketchName) {
        let xhr = new XMLHttpRequest(),
            instance = this,
            sketchBody = {
                name: sketchName,
                image: imageBase64,
            },
            url = "/api/sketch/finalize-create/" + channelId;
        xhr.open(Config.HTTP_POST, url, true);
        xhr.setRequestHeader("Content-Type", Config.CONTENT_TYPE_JSON);
        xhr.onload = function () {
            let newSketchData = this.response.data;
            instance.notifyAll(new SketchCreateEvent(newSketchData));
        };

        xhr.send(JSON.stringify(sketchBody));

    }

    loadHistory(channelId) {
        //loadhistory, then
        //this.notifyAll(new LoadedHistoryEvent(/*loadedImages*/));
    }

    exportSketch(uri, name) {
        let link = document.createElement("a");
        link.download = name;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /*createSketch(channelId, sketchName) {
        let xhrSketch = new XMLHttpRequest(),
            instance = this;
        xhrSketch.open("POST", "/api/sketch/new/" + channelId, true);
        xhrSketch.withCredentials = true;
        xhrSketch.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhrSketch.onload = function() {
            instance.notifyAll(new SketchCreateEvent());
        };
        xhrSketch.send("name=" + sketchName.split(" ").join("+"));
    }*/

}

export default SketchController;