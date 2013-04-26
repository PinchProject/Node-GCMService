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

var BACKOFF_DELAY = 1000,
    BACKOFF_FACTOR = 1.2,
    MAX_ATTEMPTS = 10;

function Sender(data) {
    if (data) {
        debug('initialize sender with object');

        data.hasOwnProperty('key') && typeof data.key === 'string' ?
            this.api_key = data.key : this.api_key = null;

        data.hasOwnProperty('gcm_endpoint') && typeof data.gcm_endpoint === 'string' ?
            this.gcm_endpoint = data.gcm_endpoint : this.gcm_endpoint = 'https://android.googleapis.com';

        data.hasOwnProperty('gcm_end_path') && typeof data.gcm_end_path === 'string' ?
            this.gcm_end_path = data.gcm_end_path : this.gcm_end_path = '/gcm/send';
    } else {
        debug('initialize sender with default values');

        this.api_key = null;
        this.gcm_endpoint = 'https://android.googleapis.com';
        this.gcm_end_path = '/gcm/send';
    }
}

Sender.prototype = {
    setAPIKey: setAPIKey,
    setGCMEndpoint: setGCMEndpoint,
    setGCMEndPath: setGCMEndPath,
    sendMessage: sendMessage,
    setBackoffDelay: setBackoffDelay,
    setBackoffFactor: setBackoffFactor,
    setMaxAttempts: setMaxAttempts
};

/**
 * Set back-off delay.
 *
 * @param delay
 */
function setBackoffDelay(delay) {
    if (typeof delay === 'number') {
        BACKOFF_DELAY = delay;
        debug('backoff_delay correctly set');
        return true;
    } else {
        debug('backoff_delay not set');
        return false;
    }
}

/**
 * Set back-off factor.
 *
 * @param factor
 */
function setBackoffFactor(factor) {
    if (typeof factor === 'number') {
        BACKOFF_FACTOR = factor;
        debug('backoff_factor correctly set');
        return true;
    } else {
        debug('backoff not set');
        return false;
    }
}

/**
 * Set max attempts.
 *
 * @param attempts
 */
function setMaxAttempts(attempts) {
    if (typeof  attempts === 'number') {
        MAX_ATTEMPTS = attempts;
        debug('max_attempts correctly set');
        return true;
    } else {
        debug('max_attempts not set');
        return false;
    }
}

/**
 * Set api_key.
 *
 * @param key
 */
function setAPIKey(key) {
    if (typeof key === 'string') {
        this.api_key = key;
        debug('api_key correctly set');
        return true;
    } else {
        debug('api_key not set');
        return false;
    }
}

/**
 * Set gcm_endpoint.
 *
 * @param endpoint
 */
function setGCMEndpoint(endpoint) {
    if (typeof endpoint === 'string') {
        this.gcm_endpoint = endpoint;
        debug('gcm_endpoint correctly set');
        return true;
    } else {
        debug('gcm_endpoint not set');
        return false;
    }
}

/**
 * Set gcm_end_path.
 *
 * @param end_path
 */
function setGCMEndPath(end_path) {
    if (typeof end_path === 'string') {
        this.gcm_end_path = end_path;
        debug('gcm_end_path correctly set');
        return true;
    } else {
        debug('gcm_end_path not set');
        return false;
    }
}

/**
 * Check if the api_key is set and a string, and
 * return true.
 *
 * @param self
 * @returns {boolean}
 */
function isSenderOptionsValid(self) {
    if (self.api_key && typeof self.api_key === 'string') {
        debug('sender options is valid');
        return true;
    } else {
        debug('sender options is not valid');
        return false;
    }
}

/**
 * Send the message to the GCM server.
 *
 * @param message
 * @param registration_ids
 * @param retries
 * @param done
 */
function sendMessage(message, registration_ids, retries, done) {
    var self = this;

    if (isSenderOptionsValid(self)) {
        if (typeof message === 'object' && util.isArray(registration_ids)) {
            createBatchArrays(registration_ids, function (arrays) {
                registration_ids = arrays;

                send(self, message, registration_ids, retries, done);
            });
        } else {
            send(self, message, registration_ids, retries, done);
        }
    } else {
        done(new Error('Invalid sender options'));
    }
}

/**
 * Send the message to GCM Server with or
 * without retries.
 *
 * @param self
 * @param message
 * @param registration_ids
 * @param retries
 * @param done
 */
function send(self, message, registration_ids, retries, done) {
    if (message && retries) {
        sendWithRetry(self, message, retries, registration_ids, function (err, data) {
            if (!err) {
                done(null, data);
            } else {
                done(err);
            }
        });
    } else if (message && !retries) {
        sendWithoutRetry(self, message, registration_ids, function (err, data) {
            if (!err) {
                done(null, data);
            } else {
                done(err);
            }
        });
    } else {
        done(new Error('Undefined message parameter'));
    }
}

/**
 * Send the message to the GCM server without
 * retries.
 *
 * @param self
 * @param message
 * @param registration_ids
 * @param done
 */
function sendWithoutRetry(self, message, registration_ids, done) {
    var options = {
        url: self.gcm_endpoint + self.gcm_end_path,
        method: 'POST',
        headers: {
            Authorization: 'key=' + self.api_key
        }
    };

    debug('registration_ids format : %s', typeof registration_ids);

    switch (typeof message) {
        case 'string':
            debug('try to send a plain-text message without retry');

            options['headers']['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
            options['headers']['Content-length'] = Buffer.byteLength(message, 'utf8');

            if (typeof registration_ids === 'string') {
                options['body'] = message + '&registration_id=' + registration_ids;

                sendRequest(options, function (err, data) {
                    if (!err) {
                        data = querystring.parse(data, '\n', '=');

                        createResult(registration_ids, data, done);
                    } else {
                        debug('error occurs when sending a plain-text message without retry');
                        done(err);
                    }
                });
            } else if (util.isArray(registration_ids) && registration_ids.length === 1) {
                options['body'] = message + '&registration_id=' + registration_ids[0];

                sendRequest(options, function (err, data) {
                    if (!err) {
                        data = querystring.parse(data, '\n', '=');

                        createResult(registration_ids[0], data, done);
                    } else {
                        debug('error occurs when sending a plain-text message without retry');
                        done(err);
                    }
                });
            } else {
                done(new Error('registration_ids must be a string or an array of 1 element'));
            }
            break;
        case 'object':
            debug('try to send a JSON message without retry');

            options['headers']['Content-Type'] = 'application/json';
            options['headers']['Content-length'] = Buffer.byteLength(JSON.stringify(message), 'utf8');

            if (util.isArray(registration_ids)) {
                var multicastResult = new MulticastResult();

                async.forEachSeries(registration_ids, function (array, callback) {
                    message['registration_ids'] = array;

                    options['body'] = JSON.stringify(message);

                    sendRequest(options, function (err, data) {
                        if (!err) {
                            try {
                                data = JSON.parse(data);

                                multicastResult.addMulticastId(data.multicast_id);
                                multicastResult.addSuccessLength(data.success);
                                multicastResult.addFailuresLength(data.failure);
                                multicastResult.addCanonicalIdsLength(data.canonical_ids);

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
                        } else {
                            debug('error occurs when sending a JSON message without retry');
                            callback(err);
                        }
                    });
                }, function (err) {
                    if (!err) {
                        done(null, multicastResult.toJSON());
                    } else {
                        done(err);
                    }
                });
            } else {
                done(new Error('registration_ids must be an array'));
            }
            break;
        default:
            done(new Error('Invalid type for message, must be string or object type.'));
    }
}

/**
 * Send the message to the GCM server with retries (max: 10).
 *
 * @param self
 * @param message
 * @param retries
 * @param registration_ids
 * @param done
 */
function sendWithRetry(self, message, retries, registration_ids, done) {
    if (retries > MAX_ATTEMPTS) {
        retries = MAX_ATTEMPTS;
    }

    var options = {
        url: self.gcm_endpoint + self.gcm_end_path,
        method: 'POST',
        headers: {
            Authorization: 'key=' + self.api_key
        }
    };

    debug('registration_ids format : %s', typeof registration_ids);

    switch (typeof message) {
        case 'string':
            debug('try to send a plain-text message with %s retries', retries);

            options['headers']['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
            options['headers']['Content-length'] = Buffer.byteLength(message, 'utf8');

            if (typeof registration_ids === 'string' || (util.isArray(registration_ids) && registration_ids.length == 1)) {
                if (typeof registration_ids === 'string') {
                    options['body'] = message + '&registration_id=' + registration_ids;
                } else {
                    options['body'] = message + '&registration_id=' + registration_ids[0];
                }

                attempt(
                    function (attemtps) {
                        debug('attempts : %s', attemtps);

                        sendRequest(options, this);
                    },
                    {
                        retries: retries,
                        interval: BACKOFF_DELAY,
                        factor: BACKOFF_FACTOR
                    },
                    function (err, data) {
                        if (!err) {
                            data = querystring.parse(data, '\n', '=');

                            if (typeof registration_ids === 'string') {
                                createResult(registration_ids, data, done);
                            } else {
                                createResult(registration_ids[0], data, done);
                            }
                        } else {
                            debug('error occurs when sending a plain-text message with retry');
                            done(err);
                        }
                    }
                );
            } else {
                done(new Error('registration_ids must be a string or an array of 1 element'));
            }
            break;
        case 'object':
            debug('try to send a JSON message with %s retries', retries);

            options['body'] = JSON.stringify(message);
            options['headers']['Content-Type'] = 'application/json';
            options['headers']['Content-length'] = Buffer.byteLength(JSON.stringify(message), 'utf8');

            if (util.isArray(registration_ids)) {
                var multicastResult = new MulticastResult();

                async.forEachSeries(registration_ids, function (array, callback) {
                    message['registration_ids'] = array;

                    options['body'] = JSON.stringify(message);

                    attempt(
                        function (attempts) {
                            debug('attempts : %s', attempts);

                            sendRequest(options, this);
                        },
                        {
                            retries: retries,
                            interval: BACKOFF_DELAY,
                            factor: BACKOFF_FACTOR
                        },
                        function (err, data) {
                            if (!err) {
                                try {
                                    data = JSON.parse(data);

                                    multicastResult.addMulticastId(data.multicast_id);
                                    multicastResult.addSuccessLength(data.success);
                                    multicastResult.addFailuresLength(data.failure);
                                    multicastResult.addCanonicalIdsLength(data.canonical_ids);

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
                            } else {
                                debug('error occurs when sending a JSON message with retry');
                                callback(err);
                            }
                        }
                    );
                }, function (err) {
                    if (!err) {
                        done(null, multicastResult.toJSON());
                    } else {
                        done(err);
                    }
                });
            } else {
                done(new Error('registration_ids must be an array'));
            }
            break;
        default:
            done(new Error('Invalid type for message, must be string or object type.'));
    }
}

/**
 * Send a request with the specified options and
 * return the response.
 *
 * @param options
 * @param done
 */
function sendRequest(options, done) {
    request(options, function (err, res, body) {
        if (!err) {
            debug('GCM server respond with HTTP code : %s', res.statusCode);

            switch (res.statusCode) {
                case 200:
                    done(null, body);
                    break;
                case 400:
                    done(new Error('BAD_REQUEST : Request could not be parsed as JSON, or it contained invalid fields'));
                    break;
                case 401:
                    done(new Error('UNAUTHORIZED : There was an error authenticating the sender account'));
                    break;
                case 500:
                    done(new Error('INTERNAL_SERVER_ERROR'));
                    break;
                case 501:
                    done(new Error('NOT_IMPLEMENTED : The server either does not recognize the request method, or it lacks the ability to fulfill the request'));
                    break;
                case 502:
                    done(new Error('BAD_GATEWAY : The server was acting as a gateway or proxy and received an invalid response from the upstream server'));
                    break;
                case 503:
                    done(new Error('SERVICE_UNAVAILABLE : The server is currently unavailable (because it is overloaded or down for maintenance)'));
                    break;
                case 504:
                    done(new Error('GATEWAY_TIMEOUT : The server was acting as a gateway or proxy and did not receive a timely response from the upstream server'));
                    break;
                default:
                    done(new Error('INVALID_REQUEST'));
            }
        } else {
            debug('error occurs before sending request');

            done(err);
        }
    });
}

/**
 * Create a result object and send it back as response.
 *
 * @param registration_id
 * @param data
 * @param done
 */
function createResult(registration_id, data, done) {
    var result = new Result();

    if (data.hasOwnProperty('id')) {
        result.setId(data.id);

        if (data.hasOwnProperty('registration_id')) {
            result.setRegistrationId(data.registration_id);
            result.setOldRegistrationId(registration_id);
        }
    } else if (data.hasOwnProperty('Error')) {
        result.setError(data.Error);
    }

    debug('simple result created');

    done(null, result.toJSON());
}

/**
 * Create an array of arrays that have a size of 1000 max.
 *
 * @param registration_ids
 * @param done
 */
function createBatchArrays(registration_ids, done) {
    var array = [];

    while (registration_ids.length) {
        array.push(registration_ids.splice(0, 1000));
    }

    done(array);
}

module.exports = Sender;