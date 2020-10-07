/* eslint-env node */

class ApiResponse {
    constructor(success, message, data) {
      this.success = success || 0;
      this.message = message || "";
      this.data = data || {};
      Object.freeze(this);
    }
  }

module.exports = ApiResponse;