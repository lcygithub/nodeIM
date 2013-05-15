
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

//
var app = express.createServer();

// all environments
// app.set('port', process.env.PORT || 3000);
// app.set('views', __dirname + '/views');
// app.set('view engine', 'html');
// app.set('layout', true);
// app.engine('html', require('jqtpl').__express);
// app.use(express.favicon());
// app.use(express.logger('dev'));
// app.use(express.bodyParser());
// app.use(express.methodOverride());
// app.use(app.router);
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.cookieParser());
// app.use(express.cookieSession({
//     secret: settings.cookie_secret,
//     store: new MongoStore({
//       db: settings.db
//     })
// }));
app.configure(function() {
app.set('view engine', 'html');
app.set('view options', { layout: false });
app.register(".html", jqtpl.express);
app.set('views',  __dirname + '/views');
app.use(express.errorHandler());
app.use(express.cookieParser());
app.use(express.session({ secret: 'doc_sign' }));
app.use(express.methodOverride());
app.use(express.bodyParser());
});
// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// app.get('/', routes.index);
app.get('/', function(req, res) {
    fs.readFile(__dirname + '/views/index.html', 'utf-8', function(err, data) {
        if(err) {
            console.log(err);
        } else {
            var html = jqtpl.render(data);
            res.end(html);
        }
    });
});

app.get('/login', function(req, res) {
    fs.readFile(__dirname + '/views/login.html', 'utf-8', function(err, data) {
        if(err) {
            console.log(err);
        } else {
            var html = jqtpl.render(data);
            // console.log(html);
            res.end(html);
        }
    });
});

app.post('/login', function(req, res) {
  req.session.user = "lcyang";
  console.log(req.body);
  console.log(req.session);
  // console.log(req);

  // console.log(req.body);
  res.redirect('login');
  // if (req.body['username'])
});

app.post('/reg', function(req, res) {
  // console.log(req.body);
});

// var server = http.createServer(app);
// var io = require('socket.io').listen(server);
// server.listen(app.get('port'), function(){
//   console.log('Express server listening on port ' + app.get('port'));
// });

// io.sockets.on('connection', function (socket) {
//   socket.on('recvmsg', function (data) {
//     console.log(data);
//     socket.broadcast.emit(data.touser, data);
//   });
//   socket.on('disconnect', function () {
//     // var name = name;
//     // console.log(name);
//     // socket.broadcast.emit(data.touser, data);
//   });
// });
app.listen(3000);