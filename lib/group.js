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

    var memberID;

    this.id = groupName;
    this.members = {};
    this.count = 0;

    if (Array.isArray(members)) {
        members = convertToObj(members);
    }

    for (memberID in members) {
        this.add(memberID);
    }
}

Group.prototype.add = function(connection) {

    var connectionID;
    var groupName = this.id;

    if (typeof connection === 'string') {
        connection = samsaara.connection(connection);
    }

    if (connection) {

        connectionID = connection.id;

        if (this.members[connectionID] === undefined) {

            debug('Adding Connection to group', groupName);

            this.count++;
            this.members[connectionID] = true;
            connection.groups[groupName] = true;

            connection.nameSpace('samsaaraGroups').execute('addedToGroup')(groupName);

            debug('Member', connectionID, 'added to:', groupName);

            return true;
        }
    }

    return false;
};

Group.prototype.remove = function(connection) {

    var connectionID = connection.id;

    if (this.members[connectionID] !== undefined) {
        connection.groups[this.id] = false;
        delete this.members[connectionID];
        this.count--;
    }
};

Group.prototype.nameSpace = function(namespaceName) {

    var memberList = duplicateObject(this.members);

    return {
        execute: function(funcName) {
            execute(createSendClosure(memberList), 'GRP', memberList, namespaceName, funcName, arguments);
        }
    };
};

Group.prototype.execute = function(funcName, namespaceName) {

    var memberList = duplicateObject(this.members);

    return function() {
        execute(createSendClosure(memberList), 'GRP', memberList, namespaceName || 'core', funcName, arguments);
    };
};

Group.prototype.except = function(exceptionArray) {

    var exceptions = convertToObj(exceptionArray);
    var members = this.members;
    var filteredMembers = {};
    var memberID;

    for (memberID in members) {
        if (exceptions[memberID] !== true) {
            filteredMembers[memberID] = true;
        }
    }

    return new Group('filtered_' + this.id, filteredMembers);
};


function createSendClosure(memberList) {

    return {
        send: function(packet) {
            var connectionID;
            var connection;

            for (connectionID in memberList) {
                connection = samsaara.connection(connectionID);
                if (connection !== undefined) {
                    connection.socket.send(packet);
                }
            }
        }
    };
}


// helpers

function duplicateObject(obj) {
    var dup = {};
    var propName;

    for (propName in obj) {
        if (obj[propName] === true) {
            dup[propName] = true;
        }
    }

    return dup;
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
