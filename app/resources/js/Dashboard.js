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
import {Config, EventKeys} from "./utils/Config.js";
import SketchModel from "./models/SketchModel.js";
import UserProfileDialogView from "./ui/dashboard/UserProfileDialogView.js";

let drawAreaView, drawAreaController, toolboxView, memberListView,
    channelListView, channelInfoDialogView, createChannelDialogView,
    saveLoadView, createSketchDialogView, adminSettingsDialogView, topBarView,
    chooseTemplateDialogView, userProfileDialogView;

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
    if (dashboard.channel === null) {
        dashboard.onJoin(channel);
    } else {
        dashboard.onLeave();
        dashboard.onJoin(channel);
    }
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
        if (event.data.name !== null) {
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
                        drawAreaController.emitNewSketch(dashboard.channel.channelId, newSketchData.id, newSketchData.name,
                            newSketchData.multilayer);
                        drawAreaView.setDrawingActivated(true);
                        loadSketchHistory(dashboard.channel.channelId);
                    }).catch(error => {
                    topBarView.showAlert(error);
                });
            });
        } else {
            topBarView.showAlert("Fields should not be empty");
        }
    } else {
        topBarView.showAlert("You are not an admin");
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
 * Fetches data of channel that is passed as url
 * @param dashboard current instance of dashboard
 * @param url channels GET url
 */
function fetchChannelData(dashboard, url) {
    ChannelController.fetchChannelData(url)
        .then((channel) => {
            onChannelDataForEnteringLoaded(dashboard, channel);
        }).catch(error => {
        topBarView.showAlert(error);
    });
}

/**
 * loads the sketch-history and tells the topBarView to update
 * @param channelId current channelId
 */
function loadSketchHistory(channelId) {
    SketchController.loadHistory(channelId).then((sketches) => {
        topBarView.clearSketchHistory();
        topBarView.addSketchHistory(sketches);
    }).catch(error => {
        topBarView.showAlert(error);
    });
}

/**
 * publishes current sketch-history sketch in fullscreen
 * @param dashboard current dashboard instance
 * @param event current event
 */
function onPublishSketchBtnClick(dashboard, event) {
    let sketchId = event.data.sketchId;
    SketchController.publishSketch(sketchId).then(() => {
        topBarView.finishedPublishing();
        loadSketchHistory(dashboard.channel.channelId);
    }).catch(error => {
        topBarView.showAlert(error);
    });
}

/**
 * Starts process to save new channel settings set by the admin
 * @param dashboard current dashboard instance
 */
function onSaveAdminSettingsClicked(dashboard) {
    const settings = adminSettingsDialogView.getSettings();
    ChannelController.saveAdminSettings(settings).then(() => {
        drawAreaController.emitAdminSettingsChanged(dashboard.channel.channelId);
        drawAreaView.setDrawingActivated(true);
        adminSettingsDialogView.hide();
    }).catch(error => {
        topBarView.showAlert(error);
    });
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

    userProfileDialogView.hide();
    drawAreaView.resizeViews();
}

/**
 * Main Point of the application -> Here controllers communicate with views and views communicate with controllers
 */
class Dashboard {
    constructor(socket, userId) {

        this.socket = socket;

        this.channel = null;
        this.user = new UserModel(userId, null, Config.CHANNEL_ROLE_VIEWER);

        this.initUIAndController();
        this.setListeners();

        configureDivSizes();
        window.onresize = configureDivSizes;
    }

    /**
     * Initializes all views of the dashboard
     */
    initUIAndController() {
        const container = document.querySelector("#container"),
            toolbox = document.querySelector(".dashboard-toolbox-container"),
            channelList = document.querySelector(".sidebar-menu"),
            memberList = document.querySelector(".member-list"),
            channelInfoDialog = document.querySelector(".info-container"),
            createChannelDialog = document.querySelector(".create-channel-container"),
            saveLoad = document.querySelector(".container-load-and-publish"),
            createSketchDialog = document.querySelector(".create-sketch-container"),
            adminSettingsDialog = document.querySelector(".admin-settings-container"),
            topBar = document.querySelector(".container-top-bar-history-inner"),
            templateDialog = document.querySelector(".choose-template-container"),
            userProfileDialog = document.querySelector(".modal-user-profile");

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
        userProfileDialogView = new UserProfileDialogView(userProfileDialog);

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
        window.addEventListener("click", () => {
            userProfileDialogView.hide();
        });
    }

    /**
     * Registers listeners on drawAreaView and drawAreaController
     * @param instance current dashboard instance
     */
    setDrawAreaListener(instance) {
        drawAreaView.addEventListener(EventKeys.LINE_READY_FOR_EMIT, onLineEmit.bind(this, instance));
        drawAreaController.addEventListener(EventKeys.LINE_DRAWN_RECEIVED, (event) =>
            drawAreaView.addLine(event.data));
        drawAreaController.addEventListener(EventKeys.CLEAR_RECEIVED, (event) => {
            toolboxView.reset();
            drawAreaView.clearCanvas(event.data);
        });
        drawAreaController.addEventListener(EventKeys.LINE_UNDO_RECEIVED, (event) =>
            drawAreaView.undoLine(event.data, instance.channel.currentSketch.multilayer));
        drawAreaController.addEventListener(EventKeys.NEW_SKETCH_RECEIVED, (event) => {
            instance.channel.currentSketch = new SketchModel(event.data.sketchId, event.data.sketchName,
                event.data.sketchMultiLayer);
            loadSketchHistory(instance.channel.channelId);
        });
        drawAreaController.addEventListener(EventKeys.TEMPLATE_RECEIVED, (event) => {
            if (event.data.templateUrl !== null) {
                drawAreaView.setTemplate(event.data.templateUrl);
                drawAreaView.setDrawingActivated(true);
                chooseTemplateDialogView.hide();
            }
        });
        drawAreaController.addEventListener(EventKeys.ACTIVE_USER_RECEIVED, (event) => {
            ChannelController.fetchChannelData(Config.API_URLS.CHANNEL + event.data.channelId)
                .then((channel) => {
                if (instance.channel.members.length !== channel.members.length) {
                    instance.channel.members = channel.members;
                    memberListView.updateMembers(instance.channel);
                    memberListView.updateActiveState(event.data);
                } else {
                    memberListView.updateActiveState(event.data);
                }
            });

        });
        drawAreaController.addEventListener(EventKeys.DELETE_CHANNEL, (event) => {
            let userId = event.data.userId;
            if (instance.user.userId !== userId) {
                window.location.reload();
            }
        });
    }

    /**
     * registers listeners for the toolboxview
     * @param instance current dashboard instance
     */
    setToolboxListener(instance) {
        toolboxView.addEventListener(EventKeys.COLOR_CHANGE_CLICK, (event) =>
            drawAreaView.updateColor(event.data.color));
        toolboxView.addEventListener(EventKeys.PEN_RUBBER_SWITCH_CLICK, (event) =>
            drawAreaView.switchPenRubber(event.data.item));
        toolboxView.addEventListener(EventKeys.SIZE_CHANGE_CLICK, (event) =>
            drawAreaView.updateSize(event.data.size));
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

    /**
     * sets listeners for all dialogs of the application
     * @param instance current dashboard instance
     */
    setDialogListener(instance) {
        //ChannelInfoDialog
        channelInfoDialogView.addEventListener(EventKeys.LEAVE_CHANNEL_CLICK, () =>
            ChannelController.leaveChannel(instance.channel.channelId)
                .then(() => {
                    channelInfoDialogView.hide();
                    drawAreaView.setDrawingActivated(true);
                    window.location.reload();
                }).catch(error => {
                topBarView.showAlert(error);
            }));
        channelInfoDialogView.addEventListener(EventKeys.DELETE_CHANNEL_CLICK, () =>
            ChannelController.deleteChannel(instance.socket, instance.channel.channelId, instance.user.userId)
                .then((data) => {
                    if (data && data.channelId) {
                        channelInfoDialogView.hide();
                        drawAreaView.setDrawingActivated(true);
                        channelListView.removeChannel(data.channelId);
                        fetchChannelData(instance, Config.API_URLS.CHANNEL + data.channelId);
                    } else {
                        window.location.reload();
                    }
                }).catch(error => {
                    topBarView.showAlert(error);
                })
            );
        channelInfoDialogView.addEventListener(EventKeys.CLOSE_INFO_DIALOG, () => {
            channelInfoDialogView.hide();
            drawAreaView.setDrawingActivated(true);
        });

        channelInfoDialogView.addEventListener(EventKeys.UPLOAD_CHANNEL_ICON, (event) => {
            ChannelController.uploadChannelIcon(event.data.form).then(() => {
                window.location.reload();
            }).catch(error => {
                topBarView.showAlert(error);
            });
        });

        //CreateChannelAndSketchDialog
        createChannelDialogView.addEventListener(EventKeys.CREATE_CHANNEL_SUBMIT, (event) => {
            if (event.data.name !== null) {
                ChannelController.createChannel(event.data)
                    .then((channel) => {
                        onCreateChannelDataLoaded(instance, channel);
                    }).catch(error => {
                    topBarView.showAlert(error);
                });
            } else {
                topBarView.showAlert("Fields should not be empty");
            }

        });
        createChannelDialogView.addEventListener(EventKeys.CLOSE_CREATE_CHANNEL_DIALOG, () => {
            createChannelDialogView.hide();
            drawAreaView.setDrawingActivated(true);
        });

        //CreateSketchDialog
        createSketchDialogView.addEventListener(EventKeys.CREATE_SKETCH_SUBMIT,
            onSketchCreateClick.bind(this, instance));
        createSketchDialogView.addEventListener(EventKeys.CLOSE_CREATE_SKETCH_DIALOG, () => {
            createSketchDialogView.hide();
            drawAreaView.setDrawingActivated(true);
        });

        //AdminSettingsDialog
        adminSettingsDialogView.addEventListener(EventKeys.SAVE_SETTINGS_CLICK, () =>
            onSaveAdminSettingsClicked(instance));
        adminSettingsDialogView.addEventListener(EventKeys.CLOSE_ADMIN_DIALOG, () => {
            adminSettingsDialogView.hide();
            drawAreaView.setDrawingActivated(true);
        });
        adminSettingsDialogView.addEventListener(EventKeys.MEMBER_KICK_CLICK, (event) => {
            ChannelController.kickMember(event.data.memberId, event.data.channelId).then(() => {
                drawAreaController.emitAdminSettingsChanged(event.data.channelId);
            }).catch(error => {
                topBarView.showAlert(error);
            });
        });

        chooseTemplateDialogView.addEventListener(EventKeys.TEMPLATE_SELECTED, (event) => {
            drawAreaController.emitTemplate(instance.channel.channelId, event.data.url);
        });
    }

    /**
     * Sets listener for top and right bar of the dashboard
     * @param instance current dashboard instance
     */
    setChannelTopAndRightBarListener(instance) {

        //LeftBar Channels
        channelListView.addEventListener(EventKeys.CHANNEL_ITEM_CLICK, (event) =>
            fetchChannelData(instance, event.data.url));
        channelListView.addEventListener(EventKeys.CHANNEL_ITEM_CREATE_CLICK, () => {
            drawAreaView.setDrawingActivated(false);
            createChannelDialogView.show();
        });

        //RightBar Members
        memberListView.addEventListener(EventKeys.MEMBER_ITEM_CLICK, (event) => {
            let eventType = event.data.data.type;
            if (eventType === "mouseover") {
                MemberController.fetchMemberData(event.data.data.target.id).then((memberData) => {
                    let clickedMemberTarget = event.data.data.target;
                    userProfileDialogView.adjustPositionProperties(clickedMemberTarget);
                    userProfileDialogView.fillWithData(memberData, instance.user.userId);
                    userProfileDialogView.show();
                }).catch(error => {
                    topBarView.showAlert(error);
                });
            } else {
                userProfileDialogView.hide();
            }
        });

        //RightBar Save/Publish/Export Buttons
        saveLoadView.addEventListener(EventKeys.SKETCH_SAVE_CLICK, () =>
            SketchController.saveSketch(instance.socket, instance.channel.channelId).then(() => {
                saveLoadView.setSketchSaved();
            }).catch(error => {
                topBarView.showAlert(error);
            }));
        saveLoadView.addEventListener(EventKeys.SKETCH_FINALIZE_CLICK, () => {
            if (instance.user.currentChannelRole === Config.CHANNEL_ROLE_ADMIN) {
                drawAreaView.setDrawingActivated(false);
                createSketchDialogView.show();
            }
        });
        saveLoadView.addEventListener(EventKeys.SKETCH_EXPORT_CLICK, onSketchExportClick.bind(this));
        saveLoadView.addEventListener(EventKeys.IMPORT_TEMPLATE_CLICK, () => {
            drawAreaView.setDrawingActivated(false);
            chooseTemplateDialogView.show();
        });

        //TopBar with SketchHistory
        topBarView.addEventListener(EventKeys.HISTORY_ITEM_CLICK, onHistoryItemClick.bind(this, instance));
        topBarView.addEventListener(EventKeys.FULLSCREEN_CLOSE_CLICK, onFullScreenCloseClick.bind(this));
        topBarView.addEventListener(EventKeys.PUBLISH_SKETCH_CLICK, onPublishSketchBtnClick.bind(this, instance));
        topBarView.addEventListener(EventKeys.CHANNEL_INFO_CLICK, () => {
            drawAreaView.setDrawingActivated(false);
            channelInfoDialogView.show();
        });
        topBarView.addEventListener(EventKeys.ADMIN_SETTINGS_CLICK, () => {
            drawAreaView.setDrawingActivated(false);
            adminSettingsDialogView.updateValues(instance.channel, instance.user);
            adminSettingsDialogView.show();
        });
    }

    /**
     * gets called when the user joins a new channel
     * @param channel data of the new channel
     */
    onJoin(channel) {
        if (channel.channelName !== undefined) {
            this.channel = channel;
            memberListView.updateMembers(channel);
            topBarView.updateChannelName(channel.channelName);
            topBarView.updateRoleVisibility(this.user.currentChannelRole);
            adminSettingsDialogView.setSettings(channel);
            drawAreaController.join(channel.channelId, this.user.userId);
            drawAreaView.creatorId = channel.creatorId;
            drawAreaView.clearCanvas({
                isNewSketch: true,
                multilayer: channel.currentSketch.multilayer,
                userRole: this.user.currentChannelRole,
            });
            drawAreaView.setDrawingActivated(true);
            toolboxView.reset();
            loadSketchHistory(channel.channelId);

        } else {
            fetchChannelData(this, Config.API_URLS.CHANNEL + channel.channelId);
        }
    }

    /**
     * gets called when the user switches a channel
     */
    onLeave() {
        drawAreaController.emitLeaveChannel(this.channel.channelId, this.user.userId);
    }

}

export default Dashboard;
