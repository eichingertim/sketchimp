/* eslint-env node */

/**
 * Configuration object for values shared by multiple components
 */

const Constants = {
  PASSWORD_HASHLENGTH: 10,
  RESPONSEMESSAGES: {
      USER_FOUND: "User Lookup Successful!",
      USER_NOT_FOUND: "Could not find User!",
      CHANNEL_FOUND: "Channel Lookup Successful!",
      CHANNEL_NOT_FOUND: "Could not find Channel!",
      CHANNEL_JOIN_SUCCESS: "Successfully joined Channel!",
      CHANNEL_JOIN_ALREADY_MEMBER: "Already a member of this Channel!",
      CHANNEL_JOIN_FAIL: "Could not join Channel!",
      CHANNEL_LEAVE_SUCCESS: "Successfully left Channel!",
      CHANNEL_LEAVE_NOT_MEMBER: "Not a member of this Channel!",
      CHANNEL_LEAVE_FAIL: "Could not leave Channel!",
      CREATE_CHANNEL_SUCCESS: "Channel created successfully!",
      CREATE_CHANNEL_FAIL: "Channel could not be created!",
  },
};
  
module.exports = Constants;