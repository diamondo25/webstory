(function(context) {
  var frame = context.frame = {};

  var game = frame.game = new Phaser.Game(800, 600, Phaser.AUTO, '', {
    create : create,
    update : update,
    render : render
  });

  var cursors = null;

  function create() {

    game.mapLayer = game.add.group();
    game.playerLayer = game.add.group();
    game.uiLayer = game.add.group();

    for (var i = 0; i < context.onInitCallbacks.length; i++) {
      context.onInitCallbacks[i](context);
    }
    context.phaserLoaded = true;
    cursors = game.input.keyboard.createCursorKeys();
  }

  var updateCallbacks = [];

  frame.registerUpdateCallback = function(callback) {
    updateCallbacks.push(callback);
  };

  function update() {
    var elapsedTime = game.time.time;

    updateCallbacks.forEach(function(cmd) {
      cmd.call(game, elapsedTime);
    });

    doMovement();
  }

  var renderCallbacks = [];

  frame.registerRenderCallback = function(callback) {
    renderCallbacks.push(callback);
  };

  function render() {
    var elapsedTime = game.time.time;
    renderCallbacks.forEach(function(cmd) {
      cmd.call(game, elapsedTime);
    });
  }

  function doMovement() {
    if (!context.thisPlayer) {
      return;
    }

    context.thisPlayer.physics.left = cursors.left.isDown;
    context.thisPlayer.physics.right = cursors.right.isDown;
    context.thisPlayer.physics.up = cursors.up.isDown;
    context.thisPlayer.physics.down = cursors.down.isDown;

    if (cursors.left.isDown) {
      context.thisPlayer.flip = false;
    } else if (cursors.right.isDown) {
      context.thisPlayer.flip = true;
    }
  }
})(window);
