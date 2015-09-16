/*!
 * Samsaara Local Group Constructor
 * Copyright(c) 2014 Arjun Mehta <arjun@newlief.com>
 * MIT Licensed
 */

var debug = require('debugit').add('samsaara:groups:Group');

var samsaara;
var execute;


function initialize(core, coreExecute) {
    samsaara = core;
    execute = coreExecute;

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

        connection.nameSpace('samsaaraGroups').execute('addedToGroup')(this.id);

        debug('Member', connectionID, 'added to:', groupName);

        return true;
    }

    return false;
};

Group.prototype.remove = function(connection) {

    var connectionID = connection.id;

    if (this.members[connectionID] !== undefined) {
        delete connection.groups[this.id];
        delete this.members[connectionID];
        this.count--;
    }
};

// creates a namespace object that holds an execute method with the namespace as a closure..

Group.prototype.nameSpace = function(namespaceName) {

    var memberList = Object.keys(this.members);

    return {
        execute: function(funcName) {
            execute(createSendClosure(memberList), 'GRP', memberList, namespaceName, funcName, arguments);
        }
    };
};

Group.prototype.execute = function(funcName) {
    var memberList = Object.keys(this.members);
    execute(createSendClosure(memberList), 'GRP', memberList, 'core', funcName, arguments);
};

Group.prototype.except = function(exceptionArray) {

    var exceptions = convertToObj(exceptionArray);
    var membersList = Object.keys(this.members);
    var filteredMembers = {};
    var i;

    for (i = 0; i < membersList.length; i++) {
        if (exceptions[membersList[i]] !== true) {
            filteredMembers[membersList[i]] = true;
        }
    }

    return new Group('filtered_' + this.id, filteredMembers);
};


function createSendClosure(memberList) {

    return {
        send: function(packet) {
            var i;

            for (i = 0; i < memberList.length; i++) {
                if (samsaara.connection(memberList[i]) !== undefined) {
                    samsaara.connection(memberList[i]).socket.send(packet);
                }
            }
        }
    };
}

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
