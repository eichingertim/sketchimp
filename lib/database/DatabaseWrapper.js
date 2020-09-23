/* eslint-env node */

const UserRepository = require("./repository/UserRepository"),
    ChannelRepository = require("./repository/ChannelRepository"),
    SketchRepository = require("./repository/SketchRepository");

class DatabaseWrapper {
    constructor() {
        this.User = UserRepository;
        this.Channel = ChannelRepository;
        this.Sketch = SketchRepository;
    }
}

module.exports = new DatabaseWrapper();