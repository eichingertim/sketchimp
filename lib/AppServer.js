/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
/* eslint-env node */

const path = require("path"),
  express = require("express"),
  mongoose = require("mongoose"),
  flash = require("connect-flash"),
  socketWrapper = require("./socket/socketWrapper"),
  dbWrapper = require("./database/DatabaseWrapper"),
  authWrapper = require("./auth/authWrapper"),
  Constants = require("./config/Constants"),
  apiRoute = require("./routes/apiWrapper"),
  markupRoute = require("./routes/markupWrapper"),
  SocketChannel = require("./socket/socket_channel.js");

function addChannel(appServer, data) {
  appServer.channels[data.data.id] = new SocketChannel(data.data.id);
}

function setupListener(appServer) {
  apiRoute.channelRoute.addEventListener("ChannelNew", addChannel.bind(this, appServer));
}

function loadSavedChannelsIntoServer(channel, appServer) {
  let sketchPromise = dbWrapper.Sketch.getCurrentForChannelId(channel._id);
  if (sketchPromise) {
    sketchPromise.then((sketch) => {
      if (sketch !== undefined && sketch.data !== undefined && sketch.data !== "") {
        let usersHistory = JSON.parse(sketch.data).users;
        appServer.channels[channel._id] = new SocketChannel(channel._id, usersHistory);
      } else {
        appServer.channels[channel._id] = new SocketChannel(channel._id, undefined);
      }
    }).catch((err) => {
      console.log(err);
      appServer.channels[channel._id] = new SocketChannel(channel._id, undefined);
    });
  } else {
    appServer.channels[channel._id] = new SocketChannel(channel._id, undefined);
  }
}

function setupDatabaseConnection(appServer) {
  mongoose.connect(Constants.MONGOURL, { useNewUrlParser: true, useUnifiedTopology: true } ).then(()=> {
    console.log("DB connected");
    let channelPromise = dbWrapper.Channel.getAll();
    if (channelPromise) {
      channelPromise.then((channels)=>{
        channels.forEach(channel => {
          loadSavedChannelsIntoServer(channel, appServer);
        });
      });
    }
  })
  .catch(error => console.log(error));
  mongoose.set("useCreateIndex", true);
  mongoose.Promise = global.Promise;
}

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
  constructor(appDir) {
    this.app = express();
    this.app.use("/app", express.static(appDir));
    this.app.use("/well-known/pki-validation", express.static(Constants.CERTDIR));
    this.app.set("view engine", "ejs");
    this.app.set("views", path.join(__dirname, "/views"));
    this.app.use(flash());

    //Saves lines that are drawn on this server
    this.channels = {};
  }

  /**
   * Starts server on given port
   *
   * @param  {Number} port Port to use for serving static files
   */
  start(port) {
    this.setupAuthentication();
    setupDatabaseConnection(this);
    this.setupRouting();
    this.server = this.app.listen(port, function() {
      console.log(
        `AppServer started. Client available at http://localhost:${port}`
      );
    });
    this.socketWrapper = new socketWrapper(this);
    setupListener(this);
  }

  setupAuthentication() {
    this.app.use(authWrapper.router);
  }

  setupRouting() {
    this.app.use("/api", apiRoute.router);
    this.app.use("/", markupRoute.router);
  }

  stop() {
    if (this.server === undefined) {
      return;
    }
    this.server.close();
  }
}

module.exports = AppServer;
