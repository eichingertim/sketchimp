/* eslint-env node */

class ApiResponse {
    constructor(message, data) {
      this.message = message;
      this.data = data || {};
      Object.freeze(this);
    }
  }

module.exports = ApiResponse;