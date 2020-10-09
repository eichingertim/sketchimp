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

/**
 * checks if entered data is valid and notifies the listener about it
 * @param createSketchDialogView current instance of the view
 */
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

/**
 * Notifies the listener about the dialog-close-button was clicked
 * @param createSketchDialogView current instance of the view
 */
function onDialogCloseClick(createSketchDialogView) {
    createSketchDialogView.notifyAll(new DialogCloseEvent());
}

/**
 * set the listener for submit and close button
 * @param createSketchDialogView current instance of the view
 */
function setListeners(createSketchDialogView) {
    let btnSubmit = createSketchDialogView.el.querySelector(".submit-sketch-create");
    btnSubmit.addEventListener("click", () => onSketchSubmitClick(createSketchDialogView));

    createSketchDialogView.el.querySelector("#create-sketch-close")
        .addEventListener("click", () => onDialogCloseClick(createSketchDialogView));
}

/**
 * Represents the CreateSketch Dialog
 */
class CreateSketchDialogView extends View {
    constructor(el) {
        super();
        this.setElement(el);
        setListeners(this);
    }

    /**
     * Clears the input-fields and hides the dialog
     */
    clearAfterSubmit() {
        this.el.querySelector("#sketch_name").value = "";
        this.toggleVisibility();
    }
}

export default CreateSketchDialogView;