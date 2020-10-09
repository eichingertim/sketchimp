import View from "../View.js";
import {Event} from "../../utils/Observable.js";
import {Config, EventKeys} from "../../utils/Config.js";

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

function setListeners(saveLoadView) {
    let btnSave = saveLoadView.el.querySelector("#save"),
        btnFinalizeAndCreate = saveLoadView.el.querySelector("#save-publish"),
        btnExportDownload = saveLoadView.el.querySelector("#export-download"),
        btnLoadTemplate = saveLoadView.el.querySelector("#import-template");

    btnSave.addEventListener("click", () => {
        saveLoadView.notifyAll(new SaveEvent());
    });
    btnFinalizeAndCreate.addEventListener("click", () => {
        saveLoadView.notifyAll(new FinalizeEvent());
    });
    btnExportDownload.addEventListener("click", () => {
        saveLoadView.notifyAll(new ExportEvent());
    });
    btnLoadTemplate.addEventListener("click",() => {
        saveLoadView.notifyAll(new ImportTemplateEvent());
    });
}

class SaveLoadView extends View {

    constructor(el) {
        super();
        this.setElement(el);
        setListeners(this);
    }

    setSketchSaved() {
        let btnSave = this.el.querySelector("#span-save"),
            tmp = btnSave.innerHTML;

        btnSave.innerHTML = "Successfully Saved";

        setTimeout(function(){
            btnSave.innerHTML = tmp;
        }, Config.DELAY_SHOW_SUCCESS);
    }

    setSketchFinalized() {
        let btnFinalizeAndCreate = this.el.querySelector("#span-archive"),
            tmp = btnFinalizeAndCreate.innerHTML;

        btnFinalizeAndCreate.innerHTML = "Successfully Finalized";

        setTimeout(function(){
            btnFinalizeAndCreate.innerHTML = tmp;
        }, Config.DELAY_SHOW_SUCCESS);
    }

    setSketchExported() {
        let btnExportDownload = this.el.querySelector("#span-download"),
            tmp = btnExportDownload.innerHTML;

        btnExportDownload.innerHTML = "Successfully Exported";

        setTimeout(function(){
            btnExportDownload.innerHTML = tmp;
        }, Config.DELAY_SHOW_SUCCESS);
    }
}

export default SaveLoadView;