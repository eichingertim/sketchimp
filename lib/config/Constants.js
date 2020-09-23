/* eslint-disable no-magic-numbers */
/* eslint-env node */

/**
 * Configuration object for values shared by multiple components
 */

const Constants = {
  PORT: process.env.PORT || 8000,
  APPDIR: "./app",
  MONGOURL: "mongodb+srv://ur:sketchingwithfriends@sketchingwithfriends.b4fgo.azure.mongodb.net/sketching?retryWrites=true&w=majority",
  SESSION_SECRET: "RufYVOWa7vvyGqldEnWH",
  PASSPORT_SETTINGS: {
    USERNAME_FIELD: "email",
    PASSWORD_FIELD: "password",
  },
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
  ROLES: {
    ADMIN: "admin",
    COLLABORATOR: "collaborator",
    VIEWER: "viewer",
  },
  UPLOAD_MAX_SIZE: Math.pow(1024, 3),
  PROFILE_IMAGE_PLACEHOLDER: "/app/resources/img/placeholder.png",
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
      SKETCH_NOT_FOUND: "No sketch found!",
      PAGE_NOT_FOUND: "Could not find what you were looking for! :(",
      ADDED_TO_DOWNVOTES: "Added user to downvotes!",
      NOT_ADDED_TO_UPVOTES: "User could not be added to upvotes!",
      NOT_ADDED_TO_DOWNVOTES: "User could not be added to downvotes!",
      ADDED_TO_UPVOTES: "Added user to upvotes!",
      SKETCH_SAVED: "Sketch successfully saved!",
      SKETCH_NOT_SAVED: "Sketch could not be saved!",
      SKETCH_CREATED: "Sketch successfully created!",
      SKETCH_FOUND: "Sketch Lookup Successful!",
      SKETCH_NOT_CREATED: "Could not create new sketch!",
  },
  HTTP_STATUS_CODES: {
    OK: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  },
};
  
module.exports = Constants;