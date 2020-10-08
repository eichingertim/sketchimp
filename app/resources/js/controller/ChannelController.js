import {Config, EventKeys, SocketKeys} from "../utils/Config.js";
import ChannelModel from "../models/ChannelModel.js";
import SketchModel from "../models/SketchModel.js";

function createBodyMember(userList) {
    const userObj = {};
    userList.forEach(user => userObj[user.userId] = user.role);
    return {roleList: userObj};
}

class ChannelController {

    static fetchChannelData(url) {
        if (event) {
            event.preventDefault();
        }
        return new Promise(function (resolve, reject) {
            let xhr = new XMLHttpRequest(),
                xhrSketch = new XMLHttpRequest();
            xhr.open(Config.HTTP.GET, url, true);
            xhr.onload = function () {
                let data = JSON.parse(this.response).data, channel;
                if (data) {
                    channel = new ChannelModel(data.id, data.name, data.creator.id, data.creator.username, data.creation, data.members, data.icon);
                }
                xhrSketch.open(Config.HTTP.GET, Config.API_URLS.CURRENT_SKETCH + data.id, true);
                xhrSketch.onload = function () {
                    let sketchData = JSON.parse(this.response).data;
                    channel.currentSketch = new SketchModel(sketchData.id, sketchData.name, sketchData.multilayer);
                    resolve(channel);
                };
                xhrSketch.send();
            };
            xhr.send();
        });

    }

    static uploadChannelIcon(form) {
        return new Promise(
            function (resolve, reject) {
                let xhr = new XMLHttpRequest(),
                    formData = new FormData(form);
                xhr.open(Config.HTTP.POST, form.action, true);
                xhr.onload = function() {
                    resolve();
                };
                xhr.send(formData);
            }
        );
    }

    static createChannel(data) {
        return new Promise(
            function (resolve, reject) {
                let xhr = new XMLHttpRequest(),
                    xhrSketch = new XMLHttpRequest(),
                    channelName = data.name,
                    sketchName = data.sketchName,
                    channelReqBody = { channelName: channelName },
                    isMultiLayer = data.isMultiLayer;

                xhr.open(Config.HTTP.POST, Config.API_URLS.NEW_CHANNEL, true);
                xhr.withCredentials = true;
                xhr.setRequestHeader("Content-Type", Config.CONTENT_TYPE_JSON);

                xhr.onload = function () {
                    let channelData = JSON.parse(this.response).data,
                        channel;

                    if (channelData) {
                        channel = new ChannelModel(channelData.id, channelData.name, channelData.creator.id, 
                            channelData.creator.username, channelData.creation, channelData.members, channelData.icon);
                    }

                    xhrSketch.open(Config.HTTP.POST, Config.API_URLS.NEW_SKETCH + channelData.id, true);
                    xhrSketch.withCredentials = true;
                    xhrSketch.setRequestHeader("Content-Type", Config.CONTENT_TYPE_URL_ENCODED);
                    xhrSketch.onload = function () {
                        let sketchData = JSON.parse(this.response).data;
                        if (sketchData) {
                            channel.currentSketch = new SketchModel(sketchData.id, sketchData.name, sketchData.multilayer);
                            resolve(channel);
                        }
                    };

                    if (sketchName === "" || sketchName === " ") {
                        sketchName = Config.DEFAULT_SKETCH_NAME;
                    }

                    xhrSketch.send("name=" + sketchName.split(" ").join("+") + "&multilayer=" + isMultiLayer);
                };
                xhr.send(JSON.stringify(channelReqBody));
            }
        );

    }

    static joinNewChannel(channelId) {
        return new Promise(
            function (resolve, reject) {
                let xhr = new XMLHttpRequest();
                xhr.open(Config.HTTP.POST, Config.API_URLS.JOIN_CHANNEL + channelId, true);
                xhr.withCredentials = true;
                xhr.onload = function () {
                    resolve();
                };
                xhr.send();
            },
        );

    }

    static leaveChannel(channelId) {
        return new Promise(
            function (resolve, reject) {
                let xhr = new XMLHttpRequest();
                xhr.open(Config.HTTP.POST, Config.API_URLS.LEAVE_CHANNEL + channelId, true);
                xhr.withCredentials = true;
                xhr.onload = function () {
                    resolve();
                };
                xhr.send();
            },
        );
    }

    static saveAdminSettings(settings) {
        return new Promise(
            function (resolve, reject) {
                let xhrChannel = new XMLHttpRequest(),
                    bodyChannel = {channelName: settings.channelName},
                    xhrMember = new XMLHttpRequest(),
                    bodyMember = createBodyMember(settings.userList);
                xhrChannel.open(Config.HTTP.PATCH, Config.API_URLS.UPDATE_CHANNEL + settings.channelId, true);
                xhrChannel.withCredentials = true;
                xhrChannel.setRequestHeader("Content-Type", Config.CONTENT_TYPE_JSON);
                xhrChannel.onload = function () {
                    xhrMember.open(Config.HTTP.PATCH, Config.API_URLS.UPDATE_ROLES + settings.channelId, true);
                    xhrMember.withCredentials = true;
                    xhrMember.setRequestHeader("Content-Type", Config.CONTENT_TYPE_JSON);
                    xhrMember.onload = function () {
                        resolve();
                    };
                    xhrMember.send(JSON.stringify(bodyMember));

                };
                xhrChannel.send(JSON.stringify(bodyChannel));
            },
        );
    }

    static kickMember(memberId, channelId) {
        return new Promise(
            function (resolve, reject) {
                let xhr = new XMLHttpRequest(),
                    body = {userId: memberId};
                xhr.open(Config.HTTP.POST, Config.API_URLS.KICK_MEMBER + channelId, true);
                xhr.withCredentials = true;
                xhr.setRequestHeader("Content-Type", Config.CONTENT_TYPE_JSON);
                xhr.onload = function () {
                    resolve();
                };
                xhr.send(JSON.stringify(body));
            }
        );
    }

    static deleteChannel(socket, channelId) {
        return new Promise(
            function (resolve, reject) {
                let xhr = new XMLHttpRequest();
                xhr.open(Config.HTTP.DELETE, Config.API_URLS.DELETE_CHANNEL + channelId, true);
                xhr.withCredentials = true;
                xhr.onload = function () {
                    socket.emit(SocketKeys.DELETE_CHANNEL, {channelId: channelId});
                    resolve();
                };
                xhr.send();
            },
        );
    }
}

export default ChannelController;