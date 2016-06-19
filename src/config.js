'use strict';
const os = require('os'),
  path = require('path');

const port = 3000;
const basePath = path.join(os.homedir(), '.paperWalrus')
const imagePath = path.join(basePath, 'images');
const storePath = path.join(basePath, 'store.json');
const allowedMimeTypes = ['image/jpeg', 'image/png'];

module.exports = {port, basePath, imagePath, storePath, allowedMimeTypes};
