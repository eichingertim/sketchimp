import View from "./View.js";
import { Event } from "../utils/Observable.js";
import {Config, EventKeys, SocketKeys} from "../utils/Config";

class SketchCreateEvent extends Event {
    constructor(name) {
        super(EventKeys.CREATE_SKETCH_SUBMIT, {name: name});
    }
}

function onSketchSubmitClick(createSketchDialogView, data) {
    event.preventDefault();
    let name = createSketchDialogView.el.querySelector("#sketch_name").value;
    createSketchDialogView.notifyAll(new SketchCreateEvent(name));
}

function setListeners(createSketchDialogView) {
    let btnSubmit = createSketchDialogView.el.querySelector(".submit-sketch-create");
    btnSubmit.addEventListener("click", onSketchSubmitClick.bind(this, createSketchDialogView));
}

class CreateSketchDialogView extends View {
    constructor(el) {
        super();
        this.setElement(el);
        setListeners(this);
    }
}

export default CreateSketchDialogView;