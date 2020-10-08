import {Config, EventKeys, SocketKeys} from "../utils/Config.js";
import Helper from "../utils/Helper.js";
import ChannelModel from "../models/ChannelModel.js";
import SketchModel from "../models/SketchModel.js";

function createBodyMember(userList) {
    const userObj = {};
    userList.forEach(user => userObj[user.userId] = user.role);
    return {roleList: userObj};
}

function handleResponseSketchData(resolve, reject, channel, jsonString) {
    try {
        let response = JSON.parse(jsonString);
        if (response.success !== Config.SUCCESS_ERROR) {
            let sketchData = response.data;
            channel.currentSketch = new SketchModel(sketchData.id, sketchData.name,
                sketchData.multilayer);
            resolve(channel);
        } else {
            reject(response.message);
        }
    } catch (error) {
        reject(error);
    }
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
                try {
                    let channelResponse = JSON.parse(this.response);
                    if (channelResponse.success !== Config.SUCCESS_ERROR) {
                        let data = JSON.parse(this.response).data, channel;
                        if (data) {
                            channel = new ChannelModel(data.id, data.name, data.creator.id, data.creator.username,
                                data.creation, data.members, data.icon);
                        }
                        xhrSketch.open(Config.HTTP.GET, Config.API_URLS.CURRENT_SKETCH + data.id, true);
                        xhrSketch.onload = function () {
                            handleResponseSketchData(resolve, reject, channel, this.response);
                        };
                        xhrSketch.send();
                    } else {
                        reject(channelResponse.message);
                    }
                } catch (error) {
                    reject(error);
                }
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
                xhr.onload = function () {
                    Helper.handleSimpleResponse(resolve, reject, this.response);
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
                    channelReqBody = {channelName: channelName},
                    isMultiLayer = data.isMultiLayer;

                xhr.open(Config.HTTP.POST, Config.API_URLS.NEW_CHANNEL, true);
                xhr.withCredentials = true;
                xhr.setRequestHeader("Content-Type", Config.CONTENT_TYPE_JSON);

                xhr.onload = function () {

                    try {
                        let channelResponse = JSON.parse(this.response);
                        if (channelResponse.success !== Config.SUCCESS_ERROR) {
                            let channelData = channelResponse.data,
                                channel;

                            if (channelData) {
                                channel = new ChannelModel(channelData.id, channelData.name, channelData.creator.id,
                                    channelData.creator.username, channelData.creation, channelData.members,
                                    channelData.icon);
                            }

                            xhrSketch.open(Config.HTTP.POST, Config.API_URLS.NEW_SKETCH + channelData.id, true);
                            xhrSketch.withCredentials = true;
                            xhrSketch.setRequestHeader("Content-Type", Config.CONTENT_TYPE_URL_ENCODED);
                            xhrSketch.onload = function () {
                                handleResponseSketchData(resolve, reject, channel, this.response);
                            };

                            if (sketchName === "" || sketchName === " ") {
                                sketchName = Config.DEFAULT_SKETCH_NAME;
                            }

                            xhrSketch.send("name=" + sketchName.split(" ").join("+") + "&multilayer=" + isMultiLayer);

                        } else {
                            reject(channelResponse.message);
                        }
                    } catch (error) {
                        reject(error);
                    }

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
                    Helper.handleSimpleResponse(resolve, reject, this.response);
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
                    Helper.handleSimpleResponse(resolve, reject, this.response);
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
                    try {
                        let responseChannel = JSON.parse(this.response);
                        if (responseChannel.success !== Config.SUCCESS_ERROR) {
                            xhrMember.open(Config.HTTP.PATCH, Config.API_URLS.UPDATE_ROLES + settings.channelId, true);
                            xhrMember.withCredentials = true;
                            xhrMember.setRequestHeader("Content-Type", Config.CONTENT_TYPE_JSON);
                            xhrMember.onload = function () {
                                Helper.handleSimpleResponse(resolve, reject, this.response);
                            };
                            xhrMember.send(JSON.stringify(bodyMember));
                        } else {
                            reject(responseChannel.message)
                        }
                    } catch (error) {
                        reject(error);
                    }
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
                    Helper.handleSimpleResponse(resolve, reject, this.response);
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
                    Helper.handleSimpleResponse(resolve, reject, this.response);
                };
                xhr.send();
            },
        );
    }
}

export default ChannelController;