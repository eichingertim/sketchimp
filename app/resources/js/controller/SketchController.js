import {Config, EventKeys, SocketKeys} from "../utils/Config.js";

class SketchController {

    static saveSketch(socket, channelId) {
        return new Promise(
            function (resolve, reject) {
                let socketId = socket.id;
                socket.emit(SocketKeys.CHANNEL_LINE_HISTORY, {channelId: channelId, socketId: socketId});
                socket.on(SocketKeys.CHANNEL_LINE_HISTORY, function (data) {
                    let xhr = new XMLHttpRequest(),
                        url = Config.API_URL_SKETCH_SAVE + channelId;
                    xhr.open(Config.HTTP_POST, url, true);
                    xhr.setRequestHeader("Content-Type", Config.CONTENT_TYPE_JSON);
                    xhr.onload = function () {
                        resolve();
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
                    url = Config.API_URL_FINALIZE_SKETCH + channelId;
                xhr.open(Config.HTTP_POST, url, true);
                xhr.setRequestHeader("Content-Type", Config.CONTENT_TYPE_JSON);
                xhr.onload = function () {
                    let newSketchData = JSON.parse(this.response).data;
                    resolve(newSketchData);
                };

                xhr.send(JSON.stringify(sketchBody));
            }
        );

    }

    static publishSketch(sketchId) {
        return new Promise(
            function (resolve, reject) {
                let xhr = new XMLHttpRequest();
                xhr.open(Config.HTTP_POST, Config.API_URL_SKETCH_PUBLISH + sketchId, true);
                xhr.onload = function () {
                    resolve();
                };
                xhr.send();
            }
        );
    }

    static loadHistory(channelId) {
        return new Promise(
          function (resolve, reject) {
              let xhr = new XMLHttpRequest();
              xhr.open(Config.HTTP_GET, Config.API_URL_FINALIZED_SKETCHES + channelId, true);
              xhr.onload = function () {
                  let sketches = JSON.parse(this.response).data;
                  resolve(sketches);
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