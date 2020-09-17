/* eslint-disable no-console */
/* eslint-env node */

const Channel = require("./models/socket_channel.js");

const path = require("path"),
  express = require("express"),
  session = require("express-session"),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  MONGOURL = "mongodb+srv://sketching2:G26wFVdXqQnUqddu@cluster0.4p4xq.mongodb.net/sketching2?retryWrites=true&w=majority",
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  passportStrategy = require("./config/passport"),
  userRoute = require("./routes/user"),
  channelRoute = require("./routes/channel"),
  indexRoute = require("./routes/index"),
  User = require("./models/user"),
  MongoDBChannel = require("./models/channel");

function setupSocketIO(appServer) {
  const io = require('socket.io').listen(appServer.server);
    io.on('connection', (client) => {

      console.log('a user connected');

      client.on('subscribe', function(channelId) { 
        console.log('joining room', channelId);
        client.join(channelId); 

        for (var i in appServer.channels[channelId].lineHistory) {
          let data = {
            line: appServer.channels[channelId].lineHistory[i].line,
            color: appServer.channels[channelId].lineHistory[i].color,
            penRubber: appServer.channels[channelId].lineHistory[i].penRubber,
            size: appServer.channels[channelId].lineHistory[i].size
          }
          client.emit('line', data);
        }

      })
    
      client.on('unsubscribe', function(channelId) {  
        console.log('leaving room', channelId);
        client.leave(channelId); 
      })

      client.on('line', (data) => {
        appServer.channels[data.channelId].lineHistory.push(data);
        io.in(data.channelId).emit('line', data);
      });

      client.on('clear-canvas', () => {
        appServer.channels[data.channelId].lineHistory = [];
        io.in(data.channelId).emit('clear-canvas', null);
      });
    });
}

function addChannel(appServer, data) {
  appServer.channels[data.data.id] = new Channel(data.data.id);
}

function setupListener(appServer) {
  channelRoute.addEventListener("ChannelNew", addChannel.bind(this, appServer));
}

function setupDatabaseConnection(appServer) {
  mongoose.connect(MONGOURL, { useNewUrlParser: true, useUnifiedTopology: true } ).then(()=> {
    console.log("DB connected")
    MongoDBChannel.find().then((channels)=>{
      channels.forEach(channel => {
        appServer.channels[channel._id] = new Channel(channel._id);
      });
    });

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
    this.app.set("view engine", "ejs");
    this.app.set("views", path.join(__dirname, "/views"));

    //Saves lines that are drawn on this server
    this.channels = {
      
    }
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

    setupSocketIO(this);
    setupListener(this);
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

  setupRouting() {
    this.app.use("/user", userRoute);
    this.app.use("/channel", channelRoute.router);
    this.app.use("/", indexRoute);
  }

  setupAuthentication() {
    this.app.use(bodyParser.urlencoded({extended : true}));
    this.app.use(bodyParser.json());
    this.app.use(session({
      secret: "secret",
      resave: true,
      saveUninitialized: true,
    }));
    this.app.use(passport.initialize());
    this.app.use(passport.session());
    passport.use("local-login", new LocalStrategy({
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true,
    }, passportStrategy.localSiginStrategy));
    passport.use("local-signup", new LocalStrategy({
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true,
    }, passportStrategy.localSignupStrategy));
    passport.serializeUser((user, done)=>{
        done(null, user.id);
    });
    passport.deserializeUser((id, done)=>{
        User.findById(id, (err, user)=>{
            done(err, user);
        });
    });
  }

}

module.exports = AppServer;
