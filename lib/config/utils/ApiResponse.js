/* eslint-env node */

/**
 * Provides a class that standardizes Responses to requests that are served through the API
 */

class ApiResponse {
    constructor(success, message, data) {
      this.success = success || 0;
      this.message = message || "";
      this.data = data || {};
      Object.freeze(this);
    }
  }

module.exports = ApiResponse;