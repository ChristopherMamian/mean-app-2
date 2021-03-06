var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var port = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

app.use(function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');
	next();
});

app.use(morgan('dev'));

// basic route for home page
app.get('/', function(req, res) {
	res.send('Welcome to the home page!');
});

// get an instance of the express router
var apiRouter = express.Router();

// test route to make sure everything is working
// accessed at GET http://localhost:8080/api

apiRouter.get('/', function(req, res) {
	res.json({ message: 'welcome to the api machine'});
});

// more routes for our API will happen here

// register our routes
// all of our routes will be prefixed with /api
app.use('/api', apiRouter);

// Start server

app.listen(port);
console.log('The money is in port ' + port);

// connect to our database (mongolab)
// mongoose.connect('mongodb://<dbuser>:<dbpassword>@ds043982.mongolab.com:43982/mean-app');

var User = require('./app/models/user');

var apiRouter = express.Router();

// middleware for all requests
apiRouter.use(function(req, res, next) {
	console.log('user has landed');

	next();
});

apiRouter.get('/', function(req, res) {
	res.json({ message: 'you just hit the api!'});
});

apiRouter.route('/users')

	// create a user (accessed at POST http://localhost:8080/api/users)
	.post(function(req, res) {

		// create a new instance of the User model
		var user = new User();

		// set the users information (comes from the request)
		user.name = req.body.name;
		user.username = req.body.username;
		user.password = req.body.password;

		// save the user and check for errors
		user.save(function(err) {
			if (err) {
				// duplicate entry
				if (err.code == 11000)
					return res.json({ success: false, message: 'A user with that username already exists. '});
				else
					return res.send(err);
			}
					res.json({ message: 'User created!' });
		});
	})

	// get all the users (accessed at GET http://localhost:8080/api/users)
	.get(function(req, res) {
		User.find(function(err, users) {
			if (err) res.send(err);

			// return the users
			res.json(users);
		})
	})

	// on routes that end in /users/:user_id
apiRouter.route('users/:user_id')

	// get the user with that id
	.get(function(req, res) {
		User.findById(req.params.user_id, function(err, user) {
			if (err) res.send(err)

				// return that user
			res.json(user);
		});
	})

	// update the user with this id
	.put(function(req, res) {

		// use our user model to find the user we want
		User.findById(req.params.user_id, function(err, user) {

			if (err) res.send(err);

			// update the users info only if its new
			if (req.body.name) user.name = req.body.name;
			if (req.body.username) user.username = req.body.username;
			if (req.body.password) user.password = req.body.password;

			// save the user
			user.save(function(err) {
				if (err) res.send(err);

				// return a message
				res.json({ message: 'User updated'});
			});
		});1

	// delete user with this id
	.delete(function(req, res) {
		User.remove({
			_id: req.params.user_id
		}, function(err, user) {
			if (err) return res.send(err);

			res.json({ message: 'Successfully deleted' });
		});
	});

	})

app.use('/api', apiRouter);