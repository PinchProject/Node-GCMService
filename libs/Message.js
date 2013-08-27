/**
 * Author: Ismael Gorissen
 * Date: 10/04/13 14:02
 * Company: PinchProject
 * Website: http://pinchproject.com/
 *
 * Copyright (C) 2013 PinchProject
 * MIT Licensed
 */

var util = require('util');

var debug = require('debug')('gcm:message');

/**
 *
 * @param obj
 * @constructor
 */
function Message(obj) {
    this.collapse_key = null;
    this.data = {};
    this.delay_while_idle = null;
    this.time_to_live = null;
    this.restricted_package_name = null;
    this.dry_run = null;

    if (obj && typeof obj === 'object') {
        this.collapse_key = 'collapse_key' in obj && typeof obj.collapse_key === 'string' ? obj.collapse_key : null;
        this.data = 'data' in obj && typeof obj.data === 'object' && !util.isArray(obj.data) ? obj.data : {};
        this.delay_while_idle = 'delay_while_idle' in obj && typeof obj.delay_while_idle === 'boolean'
            ? obj.delay_while_idle : null;
        this.time_to_live = 'time_to_live' in obj && typeof obj.time_to_live === 'number' ? obj.time_to_live : null;
        this.restricted_package_name = 'restricted_package_name' in obj &&
            typeof obj.restricted_package_name === 'string' ? obj.restricted_package_name : null;
        this.dry_run = 'dry_run' in obj && typeof obj.dry_run === 'boolean' ? obj.dry_run : null;
    }

    debug(
        'CONSTRUCTOR > instance initialized with : "collapse_key"=%s, "data"=%s, "delay_while_idle"=%s,' +
            ' "time_to_live"=%s, "restricted_package_name"=%s, "dry_run"=%s,',
        this.collapse_key,
        JSON.stringify(this.data),
        this.delay_while_idle,
        this.time_to_live,
        this.restricted_package_name,
        this.dry_run
    );
}

// ------------------------------ PRIVATE ------------------------------

/**
 * Create a string representation of data object.
 *
 * @returns {string}
 * @private
 */
Message.prototype._dataToString = function () {
    var self = this;

    var string = '',
        keys = Object.keys(self.data);

    keys.forEach(function (key) {
        string += 'data.' + key + '=' + encodeURI(self.data[key]) + '&';
    });

    string = string.slice(0, -1);

    debug('DEBUG > data object in string format : %s', string);

    return string;
};

/**
 * Check if data is an object and that is length is lower than
 * 4096 bytes (max 4kb of payload for a notification).
 *
 * @returns {boolean}
 * @private
 */
Message.prototype._dataIsValid = function () {
    var self = this;
    return typeof self.data === 'object' && Buffer.byteLength(JSON.stringify(self.data)) < 4096
};

/**
 * Check if time_to_live is a number, is greater than 0 second
 * and lower or equal than 2 419 200 seconds (4 weeks).
 *
 * @returns {boolean}
 * @private
 */
Message.prototype._timeToLiveIsValid = function () {
    var self = this;
    return !self.time_to_live || (typeof self.time_to_live === 'number' && self.time_to_live > 0 && self.time_to_live <= 2419200)
};

// ------------------------------ PUBLIC ------------------------------

/**
 * Check if the message object is valid for a JSON
 * request, create an object with the needed
 * variables and return it.
 *
 * @returns {{}}
 */
Message.prototype.toJSON = function () {
    var self = this;

    if (!self._timeToLiveIsValid() || !self._dataIsValid()) return null;

    var json = {};

    if (self.data && Object.keys(self.data).length > 0) json['data'] = self.data;
    if (self.dry_run) json['dry_run'] = self.dry_run;
    if (self.time_to_live) json['time_to_live'] = self.time_to_live;
    if (self.delay_while_idle) json['delay_while_idle'] = self.delay_while_idle;
    if (self.collapse_key) json['collapse_key'] = self.collapse_key;
    if (self.restricted_package_name) json['restricted_package_name'] = self.restricted_package_name;

    debug('TO JSON > %s', JSON.stringify(json));

    return json;
};

/**
 * Check if the message object is valid for a plain-text
 * request , create a representation of this object
 * and return it.
 *
 * @returns {string}
 */
Message.prototype.toString = function () {
    var self = this;

    if (!self._timeToLiveIsValid() || !self._dataIsValid()) return null;

    var string = self._dataToString();

    if (self.delay_while_idle) string += '&delay_while_idle=' + self.delay_while_idle;
    if (self.dry_run) string += '&dry_run=' + self.dry_run;
    if (self.time_to_live) string += '&time_to_live=' + self.time_to_live;
    if (self.collapse_key) string += '&collapse_key=' + self.collapse_key;
    if (self.restricted_package_name) string += '&restricted_package_name=' + self.restricted_package_name;

    debug('TO STRING > %s', string);

    return string;
};

/**
 * Add new key value.
 *
 * @param key
 * @param value
 */
Message.prototype.addNewKeyValue = function (key, value) {
    var self = this;

    if (typeof key !== 'string') return false;

    if (!self.data.hasOwnProperty(key)) {
        self.data[key] = value;

        if (!self._dataIsValid()) {
            debug('ERROR > key can not be added because data object size will be greater than 4096 bytes');
            delete this.data[key];
            return false;
        }

        debug('ADD > new key "%s"', key);
    }
};

/**
 * Set data.
 *
 * @param obj
 */
Message.prototype.setDataWithObject = function (obj) {
    if (typeof obj !== 'object' || util.isArray(obj)) return false;
    this.data = obj;
    debug('SET > "data" to %s', JSON.stringify(obj));
};

/**
 * Set collapse_key.
 *
 * @param value
 */
Message.prototype.setCollapseKey = function (value) {
    if (typeof value !== 'string') return false;
    this.collapse_key = value;
    debug('SET > "collapse_key" to %s', value);
};

/**
 * Set dry_run.
 *
 * @param value
 */
Message.prototype.setDryRun = function (value) {
    if (typeof value !== 'boolean') return false;
    this.dry_run = value;
    debug('SET > "dry_run" to %s', value);
};

/**
 * Set restricted_package_name.
 *
 * @param value
 */
Message.prototype.setRestrictedPackageName = function (value) {
    if (typeof value !== 'string') return false;
    this.restricted_package_name = value;
    debug('SET > "restricted_package_name" to %s', value);
};

/**
 * Set time_to_live.
 *
 * @param value
 */
Message.prototype.setTimeToLive = function (value) {
    if (typeof value !== 'number') return false;
    this.time_to_live = value;
    debug('SET > "time_to_live" to %s', value);
};

/**
 * Set delay_while_idle.
 *
 * @param value
 */
Message.prototype.setDelayWhileIdle = function (value) {
    if (typeof value !== 'boolean') return false;
    this.delay_while_idle = value;
    debug('SET > "delay_while_idle" to %s', value);
};

module.exports = Message;