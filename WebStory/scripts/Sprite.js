(function(context) {

  var spriteStore = {};
  var spriteCounter = 0;

  context.getOrCreateSprite = function(node) {
    if (!node['_image']) {
      console.error('Got node that is not an image.');
      return null
    }

    if (!node._image.sprite) {
      var origin = {
        x : node['origin'] ? node['origin']['X'] : 0,
        y : node['origin'] ? node['origin']['Y'] : 0
      }
      node._image.sprite = new Sprite(node['_image']['uri'], node['_image']['width'], node['_image']['height'],
          origin.x, origin.y);
    }
    return node._image.sprite;
  };
  
  var hashCode = function(text) {
    var hash = 0, i, chr, len;
    if (text.length == 0) return hash;
    for (i = 0, len = text.length; i < len; i++) {
      chr   = text.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  };

  var Sprite = function Sprite(dataUri, width, height, originX, originY) {
    var spriteInstance = this;
    this.width = width;
    this.height = height;
    this.originX = originX;
    this.originY = originY;

    var dataUriHash = hashCode(dataUri);
    
    if (dataUriHash in spriteStore) {
      this.cacheKey = spriteStore[dataUriHash];
    } else {
      spriteCounter++;
      this.cacheKey = spriteStore[dataUriHash] = 'DYNLOAD-' + spriteCounter;

      dataUri = 'data:image/png;base64,' + dataUri;
      
      var data = new Image();
      data.src = dataUri;
      context.frame.game.cache.addImage(this.cacheKey, '', data);
    }

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
