import View from "../View.js";
import {Event} from "../../utils/Observable.js";
import Helper from "../../utils/Helper.js";
import {Config, EventKeys, SocketKeys} from "../../utils/Config.js";



class ChannelInfoClick extends Event {
    constructor() {
        super(EventKeys.CHANNEL_INFO_CLICK, null);
    }
}

class AdminSettingsClick extends Event {
    constructor() {
        super(EventKeys.ADMIN_SETTINGS_CLICK, null);
    }
}

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

    topBarView.channelInfoButton.addEventListener("click", () => {
        topBarView.notifyAll(new ChannelInfoClick());
    });
    topBarView.adminSettingsButton.addEventListener("click", () => {
        topBarView.notifyAll(new AdminSettingsClick());
    });
}

function setFullScreenListener(topBarView) {
    topBarView.closeFullscreen.addEventListener("click", onCloseClick.bind(this, topBarView));
    topBarView.btnPublishSketch.addEventListener("click", onPublishClick.bind(this, topBarView));
}

class TopBarView extends View {
    constructor(el) {
        super();
        this.setElement(el);
        this.adminSettingsButton = this.el.querySelector(".admin-settings-icon");
        this.channelInfoButton = this.el.querySelector(".channel-info-icon");
        this.sketchHistoryList = this.el.querySelector(".sketch-history-list");
        this.fullScreenContainer = document.querySelector(".fullscreen-image");
        this.closeFullscreen = this.fullScreenContainer.querySelector("#close-full-screen");
        this.btnPublishSketch = this.fullScreenContainer.querySelector("#publish-to-public-feed");
        setListener(this);
        setFullScreenListener(this);
    }

    updateRoleVisibility(currentChannelRole) {
        if (currentChannelRole === Config.CHANNEL_ROLE_ADMIN) {
            this.adminSettingsButton.classList.remove("hidden");
        } else {
            this.adminSettingsButton.classList.add("hidden");
        }
        let roleTag = this.el.querySelector(".role-tag");
        Helper.setLabelColor(roleTag, currentChannelRole);
    }

    updateChannelName(channelName) {
        this.el.querySelector(".channel-title").innerHTML = channelName;
    }

    clearSketchHistory() {
        this.sketchHistoryList.innerHTML = "";
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
        let tmp = this.btnPublishSketch.innerHTML,
            instance = this;

        this.btnPublishSketch.innerHTML = "Published Successfully";

        setTimeout(function(){
            instance.btnPublishSketch.innerHTML = tmp;
            instance.btnPublishSketch.classList.add("hidden");
        }, Config.DELAY_SHOW_SUCCESS);
        this.btnPublishSketch.removeEventListener("click", onPublishClick.bind(this, instance));
    }

    showImageFullscreen(data) {
        let imageTag = this.fullScreenContainer.children[0];

        if (data.isPublished) {
            this.btnPublishSketch.classList.add("hidden");
        } else {
            this.btnPublishSketch.classList.remove("hidden");
        }

        imageTag.src = data.image;
        imageTag.id = data.sketchId;

        this.fullScreenContainer.classList.remove("hidden");
    }

    closeFullScreen() {
        this.fullScreenContainer.classList.add("hidden");
    }

}

export default TopBarView;