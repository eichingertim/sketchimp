import View from "./View.js";
import {Event} from "../utils/Observable.js";

class SaveEvent extends Event {
    constructor() {
        super("Save", null);
    }
}

function onSaveClick(saveLoadView, data) {
    saveLoadView.notifyAll(new SaveEvent());
}

function setListeners(saveLoadView) {
    let btnSave = saveLoadView.el.querySelector("#save");
    btnSave.addEventListener("click", onSaveClick.bind(this, saveLoadView));
}

class SaveLoadView extends View {

    constructor(el) {
        super();
        this.setElement(el);
        setListeners(this);
    }
}

export default SaveLoadView;