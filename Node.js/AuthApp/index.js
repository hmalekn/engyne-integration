/**
 * Module dependencies.
 */

"use strict";

var express = require('express');
var hash = require('pbkdf2-password')();
var path = require('path');
var session = require('express-session');
var passService = require('./pass-service');

var app = module.exports = express();

// config

var server = require('./server.json');
//console.log(server);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// middleware

app.use(express.urlencoded({ extended: false }))
app.use(session({
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: 'shhhh, very secret'
}));

// Session-persisted message middleware

app.use(function(req, res, next){
  var err = req.session.error;
  var msg = req.session.success;
  delete req.session.error;
  delete req.session.success;
  res.locals.message = '';
  if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
  if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
  next();
});

// serve static files
app.use('/public', express.static("public"));

// dummy database

var users = {
  'tj': { name: 'theo jules' }
};

// when you create a user, generate a salt
// and hash the password ('foobar' is the pass here)

hash({ password: 'foobar' }, function (err, pass, salt, hash) {
  if (err) throw err;
  // store the salt & hash in the "db"
  users['tj'].salt = salt;
  users['tj'].hash = hash;
});


// Authenticate using our plain-object database of doom!

function authenticate(name, pass, success, failure) {
  if (!module.parent) 
    console.log('Authenticating with DB %s:%s', name, pass);

  var user = users[name];
  // query the db for the given username
  if (!user) 
    return failure('Cannot find user');

  // apply the same algorithm to the POSTed password, applying
  // the hash against the pass / salt, if there is a match we
  // found the user
  hash({ password: pass, salt: user.salt }, function (err, pass, salt, hash) {
    if (err) 
      return failure(err);

    if (hash == user.hash) 
      return success(user);

    failure('Invalid password');
  });
}

// Authenticate using Vlobe pass

function authenticateVlobePass(authToken, sessionId, success, failure) {
  if (!module.parent) 
    console.log('Authenticating with Vlobe Pass %s:%s', authToken, sessionId);

  passService.promiseAuthenticate(server, authToken, sessionId)
  .then(result => {
    var userId = result.userId;
    if (userId) {
      if (!users[userId]) {
        users[userId] = { userId: userId };
      }
      var user = users[userId];
      user.emailAddress = result.emailAddress;
      user.displayName = result.displayName;
      user.model = result.model;
      user.os = result.os;
      user.version = result.version;
      success(user);
    } else
      failure("Empty user Id");
    })
  .catch(err => failure(err));
}

function restrict(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.redirect('/login');
  }
}

app.get('/', function(req, res){
  res.redirect('/login');
});

app.get('/restricted', restrict, function(req, res) {
  res.send('Wahoo! restricted area. Click to <a href="/logout">logout</a>.' + res.locals.message);
});

app.get('/logout', function(req, res){
  // destroy the user's session to log them out
  // will be re-created next request
  req.session.destroy(function(){
    res.redirect('/');
  });
});

app.get('/login', function(req, res) {
  passService.promiseAuthInfo(server)
  .then(json => { 
    const barcode = passService.barcodeURL(server, json);
    res.render('login', { json, server, barcode });
  });
});

app.post('/login', function(req, res) {
  function authenticateSuccess(user) {
      // Regenerate session when signing in
      // to prevent fixation
      req.session.regenerate(function() {
        // Store the user's primary key
        // in the session store to be retrieved,
        // or in this case the entire user object
        req.session.user = user;
        req.session.success = 'Authenticated! You are now accessing <a href="/restricted">/restricted</a>.';
        req.session.success += '<p><table>';
        for (var property in user) {
            req.session.success += '<tr><td>' + property + ': </td><td>' + user[property] + '</td></tr>';
        }
        req.session.success += '</table>';
        res.redirect('/restricted');
      });
  }
    
  function authenticateFailure(err) {
    console.log(err);
    req.session.error = 'Authentication failed, please check your credentials.'
    res.redirect('/login');
  }

  authenticate(req.body.username, req.body.password, authenticateSuccess, err => {
    console.log(err);
    authenticateVlobePass(req.body.authtoken, req.body.sessionid, authenticateSuccess, authenticateFailure);
  });
});

/* istanbul ignore next */
if (!module.parent) {
  app.listen(3000);
  console.log('Express started on port 3000');
}