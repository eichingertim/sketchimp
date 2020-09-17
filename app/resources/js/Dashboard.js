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
  drawAreaView.updateColor(data.data.color);
}

function onSizeChanged(data) {
  drawAreaView.updateSize(data.data.size);
}

function onPenRubberSwitch(data) {
  drawAreaView.switchPenRubber(data.data.item);
}

function onDeleteForever(data) {
  drawAreaController.emitClearCanvas();
}

function onShouldClearCanvas(data) {
  drawAreaView.clearCanvas();
}

class Dashboard {
  constructor(socket) {
    const container = document.getElementById('container');
    const toolbox = document.querySelector('.dashboard-toolbox-container');

    this.socket = socket;
    this.channelId = null;

    drawAreaView = new DrawAreaView(container);
    drawAreaController = new DrawAreaController(socket);
    toolboxView = new ToolboxView(toolbox)

    drawAreaController.addEventListener("LineDrawn", onLineDrawn.bind(this));
    drawAreaController.addEventListener("ClearCanvas", onShouldClearCanvas.bind(this));

    drawAreaView.addEventListener("EmitLine", onLineShouldBeEmitted.bind(this));
    toolboxView.addEventListener("ColorChange", onColorChanged.bind(this));
    toolboxView.addEventListener("PenRubberSwitch", onPenRubberSwitch.bind(this));
    toolboxView.addEventListener("SizeChange", onSizeChanged.bind(this));
    toolboxView.addEventListener("DeleteForever", onDeleteForever.bind(this));
  }

  onJoin(channelId) {
    this.channelId = channelId;
    drawAreaController.join(this.channelId);
    drawAreaView.clearCanvas();
  }

  onLeave() {
    this.socket.emit("unsubscribe", {channelId: this.channelId})
  }

  resizeElements() {
    drawAreaView.fitWindow();
  }

}

export default Dashboard;
