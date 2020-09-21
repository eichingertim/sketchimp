/* eslint-env browser */
import Dashboard from "./Dashboard.js";

let socket = io(),
  dashboard;

function onWindowResize() {
  dashboard.resizeElements();
}

function init() {
  dashboard = new Dashboard(socket);
  if (dashboard.channelId === null) {
    dashboard.onJoin(document.querySelector(".info-channel-id").textContent);
  }

  window.onresize = onWindowResize;
}

init();
