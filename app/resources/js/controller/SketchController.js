import {Event, Observable} from "../utils/Observable.js";
import {Config, EventKeys, SocketKeys} from "../utils/Config.js";

class SketchSavedEvent extends Event {
    constructor() {
        super(EventKeys.SKETCH_SAVED_IN_DB, null);
    }
}

class LoadedHistoryEvent extends Event {
    constructor(sketches) {
        super(EventKeys.LOADED_SKETCH_HISTORY_FOR_CHANNEL, {sketches: sketches});
    }
}

class SketchCreateEvent extends Event {
    constructor(sketchData) {
        super(EventKeys.FINALIZED_AND_CREATED_SKETCH, {data: sketchData});
    }
}

class PublishSketchEvent extends Event {
    constructor() {
        super(EventKeys.PUBLISH_SKETCH_FINISHED, null);
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

    finalizeSketch(channelId, imageBase64, newSketchName, isNewSketchMultiLayer) {
        let xhr = new XMLHttpRequest(),
            instance = this,
            sketchBody = {
                name: newSketchName,
                multilayer: isNewSketchMultiLayer,
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

    publishSketch(sketchId) {
        let xhr = new XMLHttpRequest(),
            instance = this;
        xhr.open(Config.HTTP_POST, Config.API_URL_SKETCH_PUBLISH + sketchId, true);
        xhr.onload = function () {
            instance.notifyAll(new PublishSketchEvent());
        };
        xhr.send();
    }

    loadHistory(channelId) {
        let xhr = new XMLHttpRequest(),
            instance = this;
        xhr.open(Config.HTTP_GET, Config.API_URL_FINALIZED_SKETCHES + channelId, true);
        xhr.onload = function () {
            let sketches = JSON.parse(this.response).data;
            instance.notifyAll(new LoadedHistoryEvent(sketches));
        };
        xhr.send();
    }

    exportSketch(uri, name) {
        let link = document.createElement("a");
        link.download = name;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

}

export default SketchController;