// const _ = require('lodash');
const path = require('path');
const fs = require('fs');

const errorPath = __dirname + '/customErrors';
// const modulePath = __dirname + '/../apis';
const customErrors = {};
const customModuleErrors = {};

fs.readdirSync(errorPath).forEach(function (file) {
  if (file === 'index.js') return;

  let error = require(path.join(errorPath, file));
  let errorName = path.basename(file, '.js');
  customErrors[errorName] = error[errorName];
});

// fs.readdirSync(modulePath).forEach(function (module) {
//   if (module === 'index.js' || module === 'README.md') return;
//   var currentModulePath = modulePath + '/' + module;
//   var moduleStat = fs.statSync(currentModulePath);
//
//   if (moduleStat.isDirectory() && fs.existsSync(currentModulePath + '/errors')) {
//
//     fs.readdirSync(currentModulePath + '/errors').forEach(function(file) {
//       if (file === 'index.js') return;
//
//       let error = require(path.join(currentModulePath + '/errors', file));
//       let errorName = path.basename(file, '.js');
//       customModuleErrors[errorName] = error[errorName];
//     });
//
//   }
// });


//const errors = _.extend({}, customErrors, customModuleErrors);
const errors = {...customErrors, ...customModuleErrors};
module.exports = errors;

