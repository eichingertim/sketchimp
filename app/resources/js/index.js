/* eslint-env browser */
import Dashboard from "./Dashboard.js";

var socket = io(),
  dashboard,
  channelList;

  function fetchChannelData(href) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", href, true);
    xhr.onload = function() {
        document.querySelector(".info-container").innerHTML = this.responseText;
        let urlParts = href.split("/"),
        channelId = urlParts[urlParts.length - 1]
        console.log(dashboard.channelId);
        if (dashboard.channelId === null) {
          console.log('new dashboard');
          dashboard.onJoin(channelId);
        } else {
          console.log('available dashboard');
          dashboard.onLeave();
          dashboard.onJoin(channelId);
        }
        
    }
    xhr.send();
}

function triggerAjax() {
    event.preventDefault();
    fetchChannelData(this.href);
}

function onWindowResize() {
  dashboard.resizeElements();
}

function init() {
  dashboard = new Dashboard(socket);
  channelList = document.querySelectorAll(".channel");
  channelList.forEach(channel => {
    channel.addEventListener("click", triggerAjax);
  });

  fetchChannelData(channelList[0].href);
  
  window.onresize = onWindowResize;
}

init();
