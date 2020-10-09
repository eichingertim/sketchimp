import {Event, Observable} from "../utils/Observable.js";
import {Config, EventKeys, SocketKeys} from "../utils/Config.js";
import Helper from "../utils/Helper.js";

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

class DeleteChannelEvent extends Event {
    constructor(data) {
        super(EventKeys.DELETE_CHANNEL, data);
    }
}

/**
 * Checks if a line should emitted as an admin line
 * @param isMultiLayer bool -> if current sketch is multilayer
 * @param userRole -> current users role
 * @returns {boolean} if line is an admin line
 */
function getMarkedAsAdminLine(isMultiLayer, userRole) {
    if (isMultiLayer) {
        return userRole === Config.CHANNEL_ROLE_ADMIN;
    }
    return true;
}

/**
 * This class is responsible for all socket-actions (Emitting and Receiving)
 */
class DrawAreaController extends Observable {

    constructor(socket) {
        super();
        this.socket = socket;
    }

    /**
     * Is called when the current user joins a channel and emits than a subscription to socket on this channel.
     * Registers listeners on all socket events.
     * @param channelId id of channel where the user wants to join
     * @param userId current user id
     */
    join(channelId, userId) {
        let instance = this;
        this.socket.emit(SocketKeys.SUBSCRIBE, {channelId: channelId, userId: userId});

        this.socket.on(SocketKeys.DELETE_CHANNEL, (data) => instance.notifyAll(new DeleteChannelEvent(data)));
        this.socket.on(SocketKeys.ADMIN_SETTINGS, () => window.location.reload());
        this.socket.on(SocketKeys.TEMPLATE, (data) => instance.notifyAll(new TemplateReceivedEvent(data)));
        this.socket.on(SocketKeys.NEW_SKETCH, (data) => instance.notifyAll(new NewSketchEvent(data)));
        this.socket.on(SocketKeys.LINE_DRAWN, (data) => instance.notifyAll(new LineDrawnEvent(data)));
        this.socket.on(SocketKeys.LINE_UNDO, (data) => instance.notifyAll(new LineUndoEvent(data)));
        this.socket.on(SocketKeys.CLEAR_CANVAS, (data) => instance.notifyAll(new ClearCanvasEvent(data)));
        this.socket.on(SocketKeys.ACTIVE_USER, (data) => {
            instance.notifyAll(new ActiveUserEvent(data));
        });
        this.socket.on(SocketKeys.ERROR, () => {
            // socket error occured
        });
    }

    /**
     * Emits to socket that the current user leaves a channel
     * @param channelId current channels id
     * @param userId current user's userId
     */
    emitLeaveChannel(channelId, userId) {
        this.socket.emit(SocketKeys.UNSUBSCRIBE, {channelId: channelId, userId: userId});
    }

    /**
     * Emits to socket that channel settings have changed
     * @param channelId current channels id
     */
    emitAdminSettingsChanged(channelId) {
        this.socket.emit(SocketKeys.ADMIN_SETTINGS, {channelId: channelId});
    }

    /**
     * Emits to socket that the template for the current sketch changed
     * @param channelId current channels id
     * @param templateUrl url of the selected template
     */
    emitTemplate(channelId, templateUrl) {
        this.socket.emit(SocketKeys.TEMPLATE, {channelId: channelId, templateUrl: templateUrl});
    }

    /**
     * Emits to socket that the canvas should be cleared
     * @param data necessary data for a canvas clear
     */
    emitClearCanvas(data) {
        this.socket.emit(SocketKeys.CLEAR_CANVAS, data);
    }

    /**
     * Emits to socket that a new sketch was created
     * @param channelId current channels id
     * @param sketchId new sketch id
     * @param sketchName new sketch name
     * @param sketchMultiLayer new sketch is multilayer
     */
    emitNewSketch(channelId, sketchId, sketchName, sketchMultiLayer) {
        this.socket.emit(SocketKeys.NEW_SKETCH, {
            channelId: channelId,
            sketchId: sketchId,
            sketchName: sketchName,
            sketchMultiLayer: sketchMultiLayer,
        });
    }

    /**
     * Emits to socket that a new line/eraser-line should be drawn
     * @param data necessary data for a line to emitted
     */
    emitLine(data) {
        if (data.channelId !== null && data.currentChannelRole !== Config.CHANNEL_ROLE_VIEWER) {
            this.socket.emit(SocketKeys.LINE_DRAWN, {
                channelId: data.channelId,
                userId: data.userId,
                lineId: Helper.createUUID(),
                line: [data.lineData.mouse.pos, data.lineData.mouse.posPrev],
                color: data.lineData.color,
                penRubber: data.lineData.penRubber,
                size: data.lineData.size,
                adminLine: getMarkedAsAdminLine(data.multilayer, data.currentChannelRole),
            });
        }

    }

    /**
     * Emits to socket that a line should be undo
     * @param channelId current channels id
     * @param userId current user's id
     */
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