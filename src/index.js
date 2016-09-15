'use strict';
const express = require('express'),
  bodyParser = require('body-parser'),
  fs = require('fs'),
  path = require('path'),
  uuid = require('uuid').v4,
  jwt = require('jsonwebtoken'),
  graphqlHttp = require('express-graphql'),
  configureImageStore = require('./configureImageStore'),
  configureDatabase = require('./configureDatabase'),
  databaseHelpers = require('./databaseHelpers'),
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

const jwtSecret = uuid();

app.post('/authenticate', (req, res) => {
    store.authenticateUser(req.body).then(decodedToken => new Promise((resolve, reject) => {
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

configureDatabase(config.knex)
  .catch(e => {
    console.error('Startup failed.', e);
    process.exit(1);
  })
  .then(knex => {
    protectedRoutes.use('/graphql', graphqlHttp({
      schema: storeSchema,
      graphiql: true,
      context: {knex},
    }));

    protectedRoutes.post('/uploadSourceFiles', upload.any(), (req, res, next) => {
      knex.transaction(trx => {
        Promise.all(req.files.map(file => databaseHelpers.createSourceFile({knex}, {
          filename: file.filename,
          mimeType: file.mimetype,
        }).transacting(trx)))
        .then(() => {
          trx.commit();
          res.sendStatus(200);
        })
        .catch(err => {
          trx.rollback();
          next(err);
        });
      });
    });

    app.use(protectedRoutes);

    return knex;
  })
  .then(knex => configureImageStore(config, {knex}))
  .then(() => {
    app.listen(config.port, function () {
      console.log('System up, config:', config);
    });
  });
