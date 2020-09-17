import { Event, Observable } from "../utils/Observable.js";

class LineDrawnEvent extends Event {
  constructor(data) {
    super("LineDrawn", data);
  }
}

class ClearCanvasEvent extends Event {
  constructor() {
    super("ClearCanvas", null);
  }
}

class DrawAreaController extends Observable {

  constructor(socket, channelId) {
    super();
    this.channelId = channelId;
    this.socket = socket;
    let controller = this;
    this.socket.emit('subscribe', this.channelId)

    this.socket.on('line', function(data) {
      controller.notifyAll(new LineDrawnEvent(data));
    });
    this.socket.on('clear-canvas', function() {
      controller.notifyAll(new ClearCanvasEvent());
    });

  }

  emitClearCanvas() {
    this.socket.emit('clear-canvas', {channelId: this.channelId});
  }

  emitLine(data) {
    this.socket.emit('line', {
      channelId: this.channelId,
      line: [data.mouse.pos, data.mouse.pos_prev],
      color: data.color,
      penRubber: data.penRubber,
      size: data.size
    });
  }

}

export default DrawAreaController;
