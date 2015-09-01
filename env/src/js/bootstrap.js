/*
 *
 *                          ~ CANDOIA BOOTSTRAP ~
 *
 * loads data for initial run of frontend.
 */
"use strict";
const fs = require('fs');



let Public = {
  'appData': JSON.parse(fs.readFileSync('env/store/apps.json', 'utf8'))
};

module.exports = Public;
