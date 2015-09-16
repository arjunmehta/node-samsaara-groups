/*!
 * Samsaara Middleware Template
 * Copyright(c) 2015 Arjun Mehta <arjun@arjunmehta.net>
 * MIT Licensed
 */

var debug = require('debugit').add('samsaara:groups');

var Group;
var groups = {};


module.exports = {

    name: 'groups',

    initialize: function(extender, capability, options) {

        Group = require('./lib/group').initialize(extender.core, extender.execute);

        extender.addCoreMethods(this.coreMethods);
        extender.addModuleMethods(this.moduleMethods);
        extender.addConnectionInitialization(this.connectionInitialization, {
            forced: true
        });
        extender.addConnectionClose(this.connectionClose);
        extender.addMessageRoutes(this.messageRoutes);
        extender.addPreRouteFilter(this.preRouteFilter);

        createGroup('all');

        return this;
    },

    coreMethods: {
        group: group,
        createGroup: createGroup
    },

    connectionInitialization: function(connection, done) {

        debug('Initializing Groups', connection.id);

        connection.groups = {};
        groups.all.add(connection);

        done();
    },

    connectionClose: function(connection) {

        var connID = connection.id;
        var groupName;

        if (connection.groups) {

            debug('Disconnecting Client', connID, connection.groups);

            for (groupName in connection.groups) {
                group(groupName).remove(connection);
            }
        }

    }
};


function group(groupName) {
    return groups[groupName];
}

function createGroup(groupName, members) {
    var newGroup;

    members = members || {};
    newGroup = new Group(groupName, members);
    groups[groupName] = newGroup;

    return newGroup;
}
