'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.table('tags', table => {
    table.unique(['type', 'text']);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('tags', table => {
    table.dropUnique(['type', 'text']);
  });
};
