/*!
 * Samsaara Local Group Constructor
 * Copyright(c) 2014 Arjun Mehta <arjun@newlief.com>
 * MIT Licensed
 */

var debug = require('debugit').add('samsaara:groups:Group');

var samsaara;
var executionController;


function initialize(core, executionCtrl) {
    samsaara = core;
    executionController = executionCtrl;

    return Group;
}


function Group(groupName, members) {

    if (Array.isArray(members)) {
        members = convertToObj(members);
    }

    this.members = members || {};
    this.id = groupName;
    this.count = Object.keys(this.members).length;
}


Group.prototype.add = function(connection) {

    var connectionID = connection.id;
    var groupName = this.id;

    if (this.members[connectionID] === undefined) {

        this.count++;
        this.members[connectionID] = true;
        connection.groups[groupName] = true;

        connection.nameSpace('groups').execute('addedToGroup')(this.id);

        debug('Member', connectionID, 'added to:', groupName);

        return true;
    }

    return false;
};

Group.prototype.remove = function(connection) {

    var connectionID = connection.id;

    if (this.members[connectionID] !== undefined) {
        connection.groups[this.id] = false;
        this.members[connectionID] = undefined;
        this.count--;
    }
};

// creates a namespace object that holds an execute method with the namespace as a closure..

Group.prototype.nameSpace = function(namespaceName) {

    var memberList = this.memberArray;
    var _this = this;

    return {
        execute: function(funcName) {
            executionController.execute(_this, 'GRP', memberList, namespaceName, funcName, arguments);
        }
    };
};

Group.prototype.execute = function(funcName) {
    executionController.execute(this, 'GRP', this.memberArray, 'core', funcName, arguments);
};

Group.prototype.except = function(exceptionArray) {

    var membersList = Object.keys(this.members);
    var filteredMembers = membersList.filter(function(value) {
        if (exceptionArray.indexOf(value) === -1) {
            return value;
        }
    });

    return new Group('filtered_' + this.id, filteredMembers);
};

Group.prototype.send = function(packet) {
    var connectionID;
    var members = this.members;

    for (connectionID in members) {
        if (members[connectionID] !== undefined) {
            samsaara.connection(connectionID).socket.send(packet);
        }
    }
};


function convertToObj(array) {

    var obj = {};
    var i;

    for (i = 0; i < array.length; i++) {
        obj[array[i]] = true;
    }

    return obj;
}


module.exports = exports = {
    initialize: initialize,
    Constructor: Group
};
