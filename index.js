let app = require('express')();
let http = require('http');
let server = http.Server(app);
let io = require('socket.io')(server);
let randomstring = require("randomstring");
let bodyParser = require('body-parser');
let request = require('request');

let sharedState = {
  serviceOnline: true,
  enableLocal: true
};
let emailToSock = {

};

const findEmailForSock = (sock) => {
  for(const email in emailToSock) {
    if (emailToSock.hasOwnProperty(email)) {
      if(emailToSock[email] === sock){
        return email;
      }
    }
  }
  return false;
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
      const attachment = JSON.parse(req.body.attachments);
      console.log("fetching from " + attachment[0].url);

      request({
        url: attachment[0].url,
        auth: {
          user: 'api',
          pass: process.env.MAILGUN_API_KEY
        }
      }, function (error, response, body) {
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

io.on('connection', (socket) => {
  socket.emit('server-hello', sharedState);
  socket.on('client-hello', function (data) {
    console.log("client connected");
  });
  socket.on('client-req-email', (data) => {
    const email = findEmailForSock(socket) || randomstring.generate() + "@pairr.falkirks.com";
    emailToSock[email] = socket;
    socket.emit('server-gen-email', {email: email});
  });

  socket.on('disconnect', (reason) => {
    const email = findEmailForSock(socket);
    if(email !== false){
      emailToSock[email] = undefined;
    }
    console.log("client disconnected");
  });
});

console.log("server listening?...");