const utils = require('./utils.js');
const redisClient = utils.redisClient;
const router = require('express').Router();

router.post('/login', function(req, res) {
  console.log(req.body);
})

function createUser(req, res) {
  var user = {
    'user_id' : req.body.user_id,
    'password' : req.body.password
  }

  redisClient.get("users", function(error, response) {
    var users = JSON.parse(response.body) || [];
    users.push(user['user_id']);

    redisClient.set("users", JSON.stringify(users), function(error) {
      if(error) {
        res.send({'status' : 0, 'message' : 'Failed to create the user'});
      } else {
        res.send({'status' : 1, 'message' : 'New user created'});
      }
    })
  })

  redisClient.set(user['user_id'], JSON.stringify(user), function(error) {
    if(error) {
      console.log(error);
      res.send({'status' : 0, 'message' : 'Failed to create the user'});
    } else {
      console.log('New user created', user['user_id']);
      res.send({'status' : 1, 'message' : 'New user created'});
    }
  })
}
exports.createUser = createUser;

function validateUsername(userName) {
  redisClient.get(userName, function(error, response) {
    if(error || response.body) {
      console.log(error);
      return false;
    } else {
      return true;
    }
  })
}
exports.validateUsername = validateUsername;

function userLogin(req, res) {
  var user = req.body;

  redisClient.get(user.userName, function(error, response) {
    if(error) {
      console.log(error);
      res.send({'status' : 0, 'message' : 'Internak Error'});
    } else {
      if(response.body.password == user.password) {
        res.send({'status' : 1, 'loginSuccess' : true })
      } else {
        res.send({'status' : 1, 'loginSuccess' : false })
      }
    }
  })
}
exports.userLogin = userLogin;

module.exports = router;
