/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:45 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-05 12:32:09
 */
import bookshelf from '../bookshelf';

const Address = bookshelf.Model.extend({
    tableName: 'address'
});

const Telecom = bookshelf.Model.extend({
    tableName: 'telecom'
});

const Extra = bookshelf.Model.extend({
    tableName: 'extra'
});


const Patient = bookshelf.Model.extend({
    tableName: 'patients',
    address: function () {

        return this.hasMany(Address, 'patient_id');
    },
    telecom: function () {

        return this.hasMany(Telecom, 'patient_id');
    },
    extra: function () {

        return this.hasMany(Extra, 'patient_id');
    },
    hasTimestamps: true
});

module.exports = bookshelf.model('Patient', Patient);
