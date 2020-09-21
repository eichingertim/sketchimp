import View from "./View.js";
import { Event } from "../utils/Observable.js";

class JoinNewChannelEvent extends Event {
    constructor(id) {
        super("JoinNewChannel", {id: id});

    }
}

class CreateChannelEvent extends Event {
    constructor(name) {
        super("CreateChannel", {name: name});
    }
}

function onSubmitChannelClick(createChannelDialogView, data) {
    event.preventDefault();
    let channelName = createChannelDialogView.el.querySelector("#r_name").value;
    createChannelDialogView.notifyAll(new CreateChannelEvent(channelName));
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