import View from "./View.js";
import { Event } from "../utils/Observable.js";

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

function setListener(createChannelDialogView) {
    createChannelDialogView.el.querySelector(".submit-channel-creation")
        .addEventListener("click", onSubmitChannelClick.bind(this, createChannelDialogView));
}

class CreateChannelDialogView extends View {
    constructor(el) {
        super();
        this.setElement(el);
        setListener(this);
    }

    clearAfterSubmit() {
        this.toggleVisibility();
        this.el.querySelector("#r_name").value = "";
        this.el.classList.toggle("hidden");
    }

}

export default CreateChannelDialogView;