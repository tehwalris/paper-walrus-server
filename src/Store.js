'use strict';
const _ = require('lodash'),
  EventEmitter = require('events'),
  bcrypt = require('bcrypt'),
  fakeStore = require('./fakeStore');

class Store {
  constructor() {
    this._configureEventEmitter();
  }

  authenticateUser({email, password}) {
    const user = _.find(fakeStore.users, {email});
    if(!user)
      return Promise.reject(Error('Authentication failed.'));
    return this._passwordMatches(user.passwordHash, password).then(passwordMatches => {
      if(!passwordMatches)
        return Promise.reject(Error('Authentication failed.'));
      return {userId: user.id};
    });
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
    console.log(hash, input);
    return new Promise((resolve, reject) => {
      bcrypt.compare(input, hash, (err, result) => {
        if(err) reject(err);
        else resolve(result);
      });
    });
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
