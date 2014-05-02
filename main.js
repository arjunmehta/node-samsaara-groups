/*!
 * Samsaara Groups Module
 * Copyright(c) 2013 Arjun Mehta <arjun@newlief.com>
 * MIT Licensed
 */



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

      groups[groupName] = {};

      if(config.redisStore === true){
        // config.redisClient.hsetnx("groups", groupName, 1, function (err, reply){  /*console.log("CREATED GROUP", groupName);*/ });
        // console.log("IPC MODULE", ipc);
        ipc.addRoute(groupName+"Messages", "GRP:"+groupName+":MSG", handleGroupMessage);
      }

      if(typeof callBack === "function") callBack(null, true);
    }
    else{
      if(typeof callBack === "function") callBack(new Error("Group Already Exists"), false);
    }
  }

  function addToGroup(connID, groupName, callBack){

    console.log("ADD TO GROUP", connID, groupName);

    if(groups[groupName] !== undefined && groups[groupName][connID] === undefined){
      groups[groupName][connID] = true;
      connectionController.connections[connID].groups.push(groupName);
      console.log(process.pid, moduleName, connID, "added to:", groupName);
      if(typeof callBack === "function") callBack(null, true);
    }
    else{
      console.log(process.pid, moduleName, connID, "trying to join Group:", groupName, ", but it does not exist!");
      if(typeof callBack === "function") callBack(new Error("Invalid Group: " + groupName), false);
    }
  }

  function addToGroups(connID, groupSet, callBack){
    
    var err = null,
        errSet = [],
        successSet = [];

    var groupName = "";

    for(var i=0; i < groupSet.length;i++){

      groupName = groupSet[i];

      if(groups[groupName] !== undefined && groups[groupName][connID] === undefined){
        groups[groupName][connID] = true;
        connectionController.connections[connID].groups.push(groupName);
        successSet.push(groupName);
        console.log(process.pid, connID, "Added to:", groupName);        
      }
      else{
        errSet.push(groupName);
        console.log(process.pid, connID, "Error joining group:", groupName);
      }
    }

    if(errSet.length) {
      err = new Error(errSet);
    }

    if(typeof callBack === "function") callBack(err, true);
    
  }

  function removeFromGroup(connID, groupName){
    if(groups[groupName][connID] !== undefined){
      delete groups[groupName][connID];
    }
  }


  function sendToGroup(groupName, packet, theCallBack){  

    //publish GRP:928y:MSG CB:29871298712:PRC:276kjshj::{...}
    //publish PRC:276kjsh:CB 29871298712::laka:ajha:lkjasalkj:jhakajh:kajhak

    communication.makeCallBack(6, packet, theCallBack, function (callBackID, packetReady){

      var packetPrefix;
      
      if(callBackID !== null){
        packetPrefix = "PRC:"+config.uuid+":CB:"+callBackID+"::";
        console.log(process.pid, "SENDING TO GROUP:", groupName, packetReady);
        ipc.publish("GRP:"+groupName+":MSG", packetPrefix+packetReady);
      }
      else{
        packetPrefix = "PRC:"+config.uuid+":CB:x::";
        ipc.publish("GRP:"+groupName+":MSG", packetPrefix+packetReady);
      }    

    });

  }


  /**
   * Router Methods
   */

  function handleGroupMessage(channel, message){

    var groupName = channel.split(":")[1];

    var index = message.indexOf("::");
    var groupRouteInfo = message.substr(0, index);
    var connMessage = message.slice(2+index-message.length);    

    var routeInfoSplit = groupRouteInfo.split(":");
    var callBackID = routeInfoSplit[1];
    var processID = routeInfoSplit[3];

    var connID, whichOne;

    console.log("GROUP MESSAGE:", groupName, callBackID, processID);
    
    if(callBackID !== "x"){

      var sendArray = [];
      var callBackList = "";

      for(connID in groups[groupName]){
        whichOne = connectionController.connections[connID];
        if(whichOne.connectionClass === "native"){
          sendArray.push(whichOne);
          callBackList += ":" + connID;
        }
      }

      console.log("PUBLISHING CALLBACK LIST", callBackID+callBackList);

      ipc.publish("PRC:"+processID+":CB", callBackID+callBackList);
      for(var i=0; i<sendArray.length; i++){
        communication.writeTo(sendArray[i], connMessage);
      }

      // What happens if a connection drops in the middle of this process?
    }
    else{
      for(connID in groups[groupName]){
        whichOne = connectionController.connections[connID];
        if (whichOne.connectionClass === "native"){
          communication.writeTo(whichOne, connMessage);
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

  function groupingInitialzation(opts, connection, attributes){
    if(opts.groups !== undefined){
      console.log("Initializing Grouping.....!!!", opts.groups, connection.id);
      attributes.force("grouping");
      opts.groups.push('everyone');
      addToGroups(connection.id, opts.groups, function (err, addedGroups){
        attributes.initialized(null, "grouping");
      });
    }
  }


  function groupingClosing(connection){
    var connID = connection.id;

    for(var key in groups){
      if(groups[key][connID] !== undefined){
        delete groups[key][connID];
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

    // console.log(samsaaraCore,);
    config = samsaaraCore.config;
    connectionController = samsaaraCore.connectionController;
    communication = samsaaraCore.communication;
    ipc = samsaaraCore.ipcRedis;

    createGroup("everyone");

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
        grouping: groupingInitialzation
      },

      connectionClose: {
        grouping: groupingClosing        
      }
    };

    return exported;

  };

}

module.exports = exports = grouping;
