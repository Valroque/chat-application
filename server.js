const express = require('express');
const app = express();
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var port = process.env.PORT || 3000;
var io = require('socket.io')(http);
var userActions = require('./users.js');
import {subClient, pubClient, redisClient} from './utils.js';

app.use(express.static(__dirname + '../public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//defaults
var userNick = "Annonymous"
var connections = 0;

//middlewares
var checkLoggedIn = function(req, res, next) {
  if(false) {
    next();
  } else {
    res.sendFile('/views/login.html');
  }
}

//app.use(checkLoggedIn);

io.on('connection', function(socket){
  socket.on('chat_message', function(data){
    console.log("chat_message:", data);
    data['event'] = 'chat_message';
    pubClient.publish("chatRadio", JSON.stringify(data));
  });

  socket.on('disconnect', function() {
    var data = {'event' : 'user_left', 'user' : userNick};
    console.log("disconnect:", data);
    pubClient.publish("chatRadio", JSON.stringify(data));
  })

  socket.on('nick_change', function(data) {
    console.log("nick_change:", data);
    userNick = data.new_nick;
    if(data["old_nick"].length > 0) {
      data['event'] = 'nick_change';
      pubClient.publish("chatRadio", JSON.stringify(data));
    } else {
      data['event'] = 'new_user';
      pubClient.publish("chatRadio", JSON.stringify(data));
    }
  })

  subClient.on('message', function(channel, data) {
    data = JSON.parse(data);
    console.log('message data:', data);
    switch (data.event) {
      case "chat_message":
        socket.emit("chat_message", {'msg' : data.msg, 'user' : data.user});
        break;

      case "user_left":
        socket.emit("user_left", {'user' : data.user});
        break;

      case "nick_change":
        socket.emit("nick_change", data);
        break;

      case "new_user":
        socket.emit("new_user", data);
        break;
    }
  })
});

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/../views/login.html');
});

app.get('/register', function(req, res) {
  res.sendFile(__dirname + '/../views/login.html');
})

app.post('/register', function(req, res) {
  if(userActions.validateUsername(req.body.userName)) {
    userActions.createUser(req, res);
  } else {
    res.send({'status':0, 'message':'Username already exists'});
  }
})

app.post('/api/login', function(req, res) {
  console.log(req.body, req.params, req.query);
})

http.listen(port, function(){
  console.log('listening on *:', port);
});
