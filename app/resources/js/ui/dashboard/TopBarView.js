import View from "../View.js";
import {Event} from "../../utils/Observable.js";
import Helper from "../../utils/Helper.js";
import {Config, EventKeys} from "../../utils/Config.js";

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

/**
 * Notifies listener about fullscreen image close-button was clicked
 * @param topBarView current instance of view
 */
function onCloseClick(topBarView) {
    topBarView.notifyAll(new FullScreenCloseClick());
}

/**
 * Notifies listener about the publish button was clicked
 * @param topBarView current instance of view
 */
function onPublishClick(topBarView) {
    let sketchId = document.querySelector(".fullscreen-image").children[0].id;
    topBarView.notifyAll(new PublishSketchClick(sketchId));
}

/**
 * Notifies listener about a sketch-history item was clicked
 * @param topBarView current instance of view
 * @param data click-event
 */
function onSketchHistoryItemClick(topBarView, data) {
    let image = data.target,
        sketchId = image.id.split("|")[0],
        isPublished = (image.id.split("|")[1] === "true");
    topBarView.notifyAll(new HistoryItemClickEvent(image.src, sketchId, isPublished));
}

/**
 * sets the listener for all items in the topbar
 * @param topBarView current instance of view
 */
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

/**
 * sets the listener for close and publish button of the sketch fullscreen image
 * @param topBarView
 */
function setFullScreenListener(topBarView) {
    topBarView.closeFullscreen.addEventListener("click", () => onCloseClick(topBarView));
    topBarView.btnPublishSketch.addEventListener("click", () => onPublishClick(topBarView));
}

/**
 * Represents the TopBar where Title, Settings-Button, Info-Button and SketchHistory is located
 */
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

    /**
     * Updates visibility of the settings button (visible just for admins)
     * @param currentChannelRole users current channel role
     */
    updateRoleVisibility(currentChannelRole) {
        if (currentChannelRole === Config.CHANNEL_ROLE_ADMIN) {
            this.adminSettingsButton.classList.remove("hidden");
        } else {
            this.adminSettingsButton.classList.add("hidden");
        }
        let roleTag = this.el.querySelector(".role-tag");
        Helper.setLabelColor(roleTag, currentChannelRole);
    }

    /**
     * updates the channel-name view
     * @param channelName current channel name
     */
    updateChannelName(channelName) {
        this.el.querySelector(".channel-title").innerHTML = channelName;
    }

    /**
     * clears the sketch-history list-view
     */
    clearSketchHistory() {
        this.sketchHistoryList.innerHTML = "";
    }

    /**
     * adds the complete sketch-history
     * @param sketches finalized sketches for the current channel
     */
    addSketchHistory(sketches) {
        let instance = this;
        sketches.forEach(sketch => {
            instance.addSketchHistoryItem(sketch.path, sketch.id, sketch.published);
        });
        setListener(this);
    }

    /**
     * adds one item to the sketch history
     * @param image path of the sketch-image
     * @param sketchId id of the sketch
     * @param isPublished bool if it was published to the public feed
     */
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

    /**
     * indicates that the sketch was published
     */
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

    /**
     * shows clicked sketch-history as fullscreen
     * @param data clicked sketch data
     */
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

    /**
     * closes fullscreen
     */
    closeFullScreen() {
        this.fullScreenContainer.classList.add("hidden");
    }

    /**
     * shows a red alert message on top
     * @param message text that should be alerted
     */
    showAlert(message) {
        let alertBox = this.el.querySelector(".error-alert"),
            alertMessage = this.el.querySelector("#error-message");
        alertBox.classList.remove("hidden");
        alertMessage.innerHTML = message;
        setTimeout(function () {
            alertBox.classList.add("hidden");
        }, Config.DELAY_SHOW_ERROR);
    }

}

export default TopBarView;