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
      groups: ["testGroupB"],
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

  it("Should have been added to TestGroupB", function (done) {
    samsaara.nameSpace("test").execute("getGroups", function(groups){
      chai.assert.equal(groups.testGroupB, true);
      done();
    });
  });

});



describe("Messages to Groups", function () {


  it("Should have sent message to Everyone with CallBack", function (done) {

    this.timeout(4000);
    var sent = Date.now();

    setTimeout(function(){

      samsaara.nameSpace("test").execute("sendToAll", sent, function(received){        
        chai.assert.equal(sent, received);
        done();        
      });

    }, 1000);

  });

  it("Should have sent message to GroupB with CallBack", function (done) {

    this.timeout(4000);
    var sent = Date.now();

    setTimeout(function(){

      samsaara.nameSpace("test").execute("sendToGroupB", sent, function(received){        
        chai.assert.equal(sent, received);
        done();        
      });

    }, 1000);

  });


  it("Should wait before closing connection", function (done) {

    setTimeout(function(){
      done();
    }, 1000);
  });





});
