/* eslint-env node */

// stores all repositories
const UserRepository = require("./repository/UserRepository"),
    ChannelRepository = require("./repository/ChannelRepository"),
    SketchRepository = require("./repository/SketchRepository");

/**
 * Provides a Class that bundles all Schema Repositories 
 * Repositories are used to send queries to the systems MongoDB
 */

class DatabaseWrapper {
    constructor() {
        this.User = UserRepository;
        this.Channel = ChannelRepository;
        this.Sketch = SketchRepository;
    }
}

module.exports = new DatabaseWrapper();