import View from "../View.js";
import { Event } from "../../utils/Observable.js";
import {Config, EventKeys, SocketKeys} from "../../utils/Config.js";

class TemplateSelectedEvent extends Event {
    constructor(url) {
        super(EventKeys.TEMPLATE_SELECTED, {url: url});
    }
}

function onTemplateClick(templateDialogView, event) {
    templateDialogView.notifyAll(new TemplateSelectedEvent(event.target.src));
}

function setListener(chooseTemplateDialogView) {
    let items = chooseTemplateDialogView.el.querySelectorAll(".template-item"),
        closeItem = chooseTemplateDialogView.el.querySelector("#close-template-screen");
    items.forEach((template) => {
       template.addEventListener("click", onTemplateClick.bind(this, chooseTemplateDialogView));
    });

    closeItem.addEventListener("click", () => {
        chooseTemplateDialogView.toggleVisibility();
    });

}

class ChooseTemplateDialogView extends View {
    constructor(el) {
        super();
        this.setElement(el);
        setListener(this);
    }
}

export default ChooseTemplateDialogView;