/* */ 
(function(process) {
  'use strict';
  var chalk = require('chalk');
  var chokidar = require('chokidar');
  var CLI = require('./cli');
  var fileSetPipeline = require('./file-set-pipeline/index');
  function run(cli, done) {
    cli.spinner.stop();
    fileSetPipeline.run(cli, function(err) {
      var hasFailed = (cli.files || []).some(function(file) {
        return (file.messages || []).some(function(message) {
          return message.fatal === true || (message.fatal === false && cli.frail);
        });
      });
      done(err, !hasFailed);
      if (!err && cli.watch) {
        cli.spinner.start();
      }
    });
  }
  function engine(argv, done) {
    var cli = new CLI(argv);
    var enabled = chalk.enabled;
    var watcher;
    chalk.enabled = cli.color;
    if (cli.watch) {
      cli.stdout.write(chalk.bold('Watching...') + ' (press CTRL+C to exit)\n');
    }
    run(cli, function(err, success) {
      chalk.enabled = enabled;
      done(err, success);
      if (err || !cli.watch) {
        return;
      }
      if (cli.cache.length) {
        cli.stderr.write(chalk.yellow('Warning') + ': remark does not overwrite ' + 'watched files until exit.\nMessages and other files are ' + 'not affected.\n');
      }
      watcher = chokidar.watch(cli.fileSet.sourcePaths, {'ignoreInitial': true}).on('all', function(type, filePath) {
        if (type === 'add' || type === 'change') {
          cli.globs = [filePath];
          run(cli, done);
        }
      }).on('error', done);
      process.on('SIGINT', function() {
        cli.cache.writeAll();
        if (watcher) {
          watcher.close();
        }
      });
    });
  }
  module.exports = engine;
})(require('process'));
