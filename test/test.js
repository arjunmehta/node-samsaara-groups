var http = require('http');
var path = require('path');

var express = require('express');
var app = express();

var server = http.createServer(app);


app.use("/", express.static( path.resolve(__dirname) ));


var samsaara = require('samsaara');
var groups = require('../main.js');

samsaara.use(groups());

var samsaaraOpts = {
  socketPath: "/samsaaraTest",
  heartBeatThreshold: 11000
};


samsaara.initialize(server, app, samsaaraOpts);

samsaara.createGroup("testGroupA");
samsaara.createGroup("testGroupB");
samsaara.createGroup("testGroupBB");

var test = {};

samsaara.createNamespace("test", test);


test.sendToAll = function(arg, callBack){

  var count = 0;

  samsaara.group("everyone").execute("singleMessage", arg, function(argg){
    count++;
    // console.log("Count", count, samsaara.group("everyone").count);
    if(count === samsaara.group("everyone").count){
      if(typeof callBack === "function") callBack(argg);
    }
  });  
};



test.sendToGroupB = function(arg, callBack){

  var count = 0;

  samsaara.group("testGroupB").execute("singleMessage", arg, function(argg){
    count++;
    // console.log("Count", count, samsaara.group("testGroupB").count);
    if(count === samsaara.group("testGroupB").count){
      if(typeof callBack === "function") callBack(argg);
    }
  });  
};



test.getGroups = function(callBack){
  // console.log("Testing Get Groups", this);
  if(typeof callBack === "function") callBack(this.groups);
};

test.groupMessage = function(groupName, callBack){
  samsaara.group(groupName).execute("clientGroupMessageWCallBack", function(received){
    if(typeof callBack === "function") callBack(received);
  });
};

samsaara.expose(test);


server.listen(9999);