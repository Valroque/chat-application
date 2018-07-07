const utils = require('./utils.js');
const redisClient = utils.redisClient;
const router = require('express').Router();
const path = require('path');

router.route('/register')
.get(function(req, res) {
  res.sendFile(path.resolve(__dirname, '../views/signUp.html'));
})
.post(function(req, res) {
    if(req.body.userName && req.body.password) {
      redisClient.get(req.body.userName, function(error, response) {
        if(error) {
          console.log(error);
          res.send({status : 0, message : "Could not sign you up.Please try again after some time."});
        } else if(response == null) {
          redisClient.set(req.body.userName, req.body.password, function(error) {
            if(error) {
              console.log(error);
              res.send({status : 0, message : "Could not sign you up.Please try again after some time."});
            } else {
              req.session.userId = req.body.userName;
              res.send({status : 1});
            }
          })
        } else if(response) {
          res.send({status : 0, message : "Sorry this username has already been taken."});
        }
      })
    } else {
      res.sendStatus(403);
    }
})

router.post('/login', function(req, res) {
  if(req.body.userName && req.body.password) {
    redisClient.get(req.body.userName, function(error, response) {
      if(error) {
        console.log(error);
        res.send({ status : 0, message : "Uable to login. Please try again."});
      } else {
        if(response) {
          if(response == req.body.password) {
            req.session.userId = req.body.userName;
            console.log('session Updated:', req.session.userId);
            res.send({ status : 1 });
          } else {
            res.send({ status : 0, message : "Wrong Password." });
          }
        } else {
          res.send({ status : 0, message : "User does not exist." });
        }
      }
    })
  }
})

module.exports = router;
