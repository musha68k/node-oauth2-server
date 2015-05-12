#! /usr/bin/env node

var couchdbConfig = require('./couchdb.json'),
  util = require('util');

/**
 * Creates some sample docs
 * @return null
 */
var createDocs = function() {
  var sampleUser = {
    _id: 'bob',
    username: 'bob',
    password: 'buffalo'
  };

  var sampleClientApp = {
    _id: 'afancyagregatorapp',
    clientId: 'afancyagregatorapp',
    clientSecret: 'donttelltheagregatorssecret',
    grant_types: [
      'password',
      'refresh_token'
    ]
  };

  console.log('Creating some sample docs..')

  var userdb = require('nano')(couchdbConfig.users_url);
  userdb.insert(sampleUser, sampleUser.username, function(error, resultuser) {
    if (error) {
      if (error.statusCode === 409) {
        console.log('  Your user ' + sampleUser._id + ' already exists, no need to create it.');
      } else {
        console.log('  Created a sample user: ' + util.inspect(error));
      }

    } else {
      if (!resultuser.ok) {
        console.log(new Date() + '  No error creating a user, but response was not okay: ' + util.inspect(resultuser));
      } else {
        console.log(new Date() + '  No error saving a user: ' + util.inspect(resultuser));
      }
    }
  });

  var clientdb = require('nano')(couchdbConfig.oauth_clients_url);
  clientdb.insert(sampleClientApp, sampleClientApp.username, function(error, resultuser) {
    if (error) {
      if (error.statusCode === 409) {
        console.log('  Your client app ' + sampleClientApp._id + ' already exists, no need to create it.');
      } else {
        console.log('  Created a sample client: ' + util.inspect(error));
      }

    } else {
      if (!resultuser.ok) {
        console.log(new Date() + '  No error creating a client, but response was not okay: ' + util.inspect(resultuser));
      } else {
        console.log(new Date() + '  No error saving a client: ' + util.inspect(resultuser));
      }
    }
    // process.exit();
  });
};

/**
 * Creates some sample databases (recursively so that each is created in sequence when the previous has been created)
 * @param  {Array} of urls to be created, could be on any couchdb server
 * @return null
 */
var createDbAndLoop = function(fullUrls) {
  if (!fullUrls || fullUrls.length === 0) {
    createDocs();
    return;
  }
  var fullUrl = fullUrls.shift();
  var dbname = fullUrl.substring(fullUrl.lastIndexOf('/')).replace('/', '');
  var couchdbUrlForThisDatabase = fullUrl.replace('/' + dbname, '');

  console.log('Creating ' + dbname + ' on ' + couchdbUrlForThisDatabase);
  var server = require('nano')(couchdbUrlForThisDatabase);
  try {
    server.db.create(dbname, function(error, response) {
      if (error) {
        if (error.statusCode === 412) {
          console.log('  Your db ' + fullUrl + ' already exists, no need to create it.');
        } else {
          console.log('  The server was unable to create this database ', util.inspect(error));
        }
      } else {
        console.log('  Created ' + fullUrl, response);
      }
      createDbAndLoop(fullUrls);
    });
  } catch (e) {
    console.log(e);
    createDbAndLoop(fullUrls);
  }
};

// Create databases and docs.
createDbAndLoop([couchdbConfig.users_url, couchdbConfig.oauth_access_tokens_url, couchdbConfig.oauth_clients_url, couchdbConfig.oauth_refresh_tokens_url]);