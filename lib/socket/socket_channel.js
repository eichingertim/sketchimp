/* eslint-env node */

/**
 * Provides a Class that forms a Channel for usage with the Websocket
 */

class Channel {
  constructor(id, users, templateUrl) {
    this.id = id;
    this.name = NaN;
    this.users = users || {};
    this.activeUsers = {};
    this.templateUrl = templateUrl;
  }
}

module.exports = Channel;
