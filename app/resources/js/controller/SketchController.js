import {Config, EventKeys, SocketKeys} from "../utils/Config.js";
import Helper from "../utils/Helper.js";

class SketchController {

    static saveSketch(socket, channelId) {
        return new Promise(
            function (resolve, reject) {
                let socketId = socket.id;
                socket.emit(SocketKeys.CHANNEL_LINE_HISTORY, {channelId: channelId, socketId: socketId});
                socket.on(SocketKeys.CHANNEL_LINE_HISTORY, function (data) {
                    let xhr = new XMLHttpRequest(),
                        url = Config.API_URLS.SKETCH_SAVE + channelId;
                    xhr.open(Config.HTTP.POST, url, true);
                    xhr.setRequestHeader("Content-Type", Config.CONTENT_TYPE_JSON);
                    xhr.onload = function () {
                        Helper.handleSimpleResponse(resolve, reject, this.response);
                    };
                    xhr.send(JSON.stringify(data.channel));
                });
            }
        );
    }

    static finalizeSketch(channelId, imageBase64, newSketchName, isNewSketchMultiLayer) {
        return new Promise(
            function (resolve, reject) {
                let xhr = new XMLHttpRequest(),
                    sketchBody = {
                        name: newSketchName,
                        multilayer: isNewSketchMultiLayer,
                        image: imageBase64,
                    },
                    url = Config.API_URLS.FINALIZE_SKETCH + channelId;
                xhr.open(Config.HTTP.POST, url, true);
                xhr.setRequestHeader("Content-Type", Config.CONTENT_TYPE_JSON);
                xhr.onload = function () {
                    Helper.handleResponseWithCallbackParam(resolve, reject, this.response);
                };
                xhr.send(JSON.stringify(sketchBody));
            }
        );

    }

    static publishSketch(sketchId) {
        return new Promise(
            function (resolve, reject) {
                let xhr = new XMLHttpRequest();
                xhr.open(Config.HTTP.POST, Config.API_URLS.SKETCH_PUBLISH + sketchId, true);
                xhr.onload = function () {
                    Helper.handleSimpleResponse(resolve, reject, this.response);
                };
                xhr.send();
            }
        );
    }

    static loadHistory(channelId) {
        return new Promise(
          function (resolve, reject) {
              let xhr = new XMLHttpRequest();
              xhr.open(Config.HTTP.GET, Config.API_URLS.FINALIZED_SKETCHES + channelId, true);
              xhr.onload = function () {
                  Helper.handleResponseWithCallbackParam(resolve, reject, this.response);
              };
              xhr.send();
          }
        );
    }

    static exportSketch(uri, name) {
        let link = document.createElement("a");
        link.download = name;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

}

export default SketchController;