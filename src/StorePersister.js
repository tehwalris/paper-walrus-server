'use strict';
const _ = require('lodash'),
  fs = require('fs'),
  path = require('path'),
  mkdirp = require('mkdirp'),
  Store = require('./Store');

class StorePersister {
  constructor(path) {
    this._path = path;
    this._onStoreChange = this._onStoreChange.bind(this);
  }

  getStore() {
    if(!this._store)
      this._loadStore();
    return this._store;
  }

  _loadStore() {
    var data;
    try {
      fs.accessSync(this._path);
      data = JSON.parse(fs.readFileSync(this._path));
    } catch (e) {
      data = _.cloneDeep(defaultStore);
    }
    return this._bindStore(new Store(data));
  }

  _bindStore(store) {
    if(this._store)
      this._unbindStore();
    store.on('change', this._onStoreChange);
    this._store = store;
    return store;
  }

  _unbindStore() {
    this._store.removeListener('change', this._onStoreChange);
  }

  _onStoreChange(data) {
    mkdirp(path.dirname(this._path), handleErrorHard);
    fs.writeFile(this._path, JSON.stringify(data), handleErrorHard);
  }
}

function handleErrorHard(err) {
  if(err)
    throw err;
}

const defaultStore = {
  tags: {},
  items: [],
};

module.exports = StorePersister;
