exports.up = function(knex, Promise) {
  return knex.schema.createTable('sourceFiles', table => {
    table.increments();
    table.string('filename');
    table.string('mimeType');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('sourceFiles');
};
