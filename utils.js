var redis = require("redis");
var chatServer = {
  'host' : 'localhost',
  'port' : '6379'
}

var redisClient = redis.createClient(chatServer);
exports.redisClient = redisClient;

var pubClient = redis.createClient(chatServer);
exports.pubClient = pubClient;

var subClient = redis.createClient(chatServer);
subClient.subscribe("chatRadio");
exports.subClient = subClient;
