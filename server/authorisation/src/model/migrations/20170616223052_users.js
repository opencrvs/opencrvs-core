exports.up = function (knex, Promise) {

    return knex.schema.createTable('users', (table) => {

        table.increments('id').primary();
        table.string('email').notNullable().unique();
        table.string('username').notNullable().unique();
        table.string('password').notNullable();
        table.string('role').notNullable();
        table.boolean('active').notNullable().defaultTo(true);
        table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
    }).createTable('claims', (table) => {

        table.increments('id').primary();
        table.string('claims').notNullable();
        table.integer('user_id').unique().references('users.id');
    });

};

exports.down = function (knex, Promise) {

    return knex.schema.dropTable('users')
        .dropTable('claims');
};
