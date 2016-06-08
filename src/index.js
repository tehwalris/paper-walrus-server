'use strict';
const server = require('http').createServer(),
  io = require('socket.io')(server),
  StorePersister = require('./StorePersister'),
  ImageStorage = require('./ImageStorage'),
  config = require('./config'); 

const storePersister = new StorePersister(config.storePath);
const imageStorage = new ImageStorage(config.imagePath);
const store = storePersister.getStore();

io.on('connection', function(socket){
  console.log('client connnected');
  socket.on('getAllTags', function(cb){
    cb(store.getAllTags());
  });
  socket.on('findItems', function(options, cb){
    console.log(options.tagIds);
    cb(store.findItems(options.tagIds));
  });
  socket.on('upload', function(image, options, cb) {
    console.log('upload called', image, options);
    imageStorage.create(image).then(id => {
      console.log('image created', id);
      cb(id);
    }).catch(() => cb(null));
  });
  socket.on('disconnect', function(){
    console.log('client disconnnected');
  });
});


server.listen(config.port);
console.log('System up, config:', config);
