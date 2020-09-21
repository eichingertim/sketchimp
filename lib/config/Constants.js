/* eslint-env node */

/**
 * Configuration object for values shared by multiple components
 */

const Constants = {
  MONGOURL: "mongodb+srv://ur:sketchingwithfriends@sketchingwithfriends.b4fgo.azure.mongodb.net/sketching?retryWrites=true&w=majority",
  SESSION_SECRET: "RufYVOWa7vvyGqldEnWH",
  PASSWORD_HASHLENGTH: 10,
  CANVAS_UNDO_STEPS: 5,
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
      SKETCH_NOT_FOUND: "No sketch found!",
      PAGE_NOT_FOUND: "Could not find what you were looking for! :(",
      ADDED_TO_DOWNVOTES: "Added user to downvotes!",
      ADDED_TO_UPVOTES: "Added user to upvotes!",
      SKETCH_SAVED: "Sketch successfully saved!",
      SKETCH_CREATED: "Sketch successfully created!",
      SKETCH_FOUND: "Sketch Lookup Successful!",
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