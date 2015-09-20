#samsaara-groups

[![Build Status](https://travis-ci.org/arjunmehta/node-samsaara.svg?branch=master)](https://travis-ci.org/arjunmehta/node-samsaara)

Connection group module for [samsaara](https://www.github.com/arjunmehta/node-samsaara). Use this module to:

- **The object-oriented creation of samsaara connection groups.**
- **Add and remove individual samsaara connections to groups.**
- **Broadcast the execution of methods on all connections or those within specific groups.**

**Note:** *Use of this module requires familiarity with [samsaara](https://www.github.com/arjunmehta/node-samsaara) (of course). It's amazing and you'll love it. Get familiarized.*

## Installation

```bash
npm install --save samsaara-groups
```

## Basic Usage

### Client Side

In order for clients to accept group events and method execution you must add the `samsaara-groups` middleware to your client samsaara instance. Refer to the samsaara module documentation to see how to add

```javascript
var samsaara = require('samsaara')
var groups = require('samsaara-groups')

samsaara
  .use(groups)
  .initialize({
    socket: ws
  })
```

#### Client Event Listeners
Set listeners to do something when the client has been `added to group` or `removed from group`.

```javascript
samsaara.on('added to group', function(groupName){
  console.log('This client was added to group:', groupName)
})

samsaara.on('removed from group', function(groupName){
  console.log('This client was added to group:', groupName)
})
```


### Server Side
All new connections automatically get added to the group `all`.

```javascript
var samsaara = require('samsaara')
var groups = require('samsaara-groups')

samsaara
  .use(groups)
  .initialize({
    socketType: 'ws'
  })
```

#### Execute an exposed method on all clients
```javascript
samsaara.group('all').execute('testMethod')()
```

#### Create Custom Groups

```javascript
var groupA = samsaara.createGroup('groupA')
var groupB = samsaara.createGroup('groupB')
```

Note that the `createGroup` method returns the group if you'd like to chain commands.

#### Adding and Removing Connections to/from Groups
Only the server can add connections to groups. Below is a very straightforward example of an exposed method to let connections join/leave a group of their choosing.

```javascript
samsaara.expose({
    addToGroup: function(groupName){
        samsaara.group(groupName).add(this)
    },
    removeFromGroup: function(groupName){
        samsaara.group(groupName).remove(this)
    }
});
```

The logic you employ to filter connections from joining special groups is entirely up to you. For example, maybe you require a token to join a group:

```javascript
samsaara.expose({
    addToGroup: function(groupName, token){
        if(isValidToken(token)){
            samsaara.group(groupName).add(this)            
        }
    }
});
```

#### Executing Methods on Client Groups
Once you've found a way to add various groups, you can broadcast the execution of exposed methods by group.

```javascript
samsaara.group('groupA').execute('exposedMethodOnGroupA')()
samsaara.group('groupB').execute('exposedMethodOnGroupB')()
```


## License
The MIT License (MIT)

Copyright (c) 2014 Arjun Mehta