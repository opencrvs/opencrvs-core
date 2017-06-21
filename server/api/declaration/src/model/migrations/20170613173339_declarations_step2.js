
exports.up = function(knex, Promise) {
   return Promise.all([
    knex.schema.table('declarations', function(table){
      table.renameColumn("placeOfBirthStreetNumber", "streetNumber");
      table.renameColumn("mother_houseNumber", "mother_houseName");
      table.renameColumn("father_houseNumber", "father_houseName");
      table.renameColumn("informant_houseNumber", "informant_houseName");
    })
  ])  
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('declarations', function(table){
    table.renameColumn("streetNumber", "placeOfBirthStreetNumber");
    table.renameColumn("houseName", "mother_houseNumber");
    table.renameColumn("father_houseName", "father_houseNumber");
    table.renameColumn("informant_houseName", "informant_houseNumber");
      })
  ])
};
