/* eslint-env node */

const AppServer = require("./lib/AppServer.js");

var server;
var port = process.env.PORT || 8000;

/**
 * Starts webserver to serve files from "/app" folder
 */
function init() {
  
  server = new AppServer();
  server.start(port);
}

init();
