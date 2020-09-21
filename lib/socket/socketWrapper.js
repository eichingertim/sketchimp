/* eslint-disable no-console */
/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const socketIO = require("socket.io"),
    Constants = require("../config/Constants");

function setupSocketIO(appServer, io) {
    io.on("connection", (client) => {
        console.log("a user connected");

        client.on("subscribe", function(channelId) {
            console.log("joining room", channelId);
            client.join(channelId); 
            if (appServer.channels[channelId] !== undefined && appServer.channels[channelId].users !== undefined) {
                // eslint-disable-next-line guard-for-in
                for (let i in appServer.channels[channelId].users) {
                    for (let j = 0; j < appServer.channels[channelId].users[i].lineHistory.length; j++) {
                        let data = appServer.channels[channelId].users[i].lineHistory[j];
                        client.emit("line", data);
                    }
                }
            }
        });
        
        client.on("unsubscribe", function(channelId) {
            console.log("leaving room", channelId);
            client.leave(channelId); 
        });

        client.on("undo", (data) => {
            let lineRemoved = [];
            for (let i = 0; i < Constants.CANVAS_UNDO_STEPS; i++ ) {
                let line = appServer.channels[data.channelId].users[data.userId].lineHistory.shift();
                if (line !== undefined) {
                    lineRemoved.push(line.lineId);
                }
            }
            if (lineRemoved.length > 0) {
                io.in(data.channelId).emit("undo", lineRemoved);
            }
        });

        client.on("line", (data) => {
            if (appServer.channels[data.channelId].users[data.userId] !== undefined) {
                appServer.channels[data.channelId].users[data.userId].lineHistory.push(data);
            } else {
                appServer.channels[data.channelId].users[data.userId] = {
                    lineHistory: [],
                };
                appServer.channels[data.channelId].users[data.userId].lineHistory.push(data);
            }
            io.in(data.channelId).emit("line", data);
        });

        client.on("clear-canvas", (data) => {
            appServer.channels[data.channelId].users = {};
            io.in(data.channelId).emit("clear-canvas", null);
        });
    });
}

class SocketWrapper {
    constructor(appServer) {
        console.log(appServer);
        this.io = socketIO.listen(appServer.server);
        setupSocketIO(appServer, this.io);
    }
}

module.exports = SocketWrapper;