exports.up = function(knex, Promise) {
  return knex.schema.createTable("declarations", function(table) {
    table.increments();
    
    table.string("firstName").notNullable();
    table.string("middleName").notNullable();
    table.string("lastName").notNullable();
    table.date("dob").notNullable();
    table.string("personalIDNummber").notNullable();
    table.string("gender").notNullable();
    table.string("typeOfBirth").notNullable();
    table.string("placeOfDelivery").notNullable();
    table.string("attendantAtBirth").notNullable();
    table.string("hospitalName").notNullable();
    table.string("placeOfBirthStreetNumber").notNullable();
    table.string("addressLine1").notNullable();
    table.string("addressLine2").notNullable();
    table.string("town").notNullable();
    table.string("district").notNullable();
    table.string("zip").notNullable();
    table.string("notes").notNullable();

    table.string("mother_personalIDNummber").notNullable();
    table.string("mother_firstName").notNullable();
    table.string("mother_middleName").notNullable();
    table.string("mother_maidenName").notNullable();
    table.date("mother_dob").notNullable();
    table.string("mother_maritalStatus").notNullable();
    table.string("mother_doMarriage").notNullable();
    table.string("mother_durationOfMarriage").notNullable();
    table.string("mother_nationality").notNullable();
    table.string("mother_mobileNumber").notNullable();
    table.string("mother_emailAddress").notNullable();
    table.string("mother_streetNumber").notNullable();
    table.string("mother_houseNumber").notNullable();
    table.string("mother_addressLine1").notNullable();
    table.string("mother_addressLine2").notNullable();
    table.string("mother_town").notNullable();
    table.string("mother_district").notNullable();
    table.string("mother_zip").notNullable();
    table.string("mother_childrenBornAlive").notNullable();
    table.string("mother_childrenBornLiving").notNullable();
    table.string("mother_foetalDeaths").notNullable();
    table.string("mother_dobLastPreviousBirth").notNullable();
    table.string("mother_formalEducation").notNullable();
    table.string("mother_occupation").notNullable();
    table.string("mother_religion").notNullable();
    table.boolean("mother_gainfulEmployment").notNullable();

    table.string("father_personalIDNummber").notNullable();
    table.string("father_firstName").notNullable();
    table.string("father_middleName").notNullable();
    table.string("father_lastName").notNullable();
    table.date("father_dob").notNullable();
    table.string("father_maritalStatus").notNullable();
    table.string("father_doMarriage").notNullable();
    table.string("father_durationOfMarriage").notNullable();
    table.string("father_nationality").notNullable();
    table.string("father_mobileNumber").notNullable();
    table.string("father_emailAddress").notNullable();
    table.string("father_streetNumber").notNullable();
    table.string("father_houseNumber").notNullable();
    table.string("father_addressLine1").notNullable();
    table.string("father_addressLine2").notNullable();
    table.string("father_town").notNullable();
    table.string("father_district").notNullable();
    table.string("father_zip").notNullable();
    table.string("father_formalEducation").notNullable();
    table.string("father_occupation").notNullable();
    table.string("father_religion").notNullable();
    table.boolean("father_gainfulEmployment").notNullable();

    table.string("informant_personalIDNummber").notNullable();
    table.string("informant_firstName").notNullable();
    table.string("informant_middleName").notNullable();
    table.string("informant_lastName").notNullable();
    table.string("informant_relationship").notNullable();
    table.string("informant_mobileNumber").notNullable();
    table.string("informant_emailAddress").notNullable();
    table.string("informant_streetNumber").notNullable();
    table.string("informant_houseNumber").notNullable();
    table.string("informant_addressLine1").notNullable();
    table.string("informant_addressLine2").notNullable();
    table.string("informant_town").notNullable();
    table.string("informant_district").notNullable();
    table.string("informant_zip").notNullable();

    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("declarations");
};
