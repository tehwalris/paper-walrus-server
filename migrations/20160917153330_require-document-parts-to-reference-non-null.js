exports.up = function(knex, Promise) {
  return knex.raw(`
    ALTER TABLE "documentParts" ALTER COLUMN "documentId" SET NOT NULL;
    ALTER TABLE "documentParts" ALTER COLUMN "sourceFileId" SET NOT NULL;
  `);
};

exports.down = function(knex, Promise) {
  return knex.raw(`
    ALTER TABLE "documentParts" ALTER COLUMN "documentId" DROP NOT NULL;
    ALTER TABLE "documentParts" ALTER COLUMN "sourceFileId" DROP NOT NULL;
  `);
};
