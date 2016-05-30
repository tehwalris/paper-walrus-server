'use strict';
const _ = require('lodash'),
  EventEmitter = require('events');

class Store {
  constructor(data) {
    this._data = data;
    this._configureEventEmitter();
    setTimeout(() => this._notifyChange(), 1000); //TODO 
  }

  getAllTags() {
    return this._data.tags;
  }

  findItems(tagIds) {
    return _.filter(this._data.items, item => this._itemHasTags(item, tagIds));
  }

  _itemHasTag(item, tagId) {
    return _.includes(item.tags, tagId);
  }

  _itemHasTags(item, tagIds) {
    const itemHasTag = this._itemHasTag.bind(this, item);
    return _.every(tagIds, itemHasTag);
  }

  _configureEventEmitter() {
    const e = new EventEmitter(); 
    this._eventEmitter = e;
    this.on = e.on.bind(e);
    this.removeListener = e.removeListener.bind(e);
  }

  _notifyChange() {
    this._eventEmitter.emit('change', this._data);
  }
}

module.exports = Store;
