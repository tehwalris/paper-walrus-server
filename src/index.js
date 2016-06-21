'use strict';
const express = require('express'),
  bodyParser = require('body-parser'),
  fs = require('fs'),
  path = require('path'),
  StorePersister = require('./StorePersister'),
  Uploader = require('./Uploader'),
  config = require('./config'); 

const storePersister = new StorePersister(config.storePath);
const store = storePersister.getStore();
const upload = new Uploader(config.imagePath, config.allowedMimeTypes);

store.on('fileUnused', (filename) => {
  fs.unlink(path.join(config.imagePath, filename), () => {});
});

const app = express();
app.use(bodyParser.json());
app.use('/content', express.static(config.imagePath, {maxage: config.contentCacheMaxAge}));

app.get('/tags', bindApi('getTags', 'query'));
app.post('/tags', bindApi('createTag', 'body'));
app.post('/entries', bindApi('createEntry', 'body'));
app.get('/entryData', bindApi('getEntryData', 'query'));

app.get('/entries', (req, res) => {
  res.send(store.getEntries({
    tags: JSON.parse(req.query.tags),
    beforeDate: req.query.beforeDate,
  }));
});

app.get('/entries/:id', (req, res) => {
  const entry = store.getEntry(req.params);
  if(entry)
    res.send(entry);
  else
    res.sendStatus(404);
});

app.post('/entries/:id', (req, res) => {
  res.send(store.updateEntry({
    id: req.params.id,
    tags: req.body.tags, 
    dateReceived: req.body.dateReceived, 
  }));
});

app.delete('/entries/:id', (req, res) => {
  const deleted = store.deleteEntry(req.params);
  res.sendStatus(deleted ? 200 : 404);
});

app.post('/entryData', upload.any(), (req,res) => {
  const result = req.files.map(file => store.createEntryData({
    previewFile: file.filename,
    originalFile: file.filename,
    originalType: file.mimetype,
  }));
  res.send({data: result});
});

function bindApi(apiFunctionName, inputField) {
  const handler = store[apiFunctionName].bind(store);
  return function(req, res) {
    const data = req[inputField];
    res.send(handler(data));
  }
}

app.listen(config.port, function () {
  console.log('System up, config:', config);
});
