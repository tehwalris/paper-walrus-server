'use strict';
const os = require('os'),
  path = require('path');

const basePath = path.join(os.homedir(), '.paperWalrus')
const imagePath = path.join(basePath, 'images');
const storePath = path.join(basePath, 'store.json');

module.exports = {
  basePath,
  imagePath,
  storePath,
  port: 3000,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
  contentCacheMaxAge: 2e9, //a few weeks in ms
  previewSize: {
    width: 200,
    height: 200,
  },
  previewExtension: 'jpg',
  sessionDuration: '7 days',
  knex: {
    client: 'pg',
    connection: {
      host : '172.17.0.2',
      user : 'postgres',
      password : 'walrus',
      database : 'paper-walrus'
    }
  },
};
