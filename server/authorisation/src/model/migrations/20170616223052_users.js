exports.up = function (knex, Promise) {

    return knex.schema.createTable('users', (table) => {

        table.increments('id').primary();
        table.string('email').notNullable().unique();
        table.string('username').notNullable().unique();
        table.string('password').notNullable();
        table.string('role').notNullable();
        table.string('given').notNullable();
        table.string('family').notNullable();
        table.string('avatar').notNullable();
        table.boolean('active').notNullable().defaultTo(true);
        table.timestamps();
    })
        .createTable('claims', (table) => {

            table.increments('id').primary();
            table.string('claim').notNullable();
            table.integer('user_id').references('users.id');
        })
        .createTable('tokens', (table) => {

            table.increments('id').primary();
            table.string('jti').notNullable().unique();
            table.string('token', 1000).notNullable();
            table.timestamps();
        });

};

exports.down = function (knex, Promise) {

    return knex.schema.dropTable('users')
        .dropTable('claims')
        .dropTable('tokens');
};
