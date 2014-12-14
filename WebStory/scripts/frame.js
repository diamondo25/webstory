(function(context) {
  var frame = context.frame = {};
  var canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  canvas.setAttribute('width', canvas.width);
  canvas.setAttribute('height', canvas.height);
  document.body.appendChild(canvas);

  var ctx = canvas.getContext("2d");

  var drawCallbacks = {};
  var layers = [];

  frame.drawImage = function(sprite, x, y, width, height, flip) {
    if (flip === true) {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(sprite.image, -width + x, y, width, height);
      ctx.scale(1, 1);
      ctx.restore();
    } else {
      ctx.drawImage(sprite.image, x, y, width, height);
    }
  };

  frame.registerDrawCallback = function(layer, callback) {
    if (!drawCallbacks[layer]) {
      drawCallbacks[layer] = [];
      layers.push(layer);
    }
    drawCallbacks[layer].push(callback);
  };

  var requestAnimFrame = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame
        || window.oRequestAnimationFrame || window.msRequestAnimationFrame
        || function(/* function FrameRequestCallback */callback, /*
                                                                   * DOMElement
                                                                   * Element
                                                                   */element) {
          return window.setTimeout(callback, 1000 / 60);
        };
  })();

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (var i = 0; i < layers.length; i++) {
      var layer = layers[i];
      
      drawCallbacks[layer].forEach(function(cmd) {
        cmd.apply(ctx);
      });
    }

    requestAnimFrame(render, canvas);
  }

  requestAnimFrame(render, canvas);

})(window);
