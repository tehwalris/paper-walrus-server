'use strict';
require('babel-polyfill')

const _ = require('lodash'),
  express = require('express'),
  bodyParser = require('body-parser'),
  fs = require('fs'),
  path = require('path'),
  uuid = require('uuid').v4,
  graphqlHttp = require('express-graphql'),
  configureDatabase = require('./configureDatabase'),
  configureMinio = require('./configureMinio'),
  databaseHelpers = require('./databaseHelpers'),
  storeSchema = require('./storeSchema'),
  Authenticator = require('./Authenticator'),
  PreviewGenerator = require('./PreviewGenerator');

let config;
try {
  config = require('../config.js');
} catch (e) {
  config = require('../config.default.js');
}

//HACK defined as const to prevent function hoisting, since
//this would place the function above babel-polyfill.
//Async functions may be used inside this.
const start = async function() {
  const jwtSecret = uuid();
  const knex = await configureDatabase(config.knex);
  const minio = await configureMinio(config.minio, config.minioBucket, config.minioRegion, config.publicMinioPath);
  const authenticator = new Authenticator({knex}, jwtSecret, config.sessionDuration, config.refreshDuration);
  const previewGenerator = new PreviewGenerator({knex, minio}, config.minioBucket, config.preview);

  const app = express();
  const protectedRoutes = express.Router();
  app.use(bodyParser.json());

  app.post('/authenticate', async (req, res) => {
    try {
      const {token, refreshToken} = await authenticator.authenticate(req.body);
      res.send({token, refreshToken});
    } catch (e) {
      if (!(e instanceof Authenticator.UnauthorizedFailure)) {
        console.error('Error while trying to authenticate user.', e);
      }
      res.status(401).send('Authentication failed.')
    }
  });

  app.post('/authenticate/refresh', async (req, res) => {
    try {
      const {token, refreshToken} = await authenticator.authenticateWithRefreshToken(req.body);
      res.send({token, refreshToken});
    } catch (e) {
      if (!(e instanceof Authenticator.UnauthorizedFailure)) {
        console.error('Error while trying to authenticate user with refresh token.', e);
      }
      res.status(401).send('Authentication failed.')
    }
  });

  protectedRoutes.use(async function(req, res, next) {
    const token = req.headers['x-access-token'];
    try {
      req.token = await authenticator.confirmAuthenticated(token);
      next();
    } catch (e) {
      if (!(e instanceof Authenticator.UnauthorizedFailure)) {
        console.error('Error while trying access protected route.', e);
      }
      res.status(401).send('Authentication failed.')
    }
  });

  const graphqlHttpServer = graphqlHttp(({token}) => ({
    schema: storeSchema,
    graphiql: true,
    context: {
      knex,
      token,
      minio,
      config,
      authenticator,
      previewGenerator,
    },
  }))

  protectedRoutes.use('/graphql', graphqlHttpServer);

  app.use(protectedRoutes);

  app.listen(config.port, function () {
    console.log('System up, config:', config);
  });
}

start().catch(e => {
  console.error('Startup failed.', e);
  process.exit(1);
});
