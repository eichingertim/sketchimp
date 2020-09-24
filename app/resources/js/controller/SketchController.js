import { Event, Observable } from "../utils/Observable.js";

class SketchSavedEvent extends Event {
    constructor() {
        super("SketchSaved", null);
    }
}

class SketchController extends Observable{

    constructor() {
        super();
    }

    saveSketch(json, channelId) {
        console.log(json);
        let xhr = new XMLHttpRequest(),
            instance = this,
            url = "/api/sketch/save/" + channelId;
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onload = function() {
            instance.notifyAll(new SketchSavedEvent());
        };
        xhr.send(json);
    }
}

export default SketchController;