// debug.enable('samsaara:*');
debug.disable();


var executeDone;

var buildCallBack = function(done){
  return function(){
    done();
  };
};


samsaara.expose({

  singleMessage: function(arg, callBack){
    // console.log("received a time", arg);
    if(typeof callBack === "function") callBack(arg);
  }

});



describe("Initialize Samsaara", function () {

  before(function() {
    var samsaaraOptions = {
      socketPath: "/samsaaraTest"
    };

    samsaara.initialize(samsaaraOptions);

  });

  it("Has initialized", function (done) {
    samsaara.on("initialized", function(){

      chai.assert.equal("init", "init");
      done();

    }, false);      
  });
});




describe("Adding and Removing from Groups", function () {

  it("Should have been added to Everyone", function (done) {
    samsaara.nameSpace("test").execute("getGroups", function(groups){
      chai.assert.equal(groups.everyone, true);
      done();
    });
  });


  it("Should wait before closing connection", function (done) {

    this.timeout(3000);

    setTimeout(function(){
      done();
    }, 2000);
  });

});

