/* eslint-env browser */
import DrawAreaController from "./controller/DrawAreaController.js";
import DrawAreaView from "./ui/DrawAreaView.js";
import Dashboard from "./Dashboard.js";

var socket = io(),
  dashboard;

function onWindowResize() {
  dashboard.resizeElements();
}

function init() {
  dashboard = new Dashboard(socket);
  window.onresize = onWindowResize;
}



init();
