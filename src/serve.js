'use strict';
require('babel-polyfill')

const _ = require('lodash'),
  express = require('express'),
  bodyParser = require('body-parser'),
  fs = require('fs'),
  path = require('path'),
  uuid = require('uuid').v4,
  graphqlHttp = require('express-graphql'),
  configureImageStore = require('./configureImageStore'),
  configureDatabase = require('./configureDatabase'),
  databaseHelpers = require('./databaseHelpers'),
  storeSchema = require('./storeSchema'),
  StorePersister = require('./StorePersister'),
  Uploader = require('./Uploader'),
  PreviewGenerator = require('./PreviewGenerator'),
  Authenticator = require('./Authenticator'),
  config = require('./config'); 

//HACK defined as const to prevent function hoisting, since
//this would place the function above babel-polyfill.
//Async functions may be used inside this.
const start = async function() {
  const jwtSecret = uuid();
  const knex = await configureDatabase(config.knex);
  const authenticator = new Authenticator({knex}, jwtSecret, config.sessionDuration);
  const storePersister = new StorePersister(config.storePath);
  const store = storePersister.getStore();
  const upload = new Uploader(config.imagePath, config.allowedMimeTypes);
  const previewGenerator = new PreviewGenerator(config.imagePath, config.previewExtension, config.previewSize);

  const app = express();
  const protectedRoutes = express.Router();
  app.use(bodyParser.json());
  app.use('/content', express.static(config.imagePath, {maxage: config.contentCacheMaxAge}));

  app.post('/authenticate', async (req, res) => {
    try {
      const token = await authenticator.authenticate(req.body);
      res.send({token});
    } catch (e) {
      const message = (e instanceof Authenticator.UnauthorizedFailure)
        ? e.message
        : 'Authentication failed.';
      res.status(401).send(message)
    }
  });

  protectedRoutes.use(async function(req, res, next) {
    const token = req.headers['x-access-token'];
    try {
      req.token = await authenticator.confirmAuthenticated(token);
      next();
    } catch (e) {
      const message = (e instanceof Authenticator.UnauthorizedFailure)
        ? e.message
        : 'Authentication failed.';
      res.status(401).send(message)
    }
  });

  async function loadSourceFiles(files) {
    const previews = await Promise.all(files.map(
      file => previewGenerator.generate(file.path, file.mimetype)
    ));
    return _.zipWith(files, previews, (file, previewFilename) => ({
      filename: file.filename,
      mimeType: file.mimetype,
      previewFilename,
    }));
  }

  protectedRoutes.use('/graphql', upload.any(), graphqlHttp(({files, token}) => ({
    schema: storeSchema,
    graphiql: true,
    context: {
      knex,
      loadSourceFiles: loadSourceFiles.bind(null, files),
      token,
      authenticator,
    },
  })));

  await configureImageStore(config, {knex});

  app.use(protectedRoutes);

  app.listen(config.port, function () {
    console.log('System up, config:', config);
  });
}

start().catch(e => {
  console.error('Startup failed.', e);
  process.exit(1);
});
