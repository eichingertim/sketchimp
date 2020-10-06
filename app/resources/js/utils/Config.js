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
        API_URL_SKETCH_LIKE: "/api/sketch/upvote/",
        API_URL_SKETCH_DISLIKE: "/api/sketch/downvote/",
        API_URL_DELETE_CHANNEL: "/api/channel/delete/",
        API_URL_SKETCH_ALL_PUBLISHED: "/api/sketch/all-published",
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
        CHANNEL_ROLE_ADMIN: "admins",
        CHANNEL_ROLE_COLLABORATOR: "collaborators",
        CHANNEL_ROLE_VIEWER: "viewers",
        DELAY_SHOW_SUCCESS: 3000,
        PUBLIC_FEED_CARDS_PER_SECTION: 25,
        LAZY_LOADING_COOLDOWN: 500,
        STATES: {
            ACTIVE: "active",
            INACTIVE: "inactive",
            OFFLINE: "offline",
        },
        STATES_COLORS: {
            ACTIVE: "#21AD50",
            INACTIVE: "#D19917",
            OFFLINE: "#DE6954",
        },
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

        IMPORT_TEMPLATE_CLICK: "ImportTemplateClick",
        TEMPLATE_SELECTED: "TemplateSelected",
        TEMPLATE_RECEIVED: "TemplateReceived",

        SAVE_SETTINGS_CLICK: "SaveSettingsClick",

        CLOSE_INFO_DIALOG: "CloseInfoDialog",
        CLOSE_ADMIN_DIALOG: "CloseAdminDialog",
        CLOSE_CREATE_SKETCH_DIALOG: "CloseCreateSketchDialog",
        CLOSE_CREATE_CHANNEL_DIALOG: "CloseCreateChannelDialog",

        CHANNEL_INFO_CLICK: "ChannelInfoClick",
        ADMIN_SETTINGS_CLICK: "AdminSettingsClick",
        MEMBER_KICK_CLICK: "MemberKickClick",
        ACTIVE_USER_RECEIVED: "ActiveUserReceived",
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
        TEMPLATE: "template",
        ADMIN_SETTINGS: "admin-settings",
        ACTIVE_USER: "active-users",
    },
    
    PublicFeedDimensions = {
        CARD_DEFAULT: 395,
        SCORE_DEFAULT: 55,
        SCOREFONT_DEFAULT: 20,
        TITLE_DEFAULT: 30,
        VOTEBUTTON_DEFAULT: 40,
        CARD_BASE: 200,
        CARD_MULTIPLICANT: 350,
        SCORE_BASE: 40,
        SCORE_MULTIPLICANT: 95,
        SCOREFONT_BASE: 12,
        SCOREFONT_MULTIPLICANT: 12,
        TITLE_BASE: 20,
        TITLE_MULTIPLICANT: 20,
        MENUBAR_OFFSET: 30,

    };

export {Config, EventKeys, SocketKeys, PublicFeedDimensions};
export default Config;