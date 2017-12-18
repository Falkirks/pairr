let TempMailbox = require('rr-guerrillamail');
let app = require('express')();
let server = require('http').Server(app);
let io = require('socket.io')(server);

let sharedState = {
  serviceOnline: true
};

server.listen(3000);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  socket.emit('server-hello', sharedState);
  socket.on('client-hello', function (data) {
    console.log("client connected");
  });
  socket.on('client-req-email', function (data) {
    let mailbox = new TempMailbox();

    mailbox.getEmailAddress()
      .then(function(addr) {
        socket.emit('server-gen-email', { email: addr });
      })
      .then(function() {
        return mailbox.waitForEmail(function(m) {
          return (m.mail_from === 'do_not_reply@oldadm.ubc.ca');
        });
      })
      .then(function(mail) {
        console.log(JSON.stringify(mail, null, 2));
        socket.emit('server-mail', mail);
        mailbox.deleteMail(mail.mail_id);
      });
  })
});