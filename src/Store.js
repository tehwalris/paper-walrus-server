'use strict';
const _ = require('lodash'),
  EventEmitter = require('events'),
  moment = require('moment'),
  bcrypt =  require('bcrypt'),
  generateId = require('uuid').v4,
  isValidEmail = require('email-validator').validate;

class Store {
  constructor(data) {
    this._data = data;
    this._configureEventEmitter();
  }

  createUser({email, password}) {
    if(!isValidEmail(email))
      return Promise.reject(Error(`Invalid email "${email}"`));
    this._validatePassword(password);
    const existingUser = _.find(this._data.userSections, section => section.meta.email === email);
    if(existingUser)
      return Promise.reject(Error('A user with this email already exists.'));
    return this._hashPassword(password).then(passwordHash => {
      const userSection = _.defaults({
        meta: {
          email,
          passwordHash,
          id: generateId(),
        },
      }, defaultUserSection);
      this._data.userSections[userSection.meta.id] = userSection;
      this._notifyChange();
    });
  }

  authenticateUser({email, password}) {
    const userSection = _.find(this._data.userSections, section => section.meta.email === email);
    if(!userSection)
      return Promise.reject(Error(`User with email "${email}" does not exist.`));
    return this._passwordMatches(userSection.meta.passwordHash, password).then(passwordMatches => {
      if(!passwordMatches)
        return Promise.reject(Error('Password is incorrect.'));
      return {userId: userSection.meta.id};
    });
  }

  getTags({}, token) {
    const userSection = this._getUserSectionOrThrow(token);
    return {tags: _.values(userSection.data.tags)};
  }

  createTag({type, name}, token) {
    const userSection = this._getUserSectionOrThrow(token);
    if(!['subject', 'custom'].includes(type))
      throw new Error(`Invalid type "${type}".`);
    if(!_.isString(name))
      throw new Error(`Parameter name must be a string.`);
    return this._idAndInsertObject(userSection, 'tags', {type, name});
  }

  getEntries({tags, beforeDate}, token) {
    const userSection = this._getUserSectionOrThrow(token);
    if(beforeDate)
      throw new Error('Parameter beforeDate is not implemented.');
    this._validateTagsParameter(tags, userSection);
    const entries = _.filter(userSection.data.entries, entry => {
      const entryHasTag = tag => _.includes(entry.tags, tag);
      return _.every(tags, entryHasTag);
    });
    return {entries};
  }

  getEntry({id}, token) {
    const userSection = this._getUserSectionOrThrow(token);
    return userSection.data.entries[id];
  }

  createEntry({dataId, tags, dateReceived: dateReceivedRaw}, token) {
    const userSection = this._getUserSectionOrThrow(token);
    const entryData = userSection.data.entryData[dataId];
    if(!entryData)
      throw new Error(`EntryData "${dataId}" does not exist.`);
    this._validateTagsParameter(tags, userSection);
    const dateReceived = this._normalizeDateString(dateReceivedRaw);
    delete userSection.data.entryData[dataId];
    return this._idAndInsertObject(userSection, 'entries', {
      data: entryData,
      dateReceived,
      tags,
    });
  }

  updateEntry({id, tags, dateReceived}, token) {
    const userSection = this._getUserSectionOrThrow(token);
    const entry = _.clone(userSection.data.entries[id]);
    if(!entry)
      throw new Error(`Entry "${id}" does not exist.`);
    if(tags) {
      this._validateTagsParameter(tags, userSection);
      entry.tags = tags;
    }
    if(dateReceived) {
      entry.dateReceived = this._normalizeDateString(dateReceived);
    }
    userSection.data.entries[id] = entry;
    this._notifyChange();
    return entry;
  }

  deleteEntry({id}, token) {
    const userSection = this._getUserSectionOrThrow(token);
    const entry = userSection.data.entries[id];
    delete userSection.data.entries[id];
    if(entry) {
      this._notifyChange();
      this._notifyFileUnused(entry.data.originalFile);
      this._notifyFileUnused(entry.data.previewFile);
      return true;
    }
    return false;
  }

  getEntryData({}, token) {
    const userSection = this._getUserSectionOrThrow(token);
    return {entryData: _.values(userSection.data.entryData)};
  }

  createEntryData({previewFile, originalFile, originalType}, token) {
    const userSection = this._getUserSectionOrThrow(token);
    return this._idAndInsertObject(userSection, 'entryData', {
      previewFile,
      originalFile,
      originalType,
    });
  }

  _validateTagsParameter(tags, userSection) {
    if(!_.isArray(tags) || !_.every(tags, _.isString))
      throw new Error('Parameter tags must be an array of tag ids');
    if(!_.every(tags, tagId => !!userSection.data.tags[tagId]))
      throw new Error('Some referenced tags do not exist.');
  }

  _validatePassword(password) {
    if(!_.isString(password) || password.length < 6 || password.length > 70)
      throw new Error('Invalid password.');
  }

  _hashPassword(password) {
    return new Promise((resolve, reject) => {
      bcrypt.hash(password, 10, (err, hash) => {
        if(err) reject(err);
        else resolve(hash);
      });
    });
  }

  _passwordMatches(hash, input) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(input, hash, (err, result) => {
        if(err) reject(err);
        else resolve(result);
      });
    });
  }

  _normalizeDateString(dateString) {
    const date = moment.utc(dateString, moment.ISO_8601, true);
    if(!date.isValid())
      throw new Error(`Invalid date "${dateString}".`);
    return date.format();
  }

  _idAndInsertObject(userSection, type, object) {
    object.id = generateId();
    userSection.data[type][object.id] = object;
    this._notifyChange();
    return object;
  }

  _getUserSectionOrThrow({userId}) {
    const userSection = this._data.userSections[userId];
    if(!userSection)
      throw new Error('User doesn\'t exist.');
    return userSection;
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
    if(filename)
      this._eventEmitter.emit('fileUnused', filename);
  }
}

Store.defaultStore = {
  userSections: {},
}

const defaultUserSection = {
  data: {
    tags: {},
    entries: {},
    entryData: {},
  },
}

module.exports = Store;
