import View from "../View.js";
import {Event} from "../../utils/Observable.js";
import {Config, EventKeys} from "../../utils/Config.js";

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

class UploadChannelIconEvent extends Event {
    constructor(data) {
        super(EventKeys.UPLOAD_CHANNEL_ICON, data);
    }
}

function onLeaveChannelClick(channelInfoDialogView) {
    channelInfoDialogView.notifyAll(new LeaveChannelClickEvent());
}

function onDeleteChannelClick(channelInfoDialogView) {
    channelInfoDialogView.notifyAll(new DeleteChannelClickEvent());
}

function onDialogCloseClick(channelInfoDialogView) {
    channelInfoDialogView.notifyAll(new CloseInfoDialogEvent());
}

function copy2Clipboard(str) {
    let ta = document.createElement("textarea");
    ta.value = window.location.origin + "/join/" + str;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
}

function readURL(channelInfoDialogView, input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();

        reader.onload = function (e) {
            channelInfoDialogView.el.querySelector("#channel-icon").classList.add("preview");
            channelInfoDialogView.el.querySelector("#channel-icon").src = e.target.result;
        };

        reader.readAsDataURL(input.files[0]); // convert to base64 string
    }
}

function setListener(channelInfoDialogView) {
    try {
        channelInfoDialogView.el.querySelector(".leave-channel")
            .addEventListener("click", () => onLeaveChannelClick(channelInfoDialogView));
        channelInfoDialogView.el.querySelector(".delete-channel")
            .addEventListener("click", () => onDeleteChannelClick(channelInfoDialogView));
        channelInfoDialogView.el.querySelector("#channel-info-close")
            .addEventListener("click", () => onDialogCloseClick(channelInfoDialogView));
        channelInfoDialogView.el.querySelector(".profile-image-overlay").addEventListener("click", () => {
            channelInfoDialogView.el.querySelector("#channel-upload").click();
        });
        channelInfoDialogView.el.querySelector("#channel-upload").addEventListener("change", (event) => {
            channelInfoDialogView.el.querySelector("#form-upload-channel-icon").classList.remove("hidden");
            channelInfoDialogView.el.querySelector("#channel-icon").classList.remove("hidden");
            channelInfoDialogView.el.querySelector(".placeholder-channel-icon").classList.add("hidden");
            readURL(channelInfoDialogView, event.target);
            channelInfoDialogView.el.querySelector("#btn-upload-channel").style.visibility = "visible";
        });
        channelInfoDialogView.el.querySelector("#form-upload-channel-icon").addEventListener("submit", (event) => {
            event.preventDefault();
            channelInfoDialogView.notifyAll(new UploadChannelIconEvent({form: event.target}));
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
    } catch (e){
        //Error occurred
    }

}

class ChannelInfoDialogView extends View {
    constructor(el) {
        super();
        this.setElement(el);
        setListener(this);
    }

    updateInfo(channel, isCreator) {
        let image = this.el.querySelector("#channel-icon"),
            placeholder = this.el.querySelector(".placeholder-channel-icon"),
            date = new Date(channel.creationDate);

        if (channel.channelIcon) {
            image.classList.remove("hidden");
            image.src = channel.channelIcon;
            placeholder.classList.add("hidden");
        } else {
            image.classList.add("hidden");
            placeholder.classList.remove("hidden");
            placeholder.innerHTML = channel.channelName.substring(0, 1).toUpperCase();
        }

        this.el.querySelector(".info-channel-name").textContent = channel.channelName;
        this.el.querySelector(".info-channel-creation").textContent = date.toDateString() + ", " + date.toLocaleTimeString();
        this.el.querySelector(".info-channel-creator").textContent = channel.creatorName;
        this.el.querySelector("#form-upload-channel-icon").action = Config.API_URLS.CHANNEL_ICON_UPLOAD + channel.channelId;
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