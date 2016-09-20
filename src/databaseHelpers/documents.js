'use strict';
const createStandardFunctions = require('./createStandardFunctions');

const standardFunctions = createStandardFunctions(
  'documents',
  ['id', 'name', 'visibility', 'partOrder']
);

module.exports = standardFunctions;
