import {Config, EventKeys, SocketKeys} from "./utils/Config.js";

var joinButton = document.querySelector("button");
if (joinButton) {
  joinButton.addEventListener("click", function() {
    let xhr = new XMLHttpRequest(),
    channelId = document.querySelector(".channel-name").id;
    xhr.open(Config.HTTP_POST, Config.API_URL_JOIN_CHANNEL + channelId);
    xhr.onload = function() {
      console.log(this.responseText);
      if (JSON.parse(this.response).message === "Successfully joined Channel!") {
        window.location.href = "/dashboard";
      }
    }
    xhr.send();
  })
}