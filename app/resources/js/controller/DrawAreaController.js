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
    constructor(data) {
        super(EventKeys.CLEAR_RECEIVED, data);
    }
}

function getMarkedAsAdminLine(isMultiLayer, userRole) {
    if (isMultiLayer) {
        return userRole === Config.CHANNEL_ROLE_ADMIN;
    }
    return true;
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

    constructor(socket) {
        super();
        this.socket = socket;
    }

    join(channelId) {
        let instance = this;
        this.socket.emit(SocketKeys.SUBSCRIBE, channelId);

        this.socket.on(SocketKeys.LINE_DRAWN, function (data) {
            instance.notifyAll(new LineDrawnEvent(data));
        });

        this.socket.on(SocketKeys.LINE_UNDO, function (data) {
            instance.notifyAll(new LineUndoEvent(data));
        });

        this.socket.on(SocketKeys.CLEAR_CANVAS, function (data) {
            instance.notifyAll(new ClearCanvasEvent(data));
        });

    }

    emitClearCanvas(data) {
        this.socket.emit(SocketKeys.CLEAR_CANVAS, data);
    }

    emitLine(data) {
        if (data.channelId !== null && data.currentChannelRole !== Config.CHANNEL_ROLE_VIEWER) {
            this.socket.emit(SocketKeys.LINE_DRAWN, {
                channelId: data.channelId,
                userId: data.userId,
                lineId: createUUID(),
                line: [data.lineData.mouse.pos, data.lineData.mouse.posPrev],
                color: data.lineData.color,
                penRubber: data.lineData.penRubber,
                size: data.lineData.size,
                adminLine: getMarkedAsAdminLine(data.multilayer, data.currentChannelRole),
            });
        }

    }

    emitUndoLine(channelId, userId) {
        if (channelId !== null) {
            this.socket.emit(SocketKeys.LINE_UNDO, {
                channelId: channelId,
                userId: userId,
            });
        }
    }

}

export default DrawAreaController;