/*!
 * Samsaara Global/IPC Group Constructor
 * Copyright(c) 2014 Arjun Mehta <arjun@newlief.com>
 * MIT Licensed
 */

var debug = require('debug')('samsaara:groups:globalgroup');

var samsaara,
    config,
    connectionController,
    connections,
    communication,
    ipc;

var groups;


function initialize(samsaaraCore, groupsObj){
  samsaara = samsaaraCore;
  config = samsaaraCore.config;
  connectionController = samsaaraCore.connectionController;
  communication = samsaaraCore.communication;
  ipc = samsaaraCore.ipc;

  connections = connectionController.connections;

  groups = groupsObj;

  return GlobalGroup;
}



function GlobalGroup(groupName){

  this.id = this.name = groupName;

  this.count = 0;
  this.members = {};
}


GlobalGroup.prototype.add = function(connection){

  var connID = connection.id;
  var groupName = this.id;

  if(this.members[connID] === undefined){

    if(config.interProcess === true && this.count === 0){
      ipc.addRoute(groupName+"Messages", "GRP:"+groupName+":MSG", handleGroupExecute);
    }

    this.count++;
    this.members[connID] = true;
    connection.groups[groupName] = true;

    debug("GlobalGroup add() Success for member", connID, groupName);

    return true;
  }
  else{

    debug("GlobalGroup add() Failed, connection already added", connID, groupName);
    return false;
  }

};


GlobalGroup.prototype.remove = function(connection){

  if(this.members[connection.id] !== undefined){
    delete connection.groups[this.id];
    delete this.members[connection.id];
    this.count--;
  }

  if(config.interProcess === true && this.count === 0){
    ipc.removeRoute(this.id+"Messages");
  }

};


GlobalGroup.prototype.execute = function(packet, callback){
  
  var connection;
  var groupName = this.id;

  ipc.store.pubsub("NUMSUB", "GRP:"+groupName+":MSG", function(err, reply){

    debug("sendToGroupIPC Number subscribed to group:", config.uuid, groupName, ~~reply[1], reply);

    communication.makeCallBack(~~reply[1], packet, callback, function (callBackID, packetReady){

      var packetPrefix;

      if(callBackID !== null){
        packetPrefix = "PRC:"+config.uuid+":CB:"+callBackID+"::";
        // debug(process.pid, "SENDING TO GROUP:", groupName, packetReady);
        ipc.publish("GRP:"+groupName+":MSG", packetPrefix+packetReady);
      }
      else{
        packetPrefix = "PRC:"+config.uuid+":CB:x::";
        ipc.publish("GRP:"+groupName+":MSG", packetPrefix+packetReady);
      }

    });

  });

};


GlobalGroup.prototype.write = function(message){

  var connection;

  for(var i=0; i<this.members.length; i++){
    connection = connections[this.members[i]];

    if(connection && connection.owner === config.uuid){
      connection.write(message);
    }
  }
};


// 
// IPC route for new group messages.
// 

function handleGroupExecute(channel, message){

  // channel looks like GRP:everyone:MSG
  // message looks like PRC:276kjshj:CB:2987129dsf8712::{...}
  // refer to execute method above to see details

  var groupName = channel.split(":")[1];

  var index = message.indexOf("::");
  var groupRouteInfo = message.substr(0, index);
  var connMessage = message.slice(2+index-message.length);

  var routeInfoSplit = groupRouteInfo.split(":");
  var processID = routeInfoSplit[1];
  var callBackID = routeInfoSplit[3];

  var connID, connection;

  debug("Group Message", config.uuid, groupName, callBackID, processID);

  if(callBackID !== "x"){

    var sendArray = [];
    var callBackList = "";

    for(connID in groups[groupName].members){

      connection = samsaara.connection(connID);
      debug("Group Message with Callback:", groups[groupName].members, groupName, connID);
     
      if(connection.owner === config.uuid){
        sendArray.push(connection);
        callBackList += ":" + connID;
      }
    }

    debug("Publishing Callback List", config.uuid, processID, callBackID+callBackList);

    //publish message looks like PRC:276kjsh:CB 29871298712::laka:ajha:lkjasalkj:jhakajh:kajhak

    ipc.sendCallBackList(processID, callBackID, callBackList);

    for(var i=0; i<sendArray.length; i++){
      communication.writeTo(sendArray[i], connMessage);
    }

  }
  else{
    for(connID in groups[groupName].members){
      connection = samsaara.connection(connID);
      if (connection.owner === config.uuid){
        communication.writeTo(connection, connMessage);
      }
    }
  }
}


module.exports = exports = {
  initialize: initialize,
  GlobalGroup: GlobalGroup
};

