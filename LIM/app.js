
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , jqtpl = require('jqtpl')
  , fs = require('fs')
  , path = require('path');

var MongoStore = require('connect-mongo')(express);
var settings = require('./settings');
var User = require('./models/user.js');
//
var app = express();

// all environments
app.use(express.cookieParser());
app.use(express.cookieSession({
    secret: settings.cookie_secret,
    store: new MongoStore({
      db: settings.db
    })
}));
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.set('layout', true);
app.engine('html', require('jqtpl').__express);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


app.get('/', checkLogin);
app.get('/', function(req, res) {
  // console.log("session")
  // console.log(req.session)
  if (!req.session.user) {
    return res.redirect('/login')
  }
    fs.readFile(__dirname + '/views/index.html', 'utf-8', function(err, data) {
        if(err) {
            console.log(err);
        } else {
          var html = jqtpl.render(data, {"user":req.session.user});
          res.end(html);
        }
    });
});

app.get('/login', checkNotLogin);
app.get('/login', function(req, res) {
  fs.readFile(__dirname + '/views/login.html', 'utf-8', function(err, data) {
      if(err) {
          console.log(err);
      } else {
          var html = jqtpl.render(data);
          res.end(html);
      }
  });
});

function htmlmaker(dic) {
  var res = [];
  for (friend in dic) {
    var s = '<li><a href="#"><i class="icon-user"><\/i>'
    s += dic[friend].name;
    s += '<\/a><\/li>'
    res.push(s)
  }
  return res;
}

app.post('/getfriend', checkLogin);
app.post('/getfriend', function(req, res) {
  User.getfriend(req.session.user.name, function(err, friends) {
    if (err) {
      console.log("err");
    }
    console.log(htmlmaker(friends));
    msg = JSON.stringify({
        "stat": true,
        "friends": htmlmaker(friends),
    })
    res.statusCode = 200;
    res.setHeader("Content-Type","application/json");
    return res.end(msg);
  }); 
});

app.post('/login', checkNotLogin);
app.post('/login', function(req, res) {
  console.log(req.session);
  var newUser = new User({
    name: req.body.logusername,
    password: req.body.logpassword,
  });

  User.get(newUser.name, function(err, user) {
    if (user) {
      if (newUser.password === user.password) {
        req.session.user = user;
        console.log(req.session);
        return res.redirect('/');
      } else {
        return res.redirect('/login');
      }
    }

    if (err) {
      return res.redirect('/login');
    } else {
      return res.redirect('/login');
    }
  });
});

app.post('/reg', checkNotLogin);
app.post('/reg', function(req, res) {
  if (req.body['password'] !== req.body['repassword']) {
    msg = JSON.stringify({
        "stat": false,
        "err": "wrong password!",
    })
    res.statusCode = 200;
    res.setHeader("Content-Type","application/json");
    return res.end(msg);
  }
  var newUser = new User({
    name: req.body.username,
    password: req.body.password,
    friends: []
  });
  User.get(newUser.name, function(err, user) {
    if (user) {
      console.log("user exist!");
      msg = JSON.stringify({
        "stat": false,
        "err": "user exist!",
      })
      res.statusCode = 200;
      res.setHeader("Content-Type","application/json");
      return res.end(msg);
    }
    if (err) {
      console.log("database error");
      msg = JSON.stringify({
        "stat": false,
        "err": "database error!",
      })
      res.statusCode = 200;
      res.setHeader("Content-Type","application/json");
      return res.end(msg);
    }
    newUser.save(function(err) {
      if (err) {
        console.log("save error!");
        msg = JSON.stringify({
          "stat": false,
          "err": "",
        })
        res.statusCode = 200;
        res.setHeader("Content-Type","application/json");
        return res.end(msg);
      } else {
        console.log('success!');
        msg = JSON.stringify({
          "stat": true,
        })
        res.writeHead(200, {"Content-Type":"application/json; charset=utf-8","Content-Length":msg.length});
        return res.end(msg);
      }
    });
  });
});

app.get('/logout', checkLogin)
app.get('/logout', function(req, res) {
  req.session.user = null;
  res.redirect('/');
});

app.post('/find', checkLogin);
app.post('/find', function(req, res) {
  console.log('find');
  console.log("body:");
  console.log(req.body);
  User.get(req.body.username, function(err, user) {
    if (user) {
      console.log("get user:");
      console.log(user);
      User.savefriend(req.session.user.name, req.body.username, function(err) {
        if (!err) {
          console.log("success!");
          msg = JSON.stringify({
            "stat": true,
            "name": req.body.username,
          })
          res.statusCode = 200;
          res.setHeader("Content-Type","application/json");
          return res.end(msg);
        } else {
          console.log("exit!");
          msg = JSON.stringify({
            "stat": false,
            "err": "frind exit!",
          })
          res.statusCode = 200;
          res.setHeader("Content-Type","application/json");
          return res.end(msg);
        }
      });

    }
    if (err) {
      msg = JSON.stringify({
        "stat": false,
        "err": "database err",
      })
      res.statusCode = 200;
      res.setHeader("Content-Type","application/json");
      return res.end(msg);
    }
    if (!user) {
      msg = JSON.stringify({
        "stat": false,
        "err": "no this people!",
      })
      res.statusCode = 200;
      res.setHeader("Content-Type","application/json");
      return res.end(msg);
    }
  });
});

function checkLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
}

function checkNotLogin(req, res, next) {
  if (req.session.user) {
    return res.redirect('/');
  }
  next();
}

var server = http.createServer(app);
var io = require('socket.io').listen(server);
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

io.sockets.on('connection', function (socket) {
  socket.on('recvmsg', function (data) {
    console.log(data);
    socket.broadcast.emit(data.touser, data);
  });
  socket.on('disconnect', function () {
    console.log("logout");
  });
});
