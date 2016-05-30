'use strict';
const server = require('http').createServer(),
  io = require('socket.io')(server),
  StorePersister = require('./StorePersister'),
  config = require('./config'); 

const storePersister = new StorePersister(config.storePath);
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
  socket.on('disconnect', function(){
    console.log('client disconnnected');
  });
});


server.listen(config.port);
console.log('System up, config:', config);
