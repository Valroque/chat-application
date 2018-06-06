var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.broadcast.emit('user_join', socket.id);

  socket.on('chat message', function(data){
    data = JSON.parse(data);
    io.emit('chat message', {'msg' : data.msg, 'user_id' : data.user_id});
  });

  socket.on('disconnect', function() {
    socket.broadcast.emit('user_left', socket.id);
  })

  socket.on('nick_change', function(data) {
    socket.broadcast.emit('nick_change', data)
  })
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
