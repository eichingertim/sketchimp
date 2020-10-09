import {Config} from "./utils/Config.js";

const joinButton = document.querySelector("button");
if (joinButton) {
    joinButton.addEventListener("click", function () {
        let xhr = new XMLHttpRequest(),
            channelId = document.querySelector(".channel-name").id;
        xhr.open(Config.HTTP.POST, Config.API_URLS.JOIN_CHANNEL + channelId);
        xhr.onload = function () {
            if (JSON.parse(xhr.response).message === "Successfully joined Channel!") {
                window.location.href = "/dashboard";
            }
        };
        xhr.send();
    });
}