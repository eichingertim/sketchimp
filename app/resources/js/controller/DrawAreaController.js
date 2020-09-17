import { Event, Observable } from "../utils/Observable.js";

let areaController;

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

  constructor(socket) {
    super();
    this.channelId = null;
    this.socket = socket;
    areaController = this;
  }

  join(channelId) {
    this.channelId = channelId;
    console.log(channelId);
    this.socket.emit('subscribe', this.channelId)

    this.socket.on('line', function(data) {
      areaController.notifyAll(new LineDrawnEvent(data));
    });
    this.socket.on('clear-canvas', function() {
      areaController.notifyAll(new ClearCanvasEvent());
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
