/**
 * Author: Ismael Gorissen
 * Date: 10/04/13 17:59
 * Company: PinchProject
 * Website: http://pinchproject.com/
 *
 * Copyright (C) 2013 PinchProject
 * MIT Licensed
 */

var querystring = require('querystring'),
    util = require('util');

var request = require('request'),
    attempt = require('attempt'),
    async = require('async'),
    debug = require('debug')('gcm:sender');

var MulticastResult = require('./MulticastResult.js'),
    Result = require('./Result.js');

/**
 *
 * @param data
 * @constructor
 */
function Sender(data) {
    this.apiKey = null;
    this.gcmEndpoint = 'https://android.googleapis.com';
    this.gcmEndPath = '/gcm/send';
    this.backoffDelay = 1000;
    this.backoffFactor = 1.2;
    this.attempts = 2;

    if (data && typeof data === 'object') {
        this.apiKey = 'apiKey' in data && typeof data.apiKey === 'string' ? data.apiKey : null;
        this.gcmEndpoint = 'gcmEndpoint' in data && typeof data.gcmEndpoint === 'string' ?
            data.gcmEndpoint : 'https://android.googleapis.com';
        this.gcmEndPath = 'gcmEndPath' in data && typeof data.gcmEndPath === 'string' ? data.gcmEndPath : '/gcm/send';
        this.backoffDelay = 'backoffDelay' in data && typeof data.backoffDelay === 'number' ? data.backoffDelay : 1000;
        this.backoffFactor = 'backoffFactor' in data && typeof data.backoffFactor === 'number' ?
            data.backoffFactor : 1.2;
        this.attempts = 'attempts' in data && typeof data.attempts === 'number' ? data.attempts : 2;
    }

    debug(
        'CONSTRUCTOR > instance initialized with : "apiKey"=%s, "gcmEndpoint"=%s, "gcmEndPath"=%s, "backoffDelay"=%s, "backoffFactor"=%s, "attempts"=%s',
        this.apiKey,
        this.gcmEndpoint,
        this.gcmEndPath,
        this.backoffDelay,
        this.backoffFactor,
        this.attempts
    );
}

// ------------------------------ PRIVATE ------------------------------

/**
 * Check if the api_key is set and a string.
 *
 * @returns {boolean}
 * @private
 */
Sender.prototype._isSenderOptionsValid = function () {
    var self = this;
    return self.apiKey && typeof self.apiKey === 'string';
};

/**
 * Create a result object and send it back as response.
 *
 * @param registration_id
 * @param data
 * @private
 */
Sender.prototype._createResult = function (registration_id, data) {
    var result = new Result();

    if ('id' in data) {
        result.setId(data.id);

        if ('registration_id' in data) {
            result.setRegistrationId(data.registration_id);
            result.setOldRegistrationId(registration_id);
        }
    } else if ('Error' in data) {
        result.setError(data.Error);
    }

    return result.toJSON();
};

/**
 * Create an array of arrays that have a size of 1000 max.
 *
 * @param registration_ids
 * @param callback
 * @private
 */
Sender.prototype._createBatchArrays = function (registration_ids, callback) {
    var array = [];

    if (registration_ids.length <= 1000)
        return callback(registration_ids);

    while (registration_ids.length) {
        array.push(registration_ids.splice(0, 1000));
    }

    callback(array);
};

/**
 * Send a request with the specified options and
 * return the response.
 *
 * @param options
 * @param callback
 * @private
 */
Sender.prototype._sendRequest = function (options, callback) {
    request.post(
        options,
        function (err, res, body) {
            if (err) return callback(err);

            debug('DEBUG > GCM server respond with HTTP code : %s', res.statusCode);

            switch (res.statusCode) {
                case 200:
                    callback(null, body);
                    break;
                case 400:
                    var error = new Error('BAD_REQUEST : Request could not be parsed as JSON, or it contained invalid fields');
                    error.details = body;
                    callback(error);
                    break;
                case 401:
                    callback(new Error('UNAUTHORIZED : There was an error authenticating the sender account'));
                    break;
                case 500:
                    callback(new Error('INTERNAL_SERVER_ERROR'));
                    break;
                case 501:
                    callback(new Error('NOT_IMPLEMENTED : The server either does not recognize the request method, or it lacks the ability to fulfill the request'));
                    break;
                case 502:
                    callback(new Error('BAD_GATEWAY : The server was acting as a gateway or proxy and received an invalid response from the upstream server'));
                    break;
                case 503:
                    callback(new Error('SERVICE_UNAVAILABLE : The server is currently unavailable (because it is overloaded or down for maintenance)'));
                    break;
                case 504:
                    callback(new Error('GATEWAY_TIMEOUT : The server was acting as a gateway or proxy and did not receive a timely response from the upstream server'));
                    break;
                default:
                    callback(new Error('INVALID_REQUEST'));
            }
        }
    );
};

/**
 * Send the message to GCM Server with or
 * without retries.
 *
 * @param message
 * @param registration_ids
 * @param retries
 * @param callback
 * @private
 */
Sender.prototype._send = function (message, registration_ids, retries, callback) {
    var self = this;

    if (!message) return callback(new Error('Undefined message parameter'));

    if (!retries) return self._sendWithoutRetry(message, registration_ids, callback);

    self._sendWithRetry(message, registration_ids, callback);
};

/**
 * Send a request using application/x-www-form-urlencoded media type.
 *
 * @param options
 * @param attemptOptions
 * @param message
 * @param registration_ids
 * @param callback
 * @returns {*}
 * @private
 */
Sender.prototype._sendURLEncodedRequest = function (options, attemptOptions, message, registration_ids, callback) {
    var self = this;

    options['headers']['Content-Type'] = 'application/x-www-form-urlencoded; charset=utf-8';
    options['headers']['Content-length'] = Buffer.byteLength(message, 'utf8');

    debug('DEBUG > typeof registration_ids: %s', typeof registration_ids);
    debug('DEBUG > registration_ids: %s', JSON.stringify(registration_ids));

    if (util.isArray(registration_ids) && registration_ids.length < 1)
        return callback(new Error('registration_ids must be an array of 1 or more elements'));

    if (typeof registration_ids !== 'string' && !util.isArray(registration_ids))
        return callback(new Error('registration_ids must be a string or an array of 1 or more elements'));

    var registration_id = registration_ids;

    if (util.isArray(registration_ids)) registration_id = registration_ids[0];

    options['body'] = message + '&registration_id=' + registration_id;

    attempt(
        function (attemtps) {
            debug('DEBUG > attempts : %s', attemtps);
            self._sendRequest(options, this);
        },
        attemptOptions,
        function (err, data) {
            if (err) return callback(err);

            data = querystring.parse(data, '\n', '=');
            callback(null, self._createResult(registration_id, data));
        }
    );
};

/**
 * Send a request using application/json media type.
 *
 * @param options
 * @param attemptOptions
 * @param message
 * @param registration_ids
 * @param callback
 * @returns {*}
 * @private
 */
Sender.prototype._sendJSONRequest = function (options, attemptOptions, message, registration_ids, callback) {
    var self = this;

    options['headers']['Content-Type'] = 'application/json; charset=utf-8';
    options['headers']['Content-length'] = Buffer.byteLength(JSON.stringify(message), 'utf8');

    if (!util.isArray(registration_ids)) return callback(new Error('registration_ids must be an array'));

    var multicastResult = new MulticastResult();

    async.forEachSeries(
        registration_ids,
        function (array, callback) {
            message['registration_ids'] = array;
            options['body'] = JSON.stringify(message);

            debug('HTTP OPTIONS > %s', JSON.stringify(options));

            attempt(
                function (attempts) {
                    debug('DEBUG > attempts : %s', attempts);
                    self._sendRequest(options, this);
                },
                attemptOptions,
                function (err, data) {
                    if (err) return callback(err);

                    try {
                        data = JSON.parse(data);

                        multicastResult.addMulticastId(data.multicast_id);
                        multicastResult.setSuccessLength(data.success);

                        var results = data.results;

                        for (var i = 0; i < results.length; i++) {
                            if (results[i].hasOwnProperty('registration_id')) {
                                multicastResult.addCanonicalIdObject({
                                    message_id: results[i].message_id,
                                    registration_id: array[i],
                                    new_registration_id: results[i].registration_id
                                });
                            } else if (results[i].hasOwnProperty('error')) {
                                multicastResult.addFailureValueWithKey(results[i].error, array[i]);
                            }
                        }

                        callback();
                    } catch (ex) {
                        callback(ex);
                    }
                }
            );
        },
        function (err) {
            if (err) return callback(err);
            callback(null, multicastResult.toJSON());
        }
    );
};

/**
 * Send the message to the GCM server with retries.
 *
 * @param message
 * @param registration_ids
 * @param callback
 */
Sender.prototype._sendWithRetry = function (message, registration_ids, callback) {
    var self = this;

    var options = {
            uri: self.gcmEndpoint + self.gcmEndPath,
            headers: {
                Authorization: 'key=' + self.apiKey
            }
        },
        attemptOptions = {
            retries: self.attempts,
            interval: self.backoffDelay,
            factor: self.backoffFactor
        };

    debug('DEBUG > HTTP request options : %s', JSON.stringify(options));
    debug('DEBUG > attempt options : %s', JSON.stringify(attemptOptions));

    switch (typeof message) {
        case 'string':
            self._sendURLEncodedRequest(options, attemptOptions, message, registration_ids, callback);
            break;
        case 'object':
            self._sendJSONRequest(options, attemptOptions, message, registration_ids, callback);
            break;
        default:
            callback(new Error('Invalid type for message, must be string or object type'));
    }
};

/**
 * Send the message to the GCM server without
 * retries.
 *
 * @param message
 * @param registration_ids
 * @param callback
 */
Sender.prototype._sendWithoutRetry = function (message, registration_ids, callback) {
    var self = this;

    var options = {
            uri: self.gcmEndpoint + self.gcmEndPath,
            headers: {
                Authorization: 'key=' + self.apiKey
            }
        },
        attemptOptions = {
            retries: 0
        };

    debug('DEBUG > HTTP request options : %s', JSON.stringify(options));
    debug('DEBUG > attempt options : %s', JSON.stringify(attemptOptions));

    switch (typeof message) {
        case 'string':
            self._sendURLEncodedRequest(options, attemptOptions, message, registration_ids, callback);
            break;
        case 'object':
            self._sendJSONRequest(options, attemptOptions, message, registration_ids, callback);
            break;
        default:
            callback(new Error('Invalid type for message, must be string or object type.'));
    }
};

// ------------------------------ PUBLIC ------------------------------

/**
 * Set back-off delay.
 *
 * @param delay
 */
Sender.prototype.setBackoffDelay = function (delay) {
    if (typeof delay !== 'number') return false;
    this.backoffDelay = delay;
    debug('SET > "backoffDelay" to %s', delay);
};

/**
 * Set back-off factor.
 *
 * @param factor
 */
Sender.prototype.setBackoffFactor = function (factor) {
    if (typeof factor !== 'number') return false;
    this.backoffFactor = factor;
    debug('SET > "backoffFactor" to %s', factor);
};

/**
 * Set max attempts.
 *
 * @param attempts
 */
Sender.prototype.setAttempts = function (attempts) {
    if (typeof  attempts !== 'number') return false;
    this.attempts = attempts;
    debug('SET > "attempts" to %s', attempts)
};

/**
 * Set api_key.
 *
 * @param key
 */
Sender.prototype.setAPIKey = function (key) {
    if (typeof key !== 'string') return false;
    this.apiKey = key;
    debug('SET > "apiKey" to %s', key);
};

/**
 * Set gcm_endpoint.
 *
 * @param endpoint
 */
Sender.prototype.setGCMEndpoint = function (endpoint) {
    if (typeof endpoint === 'string') return false;
    this.gcmEndpoint = endpoint;
    debug('SET > "gcmEndpoint" to %s', endpoint);
};

/**
 * Set gcm_end_path.
 *
 * @param end_path
 */
Sender.prototype.setGCMEndPath = function (end_path) {
    if (typeof end_path !== 'string') return false;
    this.gcmEndPath = end_path;
    debug('SET > "gcmEndPath" to %s', end_path);
};

/**
 * Send the message to the GCM server.
 *
 * @param message
 * @param registration_ids
 * @param retries
 * @param callback
 */
Sender.prototype.sendMessage = function (message, registration_ids, retries, callback) {
    var self = this;

    if (!self._isSenderOptionsValid()) return callback(new Error('Invalid sender options'));

    if (!util.isArray(registration_ids)) return self._send(message, registration_ids, retries, callback);

    self._createBatchArrays(registration_ids, function (arrays) {
        self._send(message, arrays, retries, callback);
    });
};

module.exports = Sender;