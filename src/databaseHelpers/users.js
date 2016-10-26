'use strict';
const createStandardFunctions = require('./createStandardFunctions');

const standardFunctions = createStandardFunctions(
  'users',
  ['id', 'email', 'passwordHash']
);
async function getByEmail(context, email) {
  const response = await standardFunctions.get(context).where('users.email', email);
  return response[0];
}

module.exports = Object.assign({}, standardFunctions, {
  getByEmail,
});
