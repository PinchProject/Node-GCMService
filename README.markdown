# Node-GCMService

A node.js module for **[Google Cloud Messaging](http://developer.android.com/google/gcm/index.html)**

## Installation

```
[sudo] npm install node-gcm-service
```

## Requirements

The only thing you need is a google server api key. For more information go to [GCM getting started guide](http://developer.android.com/google/gcm/gs.html).

## Usage

Require the module

```javascript
var gcm = require('node-gcm-service');
```

Create a message object with default values and set all variables after, or with another object:

* with default values

```javascript
var message = new gcm.Message();

// set data with another object
message.setDataWithObject({
	key1: 'value1'
});

// add new key-value to data if key does not exists
message.addDataWithKeyValue('key2','value2');

// set collapse key
message.setCollapseKey('string');

// set dry run
message.setDryRun(false);

// set delay while idle
message.setDelayWhileIdle(true);

// set registration ids
message.setRegistrationIds(['id1','id2']);

// add a registration id
message.addRegistrationId('id3');
```

* with another object (undefined variables will be set with the default values)

```javascript
var message = new gcm.Message({
	registration_ids: ['id1'],
	collapse_key: 'test',
	data: {
		key1: 'value1'
	},
	delay_while_idle: true,
	time_to_live: 34,
	dry_run: false
});
```