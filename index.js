let app = require('express')();
let server = require('http').Server(app);
let io = require('socket.io')(server);
let randomstring = require("randomstring");
let bodyParser = require('body-parser');

let sharedState = {
  serviceOnline: true
};

server.listen(process.env.PORT || 3000);

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.post('/mailgun', function (req, res) {
  console.dir(req.body);
  if(req.body.sender && req.body.sender === 'do_not_reply@oldadm.ubc.ca'){
    console.log(req.body);
  }
  res.end('OK');
});

io.on('connection', function (socket) {
  socket.emit('server-hello', sharedState);
  socket.on('client-hello', function (data) {
    console.log("client connected");
  });
  socket.on('client-req-email', function (data) {
    socket.emit('server-gen-email', {email: randomstring.generate() + "@pairr.falkirks.com"});
  })
});