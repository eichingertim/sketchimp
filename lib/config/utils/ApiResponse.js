/* eslint-env node */

class ApiResponse {
    constructor(status, message, data) {
      this.status = status;
      this.message = message;
      this.data = data || {};
      Object.freeze(this);
    }
  }

module.exports = ApiResponse;