import View from "../View.js";
import {Event} from "../../utils/Observable.js";
import {Config, EventKeys, SocketKeys} from "../../utils/Config.js";

function getMarkedAsAdminLine(drawAreaView) {

    if (drawAreaView.isMultiLayer) {
        return drawAreaView.currentUserRole === "admins";
    }
    return true;

}

function checkAndNotifyForDrawing(drawAreaView) {

    if (drawAreaView.mouse.click && drawAreaView.mouse.move && drawAreaView.mouse
        .posPrev) {

        let shouldMarkAsAdminLine = getMarkedAsAdminLine(drawAreaView),
            data = {
            mouse: drawAreaView.mouse,
            color: drawAreaView.context.strokeStyle,
            penRubber: drawAreaView.context.globalCompositeOperation,
            size: drawAreaView.context.lineWidth,
            adminLine: shouldMarkAsAdminLine,
        };
        drawAreaView.notifyAll(new EmitLineEvent(data));
        drawAreaView.mouse.move = false;
    }
    drawAreaView.mouse.posPrev = {
        x: drawAreaView.mouse.pos.x, y: drawAreaView
            .mouse.pos.y,
    };
}

function setMouseListener(drawAreaView) {
    drawAreaView.image.on("mousedown touchstart", function () {
        if (drawAreaView.isDrawingActivated && drawAreaView.currentUserRole !== "viewers") {
            drawAreaView.mouse.click = true;
        }
    });

    drawAreaView.stage.on("mouseup touchend", function () {
        if (drawAreaView.isDrawingActivated && drawAreaView.currentUserRole !== "viewers") {
            drawAreaView.mouse.click = false;
            drawAreaView.mouse.posPrev = false;
            drawAreaView.mouse.move = false;
        }
    });

    drawAreaView.stage.on("mousemove touchmove", function () {
        if (drawAreaView.isDrawingActivated && drawAreaView.currentUserRole !== "viewers") {
            drawAreaView.mouse.pos.x = drawAreaView.stage.getPointerPosition().x /
                drawAreaView.stage.width();
            drawAreaView.mouse.pos.y = drawAreaView.stage.getPointerPosition().y /
                drawAreaView.stage.height();
            drawAreaView.mouse.move = true;
            checkAndNotifyForDrawing(drawAreaView);
        }
    });
}

function clearAndSetupCollaboratorLayer(drawAreaView) {
    drawAreaView.layer.collaboratorLayer.destroyChildren();
    drawAreaView.image = new Konva.Image({
        image: drawAreaView.canvas,
        x: 0,
        y: 0,
    });
    drawAreaView.layer.collaboratorLayer.add(drawAreaView.image);
    drawAreaView.stage.draw();
}

function setupKonvaJS(drawAreaView, isMultiLayer) {
    drawAreaView.resizeViews();
    drawAreaView.isMultiLayer = isMultiLayer;

    // eslint-disable-next-line no-undef

    drawAreaView.layer.adminLayer = new Konva.Layer();
    if (drawAreaView.isMultiLayer) {
        drawAreaView.layer.collaboratorLayer = new Konva.Layer();
    }

    // eslint-disable-next-line no-undef
    drawAreaView.stage = new Konva.Stage({
        container: "container",
        width: Config.CANVAS_WIDTH,
        height: Config.CANVAS_HEIGHT,
    });
    drawAreaView.canvas = document.createElement("canvas");
    drawAreaView.canvas.width = Config.CANVAS_WIDTH;
    drawAreaView.canvas.height = Config.CANVAS_HEIGHT;
    drawAreaView.canvas.style.background = "#fffff";
    drawAreaView.stage.add(drawAreaView.layer.adminLayer);
    if (drawAreaView.isMultiLayer) {
        drawAreaView.stage.add(drawAreaView.layer.collaboratorLayer);
    }

    // eslint-disable-next-line no-undef
    drawAreaView.image = new Konva.Image({
        image: drawAreaView.canvas,
        x: 0,
        y: 0,
    });

    drawAreaView.layer.adminLayer.add(drawAreaView.image);

    if (drawAreaView.isMultiLayer) {
        drawAreaView.layer.collaboratorLayer.add(drawAreaView.image);
    }
    drawAreaView.stage.draw();

    drawAreaView.context = drawAreaView.canvas.getContext("2d");
    drawAreaView.context.strokeStyle = Config.DEFAULT_PEN_COLOR;
    drawAreaView.context.lineJoin = "round";
    drawAreaView.context.lineWidth = Config.DEFAULT_PEN_SIZE;
}

class EmitLineEvent extends Event {
    constructor(data) {
        super(EventKeys.LINE_READY_FOR_EMIT, data);
    }
}

class DrawAreaView extends View {
    constructor(el) {
        super();
        this.setElement(el);
        this.currentUserRole = "viewers";
        this.isDrawingActivated = true;
        this.isMultiLayer = false;
        this.creatorId = null;
        this.layer = {
            adminLayer: null,
            collaboratorLayer: null,
        };
        this.stage = null;
        this.canvas = null;
        this.image = null;
        this.context = null;
        this.mouse = {
            click: false,
            move: false,
            pos: {x: 0, y: 0},
            posPrev: false,
        };

        setupKonvaJS(this);
        setMouseListener(this);
    }

    setDrawingActivated(active) {
        this.isDrawingActivated = active;
    }

    getStageAsBase64() {
        if (this.stage !== undefined && this.stage !== null) {
            return this.stage.toDataURL({
                pixelRatio: 3,
            });
        }
        return null;
    }

    getStageAsPNG() {
        let instance = this;
        if (this.stage !== undefined && this.stage !== null) {
            return new Promise(
                function (resolve, reject) {
                    instance.stage.toImage({
                        callback: function (img) {
                            resolve(img);
                        },
                    });
                });

        }
        return null;
    }

    setUserRole(userRole) {
        this.currentUserRole = userRole;
    }

    updateColor(color) {
        this.context.strokeStyle = color;
    }

    updateSize(size) {
        this.context.lineWidth = size;
    }

    switchPenRubber(item) {
        if (item === "toolbox-pen") {
            this.context.globalCompositeOperation = Config.PEN_OPERATION;
        } else if (item === "toolbox-rubber") {
            this.context.globalCompositeOperation = Config.RUBBER_OPERATION;
        }
    }

    resizeViews() {
        let bigContainer = document.querySelector(".dashboard-canvas");

        if (bigContainer.offsetWidth > Config.CANVAS_WIDTH) {
            this.el.style.maxWidth = (Config.CANVAS_WIDTH + Config.CANVAS_SIZE_OFFSET).toString();
        } else {
            this.el.style.maxWidth = bigContainer.offsetWidth;
        }

        if (bigContainer.offsetHeight > Config.CANVAS_HEIGHT) {
            this.el.style.maxHeight = (Config.CANVAS_HEIGHT + Config.CANVAS_SIZE_OFFSET).toString();
        } else {
            this.el.style.maxHeight = bigContainer.offsetHeight;
        }
    }

    addLine(data) {
        let isAdminLine = data.adminLine;

        let newLine = new Konva.Line({
            points: [
                data.line[0].x * this.stage.width(),
                data.line[0].y * this.stage.height(),
                data.line[1].x * this.stage.width(),
                data.line[1].y * this.stage.height(),
            ],
            stroke: data.color,
            strokeWidth: data.size,
            lineCap: Config.DEFAULT_PEN_JOIN_CAP,
            lineJoin: Config.DEFAULT_PEN_JOIN_CAP,
            id: data.lineId,
            tension: 1.0,
            globalCompositeOperation: data.penRubber,
        });

        if (isAdminLine) {
            this.layer.adminLayer.add(newLine);
            this.layer.adminLayer.batchDraw();
        } else {
            this.layer.collaboratorLayer.add(newLine);
            this.layer.collaboratorLayer.batchDraw();
        }
    }

    undoLine(data) {
        for (let id of data) {
            let line = this.stage.findOne("#" + id);
            if (line !== undefined) {
                line.destroy();
            }
        }
        if (this.isMultiLayer) {
            this.layer.adminLayer.batchDraw();
            this.layer.collaboratorLayer.batchDraw();
        } else {
            this.layer.adminLayer.batchDraw();
        }
    }

    clearCanvas(data) {
        if ((data.sketchData !== null && data.sketchData !== undefined) || (data.userRole !== null && data.userRole === "admins")) {
            this.stage.destroyChildren();
            if (data.sketchData === undefined || data.sketchData === null) {
                setupKonvaJS(this, this.isMultiLayer);
            } else {
                setupKonvaJS(this, data.sketchData.multilayer);
            }

        } else if (data.userRole !== null && data.userRole === "collaborators") {
            clearAndSetupCollaboratorLayer(this);
        }

        setMouseListener(this);
    }
}

export default DrawAreaView;
