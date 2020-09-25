/* eslint-env node */

class Channel {
  constructor(id, users) {
    this.id = id;
    this.name = NaN;
    if (users === undefined) {
      this.users = {};
    } else {
      this.users = users;
    }

  }
}

module.exports = Channel;
