import View from "../View.js";
import { Event } from "../../utils/Observable.js";
import {Config, EventKeys} from "../../utils/Config.js";

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

function onSubmitChannelClick(createChannelDialogView) {
    event.preventDefault();
    let channelName = createChannelDialogView.el.querySelector("#r_name").value,
        sketchName = createChannelDialogView.el.querySelector("#r_sketch_name").value,
        decision = createChannelDialogView.el.querySelector("input[name='layer']:checked").value;

    if (!channelName.match(Config.REGEX_NO_WHITE_SPACE) && !sketchName.match(Config.REGEX_NO_WHITE_SPACE)) {
        createChannelDialogView.notifyAll(new CreateChannelEvent(channelName.trim(), sketchName.trim(), (decision === "multi-layer")));
    } else {
        createChannelDialogView.notifyAll(new CreateChannelEvent(null, null, null));
    }
}

function onDialogCloseClick(createChannelDialogView) {
    createChannelDialogView.notifyAll(new CloseDialogClick());
}

function setListener(createChannelDialogView) {
    createChannelDialogView.el.querySelector(".submit-channel-creation")
        .addEventListener("click", () => onSubmitChannelClick(createChannelDialogView));
    createChannelDialogView.el.querySelector("#create-channel-close")
        .addEventListener("click", () => onDialogCloseClick(createChannelDialogView));
}

class CreateChannelDialogView extends View {
    constructor(el) {
        super();
        this.setElement(el);
        setListener(this);
    }

    clearAfterSubmit() {
        this.el.querySelector("#r_name").value = "";
        this.el.querySelector("#r_sketch_name").value = "";
        this.hide();
    }

}

export default CreateChannelDialogView;