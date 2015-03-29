var express = require('express');

var util = require("util");

var app = express(),
  http = require('http'),
  server = http.createServer(app);
  var WebSocketServer = require('websocket').server;

var sys = require('sys');
var config = require('./config.json');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var logger = require('morgan');


var channels = {};
var clients = [];










app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
app.use(logger());

  app.use(cookieParser());
  //app.use(express.bodyParser());
  app.use(bodyParser());
  //app.use(express.methodOverride());
  app.use(require('method-override')())
  app.use(session({ secret: 'keyboard dog', key: 'sid', cookie: { secure: true , maxAge: 3600000}}));


app.use(express.static(__dirname + '/public'));









app.get('/about', function(req, res) {
  res.render('about', {});
});

/*

app.get('/card/:id', function(req, res) {
  var objectId = req.params.id;
  var o_id = new BSON.ObjectID(objectId);
  db.collection('transmissions', function(err, transCollection) {
    transCollection.findOne({
        '_id': o_id
      },
      function(err, item) {
        //console.log(util.inspect(item));
        if (item) {
          var time = new Date(item.time);
          var timeString = time.toLocaleTimeString("en-US");
          var dateString = time.toDateString();
          res.render('card', {
            item: item,
            channel: channels[item.talkgroup],
            time: timeString,
            date: dateString
          });

        } else {
          res.send(404, 'Sorry, we cannot find that!');
        }
      });
  });
});






app.get('/call/:id', function(req, res) {
  var objectId = req.params.id;
  var o_id = new BSON.ObjectID(objectId);
  db.collection('transmissions', function(err, transCollection) {
    transCollection.findOne({
        '_id': o_id
      },
      function(err, item) {
        //console.log(util.inspect(item));
        if (item) {
          var time = new Date(item.time);
          var timeString = time.toLocaleTimeString("en-US");
          var dateString = time.toDateString();

          res.render('call', {
            item: item,
            channel: channels[item.talkgroup],
            talkgroup: item.talkgroup,
            time: timeString,
            date: dateString,
            objectId: objectId,
            freq: item.freq,
            srcList: item.srcList,
            audioErrors: item.audioErrors,
            headerErrors: item.headerErrors,
            headerCriticalErrors: item.headerCriticalErrors,
            symbCount: item.symbCount,
            recNum: item.recNum
          });

        } else {
          res.send(404, 'Sorry, we cannot find that!');
        }
      });
  });
});
*/




app.get('/scanner/newer/:time', function(req, res) {

  var filter_date = parseInt(req.params.time);
  var user = req.user;




  if (!filter_date) {
    var filter_date = "''";
  } else {
    var filter_date = "new Date(" + filter_date + ")";
  }

  res.render('player', {
    filter_date: filter_date,
    filter_code: "",
    user: user
  });
});


app.get('/scanner/newer/:time/:filter_code', function(req, res) {
  var filter_code = req.params.filter_code;
  var filter_date = parseInt(req.params.time);
  var user = req.user;


  if (!filter_code) filter_code = "";

  if (!filter_date) {
    var filter_date = "''";
  } else {
    var filter_date = "new Date(" + filter_date + ")";
  }

  res.render('player', {
    filter_date: filter_date,
    filter_code: filter_code,
    user: user
  });
});


app.get('/scanner', function(req, res) {

  var filter_date = parseInt(req.params.time);
  var user = req.user;




  var filter_date = "''";


  res.render('player', {
    filter_date: filter_date,
    filter_code: "",
    user: user
  });
});

app.get('/scanner/:filter_code', function(req, res) {
  var filter_code = req.params.filter_code;
  var filter_date = parseInt(req.params.time);
  var user = req.user;

  if (!filter_code) filter_code = "";


  var filter_date = "''";


  res.render('player', {
    filter_date: filter_date,
    filter_code: filter_code,
    user: user
  });
});



app.get('/', function(req, res) {
  var filter_code = "";
  var filter_date = "''";
  var user = req.user;
  res.render('player', {
    filter_date: filter_date,
    filter_code: filter_code,
    user: user
  });
});

app.post('/', function(req, res) {
  var filter_code = req.body.filter_code;
  if (!filter_code) filter_code = "";
  var filter_date = "new Date('" + req.body.filter_date + "');";
  if (!filter_date) filter_date = "\'\'";
  var user = req.user;
  res.render('player', {
    filter_date: filter_date,
    filter_code: filter_code,
    user: user
  });
});

/*
app.get('/sources', function(req, res) {
  res.render('sources');
});

app.get('/afil', function(req, res) {
  res.render('afil', {});
});

app.get('/stats', function(req, res) {
  res.render('stats', {});
});
app.get('/volume', function(req, res) {
  res.contentType('json');
  res.send(JSON.stringify(stats));
});
app.get('/affiliation', function(req, res) {
  res.contentType('json');
  res.send(JSON.stringify(affiliations));
});
app.get('/source_list', function(req, res) {
  res.contentType('json');
  
  res.send(JSON.stringify(sources));
});

app.get('/clients', function(req, res) {
  res.render('clients', {clients: clients});
});
*/

function notify_clients(call) {
  call.type = "calls";
  console.log("New Call sending to " + clients.length + " clients");
  for (var i = 0; i < clients.length; i++) {
    //console.log(util.inspect(clients[i].socket));
    if (clients[i].code == "") {
      //console.log("Call TG # is set to All");
      console.log(" - Sending one");
      clients[i].socket.send(JSON.stringify(call));
    } else {
      if (typeof talkgroup_filters[clients[i].code] !== "undefined") {
        //console.log("Talkgroup filter found: " + clients[i].code);

        if (talkgroup_filters[clients[i].code].indexOf(call.talkgroup) > -1) {
          //console.log("Call TG # Found in filer");
          console.log(" - Sending one filter");
          clients[i].socket.send(JSON.stringify(call));
        }
      }
    }
  }
}



server.listen(3004);