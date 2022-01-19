#! /usr/bin/env node

const { findCLIArgValue } = require('../utils');

require('../index').config({
    path: findCLIArgValue(['--path', '--envPath', '-p']).valueFound || './.env',
    placeholderPath: findCLIArgValue(['--placeholderPath', '--plhl']).valueFound
});