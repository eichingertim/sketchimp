import View from "../View.js";
import { Event } from "../../utils/Observable.js";
import {Config, EventKeys} from "../../utils/Config.js";

class SketchCreateEvent extends Event {
    constructor(name, isMultiLayer) {
        super(EventKeys.CREATE_SKETCH_SUBMIT, {name: name, isMultiLayer: isMultiLayer});
    }
}

class DialogCloseEvent extends Event {
    constructor() {
        super(EventKeys.CLOSE_CREATE_SKETCH_DIALOG, null);
    }
}

function onSketchSubmitClick(createSketchDialogView) {
    event.preventDefault();
    let name = createSketchDialogView.el.querySelector("#sketch_name").value,
        decision = createSketchDialogView.el.querySelector("input[name='layer']:checked").value;

    if (!name.match(Config.REGEX_NO_WHITE_SPACE)) {
        createSketchDialogView.notifyAll(new SketchCreateEvent(name, (decision === "multi-layer")));
    } else {
        createSketchDialogView.notifyAll(new SketchCreateEvent(null, null));
    }
}

function onDialogCloseClick(createSketchDialogView) {
    createSketchDialogView.notifyAll(new DialogCloseEvent());
}

function setListeners(createSketchDialogView) {
    let btnSubmit = createSketchDialogView.el.querySelector(".submit-sketch-create");
    btnSubmit.addEventListener("click", () => onSketchSubmitClick(createSketchDialogView));

    createSketchDialogView.el.querySelector("#create-sketch-close")
        .addEventListener("click", () => onDialogCloseClick(createSketchDialogView));
}

class CreateSketchDialogView extends View {
    constructor(el) {
        super();
        this.setElement(el);
        setListeners(this);
    }

    clearAfterSubmit() {
        this.el.querySelector("#sketch_name").value = "";
        this.toggleVisibility();
    }
}

export default CreateSketchDialogView;