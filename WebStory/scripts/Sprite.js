(function(context) {

  var spriteStore = {};
  var spriteCounter = 0;

  context.getOrCreateSprite = function(node) {
    if (!node['_image']) {
      console.error('Got node that is not an image.');
      return null
    }

    if (!node._image.sprite) {
      node._image.sprite = new Sprite(node['_image']['uri'], node['_image']['width'], node['_image']['height'],
          node['origin']['X'], node['origin']['Y']);
    }
    return node._image.sprite;
  };

  var Sprite = function Sprite(dataUri, width, height, originX, originY) {
    var spriteInstance = this;
    this.width = width;
    this.height = height;
    this.originX = originX;
    this.originY = originY;

    if (dataUri in spriteStore) {
      this.cacheKey = spriteStore[dataUri];
    } else {
      spriteCounter++;
      this.cacheKey = spriteStore[dataUri] = 'DYNLOAD-' + spriteCounter;

      var data = new Image();
      data.src = dataUri;
      context.frame.game.cache.addImage(this.cacheKey, dataUri, data);
    }

    // context.frame.game.load.image(dataUri, dataUri);
  };

  Sprite.prototype.drawAt = function(x, y, flip) {
    return;
    if (this.loaded === false) {
      return;
    }
    flip = flip === true;
    var realx = x - this.originX;
    var realy = y - this.originY;

    context.frame.drawImage(this, realx, realy, this.width, this.height, flip);
  };

  context.Sprite = Sprite;

})(window);
