
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
//
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.set('layout', true);
app.engine('html', require('jqtpl').__express);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

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
            var html = jqtpl.render(data, {name: 'Kof'});
            res.end(html);
        }
    });
});

app.get('/users', user.list);
var server = http.createServer(app);
var io = require('socket.io').listen(server);
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

io.sockets.on('connection', function (socket) {
  socket.on('recvmsg', function (data) {
    socket.emit(data.touser, data);
  });
});