import View from "./View.js";
import {Event} from "../utils/Observable.js";

class SaveEvent extends Event {
    constructor() {
        super("Save", null);
    }
}

class FinalizeEvent extends Event {
    constructor() {
        super("Finalize", null);
    }
}

class ExportEvent extends Event {
    constructor() {
        super("Export", null);
    }
}

function onSaveClick(saveLoadView, data) {
    saveLoadView.notifyAll(new SaveEvent());
}

function onFinalizeAndCreateNew(saveLoadView, data) {
    saveLoadView.notifyAll(new FinalizeEvent());
}

function onExportSketchAndDownload(saveLoadView, data) {
    saveLoadView.notifyAll(new ExportEvent());
}

function setListeners(saveLoadView) {
    let btnSave = saveLoadView.el.querySelector("#save"),
        btnFinalizeAndCreate = saveLoadView.el.querySelector("#save-publish"),
        btnExportDownload = saveLoadView.el.querySelector("#export-download");

    btnSave.addEventListener("click", onSaveClick.bind(this, saveLoadView));
    btnFinalizeAndCreate.addEventListener("click", onFinalizeAndCreateNew.bind(this, saveLoadView));
    btnExportDownload.addEventListener("click", onExportSketchAndDownload.bind(this, saveLoadView));
}

class SaveLoadView extends View {

    constructor(el) {
        super();
        this.setElement(el);
        setListeners(this);
    }

    setSketchSaved() {
        let btnSave = this.el.querySelector("#save");
        btnSave.innerHTML = "Successfully saved";
    }

    setSketchFinalized() {
        let btnFinalizeAndCreate = this.el.querySelector("#save-publish");
        btnFinalizeAndCreate.innerHTML = "Successfully Finalized";
    }

    setSketchExported() {
        let btnExportDownload = this.el.querySelector("#export-download");
        btnExportDownload.innerHTML = "Successfully Exported";
    }
}

export default SaveLoadView;