'use strict';
const server = require('http').createServer(),
  io = require('socket.io')(server),
  StorePersister = require('./StorePersister'); 

const port = 3000;
const storePersister = new StorePersister('/home/philippe/.paperWalrus/store.json'); //TODO
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


server.listen(port);
console.log(`Listening on port ${port}`);
