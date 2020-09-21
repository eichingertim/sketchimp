import DrawAreaController from "./controller/DrawAreaController.js";
import DrawAreaView from "./ui/DrawAreaView.js";
import ToolboxView from "./ui/ToolboxView.js";
import MemberListView from "./ui/MemberListView.js";
import MemberController from "./controller/MemberController.js";
import ChannelListView from "./ui/ChannelListView.js";
import ChannelController from "./controller/ChannelController.js";
import ChannelInfoDialogView from "./ui/ChannelInfoDialogView.js";
import CreateChannelDialogView from "./ui/CreateChannelDialogView.js";

let drawAreaView,
    drawAreaController,
    toolboxView,
    memberListView,
    memberController,
    channelListView,
    channelController,
    channelInfoDialogView,
    createChannelDialogView;

function onLineDrawn(data) {
    drawAreaView.addLine(data.data);
}

function onLineUndo(data) {
    drawAreaView.undoLine(data.data);
}

function onLineShouldBeEmitted(data) {
    drawAreaController.emitLine(data.data);
}

function onColorChanged(data) {
    drawAreaView.updateColor(data.data.color);
}

function onSizeChanged(data) {
    drawAreaView.updateSize(data.data.size);
}

function onPenRubberSwitch(data) {
    drawAreaView.switchPenRubber(data.data.item);
}

function onDeleteForever(data) {
    drawAreaController.emitClearCanvas();
}

function onUndo(data) {
    drawAreaController.undoLine();
}

function onShouldClearCanvas(data) {
    drawAreaView.clearCanvas();
}

function onJoinServerClick() {
    createChannelDialogView.toggleVisibility();
}

function onChannelItemClick(data) {
    channelController.fetchChannelData(data.data.url);
}

function onChannelDataLoaded(dashboard, data) {
    let realData = data.data.data;
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

function onCreateChannelDataLoaded(data) {
    channelListView.addNewChannel(data.data.data);
    createChannelDialogView.clearAfterSubmit();
}

function onMemberItemClick(data) {
    memberController.fetchMemberData(data.url);
}

function onMemberDataLoaded(data) {

}

function onLeaveChannelClick (data) {
    channelController.leaveChannel(data.data.id);
}

function onLeaveChannelDataLoaded() {
    channelInfoDialogView.toggleVisibility();
    window.location.reload();
}

function onChannelCreateSubmit(data) {
    channelController.createChannel(data.data.name);
}

class Dashboard {
    constructor(socket) {
        let instance = this;

        const container = document.querySelector("#container"),
            toolbox = document.querySelector(".dashboard-toolbox-container"),
            channelList = document.querySelector(".sidebar-menu"),
            memberList = document.querySelector(".member-list"),
            channelInfoDialog = document.querySelector(".info-container"),
            createChannelDialog = document.querySelector(".create-channel-container");

        this.socket = socket;
        this.channelId = null;
        this.userId = null;

        drawAreaView = new DrawAreaView(container);
        drawAreaController = new DrawAreaController(socket);
        toolboxView = new ToolboxView(toolbox);
        memberListView = new MemberListView(memberList);
        memberController = new MemberController();
        channelListView = new ChannelListView(channelList);
        channelController = new ChannelController();
        channelInfoDialogView = new ChannelInfoDialogView(channelInfoDialog);
        createChannelDialogView = new CreateChannelDialogView(createChannelDialog);

        drawAreaController.addEventListener("LineDrawn", onLineDrawn.bind(this));
        drawAreaController.addEventListener("ClearCanvas", onShouldClearCanvas.bind(this));
        drawAreaController.addEventListener("LineUndo", onLineUndo.bind(this));

        channelController.addEventListener("ChannelDataLoaded", onChannelDataLoaded.bind(this, instance));
        channelController.addEventListener("CreateChannelDataLoaded", onCreateChannelDataLoaded.bind(this));
        channelController.addEventListener("LeaveChannelDataLoaded", onLeaveChannelDataLoaded.bind(this));

        memberController.addEventListener("MemberDataLoaded", onMemberDataLoaded.bind(this));

        drawAreaView.addEventListener("EmitLine", onLineShouldBeEmitted.bind(this));

        toolboxView.addEventListener("ColorChange", onColorChanged.bind(this));
        toolboxView.addEventListener("PenRubberSwitch", onPenRubberSwitch.bind(this));
        toolboxView.addEventListener("SizeChange", onSizeChanged.bind(this));
        toolboxView.addEventListener("DeleteForever", onDeleteForever.bind(this));
        toolboxView.addEventListener("Undo", onUndo.bind(this));

        channelListView.addEventListener("ChannelItemClick", onChannelItemClick.bind(this));
        channelListView.addEventListener("JoinServerClick", onJoinServerClick.bind(this));

        memberListView.addEventListener("MemberItemClick", onMemberItemClick.bind(this));

        channelInfoDialogView.addEventListener("LeaveChannelClick", onLeaveChannelClick.bind(this));

        createChannelDialogView.addEventListener("CreateChannel", onChannelCreateSubmit.bind(this));

        //Not yet in own classes
        document.querySelector(".channel-info-icon").addEventListener("click", function() {
            channelInfoDialogView.toggleVisibility();
        });
    }

    onJoin(channelId) {
        this.channelId = channelId;
        drawAreaController.join(this.channelId);
        drawAreaView.clearCanvas();
    }

    onLeave() {
        this.socket.emit("unsubscribe", {channelId: this.channelId});
    }

    resizeElements() {
        drawAreaView.fitWindow();
    }

}

export default Dashboard;
