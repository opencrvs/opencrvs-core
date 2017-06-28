exports.up = function (knex, Promise) {

    return knex.schema.createTable('users', (table) => {

        table.increments('id').primary();
        table.string('email').notNullable().unique();
        table.string('username').notNullable().unique();
        table.string('password').notNullable();
        table.boolean('admin').notNullable().defaultTo(false);
        table.boolean('manager').notNullable().defaultTo(false);
        table.boolean('registrar').notNullable().defaultTo(false);
        table.boolean('validator').notNullable().defaultTo(false);
        table.boolean('clerk').notNullable().defaultTo(false);
        table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
    }).createTable('roles', (table) => {

        table.increments('id').primary();
        table.string('role').notNullable();
        table.integer('user_id').unique().references('users.id');
    });

};

exports.down = function (knex, Promise) {

    return knex.schema.dropTable('users')
        .dropTable('roles');
};
