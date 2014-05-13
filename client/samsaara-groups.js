var samsaaraGroups = (function(module){

  module.internalMethods = {
    addToGroups: function(callBack){
      if(typeof callBack === "function") callBack( true );
    }
  };

  module.initializationMethods = {};
  module.closeMethods = {};

  return module;

}(this.samsaaraGroups = this.samsaaraGroups || {}));

samsaara.use(samsaaraGroups);