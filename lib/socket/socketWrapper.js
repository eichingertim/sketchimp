/* eslint-disable no-console */
/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const socketIO = require("socket.io"),
    Constants = require("../config/Constants");

function updateCurrentChannel(socketWrapper, client, data) {
    Object.keys(socketWrapper.currentChannelPerUser).forEach((key) => {
        if (socketWrapper.currentChannelPerUser[key].userId === data.userId) {
            delete socketWrapper.currentChannelPerUser[key];
        }
    });
    socketWrapper.currentChannelPerUser[client.id] = {userId: data.userId, channelId: data.channelId};
}

function emitAllSavedLines(appServer, client, data) {
    for (let i in appServer.channels[data.channelId].users) {
        if (appServer.channels[data.channelId].users[i].lineHistory === undefined) {
            continue;
        }

        for (let j = 0; j < appServer.channels[data.channelId].users[i].lineHistory.length; j++) {
            let sendData = appServer.channels[data.channelId].users[i].lineHistory[j];
            client.emit(Constants.SOCKET_KEYS.LINE_DRAW, sendData);
        }
    }
}

function onClientSubscribed(appServer, socketWrapper, client, io, data) {

    if (data !== undefined) {
        console.log("joining room", data.channelId);
        client.join(data.channelId);

        updateCurrentChannel(socketWrapper, client, data);

        if (appServer.channels[data.channelId] !== undefined && appServer.channels[data.channelId].users !== undefined) {
            // eslint-disable-next-line guard-for-in

            emitAllSavedLines(appServer, client, data);

            appServer.channels[data.channelId].activeUsers[data.userId] = Constants.STATES.ACTIVE;

            let activeUsers = appServer.channels[data.channelId].activeUsers;

            client.emit(Constants.SOCKET_KEYS.TEMPLATE, {channelId: data.channelId, templateUrl: appServer.channels[data.channelId].templateUrl });
            io.in(data.channelId).emit(Constants.SOCKET_KEYS.ACTIVE_USERS, {channelId: data.channelId, activeUsers: activeUsers});
        }
    } else {
        console.log("Socket Error: data is undefined");
    }


}

function updateAndEmitActiveUsers(appServer, io, data, state) {
    let activeUsers = appServer.channels[data.channelId].activeUsers;
    activeUsers[data.userId] = state;
    appServer.channels[data.channelId].activeUsers = activeUsers;
    io.in(data.channelId).emit(Constants.SOCKET_KEYS.ACTIVE_USERS, {channelId: data.channelId, state: state, userId: data.userId});
}

function onClientDisconnect(appServer, socketWrapper, client, io) {
    console.log("a user connected");
    let data = socketWrapper.currentChannelPerUser[client.id];
    if (data !== null && data !== undefined) {
        updateAndEmitActiveUsers(appServer, io, data, Constants.STATES.OFFLINE);
    }
}

function onClientUnSubscribed(appServer, client, io, data) {
    console.log("leaving channel: " + data.channelId);
    client.leave(data.channelId);
    updateAndEmitActiveUsers(appServer, io, data, Constants.STATES.INACTIVE);
}

function onLineUndo(appServer, client, io, data) {
    let lineRemoved = [];
    for (let i = 0; i < Constants.CANVAS_UNDO_STEPS; i++) {
        let line = appServer.channels[data.channelId].users[data.userId].lineHistory.pop();
        if (line !== undefined) {
            lineRemoved.push(line.lineId);
        }
    }
    if (lineRemoved.length > 0) {
        io.in(data.channelId).emit(Constants.SOCKET_KEYS.LINE_UNDO, lineRemoved);
    }
}

function onLineDraw(appServer, client, io, data) {
    if (appServer.channels[data.channelId].users[data.userId] !== undefined) {
        appServer.channels[data.channelId].users[data.userId].lineHistory.push(data);
    } else {
        appServer.channels[data.channelId].users[data.userId] = {
            lineHistory: [],
        };
        appServer.channels[data.channelId].users[data.userId].lineHistory.push(data);
    }
    io.in(data.channelId).emit(Constants.SOCKET_KEYS.LINE_DRAW, data);
}

function onClearCanvas(appServer, client, io, data) {
    if (data.isNewSketch || data.userRole === Constants.ROLES.ADMIN) {
        appServer.channels[data.channelId].users = {};
    } else if (data.userRole === Constants.ROLES.COLLABORATOR) {
        if (appServer.channels[data.channelId].users !== undefined) {
            let tmp = appServer.channels[data.channelId].users[data.creatorId];
            appServer.channels[data.channelId].users = {};
            appServer.channels[data.channelId].users[data.creatorId] = tmp;
        }
    }
    let returnData = {
        isNewSketch: data.isNewSketch,
        multilayer: data.multilayer,
        userRole: data.userRole,
    };
    console.log(returnData);
    io.in(data.channelId).emit(Constants.SOCKET_KEYS.CLEAR_CANVAS, returnData);
}

function setupSocketIO(socketWrapper, appServer, io) {
    io.on(Constants.SOCKET_KEYS.CONNECTION, (client) => {
        console.log("a user connected");

        client.on(Constants.SOCKET_KEYS.DISCONNECT, () => onClientDisconnect(appServer, socketWrapper, client, io));

        client.on(Constants.SOCKET_KEYS.SUBSCRIBE, (data) => onClientSubscribed(appServer, socketWrapper, client, io, data));
        client.on(Constants.SOCKET_KEYS.UNSUBSCRIBE, (data) => onClientUnSubscribed(appServer, client, io, data));

        client.on(Constants.SOCKET_KEYS.LINE_HISTORY, (data) =>
            io.to(data.socketId).emit(Constants.SOCKET_KEYS.LINE_HISTORY, {channel: appServer.channels[data.channelId]}));

        client.on(Constants.SOCKET_KEYS.LINE_UNDO, (data) => onLineUndo(appServer, client, io, data));
        client.on(Constants.SOCKET_KEYS.LINE_DRAW, (data) => onLineDraw(appServer, client, io, data));
        client.on(Constants.SOCKET_KEYS.CLEAR_CANVAS, (data) => onClearCanvas(appServer, client, io, data));

        client.on(Constants.SOCKET_KEYS.ADMIN_SETTINGS, (data) => {
            io.in(data.channelId).emit(Constants.SOCKET_KEYS.ADMIN_SETTINGS, data);
        });

        client.on(Constants.SOCKET_KEYS.TEMPLATE, (data) => {
            appServer.channels[data.channelId].templateUrl = data.templateUrl;
            io.in(data.channelId).emit(Constants.SOCKET_KEYS.TEMPLATE, data);
        });

        client.on(Constants.SOCKET_KEYS.NEW_SKETCH, (data) => {
            io.in(data.channelId).emit(Constants.SOCKET_KEYS.NEW_SKETCH, data);
        });

        client.on(Constants.SOCKET_KEYS.DELETE_CHANNEL, (data) => {
            appServer.channels[data.channelId] = null;
            io.in(data.channelId).emit(Constants.SOCKET_KEYS.DELETE_CHANNEL, null);
        });
    });
}

class SocketWrapper {
    constructor(appServer) {
        this.io = socketIO.listen(appServer.server);
        this.currentChannelPerUser = {};
        setupSocketIO(this, appServer, this.io);
    }
}

module.exports = SocketWrapper;