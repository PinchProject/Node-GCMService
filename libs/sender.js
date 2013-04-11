/**
 * Author: Ismael Gorissen
 * Date: 10/04/13 17:59
 * Company: PinchProject
 */

var request = require('request');

var INITIAL_BACKOFF_DELAY,
    MAX_BACKOFF_DELAY;

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
    send: send
};

function setAPIKey(key) {
    if (typeof key === 'string') {
        this.api_key = key;
    }
}

function setGCMEndpoint(endpoint) {
    if (typeof endpoint === 'string') {
        this.gcm_endpoint = endpoint;
    }
}

function setGCMEndPath(end_path) {
    if (typeof end_path === 'string') {
        this.gcm_end_path = end_path;
    }
}

function send(message, retries, done) {
}

module.exports = Sender;