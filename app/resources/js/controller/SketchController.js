import { Event, Observable } from "../utils/Observable.js";

class SketchSavedEvent extends Event {
    constructor() {
        super("SketchSaved", null);
    }
}

class SketchCreateEvent extends Event {
    constructor() {
        super("SketchCreate", null);
    }
}

class SketchController extends Observable{

    constructor(socket) {
        super();
        this.socket = socket;
    }

    saveSketch(channelId) {
        let socketId = this.socket.id,
            instance = this;
        this.socket.emit("getLineHistory", {channelId: channelId, socketId: socketId});
        this.socket.on("getLineHistory", function (data) {
            let xhr = new XMLHttpRequest(),
                url = "/api/sketch/save/" + channelId;
            xhr.open("POST", url, true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.onload = function() {
                instance.notifyAll(new SketchSavedEvent());
            };
            xhr.send(JSON.stringify(data.channel));
        });

    }

    finalizeSketch(channelId, image) {

    }

    exportSketch(uri, name) {
        let link = document.createElement('a');
        link.download = name;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    createSketch(channelId, sketchName) {
        let xhrSketch = new XMLHttpRequest(),
            instance = this;
        xhrSketch.open("POST", "/api/sketch/new/" + channelId, true);
        xhrSketch.withCredentials = true;
        xhrSketch.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhrSketch.onload = function() {
            instance.notifyAll(new SketchCreateEvent());
        };
        xhrSketch.send("name=" + sketchName.split(" ").join("+"));
    }

}

export default SketchController;