const ViewerType = require('./ViewerType'),
  {VIEWER_BODY} = require('../constants');

module.exports = {
  type: ViewerType,
  resolve: () => VIEWER_BODY,
};

