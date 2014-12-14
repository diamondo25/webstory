(function(context){
  
  context.getOrCreateSprite = function (node) {
    if (!node['_image']) {
      console.error('Got node that is not an image.');
      return null
    }
    
    if (!node._image.sprite) {
      node._image.sprite = new Sprite(node['_image']['uri'], node['_image']['width'],
          node['_image']['height'], node['origin']['X'], node['origin']['Y']);
    }
    return node._image.sprite;
  };
  
  var Sprite = function Sprite(dataUri, width, height, originX, originY) {
    var spriteInstance = this;
    this.width = width;
    this.height = height;
    this.originX = originX;
    this.originY = originY;

    this.loaded = false;
    
    this.image = new Image();
    this.image.onload = function() {
      spriteInstance.loaded = true;
    };
    this.image.src = dataUri;
  };
  
  
  Sprite.prototype.drawAt = function (x, y, flip) {
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