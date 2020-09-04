import DrawAreaController from "./controller/DrawAreaController.js";
import DrawAreaView from "./ui/DrawAreaView.js";
import ToolboxView from "./ui/ToolboxView.js";

var drawAreaView,
  drawAreaController,
  toolboxView;

function onLineDrawn(data) {
  drawAreaView.addLine(data.data);
}

function onLineShouldBeEmitted(data) {
  drawAreaController.emitLine(data.data);
}

function onColorChanged(data) {
  const colorCodeStr = drawAreaController.getColorStrFromColor(data.data.color);
  drawAreaView.updateColor(colorCodeStr);
}

function onSizeChanged(data) {
  drawAreaView.updateSize(data.data.size);
}

function onPenRubberSwitch(data) {
  drawAreaView.switchPenRubber(data.data.item);
}

class Dashboard {
  constructor(socket) {
    const container = document.getElementById('container');
    const toolbox = document.querySelector('.dashboard-toolbox');
    drawAreaView = new DrawAreaView(container);
    drawAreaController = new DrawAreaController(socket);
    toolboxView = new ToolboxView(toolbox)

    drawAreaController.addEventListener("LineDrawn", onLineDrawn.bind(this));
    drawAreaView.addEventListener("EmitLine", onLineShouldBeEmitted.bind(this));
    toolboxView.addEventListener("ColorChange", onColorChanged.bind(this));
    toolboxView.addEventListener("PenRubberSwitch", onPenRubberSwitch.bind(this));
    toolboxView.addEventListener("SizeChange", onSizeChanged.bind(this));
  }

  resizeElements() {
    drawAreaView.fitWindow();
  }

}

export default Dashboard;
