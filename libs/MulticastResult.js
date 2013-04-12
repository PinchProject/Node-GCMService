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

function MulticastResult() {
    this.multicast_id = null;
    this.success_length = 0;
    this.failures = {};
    this.failures_length = 0;
    this.canonical_ids = [];
    this.canonical_ids_length = 0;
}

MulticastResult.prototype = {
    setMulticastId: setMulticastId,
    setFailures: setFailures,
    setCanonicalIds: setCanonicalIds,
    addCanonicalIdObject: addCanonicalIdObject,
    addFailureValueWithKey: addFailureValueWithKey,
    toJSON: toJSON,
    setSuccessLength: setSuccessLength,
    setFailuresLength: setFailuresLength,
    setCanonicalIdsLength: setCanonicalIdsLength
};

function toJSON() {
    var json = {};

    if (this.multicast_id) {
        json['multicast_id'] = this.multicast_id;

        json['success_length'] = this.success_length;

        if (this.failures_length > 0) {
            json['failures'] = this.failures;
        }
        json['failures_length'] = this.failures_length;

        if (this.canonical_ids_length > 0) {
            json['canonical_ids'] = this.canonical_ids;
        }
        json['canonical_ids_length'] = this.canonical_ids_length;
    } else {
        json = null;
    }

    return json;
}

function setMulticastId(id) {
    if (typeof id === 'number') {
        this.multicast_id = id;
    }
}

function setFailures(obj) {
    if (typeof obj === 'object' && !util.isArray(obj)) {
        this.failures = obj;
    }
}

function setCanonicalIds(obj) {
    if (util.isArray(obj)) {
        this.canonical_ids = obj;
    }
}

function addCanonicalIdObject(obj) {
    if (typeof obj === 'object' && !util.isArray(obj)) {
        this.canonical_ids.push(obj);
    }
}

function addFailureValueWithKey(key, value) {
    if (typeof value === 'string') {
        if (!this.failures.hasOwnProperty(key)) {
            this.failures[key] = [];
        }

        this.failures[key].push(value);
    }
}

function setSuccessLength(length) {
    if (typeof length === 'number') {
        this.success_length = length;
    }
}

function setFailuresLength(length) {
    if (typeof length === 'number') {
        this.failures_length = length;
    }
}

function setCanonicalIdsLength(length) {
    if (typeof length === 'number') {
        this.canonical_ids_length = length;
    }
}

module.exports = MulticastResult;