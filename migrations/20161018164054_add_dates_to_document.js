'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.table('documents', table => {
    table.timestamp('dateRangeStart').notNullable().defaultTo(knex.fn.now());
    table.timestamp('dateRangeEnd').notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('documents', table => {
    table.dropColumns('dateRangeStart', 'dateRangeEnd');
  });
};
