'use strict';
const fs = require('fs'),
  path = require('path'),
  mkdirp = require('mkdirp');

class ImageStorage {
  constructor(path) {
    this._path = path;
    mkdirp(this._path, handleErrorHard);
  }

  create(image) {
    const id = this._generateImageId(image);
    const imagePath = this._getImagePath(id);
    return new Promise((resolve, reject) => {
      fs.writeFile(imagePath, image, (err) => {
        if(err)
          reject(err);
        resolve(id)
      });
    });
  }

  get(id) {
    return new Promise((resolve, reject) => {
      fs.readFile(this._getImagePath(id), (err, image) => {
        if(err)
          reject(err);
        resolve(image);
      });
    });
  }

  _generateImageId(image) {
    return 'test.jpg';
  }

  _getImagePath(id) {
    return path.join(this._path, id);
  }
}

function handleErrorHard(err) {
  if(err)
    throw err;
}

module.exports = ImageStorage;
