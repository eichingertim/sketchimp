import View from "../View.js";
import { Event } from "../../utils/Observable.js";
import {EventKeys} from "../../utils/Config.js";

class TemplateSelectedEvent extends Event {
    constructor(url) {
        super(EventKeys.TEMPLATE_SELECTED, {url: url});
    }
}

/**
 * Notifies listener about a template was selected
 * @param templateDialogView current instance of the view
 * @param event clicked template's event
 */
function onTemplateClick(templateDialogView, event) {
    templateDialogView.notifyAll(new TemplateSelectedEvent(event.target.src));
}

/**
 * sets the listener for all templates and the close-dialog button
 * @param chooseTemplateDialogView current instance of the view
 */
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

/**
 * Represents the ChooseTemplate Dialog
 */
class ChooseTemplateDialogView extends View {
    constructor(el) {
        super();
        this.setElement(el);
        setListener(this);
    }
}

export default ChooseTemplateDialogView;