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

class ImportTemplateEvent extends Event {
    constructor() {
        super(EventKeys.IMPORT_TEMPLATE_CLICK, null);
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

function onImportTemplateClick(saveLoadView, data) {
    saveLoadView.notifyAll(new ImportTemplateEvent());
}

function setListeners(saveLoadView) {
    let btnSave = saveLoadView.el.querySelector("#save"),
        btnFinalizeAndCreate = saveLoadView.el.querySelector("#save-publish"),
        btnExportDownload = saveLoadView.el.querySelector("#export-download"),
        btnLoadTemplate = saveLoadView.el.querySelector("#import-template");

    btnSave.addEventListener("click", onSaveClick.bind(this, saveLoadView));
    btnFinalizeAndCreate.addEventListener("click", onFinalizeAndCreateNew.bind(this, saveLoadView));
    btnExportDownload.addEventListener("click", onExportSketchAndDownload.bind(this, saveLoadView));
    btnLoadTemplate.addEventListener("click", onImportTemplateClick.bind(this, saveLoadView));
}

class SaveLoadView extends View {

    constructor(el) {
        super();
        this.setElement(el);
        setListeners(this);
    }

    setSketchSaved() {
        let btnSave = this.el.querySelector("#save"),
            tmp = btnSave.value;

        btnSave.value = "Successfully saved";

        setTimeout(function(){
            btnSave.value = tmp;
        }, Config.DELAY_SHOW_SUCCESS);
    }

    setSketchFinalized() {
        let btnFinalizeAndCreate = this.el.querySelector("#save-publish"),
            tmp = btnFinalizeAndCreate.value;

        btnFinalizeAndCreate.value = "Successfully Finalized";

        setTimeout(function(){
            btnFinalizeAndCreate.value = tmp;
        }, Config.DELAY_SHOW_SUCCESS);
    }

    setSketchExported() {
        let btnExportDownload = this.el.querySelector("#export-download"),
            tmp = btnExportDownload.value;

        btnExportDownload.value = "Successfully Exported";

        setTimeout(function(){
            btnExportDownload.value = tmp;
        }, Config.DELAY_SHOW_SUCCESS);
    }
}

export default SaveLoadView;