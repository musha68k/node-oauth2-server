var model = module.exports,
  util = require('util'),
  couchdbConfig = require('./couchdb.json'),
  nano = require('nano')(couchdbConfig.users_url);

var keys = {
  token: 'tokens&key="%s"',
  client: 'clients&key="%s"',
  refreshToken: 'refresh_tokens&key="%s"',
  grantTypes: 'clients&key="%s":grant_types',
  user: 'users:%s'
};

model.getAccessToken = function(bearerToken, callback) {
  nano.view(util.format(keys.token, bearerToken), function(err, token) {
    if (err) return callback(err);

    if (!token) return callback();

    callback(null, {
      accessToken: token.accessToken,
      clientId: token.clientId,
      expires: token.expires ? new Date(token.expires) : null,
      userId: token.userId
    });
  });
};

model.getClient = function(clientId, clientSecret, callback) {
  nano.view(util.format(keys.client, clientId), function(err, client) {
    if (err) return callback(err);

    if (!client || client.clientSecret !== clientSecret) return callback();

    callback(null, {
      clientId: client.clientId,
      clientSecret: client.clientSecret
    });
  });
};

model.getRefreshToken = function(bearerToken, callback) {
  nano.view(util.format(keys.refreshToken, bearerToken), function(err, token) {
    if (err) return callback(err);

    if (!token) return callback();

    callback(null, {
      refreshToken: token.accessToken,
      clientId: token.clientId,
      expires: token.expires ? new Date(token.expires) : null,
      userId: token.userId
    });
  });
};

model.grantTypeAllowed = function(clientId, grantType, callback) {
  nano.sismember(util.format(keys.grantTypes, clientId), grantType, callback);
};

model.saveAccessToken = function(accessToken, clientId, expires, user, callback) {
  console.log("What is this", accessToken, clientId, expires, util.inspect(user));
  nano.insert({
      _id: accessToken,
      accessToken: accessToken,
      clientId: clientId,
      expires: expires ? expires.toISOString() : null,
      userId: user.id
    },
    accessToken,
    callback);
};

model.saveRefreshToken = function(refreshToken, clientId, expires, user, callback) {
  console.log("What is this", refreshToken, clientId, expires, util.inspect(user));
  nano.insert({
      _id: refreshToken,
      refreshToken: refreshToken,
      clientId: clientId,
      expires: expires ? expires.toISOString() : null,
      userId: user.id
    },
    refreshToken,
    callback);
};

model.getUser = function(username, password, callback) {
  nano.view(util.format(keys.user, username), function(err, user) {
    if (err) return callback(err);

    if (!user || password !== user.password) return callback();

    callback(null, {
      id: username
    });
  });
};