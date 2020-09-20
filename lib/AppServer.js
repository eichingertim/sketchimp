/* eslint-disable no-console */
/* eslint-env node */

const Channel = require("./models/socket_channel.js");

const path = require("path"),
  express = require("express"),
    socketIO = require("socket.io"),
  session = require("express-session"),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  MONGO_URL = "mongodb+srv://ur:sketchingwithfriends@sketchingwithfriends.b4fgo.azure.mongodb.net/sketching?retryWrites=true&w=majority",
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  passportStrategy = require("./config/passport"),
  loginRoute = require("./routes/markup/login"),
  registerRoute = require("./routes/markup/register"),
  logoutRoute = require("./routes/markup/logout"),
  profileRoute = require("./routes/markup/profile"),
  dashboardRoute = require("./routes/markup/dashboard"),
  frontpageRoute = require("./routes/markup/frontpage"),
  apiRoute = require("./routes/apiWrapper"),
  defaultRoute = require("./routes/markup/default"),
  User = require("./models/user"),
  MongoDBChannel = require("./models/channel");

function setupSocketIO(appServer) {
  const io = socketIO.listen(appServer.server);
    io.on("connection", (client) => {

      console.log("a user connected");

      client.on("subscribe", function(channelId) {
        console.log("joining room", channelId);
        client.join(channelId); 

        if (appServer.channels[channelId] !== undefined & appServer.channels[channelId].users !== undefined) {

          for (let i in appServer.channels[channelId].users) {
            for (let j = 0; j < appServer.channels[channelId].users[i].lineHistory.length; j++) {
              
              let data = appServer.channels[channelId].users[i].lineHistory[j];
              client.emit("line", data);

            }
          }
        }

      });
    
      client.on('unsubscribe', function(channelId) {
        console.log('leaving room', channelId);
        client.leave(channelId); 
      });

      client.on('undo', (data) => {
        let lineRemoved = [];
        for (let i = 0; i < 5; i++ ) {
          let line = appServer.channels[data.channelId].users[data.userId].lineHistory.shift();
          if (line !== undefined) lineRemoved.push(line.lineId);
        }
        if (lineRemoved.length > 0) io.in(data.channelId).emit('undo', lineRemoved);
      });

      client.on('line', (data) => {
        if (appServer.channels[data.channelId].users[data.userId] !== undefined) {
          appServer.channels[data.channelId].users[data.userId].lineHistory.push(data);
        } else {
          appServer.channels[data.channelId].users[data.userId] = {
            lineHistory: [],
          }
          appServer.channels[data.channelId].users[data.userId].lineHistory.push(data);
        }
        io.in(data.channelId).emit('line', data);
      });

      client.on('clear-canvas', (data) => {
        appServer.channels[data.channelId].users = {}
        io.in(data.channelId).emit('clear-canvas', null);
      });
    });
}

function addChannel(appServer, data) {
  appServer.channels[data.data.id] = new Channel(data.data.id);
}

function setupListener(appServer) {
  apiRoute.channelRoute.addEventListener("ChannelNew", addChannel.bind(this, appServer));
}

function setupDatabaseConnection(appServer) {
  mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true } ).then(()=> {
    console.log("DB connected");
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
    this.setupApi();
    this.setupMarkupRouting();
  }
  
  setupApi() {
    this.app.use("/api", apiRoute.router);
  }

  setupMarkupRouting() {
    this.app.use("/login", loginRoute);
    this.app.use("/register", registerRoute);
    this.app.use("/logout", logoutRoute);
    this.app.use("/@me", profileRoute);
    this.app.use("/dashboard", dashboardRoute);
    this.app.use("/frontpage", frontpageRoute);
    this.app.use("/", defaultRoute);
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
