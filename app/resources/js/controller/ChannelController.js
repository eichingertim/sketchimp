import {Config, SocketKeys} from "../utils/Config.js";
import Helper from "../utils/Helper.js";
import ChannelModel from "../models/ChannelModel.js";
import SketchModel from "../models/SketchModel.js";

/**
 * Creates a Object with key=userId and value=userRole
 * @param userList list of channel members
 * @returns {{roleList: {}}} Object of users/members
 */
function createBodyMember(userList) {
    const userObj = {};
    userList.forEach(user => userObj[user.userId] = user.role);
    return {roleList: userObj};
}

/**
 * Handles the response of a XMLHttpRequest for sketches
 * @param resolve gets called, when process success
 * @param reject gets called, when process failes
 * @param channel includes ChanelModel of before received channel
 * @param jsonString response as jsonString
 */
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

/**
 * Class with static Methods to handle AJAX and therefore all XMLHttpRequests belonging to channels
 */
class ChannelController {

    /**
     * fetches the channel-data and its current sketch from {@param url}
     * and converts it to ChannelModel and SketchModel
     * @param url GET Channel-Url with channelId
     * @returns {Promise<>} wait for request to finish
     */
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
                    let channelResponse = JSON.parse(xhr.response);
                    if (channelResponse.success !== Config.SUCCESS_ERROR) {
                        let data = JSON.parse(xhr.response).data, channel;
                        if (data) {
                            channel = new ChannelModel(data.id, data.name, data.creator.id, data.creator.username,
                                data.creation, data.members, data.icon);
                        }
                        xhrSketch.open(Config.HTTP.GET, Config.API_URLS.CURRENT_SKETCH + data.id, true);
                        xhrSketch.onload = function () {
                            handleResponseSketchData(resolve, reject, channel, xhrSketch.response);
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

    /**
     * Executes the POST requests to upload a new channel-icon from a html-form
     * @param form html-form
     * @returns {Promise<>} wait for request to finish
     */
    static uploadChannelIcon(form) {
        return new Promise(
            function (resolve, reject) {
                let xhr = new XMLHttpRequest(),
                    formData = new FormData(form);
                xhr.open(Config.HTTP.POST, form.action, true);
                xhr.onload = function () {
                    Helper.handleSimpleResponse(resolve, reject, xhr.response);
                };
                xhr.send(formData);
            }
        );
    }

    /**
     * Executes the POST request for a new channel and a new sketch and when it successes it
     * returns a new ChannelModel with its current sketch
     * @param data includes data for new channel and sketch (channelName, sketchName, multilayer)
     * @returns {Promise<>} wait for request to finish
     */
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
                        let channelResponse = JSON.parse(xhr.response);
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
                                handleResponseSketchData(resolve, reject, channel, xhrSketch.response);
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

    /**
     * Executes POST request to leave a channel
     * @param channelId id of the channel to be left
     * @returns {Promise<>} wait for request to finish
     */
    static leaveChannel(channelId) {
        return new Promise(
            function (resolve, reject) {
                let xhr = new XMLHttpRequest();
                xhr.open(Config.HTTP.POST, Config.API_URLS.LEAVE_CHANNEL + channelId, true);
                xhr.withCredentials = true;
                xhr.onload = function () {
                    Helper.handleSimpleResponse(resolve, reject, xhr.response);
                };
                xhr.send();
            }
        );
    }

    /**
     * Executes PATH request to update channel settings, especially the channelName and roles of members.
     * @param settings admin set settings
     * @returns {Promise<>} wait for request to finish
     */
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
                        let responseChannel = JSON.parse(xhrChannel.response);
                        if (responseChannel.success !== Config.SUCCESS_ERROR) {
                            xhrMember.open(Config.HTTP.PATCH, Config.API_URLS.UPDATE_ROLES + settings.channelId, true);
                            xhrMember.withCredentials = true;
                            xhrMember.setRequestHeader("Content-Type", Config.CONTENT_TYPE_JSON);
                            xhrMember.onload = function () {
                                Helper.handleSimpleResponse(resolve, reject, xhrMember.response);
                            };
                            xhrMember.send(JSON.stringify(bodyMember));
                        } else {
                            reject(responseChannel.message);
                        }
                    } catch (error) {
                        reject(error);
                    }
                };
                xhrChannel.send(JSON.stringify(bodyChannel));
            }
        );
    }

    /**
     * Executes POST-Request to kick a member from a channel
     * @param memberId id of the member to be kicked
     * @param channelId id of the channel where the member should be kicked from
     * @returns {Promise<>} wait for request to finish
     */
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

    /**
     * Executes DELETE Request to remove a channel
     * @param socket current socket client to emit this delete action instantly
     * @param channelId id of channel to be removed
     * @param userId current user's id
     * @returns {Promise<>} wait for request to finish
     */
    static deleteChannel(socket, channelId, userId) {
        return new Promise(
            function (resolve, reject) {
                let xhr = new XMLHttpRequest();
                xhr.open(Config.HTTP.DELETE, Config.API_URLS.DELETE_CHANNEL + channelId, true);
                xhr.withCredentials = true;
                xhr.onload = function () {
                    socket.emit(SocketKeys.DELETE_CHANNEL, {channelId: channelId, userId: userId});
                    Helper.handleResponseWithCallbackParam(resolve, reject, this.response);
                };
                xhr.send();
            }
        );
    }
}

export default ChannelController;