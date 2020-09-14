/* eslint-disable no-console */
/* eslint-env node */

const Channel = require("./models/Channel.js");

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
  User = require("./models/user");

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
    this.app.use("/app", express.static(this.appDir));
    this.app.set("view engine", "ejs");
    this.app.set("views", path.join(__dirname, "/views"));

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
    this.setupAuthentication();
    this.setupDatabaseConnection();
    this.setupRouting();
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
      });

      socket.on('clear-canvas', () => {
        this.channels.testChannel.lineHistory = [];
        io.emit('clear-canvas', null);
      });
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

  setupRouting() {
    this.app.use("/user", userRoute);
    this.app.use("/channel", channelRoute);
    this.app.use("/", indexRoute);
  }

  setupDatabaseConnection() {
    mongoose.connect(MONGOURL, { useNewUrlParser: true, useUnifiedTopology: true } ).then(()=>console.log("DB connected"))
    .catch(error => console.log(error));
    mongoose.set("useCreateIndex", true);
    mongoose.Promise = global.Promise;
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
