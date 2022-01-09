#! /usr/bin/env node

let _path = process.argv.find(str => str.startsWith('--path'));
_path = _path === undefined ? './.env' : _path.replaceAll(/(--path=)|['"]/gi,'');
require('../index').config({path: _path});