var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var Sequelize = require("sequelize");

var sequelize = new Sequelize('beateq', 'tonyli', 'lostcause', {
  host: 'db.cg3nqvtpnnm1.us-west-2.rds.amazonaws.com',
  port: 5432,
  dialect: 'postgres',
  pool: {
    max: 10,
    min: 0,
    idle: 10000
  }
});

app.set('sequelize', sequelize);

var port = process.env.PORT || 8080;

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(methodOverride('X-HTTP-Method-Override'));

app.use(express.static(__dirname + '/client'));

if ('development' === app.get('env')) {}

require('./app/routes')(app);

app.listen(port);

console.log('App started on port ' + port);

exports = module.exports = app;
