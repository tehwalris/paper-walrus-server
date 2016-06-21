'use strict';
const _ = require('lodash'),
  EventEmitter = require('events'),
  moment = require('moment'),
  generateId = require('uuid').v4;

class Store {
  constructor(data) {
    this._data = data;
    this._configureEventEmitter();
  }

  getTags() {
    return {tags: _.values(this._data.tags)};
  }

  createTag({type, name}) {
    if(!['subject', 'custom'].includes(type))
      throw new Error(`Invalid type "${type}".`);
    if(!_.isString(name))
      throw new Error(`Parameter name must be a string.`);
    return this._idAndInsertObject('tags', {type, name});
  }

  getEntries({tags, beforeDate}) {
    if(beforeDate)
      throw new Error('Parameter beforeDate is not implemented.');
    this._validateTagsParameter(tags);
    const entries = _.filter(this._data.entries, entry => {
      const entryHasTag = tag => _.includes(entry.tags, tag);
      return _.every(tags, entryHasTag);
    });
    return {entries};
  }

  getEntry({id}) {
    return this._data.entries[id];
  }

  createEntry({dataId, tags, dateReceived: dateReceivedRaw}) {
    const entryData = this._data.entryData[dataId];
    if(!entryData)
      throw new Error(`EntryData "${dataId}" does not exist.`);
    this._validateTagsParameter(tags);
    const dateReceived = this._normalizeDateString(dateReceivedRaw);
    delete this._data.entryData[dataId];
    return this._idAndInsertObject('entries', {
      data: entryData,
      dateReceived,
      tags,
    });
  }

  updateEntry({id, tags, dateReceived}) {
    const entry = _.clone(this._data.entries[id]);
    if(!entry)
      throw new Error(`Entry "${id}" does not exist.`);
    if(tags) {
      this._validateTagsParameter(tags);
      entry.tags = tags;
    }
    if(dateReceived) {
      entry.dateReceived = this._normalizeDateString(dateReceived);
    }
    this._data.entries[id] = entry;
    this._notifyChange();
    return entry;
  }

  deleteEntry({id}) {
    const entry = this._data.entries[id];
    delete this._data.entries[id];
    if(entry) {
      this._notifyChange();
      this._notifyFileUnused(entry.data.originalFile);
      this._notifyFileUnused(entry.data.previewFile);
      return true;
    }
    return false;
  }

  getEntryData() {
    return {entryData: _.values(this._data.entryData)};
  }

  createEntryData({previewFile, originalFile, originalType}) {
    return this._idAndInsertObject('entryData', {
      previewFile,
      originalFile,
      originalType,
    });
  }

  _validateTagsParameter(tags) {
    if(!_.isArray(tags) || !_.every(tags, _.isString))
      throw new Error('Parameter tags must be an array of tag ids');
    if(!_.every(tags, tagId => !!this._data.tags[tagId]))
      throw new Error('Some referenced tags do not exist.');
  }

  _normalizeDateString(dateString) {
    const date = moment.utc(dateString, moment.ISO_8601, true);
    if(!date.isValid())
      throw new Error(`Invalid date "${dateString}".`);
    return date.format();
  }

  _idAndInsertObject(section, object) {
    object.id = generateId();
    this._data[section][object.id] = object;
    this._notifyChange();
    return object;
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

  _notifyFileUnused(filename) {
    this._eventEmitter.emit('fileUnused', filename);
  }
}

Store.defaultStore = {
  tags: {},
  entries: {},
  entryData: {},
}

module.exports = Store;
