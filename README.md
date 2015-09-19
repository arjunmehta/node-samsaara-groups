samsaara-groups
======================

Connection group module for samsaara. Use this module to:

- **Create groups of connections.**
- **Add and remove individual samsaara connections to groups.**
- **Broadcast the execute of methods on all connections or those within specific groups.**

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


### Core (Server) Side
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

The logic you employ to filter connections from joining special groups is up to you. For example, maybe you require a token to join:

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

Now you can execute exposed methods on clients by group.

```javascript
samsaara.group('groupA').execute('exposedMethodOnGroupA')
samsaara.group('groupB').execute('exposedMethodOnGroupB')
```


## License
The MIT License (MIT)

Copyright (c) 2014 Arjun Mehta