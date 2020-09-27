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
        API_URL_FINALIZED_SKETCHES: "/api/sketch/all-finalized/",
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
        PATH_LIKE_ICON_INACTIVE: "/app/assets/thumb_up-white-18dp.svg",
        PATH_LIKE_ICON_ACTIVE: "/app/assets/thumb_up-white-18dp-active.svg",
        PATH_DISLIKE_ICON_INACTIVE: "/app/assets/thumb_down-white-18dp.svg",
        PATH_DISLIKE_ICON_ACTIVE: "/app/assets/thumb_down-18dp-active.svg",
    },

    EventKeys = {
        CHANNEL_DATA_LOADED: "ChannelDataLoaded",
        CREATED_CHANNEL_DATA_LOADED: "CreateChannelDataLoaded",
        JOIN_NEW_CHANNEL_DATA_LOADED: "JoinNewChannelDataLoaded",
        LEAVE_CHANNEL_DATA_LOADED: "LeaveChannelDataLoaded",

        LINE_DRAWN_RECEIVED: "LineDrawn",
        LINE_UNDO_RECEIVED: "LineUndo",
        CLEAR_RECEIVED: "ClearCanvas",

        DATA_OF_ONE_MEMBER_LOADED: "MemberDataLoaded",

        SKETCH_SAVED_IN_DB: "SketchSaved",
        LOADED_SKETCH_HISTORY_FOR_CHANNEL: "LoadedHistory",
        FINALIZED_AND_CREATED_SKETCH: "SketchCreate",

        LEAVE_CHANNEL_CLICK: "LeaveChannelClick",
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

        PUBLISH_SKETCH_FINISHED: "PublishSketchFinished",
    },

    SocketKeys = {
        UNSUBSCRIBE: "unsubscribe",
        SUBSCRIBE: "subscribe",
        LINE_DRAWN: "line",
        LINE_UNDO: "undo",
        CLEAR_CANVAS: "clear-canvas",
        CHANNEL_LINE_HISTORY: "getLineHistory",

    };

export {Config, EventKeys, SocketKeys};
export default Config;