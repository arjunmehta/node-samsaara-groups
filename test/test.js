var debugit = require('debugit').enable();

var samsaara = require('samsaara');
var groups = require('../main');

var WebSocketServer = require('ws').Server;
var test = require('tape').test;

var wss = new WebSocketServer({
    port: 8080
});

var connection;


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

test('Samsaara initializes a connection', function(t) {
    wss.on('connection', function(ws) {
        connection = samsaara.newConnection(ws);
        connection.on('initialized', function(success) {
            t.equal(success, true);
            t.end();
        });
    });
});

// test('Samsaara executes an exposed client method and receives a callback', function(t) {
//     connection.execute('testMethod')('testing123', function(successBool, successString, successArray, successObject) {
//         t.equal(successBool, true);
//         t.equal(successString, 'success');
//         t.equal(Array.isArray(successArray), true);
//         t.equal(successArray[0], true);
//         t.equal(successArray[1], 'success');
//         t.equal(Array.isArray(successArray[2]), true);
//         t.equal(typeof successArray[2][0], 'object');
//         t.equal(successArray[2][0].success, true);
//         t.equal(typeof successObject, 'object');
//         t.equal(successObject.successFactor, 400);
//         t.end();
//     });
// });

// test('Samsaara double call back', function(t) {
//     connection.execute('doubleCallback')(function(cb) {
//         cb(function() {
//             t.end();
//         });
//     });
// });


test('Close Test', function(t) {
    wss.close();
    t.end();
});

process.on('exit', function() {
    wss.close();
});
