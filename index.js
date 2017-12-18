let app = require('express')();
let http = require('http');
let server = http.Server(app);
let io = require('socket.io')(server);
let randomstring = require("randomstring");
let bodyParser = require('body-parser');
let request = require('request');

let sharedState = {
  serviceOnline: true
};
let emailToSock = {

};

server.listen(process.env.PORT || 3000);

app.use( bodyParser.json({limit: '2mb'}) );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true,
  limit: '2mb'
}));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.post('/mailgun', function (req, res) {
  console.dir(req.body);
  const socket = emailToSock[req.body.To];
  if(socket !== undefined){
    if(req.body.attachments !== undefined){
      const attachment = JSON.parse(str);
      console.log("fetching from " + attachment[0].url);

      request({url: 'https://api:' + process.env.MAILGUN_API_KEY + '@' + attachment[0].url}, function (error, response, body) {
        console.log(body);
        socket.emit('server-pair-data', {
          csv: body
        });
      });

    }
    else{
      socket.emit('server-use-csv', {});
    }
  }
  res.end('OK');
});

io.on('connection', function (socket) {
  socket.emit('server-hello', sharedState);
  socket.on('client-hello', function (data) {
    console.log("client connected");
  });
  socket.on('client-req-email', function (data) {
    // Just ignore collisions ;)
    const email =  randomstring.generate() + "@pairr.falkirks.com";
    emailToSock[email] = socket;
    socket.emit('server-gen-email', {email: email});
  });
});

console.log("server listening?...");