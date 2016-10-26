exports.up = function(knex, Promise) {
  return knex.schema.table('users', table => {
    table.unique('email');
  }).then(() => {
    return knex('users').insert({
      email: 'philippevoinov@gmail.com',
      passwordHash: '$2a$10$CKBTZXvAlE9meJxClyATk.sb.KcFBwFw3ormBvdO/eCLV5Hs6PWX.',
    });
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('users', table => {
    table.dropUnique('email');
  }).then(() => {
    return knex('users').where('email', 'philippevoinov@gmail.com').drop();
  });
};
