/**
 * Author: Ismael Gorissen
 * Date: 10/04/13 14:02
 * Company: PinchProject
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
    toJSON:toJSON,
    toString:toString,
    addDataWithKeyValue:addDataWithKeyValue,
    setDataWithObject:setDataWithObject,
    setCollapseKey:setCollapseKey,
    setDryRun:setDryRun,
    setRestrictedPackageName:setRestrictedPackageName,
    setTimeToLive:setTimeToLive,
    setDelayWhileIdle:setDelayWhileIdle,
    addRegistrationId:addRegistrationId,
    setRegistrationIds:setRegistrationIds,
    delayWhileIdleIsValid:delayWhileIdleIsValid,
    timeToLiveIsValid:timeToLiveIsValid,
    restrictedPackageNameIsValid:restrictedPackageNameIsValid,
    dryRunIsValid:dryRunIsValid,
    dataIsValid:dataIsValid,
    registrationIdsIsValid:registrationIdsIsValid,
    registrationIdIsValid:registrationIdIsValid,
    collapseKeyIsValid:collapseKeyIsValid,
    dataToString:dataToString
};

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

function dataToString() {
    var data = '&';

    var keys = Object.keys(this.data);

    keys.forEach(function (key) {
        data += 'data.' + key + '=' + encodeURI(self.data[key]) + '&';
    });

    return data.slice(0, -1);
}

function delayWhileIdleIsValid() {
    if (typeof this.delay_while_idle === 'boolean') {
        return true;
    } else {
        return false;
    }
}

function timeToLiveIsValid() {
    if (typeof this.time_to_live === 'number' && this.time_to_live > 0 && this.time_to_live <= 2419200) {
        return true;
    } else {
        return false;
    }
}

function restrictedPackageNameIsValid() {
    if (typeof this.restricted_package_name === 'string' || !this.restricted_package_name) {
        return true;
    } else {
        return false;
    }
}

function dryRunIsValid() {
    if (typeof this.dry_run === 'boolean') {
        return true;
    } else {
        return false;
    }
}

function dataIsValid() {
    if (Buffer.byteLength(JSON.stringify(this.data)) < 4096 && typeof this.data === 'object') {
        return true;
    } else {
        return false;
    }
}

function registrationIdsIsValid() {
    if (util.isArray(this.registration_ids)) {
        return true;
    } else {
        return false;
    }
}

function registrationIdIsValid() {
    if (util.isArray(this.registration_ids) && this.registration_ids.length == 1) {
        return true;
    } else {
        return false;
    }
}

function collapseKeyIsValid() {
    if (typeof this.collapse_key === 'string' || !this.collapse_key) {
        return true;
    } else {
        return false;
    }
}

function addDataWithKeyValue(key, value) {
    this.data[key] = value;
}

function setDataWithObject(obj) {
    if (typeof obj === 'object') {
        this.data = obj;
    }
}

function setCollapseKey(key) {
    if (typeof key === 'string') {
        this.collapse_key = key;
    }
}

function setDryRun(value) {
    if (typeof value === 'boolean') {
        this.dry_run = value;
    }
}

function setRestrictedPackageName(value) {
    if (typeof value === 'string') {
        this.restricted_package_name = value;
    }
}

function setTimeToLive(value) {
    if (typeof value === 'number') {
        this.time_to_live = value;
    }
}

function setDelayWhileIdle(value) {
    if (typeof value === 'boolean') {
        this.delay_while_idle = value;
    }
}

function addRegistrationId(id) {
    if (typeof id === 'string' && util.isArray(this.registration_ids)) {
        if (this.registration_ids.indexOf(id) == -1) {
            this.registration_ids.push(id);
        }
    }
}

function setRegistrationIds(ids) {
    if (util.isArray(ids)) {
        this.registration_ids = ids;
    }
}

module.exports = Message;