import View from "./View.js";
import { Event } from "../utils/Observable.js";
import {Config, EventKeys, SocketKeys} from "../utils/Config.js";

class LeaveChannelClickEvent extends Event {
    constructor(id) {
        super(EventKeys.LEAVE_CHANNEL_CLICK, {id: id});
    }
}

function onLeaveChannelClick(channelInfoDialogView, data) {
    let channelID = channelInfoDialogView.el.querySelector(".info-channel-id").textContent;
    channelInfoDialogView.notifyAll(new LeaveChannelClickEvent(channelID));
}

function setListener(channelInfoDialogView) {
    channelInfoDialogView.el.querySelector(".leave-channel")
        .addEventListener("click", onLeaveChannelClick.bind(this, channelInfoDialogView));
}

class ChannelInfoDialogView extends View {
    constructor(el) {
        super();
        this.setElement(el);
        setListener(this);
    }

    updateInfo(data) {
        this.el.querySelector(".info-channel-name").textContent = data.name;
        this.el.querySelector(".info-channel-id").textContent = data.id;
        this.el.querySelector(".info-channel-creation").textContent = data.creation;
        this.el.querySelector(".info-channel-creator").textContent = data.creator;
    }
}

export default ChannelInfoDialogView;