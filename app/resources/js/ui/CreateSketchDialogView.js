import View from "./View.js";
import { Event } from "../utils/Observable.js";

class SketchCreateEvent extends Event {
    constructor(name) {
        super("SketchCreateClick", {name: name});
    }
}

function onSketchSubmitClick(createSketchDialogView, data) {
    event.preventDefault();
    let name = createSketchDialogView.el.querySelector("#sketch_name");
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