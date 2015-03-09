// grab the nerd model we just created
var Nerd = require('./models/nerd');
var grooveshark = require('grooveshark-js');
var gs = grooveshark('plists_tony2', '62a5ce26c3947471f4573577407b1634');

module.exports = function (app) {

  // server routes ===========================================================
  // handle things like api calls
  // authentication routes

  // sample api route
  app.get('/api/nerds', function (req, res) {
    // use mongoose to get all nerds in the database
    Nerd.find(function (err, nerds) {

      // if there is an error retrieving, send the error. 
      // nothing after res.send(err) will execute
      if (err)
        res.send(err);

      res.json(nerds); // return all nerds in JSON format
    });
  });

  // route to handle creating goes here (app.post)
  // route to handle delete goes here (app.delete)
  app.get('/', function (req, res) {
    res.sendfile('./client/index.html'); // load our public/index.html file
  });

  app.get('/p/*', function (req, res) {
    res.sendfile('./client/views/main.html'); // load our public/index.html file
  });

  app.get('/test/getSong', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    gs.makeRequest({
      method: 'getCountry',
    }, function (error, response, data) {
      res.end(JSON.stringify(data));
    });
  });
};
