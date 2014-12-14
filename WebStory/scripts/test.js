(function (context) {
  context.getDataNode("Base.wz/zmap.img/null", function (obj) {
    var i = 0;
    var arr = {};
    for (var key in obj) {
      if (context.isReservedDataObject(key)) {
        continue;
      }
      arr[key] = i++;
    }
    
    context.zmap = arr;
  }, true);
  /*
  var backgroundSprite = null;
  
  context.getDataNode("UI.wz/CashShop.img/Base/backgrnd", function (obj) {
    console.log(obj);
    backgroundSprite = new context.Sprite(obj.uri, obj.width, obj.height, 0, 0);
  });
  
  context.frame.registerDrawCallback(0, function () {
    if (backgroundSprite != null) {
      backgroundSprite.drawAt(0, 0);
    }
  });*/
  
  var showFPS = true;
  if (showFPS) {
    var curtime = new Date();
    var frames = 0, lastFPS = 0;
    context.frame.registerDrawCallback(1000000, function () {
      frames++;
      
      this.font = "48px serif";
      this.fillStyle = '#000';
      this.fillText("FPS: " + lastFPS, 0, 48);
      
      var nextcurtime = new Date();
      if ((nextcurtime - curtime) > 1000) {
        lastFPS = frames;
        frames = 0;
        curtime = nextcurtime;
      }
    });
  }
  
  for (var i = 0; i < 20; i++) {
    for (var j = 0; j < 4; j++) {
      var player = new context.Player(i == 10);
      player.y = 120 + (j * 90);
      player.x = 30 + (i * 90);
    }
  }
})(window);