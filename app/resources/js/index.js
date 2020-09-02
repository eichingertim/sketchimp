/* eslint-env browser */
import DrawAreaController from "./controller/DrawAreaController.js";
import DrawAreaView from "./ui/DrawAreaView.js";

var socket = io(),
  drawAreaController,
  drawAreaView;

function init() {

  const container = document.getElementById('container');
  drawAreaView = new DrawAreaView(container);

  drawAreaController = new DrawAreaController(socket);
  drawAreaController.addEventListener("LineDrawn", onLineDrawn.bind(this));
  drawAreaView.addEventListener("EmitLine", onLineShouldBeEmitted.bind(this));
}


function onLineDrawn(data) {
  drawAreaView.addLine(data.data.line);
}

function onLineShouldBeEmitted(data) {
  let mouse = data.data.mouse;
  drawAreaController.emitLine(mouse);
}


init();
