var Accomplishment = require('../db').models.Accomplishment
  , Hashtag = require('../db').models.Hashtag
  , User = require('../db').models.User
  , loadUsers = require('../helpers/loadUsers')
  , map = require('lodash').map
  , nodemailer = require('nodemailer');

exports.list = function(req, res, next){
  Accomplishment
    .find({})
    .select('text user_id updated')
    .limit(50)
    .sort('-updated')
    .exec(function (err, accomplishments) {
      if(err)
        return next(err);

      if(accomplishments.length === 0)
        return res.send([]);

      loadUsers(accomplishments, function (err, results) {
        if(err)
          return next(err);

        res.send(results);
      });
    });
};

exports.create = function(req, res, next){
  if(!req.session.user_id) {
    return res.send(403, {
        error: 'Not authenticated'
      });
  }
  User
    .findOne({_id: req.session.user_id}, function (err, user) {
      if(err)
        return next(err);

      if(!user)
        return res.send(403, {
            error: 'Not authenticated'
          });

      Accomplishment.create({
        text: req.body.text
      , user_id: req.session.user_id
      }, function (err, data) {
        var dat
          , re = /#\S+/g
          , hashtags
          , finish
          , makeHash;

        makeHash = function (e) {
          return {
            name: e.substring(1)
          , accompishment_id: data._id
          };
        };

        finish = function () {
          dat = {
            id: data._id
          , text: data.text
          , user_id: data.user_id
          , updated: data.updated
          };

          res.send(dat);

          if(res.io) {
            dat.user = {
              id: user._id
            , firstname: user.firstname
            , lastname: user.lastname
            , email: user.email
            };
            delete dat.user_id;
            res.io.broadcast('accomplishment', dat);
          }
        };

        if(err)
          return next(err);

        hashtags = data.text.match(re);
        if (hashtags === null){
          finish();
        }
        else {
          Hashtag.create(
            map(hashtags, makeHash)
          , function (err) {
            if(err)
              return next(err);
            finish();
          });
        }
      });
    });  
};

exports.mail = function(req, res){
  var smtpTransport = nodemailer.createTransport("SMTP", {
      service: "Gmail",
      auth:{
          user: "team@founders.illinois.edu",
          pass: process.env.TEAM_PASSWORD
      }
  });

  var mailOptions = {
    from: "Founders Team <team@founders.illinois.edu>", // sender address
    to: "jay.bensal@gmail.com", // list of receivers
    subject: "Reminder from Pulse!", // Subject line
    text: "I noticed that you haven't worked on your project in a while.. you should do that!", // plaintext body
  };

  smtpTransport.sendMail(mailOptions, function(error, response){
    if(error){
        console.log(error);
    }else{
        console.log("Message sent: " + response.message);
    }
    // if you don't want to use this transport object anymore, uncomment following line
    //smtpTransport.close(); // shut down the connection pool, no more messages
  });
};
