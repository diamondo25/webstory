var WebSocketServer = require('websocket').server;
var http = require('http');
var Client = require('./net/Client');

var server = http.createServer(function(request, response) {
  console.log((new Date()) + ' Received request for ' + request.url);
  response.writeHead(404);
  response.end();
});
server.listen(8080, function() {
  console.log((new Date()) + ' Server is listening on port 8080');
});

require('./dataserver');

var wsServer = new WebSocketServer({
  httpServer : server,
  // You should not use autoAcceptConnections for production
  // applications, as it defeats all standard cross-origin protection
  // facilities built into the protocol and the browser. You should
  // *always* verify the connection's origin and decide whether or not
  // to accept it.
  autoAcceptConnections : false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

function connectToServer(connection, ip, port) {
  // connection.msClient = new Client("8.31.99.142", 8484, connection);
  connection.msClient = new Client(ip, port, connection);

  connection.msClient.on('connected', function() {
    connection.sendJson({
      type : 'connected',
      msg : "Connected biaats"
    });
  });

  connection.msClient.on('handshake', function(info) {
    connection.sendJson({
      type : 'handshaked',
      handshake : info
    });
  });

  connection.msClient.on('packet', function(packet) {
    connection.sendBytes(packet);
  });
}

wsServer.on('request', function(request) {
  if (!originIsAllowed(request.origin)) {
    // Make sure we only accept requests from an allowed origin
    request.reject();
    console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
    return;
  }

  var connection = null;
  try {
    connection = request.accept('maplestory', request.origin);
  } catch (ex) {
    return;
  }
  console.log((new Date()) + ' Connection accepted.');

  connection.sendJson = function(json) {
    this.sendUTF(JSON.stringify(json));
  };

  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      var obj = JSON.parse(message.utf8Data);
      if (obj.type == 'connect') {
        connectToServer(connection, obj.ip, obj.port);
      }

    } else if (message.type === 'binary') {
      if (connection.msClient) {
        connection.msClient.sendPacket(message.binaryData);
      }
    }
  });
  connection.on('close', function(reasonCode, description) {
    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
  });
});
