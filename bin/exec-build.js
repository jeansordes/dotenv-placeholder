#! /usr/bin/env node

const { findCLIArgValue } = require('../utils');

require('../index').config({
    path: findCLIArgValue('--path') || './.env',
    placeholderPath: findCLIArgValue('--placeholderPath')
});