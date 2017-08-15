/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:15:31 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-08-15 18:47:37
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
        table.string('birthRegistrationNumber').nullable();
        table.timestamp('created_at').notNullable().index().defaultTo(knex.raw('now()'));
        table.timestamp('updated_at').notNullable().index().defaultTo(knex.raw('now()'));
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
        })
        .createTable('informant', (table) => {

            table.increments('id').primary();
            table.string('uuid').nullable();
            table.string('prefix').nullable();
            table.string('given').nullable();
            table.string('family').nullable();
            table.string('relationship').nullable();
            table.string('addressLine1').nullable();
            table.string('addressLine2').nullable();
            table.string('addressLine3').nullable();
            table.string('city').nullable();
            table.string('county').nullable();
            table.string('state').nullable();
            table.string('postalCode').nullable();
            table.string('personalIDNummber').nullable();
            table.string('email').nullable();
            table.string('phone').nullable();
            table.integer('declaration_id').notNullable();
            table.timestamps();
        });
};

exports.down = function (knex, Promise) {

    return knex.schema.dropTable('declarations')
        .dropTable('locations')
        .dropTable('documents');
};
