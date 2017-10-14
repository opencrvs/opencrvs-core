/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:15:27 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-10-13 11:30:06
 */
exports.up = function (knex, Promise) {

    return knex.schema.createTable('notifications', (table) => {

        table.increments('id').primary();
        table.string('uuid').notNullable();
        table.timestamp('created_at').notNullable().index().defaultTo(knex.raw('now()'));
        table.timestamp('updated_at').notNullable().index().defaultTo(knex.raw('now()'));
    });
};

exports.down = function (knex, Promise) {

    return knex.schema.dropTable('notifications');
};
