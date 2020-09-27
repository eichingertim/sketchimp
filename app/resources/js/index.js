/* eslint-env browser */
import ChannelModel from "./models/ChannelModel.js";
import Dashboard from "./Dashboard.js";

let socket = io(),
    dashboard;

function init() {
    let id = document.cookie.split("="),
        filteredUserId = (decodeURIComponent(id[1]).match("\".*\"")[0]).toString().match("[^\"]+")[0],
        channelId = document.querySelector(".info-channel-id").textContent;

    console.log(channelId);
    dashboard = new Dashboard(socket, filteredUserId);
    if (dashboard.channel === null && channelId !== "") {
        let channel = new ChannelModel();
        channel.channelId = channelId;
        dashboard.onJoin(channel);
    }

}

init();
