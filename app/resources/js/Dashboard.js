import DrawAreaController from "./controller/DrawAreaController.js";
import DrawAreaView from "./ui/dashboard/DrawAreaView.js";
import ToolboxView from "./ui/dashboard/ToolboxView.js";
import MemberListView from "./ui/dashboard/MemberListView.js";
import MemberController from "./controller/MemberController.js";
import ChannelListView from "./ui/dashboard/ChannelListView.js";
import ChannelController from "./controller/ChannelController.js";
import ChannelInfoDialogView from "./ui/dashboard/ChannelInfoDialogView.js";
import CreateChannelDialogView from "./ui/dashboard/CreateChannelDialogView.js";
import SaveLoadView from "./ui/dashboard/SaveLoadView.js";
import SketchController from "./controller/SketchController.js";
import CreateSketchDialogView from "./ui/dashboard/CreateSketchDialogView.js";
import AdminSettingsDialogView from "./ui/dashboard/AdminSettingsDialogView.js";
import TopBarView from "./ui/dashboard/TopBarView.js";
import ChooseTemplateDialogView from "./ui/dashboard/ChooseTemplateDialogView.js";
import UserModel from "./models/UserModel.js";
import {Config, EventKeys, SocketKeys} from "./utils/Config.js";
import SketchModel from "./models/SketchModel.js";

let drawAreaView, drawAreaController, toolboxView, memberListView,
    channelListView, channelInfoDialogView, createChannelDialogView,
    saveLoadView, createSketchDialogView, adminSettingsDialogView, topBarView, chooseTemplateDialogView;

/**
 * builds needed data for the drawAreaController, to emit the new line
 * @param dashboard current dashboard instance
 * @param event line emit event
 */
function onLineEmit(dashboard, event) {
    if (this.channel !== null && this.channel !== undefined) {
        let emitLineData = {
            channelId: this.channel.channelId,
            userId: this.user.userId,
            lineData: event.data,
            multilayer: dashboard.channel.currentSketch.multilayer,
            currentChannelRole: dashboard.user.currentChannelRole,
        };
        drawAreaController.emitLine(emitLineData);
    }
}

/**
 * gets called, when someone enters a channel
 * @param dashboard current dashboard instance
 * @param channel corresponding channel-data
 */
function onChannelDataForEnteringLoaded(dashboard, channel) {
    if (channel.creatorId === dashboard.user.userId) {
        dashboard.user.currentChannelRole = Config.CHANNEL_ROLE_ADMIN;
    } else {
        channel.members.forEach(member => {
            if (member.id === dashboard.user.userId) {
                dashboard.user.currentChannelRole = member.role;
            }
        });
    }

    channelInfoDialogView.updateInfo(channel, (channel.creatorId === dashboard.user.userId));
    document.querySelector(".channel-title").textContent = channel.channelName;
    memberListView.updateMembers(channel);

    if (dashboard.channel === null) {
        dashboard.onJoin(channel);
    } else {
        dashboard.onLeave();
        dashboard.onJoin(channel);
    }

    adminSettingsDialogView.setSettings(channel);
}

/**
 * Gets called, when a new channel was created
 * @param dashboard current dashboard instance
 * @param channel new channel data
 */
function onCreateChannelDataLoaded(dashboard, channel) {
    channelListView.addNewChannel(channel);
    createChannelDialogView.clearAfterSubmit();
    onChannelDataForEnteringLoaded(dashboard, channel);
}

/**
 * Starts process to export current sketch as png and download it
 */
function onSketchExportClick() {
    let base64Uri = drawAreaView.getStageAsBase64();
    SketchController.exportSketch(base64Uri, Config.DEFAULT_PNG_NAME);
    saveLoadView.setSketchExported();
}

/**
 * Executes script to finalize current sketch and creates a new
 * @param dashboard current dashboard instance
 * @param event sketch create event
 */
function onSketchCreateClick(dashboard, event) {
    if (dashboard.user.currentChannelRole === Config.CHANNEL_ROLE_ADMIN) {
        drawAreaView.getStageAsPNG().then(function (imageTarget) {
            let newSketchName = event.data.name,
                isMultiLayer = event.data.isMultiLayer;
            SketchController.finalizeSketch(dashboard.channel.channelId, imageTarget.src, newSketchName, isMultiLayer)
                .then((newSketchData) => {
                    let clearCanvasData = {
                        channelId: dashboard.channel.channelId,
                        isNewSketch: true,
                        userRole: dashboard.user.currentChannelRole,
                        multilayer: newSketchData.multilayer,
                        creatorId: dashboard.channel.creatorId,

                    };
                    saveLoadView.setSketchFinalized();
                    createSketchDialogView.clearAfterSubmit();
                    drawAreaController.emitClearCanvas(clearCanvasData);
                    drawAreaController.emitNewSketch(dashboard.channel.channelId, newSketchData.id, newSketchData.name, newSketchData.multilayer);
                    topBarView.clearSketchHistory();
                    SketchController.loadHistory(dashboard.channel.channelId).then((sketches) => {
                        topBarView.addSketchHistory(sketches);
                    });
                });
        });
    }
}

/**
 * Shows clicked sketch-history-item as fullscreen
 * @param dashboard
 * @param event
 */
function onHistoryItemClick(dashboard, event) {
    drawAreaView.setDrawingActivated(false);
    topBarView.showImageFullscreen(event.data);
}

/**
 * toggles sketch-history fullscreen and activates drawing
 */
function onFullScreenCloseClick() {
    topBarView.closeFullScreen();
    drawAreaView.setDrawingActivated(true);
}

/**
 * publishes current sketch-history sketch in fullscreen
 * @param dashboard current dashboard instance
 * @param event {@link EventKeys.PUBLISH_SKETCH_CLICK}
 */
function onPublishSketchBtnClick(dashboard, event) {
    let sketchId = event.data.sketchId;
    SketchController.publishSketch(sketchId).then(() => {
        topBarView.finishedPublishing();
        topBarView.clearSketchHistory();
        SketchController.loadHistory(dashboard.channel.channelId).then((sketches) => {
            topBarView.addSketchHistory(sketches);
        });
    });
}

function onSaveAdminSettingsLoaded() {
    const settings = adminSettingsDialogView.getSettings();
    console.log(settings);
    adminSettingsDialogView.hide();

    //const xhr = new XMLHttpRequest();
    //xhr.open("POST", "/api/admin-settings");
    //xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    //xhr.send(JSON.stringify(settings));
}

/**
 * Calculates Canvas Size -> Responsive
 */
function configureDivSizes() {
    let mainContent = document.querySelector(".dashboard-main-content-container"),
        canvasContainer = document.querySelector(".dashboard-canvas"),
        leftBar = document.querySelector(".channels-container-outer"),
        memberBar = document.querySelector(".container-member-toolbox"),
        topAppBar = document.querySelector(".container-top-bar-history-outer");
    mainContent.style.maxWidth = "" + (window.innerWidth - leftBar.offsetWidth - memberBar.offsetWidth) + "px";
    canvasContainer.style.maxHeight = "" + (window.innerHeight - topAppBar.offsetHeight) + "px";

    drawAreaView.resizeViews();
}

class Dashboard {
    constructor(socket, userId) {

        this.socket = socket;

        this.channel = null;
        this.user = new UserModel(userId, null, Config.CHANNEL_ROLE_VIEWER);

        this.initUIAndController();
        this.setListeners();

        configureDivSizes();
        window.onresize = configureDivSizes;

        document.querySelector(".channel-info-icon").addEventListener("click", function () {
            channelInfoDialogView.toggleVisibility();
        });

        document.querySelector(".admin-settings-icon").addEventListener("click", function() {
            adminSettingsDialogView.updateValues();
            adminSettingsDialogView.toggleVisibility();
        });
    }

    initUIAndController() {
        const container = document.querySelector("#container"),
            toolbox = document.querySelector(".dashboard-toolbox-container"),
            channelList = document.querySelector(".sidebar-menu"),
            memberList = document.querySelector(".member-list"),
            channelInfoDialog = document.querySelector(".info-container"),
            createChannelDialog = document.querySelector(".create-channel-container"),
            saveLoad = document.querySelector(".container-load-and-publish"),
            createSketchDialog = document.querySelector(".create-sketch-container"),
            adminSettingsDialog = document.querySelector(".admin-settings"),
            topBar = document.querySelector(".container-top-bar-history-inner"),
            templateDialog = document.querySelector(".choose-template-container");

        drawAreaView = new DrawAreaView(container);
        toolboxView = new ToolboxView(toolbox);
        memberListView = new MemberListView(memberList);
        channelListView = new ChannelListView(channelList);
        channelInfoDialogView = new ChannelInfoDialogView(channelInfoDialog);
        createChannelDialogView = new CreateChannelDialogView(createChannelDialog);
        saveLoadView = new SaveLoadView(saveLoad);
        createSketchDialogView = new CreateSketchDialogView(createSketchDialog);
        adminSettingsDialogView = new AdminSettingsDialogView(adminSettingsDialog);
        topBarView = new TopBarView(topBar);
        chooseTemplateDialogView = new ChooseTemplateDialogView(templateDialog);

        drawAreaController = new DrawAreaController(this.socket);
    }

    /**
     * Registering all listeners for the corresponding views and controller
     */
    setListeners() {
        this.setDrawAreaListener(this);
        this.setToolboxListener(this);
        this.setChannelTopAndRightBarListener(this);
        this.setDialogListener(this);
    }

    setDrawAreaListener(instance) {
        drawAreaView.addEventListener(EventKeys.LINE_READY_FOR_EMIT, onLineEmit.bind(this, instance));
        drawAreaController.addEventListener(EventKeys.LINE_DRAWN_RECEIVED, (event) =>
            drawAreaView.addLine(event.data));
        drawAreaController.addEventListener(EventKeys.CLEAR_RECEIVED, (event) => {
            drawAreaView.clearCanvas(event.data);
        });
        drawAreaController.addEventListener(EventKeys.LINE_UNDO_RECEIVED, (event) =>
            drawAreaView.undoLine(event.data, instance.channel.currentSketch.multilayer));
        drawAreaController.addEventListener(EventKeys.NEW_SKETCH_RECEIVED, (event) => {
            instance.channel.currentSketch = new SketchModel(event.data.sketchId, event.data.sketchName, event.data.sketchMultiLayer);
            SketchController.loadHistory(instance.channel.channelId).then((sketches) => {
                topBarView.clearSketchHistory();
                topBarView.addSketchHistory(sketches);
            });
        });
        drawAreaController.addEventListener(EventKeys.TEMPLATE_RECEIVED, (event) => {
            if (event.data.templateUrl !== null) {
                drawAreaView.setTemplate(event.data.templateUrl);
                drawAreaView.setDrawingActivated(true);
                chooseTemplateDialogView.hide();
            }
        });
    }

    setToolboxListener(instance) {
        toolboxView.addEventListener(EventKeys.COLOR_CHANGE_CLICK, (event) => drawAreaView.updateColor(event.data.color));
        toolboxView.addEventListener(EventKeys.PEN_RUBBER_SWITCH_CLICK, (event) => drawAreaView.switchPenRubber(event.data.item));
        toolboxView.addEventListener(EventKeys.SIZE_CHANGE_CLICK, (event) => drawAreaView.updateSize(event.data.size));
        toolboxView.addEventListener(EventKeys.CLEAR_CANVAS_CLICK, () => {
            let clearCanvasData = {
                channelId: instance.channel.channelId,
                isNewSketch: false,
                userRole: instance.user.currentChannelRole,
                multilayer: instance.channel.currentSketch.multilayer,
                creatorId: instance.channel.creatorId,

            };
            drawAreaController.emitClearCanvas(clearCanvasData);
        });
        toolboxView.addEventListener(EventKeys.UNDO_CLICK, () =>
            drawAreaController.emitUndoLine(instance.channel.channelId, instance.user.userId));
    }

    setDialogListener(instance) {
        //ChannelInfoDialog
        channelInfoDialogView.addEventListener(EventKeys.LEAVE_CHANNEL_CLICK, () => ChannelController.leaveChannel(instance.channel.channelId)
            .then(() => {
                channelInfoDialogView.toggleVisibility();
                window.location.reload();
            }));
        channelInfoDialogView.addEventListener(EventKeys.DELETE_CHANNEL_CLICK, () =>
            ChannelController.deleteChannel(instance.socket, instance.channel.channelId)
                .then(() => {
                    channelInfoDialogView.toggleVisibility();
                    window.location.reload();
                }));

        //CreateChannelAndSketchDialog
        createChannelDialogView.addEventListener(EventKeys.CREATE_CHANNEL_SUBMIT, (event) => ChannelController.createChannel(event.data)
            .then((channel) => {
                onCreateChannelDataLoaded(instance, channel);
            }));
        createChannelDialogView.addEventListener(EventKeys.JOIN_CHANNEL_SUBMIT, (event) => ChannelController.joinNewChannel(event.data.id)
            .then(() => {
                createChannelDialogView.clearAfterSubmit();
                window.location.reload();
            }));

        //CreateSketchDialog
        createSketchDialogView.addEventListener(EventKeys.CREATE_SKETCH_SUBMIT, onSketchCreateClick.bind(this, instance));

        //AdminSettingsDialog
        adminSettingsDialogView.addEventListener(EventKeys.SAVE_SETTINGS_CLICK, (event) => onSaveAdminSettingsLoaded(event));
      
        chooseTemplateDialogView.addEventListener(EventKeys.TEMPLATE_SELECTED, (event) => {
            drawAreaController.emitTemplate(instance.channel.channelId, event.data.url);
        });
    }

    setChannelTopAndRightBarListener(instance) {

        //LeftBar Channels
        channelListView.addEventListener(EventKeys.CHANNEL_ITEM_CLICK, (event) => ChannelController.fetchChannelData(event.data.url)
            .then((channel) => {
                onChannelDataForEnteringLoaded(instance, channel);
            }));

        channelListView.addEventListener(EventKeys.CHANNEL_ITEM_CREATE_CLICK, () => createChannelDialogView.toggleVisibility());

        //RightBar Members
        memberListView.addEventListener(EventKeys.MEMBER_ITEM_CLICK, (event) => MemberController.fetchMemberData(event.data.url).then((memberData) => {
            console.log(memberData);
        }));

        //RightBar Save/Publish/Export Buttons
        saveLoadView.addEventListener(EventKeys.SKETCH_SAVE_CLICK, () => SketchController.saveSketch(instance.socket, instance.channel.channelId).then(() => {
            saveLoadView.setSketchSaved();
        }));
        saveLoadView.addEventListener(EventKeys.SKETCH_FINALIZE_CLICK, () => {
            if (instance.user.currentChannelRole === Config.CHANNEL_ROLE_ADMIN) {
                createSketchDialogView.toggleVisibility();
            }
        });
        saveLoadView.addEventListener(EventKeys.SKETCH_EXPORT_CLICK, onSketchExportClick.bind(this));
        saveLoadView.addEventListener(EventKeys.IMPORT_TEMPLATE_CLICK, () => {
            drawAreaView.setDrawingActivated(false);
            chooseTemplateDialogView.toggleVisibility();
        });

        createSketchDialogView.addEventListener(EventKeys.CREATE_SKETCH_SUBMIT, onSketchCreateClick.bind(this, instance));

        //TopBar with SketchHistory
        topBarView.addEventListener(EventKeys.HISTORY_ITEM_CLICK, onHistoryItemClick.bind(this, instance));
        topBarView.addEventListener(EventKeys.FULLSCREEN_CLOSE_CLICK, onFullScreenCloseClick.bind(this));
        topBarView.addEventListener(EventKeys.PUBLISH_SKETCH_CLICK, onPublishSketchBtnClick.bind(this, instance));
    }

    onJoin(channel) {
        let instance = this;
        if (channel.channelName !== undefined) {
            this.channel = channel;

            drawAreaController.join(channel.channelId);
            drawAreaView.creatorId = channel.creatorId;
            drawAreaView.clearCanvas({
                isNewSketch: true,
                multilayer: channel.currentSketch.multilayer,
                userRole: this.user.currentChannelRole,
            });
            topBarView.clearSketchHistory();
            SketchController.loadHistory(channel.channelId).then((sketches) => {
                topBarView.addSketchHistory(sketches);
            });
        } else {
            ChannelController.fetchChannelData(Config.API_URL_CHANNEL + channel.channelId)
                .then((channel) => {
                    onChannelDataForEnteringLoaded(instance, channel);
                });
        }
    }

    onLeave() {
        this.socket.emit(SocketKeys.UNSUBSCRIBE, {channelId: this.channel.channelId});
    }

}

export default Dashboard;
