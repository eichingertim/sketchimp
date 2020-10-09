import View from "../View.js";
import {Event} from "../../utils/Observable.js";
import {Config, EventKeys} from "../../utils/Config.js";

class DeleteForeverEvent extends Event {
    constructor() {
        super(EventKeys.CLEAR_CANVAS_CLICK, null);
    }
}

class SizeChangeEvent extends Event {
    constructor(size) {
        super(EventKeys.SIZE_CHANGE_CLICK, {size: size});
    }
}

class ColorChangeEvent extends Event {
    constructor(color) {
        super(EventKeys.COLOR_CHANGE_CLICK, {color: color});
    }
}

class PenRubberSwitchEvent extends Event {
    constructor(item) {
        super(EventKeys.PEN_RUBBER_SWITCH_CLICK, {item: item});
    }
}

class UndoEvent extends Event {
    constructor() {
        super(EventKeys.UNDO_CLICK, null);
    }
}

function onSizeItemClick(toolboxView, data) {
    toolboxView.notifyAll(new SizeChangeEvent(data.target.style.height.replace("px", "")));
    toolboxView.sizeItems.forEach(item => {
        if (item.id === data.target.id) {
            item.style.border = "2px solid white";
        } else {
            item.style.border = "";
        }
    });
}

function onColorChanged(toolboxView, data) {
    toolboxView.notifyAll(new ColorChangeEvent(data.hexString));
    toolboxView.sizeItems.forEach(item => {
        item.style.backgroundColor = data.hexString;
    });
}

function onPenRubberSwitch(toolboxView, data) {
    toolboxView.switchRubberPencil(data.target.id);
    toolboxView.notifyAll(new PenRubberSwitchEvent(data.target.id));

}

function addClickListeners(toolboxView) {
    toolboxView.pen.addEventListener("click", onPenRubberSwitch.bind(this, toolboxView));
    toolboxView.rubber.addEventListener("click", onPenRubberSwitch.bind(this, toolboxView));
    toolboxView.sizeItems.forEach((sizeItem) => {
        sizeItem.addEventListener("click", onSizeItemClick.bind(this, toolboxView));
    });
    toolboxView.undo.addEventListener("click", () => {
        toolboxView.notifyAll(new UndoEvent());
    });
    toolboxView.deleteForever.addEventListener("click", () => {
        toolboxView.notifyAll(new DeleteForeverEvent());
    });

    toolboxView.colorPicker.on("color:change", onColorChanged.bind(this, toolboxView));
}

/**
 * Iro is imported in the dashboard.ejs file -> not defined in this script
 */
function initColorSlider() {
    // eslint-disable-next-line no-undef
    return new iro.ColorPicker("#color-slider-container", {
        layout: [{
            // eslint-disable-next-line no-undef
                component: iro.ui.Wheel,
                options: {
                    sliderType: "hue",
                },
            },
            {
                // eslint-disable-next-line no-undef
                component: iro.ui.Slider,
                options: {
                    sliderType: "value",
                },
            },
        ],
        color: Config.DEFAULT_PEN_COLOR,
        width: Config.WIDTH_COLOR_PICKER,
        layoutDirection: "horizontal",
    });
}

class ToolboxView extends View {

    constructor(el) {
        super();
        this.setElement(el);
        this.colorPicker = initColorSlider();
        this.pen = this.el.querySelector("#toolbox-pen");
        this.rubber = this.el.querySelector("#toolbox-rubber");
        this.sizeItems = this.el.querySelectorAll(".toolbox-size-item");
        this.reset();
        this.undo = this.el.querySelector("#toolbox-undo");
        this.deleteForever = this.el.querySelector("#toolbox-delete-forever");

        addClickListeners(this);
    }

    reset() {
        this.colorPicker.reset();
        let instance = this;
        this.sizeItems[0].style.border = Config.SIZE_ITEM_SELECTED_BORDER;
        this.notifyAll(new SizeChangeEvent(this.sizeItems[0].style.height));
        this.sizeItems.forEach(item => {
            if (item.id !== "stroke-size-extra-small") {
                item.style.border = "";
            }
            item.style.backgroundColor = instance.colorPicker.color.hexString;
        });
    }

    switchRubberPencil(id) {
        const pen = this.el.querySelector("#toolbox-pen"),
            rubber = this.el.querySelector("#toolbox-rubber");
        if (id === "toolbox-pen") {
            pen.height = 100;
            rubber.height = 80;
        } else if (id === "toolbox-rubber") {
            pen.height = 80;
            rubber.height = 100;
        }
    }
}

export default ToolboxView;
