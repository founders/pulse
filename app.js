
/**
 * Module dependencies.
 */

var express = require('express')
  , path = require('path')
  , config = require('./config')
  , users = require('./routes/users')
  , accomplishments = require('./routes/accomplishments')
  , comments = require('./routes/comments')
  , reset = require('./routes/reset')
  , app = express();

// all environments
app.set('port', process.env.PORT || 4000);
app.use(express.favicon());
app.use(express.logger('tiny'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.cookieSession({
  secret: config.session.secret
, cookie: { maxAge: 60 * 60 * 1000 }
}));

if(process.env.NODE_ENV == 'production')
  app.use(express.csrf());

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.errorHandler());

app.post('/login', users.auth);
app.post('/logout', users.unauth);

app.get('/users', users.list);
app.post('/users', users.create);
app.get('/users/:id', users.view);

app.get('/accomplishments', accomplishments.list);
app.post('/accomplishments', accomplishments.create);
app.delete('/accomplishments/:id', accomplishments.remove);

app.get('/comments', comments.list);
app.post('/comments', comments.create);
app.delete('/comments/:id', comments.remove);

if(process.env.NODE_ENV != 'production')
  app.get('/reset', reset);

app.get('/token', function (req, res) {
  res.send({token: req.csrfToken()});
});

module.exports = app;
