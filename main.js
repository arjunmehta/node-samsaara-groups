/*!
 * Samsaara Groups Module
 * Copyright(c) 2014 Arjun Mehta <arjun@newlief.com>
 * MIT Licensed
 */

var debug = require('debug')('samsaara:groups');

function grouping(options){

  var config,
      connectionController,
      communication,
      ipc;

  var Group;

  var groups = {};


  /**
   * Foundation Methods
   */

  function createGroup(groupName, callBack){

    if(groups[groupName] === undefined){
      groups[groupName] = { count:0, members:{} };
      if(typeof callBack === "function") callBack(null, true);
    }
    else{
      if(typeof callBack === "function") callBack(new Error("Group Already Exists"), false);
    }
  }

  function addToGroup(connID, groupName){

    // debug("ADD TO GROUP", connID, groupName);

    var group = groups[groupName];

    if(group !== undefined && group.members[connID] === undefined){

      if(config.interProcess === true && group.count === 0){
        ipc.addRoute(groupName+"Messages", "GRP:"+groupName+":MSG", handleGroupMessage);
      }

      group.count++;
      group.members[connID] = true;
      connectionController.connections[connID].groups.push(groupName);
      debug("addToGroup New group member", connID, "added to:", groupName);

      return true;
    }
    else{
      debug("addToGroup Failed adding group member", connID, "trying to join Group:", groupName, ", but it does not exist!, or connection already added");
      return false;
    }
  }

  function addToGroups(connID, groupSet, callBack){

    var err = null,
        errSet = [],
        successSet = [];

    var groupName = "";

    for(var i=0; i < groupSet.length;i++){

      groupName = groupSet[i];
      var addedToGroup = addToGroup(connID, groupName);

      if(addedToGroup === true){
        successSet.push(groupName);
        debug("addToGroups New group member", connID, "added to:", groupName);
      }
      else{
        errSet.push(groupName);
        debug("addToGroups Failed adding group member", connID, "trying to join Group:", groupName, ", but it does not exist!, or connection already added");
      }
    }

    if(errSet.length) {
      err = new Error(errSet);
    }

    if(typeof callBack === "function") callBack(err, successSet);

  }

  function removeFromGroup(connID, groupName){
    var group = groups[groupName];

    if(group.members[connID] !== undefined){
      group.members.count--;
      delete group.members[connID];

      if(config.interProcess === true && group.count === 0){
        ipc.removeRoute(groupName+"Messages");
      }
    }

  }


  function sendToGroupIPC(groupName, packet, theCallBack){

    //publish GRP:928y:MSG CB:29871298712:PRC:276kjshj::{...}

    ipc.store.pubsub("NUMSUB", "GRP:"+groupName+":MSG", function(err, reply){

      debug("sendToGroupIPC Number subscribed to group:", config.uuid, groupName, ~~reply[1], reply);

      communication.makeCallBack(~~reply[1], packet, theCallBack, function (callBackID, packetReady){

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

  }


  /**
   * Send To The Group (without IPC)
   */

  function sendToGroup(groupName, packet, theCallBack){

    var connection;
    var group = groups[groupName].members;

    if(group !== undefined){
      communication.makeCallBack(0, packet, theCallBack, function (callBackID, packetReady){

        for(var connID in group){
          connection = connectionController.connections[connID];
          if(callBackID !== null){
            communication.incomingCallBacks[callBackID].addConnection(connection.id);
          }
          communication.writeTo(connection, packetReady);
        }
      });
    }
    else{
      throw new Error("Group: " + groupName + " does not exist.");
    }
  }


  /**
   * Router Methods (With IPC)
   */

  function handleGroupMessage(channel, message){

    //channel looks like GRP:everyone:MSG
    //message looks like CB:2987129dsf8712:PRC:276kjshj::{...}

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
        // debug("Group Message with Callback:", groups, groupName, connID);
        connection = connectionController.connections[connID];
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
        connection = connectionController.connections[connID];
        if (connection.owner === config.uuid){
          communication.writeTo(connection, connMessage);
        }
      }
    }
  }


  /**
   * Connection Initialization Methods
   * Called for every new connection
   *
   * @opts: {Object} contains the connection's options
   * @connection: {SamsaaraConnection} the connection that is initializing
   * @attributes: {Attributes} The attributes of the SamsaaraConnection and its methods
   */

  function connectionInitialzation(opts, connection, attributes){

    connection.groups = [];

    if(opts.groups !== undefined){
      debug("Initializing Grouping.....!!!", opts.groups, connection.id);
      attributes.force("grouping");
      opts.groups.push('everyone');
      addToGroups(connection.id, opts.groups, function (err, addedGroups){
        debug("Initialization Add to Groups", err, addedGroups);
        attributes.initialized(null, "grouping");
      });
    }
  }


  function connectionClosing(connection){
    var connID = connection.id;

    if(connection.groups){
      for(var i=0; i < connection.groups.length; i++){
        if(groups[connection.groups[i]].members[connID] !== undefined){
          delete groups[connection.groups[i]].members[connID];
        }
      }
    }
  }


  /**
   * Module Return Function.
   * Within this function you should set up and return your samsaara middleWare exported
   * object. Your eported object can contain:
   * name, foundation, remoteMethods, connectionInitialization, connectionClose
   */

  return function grouping(samsaaraCore){

    // debug(samsaaraCore,);
    config = samsaaraCore.config;
    connectionController = samsaaraCore.connectionController;
    communication = samsaaraCore.communication;
    ipc = samsaaraCore.ipcRedis;

    createGroup("everyone");

    samsaaraCore.addClientFileRoute("samsaara-groups.js", __dirname + '/client/samsaara-groups.js');

    var exported = {

      name: "grouping",

      foundationMethods: {
        groups: groups,
        createGroup: createGroup,
        addToGroup: addToGroup,
        removeFromGroup: removeFromGroup,
        sendToGroup: sendToGroup
      },

      remoteMethods: {
      },

      connectionInitialization: {
        grouping: connectionInitialzation
      },

      connectionClose: {
        grouping: connectionClosing
      }
    };

    if(config.interProcess === true){
      exported.foundationMethods.sendToGroup = sendToGroupIPC;
    }

    return exported;

  };

}

module.exports = exports = grouping;
