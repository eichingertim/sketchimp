import View from "../View.js";
import {Event} from "../../utils/Observable.js";
import {Config, EventKeys, SocketKeys} from "../../utils/Config.js";

class LeaveChannelClickEvent extends Event {
    constructor() {
        super(EventKeys.LEAVE_CHANNEL_CLICK, null);
    }
}

class DeleteChannelClickEvent extends Event {
    constructor() {
        super(EventKeys.DELETE_CHANNEL_CLICK, null);
    }
}

class CloseInfoDialogEvent extends Event {
    constructor() {
        super(EventKeys.CLOSE_INFO_DIALOG, null);
    }
}

function onLeaveChannelClick(channelInfoDialogView, data) {
    channelInfoDialogView.notifyAll(new LeaveChannelClickEvent());
}

function onDeleteChannelClick(channelInfoDialogView, data) {
    channelInfoDialogView.notifyAll(new DeleteChannelClickEvent());
}

function onDialogCloseClick(channelInfoDialogView, data) {
    channelInfoDialogView.notifyAll(new CloseInfoDialogEvent());
}

function copy2Clipboard(str) {
    let ta = document.createElement("textarea");
    ta.value = str;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
}

function setListener(channelInfoDialogView) {
    channelInfoDialogView.el.querySelector(".leave-channel")
        .addEventListener("click", onLeaveChannelClick.bind(this, channelInfoDialogView));
    channelInfoDialogView.el.querySelector(".delete-channel")
        .addEventListener("click", onDeleteChannelClick.bind(this, channelInfoDialogView));
    channelInfoDialogView.el.querySelector("#channel-info-close")
        .addEventListener("click", onDialogCloseClick.bind(this, channelInfoDialogView));
    channelInfoDialogView.el.querySelector(".profile-image-overlay").addEventListener("click", () => {
        channelInfoDialogView.el.querySelector("#channel-upload").click();
    });
    channelInfoDialogView.el.querySelector("#channel-upload").addEventListener("change", (event) => {
        channelInfoDialogView.el.querySelector("#selected-file").innerHTML = event.target.value;
        channelInfoDialogView.el.querySelector("#btn-upload-channel").style.visibility = "visible";
    });

    let btnCopyChannelId = channelInfoDialogView.el.querySelector(".copy-channel-id");
    btnCopyChannelId.addEventListener("click", () => {
        copy2Clipboard(channelInfoDialogView.el.querySelector(".info-channel-id").textContent);
        let tmp = btnCopyChannelId.innerHTML;
        btnCopyChannelId.innerHTML = "Successfully copied";
        setTimeout(function () {
            btnCopyChannelId.innerHTML = tmp;
        }, Config.DELAY_SHOW_SUCCESS);
    });
}

class ChannelInfoDialogView extends View {
    constructor(el) {
        super();
        this.setElement(el);
        setListener(this);
    }

    updateInfo(channel, isCreator) {
        this.el.querySelector(".info-channel-name").textContent = channel.channelName;
        this.el.querySelector(".info-channel-id").textContent = channel.channelId;
        this.el.querySelector(".info-channel-creation").textContent = channel.creationDate;
        this.el.querySelector(".info-channel-creator").textContent = channel.creatorName;

        if (isCreator) {
            this.el.querySelector(".leave-channel").classList.add("hidden");
            this.el.querySelector(".delete-channel").classList.remove("hidden");
        } else {
            this.el.querySelector(".leave-channel").classList.remove("hidden");
            this.el.querySelector(".delete-channel").classList.add("hidden");
        }

    }
}

export default ChannelInfoDialogView;