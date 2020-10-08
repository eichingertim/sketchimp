/* eslint-env node */

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
