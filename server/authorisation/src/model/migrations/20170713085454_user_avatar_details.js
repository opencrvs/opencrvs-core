
exports.up = function (knex, Promise) {

    return knex.schema.table('users', (table) => {

        table.string('given').notNullable().defaultTo('');
        table.string('family').notNullable().defaultTo('');
        table.string('avatar').notNullable().defaultTo('');
    });
};

exports.down = function (knex, Promise) {

    return knex.schema.table('users', (table) => {

        table.dropColumn('given');
        table.dropColumn('family');
        table.dropColumn('avatar');
    });

};
