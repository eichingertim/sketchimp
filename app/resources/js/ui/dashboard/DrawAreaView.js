/* global Konva */

import View from "../View.js";
import {Event} from "../../utils/Observable.js";
import {Config, EventKeys} from "../../utils/Config.js";

class EmitLineEvent extends Event {
    constructor(data) {
        super(EventKeys.LINE_READY_FOR_EMIT, data);
    }
}

/**
 * Checks if the current mouse-data is valid for a line to be emitted
 * @param drawAreaView current instance of view
 */
function checkAndNotifyForDrawing(drawAreaView) {
    if (drawAreaView.mouse.click && drawAreaView.mouse.move && drawAreaView.mouse
        .posPrev) {

        let data = {
            mouse: drawAreaView.mouse,
            color: drawAreaView.context.strokeStyle,
            penRubber: drawAreaView.context.globalCompositeOperation,
            size: drawAreaView.context.lineWidth,
        };
        drawAreaView.notifyAll(new EmitLineEvent(data));
        drawAreaView.mouse.move = false;
    }
    drawAreaView.mouse.posPrev = {
        x: drawAreaView.mouse.pos.x, y: drawAreaView
            .mouse.pos.y,
    };
}

/**
 * Sets the listener for mouse or touch interaction with the canvas stage
 * @param drawAreaView current instance of view
 */
function setMouseListener(drawAreaView) {
    drawAreaView.stage.on("mousedown touchstart", function () {
        if (drawAreaView.isDrawingActivated) {
            drawAreaView.mouse.click = true;
        }
    }, { passive: true} );

    drawAreaView.stage.on("mouseup touchend", function () {
        if (drawAreaView.isDrawingActivated) {
            drawAreaView.mouse.click = false;
            drawAreaView.mouse.posPrev = false;
            drawAreaView.mouse.move = false;
        }
    }, { passive: true});

    drawAreaView.stage.on("mousemove touchmove", function () {
        if (drawAreaView.isDrawingActivated) {
            drawAreaView.mouse.pos.x = drawAreaView.stage.getPointerPosition().x /
                drawAreaView.stage.width();
            drawAreaView.mouse.pos.y = drawAreaView.stage.getPointerPosition().y /
                drawAreaView.stage.height();
            drawAreaView.mouse.move = true;
            checkAndNotifyForDrawing(drawAreaView);
        }
    }, { passive: true});
}

/**
 * clears and resets the collaborator stage
 * @param drawAreaView current instance of view
 */
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

/**
 * Sets up the complete Konva.js elements (stage, layers, and images)
 * Handles additionally if the current sketch has one or separate layer for admin and collaborators
 * @param drawAreaView current instance of view
 * @param isMultiLayer bool if current sketch has multilayer activated
 */
function setupKonvaJS(drawAreaView, isMultiLayer) {
    drawAreaView.resizeViews();

    drawAreaView.layer.backgroundLayer = new Konva.Layer();
    if (isMultiLayer) {
        drawAreaView.layer.collaboratorLayer = new Konva.Layer();
    } else {
        drawAreaView.layer.collaboratorLayer = null;
    }
    drawAreaView.layer.adminLayer = new Konva.Layer();

    drawAreaView.stage = new Konva.Stage({
        container: "container",
        width: Config.CANVAS_WIDTH,
        height: Config.CANVAS_HEIGHT,
    });
    drawAreaView.canvas = document.createElement("canvas");
    drawAreaView.canvas.width = Config.CANVAS_WIDTH;
    drawAreaView.canvas.height = Config.CANVAS_HEIGHT;
    drawAreaView.canvas.style.background = "#fffff";
    drawAreaView.stage.add(drawAreaView.layer.backgroundLayer);
    drawAreaView.stage.add(drawAreaView.layer.adminLayer);
    if (isMultiLayer) {
        drawAreaView.stage.add(drawAreaView.layer.collaboratorLayer);
    }

    drawAreaView.image = new Konva.Image({
        image: drawAreaView.canvas,
        x: 0,
        y: 0,
    });

    drawAreaView.layer.adminLayer.add(drawAreaView.image);

    if (isMultiLayer) {
        drawAreaView.layer.collaboratorLayer.add(drawAreaView.image);
    }
    drawAreaView.stage.draw();

    drawAreaView.context = drawAreaView.canvas.getContext("2d");
    drawAreaView.context.strokeStyle = Config.DEFAULT_PEN_COLOR;
    drawAreaView.context.lineJoin = "round";
    drawAreaView.context.lineWidth = Config.DEFAULT_PEN_SIZE;
}

/**
 * Represents the canvas where the channel-members can draw
 */
class DrawAreaView extends View {
    constructor(el) {
        super();
        this.setElement(el);
        this.isDrawingActivated = true;
        this.layer = {
            adminLayer: null,
            collaboratorLayer: null,
            backgroundLayer: null,
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

    /**
     * fills the background with a passed template
     * @param url template url that should be iserted
     */
    setTemplate(url) {
        let instance = this;
        Konva.Image.fromURL(url, function (node) {
            node.setAttrs({
                x: 0,
                y: 0,
            });
            instance.layer.backgroundLayer.destroyChildren();
            instance.layer.backgroundLayer.add(node);
            instance.layer.backgroundLayer.batchDraw();
        });
    }

    /**
     * Activates or deactivates drawing
     * @param active bool if drawing should be active
     */
    setDrawingActivated(active) {
        this.isDrawingActivated = active;
    }

    /**
     * Exports the current canvas-stage as a base64 string
     * @returns {string|null} returns the encoded string
     */
    getStageAsBase64() {
        if (this.stage !== undefined && this.stage !== null) {
            return this.stage.toDataURL({
                pixelRatio: 3,
            });
        }
        return null;
    }

    /**
     * Exports the current canvas stage as a PNG image
     * @returns {Promise<>|null} wait for the export to finish
     */
    getStageAsPNG() {
        let instance = this;
        if (this.stage !== undefined && this.stage !== null) {
            return new Promise(
                function (resolve) {
                    instance.stage.toImage({
                        callback(img) {
                            resolve(img);
                        },
                    });
                });

        }
        return null;
    }

    /**
     * Updates the brush color
     * @param color
     */
    updateColor(color) {
        this.context.strokeStyle = color;
    }

    /**
     * Updates the brush size
     * @param size
     */
    updateSize(size) {
        this.context.lineWidth = size;
    }

    /**
     * Switches between the rubber and pen
     * @param item includes the item to be activated
     */
    switchPenRubber(item) {
        if (item === "toolbox-pen") {
            this.context.globalCompositeOperation = Config.PEN_OPERATION;
        } else if (item === "toolbox-rubber") {
            this.context.globalCompositeOperation = Config.RUBBER_OPERATION;
        }
    }

    /**
     * resizes the canvas and its container to be accurate
     */
    resizeViews() {
        let bigContainer = document.querySelector(".dashboard-canvas");

        if (bigContainer.offsetWidth > Config.CANVAS_WIDTH) {
            this.el.style.maxWidth = (Config.CANVAS_WIDTH + Config.CANVAS_SIZE_OFFSET).toString() + "px";
        } else {
            this.el.style.maxWidth = bigContainer.offsetWidth + "px";
        }

        if (bigContainer.offsetHeight > Config.CANVAS_HEIGHT) {
            this.el.style.maxHeight = (Config.CANVAS_HEIGHT + Config.CANVAS_SIZE_OFFSET).toString() + "px";
        } else {
            this.el.style.maxHeight = bigContainer.offsetHeight + "px";
        }
    }

    /**
     * adds a received line to the canvas
     * @param data includes the data of line
     */
    addLine(data) {
        let isAdminLine = data.adminLine,
            newLine = new Konva.Line({
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

        if (isAdminLine || this.layer.collaboratorLayer === null) {
            this.layer.adminLayer.add(newLine);
            this.layer.adminLayer.batchDraw();
        } else {
            this.layer.collaboratorLayer.add(newLine);
            this.layer.collaboratorLayer.batchDraw();
        }
    }

    /**
     * destroys the passed line
     * @param data data of the line should be undo
     * @param isMultiLayer bool if current sketch is multilayer
     */
    undoLine(data, isMultiLayer) {
        for (let id of data) {
            let line = this.stage.findOne("#" + id);
            if (line !== undefined) {
                line.destroy();
            }
        }
        if (isMultiLayer) {
            this.layer.adminLayer.batchDraw();
            this.layer.collaboratorLayer.batchDraw();
        } else {
            this.layer.adminLayer.batchDraw();
        }
    }

    /**
     * clears the canvas handles between multilayer/not and admin/collaborator
     * @param data includes necessary data to clear and reset the canvas
     */
    clearCanvas(data) {
        if (data.isNewSketch || data.userRole === Config.CHANNEL_ROLE_ADMIN) {
            this.stage.destroyChildren();
            setupKonvaJS(this, data.multilayer);
        } else if (data.userRole === Config.CHANNEL_ROLE_COLLABORATOR) {
            clearAndSetupCollaboratorLayer(this);
        }

        setMouseListener(this);
    }
}

export default DrawAreaView;
