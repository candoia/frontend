/*
 *
 *                          ~ CANDOIA BOOTSTRAP ~
 *
 * loads data for initial run of frontend.
 */
'use strict';

const fs = require('fs');
const Datastore = require('nedb');

const REPO_DB_LOC = 'env/store/.db/repositories.db';
const APP_DB_LOC = 'env/store/.db/apps.db';


let repoDb = new Datastore({
  filename: REPO_DB_LOC,
  autoload: true
});

let appDb = new Datastore({
  // filename: APP_DB_LOC,
  autoload: true
});

// repoDb.insert([
//   {
//     "name": "@paninij",
//     "local": "C:/Users/ddmills/Projects/at-paninij"
//   },
//   {
//     "name": "pmd",
//     "local": "C:/Users/ddmills/Projects/pmd"
//   }
// ], function(err, newDoc) {
//   if (err) console.log(`[ERROR] An error was raised while trying to insert repo
//     data into the repo database.\n${err}`);
//   console.log(`[SUCCESS] populated rep database.`);
// });

appDb.insert([
  {
    "name": "Impactful Commits",
    "path": ".apps/impactful-commits",
    "entry": "main.html",
    "dev": false
  },
  {
    "name": "Number of Attributes",
    "path": ".apps/number-of-attributes",
    "entry": "main.html",
    "dev": false
  },
  {
    "name": "Top Performers",
    "path": ".apps/top-performers",
    "entry": "main.html",
    "dev": false
  },
  {
    "name": "Flawed Logic Detector",
    "path": ".apps/flawed-logic-detector",
    "entry": "main.html",
    "dev": false
  },
  {
    "name": "NPM Over Revisions",
    "path": ".apps/npm-over-revisions",
    "entry": "main.html",
    "dev": false
  },
  {
    "name": "NOA Over Revisions",
    "path": ".apps/noa-over-revisions",
    "entry": "main.html",
    "dev": false
  },
  {
    "name": "Hot Files",
    "path": ".apps/hotfiles",
    "entry": "main.html",
    "dev": false
  },  
], function(err, newDoc) {
  if (err) console.log(`[ERROR] An error was raised while trying to insert app
    data into the app database.\n${err}`);
  console.log(`[SUCCESS] populated app database.`);
});

let Public = {
  repository: repoDb,
  app: appDb
}

// let Public = {
//   'appData': JSON.parse(fs.readFileSync('env/store/apps.json', 'utf8'))
// };

module.exports = Public;
