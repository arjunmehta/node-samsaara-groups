/*!
 * Samsaara Middleware Template
 * Copyright(c) 2015 Arjun Mehta <arjun@arjunmehta.net>
 * MIT Licensed
 */

var debug = require('debugit').add('samsaara:groups');

var samsaara;
var parser;
var executeFunction;

var groups = {};


module.exports = {

    name: 'groups',

    initialize: function(extender, capability, options) {

        samsaara = extender.core;
        parser = extender.parser;
        executeFunction = extender.executeFunction;

        samsaara.createNamespace('samsaaraGroups', this.exposedMethods);

        extender.addCoreObjects(this.coreObjects);
        extender.addMessageRoutes(this.messageRoutes);

        return this;
    },

    coreObjects: {
        groups: groups
    },

    exposedMethods: {
        addedToGroup: function(groupName) {
            groups[groupName] = true;
            samsaara.emit('added to group', groupName);
            debug('Added to group', groupName);
        },
        removedFromGroup: function(groupName) {
            groups[groupName] = false;
            samsaara.emit('removed from group', groupName);
            debug('Removed from group', groupName);
        }
    },

    messageRoutes: {
        GRP: function(connection, headerbits, incomingPacket) {

            var parsedPacket = parser.parsePacket(incomingPacket);

            if (parsedPacket !== undefined) {
                if (parsedPacket.func !== undefined) {
                    parsedPacket.sender = connection.id;
                    executeFunction(connection, connection, parsedPacket);
                }
            }
        }
    }
};
