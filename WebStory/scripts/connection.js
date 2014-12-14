(function(context) {
  context.packethandlers = {};
  // if user is running mozilla then use it's built-in WebSocket
  window.WebSocket = window.WebSocket || window.MozWebSocket;

  var socket = new WebSocket('ws://127.0.0.1:8080', 'maplestory');
/*
  console = window.console || {};
  console._log = console.log;
  console.log = function(text) {
    var logwindow = document.getElementById('logwindow');
    var current = logwindow.innerHTML;

    if (typeof text === 'object') {
      try {
      text = JSON.stringify(text, null, 4);
      } catch (ex) {
        text = String(text);
      }
    }

    logwindow.innerHTML = text + '<br>' + current;
    this._log(text);
  };*/

  socket.onopen = function() {
    // socket is opened and ready to use
    socket.send(JSON.stringify({
      type : 'connect',
      ip : '127.0.0.1',
      port : 8484
    }));
  };

  socket.onerror = function(error) {
    console.log(error);
  };
  socket.onclose = function(error) {
    console.log(error);
  };

  socket.onmessage = function(message) {
    var data = message.data;
    if (typeof data === 'string') {
      var obj = JSON.parse(data);
      console.log(obj);
      /*
       * if (obj.type == 'handshaked') { var pw = new PacketWriter(0x0014);
       * pw.writeUInt8(obj.handshake.locale);
       * pw.writeUInt16(obj.handshake.version);
       * pw.writeUInt16(obj.handshake.subversion); sendPacket(pw); }
       */
    } else if (data instanceof Blob) {
      fileReader.readAsArrayBuffer(data);
    } else {
      console.warn('I dont know what to do with this');
      console.warn(message);
    }
  };

  var fileReader = new FileReader();
  fileReader.onload = function() {
    handlePacket(new context.PacketReader(this.result));
  };

  context.sendPacket = function sendPacket(packet) {
    var buffert = packet.buffer.buffer;
    socket.send(new Blob([ buffert.slice(0, packet.writtenData) ]));
  };

  function handlePacket(reader) {
    var opcode = reader.readUInt16();
    console.log('PACKET INBOUND: ' + reader.getBytesRepresentation());

    if (opcode in packethandlers) {
      context.packethandlers[opcode]();
    } else {
      console.log('No handler found...');
    }
  }
})(window);
