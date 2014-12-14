(function(context) {
  var PacketReader = function PacketReader(data) {
    var bytes = new Uint8Array(data);
    this.length = data.byteLength;
    this.buffer = new DataView(bytes.buffer);
    this.offset = 0;
  };

  PacketReader.prototype = {
    readInt8 : function() {
      var ret = this.buffer.getInt8(this.offset);
      this.offset += 1;
      return ret;
    },

    readInt16 : function() {
      var ret = this.buffer.getInt16(this.offset, true);
      this.offset += 2;
      return ret;
    },

    readInt32 : function() {
      var ret = this.buffer.getInt32(this.offset, true);
      this.offset += 4;
      return ret;
    },

    readUInt8 : function() {
      var ret = this.buffer.getUint8(this.offset);
      this.offset += 1;
      return ret;
    },

    readUInt16 : function() {
      var ret = this.buffer.getUint16(this.offset, true);
      this.offset += 2;
      return ret;
    },

    readUInt32 : function() {
      var ret = this.buffer.getUint32(this.offset, true);
      this.offset += 4;
      return ret;
    },

    readFloat32 : function() {
      var ret = this.buffer.getFloat32(this.offset, true);
      this.offset += 4;
      return ret;
    },

    readFloat64 : function() {
      var ret = this.buffer.getFloat64(this.offset, true);
      this.offset += 8;
      return ret;
    },

    readString : function(length) {
      length = length || this.readUInt16();
      var ret = '';
      while (length--) {
        var byte = this.readUInt8();
        if (byte === 0) {
          break;
        }
        ret += String.fromCharCode(byte);
      }
      return ret;
    },

    skip : function(pAmount) {
      this.offset += pAmount;
    },

    getBytesRepresentation : function() {
      var str = '';
      for (var i = 0; i < this.length; i++) {
        var char = this.buffer.getUint8(i).toString(16).toUpperCase();
        if (char.length == 1)
          char = '0' + char;
        str += char + ' ';
      }

      return str.trim();
    }
  };

  context.PacketReader = PacketReader;
})(window);
