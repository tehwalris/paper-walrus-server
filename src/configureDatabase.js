const Knex = require('knex');

function migrateToLatest(knex) {
  return knex.migrate.currentVersion()
    .then(version => console.log(`Database was at version: ${version}`))
    .then(() => knex.migrate.latest())
    .then(() => knex.migrate.currentVersion())
    .then(version => console.log(`Database now at version: ${version}`))
}

module.exports = function(knexConfig) {
  const knex = Knex(knexConfig);

  return migrateToLatest(knex).then(() => knex);
}
