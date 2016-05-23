'use strict';
const _ = require('lodash');

class Store {
  constructor(data) {
    this._data = data;
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
}

module.exports = Store;
