/**
 * Author: Ismael Gorissen
 * Date: 10/04/13 14:02
 * Company: PinchProject
 * Website: http://pinchproject.com/
 */

var util = require('util');

function Message(obj) {
    if (obj) {
        this.registration_ids = obj.registration_ids || [];
        this.collapse_key = obj.collapse_key || null;
        this.data = obj.data || {};
        this.delay_while_idle = obj.delay_while_idle || false;
        this.time_to_live = obj.time_to_live || 2419200;
        this.restricted_package_name = obj.restricted_package_name || null;
        this.dry_run = obj.dry_run || false;
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
    delayWhileIdleIsValid: delayWhileIdleIsValid,
    timeToLiveIsValid: timeToLiveIsValid,
    restrictedPackageNameIsValid: restrictedPackageNameIsValid,
    dryRunIsValid: dryRunIsValid,
    dataIsValid: dataIsValid,
    registrationIdsIsValid: registrationIdsIsValid,
    registrationIdIsValid: registrationIdIsValid,
    collapseKeyIsValid: collapseKeyIsValid,
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

    if (this.delayWhileIdleIsValid() && this.timeToLiveIsValid() && this.restrictedPackageNameIsValid() &&
        this.dryRunIsValid() && this.dataIsValid() && this.collapseKeyIsValid() && this.registrationIdsIsValid()) {
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

    if (this.delayWhileIdleIsValid() && this.timeToLiveIsValid() && this.restrictedPackageNameIsValid() &&
        this.dryRunIsValid() && this.dataIsValid() && this.collapseKeyIsValid() && this.registrationIdIsValid()) {
        string += 'registration_id=' + this.registration_ids[0];
        string += this.dataToString();
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
 * @returns {string}
 */
function dataToString() {
    var data = '&';

    var keys = Object.keys(this.data);

    keys.forEach(function (key) {
        data += 'data.' + key + '=' + encodeURI(self.data[key]) + '&';
    });

    return data.slice(0, -1);
}

/**
 * Check if delay_while_idle is a boolean and return true.
 * @returns {boolean}
 */
function delayWhileIdleIsValid() {
    if (typeof this.delay_while_idle === 'boolean') {
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
 * @returns {boolean}
 */
function timeToLiveIsValid() {
    if (typeof this.time_to_live === 'number' && this.time_to_live > 0 && this.time_to_live <= 2419200) {
        return true;
    } else {
        return false;
    }
}

/**
 * Check if restricted_package_name is a string or is not NULL
 * and return true.
 *
 * @returns {boolean}
 */
function restrictedPackageNameIsValid() {
    if (typeof this.restricted_package_name === 'string' || !this.restricted_package_name) {
        return true;
    } else {
        return false;
    }
}

/**
 * Check if dry_run is a boolean and return true.
 *
 * @returns {boolean}
 */
function dryRunIsValid() {
    if (typeof this.dry_run === 'boolean') {
        return true;
    } else {
        return false;
    }
}

/**
 * Check if data is an object and that is length is lower than
 * 4096 bytes (max 4kb of payload for a notification) and return true.
 *
 * @returns {boolean}
 */
function dataIsValid() {
    if (Buffer.byteLength(JSON.stringify(this.data)) < 4096 && typeof this.data === 'object') {
        return true;
    } else {
        return false;
    }
}

/**
 * Check if registration_ids is an Array and return true.
 * Use this function when sending a JSON request.
 *
 * @returns {boolean}
 */
function registrationIdsIsValid() {
    if (util.isArray(this.registration_ids)) {
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
 * @returns {boolean}
 */
function registrationIdIsValid() {
    if (util.isArray(this.registration_ids) && this.registration_ids.length == 1) {
        return true;
    } else {
        return false;
    }
}

/**
 * Check if collapse_key is a String or is not NULL and
 * return true.
 *
 * @returns {boolean}
 */
function collapseKeyIsValid() {
    if (typeof this.collapse_key === 'string' || !this.collapse_key) {
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
    if (!this.data[key]) {
        this.data[key] = value;
    }
}

/**
 * Set data.
 *
 * @param obj
 */
function setDataWithObject(obj) {
    this.data = obj;
}

/**
 * Set collapse_key.
 * @param key
 */
function setCollapseKey(key) {
    this.collapse_key = key;
}

/**
 * Set dry_run.
 *
 * @param value
 */
function setDryRun(value) {
    this.dry_run = value;
}

/**
 * Set restricted_package_name.
 *
 * @param value
 */
function setRestrictedPackageName(value) {
    this.restricted_package_name = value;
}

/**
 * Set time_to_live.
 *
 * @param value
 */
function setTimeToLive(value) {
    this.time_to_live = value;
}

/**
 * Set delay_while_idle.
 *
 * @param value
 */
function setDelayWhileIdle(value) {
    this.delay_while_idle = value;
}

/**
 * Add a registration id.
 *
 * @param id
 */
function addRegistrationId(id) {
    if (this.registration_ids.indexOf(id) == -1) {
        this.registration_ids.push(id);
    }
}

/**
 * Set registration_ids.
 *
 * @param ids
 */
function setRegistrationIds(ids) {
    this.registration_ids = ids;
}

module.exports = Message;