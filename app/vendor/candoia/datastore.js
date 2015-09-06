/*
 *
 *                          ~ CANDOIA DATASTORE ~
 *
 * loads data for initial run of frontend.
 */
'use strict';

const Datastore = require('nedb');
const REPO_DB_LOC = `${__dirname}/../../store/repositories.db`;
const APP_DB_LOC = `${__dirname}/../../store/apps.db`;

module.exports = (function() {
  let repoDb = new Datastore({
    filename: REPO_DB_LOC,
    autoload: true
  });

  let appDb = new Datastore({
    filename: APP_DB_LOC,
    autoload: true
  });

  // appDb.insert([
  //   {
  //     "name": "Impactful Commits",
  //     "path": ".apps/impactful-commits",
  //     "entry": "main.html",
  //     "dev": false
  //   },
  //   {
  //     "name": "Number of Attributes",
  //     "path": ".apps/number-of-attributes",
  //     "entry": "main.html",
  //     "dev": false
  //   },
  //   {
  //     "name": "Top Performers",
  //     "path": ".apps/top-performers",
  //     "entry": "main.html",
  //     "dev": false
  //   },
  //   {
  //     "name": "Flawed Logic Detector",
  //     "path": ".apps/flawed-logic-detector",
  //     "entry": "main.html",
  //     "dev": false
  //   },
  //   {
  //     "name": "NPM Over Revisions",
  //     "path": ".apps/npm-over-revisions",
  //     "entry": "main.html",
  //     "dev": false
  //   },
  //   {
  //     "name": "NOA Over Revisions",
  //     "path": ".apps/noa-over-revisions",
  //     "entry": "main.html",
  //     "dev": false
  //   },
  //   {
  //     "name": "Hot Files",
  //     "path": ".apps/hotfiles",
  //     "entry": "main.html",
  //     "dev": false
  //   }
  // ], function(err, newDoc) {
  //   if (err) console.log(`[ERROR] An error was raised while trying to insert app
  //     data into the app database.\n${err}`);
  //   console.log(`[SUCCESS] populated app database.`);
  // });

  return {
    repoDb: repoDb,
    appDb: appDb
  };

})();
