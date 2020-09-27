import {Config, EventKeys, SocketKeys} from "../utils/Config.js";
import ChannelModel from "../models/ChannelModel.js";
import SketchModel from "../models/SketchModel.js";

class ChannelController {

    static fetchChannelData(url) {
        if (event) {
            event.preventDefault();
        }

        return new Promise(function (resolve, reject) {
            let xhr = new XMLHttpRequest(),
                xhrSketch = new XMLHttpRequest();
            xhr.open(Config.HTTP_GET, url, true);
            xhr.onload = function() {
                let data = JSON.parse(this.response).data, channel;
                if (data) {
                    channel = new ChannelModel(data.id, data.name, data.creation, data.creator.id, data.creator.name, data.members);
                }
                xhrSketch.open(Config.HTTP_GET, Config.API_URL_CURRENT_SKETCH + data.id, true);
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

    static createChannel(data) {
        return new Promise(
            function (resolve, reject) {
                let xhr = new XMLHttpRequest(),
                    xhrSketch = new XMLHttpRequest(),
                    channelName = data.name,
                    sketchName = data.sketchName,
                    isMultiLayer = data.isMultiLayer;

                xhr.open(Config.HTTP_POST, Config.API_URL_NEW_CHANNEL + channelName, true);
                xhr.withCredentials = true;
                xhr.onload = function() {
                    let channelData = JSON.parse(this.response).data,
                        channel;

                    if (channelData) {
                        channel = new ChannelModel(channelData.id, channelData.name, channelData.creation, channelData.creator.id, channelData.creator.name, channelData.members);
                    }

                    xhrSketch.open(Config.HTTP_POST, Config.API_URL_NEW_SKETCH + channelData.id, true);
                    xhrSketch.withCredentials = true;
                    xhrSketch.setRequestHeader("Content-Type", Config.CONTENT_TYPE_URL_ENCODED);
                    xhrSketch.onload = function() {
                        let sketchData = JSON.parse(this.response).data;
                        if (sketchData) {
                            channel.currentSketch = new SketchModel(sketchData.id, sketchData.name, sketchData.multilayer);
                            resolve(channel);
                        }
                    };

                    if (sketchName === "" || sketchName === " ") {
                        sketchName = Config.DEFAULT_SKETCH_NAME;
                    }

                    xhrSketch.send("name=" + sketchName.split(" ").join("+") + "&multilayer="+isMultiLayer);
                };
                xhr.send();
            }
        );

    }

    static joinNewChannel(channelId) {
        return new Promise(
            function (resolve, reject) {
                let xhr = new XMLHttpRequest();
                xhr.open(Config.HTTP_POST, Config.API_URL_JOIN_CHANNEL + channelId, true);
                xhr.withCredentials = true;
                xhr.onload = function() {
                    resolve();
                };
                xhr.send();
            }
        );

    }

    static leaveChannel(channelId) {
        return new Promise(
            function (resolve, reject) {
                let xhr = new XMLHttpRequest();
                xhr.open(Config.HTTP_POST, Config.API_URL_LEAVE_CHANNEL + channelId, true);
                xhr.withCredentials = true;
                xhr.onload = function() {
                    resolve();
                };
                xhr.send();
            }
        );

    }
}

export default ChannelController;