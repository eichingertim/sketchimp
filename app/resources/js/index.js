/* eslint-env browser */
import Dashboard from "./Dashboard.js";

let socket = io(),
    dashboard;

function init() {
    let id = document.cookie.split("="),
        filteredUserId = (decodeURIComponent(id[1]).match("\".*\"")[0]).toString().match("[^\"]+")[0],
        channelId = document.querySelector(".info-channel-id").textContent;

    dashboard = new Dashboard(socket, filteredUserId);
    if (dashboard.channelId === null && channelId !== "") {
        dashboard.onJoin(channelId);
    }

}

init();
