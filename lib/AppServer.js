/* eslint-env node */

const Channel = require("./models/Channel.js");

const path = require("path"),
  express = require("express");

/**
 * AppServer
 *
 * Creates a simple web server by using express to static serve files from a given directory.
 *
 * @author: Alexander Bazo
 * @version: 1.0
 */

class AppServer {

  /**
   * Creates full path to given appDir and constructors express application with
   * static "/app" route to serve files from app directory.
   *
   * @constructor
   */
  constructor() {
    this.app = express();
    this.app.use(express.static(path.join(__dirname, "../", 'app')));

    //Saves lines that are drawn on this server
    this.channels = {
      testChannel: new Channel(),
    }
  }

  /**
   * Starts server on given port
   *
   * @param  {Number} port Port to use for serving static files
   */
  start(port) {
    this.server = this.app.listen(port, function() {
      console.log(
        `AppServer started. Client available at http://localhost:${port}`
      );
    });

    var io = require('socket.io').listen(this.server);
    io.on('connection', (socket) => {
      console.log('a user connected');

      for (var i in this.channels.testChannel.lineHistory) {
        let data = {
          line: this.channels.testChannel.lineHistory[i].line,
          color: this.channels.testChannel.lineHistory[i].color,
          penRubber: this.channels.testChannel.lineHistory[i].penRubber,
          size: this.channels.testChannel.lineHistory[i].size
        }
        socket.emit('line', data);
      }

      socket.on('line', (data) => {
        this.channels.testChannel.lineHistory.push(data);
        io.emit('line', data);
      })
    });
  }

  /**
   * Stops running express server
   */
  stop() {
    if (this.server === undefined) {
      return;
    }
    this.server.close();
  }

}

module.exports = AppServer;
