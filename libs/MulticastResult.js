/**
 * Author: Ismael Gorissen
 * Date: 12/04/13 11:37
 * Company: PinchProject
 * Website: http://pinchproject.com/
 *
 * Copyright (C) 2013 PinchProject
 * MIT Licensed
 */

var util = require('util');

var debug = require('debug')('gcm:multicast_result');

/**
 *
 * @constructor
 */
function MulticastResult() {
    this.multicast_ids = null;
    this.success_length = 0;
    this.failures = {};
    this.failures_length = 0;
    this.canonical_ids = [];
    this.canonical_ids_length = 0;

    debug(
        'CONSTRUCTOR > instance initialized with : "multicast_ids"=%s, "success_length"=%s, "failures"=%s,' +
            ' "failures_length"=%s, "canonical_ids"=%s, "canonical_ids_length"=%s,',
        this.multicast_ids,
        this.success_length,
        JSON.stringify(this.failures),
        this.failures_length,
        JSON.stringify(this.canonical_ids),
        this.canonical_ids_length
    );
}

// ------------------------------ PRIVATE ------------------------------

/**
 * Increase failures length.
 *
 * @private
 */
MulticastResult.prototype._increaseFailuresLength = function () {
    var self = this;
    self.failures_length += 1;
    debug('DEBUG > "failures_length" = %s', self.failures_length);
};

/**
 * Increase canonical ids length.
 *
 * @private
 */
MulticastResult.prototype._increaseCanonicalLength = function () {
    var self = this;
    self.canonical_ids_length += 1;
    debug('DEBUG > "canonical_ids_length" = %s', self.canonical_ids_length);
};

// ------------------------------ PUBLIC ------------------------------

/**
 * Create a multicast result object.
 *
 * @returns {{}}
 */
MulticastResult.prototype.toJSON = function () {
    var self = this;

    if (!self.multicast_ids) return null;

    var json = {
        multicast_ids: self.multicast_ids,
        success_length: self.success_length,
        canonical_ids_length: self.canonical_ids_length,
        failures_length: self.failures_length
    };

    if (self.failures_length > 0) json['failures'] = self.failures;
    if (self.canonical_ids_length > 0) json['canonical_ids'] = self.canonical_ids;

    debug('DEBUG > json : %s', JSON.stringify(json));

    return json;
};

/**
 * Add new multicast id.
 *
 * @param id
 */
MulticastResult.prototype.addMulticastId = function (id) {
    var self = this;

    if (typeof id !== 'number') return false;

    if (util.isArray(self.multicast_ids)) {
        if (self.multicast_ids.indexOf(id) == -1) self.multicast_ids.push(id);
    }

    if (typeof self.multicast_ids === 'number') {
        if (self.multicast_ids != id) {
            var tmp = self.multicast_ids;
            self.multicast_ids = [tmp, id];
        }
    }

    if (!self.multicast_ids) self.multicast_ids = id;

    debug('ADD > new multicast_id : %s', id);
};

/**
 * Add new canonical id object.
 *
 * @param obj
 */
MulticastResult.prototype.addCanonicalIdObject = function (obj) {
    var self = this;

    if (typeof obj !== 'object') return false;

    self.canonical_ids.push(obj);
    debug('ADD > canonical id object : %s', JSON.stringify(obj));
    self._increaseCanonicalLength();
};

/**
 * Add new value to the specified key.
 *
 * @param key
 * @param value
 */
MulticastResult.prototype.addFailureValueWithKey = function (key, value) {
    var self = this;

    if (typeof key !== 'string' || typeof value !== 'string') return false;

    if (!self.failures.hasOwnProperty(key)) self.failures[key] = [];

    self.failures[key].push(value);
    debug('ADD > "%s" to key "%s"', value, key);
    self._increaseFailuresLength();

};

/**
 * Set success length.
 *
 * @param length
 * @returns {boolean}
 */
MulticastResult.prototype.setSuccessLength = function (length) {
    if (typeof length !== 'number') return false;
    this.success_length = length;
    debug('SET > "success_length" to %s', length);
};

module.exports = MulticastResult;