exports.up = function(knex, Promise) {
  return knex.schema.table('sourceFiles', table => {
    table.string('previewFilename');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('sourceFiles', table => {
    table.dropColumn('previewFilename');
  });
};
