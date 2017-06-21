
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('declarations', function(table){
      table.string('region');
      table.string('mother_region');
      table.string('father_region');
      table.string('informant_region');
    })
  ])  
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('declarations', function(table){
      table.dropColumn('region');
      table.dropColumn('mother_region');
      table.dropColumn('father_region');
      table.dropColumn('informant_region');
    })
  ])  
};
