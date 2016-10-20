'use strict';
require('babel-polyfill')

const _ = require('lodash'),
  express = require('express'),
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

//HACK defined as const to prevent function hoisting, since
//this would place the function above babel-polyfill.
const loadSourceFiles = async function(files) {
  const previews = await Promise.all(files.map(
    file => previewGenerator.generate(file.path, file.mimetype)
  ));
  return _.zipWith(files, previews, (file, previewFilename) => ({
    filename: file.filename,
    mimeType: file.mimetype,
    previewFilename,
  }));
}

configureDatabase(config.knex)
  .catch(e => {
    console.error('Startup failed.', e);
    process.exit(1);
  })
  .then(knex => {
    protectedRoutes.use('/graphql', upload.any(), graphqlHttp(({files}) => ({
      schema: storeSchema,
      graphiql: true,
      context: {
        knex,
        loadSourceFiles: loadSourceFiles.bind(null, files),
      },
    })));

    app.use(protectedRoutes);

    return knex;
  })
  .then(knex => configureImageStore(config, {knex}))
  .then(() => {
    app.listen(config.port, function () {
      console.log('System up, config:', config);
    });
  });
