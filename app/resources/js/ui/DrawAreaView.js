import View from "./View.js";
import { Event } from "../utils/Observable.js";

function checkAndNotifyForDrawing(drawAreaView) {
  if (drawAreaView.mouse.click && drawAreaView.mouse.move && drawAreaView.mouse
    .pos_prev) {
      let data = {
        mouse: drawAreaView.mouse,
        color: drawAreaView.context.strokeStyle,
        penRubber: drawAreaView.context.globalCompositeOperation,
        size: drawAreaView.context.lineWidth
      }
    drawAreaView.notifyAll(new EmitLineEvent(data));
    drawAreaView.mouse.move = false;
  }
  drawAreaView.mouse.pos_prev = { x: drawAreaView.mouse.pos.x, y: drawAreaView
      .mouse.pos.y };
}

function setMouseListener(drawAreaView) {
  drawAreaView.image.on('mousedown touchstart', function() {
    drawAreaView.mouse.click = true;
  });

  drawAreaView.stage.on('mouseup touchend', function() {
    drawAreaView.mouse.click = false;
    drawAreaView.mouse.pos_prev = false;
    drawAreaView.mouse.move = false;
  });

  drawAreaView.stage.on('mousemove touchmove', function() {
    drawAreaView.mouse.pos.x = drawAreaView.stage.getPointerPosition().x /
      drawAreaView.stage.width();
    drawAreaView.mouse.pos.y = drawAreaView.stage.getPointerPosition().y /
      drawAreaView.stage.height();
    drawAreaView.mouse.move = true;
    checkAndNotifyForDrawing(drawAreaView);
  });
}

function setupKonvaJS(drawAreaView) {
  drawAreaView.layer = new Konva.Layer();
  drawAreaView.stage = new Konva.Stage({
    container: 'container',
    width: drawAreaView.el.offsetWidth,
    height: drawAreaView.el.offsetHeight
  });
  drawAreaView.canvas = document.createElement('canvas');
  drawAreaView.canvas.width = drawAreaView.stage.width();
  drawAreaView.canvas.height = drawAreaView.stage.height();
  drawAreaView.stage.add(drawAreaView.layer);

  drawAreaView.image = new Konva.Image({
    image: drawAreaView.canvas,
    x: 0,
    y: 0
  });

  drawAreaView.layer.add(drawAreaView.image);
  drawAreaView.stage.draw();

  drawAreaView.context = drawAreaView.canvas.getContext('2d');
  drawAreaView.context.strokeStyle = '#ffffff';
  drawAreaView.context.lineJoin = 'round';
  drawAreaView.context.lineWidth = 5;
}


class EmitLineEvent extends Event {
  constructor(data) {
    super("EmitLine", data)
  }
}

class DrawAreaView extends View {
  constructor(el) {
    super();
    this.setElement(el);
    this.layer = null;
    this.stage = null;
    this.canvas = null;
    this.image = null;
    this.context = null;
    this.mouse = {
      click: false,
      move: false,
      pos: { x: 0, y: 0 },
      pos_prev: false
    }
    this.currentXScale = 1.0;
    this.currentYScale = 1.0;

    setupKonvaJS(this);
    setMouseListener(this);
  }

  fitWindow() {
    // TODO: Real scaling
    location.reload();
  }

  updateColor(color) {
    this.context.strokeStyle = color;
  }

  updateSize(size) {
    this.context.lineWidth = size;
  }

  switchPenRubber(item) {
    if (item === "toolbox-pen") {
      this.context.globalCompositeOperation = 'source-over';
    } else if (item === "toolbox-rubber") {
      this.context.globalCompositeOperation = 'destination-out';
    }
  }

  addLine(data) {
    let newLine = new Konva.Line({
        points: [
          data.line[0].x * this.stage.width(),
          data.line[0].y * this.stage.height(),
          data.line[1].x * this.stage.width(),
          data.line[1].y * this.stage.height()
        ],
        stroke: data.color,
        strokeWidth: data.size,
        lineCap: 'round',
        lineJoin: 'round',
        id: data.lineId,
        tension: 1.0,
        globalCompositeOperation: data.penRubber,
      });
    this.layer.add(newLine);
    this.layer.batchDraw();
  }

  undoLine(data) {
    for (let id of data) {
      let line = this.stage.findOne("#"+id);
      if (line !== undefined) line.destroy();
    }
    this.layer.batchDraw();
  }

  clearCanvas() {
    this.stage.destroyChildren();
    setupKonvaJS(this);
    setMouseListener(this);
  }
}

export default DrawAreaView;
