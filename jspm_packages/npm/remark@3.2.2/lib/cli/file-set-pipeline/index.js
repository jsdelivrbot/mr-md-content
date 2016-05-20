/* */ 
'use strict';
var ware = require('ware');
var configure = require('./configure');
var fileSystem = require('./file-system');
var stdin = require('./stdin');
var transform = require('./transform');
var log = require('./log');
var fileSetPipeline = ware().use(configure).use(fileSystem).use(stdin).use(transform).use(log);
module.exports = fileSetPipeline;
