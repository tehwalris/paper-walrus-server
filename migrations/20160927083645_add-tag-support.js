exports.up = function(knex, Promise) {
  return knex.schema.createTable('tags', table => {
    table.increments();
    table.string('type').notNullable();
    table.string('text').notNullable();
  }).then(() => knex.schema.createTable('tagAssignments', table => {
    table.increments();
    table.integer('tagId').notNullable();
    table.foreign('tagId').references('id').inTable('tags').onDelete('CASCADE');
    table.integer('documentId');
    table.foreign('documentId').references('id').inTable('documents').onDelete('CASCADE');
  }));
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('tags')
    .then(() => knex.schema.dropTableIfExists('tagAssignments'));
};
