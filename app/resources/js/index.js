import ChannelModel from "./models/ChannelModel.js";
import Dashboard from "./Dashboard.js";
import Helper from "./utils/Helper.js";

// eslint-disable-next-line no-undef
let socket = io(),
    dashboard;

function init() {
    let cookieArray = document.cookie.split("; "),
        cookie = cookieArray[Helper.getCookiePosition(cookieArray)].split("=")[1],
        decoded = decodeURIComponent(cookie).match("\".*\""),
        filteredUserId = (decoded[0]).toString().match("[^\"]+")[0],
        channelId = document.querySelector(".info-channel-id").textContent;

    dashboard = new Dashboard(socket, filteredUserId);
    if (dashboard.channel === null && channelId !== "") {
        let channel = new ChannelModel();
        channel.channelId = channelId;
        dashboard.onJoin(channel);
    }
}

init();
