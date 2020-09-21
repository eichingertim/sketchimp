import View from "./View.js";
import {Event} from "../utils/Observable.js";

function initColorSlider(toolboxView) {
  return new iro.ColorPicker("#color-slider-container", {

      layout: [
      {
        component: iro.ui.Wheel,
        options: {
          sliderType: 'hue'
        },
      },
      {
        component: iro.ui.Slider,
        options: {
          sliderType: 'value'
        },
      }
    ],
      width:100

  });
}

function addClickListeners(toolboxView) {

  const collapseIcon = toolboxView.el.querySelector('#toolbox-collapse-expand');
  collapseIcon.addEventListener('click', onToolboxExpandCollapseClick.bind(this, toolboxView));

  const pen = toolboxView.el.querySelector('#toolbox-pen');
  pen.addEventListener("click", onPenRubberSwitch.bind(this, toolboxView));
  const rubber = toolboxView.el.querySelector('#toolbox-rubber');
  rubber.addEventListener("click", onPenRubberSwitch.bind(this, toolboxView));

  const sizeItems = toolboxView.el.querySelectorAll('.toolbox-size-item');
  sizeItems.forEach((sizeItem, i) => {
    sizeItem.addEventListener("click", onSizeItemClick.bind(this, toolboxView));
  });

  const undo = toolboxView.el.querySelector('#toolbox-undo');
  undo.addEventListener("click", onUndoClick.bind(this, toolboxView));

  const deleteForever = toolboxView.el.querySelector('#toolbox-delete-forever');
  deleteForever.addEventListener("click", onDeleteForeverClick.bind(this, toolboxView));

  toolboxView.colorPicker.on('color:change', onColorChanged.bind(this, toolboxView));
}

class DeleteForeverEvent extends Event {
  constructor() {
    super("DeleteForever", null);
  }
}

class SizeChangeEvent extends Event {
  constructor(size) {
    super("SizeChange", {size: size});
  }
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

class UndoEvent extends Event {
  constructor() {
    super("Undo", null);
  }
}

function onUndoClick(toolboxView, data) {
  toolboxView.notifyAll(new UndoEvent())
}

function onDeleteForeverClick(toolboxView, data) {
  toolboxView.notifyAll(new DeleteForeverEvent());
}

function onToolboxExpandCollapseClick(toolboxView, data) {
  const toolbox = toolboxView.el.querySelector(".dashboard-toolbox");
  if (toolbox.classList.contains("hidden")) {
    data.target.src = "/app/assets/toolbox_collapse.svg";
    data.target.classList.remove("toolbox-collapsed");
    data.target.classList.add("toolbox-expanded");
    toolbox.classList.remove("hidden");
  } else {
    data.target.src = "/app/assets/toolbox_icon.svg";
    data.target.classList.remove("toolbox-expanded");
    data.target.classList.add("toolbox-collapsed");
    console.log(data.target.classList);
    toolbox.classList.add("hidden");
  }
}

function onSizeItemClick(toolboxView, data) {
  toolboxView.notifyAll(new SizeChangeEvent(data.target.height));
}

function onColorChanged(toolboxView, data) {
  toolboxView.notifyAll(new ColorChangeEvent(data.hexString));
}

function onPenRubberSwitch(toolboxView, data) {
  toolboxView.switchRubberPencil(data.target.id);
  toolboxView.notifyAll(new PenRubberSwitchEvent(data.target.id));

}

class ToolboxView extends View {
  constructor(el) {
    super()
    this.setElement(el);
    this.colorPicker = initColorSlider(this);
    addClickListeners(this);
  }

  reset() {
    this.colorPicker.reset();
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
