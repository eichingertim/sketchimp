/* eslint-env node */

/**
 * Provides a Class for standard events
 */

class Event {
    constructor(type, data) {
      this.type = type;
      this.data = data;
      Object.freeze(this);
    }
}

module.exports = Event;