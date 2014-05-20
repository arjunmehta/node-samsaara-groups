/*!
 * Samsaara Groups Module
 * Copyright(c) 2014 Arjun Mehta <arjun@newlief.com>
 * MIT Licensed
 */

var debug = require('debug')('samsaara:groups:main');

function grouping(options){

  var config,
      connectionController,
      communication,
      ipc;

  var LocalGroup, GlobalGroup,
      groups = {};


  
  // 
  // Foundation Methods
  // 

  var createGroup;

  function group(groupName){
    if(groups[groupName]){
      return groups[groupName];
    }
  }

  function createLocalGroup(groupName, memberArray){
    if(groups[groupName] === undefined){
      groups[groupName] = new LocalGroup(groupName, memberArray);      
    }

    return groups[groupName];
  }
 

  function createGlobalGroup(groupName, memberArray, callBack){

    // need to consider ipc here.

    if(groups[groupName] === undefined){
      groups[groupName] = new GlobalGroup(groupName, memberArray); // new Group(groupName)
      if(typeof callBack === "function") callBack(null, true);
    }
    else{
      if(typeof callBack === "function") callBack(new Error("Group Already Exists"), false);
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

  function connectionInitialization(opts, connection, attributes){

    connection.groups = {};

    if(opts.groups !== undefined){

      debug("Initializing Grouping.....!!!", opts.groups, connection.id);

      attributes.force("groups");
      opts.groups.push('everyone');

      var groupsAdded = {};
      for (var i = 0; i < opts.groups.length; i++) {
        groupsAdded[opts.groups[i]] = group(opts.groups[i]).add(connection);
      }
      debug("Initialization Add to Groups", groupsAdded);

      attributes.initialized(null, "groups");
    }
  }


  function connectionClosing(connection){
    var connID = connection.id;

    if(connection.groups){
      debug("Disconnecting Client", connID, connection.groups);
      for(var groupName in connection.groups){
        group(groupName).remove(connection);
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
    ipc = samsaaraCore.ipc;

    LocalGroup = require('./localgroup').initialize(samsaaraCore, groups);
    GlobalGroup = require('./globalgroup').initialize(samsaaraCore, groups);

    if(samsaaraCore.capability.ipc === true){
      createGroup = createGlobalGroup;
    }
    else{
      createGroup = createLocalGroup;
    }

    createGroup("everyone");

    samsaaraCore.addClientFileRoute("samsaara-groups.js", __dirname + '/client/samsaara-groups.js');

    var exported = {

      name: "groups",

      main: {
        group: group,   
        createGroup: createGroup,     
        createGlobalGroup: createGlobalGroup,
        createLocalGroup: createLocalGroup
      },

      connectionInitialization: {
        grouping: connectionInitialization
      },

      connectionClose: {
        grouping: connectionClosing
      },

      constructors: {
        LocalGroup: LocalGroup,
        GlobalGroup: GlobalGroup
      }
    };

    return exported;

  };

}

module.exports = exports = grouping;
