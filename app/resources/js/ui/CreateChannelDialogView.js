import View from "./View.js";
import { Event } from "../utils/Observable.js";
import {Config, EventKeys, SocketKeys} from "../utils/Config.js";

class JoinNewChannelEvent extends Event {
    constructor(id) {
        super(EventKeys.JOIN_CHANNEL_SUBMIT, {id: id});

    }
}

class CreateChannelEvent extends Event {
    constructor(name, sketchName) {
        super(EventKeys.CREATE_CHANNEL_SUBMIT, {name: name, sketchName: sketchName});
    }
}

function onSubmitChannelClick(createChannelDialogView, data) {
    event.preventDefault();
    let channelName = createChannelDialogView.el.querySelector("#r_name").value,
        sketchName = createChannelDialogView.el.querySelector("#r_sketch_name").value;
    createChannelDialogView.notifyAll(new CreateChannelEvent(channelName, sketchName));
}

function onSubmitChannelJoin(createChannelDialogView, data) {
    event.preventDefault();
    let channelId = createChannelDialogView.el.querySelector("#r_join").value;
    createChannelDialogView.notifyAll(new JoinNewChannelEvent(channelId));
}

function setListener(createChannelDialogView) {
    createChannelDialogView.el.querySelector(".submit-channel-creation")
        .addEventListener("click", onSubmitChannelClick.bind(this, createChannelDialogView));
    createChannelDialogView.el.querySelector(".submit-channel-join")
        .addEventListener("click", onSubmitChannelJoin.bind(this, createChannelDialogView));
}

class CreateChannelDialogView extends View {
    constructor(el) {
        super();
        this.setElement(el);
        setListener(this);
    }

    clearAfterSubmit() {
        this.el.querySelector("#r_name").value = "";
        this.el.querySelector("#r_join").value = "";
        this.toggleVisibility();
    }

}

export default CreateChannelDialogView;