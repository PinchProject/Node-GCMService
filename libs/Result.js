/**
 * Author: Ismael Gorissen
 * Date: 12/04/13 13:14
 * Company: PinchProject
 * Website: http://pinchproject.com/
 *
 * Copyright (C) 2013 PinchProject
 * MIT Licensed
 */

var util = require('util');

var debug = require('debug')('gcm:result');

/**
 *
 * @param data
 * @constructor
 */
function Result(data) {
    this.id = null;
    this.registration_id = null;
    this.old_registration_id = null;
    this.error = null;

    if (data && typeof data === 'object' && !util.isArray(data)) {
        this.id = 'id' in data && typeof data.id === 'string' ?
            data.id : null;
        this.registration_id = 'registration_id' in data && typeof data.registration_id === 'string' ?
            data.registration_id : null;
        this.old_registration_id = 'old_registration_id' in data && typeof data.old_registration_id === 'string' ?
            data.old_registration_id : null;
        this.error = 'error' in data && typeof data.error === 'string' ?
            data.error : null;
    }

    debug(
        'CONSTRUCTOR > instance initialized with : "id"=%s, "registration_id"=%s,' +
            ' "old_registration_id"=%s, "error"=%s',
        this.id,
        this.registration_id,
        this.old_registration_id,
        this.error
    );
}

// ------------------------------ PRIVATE ------------------------------

// ------------------------------ PUBLIC ------------------------------

/**
 * Create an result object.
 *
 * @returns {{}}
 */
Result.prototype.toJSON = function () {
    var self = this,
        json = {};

    if (self.error) {
        json['error'] = self.error;
        return json;
    }

    json['id'] = self.id;

    if (self.registration_id) {
        json['registration_id'] = self.registration_id;
        json['old_registration_id'] = self.old_registration_id;
    }

    return json;
};

/**
 * Set id.
 *
 * @param id
 */
Result.prototype.setId = function (id) {
    if (typeof id !== 'string') return false;
    this.id = id;
};

/**
 * Set registration_id.
 *
 * @param id
 */
Result.prototype.setRegistrationId = function (id) {
    if (typeof id !== 'string') return false;
    this.registration_id = id;
};

/**
 * Set error.
 *
 * @param error
 */
Result.prototype.setError = function (error) {
    if (typeof error !== 'string') return false;
    this.error = error;
};

/**
 * Set old_registration_id.
 *
 * @param id
 */
Result.prototype.setOldRegistrationId = function (id) {
    if (typeof id !== 'string') return false;
    this.old_registration_id = id;
};

module.exports = Result;