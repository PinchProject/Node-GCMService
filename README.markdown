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

Create a sender object with default values and set the api key after, or with another object:

* with default values

```javascript
var sender = new gcm.Sender();

// set api key
sender.setAPIKey('key');
```

* with another object

```javascript
var sender = new gcm.Sender({
	key: 'my_api_key'
});
```

**Important** : you can set the endpoint and end path URLs if Google change these URLs

And finally send the message to the specified registration id(s) with retries or not, in JSON format or plain-text format :

* with retries in JSON format (max: 10 retries using exponential back-off)

```javascript
sender.send(message.toJSON(), 6, function(err, data) {
	if (!err) {
		// do something
	} else {
		// handle error
	}
});
```

* without retries in plain-text format

```javascript
sender.send(message.toString(), null, function(err, data) {
	if (!err) {
		// do something
	} else {
		// handle error
	}
});
```

### GCM Response

#### Multicast (JSON response)

* GCM response

```javascript
{
	"multicast_id": 216,
	"success": 3,
	"failure": 3,
	"canonical_ids": 1,
	"results": [
		{ "message_id": "1:0408" },
		{ "error": "Unavailable" },
		{ "error": "InvalidRegistration" },
		{ "message_id": "1:1516" },
		{ "message_id": "1:2342", "registration_id": "32" },
		{ "error": "NotRegistered"}
	]
}
```

* module response

```javascript
{
	"multicast_id": 216,
	"success_length": 3,
	"failures_length": 3,
	"failures": {
		"NotRegistered": ["42"],
		"Unavailable": ["8"],
		"InvalidRegistration": ["15"]
	},
	"canonical_ids_length": 1,
	"canonical_ids": [
		{
			"message_id": "1:2342",
			"registration_id": "23",
			"new_registration_id": "32"
		}
	]
}
```

#### Simple (plain-text response)

* GCM response

```
id=1:2342
registration_id=32
```

* module response

```javascript
{
	"id": "1:2342",
	"registration_id": "32"
}
```

### Message class methods

* **`toJSON()`** : JSON representation of the object
* **`toString()`** : String representation of the object
* **`addDataWithKeyValue('key', 'value')`** : add key-value in data object
* **`setDataWithObject({…})`** : set data object with a new object
* **`setCollapseKey('key')`** : set the collapse key
* **`setDryRun(true|false)`** : set dry run
* **`setRestrictedPackageName('package_name')`** : set restricted package name
* **`setTimeToLive(12345)`** : set time to live
* **`setDelayWhileIdle(true|false)`** : set delay while idle
* **`addRegistrationId('id)`** : add a registration id
* **`setRegistrationIds([…])`** : set the existing array of registration ids with new array

### Sender class methods

* **`setAPIKey('key')`** : set the api key
* **`setGCMEndpoint('endpoint')`** : set the GCM endpoint (default: https://android.googleapis.com)
* **`setGCMEndPath('endpath')`** : set the GCM end path (default: /gcm/send)
* **`send(message, retries, callback)`** : send the notification to the registration id(s) with or without retries in JSON or plain-text format and return the response data or an error
* **`setBackoffDelay(value)`** : set the back-off delay in milliseconds (default: 1000)
* **`setBackoffFactor(value)`** : set the back-off factor by which the back-off delay should be multiplied per attempt (default: 1.2)
* **`setMaxAttempts(value)`** : set the max number of retries (default: 10)

## License

(The MIT License)

Copyright (C) 2013 PinchProject <[http://pinchproject.com/](http://pinchproject.com/)>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Change log

#### v0.1.3

* resolved some issue.

#### v0.1.2

* modified the structure of the GCM response (JSON or plain-text).

#### v0.1.1

* update documentation.

#### v0.1.0

* first release.
