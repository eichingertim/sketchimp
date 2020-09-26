import View from "../View.js";
import {Event} from "../../utils/Observable.js";
import {Config, EventKeys, SocketKeys} from "../../utils/Config.js";

let fullScreenContainer = document.querySelector(".fullscreen-image"),
    closeFullscreen = fullScreenContainer.querySelector("#close-full-screen"),
    btnPublishSketch = fullScreenContainer.querySelector("#publish-to-public-feed");

class HistoryItemClickEvent extends Event {
    constructor(image, sketchId, isPublished) {
        super(EventKeys.HISTORY_ITEM_CLICK, {image: image, sketchId: sketchId, isPublished: isPublished});
    }
}

class PublishSketchClick extends Event {
    constructor(sketchId) {
        super(EventKeys.PUBLISH_SKETCH_CLICK, {sketchId: sketchId});
    }
}

class FullScreenCloseClick extends Event {
    constructor() {
        super(EventKeys.FULLSCREEN_CLOSE_CLICK, null);
    }
}

function onCloseClick(topBarView, data) {
    topBarView.notifyAll(new FullScreenCloseClick());
}

function onPublishClick(topBarView, event) {
    let sketchId = document.querySelector(".fullscreen-image").children[0].id;
    topBarView.notifyAll(new PublishSketchClick(sketchId));
}

function onSketchHistoryItemClick(topBarView, data) {
    let image = data.target,
        sketchId = image.id.split("|")[0],
        isPublished = (image.id.split("|")[1] === "true");
    topBarView.notifyAll(new HistoryItemClickEvent(image.src, sketchId, isPublished));
}

function setListener(topBarView) {
    let historyItems = topBarView.el.querySelectorAll(".sketch-history-list-item");

    historyItems.forEach(item => {
        item.addEventListener("click", onSketchHistoryItemClick.bind(this, topBarView));
    });
}

function setFullScreenListener(topBarView) {
    closeFullscreen.addEventListener("click", onCloseClick.bind(this, topBarView));
    btnPublishSketch.addEventListener("click", onPublishClick.bind(this, topBarView));
}

class TopBarView extends View {
    constructor(el) {
        super();
        this.setElement(el);
        setListener(this);
        setFullScreenListener(this);
    }

    clearSketchHistory() {
        let sketchHistoryList = this.el.querySelector(".sketch-history-list");
        sketchHistoryList.innerHTML = "";
    }

    addSketchHistory(sketches) {
        let instance = this;
        sketches.forEach(sketch => {
            instance.addSketchHistoryItem(sketch.path, sketch.id, sketch.published);
        });
        setListener(this);
    }

    addSketchHistoryItem(image, sketchId, isPublished) {
        let sketchHistoryList = this.el.querySelector(".sketch-history-list"),
            li = document.createElement("li"),
            img = document.createElement("img");
        li.classList.add("sketch-history-list-item");
        img.classList.add("sketch-history-list-img");
        img.src = image;
        img.id = sketchId + "|" + isPublished;
        img.height = Config.SKETCH_HISTORY_ITEM_HEIGHT;
        li.appendChild(img);
        sketchHistoryList.appendChild(li);
    }

    finishedPublishing() {
        btnPublishSketch.innerHTML = "Published Successfully";
        let instance = this;
        btnPublishSketch.removeEventListener("click", onPublishClick.bind(this, instance));
    }

    showImageFullscreen(data) {
        let imageTag = fullScreenContainer.children[0];

        if (data.isPublished) {
            btnPublishSketch.classList.add("hidden");
        } else {
            btnPublishSketch.classList.remove("hidden");
        }

        imageTag.src = data.image;
        imageTag.id = data.sketchId;

        fullScreenContainer.classList.toggle("hidden");
    }

    closeFullScreen() {
        fullScreenContainer.classList.toggle("hidden");
    }

}

export default TopBarView;