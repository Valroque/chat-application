const express = require('express');
const app = express();
const path = require('path');
var session = require('express-session');
var redisStore = require('connect-redis')(session);
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var port = process.env.PORT || 3000;
var io = require('socket.io')(http);
const utils = require('./routes/utils.js');
const redisClient = utils.redisClient;
const subClient = utils.subClient;
const pubClient = utils.pubClient;


app.use(express.static('public'));
app.set('views', __dirname + '/views');
app.use(session({
  'secret' : 'keyboard cat',
  'store': new redisStore({
    host: 'localhost',
    port: 6379,
    disableTTL: true
  }),
  'cookie' : {
    path: '/',
    httpOnly: true,
    secure: false,
    maxAge: 24*60*60*1000
  },
  'saveUninitialized' : false,
  'resave' : false
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//defaults
var userNick = "Annonymous"
var connections = 0;

//middlewares
var checkLoggedIn = function(req, res, next) {
  console.log("Session:", req.sessionID);
  if(req.session && req.session.userId) {
    next();
  } else {
    res.sendFile(path.resolve(__dirname, './views/login.html'));
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

app.use('/auth', require('./routes/auth.js'));

app.get('/', checkLoggedIn, function(req, res) {
  res.sendFile(path.resolve(__dirname, './views/index.html'));
});

app.use('/userActions', checkLoggedIn, require('./routes/usersActions.js'));

http.listen(port, function(){
  console.log('listening on *:', port);
});
