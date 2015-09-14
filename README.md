samsaara-groups
======================

Grouping module for samsaara.

## Installation

```bash
npm install --save samsaara-groups
```

## Basic Usage

```javascript
var samsaara = require('samsaara')
var groups = require('samsaara-groups'); 
```

```javascript
samsaara.group('all').execute('testMethod')();
```

```
var groupA = samsaara.createGroup('groupA');
var groupB = samsaara.createGroup('groupB');

groupA.execute('methodOnlyOnGroupA')();
groupB.execute('methodOnlyOnGroupB')();
```

