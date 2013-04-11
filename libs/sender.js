/**
 * Author: Ismael Gorissen
 * Date: 10/04/13 17:59
 * Company: PinchProject
 * Website: http://pinchproject.com/
 */

var request = require('request'),
    attempt = require('attempt');

var BACKOFF_DELAY = 1000,
    BACKOFF_FACTOR = 1.2,
    MAX_ATTEMPTS = 10;

function Sender(data) {
    if (data) {
        this.api_key = data.key || null;
        this.gcm_endpoint = data.gcm_endpoint || 'https://android.googleapis.com';
        this.gcm_end_path = data.gcm_end_path || '/gcm/send';
    } else {
        this.api_key = null;
        this.gcm_endpoint = 'https://android.googleapis.com';
        this.gcm_end_path = '/gcm/send';
    }
}

Sender.prototype = {
    setAPIKey: setAPIKey,
    setGCMEndpoint: setGCMEndpoint,
    setGCMEndPath: setGCMEndPath,
    send: send,
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
        return true;
    } else {
        return false;
    }
}

/**
 * Send the message to the GCM server with or
 * without retries.
 *
 * @param message
 * @param retries
 * @param done
 */
function send(message, retries, done) {
    if (isSenderOptionsValid(this)) {
        if (message && retries) {
            sendWithRetry(this, message, retries, function (err, data) {
                if (!err) {
                    done(null, data);
                } else {
                    done(err);
                }
            });
        } else if (message && !retries) {
            sendWithoutRetry(this, message, function (err, data) {
                if (!err) {
                    done(null, data);
                } else {
                    done(err);
                }
            });
        } else {
            done(new Error('Undefined message parameter'));
        }
    } else {
        done(new Error('Invalid sender options'));
    }
}

/**
 * Send the message to the GCM server without
 * retries.
 *
 * @param self
 * @param message
 * @param done
 */
function sendWithoutRetry(self, message, done) {
    var options = {
        url: self.gcm_endpoint + self.gcm_end_path,
        method: 'POST',
        headers: {
            Authorization: 'key=' + self.api_key
        }
    };

    switch (typeof message) {
        case 'string':
            options['body'] = message;
            options['headers']['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
            options['headers']['Content-length'] = Buffer.byteLength(message, 'utf8');

            sendRequest(options, done);
            break;
        case 'object':
            options['body'] = JSON.stringify(message);
            options['headers']['Content-Type'] = 'application/json';
            options['headers']['Content-length'] = Buffer.byteLength(JSON.stringify(message), 'utf8');

            sendRequest(options, done);
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
 * @param done
 */
function sendWithRetry(self, message, retries, done) {
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

    switch (typeof message) {
        case 'string':
            options['body'] = message;
            options['headers']['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
            options['headers']['Content-length'] = Buffer.byteLength(message, 'utf8');

            attempt(
                function () {
                    sendRequest(options, this);
                },
                {
                    retries: retries,
                    interval: BACKOFF_DELAY,
                    factor: BACKOFF_FACTOR
                },
                function (err, data) {
                    if (!err) {
                        done(null, data);
                    } else {
                        done(err);
                    }
                }
            );

            break;
        case 'object':
            options['body'] = JSON.stringify(message);
            options['headers']['Content-Type'] = 'application/json';
            options['headers']['Content-length'] = Buffer.byteLength(JSON.stringify(message), 'utf8');

            attempt(
                function () {
                    sendRequest(options, this);
                },
                {
                    retries: retries,
                    interval: BACKOFF_DELAY,
                    factor: BACKOFF_FACTOR
                },
                function (err, data) {
                    if (!err) {
                        done(null, data);
                    } else {
                        done(err);
                    }
                }
            );

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
            switch (res.statusCode) {
                case 200:
                    try {
                        done(null, JSON.parse(body));
                    } catch (ex) {
                        done(ex);
                    }
                    break;
                case 400:
                    done(new Error('BAD_REQUEST : Request coussld not be parsed as JSON, or it contained invalid fields'));
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
            done(err);
        }
    });
}

module.exports = Sender;