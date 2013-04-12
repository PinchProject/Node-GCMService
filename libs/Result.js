/**
 * Author: Ismael Gorissen
 * Date: 12/04/13 13:14
 * Company: PinchProject
 * Website: http://pinchproject.com/
 *
 * Copyright (C) 2013 PinchProject
 * MIT Licensed
 */

function Result() {
    this.id = null;
    this.registration_id = null;
    this.error = null;
}

Result.prototype = {
    setId: setId,
    setRegistrationId: setRegistrationId,
    setError: setError,
    toJSON: toJSON
};

function toJSON() {
    var json = {};

    if (this.id && !this.error) {
        json['id'] = this.id;

        if (this.registration_id) {
            json['registration_id'] = this.registration_id;
        }
    } else if (this.error && !this.id) {
        json['error'] = this.error;
    }

    return json;
}

function setId(id) {
    if (typeof id === 'string') {
        this.id = id;
    }
}

function setRegistrationId(id) {
    if (typeof id === 'string') {
        this.registration_id = id;
    }
}

function setError(error) {
    if (typeof error === 'string') {
        this.error = error;
    }
}

module.exports = Result;