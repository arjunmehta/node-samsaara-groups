/*!
 * Samsaara Middleware Template
 * Copyright(c) 2015 Arjun Mehta <arjun@arjunmehta.net>
 * MIT Licensed
 */

var debug = require('debugit').add('samsaara:groups');

var samsaara;
var parser;
var executionController;

var groups = {};


module.exports = {

    name: 'groups',

    initialize: function(extender, capability, options) {

        samsaara = extender.core;
        parser = extender.parser;
        executionController = extender.executionController;

        samsaara.createNamespace('samsaaraGroups', this.exposedMethods);

        extender.addCoreMethods(this.coreMethods);
        extender.addMessageRoutes(this.messageRoutes);

        return this;
    },

    coreMethods: {
        groups: groups
    },

    exposedMethods: {
        addedToGroup: function(groupName) {
            groups[groupName] = true;
            samsaara.emit('joined group', groupName);
        },
        removedFromGroup: function(groupName) {
            groups[groupName] = false;
            samsaara.emit('left group', groupName);
        }
    },

    messageRoutes: {
        GRP: function(connection, headerbits, incomingPacket) {
            var parsedPacket = parser.parsePacket(incomingPacket);

            if (parsedPacket !== undefined && parsedPacket.func !== undefined) {
                parsedPacket.sender = connection.id;
                executionController.executeFunction(connection, connection, parsedPacket);
            }
        }
    },

    finalize: function() {}
};
