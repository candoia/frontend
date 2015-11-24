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

  return {
    repoDb: repoDb,
    appDb: appDb
  };

})();
