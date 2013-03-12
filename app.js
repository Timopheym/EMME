var express = require('express')
  , fs = require('fs')
  , mongoose = require('mongoose')
  , user = require('./models/user')
  , artel = require('./models/artel')
  , result = require('./models/result')
  , routes = require('./routes')
  , sockets = require('./sockets')
  , connect = require('express/node_modules/connect')
  , RedisStore = require('connect-redis')(express)
  , sessionStore = new RedisStore()
  , app = express.createServer()
  , sio;
var logFile = fs.createWriteStream('./myLogFile.log', {flags: 'a'});
app.configure(function () {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());

  app.use(express.logger());
  //app.use(express.logger('dev'));
//  app.use(express.logger({stream: logFile}));
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(express.static(__dirname + '/public'));
  app.use(express.cookieParser('keyboard cat'));
  app.use(express.session({
    secret: 'keyboard cat',
    key: 'express.sid',
    store: sessionStore
  }));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
});

app.configure('development', function () {
  app.use(express.errorHandler());
});

routes.init(app);
mongoose.connect("127.0.0.1", "emme", 27017);

app.listen(3000);

sio = require('socket.io').listen(app/*,{ log: false }*/);
sockets.init(sio, sessionStore);

console.log("Express server listening on port 3000");
