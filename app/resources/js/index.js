/* eslint-env browser */
import Dashboard from "./Dashboard.js";

let socket = io(),
  dashboard;

function joinChannel() {
  let channelID = document.querySelector("#r_join").value,
    xhr = new XMLHttpRequest(),
    href = "/api/channel/join/" + channelID;
  console.log(href);
  xhr.open("POST", href, true);
  xhr.withCredentials = true;
  xhr.onload = function() {
    console.log(this.response);
    /*
      Could update channel list / reload dashboard ui here
    */
  };
  xhr.send();
  document.querySelector("#r_join").value = "";
  document.querySelector(".create-channel-container").classList.toggle("hidden");
}



function triggerJoinChannelAjax() {
  event.preventDefault();
  joinChannel();
}

function onWindowResize() {
  dashboard.resizeElements();
}

function init() {
  dashboard = new Dashboard(socket);
  if (dashboard.channelId === null) {
    dashboard.onJoin(document.querySelector(".info-channel-id").textContent);
  }

  //document.querySelector(".submit-channel-join").addEventListener("click", triggerJoinChannelAjax);
  window.onresize = onWindowResize;
}

init();
