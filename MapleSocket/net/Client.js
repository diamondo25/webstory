var Crypto = require('./Crypto').Crypto;
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var PacketReader = require('./PacketReader');
var MapleKeys = require('./MapleKeys');

var handleData = function(client, receivedData) {
  var _socket = client._socket;
  var crypto = client.crypto;
  _socket.pause();

  var temp = _socket.buffer;
  _socket.buffer = Buffer.concat([ temp, receivedData ]);

  while (_socket.nextBlockLen <= _socket.buffer.length) {
    var readingBlock = _socket.nextBlockLen;

    var data = _socket.buffer;

    var block = new Buffer(_socket.nextBlockLen);
    data.copy(block, 0, 0, block.length);
    _socket.buffer = new Buffer(data.length - block.length);
    data.copy(_socket.buffer, 0, block.length);

    if (_socket.header) {
      if (!_socket.gotHandshake) {
        _socket.nextBlockLen = block[0] | (block[1] << 8);
      } else {
        _socket.nextBlockLen = crypto.getLengthFromHeader(block);
      }
    } else {
      _socket.nextBlockLen = 4;
      if (_socket.gotHandshake) {
        crypto.decryptData(block, _socket.clientSequence);
        _socket.clientSequence = crypto.morphSequence(_socket.clientSequence);
      }

      var reader = new PacketReader(block);

      console.log('got data');
      console.log(block);
      if (!_socket.gotHandshake) {
        _socket.gotHandshake = true;

        // Read handshake
        var handshake = {
          version : reader.readUInt16(),
          subversion : parseInt(reader.readString(), 10)
        };

        client.version = handshake.version;

        _socket.serverSequence = reader.readBytes(4);
        _socket.clientSequence = reader.readBytes(4);

        handshake.locale = reader.readUInt8();

        crypto = client.crypto = new Crypto(handshake.version, handshake.locale);
        crypto.changeAESKey(MapleKeys.getKey(handshake.locale, handshake.version, handshake.subversion));

        client.emit('handshake', handshake);
      }

      client.emit('packet', reader.buffer);
    }

    _socket.header = !_socket.header;
  }

  _socket.resume();
};

function Client(ip, port, webclient) {
  var _client = this;
  _client._webClient = webclient;

  var _socket = this._socket = require('net').createConnection({
    host : ip,
    port : port
  }, function() {
    console.log('Connected to server @ ' + ip + ':' + port);
    _client.emit('connected');
  });

  _socket.clientSequence = null;
  _socket.serverSequence = null;
  _socket.header = true;
  _socket.nextBlockLen = 2;
  _socket.buffer = new Buffer(0);
  _socket.gotHandshake = false;

  _socket.on('data', function(data) {
    handleData(_client, data);
  });

  _socket.on('close', function() {
    console.log('Connection closed.');
    _client._webClient.close(1000, 'Someone shut the door!!!!');
  });

  _socket.on('error', function(error) {
    console.log('Error?');
    console.log(error);
    _client._webClient.close(1000, 'Someone errorred!!!!');
  });
}

util.inherits(Client, EventEmitter);

Client.prototype.sendPacket = function(packetBuffer) {
  var buffer = new Buffer(4);
  this.crypto.generateHeader(buffer, this._socket.serverSequence, packetBuffer.length);
  this._socket.write(buffer);

  buffer = packetBuffer;
  this.crypto.encryptData(buffer, this._socket.serverSequence);

  this._socket.serverSequence = this.crypto.morphSequence(this._socket.serverSequence);

  this._socket.write(buffer);
};

Client.prototype.disconnect = function(reason) {
  if (arguments.length !== 0) {
    console.log('Disconnecting client. Reason: ' + reason);
  } else {
    console.log('Disconnecting client.');
  }

  this._socket.end();
  this._socket.destroy();
};

module.exports = Client;
