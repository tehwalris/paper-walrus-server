exports.up = function(knex, Promise) {
  return knex.schema.createTable('sourceFiles', table => {
    table.increments();
    table.string('filename').notNullable();
    table.string('mimeType').notNullable();
  }).then(() => knex.schema.createTable('documents', table => {
    table.increments();
    table.string('name');
    table.enu('visibility', ['anonymous', 'standalone']).notNullable();
  })).then(() => knex.schema.createTable('documentParts', table => {
    table.increments();
    table.integer('documentId');
    table.foreign('documentId').references('id').inTable('documents').onDelete('CASCADE');
    table.integer('sourceFileId');
    table.foreign('sourceFileId').references('id').inTable('sourceFiles').onDelete('RESTRICT');
  }));
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('documentParts')
    .then(() => knex.schema.dropTableIfExists('documents'))
    .then(() => knex.schema.dropTableIfExists('sourceFiles'));
};
