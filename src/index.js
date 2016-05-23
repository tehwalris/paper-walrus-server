'use strict';
const server = require('http').createServer(),
  io = require('socket.io')(server),
  Store = require('./Store'); 

const port = 3000;
const store = new Store({
  tags: {
    id1: {name: 'Maths', type: 'subject'},
    id2: {name: 'French', type: 'subject'},
    id3: {name: 'verbs', type: 'plain'},
    id4: {name: 'adjectives', type: 'plain'},
  },
  items: [
    {tags: ['id1'], data: {type: 'image', source: 'fakeSource', id: 'id213'}},
    {tags: ['id2', 'id3'], data: {type: 'image', source: 'fakeSource', id: 'id1234'}},
    {tags: ['id2', 'id4'], data: {type: 'image', source: 'fakeSource', id: 'id453'}},
  ],
});

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
