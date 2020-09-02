import View from "./View.js";
import {Event} from "../utils/Observable.js"

function checkAndNotifyForDrawing(drawAreaView) {
  if (drawAreaView.mouse.click && drawAreaView.mouse.move && drawAreaView.mouse.pos_prev) {
    drawAreaView.notifyAll(new EmitLineEvent(drawAreaView.mouse));
    drawAreaView.mouse.move = false;
  }
  drawAreaView.mouse.pos_prev = { x: drawAreaView.mouse.pos.x, y: drawAreaView.mouse.pos.y };
}

function setMouseListener(drawAreaView) {
  drawAreaView.image.on('mousedown touchstart', function() {
    drawAreaView.mouse.click = true;
    checkAndNotifyForDrawing(drawAreaView)
  });

  drawAreaView.stage.on('mouseup touchend', function() {
    drawAreaView.mouse.click = false;
    checkAndNotifyForDrawing(drawAreaView);
  });

  drawAreaView.stage.on('mousemove touchmove', function() {
    drawAreaView.mouse.pos.x = drawAreaView.stage.getPointerPosition().x / drawAreaView.stage.width();
    drawAreaView.mouse.pos.y = drawAreaView.stage.getPointerPosition().y / drawAreaView.stage.height();
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
  drawAreaView.context.strokeStyle = '#ffbe00';
  drawAreaView.context.lineJoin = 'round';
  drawAreaView.context.lineWidth = 5;
}


class EmitLineEvent extends Event {
  constructor(mouse) {
    super("EmitLine", {mouse: mouse})
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

        setupKonvaJS(this);
        setMouseListener(this);
  }

  addLine(line) {
    this.context.beginPath();
    this.context.moveTo(line[0].x * this.stage.width(), line[0].y * this.stage.height());
    this.context.lineTo(line[1].x * this.stage.width(), line[1].y * this.stage.height());
    this.context.closePath();
    this.context.stroke();
    this.layer.batchDraw();
  }
}

export default DrawAreaView;
