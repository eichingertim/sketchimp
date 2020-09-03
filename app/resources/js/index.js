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
  let container = document.querySelector('#stage-parent');
  dashboard = new Dashboard(socket);

  window.onresize = onWindowResize;
}



init();
