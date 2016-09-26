
exports.up = function(knex, Promise) {
  return knex.raw(`
    ALTER SEQUENCE "sourceFiles_id_seq" RESTART WITH 100;
    ALTER SEQUENCE "documents_id_seq" RESTART WITH 100;
    ALTER SEQUENCE "documentParts_id_seq" RESTART WITH 100;
  `);
};

exports.down = function(knex, Promise) {
  return knex.raw(`
    ALTER SEQUENCE "sourceFiles_id_seq" RESTART WITH 1;
    ALTER SEQUENCE "documents_id_seq" RESTART WITH 1;
    ALTER SEQUENCE "documentParts_id_seq" RESTART WITH 1;
  `);
};
