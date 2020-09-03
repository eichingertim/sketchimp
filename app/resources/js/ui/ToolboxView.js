import View from "./View.js";
import {Event} from "../utils/Observable.js"

function addClickListeners(toolboxView) {
  const colors = toolboxView.el.querySelectorAll('.toolbox-color');
  colors.forEach((colorEl, i) => {
    colorEl.addEventListener("click", onColorClicked.bind(this, toolboxView));
  });

  const pen = toolboxView.el.querySelector('#toolbox-pen');
  pen.addEventListener("click", onPenRubberSwitch.bind(this, toolboxView));
  const rubber = toolboxView.el.querySelector('#toolbox-rubber');
  rubber.addEventListener("click", onPenRubberSwitch.bind(this, toolboxView));
}

class ColorChangeEvent extends Event {
  constructor(color) {
    super("ColorChange", {color: color});
  }
}

class PenRubberSwitchEvent extends Event {
  constructor(item) {
    super("PenRubberSwitch", {item: item});
  }
}

function onColorClicked(toolboxView, data) {
  toolboxView.notifyAll(new ColorChangeEvent(data.target.id));
}
onColorClicked
function onPenRubberSwitch(toolboxView, data) {
  toolboxView.switchRubberPencil(data.target.id);
  toolboxView.notifyAll(new PenRubberSwitchEvent(data.target.id));

}

class ToolboxView extends View {
  constructor(el) {
    super()
    this.setElement(el);
    addClickListeners(this);
  }

  switchRubberPencil(id) {
    const pen = this.el.querySelector('#toolbox-pen');
    const rubber = this.el.querySelector('#toolbox-rubber');
    if (id === "toolbox-pen") {
      pen.height= 100;
      rubber.height= 80;
    } else if (id === "toolbox-rubber") {
      pen.height=80;
      rubber.height=100;
    }
  }
}

export default ToolboxView;
