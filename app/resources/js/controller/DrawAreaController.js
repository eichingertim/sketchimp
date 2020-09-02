import { Event, Observable } from "../utils/Observable.js";

class LineDrawnEvent extends Event {
  constructor(line) {
    super("LineDrawn", { line: line });
  }
}

class DrawAreaController extends Observable {

  constructor(socket) {
    super();
    this.socket = socket;
    let controller = this;
    this.socket.on('line', function(data) {
      var line = data.line;
      controller.notifyAll(new LineDrawnEvent(line));
    });

  }

  emitLine(mouse) {
    this.socket.emit('line', { line: [mouse.pos, mouse.pos_prev] });
  }

}

export default DrawAreaController;
