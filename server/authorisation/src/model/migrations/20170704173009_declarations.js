/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:15:31 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-16 19:23:58
 */
exports.up = function (knex, Promise) {

    return knex.schema.createTable('declarations', (table) => {

        table.increments('id').primary();
        table.string('uuid').notNullable();
        table.string('tracking').notNullable();
        table.string('motherDetails').notNullable();
        table.string('fatherDetails').notNullable();
        table.string('childDetails').notNullable();
        table.string('code').notNullable();
        table.string('status').notNullable();
        table.timestamps();
    })
        .createTable('locations', (table) => {

            table.increments('id').primary();
            table.string('placeOfDelivery').nullable();
            table.string('attendantAtBirth').nullable();
            table.string('hospitalName').nullable();
            table.string('addressLine1').notNullable();
            table.string('addressLine2').nullable();
            table.string('addressLine3').nullable();
            table.string('city').nullable();
            table.string('county').notNullable();
            table.string('state').notNullable();
            table.string('postalCode').nullable();
            table.integer('declaration_id').notNullable();
        })
        .createTable('documents', (table) => {

            table.increments('id').primary();
            table.string('uuid').notNullable();
            table.string('oldName').notNullable();
            table.string('contentType').notNullable();
            table.string('staticFile').notNullable();
            table.integer('declaration_id').notNullable();
            table.timestamps();
        });
};

exports.down = function (knex, Promise) {

    return knex.schema.dropTable('declarations')
        .dropTable('locations')
        .dropTable('documents');
};
