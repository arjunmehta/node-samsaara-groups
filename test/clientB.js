var shim = require('es5-shim');
var debugit = require('debugit').enable();
var debug = debugit.add('samsaara:test:groups');

var WebSocket = require('ws');
var samsaara = require('samsaara');
var groups = require('../client');

var test = require('tape').test;
var TapeFence = require('./tapefence');
var fences = {};

var ws;


// test setup

samsaara.on('added to group', function(groupName) {
    debug('Added to Group', groupName);
    fences['Add to Group'].hit(groupName);
});

samsaara.on('removed from group', function(groupName) {
    debug('Removed From Group', groupName);
    fences['Removed from Group'].hit(groupName);
});

samsaara.expose({
    testMethodA: function(num, cb) {
        cb(num * 2);
    },
    testMethodB: function(num, cb) {
        cb(num * 4);
    },
    continueTest: function() {
        console.log('CONTINUING TEST');
        fences['Wait to Continue'].hit('continue');
    }
});


// tests

test('Samsaara Client Exists', function(t) {
    t.equal(typeof samsaara, 'object');
    t.end();
});

test('Samsaara can load Groups middleware', function(t) {
    samsaara.use(groups);
    t.end();
});

test('Samsaara initializes and added to All', function(t) {

    t.plan(2);

    ws = new WebSocket('ws://localhost:8080');

    samsaara.initialize({
        socket: ws
    });

    t.equal(typeof samsaara.core, 'object');

    fences['Add to Group'] = new TapeFence(1, function(groupName) {
        t.equal(groupName, 'all');
        t.end();
    });
});

test('Wait to Continue', function(t) {

    fences['Wait to Continue'] = new TapeFence(1, function(c) {
        if (c === 'continue') {
            t.end();
        }
    });
});

test('Add to Group A and B', function(t) {

    t.plan(1);

    samsaara.core.execute('addToGroup')('groupA');
    samsaara.core.execute('addToGroup')('groupB');

    fences['Add to Group'] = new TapeFence(2, function(groupName) {
        t.equal(groupName, 'groupB');
        t.end();
    });
});

test('Wait to Continue', function(t) {

    fences['Wait to Continue'] = new TapeFence(1, function(c) {
        if (c === 'continue') {
            t.end();
        }
    });
});

test('End Test', function(t) {
    samsaara.core.execute('doneTest')(function() {
        t.end();
        ws.close();
    });
});
