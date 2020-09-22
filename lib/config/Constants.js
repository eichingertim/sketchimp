/* eslint-disable no-magic-numbers */
/* eslint-env node */

/**
 * Configuration object for values shared by multiple components
 */

const Constants = {
  MONGOURL: "mongodb+srv://ur:sketchingwithfriends@sketchingwithfriends.b4fgo.azure.mongodb.net/sketching?retryWrites=true&w=majority",
  SESSION_SECRET: "RufYVOWa7vvyGqldEnWH",
  PASSWORD_HASHLENGTH: 10,
  CANVAS_UNDO_STEPS: 5,
  AVATAR_FIELD: "avatar",
  AVATAR_BASE_URL: "/app/resources/img/uploads/avatars",
  AVATAR_STORAGE: "../app/resources/img/uploads/avatars",
  UPLOAD_OPTIONS: {
    square: true,
    responsive: false,
    greyscale: false,
    quality: 60,
  },
  UPLOAD_MAX_SIZE: Math.pow(1024, 3),
  PROFILE_IMAGE_PLACEHOLDER: "",
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
      CHANNEL_ICON_UPLOAD_SUCCESS: "Uploaded icon successfully",
      CHANNEL_ICON_UPLOAD_FAIL: "Failed to upload icon",
  },
};
  
module.exports = Constants;