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
import TopBarView from "./ui/dashboard/TopBarView.js";
import UserModel from "./models/UserModel.js";
import {Config, EventKeys, SocketKeys} from "./utils/Config.js";

let drawAreaView, drawAreaController, toolboxView, memberListView, memberController,
    channelListView, channelController, channelInfoDialogView, createChannelDialogView,
    saveLoadView, sketchController, createSketchDialogView, topBarView;

function onChannelDataForEnteringLoaded(dashboard, event) {
    let channel = event.data.channel;

    if (channel.creatorId === dashboard.user.userId) {
        dashboard.user.currentChannelRole = Config.CHANNEL_ROLE_ADMIN;
    } else {
        channel.members.forEach(member => {
            if (member.id === dashboard.user.userId) {
                dashboard.user.currentChannelRole = member.role;
            }
        });
    }

    channelInfoDialogView.updateInfo(channel);

    document.querySelector(".channel-title").textContent = channel.channelName;

    memberListView.updateMembers(channel.members);

    if (dashboard.channel === null) {
        dashboard.onJoin(channel);
    } else {
        dashboard.onLeave();
        dashboard.onJoin(channel);
    }
}

function onCreateChannelDataLoaded(dashboard, event) {
    let channelData = event.data.data;

    channelListView.addNewChannel(channelData);
    createChannelDialogView.clearAfterSubmit();
    onChannelDataForEnteringLoaded(dashboard, event);
}

function onLeaveChannelDataLoaded() {
    channelInfoDialogView.toggleVisibility();
    window.location.reload();
}

function onJoinNewChannelDataLoaded() {
    createChannelDialogView.clearAfterSubmit();
    window.location.reload();
}

/*
 * Member Event Methods
 */

function onCreateSketchDataLoaded(dashboard, event) {
    let sketchData = event.data.data;

    createSketchDialogView.clearAfterSubmit();
    drawAreaController.emitClearCanvas(null, sketchData, null, null);
    topBarView.clearSketchHistory();
    sketchController.loadHistory(dashboard.channel.channelId);
}

function onMemberDataLoaded(data) {
    console.log(data);
}

function onSketchExportClick() {
    let base64Uri = drawAreaView.getStageAsBase64();
    sketchController.exportSketch(base64Uri, Config.DEFAULT_PNG_NAME);
    saveLoadView.setSketchExported();
}

function onSketchCreateClick(dashboard, event) {
    drawAreaView.getStageAsPNG().then(function (imageTarget) {
        let newSketchName = event.data.name,
            isMultiLayer = event.data.isMultiLayer;
        sketchController.finalizeSketch(dashboard.channel.channelId, imageTarget.src, newSketchName, isMultiLayer);
    });
}

function onHistoryItemClick(dashboard, event) {
    drawAreaView.setDrawingActivated(false);
    topBarView.showImageFullscreen(event.data);
}

function onSketchHistoryLoaded(event) {
    let sketches = event.data.sketches;
    topBarView.addSketchHistory(sketches);
}

function onFullScreenCloseClick() {
    topBarView.closeFullScreen();
    drawAreaView.setDrawingActivated(true);
}

function onPublishSketchBtnClick(event) {
    let sketchId = event.data.sketchId;
    sketchController.publishSketch(sketchId);
}

function configureDivSizes() {
    let mainContent = document.querySelector(".dashboard-main-content-container"),
        canvasContainer = document.querySelector(".dashboard-canvas"),
        leftBar = document.querySelector(".channels-container-outer"),
        memberBar = document.querySelector(".container-member-toolbox"),
        topAppBar = document.querySelector(".container-top-bar-history-outer");
    mainContent.style.maxWidth = "" + (window.innerWidth - leftBar.offsetWidth - memberBar.offsetWidth);
    canvasContainer.style.maxHeight = "" + (window.innerHeight - topAppBar.offsetHeight);

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
            topBar = document.querySelector(".container-top-bar-history-inner");

        drawAreaView = new DrawAreaView(container);
        drawAreaController = new DrawAreaController(this.socket, this.user.userId);
        toolboxView = new ToolboxView(toolbox);
        memberListView = new MemberListView(memberList);
        memberController = new MemberController();
        channelListView = new ChannelListView(channelList);
        channelController = new ChannelController();
        channelInfoDialogView = new ChannelInfoDialogView(channelInfoDialog);
        createChannelDialogView = new CreateChannelDialogView(createChannelDialog);
        saveLoadView = new SaveLoadView(saveLoad);
        sketchController = new SketchController(this.socket);
        createSketchDialogView = new CreateSketchDialogView(createSketchDialog);
        topBarView = new TopBarView(topBar);
    }

    setListeners() {
        let instance = this;
        drawAreaController.addEventListener(EventKeys.LINE_DRAWN_RECEIVED, (event) => drawAreaView.addLine(event.data));
        drawAreaController.addEventListener(EventKeys.CLEAR_RECEIVED, (event) => drawAreaView.clearCanvas(event.data));
        drawAreaController.addEventListener(EventKeys.LINE_UNDO_RECEIVED, (event) => drawAreaView.undoLine(event.data));

        channelController.addEventListener(EventKeys.CHANNEL_DATA_LOADED, onChannelDataForEnteringLoaded.bind(this, instance));
        channelController.addEventListener(EventKeys.CREATED_CHANNEL_DATA_LOADED, onCreateChannelDataLoaded.bind(this, instance));
        channelController.addEventListener(EventKeys.LEAVE_CHANNEL_DATA_LOADED, onLeaveChannelDataLoaded.bind(this));
        channelController.addEventListener(EventKeys.JOIN_NEW_CHANNEL_DATA_LOADED, onJoinNewChannelDataLoaded.bind(this));

        memberController.addEventListener(EventKeys.DATA_OF_ONE_MEMBER_LOADED, onMemberDataLoaded.bind(this));

        sketchController.addEventListener(EventKeys.SKETCH_SAVED_IN_DB, () => saveLoadView.setSketchSaved());
        sketchController.addEventListener(EventKeys.FINALIZED_AND_CREATED_SKETCH, onCreateSketchDataLoaded.bind(this, instance));
        sketchController.addEventListener(EventKeys.LOADED_SKETCH_HISTORY_FOR_CHANNEL, onSketchHistoryLoaded.bind(this));
        sketchController.addEventListener(EventKeys.PUBLISH_SKETCH_FINISHED, () => {
            topBarView.finishedPublishing();
            topBarView.clearSketchHistory();
            sketchController.loadHistory(instance.channel.channelId);
        });

        drawAreaView.addEventListener(EventKeys.LINE_READY_FOR_EMIT, (event) => drawAreaController.emitLine(event.data));

        toolboxView.addEventListener(EventKeys.COLOR_CHANGE_CLICK, (event) => drawAreaView.updateColor(event.data.color));
        toolboxView.addEventListener(EventKeys.PEN_RUBBER_SWITCH_CLICK, (event) => drawAreaView.switchPenRubber(event.data.item));
        toolboxView.addEventListener(EventKeys.SIZE_CHANGE_CLICK, (event) => drawAreaView.updateSize(event.data.size));

        toolboxView.addEventListener(EventKeys.CLEAR_CANVAS_CLICK, () => {
            drawAreaController.emitClearCanvas(this.user.currentChannelRole, null, this.channel.currentSketch.isMultiLayer, this.channel.creatorId);
        });
        toolboxView.addEventListener(EventKeys.UNDO_CLICK, () => drawAreaController.undoLine());

        channelListView.addEventListener(EventKeys.CHANNEL_ITEM_CLICK, (event) => channelController.fetchChannelData(event.data.url));
        channelListView.addEventListener(EventKeys.CHANNEL_ITEM_CREATE_CLICK, () => createChannelDialogView.toggleVisibility());

        memberListView.addEventListener(EventKeys.MEMBER_ITEM_CLICK, (event) => memberController.fetchMemberData(event.url));

        channelInfoDialogView.addEventListener(EventKeys.LEAVE_CHANNEL_CLICK, (event) => channelController.leaveChannel(event.data.id));

        createChannelDialogView.addEventListener(EventKeys.CREATE_CHANNEL_SUBMIT, (event) => channelController.createChannel(event.data));
        createChannelDialogView.addEventListener(EventKeys.JOIN_CHANNEL_SUBMIT, (event) => channelController.joinNewChannel(event.data.id));

        saveLoadView.addEventListener(EventKeys.SKETCH_SAVE_CLICK, () => sketchController.saveSketch(instance.channel.channelId));
        saveLoadView.addEventListener(EventKeys.SKETCH_FINALIZE_CLICK, () => createSketchDialogView.toggleVisibility());
        saveLoadView.addEventListener(EventKeys.SKETCH_EXPORT_CLICK, onSketchExportClick.bind(this));

        createSketchDialogView.addEventListener(EventKeys.CREATE_SKETCH_SUBMIT, onSketchCreateClick.bind(this, instance));

        topBarView.addEventListener(EventKeys.HISTORY_ITEM_CLICK, onHistoryItemClick.bind(this, instance));
        topBarView.addEventListener(EventKeys.FULLSCREEN_CLOSE_CLICK, onFullScreenCloseClick.bind(this));
        topBarView.addEventListener(EventKeys.PUBLISH_SKETCH_CLICK, onPublishSketchBtnClick.bind(this));
    }

    onJoin(channel) {
        if (channel.channelName !== undefined) {
            this.channel = channel;
            drawAreaController.join(channel.channelId);
            drawAreaView.creatorId = channel.creatorId;
            drawAreaView.isMultiLayer = channel.multilayer;
            drawAreaView.currentUserRole = this.user.currentChannelRole;
            drawAreaView.clearCanvas({sketchData: channel.currentSketch, userRole: this.user.currentChannelRole});
            topBarView.clearSketchHistory();
            sketchController.loadHistory(channel.channelId);
        } else {
            channelController.fetchChannelData("/api/channel/" + channel.channelId);
        }
    }

    onLeave() {
        this.socket.emit(SocketKeys.UNSUBSCRIBE, {channelId: this.channel.channelId});
    }

}

export default Dashboard;
