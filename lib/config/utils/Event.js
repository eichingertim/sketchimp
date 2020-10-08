/* eslint-env node */

class Event {
    constructor(type, data) {
      this.type = type;
      this.data = data;
      Object.freeze(this);
    }
  }
module.exports = Event;