const Config = {
        API_URL_NEW_CHANNEL: "/api/channel/new/",
        API_URL_NEW_SKETCH: "/api/sketch/new/",
        CONTENT_TYPE_URL_ENCODED: "application/x-www-form-urlencoded",
        CONTENT_TYPE_JSON: "application/json",
        API_URL_JOIN_CHANNEL: "/api/channel/join/",
        API_URL_LEAVE_CHANNEL: "/api/channel/leave/",
        API_URL_SKETCH_SAVE: "/api/sketch/save/",
        API_URL_CHANNEL: "/api/channel/",
        API_URL_SKETCH_PUBLISH: "/api/sketch/publish/",
        API_URL_CURRENT_SKETCH: "/api/sketch/current/",
        API_URL_FINALIZE_SKETCH: "/api/sketch/finalize-create/",
        API_URL_FINALIZED_SKETCHES: "/api/sketch/all-finalized/",
        API_URL_DELETE_CHANNEL: "/api/channel/delete/",
        HTTP_POST: "POST",
        HTTP_GET: "GET",
        DEFAULT_SKETCH_NAME: "Monkey Sketch",
        UUID_PATTERN: "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx",
        CANVAS_WIDTH: 1080,
        CANVAS_HEIGHT: 720,
        CANVAS_SIZE_OFFSET: 10,
        DEFAULT_PEN_COLOR: "#12c2aa",
        DEFAULT_PEN_SIZE: 5,
        DEFAULT_PEN_JOIN_CAP: "round",
        PEN_OPERATION: "source-over",
        RUBBER_OPERATION: "destination-out",
        DEFAULT_PNG_NAME: "sketch-export.png",
        SKETCH_HISTORY_ITEM_HEIGHT: 30,
        CHANNEL_ROLE_ADMIN: "admins",
        CHANNEL_ROLE_COLLABORATOR: "collaborators",
        CHANNEL_ROLE_VIEWER: "viewers",
        DELAY_SHOW_SUCCESS: 3000,
    },

    EventKeys = {
        LINE_DRAWN_RECEIVED: "LineDrawn",
        LINE_UNDO_RECEIVED: "LineUndo",
        CLEAR_RECEIVED: "ClearCanvas",

        LEAVE_CHANNEL_CLICK: "LeaveChannelClick",
        DELETE_CHANNEL_CLICK: "DeleteChannelClick",
        CHANNEL_ITEM_CLICK: "ChannelItemClick",
        CHANNEL_ITEM_CREATE_CLICK: "JoinServerClick",

        JOIN_CHANNEL_SUBMIT: "JoinNewChannel",
        CREATE_CHANNEL_SUBMIT: "CreateChannel",

        CREATE_SKETCH_SUBMIT: "SketchCreateClick",

        LINE_READY_FOR_EMIT: "EmitLine",

        MEMBER_ITEM_CLICK: "MemberItemClick",

        SKETCH_SAVE_CLICK: "Save",
        SKETCH_FINALIZE_CLICK: "Finalize",
        SKETCH_EXPORT_CLICK: "Export",

        CLEAR_CANVAS_CLICK: "DeleteForever",
        SIZE_CHANGE_CLICK: "SizeChange",
        COLOR_CHANGE_CLICK: "ColorChange",
        PEN_RUBBER_SWITCH_CLICK: "PenRubberSwitch",
        UNDO_CLICK: "Undo",

        HISTORY_ITEM_CLICK: "HistoryItemClick",
        FULLSCREEN_CLOSE_CLICK: "FullScreenCloseClick",
        PUBLISH_SKETCH_CLICK: "PublishSketchClick",

        NEW_SKETCH_RECEIVED: "NewSketchReceived",
    },

    SocketKeys = {
        UNSUBSCRIBE: "unsubscribe",
        SUBSCRIBE: "subscribe",
        LINE_DRAWN: "line",
        LINE_UNDO: "undo",
        CLEAR_CANVAS: "clear-canvas",
        CHANNEL_LINE_HISTORY: "getLineHistory",
        DELETE_CHANNEL: "delete-channel",
        NEW_SKETCH: "new-sketch",

    };

export {Config, EventKeys, SocketKeys};
export default Config;