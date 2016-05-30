'use strict';
const os = require('os'),
  path = require('path');

const port = 3000;
const storePath = path.join(os.homedir(), '.paperWalrus/store.json');

module.exports = {port, storePath};
