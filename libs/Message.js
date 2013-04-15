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

function Message(obj) {
    if (obj && typeof obj === 'object') {

        obj.hasOwnProperty('registration_ids') && registrationIdsIsValid(obj.registration_ids) ?
            this.registration_ids = obj.registration_ids : this.registration_ids = [];

        obj.hasOwnProperty('collapse_key') && collapseKeyIsValid(obj.collapse_key) ?
            this.collapse_key = obj.collapse_key : this.collapse_key = null;

        obj.hasOwnProperty('data') && dataIsValid(obj.data) ?
            this.data = obj.data : this.data = {};

        obj.hasOwnProperty('delay_while_idle') && delayWhileIdleIsValid(obj.delay_while_idle) ?
            this.delay_while_idle = obj.delay_while_idle : this.delay_while_idle = false;

        obj.hasOwnProperty('time_to_live') && timeToLiveIsValid(obj.time_to_live) ?
            this.time_to_live = obj.time_to_live : this.time_to_live = 2419200;

        obj.hasOwnProperty('restricted_package_name') && restrictedPackageNameIsValid(obj.restricted_package_name) ?
            this.restricted_package_name = obj.restricted_package_name : this.restricted_package_name = null;

        obj.hasOwnProperty('dry_run') && dryRunIsValid(obj.dry_run) ?
            this.dry_run = obj.dry_run : this.dry_run = false;
    } else {
        this.registration_ids = [];
        this.collapse_key = null;
        this.data = {};
        this.delay_while_idle = false;
        this.time_to_live = 2419200;
        this.restricted_package_name = null;
        this.dry_run = false;
    }
}

Message.prototype = {
    toJSON: toJSON,
    toString: toString,
    addDataWithKeyValue: addDataWithKeyValue,
    setDataWithObject: setDataWithObject,
    setCollapseKey: setCollapseKey,
    setDryRun: setDryRun,
    setRestrictedPackageName: setRestrictedPackageName,
    setTimeToLive: setTimeToLive,
    setDelayWhileIdle: setDelayWhileIdle,
    addRegistrationId: addRegistrationId,
    setRegistrationIds: setRegistrationIds,
    dataToString: dataToString
};

/**
 * Check if the message object is valid for a JSON
 * request, create an object with the needed
 * variables and return it.
 *
 * @returns {{}}
 */
function toJSON() {
    var json = {};

    if (delayWhileIdleIsValid(this.delay_while_idle) && timeToLiveIsValid(this.time_to_live)
        && restrictedPackageNameIsValid(this.restricted_package_name) && dryRunIsValid(this.dry_run)
        && dataIsValid(this.data) && collapseKeyIsValid(this.collapse_key) && registrationIdsIsValid(this.registration_ids)) {

        json['registration_ids'] = this.registration_ids;
        json['data'] = this.data;
        json['delay_while_idle'] = this.delay_while_idle;
        json['time_to_live'] = this.time_to_live;
        json['dry_run'] = this.dry_run;

        if (this.collapse_key) {
            json['collapse_key'] = this.collapse_key;
        }

        if (this.restricted_package_name) {
            json['restricted_package_name'] = this.restricted_package_name;
        }
    } else {
        json = null
    }

    return json;
}

/**
 * Check if the message object is valid for a plain-text
 * request , create a representation of this object
 * and return it.
 *
 * @returns {string}
 */
function toString() {
    var string = '';

    if (delayWhileIdleIsValid(this.delay_while_idle) && timeToLiveIsValid(this.time_to_live)
        && restrictedPackageNameIsValid(this.restricted_package_name) && dryRunIsValid(this.dry_run)
        && dataIsValid(this.data) && collapseKeyIsValid(this.collapse_key) && registrationIdIsValid(this.registration_ids)) {

        string += 'registration_id=' + this.registration_ids[0];
        string += this.dataToString(this);
        string += '&time_to_live=' + this.time_to_live;

        if (this.dry_run) {
            string += '&dry_run=true';
        } else {
            string += '&dry_run=false';
        }

        if (this.delay_while_idle) {
            string += '&delay_while_idle=true';
        } else {
            string += '&delay_while_idle=false';
        }

        if (this.collapse_key) {
            string += '&collapse_key=' + this.collapse_key;
        }

        if (this.restricted_package_name) {
            string += '&restricted_package_name=' + this.restricted_package_name;
        }
    } else {
        string = null
    }

    return string;
}

/**
 * Create a string representation of data object and
 * return it.
 *
 * @param self
 * @returns {string}
 */
function dataToString(self) {
    var data = '&';

    var keys = Object.keys(self.data);

    keys.forEach(function (key) {
        data += 'data.' + key + '=' + encodeURI(self.data[key]) + '&';
    });

    return data.slice(0, -1);
}

/**
 * Check if delay_while_idle is a boolean and return true.
 *
 * @param delay_while_idle
 * @returns {boolean}
 */
function delayWhileIdleIsValid(delay_while_idle) {
    if (typeof delay_while_idle === 'boolean') {
        return true;
    } else {
        return false;
    }
}

/**
 * Check if time_to_live is a number, is greater than 0 second
 * and lower or equal than 2 419 200 seconds (4 weeks) and
 * return true.
 *
 * @param time_to_live
 * @returns {boolean}
 */
function timeToLiveIsValid(time_to_live) {
    if (typeof time_to_live === 'number' && time_to_live > 0 && time_to_live <= 2419200) {
        return true;
    } else {
        return false;
    }
}

/**
 * Check if restricted_package_name is a string or is not NULL
 * and return true.
 *
 * @param restricted_package_name
 * @returns {boolean}
 */
function restrictedPackageNameIsValid(restricted_package_name) {
    if (typeof restricted_package_name === 'string' || !restricted_package_name) {
        return true;
    } else {
        return false;
    }
}

/**
 * Check if dry_run is a boolean and return true.
 *
 * @param dry_run
 * @returns {boolean}
 */
function dryRunIsValid(dry_run) {
    if (typeof dry_run === 'boolean') {
        return true;
    } else {
        return false;
    }
}

/**
 * Check if data is an object and that is length is lower than
 * 4096 bytes (max 4kb of payload for a notification) and return true.
 *
 * @param data
 * @returns {boolean}
 */
function dataIsValid(data) {
    if (typeof data === 'object' && Buffer.byteLength(JSON.stringify(data)) < 4096) {
        return true;
    } else {
        return false;
    }
}

/**
 * Check if registration_ids is an Array and return true.
 * Use this function when sending a JSON request.
 *
 * @param registration_ids
 * @returns {boolean}
 */
function registrationIdsIsValid(registration_ids) {
    if (util.isArray(registration_ids)) {
        return true;
    } else {
        return false;
    }
}

/**
 * Check if registration_ids is an Array and have one value and
 * return true.
 * Use this function when sending a plain-text request (only
 * one registration_id).
 *
 * @param registration_ids
 * @returns {boolean}
 */
function registrationIdIsValid(registration_ids) {
    if (util.isArray(registration_ids) && registration_ids.length == 1) {
        return true;
    } else {
        return false;
    }
}

/**
 * Check if collapse_key is a String or is not NULL and
 * return true.
 *
 * @param collapse_key
 * @returns {boolean}
 */
function collapseKeyIsValid(collapse_key) {
    if (typeof collapse_key === 'string' || !collapse_key) {
        return true;
    } else {
        return false;
    }
}

/**
 * Add new key value.
 *
 * @param key
 * @param value
 */
function addDataWithKeyValue(key, value) {
    if (!this.data.hasOwnProperty(key)) {
        this.data[key] = value;

        if (dataIsValid(this.data)) {
            return true;
        } else {
            delete this.data[key];
            return false;
        }
    } else {
        return true;
    }
}

/**
 * Set data.
 *
 * @param obj
 */
function setDataWithObject(obj) {
    if (dataIsValid(obj)) {
        this.data = obj;
    }
}

/**
 * Set collapse_key.
 * @param key
 */
function setCollapseKey(key) {
    if (typeof key === 'string') {
        this.collapse_key = key;
    }
}

/**
 * Set dry_run.
 *
 * @param value
 */
function setDryRun(value) {
    if (typeof value === 'boolean') {
        this.dry_run = value;
    }
}

/**
 * Set restricted_package_name.
 *
 * @param value
 */
function setRestrictedPackageName(value) {
    if (typeof value === 'string') {
        this.restricted_package_name = value;
    }
}

/**
 * Set time_to_live.
 *
 * @param value
 */
function setTimeToLive(value) {
    if (typeof value === 'number') {
        this.time_to_live = value;
    }
}

/**
 * Set delay_while_idle.
 *
 * @param value
 */
function setDelayWhileIdle(value) {
    if (typeof value === 'boolean') {
        this.delay_while_idle = value;
    }
}

/**
 * Add a registration id.
 *
 * @param id
 * @returns {boolean}
 */
function addRegistrationId(id) {
    if (typeof id === 'string' && this.registration_ids.length < 1000) {
        if (this.registration_ids.indexOf(id) == -1) {
            this.registration_ids.push(id);
        }

        return true;
    } else {
        return false;
    }
}

/**
 * Set registration_ids.
 *
 * @param ids
 * @returns {boolean}
 */
function setRegistrationIds(ids) {
    if (util.isArray(ids) && ids.length <= 1000) {
        this.registration_ids = ids;
        return true;
    } else {
        return false;
    }
}

module.exports = Message;