/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:15:27 
 * @Last Modified by:   Euan Millar 
 * @Last Modified time: 2017-07-05 01:15:27 
 */
exports.up = function (knex, Promise) {

    return knex.schema.createTable('notifications', (table) => {

        table.increments('id').primary();
        table.string('uuid').notNullable();
        table.string('motherDetails').notNullable();
        table.string('childFirstName').nullable();
        table.string('status').notNullable();
        table.timestamps();
    })
        .createTable('notificationLocations', (table) => {

            table.increments('id').primary();
            table.string('addressLine1').notNullable();
            table.string('addressLine2').nullable();
            table.string('addressLine3').nullable();
            table.string('city').nullable();
            table.string('county').notNullable();
            table.string('state').notNullable();
            table.string('postalCode').nullable();
            table.integer('notification_id').notNullable();
        });
};

exports.down = function (knex, Promise) {

    return knex.schema.dropTable('notifications')
        .dropTable('notification-locations');
};