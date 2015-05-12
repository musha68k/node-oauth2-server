# CouchDB Example

A simple example with support for `password` and `refresh_token` grants using [CouchDB](http://couchdb.apache.org/). You'll need [nano](https://www.npmjs.com/package/nano) installed.

```bash
$ npm install nano --save
```

## Usage

```js
app.oauth = oauthserver({
  model: require('./model'),
  grants: ['password', 'refresh_token'],
  debug: true
});
```

## Data model

Passwords are stored in the clear for simplicity, but in practice these should be hashed using a library like [bcrypt](https://github.com/ncb000gt/node.bcrypt.js).

To create the databases and inject some test data you can run the `testData.js` script in this directory. This will create a client with the ID `afancyagregatorapp` and secret `donttelltheagregatorssecret` and create a single user with the username `bob` and password `buffalo`.