(function(context) {
  var frame = context.frame = {};
  
  var game = frame.game = new Phaser.Game(800, 600, Phaser.AUTO, '', { create: create, update: update });
  function create() {
    for (var i = 0; i < context.onInitCallbacks.length; i++) {
      context.onInitCallbacks[i](context);
    }
    context.phaserLoaded = true;
  }
  

  var updateCallbacks = [];

  frame.registerUpdateCallback = function(callback) {
    updateCallbacks.push(callback);
  };

  function update() {
    var elapsedTime = game.time.now;
    updateCallbacks.forEach(function(cmd) {
      cmd.call(game, elapsedTime);
    });
  }

})(window);
