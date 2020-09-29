import View from "../View.js";
import { Event } from "../../utils/Observable.js";
import {Config, EventKeys, SocketKeys} from "../../utils/Config.js";

class JoinNewChannelEvent extends Event {
    constructor(id) {
        super(EventKeys.JOIN_CHANNEL_SUBMIT, {id: id});

    }
}

class CreateChannelEvent extends Event {
    constructor(name, sketchName, isMultiLayer) {
        super(EventKeys.CREATE_CHANNEL_SUBMIT, {name: name, sketchName: sketchName, isMultiLayer: isMultiLayer});
    }
}

class CloseDialogClick extends Event {
    constructor() {
        super(EventKeys.CLOSE_CREATE_CHANNEL_DIALOG, null);
    }
}

function onSubmitChannelClick(createChannelDialogView, data) {
    event.preventDefault();
    let channelName = createChannelDialogView.el.querySelector("#r_name").value,
        sketchName = createChannelDialogView.el.querySelector("#r_sketch_name").value,
        decision = createChannelDialogView.el.querySelector("input[name='layer']:checked").value;

    createChannelDialogView.notifyAll(new CreateChannelEvent(channelName, sketchName, (decision === "multi-layer")));
}

function onSubmitChannelJoin(createChannelDialogView, data) {
    event.preventDefault();
    let channelId = createChannelDialogView.el.querySelector("#r_join").value;
    createChannelDialogView.notifyAll(new JoinNewChannelEvent(channelId));
}

function onDialogCloseClick(createChannelDialogView, data) {
    createChannelDialogView.notifyAll(new CloseDialogClick());
}

function setListener(createChannelDialogView) {
    createChannelDialogView.el.querySelector(".submit-channel-creation")
        .addEventListener("click", onSubmitChannelClick.bind(this, createChannelDialogView));
    createChannelDialogView.el.querySelector(".submit-channel-join")
        .addEventListener("click", onSubmitChannelJoin.bind(this, createChannelDialogView));
    createChannelDialogView.el.querySelector("#create-channel-close")
        .addEventListener("click", onDialogCloseClick.bind(this, createChannelDialogView));
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
        this.hide();
    }

}

export default CreateChannelDialogView;