/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:15:34 
 * @Last Modified by:   Euan Millar 
 * @Last Modified time: 2017-07-05 01:15:34 
 */
exports.up = function (knex, Promise) {

    return knex.schema.createTable('patients', (table) => {

        table.increments('id').primary();
        table.string('uuid').notNullable();
        table.string('prefix').notNullable();
        table.string('given').notNullable();
        table.string('family').notNullable();
        table.string('birthDate').notNullable();
        table.string('gender').notNullable();
        table.string('maritalStatus').nullable();
        table.string('nationality').notNullable();
        table.boolean('active').notNullable().defaultTo(true);
        table.timestamps();
    })
        .createTable('address', (table) => {

            table.increments('id').primary();
            table.string('addressLine1').notNullable();
            table.string('addressLine2').nullable();
            table.string('addressLine3').nullable();
            table.string('city').nullable();
            table.string('county').notNullable();
            table.string('state').notNullable();
            table.string('postalCode').nullable();
            table.integer('patient_id').notNullable();
        })
        .createTable('telecom', (table) => {

            table.increments('id').primary();
            table.string('email').nullable();
            table.string('phone').nullable();
            table.string('use').nullable();
            table.integer('patient_id').notNullable();
            table.timestamps();
        })
        .createTable('extra', (table) => {

            table.increments('id').primary();
            table.string('childrenBornAlive').nullable();
            table.string('childrenBornLiving').nullable();
            table.string('foetalDeaths').nullable();
            table.string('birthDateLast').nullable();
            table.string('formalEducation').nullable();
            table.string('occupation').nullable();
            table.string('religion').nullable();
            table.string('employment').nullable();
            table.string('personalIDNummber').nullable();
            table.string('maidenName').nullable();
            table.string('marriageDate').nullable();
            table.integer('patient_id').notNullable();
            table.timestamps();
        });

};

exports.down = function (knex, Promise) {

    return knex.schema.dropTable('patients')
        .dropTable('address')
        .dropTable('telecom')
        .dropTable('extra');
};
