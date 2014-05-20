/*!
 * Samsaara Local Group Constructor
 * Copyright(c) 2014 Arjun Mehta <arjun@newlief.com>
 * MIT Licensed
 */

var debug = require('debug')('samsaara:groups:localgroup');


var samsaara,
    config,
    connectionController,
    connections,
    communication;

var groups;


function initialize(samsaaraCore, groupsObj){

  samsaara = samsaaraCore;
  config = samsaaraCore.config;
  connectionController = samsaaraCore.connectionController;
  communication = samsaaraCore.communication;
  connections = connectionController.connections;
  
  groups = groupsObj;

  return LocalGroup;
}



function LocalGroup(groupName){

  this.id = this.name = groupName;

  this.count = 0;
  this.members = {};

}


LocalGroup.prototype.add = function(connection){

  var connID = connection.id;
  var groupName = this.id;

  if(this.members[connID] === undefined){

    this.count++;
    this.members[connID] = true;
    connection.groups[groupName] = true;

    debug("addToGroup New group member", connID, "added to:", groupName);

    return true;
  }
  else{

    debug("addToGroup Failed adding group member", connID, "trying to join Group:", groupName, ", but it does not exist!, or connection already added");
    return false;
  }

};


LocalGroup.prototype.remove = function(connection){

  var connID = connection.id;

  if(this.members[connID] !== undefined){
    delete connection.groups[this.id];
    delete this.members[connID];
    this.count--;
  }

};


LocalGroup.prototype.execute = function(packet, callback){
  
  var connection;
  var groupMembers = this.members;

  communication.makeCallBack(0, packet, callback, function (incomingCallBack, packetReady){

    for(var connID in groupMembers){
      connection = connections[connID];
      if(incomingCallBack !== null){
        incomingCallBack.addConnection(connection.id);
      }
      connection.write(packetReady);
    }
  });
};


LocalGroup.prototype.write = function(message){
  for(var i=0; i<this.members.length; i++){
    communication.writeTo(this.members[i], message);
  }
};



module.exports = exports = {
  initialize: initialize,
  LocalGroup: LocalGroup
};
