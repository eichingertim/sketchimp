import { Event, Observable } from "../utils/Observable.js";

let areaController;

class LineDrawnEvent extends Event {
  constructor(data) {
    super("LineDrawn", data);
  }
}

class LineUndoEvent extends Event {
  constructor(data) {
    super("LineUndo", data);
  }
}

class ClearCanvasEvent extends Event {
  constructor() {
    super("ClearCanvas", null);
  }
}

function createUUID() {
  let dt = new Date().getTime(),
    uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      let r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  return uuid;
}

class DrawAreaController extends Observable {

  constructor(socket, userId) {
    super();
    this.userId = userId;
    this.channelId = null;
    this.socket = socket;
    areaController = this;
  }

  join(channelId) {
    this.channelId = channelId;
    console.log(channelId);
    this.socket.emit('subscribe', this.channelId);

    this.socket.on('line', function(data) {
      areaController.notifyAll(new LineDrawnEvent(data));
    });

    this.socket.on('undo', function(data) {
      areaController.notifyAll(new LineUndoEvent(data));
    });

    this.socket.on('clear-canvas', function() {
      areaController.notifyAll(new ClearCanvasEvent());
    });

  }

  emitClearCanvas() {
    this.socket.emit('clear-canvas', { channelId: this.channelId });
  }

  emitLine(data) {
    //TODO: replace userId with real not socket id
    this.socket.emit('line', {
      channelId: this.channelId,
      userId: this.userId,
      lineId: createUUID(),
      line: [data.mouse.pos, data.mouse.pos_prev],
      color: data.color,
      penRubber: data.penRubber,
      size: data.size,
    });
  }

  undoLine() {
    this.socket.emit('undo', {
      channelId: this.channelId,
      userId: this.userId,
    });
  }

}

export default DrawAreaController;