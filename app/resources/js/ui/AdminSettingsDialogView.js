import View from "./View.js";
import { Event } from "../utils/Observable.js";

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

class AdminSettingsDialogView extends View {
    constructor(el) {
        super();
        this.setElement(el);
        //setListener(this);
    }
}

export default AdminSettingsDialogView;