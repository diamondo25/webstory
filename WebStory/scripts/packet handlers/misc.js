packethandlers[0x0011] = function (packet) {
  var pw = new PacketWriter(0x0019);
  sendPacket(pw);
};
