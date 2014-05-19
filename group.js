/*!
 * Samsaara Local Group Constructor
 * Copyright(c) 2014 Arjun Mehta <arjun@newlief.com>
 * MIT Licensed
 */


var samsaara,
    connections,
    communication,
    ipc;

var groups;



function initialize(samsaaraCore, groupsObj){
  samsaara = samsaaraCore;
  connections = samsaaraCore.connections;
  communication = samsaaraCore.communication;
  ipc = samsaaraCore.ipc;

  groups = groupsObj;

}


function Group(groupName){

  this.id = this.name = groupName;

  this.count = 0;
  this.members = {};

}


Group.prototype.add = function(connection){

  var connID = connection.id;
  var groupName = this.id;

  if(this.members[connID] === undefined){

    this.count++;
    this.members[connID] = true;
    connection.groups.push(groupName);

    debug("addToGroup New group member", connID, "added to:", groupName);

    return true;
  }
  else{

    debug("addToGroup Failed adding group member", connID, "trying to join Group:", groupName, ", but it does not exist!, or connection already added");
    return false;
  }

};


Group.prototype.remove = function(connection){

  if(this.members[connID] !== undefined){
    delete this.members[connID];
    this.count--;
  }
};


Group.prototype.execute = function(packet, callback){
  
  var connection;
  var groupMembers = this.members;

  communication.makeCallBack(0, packet, callback, function (callBackID, packetReady){

    for(var connID in groupMembers){
      connection = connections[connID];
      if(callBackID !== null){
        communication.incomingCallBacks[callBackID].addConnection(connection.id);
      }
      connection.write(packetReady);
    }
  });
};


Group.prototype.write = function(message){
  for(var i=0; i<this.members.length; i++){
    communication.writeTo(this.members[i], message);
  }
};



