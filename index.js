/* eslint-env node */

const AppServer = require("./lib/AppServer.js"),
  Constants = require("./lib/config/Constants");

var server;

/**
 * Starts webserver to serve files from "/app" folder
 */
function init() {
  // Access command line parameters from start command (see package.json)
  let appDirectory = Constants.APPDIR,
    appPort = Constants.PORT;
  server = new AppServer(appDirectory);
  server.start(appPort);
}

init();
