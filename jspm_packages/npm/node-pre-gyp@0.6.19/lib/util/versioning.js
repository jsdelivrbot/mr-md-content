/* */ 
(function(process) {
  "use strict";
  module.exports = exports;
  var path = require('path');
  var semver = require('semver');
  var url = require('url');
  var abi_crosswalk;
  if (process.env.NODE_PRE_GYP_ABI_CROSSWALK) {
    abi_crosswalk = require(process.env.NODE_PRE_GYP_ABI_CROSSWALK);
  } else {
    abi_crosswalk = require('./abi_crosswalk.json!systemjs-json');
  }
  function get_electron_abi(runtime, target_version) {
    if (!runtime) {
      throw new Error("get_electron_abi requires valid runtime arg");
    }
    if (typeof target_version === 'undefined') {
      throw new Error("Empty target version is not supported if electron is the target.");
    }
    var sem_ver = semver.parse(target_version);
    return runtime + '-v' + sem_ver.major + '.' + sem_ver.minor;
  }
  module.exports.get_electron_abi = get_electron_abi;
  function get_node_webkit_abi(runtime, target_version) {
    if (!runtime) {
      throw new Error("get_node_webkit_abi requires valid runtime arg");
    }
    if (typeof target_version === 'undefined') {
      throw new Error("Empty target version is not supported if node-webkit is the target.");
    }
    return runtime + '-v' + target_version;
  }
  module.exports.get_node_webkit_abi = get_node_webkit_abi;
  function get_node_abi(runtime, versions) {
    if (!runtime) {
      throw new Error("get_node_abi requires valid runtime arg");
    }
    if (!versions) {
      throw new Error("get_node_abi requires valid process.versions object");
    }
    var sem_ver = semver.parse(versions.node);
    if (sem_ver.major === 0 && sem_ver.minor % 2) {
      return runtime + '-v' + versions.node;
    } else {
      return versions.modules ? runtime + '-v' + (+versions.modules) : 'v8-' + versions.v8.split('.').slice(0, 2).join('.');
    }
  }
  module.exports.get_node_abi = get_node_abi;
  function get_runtime_abi(runtime, target_version) {
    if (!runtime) {
      throw new Error("get_runtime_abi requires valid runtime arg");
    }
    if (runtime === 'node-webkit') {
      return get_node_webkit_abi(runtime, target_version || process.versions['node-webkit']);
    } else if (runtime === 'electron') {
      return get_electron_abi(runtime, target_version || process.versions.electron);
    } else {
      if (runtime != 'node') {
        throw new Error("Unknown Runtime: '" + runtime + "'");
      }
      if (!target_version) {
        return get_node_abi(runtime, process.versions);
      } else {
        var cross_obj;
        if (abi_crosswalk[target_version]) {
          cross_obj = abi_crosswalk[target_version];
        } else {
          var target_parts = target_version.split('.').map(function(i) {
            return +i;
          });
          if (target_parts.length != 3) {
            throw new Error("Unknown target version: " + target_version);
          }
          var major = target_parts[0];
          var minor = target_parts[1];
          var patch = target_parts[2];
          if (major === 1) {
            while (true) {
              if (minor > 0)
                --minor;
              if (patch > 0)
                --patch;
              var new_iojs_target = '' + major + '.' + minor + '.' + patch;
              if (abi_crosswalk[new_iojs_target]) {
                cross_obj = abi_crosswalk[new_iojs_target];
                console.log('Warning: node-pre-gyp could not find exact match for ' + target_version);
                console.log('Warning: but node-pre-gyp successfully choose ' + new_iojs_target + ' as ABI compatible target');
                break;
              }
              if (minor === 0 && patch === 0) {
                break;
              }
            }
          } else if (major === 0) {
            if (target_parts[1] % 2 === 0) {
              while (--patch > 0) {
                var new_node_target = '' + major + '.' + minor + '.' + patch;
                if (abi_crosswalk[new_node_target]) {
                  cross_obj = abi_crosswalk[new_node_target];
                  console.log('Warning: node-pre-gyp could not find exact match for ' + target_version);
                  console.log('Warning: but node-pre-gyp successfully choose ' + new_node_target + ' as ABI compatible target');
                  break;
                }
              }
            }
          }
        }
        if (!cross_obj) {
          throw new Error("Unsupported target version: " + target_version);
        }
        var versions_obj = {
          node: target_version,
          v8: cross_obj.v8 + '.0',
          modules: cross_obj.node_abi > 1 ? cross_obj.node_abi : undefined
        };
        return get_node_abi(runtime, versions_obj);
      }
    }
  }
  module.exports.get_runtime_abi = get_runtime_abi;
  var required_parameters = ['module_name', 'module_path', 'host'];
  function validate_config(package_json) {
    var msg = package_json.name + ' package.json is not node-pre-gyp ready:\n';
    var missing = [];
    if (!package_json.main) {
      missing.push('main');
    }
    if (!package_json.version) {
      missing.push('version');
    }
    if (!package_json.name) {
      missing.push('name');
    }
    if (!package_json.binary) {
      missing.push('binary');
    }
    var o = package_json.binary;
    required_parameters.forEach(function(p) {
      if (missing.indexOf('binary') > -1) {
        missing.pop('binary');
      }
      if (!o || o[p] === undefined) {
        missing.push('binary.' + p);
      }
    });
    if (missing.length >= 1) {
      throw new Error(msg + "package.json must declare these properties: \n" + missing.join('\n'));
    }
    if (o) {
      var protocol = url.parse(o.host).protocol;
      if (protocol === 'http:') {
        throw new Error("'host' protocol (" + protocol + ") is invalid - only 'https:' is accepted");
      }
    }
  }
  module.exports.validate_config = validate_config;
  function eval_template(template, opts) {
    Object.keys(opts).forEach(function(key) {
      var pattern = '{' + key + '}';
      while (template.indexOf(pattern) > -1) {
        template = template.replace(pattern, opts[key]);
      }
    });
    return template;
  }
  function fix_slashes(pathname) {
    if (pathname.slice(-1) != '/') {
      return pathname + '/';
    }
    return pathname;
  }
  function drop_double_slashes(pathname) {
    return pathname.replace(/\/\//g, '/');
  }
  var default_package_name = '{module_name}-v{version}-{node_abi}-{platform}-{arch}.tar.gz';
  var default_remote_path = '';
  module.exports.evaluate = function(package_json, options) {
    options = options || {};
    validate_config(package_json);
    var v = package_json.version;
    var module_version = semver.parse(v);
    var runtime = options.runtime || (process.versions['node-webkit'] ? 'node-webkit' : 'node');
    var opts = {
      name: package_json.name,
      configuration: Boolean(options.debug) ? 'Debug' : 'Release',
      debug: options.debug,
      module_name: package_json.binary.module_name,
      version: module_version.version,
      prerelease: module_version.prerelease.length ? module_version.prerelease.join('.') : '',
      build: module_version.build.length ? module_version.build.join('.') : '',
      major: module_version.major,
      minor: module_version.minor,
      patch: module_version.patch,
      runtime: runtime,
      node_abi: get_runtime_abi(runtime, options.target),
      target: options.target || '',
      platform: options.target_platform || process.platform,
      target_platform: options.target_platform || process.platform,
      arch: options.target_arch || process.arch,
      target_arch: options.target_arch || process.arch,
      module_main: package_json.main,
      toolset: options.toolset || ''
    };
    var host = process.env['npm_config_' + opts.module_name + '_binary_host_mirror'] || package_json.binary.host;
    opts.host = fix_slashes(eval_template(host, opts));
    opts.module_path = eval_template(package_json.binary.module_path, opts);
    if (options.module_root) {
      opts.module_path = path.join(options.module_root, opts.module_path);
    } else {
      opts.module_path = path.resolve(opts.module_path);
    }
    opts.module = path.join(opts.module_path, opts.module_name + '.node');
    opts.remote_path = package_json.binary.remote_path ? drop_double_slashes(fix_slashes(eval_template(package_json.binary.remote_path, opts))) : default_remote_path;
    var package_name = package_json.binary.package_name ? package_json.binary.package_name : default_package_name;
    opts.package_name = eval_template(package_name, opts);
    opts.staged_tarball = path.join('build/stage', opts.remote_path, opts.package_name);
    opts.hosted_path = url.resolve(opts.host, opts.remote_path);
    opts.hosted_tarball = url.resolve(opts.hosted_path, opts.package_name);
    return opts;
  };
})(require('process'));
