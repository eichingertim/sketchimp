import {Config, SocketKeys} from "../utils/Config.js";
import Helper from "../utils/Helper.js";

/**
 * Class with static Methods to handle AJAX and therefore all XMLHttpRequests belonging to sketches
 */
class SketchController {

    /**
     * Retrieves current sketches lineHistory from server and
     * executes the POST requests to save this lines to the database
     * @param socket current socket client
     * @param channelId current channels id
     * @returns {Promise<>} wait for request to finish
     */
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
                        Helper.handleSimpleResponse(resolve, reject, xhr.response);
                    };
                    xhr.send(JSON.stringify(data.channel));
                });
            }
        );
    }

    /**
     * Executes the POST request to archive/finalize a sketch and receives a new sketch
     * @param channelId current channel's id
     * @param imageBase64 current sketch encoded as an base64 png
     * @param newSketchName name of the new sketch that is later created
     * @param isNewSketchMultiLayer bool if the new sketch should have multiple layers
     * @returns {Promise<>} wait for request to finish
     */
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
                    Helper.handleResponseWithCallbackParam(resolve, reject, xhr.response);
                };
                xhr.send(JSON.stringify(sketchBody));
            }
        );

    }

    /**
     * Executes the POST request to publish a sketch
     * @param sketchId id of sketch that should be published
     * @returns {Promise<>} wait for request to finish
     */
    static publishSketch(sketchId) {
        return new Promise(
            function (resolve, reject) {
                let xhr = new XMLHttpRequest();
                xhr.open(Config.HTTP.POST, Config.API_URLS.SKETCH_PUBLISH + sketchId, true);
                xhr.onload = function () {
                    Helper.handleSimpleResponse(resolve, reject, xhr.response);
                };
                xhr.send();
            }
        );
    }

    /**
     * Executes the GET request to load the sketch history of a channel
     * @param channelId current channel's id
     * @returns {Promise<>} wait for request to finish
     */
    static loadHistory(channelId) {
        return new Promise(
          function (resolve, reject) {
              let xhr = new XMLHttpRequest();
              xhr.open(Config.HTTP.GET, Config.API_URLS.FINALIZED_SKETCHES + channelId, true);
              xhr.onload = function () {
                  Helper.handleResponseWithCallbackParam(resolve, reject, xhr.response);
              };
              xhr.send();
          }
        );
    }

    /**
     * executes process to download the generated png of a sketch
     * @param uri generated uri of a sketch
     * @param name of sketch
     */
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