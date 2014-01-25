
/**
 * Module dependencies.
 */

var express = require('express')
  , path = require('path')
  , config = require('./config')
  , users = require('./routes/users')
  , accomplishments = require('./routes/accomplishments')
  , comments = require('./routes/comments')
  , timeline = require('./routes/timeline')
  , reset = require('./routes/reset')
  , socketio = require('./middleware/socketio')
  , errorHandler = require('./middleware/error')
  , canon = require('canonical-host')('http://pulse.founders.is')
  , app = express();

app.set('port', process.env.PORT || 4000);

if(process.env.NODE_ENV == 'production')
  app.use(canon);

app.use(express.favicon());
app.use(express.logger(process.env.NODE_ENV == 'production' ? 'default' : 'tiny'));
app.use(express.json());
app.use(express.query());
app.use(express.urlencoded());
app.use(express.cookieParser());
app.use(express.cookieSession({
  secret: config.session.secret
  // Keep folk logged in for a month at a time
, cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }
}));
app.use(socketio.middleware);
app.use(express.static(path.join(__dirname, 'public')));

// Logs you in
app.post('/login', users.auth);
// Logs you out
app.post('/logout', users.unauth);

// Tells you who you are logged in as
app.get('/whoami', users.whoami);
// Tells you things about a person who may/may not be registered
app.get('/whois/:netid', users.whois);

// Show all registered users
app.get('/users', users.list);
// Register a new user
app.post('/users', users.create);
// Tells you things about a user
app.get('/users/:id', users.view);

// Show all accomplishments
app.get('/accomplishments', accomplishments.list);
// Create a new accomplishment
app.post('/accomplishments', accomplishments.create);

// Show comments after an accomplishment
app.get('/comments', comments.list);
// Create a comment
app.post('/comments', comments.create);

// Load the timeline
app.get('/timeline', timeline.list);

if(process.env.NODE_ENV != 'production')
  app.get('/reset', reset);

app.use(errorHandler);

module.exports = app;
