/*
 *
 *                         ~ REPOSITORY MANAGER ~
 *
 */
'use strict';

// let remote = require('remote');
let datastore = require('./datastore');
let Q = require('q');
let isGithubUrl = require('is-github-url');

module.exports = (function() {

  /**
   * Get all repositories from the datastore
   */
  function load() {
    let deferred = Q.defer();
    datastore.repoDb.find({}, function(err, docs) {
      deferred.resolve(docs);
    });
    return deferred.promise;
  }

  /**
   * Remove a repository from the datastore
   */
  function remove(id) {
    let deferred = Q.defer();
    datastore.repoDb.remove({ _id: id }, function(err) {
      load();
      deferred.resolve(id);
    });
    return deferred.promise;
  }

  /**
   * Check if a repository is valid.
   */
  function isInvalidRepo(name, local, remote) {
    if (name == undefined || name.length == 0)
      return "Repository must be given a name";

    if (local.length == 0 && remote.length == 0)
      return "Repository must contain a local or remote url";

    if (remote.length > 0) {
      var gurl = isGithubUrl(remote, {repository : true });
      // if (!gurl) {
      if (false) {
        return "<b><i class='fa fa-fw fa-lg fa-exclamation-triangle'></i> Invalid remote github repository.</b><br> It should be in the form: https://github.com/Owner/Repository";
      }
    }

    return false;
  }

  /**
   * Add a repository to the datastore
   */
  function add(name, local, remote) {
    let deferred = Q.defer();
    let invalid = isInvalidRepo(name, local, remote);

    if (!!invalid) {
      deferred.reject(invalid);
    } else {
      datastore.repoDb.insert({
        name, local, remote
      }, function(err, newDoc) {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(newDoc);
        }
      });
    }

    return deferred.promise;
  }

  /**
   * Add a repository in the datastore
   */
  function update(id, name, local, remote) {
    let deferred = Q.defer();
    let invalid = isInvalidRepo(name, local, remote);

    if (invalid) {
      deferred.reject(invalid);
    } else {
      datastore.repoDb.update({ _id: id }, { name, local, remote }, function(err, newDoc) {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(newDoc);
        }
      });
    }

    return deferred.promise;
  }

  return {
    load: load,
    add: add,
    remove: remove,
    update: update
  }

})();
