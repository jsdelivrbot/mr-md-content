/* */ 
'use strict';
var Configuration = require('../configuration');
function configure(context) {
  if (!context.configuration) {
    context.configuration = new Configuration({
      'detectRC': context.detectRC,
      'file': context.configPath,
      'settings': context.settings,
      'plugins': context.plugins,
      'output': context.output,
      'cwd': context.cwd
    });
  }
}
module.exports = configure;
