import { Event, Observable } from "../utils/Observable.js";

class LineDrawnEvent extends Event {
  constructor(line, color, penRubber) {
    super("LineDrawn", { line: line, color: color, penRubber: penRubber});
  }
}

class DrawAreaController extends Observable {

  constructor(socket) {
    super();
    this.socket = socket;
    let controller = this;
    this.socket.on('line', function(data) {
      var line = data.line;
      var color = data.color;
      var penRubber = data.penRubber;
      controller.notifyAll(new LineDrawnEvent(line, color, penRubber));
    });

  }

  emitLine(mouse, color, penRubber) {
    this.socket.emit('line', { line: [mouse.pos, mouse.pos_prev], color: color, penRubber: penRubber});
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
