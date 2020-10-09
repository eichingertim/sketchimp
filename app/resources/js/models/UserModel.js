/**
 * A model of user that can be used in the frontend
 */
class UserModel {
    constructor(id, name, currentChannelRole) {
        this.userId = id;
        this.name = name;
        this.currentChannelRole = currentChannelRole;
    }
}

export default UserModel;