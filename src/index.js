'use strict';
const express = require('express'),
  bodyParser = require('body-parser'),
  fs = require('fs'),
  path = require('path'),
  uuid = require('uuid').v4,
  jwt = require('jsonwebtoken'),
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
  try {
    const decodedToken = store.authenticateUser(req.body);
    const token = jwt.sign(decodedToken, jwtSecret, {
      expiresIn: config.sessionDuration,
    });
    res.send({token});
  } catch (e) {
    console.log(e);
    res.status(401).send('Authentication failed.');
  }
});

const protectedRoutes = express.Router();

protectedRoutes.use(function(req, res, next) {
  const token = req.headers['x-access-token'];
  if(token) {
    jwt.verify(token, jwtSecret, function(err, decoded) {
      if(err) {
        console.log(err);
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

protectedRoutes.get('/tags', bindApi('getTags', 'query'));
protectedRoutes.post('/tags', bindApi('createTag', 'body'));
protectedRoutes.post('/entries', bindApi('createEntry', 'body'));
protectedRoutes.get('/entryData', bindApi('getEntryData', 'query'));

protectedRoutes.get('/entries', (req, res) => {
  res.send(store.getEntries({
    tags: JSON.parse(req.query.tags),
    beforeDate: req.query.beforeDate,
  }, req.token));
});

protectedRoutes.get('/entries/:id', (req, res) => {
  const entry = store.getEntry(req.params, req.token);
  if(entry)
    res.send(entry);
  else
    res.sendStatus(404);
});

protectedRoutes.post('/entries/:id', (req, res) => {
  res.send(store.updateEntry({
    id: req.params.id,
    tags: req.body.tags, 
    dateReceived: req.body.dateReceived, 
  }, req.token));
});

protectedRoutes.delete('/entries/:id', (req, res) => {
  const deleted = store.deleteEntry(req.params, req.token);
  res.sendStatus(deleted ? 200 : 404);
});

protectedRoutes.post('/entryData', upload.any(), (req, res, next) => {
  Promise.all(req.files.map(file => {
    return previewGenerator.generate(file.path, file.mimetype);
  })).then(previews => {
    const result = req.files.map((file, i) => store.createEntryData({
      previewFile: previews[i],
      originalFile: file.filename,
      originalType: file.mimetype,
    }, req.token));
    res.send({data: result});
  }).catch(err => next(err));
});

function bindApi(apiFunctionName, inputField) {
  const handler = store[apiFunctionName].bind(store);
  return function(req, res) {
    const data = req[inputField];
    res.send(handler(data, req.token));
  }
}

app.use(protectedRoutes);

app.listen(config.port, function () {
  console.log('System up, config:', config);
});
