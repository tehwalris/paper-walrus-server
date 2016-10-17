'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.table('sourceFiles', table => {
    table.timestamp('uploadedAt').notNullable().defaultTo(knex.fn.now());
    table.timestamp('irlCreatedAt').notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('sourceFiles', table => {
    table.dropColumns('uploadedAt', 'irlCreatedAt');
  });
};
