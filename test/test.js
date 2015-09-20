var debugit = require('debugit').enable();
var debug = debugit.add('samsaara:test:groups');

var test = require('tape').test;
var TapeFence = require('./tapefence');

var fences = {};

var WebSocketServer = require('ws').Server;
var samsaara = require('samsaara');
var groups = require('../main');

var connectionCount = 0;

var wss = new WebSocketServer({
    port: 8080
});


// test setup

samsaara.on('connection', function(connection) {
    debug('New Connection', connection.name);
    fences['New connections'].hit(connection);
});

wss.on('connection', function(ws) {
    samsaara.newConnection(ws, 'connection' + connectionCount++);
});

samsaara.expose({
    addToGroup: function(groupName) {
        samsaara.group(groupName).add(this);
        fences['Wait till Groups Mounted'].hit(this, groupName);
    },
    doneTest: function(cb) {
        cb(true);
        fences['Done Test'].hit(this);
    }
});


// tests

test('Samsaara Server Exists', function(t) {
    t.equal(typeof samsaara, 'object');
    t.end();
});

test('Samsaara can load Groups middleware', function(t) {
    samsaara.use(groups);
    t.end();
});

test('Samsaara can initialize', function(t) {
    var initialized = samsaara.initialize();
    t.equal(initialized, samsaara);
    t.end();
});

test('Wait for X Connections', function(t) {

    fences['New connections'] = new TapeFence(5, function() {
        t.equal(typeof samsaara.connection('connection0'), 'object');
        t.equal(typeof samsaara.connection('connection1'), 'object');
        t.equal(typeof samsaara.connection('connection2'), 'object');
        t.equal(typeof samsaara.connection('connection3'), 'object');
        t.equal(typeof samsaara.connection('connection4'), 'object');

        t.equal(typeof samsaara.connection('connection0').groups, 'object');
        t.equal(samsaara.connection('connection0').groups.all, true);
        t.end();
    });
});

test('Create Groups', function(t) {
    samsaara.createGroup('groupA');
    samsaara.createGroup('groupB');
    samsaara.createGroup('groupC');

    t.equal(typeof samsaara.group('groupA'), 'object');
    t.equal(typeof samsaara.group('groupB'), 'object');
    t.equal(typeof samsaara.group('groupC'), 'object');

    t.end();
});

test('Hold Test', function(t) {
    setTimeout(function() {
        samsaara.group('all').execute('continueTest')();
        t.end();
    }, 500);
});

test('Wait till Groups Mounted', function(t) {

    fences['Wait till Groups Mounted'] = new TapeFence(10, function() {
        t.equal(typeof samsaara.group('groupA').members, 'object');
        t.equal(typeof samsaara.group('groupB').members, 'object');
        t.equal(typeof samsaara.group('groupC').members, 'object');
        t.equal(Object.keys(samsaara.group('groupA').members).length, 5);
        t.equal(Object.keys(samsaara.group('groupB').members).length, 3);
        t.equal(Object.keys(samsaara.group('groupC').members).length, 2);
        t.end();
    });
});

test('Execute on Groups', function(t) {

    var aHit = 0;
    var bHit = 0;
    var cHit = 0;

    t.plan(13);

    samsaara.group('groupA').execute('testMethodA')(5, function(answer) {
        aHit++;
        t.equal(10, answer);
        fences['Execute On Groups'].hit();
    });

    samsaara.group('groupB').execute('testMethodB')(5, function(answer) {
        bHit++;
        t.equal(20, answer);
        fences['Execute On Groups'].hit();
    });

    samsaara.group('groupC').execute('testMethodC')(5, function(answer) {
        cHit++;
        t.equal('nugget', answer);
        fences['Execute On Groups'].hit();
    });

    fences['Execute On Groups'] = new TapeFence(10, function() {
        t.equal(aHit, 5);
        t.equal(bHit, 3);
        t.equal(cHit, 2);
        t.end();
    });
});

test('Hold Test', function(t) {
    setTimeout(function() {
        samsaara.group('all').execute('continueTest')();
        t.end();
    }, 500);
});

test('Close Test', function(t) {
    fences['Done Test'] = new TapeFence(5, function() {
        wss.close();
        t.end();
    });
});
