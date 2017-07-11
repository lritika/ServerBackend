'use strict';

const configFetchHandler = require('handler/config/userhandler');
//const all = [].concat(configFetchHandler);
const all = [].concat(require('handler/config/userhandler'),require('handler/config/authhandler'));
module.exports = all;