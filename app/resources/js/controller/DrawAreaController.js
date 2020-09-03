import { Event, Observable } from "../utils/Observable.js";

class LineDrawnEvent extends Event {
  constructor(data) {
    super("LineDrawn", data);
  }
}

class DrawAreaController extends Observable {

  constructor(socket) {
    super();
    this.socket = socket;
    let controller = this;
    this.socket.on('line', function(data) {
      controller.notifyAll(new LineDrawnEvent(data));
    });

  }

  emitLine(data) {
    this.socket.emit('line', {
      line: [data.mouse.pos, data.mouse.pos_prev],
      color: data.color,
      penRubber: data.penRubber,
      size: data.size
    });
  }

  getColorStrFromColor(colorElId) {
    if (colorElId === "color-standard") {
      return "#ffffff";
    } else if (colorElId === "color-blue") {
      return "#0000ff";
    } else if (colorElId === "color-green") {
      return "#00ff00";
    } else if (colorElId === "color-yellow") {
      return "#ffff00";
    } else if (colorElId === "color-red") {
      return "#ff0000";
    }
  }

}

export default DrawAreaController;
