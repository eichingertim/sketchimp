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

class NewSketchEvent extends Event {
    constructor(data) {
        super(EventKeys.NEW_SKETCH_RECEIVED, data);
    }
}

class ActiveUserEvent extends Event {
    constructor(data) {
        super(EventKeys.ACTIVE_USER_RECEIVED, data);
    }
}

class TemplateReceivedEvent extends Event {
    constructor(data) {
        super(EventKeys.TEMPLATE_RECEIVED, data);
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

    join(channelId, userId) {
        let instance = this;
        this.socket.emit(SocketKeys.SUBSCRIBE, {channelId: channelId, userId: userId});

        this.socket.on(SocketKeys.DELETE_CHANNEL, () => window.location.reload());
        this.socket.on(SocketKeys.ADMIN_SETTINGS, () => window.location.reload());
        this.socket.on(SocketKeys.TEMPLATE, (data) => instance.notifyAll(new TemplateReceivedEvent(data)));
        this.socket.on(SocketKeys.NEW_SKETCH, (data) => instance.notifyAll(new NewSketchEvent(data)));
        this.socket.on(SocketKeys.LINE_DRAWN, (data) => instance.notifyAll(new LineDrawnEvent(data)));
        this.socket.on(SocketKeys.LINE_UNDO, (data) => instance.notifyAll(new LineUndoEvent(data)));
        this.socket.on(SocketKeys.CLEAR_CANVAS, (data) => instance.notifyAll(new ClearCanvasEvent(data)));
        this.socket.on(SocketKeys.ACTIVE_USER, (data) => {
            instance.notifyAll(new ActiveUserEvent(data));
        });
    }

    emitLeaveChannel(channelId, userId) {
        this.socket.emit(SocketKeys.UNSUBSCRIBE, {channelId: channelId, userId: userId});
    }

    emitAdminSettingsChanged(channelId) {
        this.socket.emit(SocketKeys.ADMIN_SETTINGS, {channelId: channelId});
    }

    emitTemplate(channelId, templateUrl) {
        this.socket.emit(SocketKeys.TEMPLATE, {channelId: channelId, templateUrl: templateUrl});
    }

    emitClearCanvas(data) {
        this.socket.emit(SocketKeys.CLEAR_CANVAS, data);
    }

    emitNewSketch(channelId, sketchId, sketchName, sketchMultiLayer) {
        this.socket.emit(SocketKeys.NEW_SKETCH, {
            channelId: channelId,
            sketchId: sketchId,
            sketchName: sketchName,
            sketchMultiLayer: sketchMultiLayer,
        });
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