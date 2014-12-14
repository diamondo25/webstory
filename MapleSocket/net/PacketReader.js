var PacketReader = function PacketReader(data) {
  this.buffer = new Buffer(data.length);
  data.copy(this.buffer);

  this.offset = 0;
};

PacketReader.prototype = {
  readInt8 : function() {
    var ret = this.buffer.readInt8(this.offset);
    this.offset += 1;
    return ret;
  },

  readInt16 : function() {
    var ret = this.buffer.readInt16LE(this.offset);
    this.offset += 2;
    return ret;
  },

  readInt32 : function() {
    var ret = this.buffer.readInt32LE(this.offset);
    this.offset += 4;
    return ret;
  },

  readUInt8 : function() {
    var ret = this.buffer.readUInt8(this.offset);
    this.offset += 1;
    return ret;
  },

  readUInt16 : function() {
    var ret = this.buffer.readUInt16LE(this.offset);
    this.offset += 2;
    return ret;
  },

  readUInt32 : function() {
    var ret = this.buffer.readUInt32LE(this.offset);
    this.offset += 4;
    return ret;
  },

  readFloat32 : function() {
    var ret = this.buffer.readFloatLE(this.offset);
    this.offset += 4;
    return ret;
  },

  readFloat64 : function() {
    var ret = this.buffer.readDoubleLE(this.offset);
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

  readBytes : function(length) {
    var ret = new Buffer(length);
    this.buffer.copy(ret, 0, this.offset, this.offset + length);
    this.offset += length;
    return ret;
  },

  skip : function(pAmount) {
    this.offset += pAmount;
  }
};

module.exports = PacketReader;
