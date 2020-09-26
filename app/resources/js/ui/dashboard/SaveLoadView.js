import View from "../View.js";
import {Event} from "../../utils/Observable.js";
import {Config, EventKeys, SocketKeys} from "../../utils/Config.js";

class SaveEvent extends Event {
    constructor() {
        super(EventKeys.SKETCH_SAVE_CLICK, null);
    }
}

class FinalizeEvent extends Event {
    constructor() {
        super(EventKeys.SKETCH_FINALIZE_CLICK, null);
    }
}

class ExportEvent extends Event {
    constructor() {
        super(EventKeys.SKETCH_EXPORT_CLICK, null);
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

        //TODO: just show couple seconds
        btnSave.innerHTML = "Successfully saved";
    }

    setSketchFinalized() {
        let btnFinalizeAndCreate = this.el.querySelector("#save-publish");

        //TODO: just show couple seconds
        btnFinalizeAndCreate.innerHTML = "Successfully Finalized";
    }

    setSketchExported() {
        let btnExportDownload = this.el.querySelector("#export-download");

        //TODO: just show couple seconds
        btnExportDownload.innerHTML = "Successfully Exported";
    }
}

export default SaveLoadView;