'use strict';
const express = require('express'),
  bodyParser = require('body-parser'),
  fs = require('fs'),
  path = require('path'),
  uuid = require('uuid').v4,
  jwt = require('jsonwebtoken'),
  graphqlHttp = require('express-graphql'),
  storeSchema = require('./storeSchema'),
  StorePersister = require('./StorePersister'),
  Uploader = require('./Uploader'),
  PreviewGenerator = require('./PreviewGenerator'),
  config = require('./config'); 

const storePersister = new StorePersister(config.storePath);
const store = storePersister.getStore();
const upload = new Uploader(config.imagePath, config.allowedMimeTypes);
const previewGenerator = new PreviewGenerator(config.imagePath, config.previewExtension, config.previewSize);

store.on('fileUnused', (filename) => {
  fs.unlink(path.join(config.imagePath, filename), () => {});
});

const app = express();
app.use(bodyParser.json());
app.use('/content', express.static(config.imagePath, {maxage: config.contentCacheMaxAge}));

app.use('/graphql', graphqlHttp({
  schema: storeSchema,
  graphiql: true,
}));

const jwtSecret = uuid();

app.post('/authenticate', (req, res) => {
  Promise.reject() // TODO
    .then(decodedToken => new Promise((resolve, reject) => {
    jwt.sign(decodedToken, jwtSecret, {
      expiresIn: config.sessionDuration,
    }, (err, token) => {
      if(err) reject(err);
      else resolve(token);
    });
  }))
  .then(token => res.send({token}))
  .catch(e => {
    res.status(401).send('Authentication failed.')
  });
});

const protectedRoutes = express.Router();

protectedRoutes.use(function(req, res, next) {
  const token = req.headers['x-access-token'];
  if(token) {
    jwt.verify(token, jwtSecret, function(err, decoded) {
      if(err) {
        res.status(401).send('Unauthorized token.');
      } else {
        req.token = decoded;
        next();
      }
    });
  } else {
    res.status(401).send('No token provided.');
  }
});

app.use(protectedRoutes);

app.listen(config.port, function () {
  console.log('System up, config:', config);
});
