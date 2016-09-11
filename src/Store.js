'use strict';
const EventEmitter = require('events');

class Store {
  constructor() {
    this._configureEventEmitter();
  }

  _configureEventEmitter() {
    const e = new EventEmitter(); 
    this._eventEmitter = e;
    this.on = e.on.bind(e);
    this.removeListener = e.removeListener.bind(e);
  }
}

Store.defaultStore = {};

module.exports = Store;
