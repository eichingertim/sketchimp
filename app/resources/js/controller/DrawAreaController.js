import {Event, Observable} from "../utils/Observable.js";
import {Config, EventKeys, SocketKeys} from "../utils/Config.js";

class LineDrawnEvent extends Event {
    constructor(data) {
        super(EventKeys.LINE_DRAWN_RECEIVED, data);
    }
}

class LineUndoEvent extends Event {
    constructor(data) {
        super(EventKeys.LINE_UNDO_RECEIVED, data);
    }
}

class ClearCanvasEvent extends Event {
    constructor(sketchData) {
        super(EventKeys.CLEAR_RECEIVED, {sketchData: sketchData});
    }
}

function createUUID() {
    let dt = new Date().getTime();
    return Config.UUID_PATTERN.replace(/[xy]/g, function (c) {
        let r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

class DrawAreaController extends Observable {

    constructor(socket, userId) {
        super();
        this.userId = userId;
        this.channelId = null;
        this.socket = socket;
    }

    join(channelId) {
        let instance = this;
        this.channelId = channelId;
        this.socket.emit(SocketKeys.SUBSCRIBE, this.channelId);

        this.socket.on(SocketKeys.LINE_DRAWN, function (data) {
            instance.notifyAll(new LineDrawnEvent(data));
        });

        this.socket.on(SocketKeys.LINE_UNDO, function (data) {
            instance.notifyAll(new LineUndoEvent(data));
        });

        this.socket.on(SocketKeys.CLEAR_CANVAS, function (data) {
            if (data !== null) {
                instance.notifyAll(new ClearCanvasEvent(data.sketchData));
            } else {
                instance.notifyAll(new ClearCanvasEvent(null));
            }
        });

    }

    emitClearCanvas(sketchData) {
        if (this.channelId !== null) {
            this.socket.emit(SocketKeys.CLEAR_CANVAS, {channelId: this.channelId, sketchData: sketchData});
        }
    }

    emitLine(data) {
        if (this.channelId !== null) {
            this.socket.emit(SocketKeys.LINE_DRAWN, {
                channelId: this.channelId,
                userId: this.userId,
                lineId: createUUID(),
                line: [data.mouse.pos, data.mouse.posPrev],
                color: data.color,
                penRubber: data.penRubber,
                size: data.size,
            });
        }

    }

    undoLine() {
        if (this.channelId !== null) {
            this.socket.emit(SocketKeys.LINE_UNDO, {
                channelId: this.channelId,
                userId: this.userId,
            });
        }
    }

}

export default DrawAreaController;