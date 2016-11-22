// Copy this config to config.js and customize it there
// Only one of the config files will be read

'use strict';
const path = require('path');

module.exports = {
  publicPath: '/api',
  publicMinioPath: '/minio',
  port: 3000,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'],
  contentCacheMaxAge: 2e9, // A few weeks in ms
  preview: {
    minSize: {
      width: 198*2,
      height: 198*2,
    },
    supportedInputTypes: ['image/jpeg', 'image/png'],
  },
  sessionDuration: '7 days',
  knex: {
    client: 'pg',
    connection: {
      host : process.env.POSTGRES_HOST || 'postgres',
      user : process.env.POSTGRES_USER || 'postgres',
      password : process.env.POSTGRES_PASSWORD || 'walrus',
      database : process.env.POSTGRES_DB || 'paper-walrus'
    }
  },
  minio: {
    endPoint: process.env.MINIO_HOST || 'minio',
    port: +process.env.MINIO_PORT,
    secure: false, // Security must be provided by the production frontend
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
  },
  minioBucket: process.env.MINIO_BUCKET || 'paper-walris',
  minioRegion: 'us-east-1', // Not relevant
};
