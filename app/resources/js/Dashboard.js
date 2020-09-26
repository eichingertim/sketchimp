import DrawAreaController from "./controller/DrawAreaController.js";
import DrawAreaView from "./ui/DrawAreaView.js";
import ToolboxView from "./ui/ToolboxView.js";
import MemberListView from "./ui/MemberListView.js";
import MemberController from "./controller/MemberController.js";
import ChannelListView from "./ui/ChannelListView.js";
import ChannelController from "./controller/ChannelController.js";
import ChannelInfoDialogView from "./ui/ChannelInfoDialogView.js";
import CreateChannelDialogView from "./ui/CreateChannelDialogView.js";
import SaveLoadView from "./ui/SaveLoadView.js";
import SketchController from "./controller/SketchController.js";
import CreateSketchDialogView from "./ui/CreateSketchDialogView.js";
import AdminSettingsDialogView from "./ui/AdminSettingsDialogView.js";
import {Config, EventKeys, SocketKeys} from "./utils/Config.js";

let drawAreaView, drawAreaController, toolboxView, memberListView, memberController,
    channelListView, channelController, channelInfoDialogView, createChannelDialogView,
    saveLoadView, sketchController, createSketchDialogView, adminSettingsDialogView;

function onChannelDataForEnteringLoaded(dashboard, event) {
    let realData = event.data.data;
    channelInfoDialogView.updateInfo(realData);
    document.querySelector(".channel-title").textContent = realData.name;
    memberListView.updateMembers(realData);

    if (dashboard.channelId === null) {
        dashboard.onJoin(realData.id);
    } else {
        dashboard.onLeave();
        dashboard.onJoin(realData.id);
    }
}

function onCreateChannelDataLoaded(dashboard, event) {
    channelListView.addNewChannel(event.data.data);
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
    console.log("Moin");
    createSketchDialogView.clearAfterSubmit();
    drawAreaController.emitClearCanvas();
}

function onMemberDataLoaded(data) {
    console.log(data);
}

function onSketchExportClick() {
    let base64Uri = drawAreaView.getStageAsBase64();
    sketchController.exportSketch(base64Uri, Config.DEFAULT_PNG_NAME);
    saveLoadView.setSketchExported();
}

function onSketchCreateClick(dashboard, data) {
    drawAreaView.getStageAsPNG().then(function(imageTarget) {
        let newSketchName = data.data.name;
        sketchController.finalizeSketch(dashboard.channelId, imageTarget.src, newSketchName);
    });

}

function onSaveAdminSettingsLoaded(event) {
    adminSettingsDialogView.hide();
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
        this.channelId = null;
        this.userId = userId;

        this.initUIAndController();
        this.setListeners();

        configureDivSizes();
        window.onresize = configureDivSizes;

        //Not yet in own classes
        document.querySelector(".channel-info-icon").addEventListener("click", function () {
            channelInfoDialogView.toggleVisibility();
        });

        //not yet in own classes
        document.querySelector(".admin-settings-icon").addEventListener("click", function() {
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
            adminSettingsDialog = document.querySelector(".admin-settings");

        drawAreaView = new DrawAreaView(container);
        drawAreaController = new DrawAreaController(this.socket, this.userId);
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
        adminSettingsDialogView = new AdminSettingsDialogView(adminSettingsDialog);
    }

    setListeners() {
        let instance = this;
        drawAreaController.addEventListener(EventKeys.LINE_DRAWN_RECEIVED, (event) => drawAreaView.addLine(event.data));
        drawAreaController.addEventListener(EventKeys.CLEAR_RECEIVED, () => drawAreaView.clearCanvas());
        drawAreaController.addEventListener(EventKeys.LINE_UNDO_RECEIVED, (event) => drawAreaView.undoLine(event.data));

        channelController.addEventListener(EventKeys.CHANNEL_DATA_LOADED, onChannelDataForEnteringLoaded.bind(this, instance));
        channelController.addEventListener(EventKeys.CREATED_CHANNEL_DATA_LOADED, onCreateChannelDataLoaded.bind(this, instance));
        channelController.addEventListener(EventKeys.LEAVE_CHANNEL_DATA_LOADED, onLeaveChannelDataLoaded.bind(this));
        channelController.addEventListener(EventKeys.JOIN_NEW_CHANNEL_DATA_LOADED, onJoinNewChannelDataLoaded.bind(this));

        memberController.addEventListener(EventKeys.DATA_OF_ONE_MEMBER_LOADED, onMemberDataLoaded.bind(this));

        sketchController.addEventListener(EventKeys.SKETCH_SAVED_IN_DB, () => saveLoadView.setSketchSaved());
        sketchController.addEventListener(EventKeys.FINALIZED_AND_CREATED_SKETCH, onCreateSketchDataLoaded.bind(this, instance));

        drawAreaView.addEventListener(EventKeys.LINE_READY_FOR_EMIT, (event) => drawAreaController.emitLine(event.data));

        toolboxView.addEventListener(EventKeys.COLOR_CHANGE_CLICK, (event) => drawAreaView.updateColor(event.data.color));
        toolboxView.addEventListener(EventKeys.PEN_RUBBER_SWITCH_CLICK, (event) => drawAreaView.switchPenRubber(event.data.item));
        toolboxView.addEventListener(EventKeys.SIZE_CHANGE_CLICK, (event) => drawAreaView.updateSize(event.data.size));
        toolboxView.addEventListener(EventKeys.CLEAR_CANVAS_CLICK, () => drawAreaController.emitClearCanvas());
        toolboxView.addEventListener(EventKeys.UNDO_CLICK, () => drawAreaController.undoLine());

        channelListView.addEventListener(EventKeys.CHANNEL_ITEM_CLICK, (event) => channelController.fetchChannelData(event.data.url));
        channelListView.addEventListener(EventKeys.CHANNEL_ITEM_CREATE_CLICK, () => createChannelDialogView.toggleVisibility());

        memberListView.addEventListener(EventKeys.MEMBER_ITEM_CLICK, (event) => memberController.fetchMemberData(event.url));

        channelInfoDialogView.addEventListener(EventKeys.LEAVE_CHANNEL_CLICK, (event) => channelController.leaveChannel(event.data.id));

        createChannelDialogView.addEventListener(EventKeys.CREATE_CHANNEL_SUBMIT, (event) => channelController.createChannel(event.data.name, event.data.sketchName));
        createChannelDialogView.addEventListener(EventKeys.JOIN_CHANNEL_SUBMIT, (event) => channelController.joinNewChannel(event.data.id));

        saveLoadView.addEventListener(EventKeys.SKETCH_SAVE_CLICK, () => sketchController.saveSketch(instance.channelId));
        saveLoadView.addEventListener(EventKeys.SKETCH_FINALIZE_CLICK, () => createSketchDialogView.toggleVisibility());
        saveLoadView.addEventListener(EventKeys.SKETCH_EXPORT_CLICK, onSketchExportClick.bind(this));

        createSketchDialogView.addEventListener(EventKeys.CREATE_SKETCH_SUBMIT, onSketchCreateClick.bind(this, instance));

        adminSettingsDialogView.addEventListener(EventKeys.SAVE_SETTINGS_CLICK, (event) => onSaveAdminSettingsLoaded(event));
    }

    onJoin(channelId) {
        this.channelId = channelId;
        drawAreaController.join(this.channelId);
        toolboxView.reset();
        drawAreaView.clearCanvas();
        sketchController.loadHistory();
    }

    onLeave() {
        this.socket.emit(SocketKeys.UNSUBSCRIBE, {channelId: this.channelId});
    }

}

export default Dashboard;
