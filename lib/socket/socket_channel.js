/* eslint-env node */

class Channel {
  constructor(id, users, templateUrl) {
    this.id = id;
    this.name = NaN;
    if (users === undefined) {
      this.users = {};
    } else {
      this.users = users;
    }
    this.templateUrl = templateUrl;
  }
}

module.exports = Channel;
