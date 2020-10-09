/* eslint-env node */
/*
* Allow console statements when starting AppServer
*/
/* eslint-disable no-console */

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
  appServer.channels[data.data.id] = new SocketChannel(data.data.id, null, null);
}

function setupListener(appServer) {
  apiRoute.channelRoute.addEventListener("ChannelNew", addChannel.bind(this, appServer));
}

function loadSavedChannelsIntoServer(channel, appServer) {
  let sketchPromise = dbWrapper.Sketch.getCurrentForChannelId(channel._id);
  if (sketchPromise) {
    sketchPromise.then((sketch) => {
      if (sketch !== undefined && sketch.data !== undefined && sketch.data !== "") {
        let data = JSON.parse(sketch.data);
        appServer.channels[channel._id] = new SocketChannel(channel._id, data.users, data.templateUrl);
      } else {
        appServer.channels[channel._id] = new SocketChannel(channel._id, undefined, null);
      }
    }).catch(() => {
      appServer.channels[channel._id] = new SocketChannel(channel._id, undefined, null);
    });
  } else {
    appServer.channels[channel._id] = new SocketChannel(channel._id, undefined, null);
  }
}

function setupDatabaseConnection(appServer) {
  mongoose.connect(Constants.MONGOURL, { useNewUrlParser: true, useUnifiedTopology: true } ).then(()=> {
    let channelPromise = dbWrapper.Channel.getAll();
    if (channelPromise) {
      channelPromise.then((channels)=>{
        channels.forEach(channel => {
          loadSavedChannelsIntoServer(channel, appServer);
        });
      });
    }
  })
  .catch(() => {
    console.log("Could not establish Database Connection");
  });
  mongoose.set("useCreateIndex", true);
  mongoose.Promise = global.Promise;
}

/**
 * AppServer
 *
 * Creates a simple web server by using express to static serve files from a given directory.
 *
 * @author: Sketchimp Team
 * @version: 2.0
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
        `AppServer started. Client available at http://${process.env.hostname || "localhost"}:${port}`
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
