import {Event, Observable} from './utils/Observable.js'

class View extends Observable {

  constructor() {
    super();
    this.el = undefined;
  }

  setElement(el) {
    this.el = el;
  }

}

export default View;
