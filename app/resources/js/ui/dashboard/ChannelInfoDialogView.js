import View from "../View.js";
import { Event } from "../../utils/Observable.js";
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

function onLeaveChannelClick(channelInfoDialogView, data) {
    channelInfoDialogView.notifyAll(new LeaveChannelClickEvent());
}

function onDeleteChannelClick(channelInfoDialogView, data) {
    channelInfoDialogView.notifyAll(new DeleteChannelClickEvent());
}

function setListener(channelInfoDialogView) {
    channelInfoDialogView.el.querySelector(".leave-channel")
        .addEventListener("click", onLeaveChannelClick.bind(this, channelInfoDialogView));
    channelInfoDialogView.el.querySelector(".delete-channel")
        .addEventListener("click", onDeleteChannelClick.bind(this, channelInfoDialogView));
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