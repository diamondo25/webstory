(function(context){
  context.onInitCallbacks = [];
  context.phaserLoaded = false;
  
  context.runOnInitialization = function (callback) {
    if (phaserLoaded) {
      callback(context);
    } else {
      context.onInitCallbacks.push(callback);
    }
  };
  
})(window);