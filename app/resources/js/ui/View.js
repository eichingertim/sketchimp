import {Event, Observable} from '../utils/Observable.js';

class View extends Observable {

  constructor() {
    super();
    this.el = undefined;
  }

  setElement(el) {
    this.el = el;
  }

  show() {
    this.el.classList.remove("hidden");
  }

  hide() {
    this.el.classList.add("hidden");
  }

  toggleVisibility() {
    this.el.classList.toggle("hidden");
  }

}

export default View;
