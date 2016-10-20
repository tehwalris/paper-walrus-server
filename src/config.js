'use strict';
const os = require('os'),
  path = require('path');

const basePath = path.join(os.homedir(), '.paperWalrus')
const imagePath = path.join(basePath, 'images');
const orphanedImagePath = path.join(imagePath, 'orphaned');
const storePath = path.join(basePath, 'store.json');
const publicPath = '/api';
const publicContentPath = path.join(publicPath, 'content');

module.exports = {
  basePath,
  imagePath,
  orphanedImagePath,
  publicPath,
  publicContentPath,
  storePath,
  port: 3000,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'],
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
