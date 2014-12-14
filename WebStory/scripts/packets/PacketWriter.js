(function(context) {
  function expandIfNeeded(size) {
    if (this.writtenData + size > this.buffer.length) {
      var oldBuffer = this.buffer;
      var newSize = this.buffer.length;

      while (newSize < (this.writtenData + size))
        newSize *= 2;

      var arr = new ArrayBuffer(~~newSize);
      arr.set(this.buffer.buffer);

      this.buffer = new DataView(arr);
    }
  }

  var PacketWriter = function PacketWriter(opCode) {
    this.buffer = new DataView(new ArrayBuffer(32));
    this.writtenData = 0;

    if (arguments.length > 0) {
      this.writeUInt16(opCode);
    }
  };

  PacketWriter.prototype = {
    writeInt8 : function(value) {
      expandIfNeeded.call(this, 1);
      this.buffer.setInt8(this.writtenData, value, true);
      this.writtenData += 1;
      return this;
    },

    writeInt16 : function(value) {
      expandIfNeeded.call(this, 2);
      this.buffer.setInt16(this.writtenData, value, true);
      this.writtenData += 2;
      return this;
    },

    writeInt32 : function(value) {
      expandIfNeeded.call(this, 4);
      this.buffer.setInt32(this.writtenData, value, true);
      this.writtenData += 4;
      return this;
    },

    writeUInt8 : function(value) {
      expandIfNeeded.call(this, 1);
      this.buffer.setUint8(this.writtenData, value, true);
      this.writtenData += 1;
      return this;
    },

    writeUInt16 : function(value) {
      expandIfNeeded.call(this, 2);
      this.buffer.setUint16(this.writtenData, value, true);
      this.writtenData += 2;
      return this;
    },

    writeUInt32 : function(value) {
      expandIfNeeded.call(this, 4);
      this.buffer.setUint32(this.writtenData, value, true);
      this.writtenData += 4;
      return this;
    },

    writeFloat32 : function(value) {
      expandIfNeeded.call(this, 4);
      this.buffer.setFloat32(this.writtenData, value, true);
      this.writtenData += 4;
      return this;
    },

    writeFloat64 : function(value) {
      expandIfNeeded.call(this, 8);
      this.buffer.setFloat64(this.writtenData, value, true);
      this.writtenData += 8;
      return this;
    },

    writeString : function(value, length) {
      if (value === null || typeof value === 'undefined')
        value = '';

      if (arguments.length == 1) {
        this.writeUInt16(value.length);

        expandIfNeeded.call(this, value.length);
        this.buffer.set(value, this.writtenData, value.length);
        this.writtenData += value.length;
      } else {
        expandIfNeeded.call(this, length);

        this.buffer.fill(0, this.writtenData, this.writtenData + length);
        this.buffer.set(value, this.writtenData, value.length);

        this.writtenData += length;
      }
      return this;
    },

    writeBytes : function(value) {
      for (var i = 0; i < value.length; i++) {
        this.writeUInt8(value[i]);
      }
      return this;
    },

    writeHexString : function(value) {
      value = value.replace(/[^0-9A-Fa-f]/g, '');
      if ((value.length % 2) !== 0)
        throw 'HexString is not a valid length. Text: ' + value;

      for (var i = 0; i < value.length; i += 2) {
        this.writeUInt8(parseInt(value.substr(i, 2), 16));
      }
      return this;
    }
  };

  context.PacketWriter = PacketWriter;
})(window);
