var express = require('express');
var UserController= require('../controllers/user');
var api = express.Router();

api.get('/', function(req, res){
	return res.status(200).send({message: 'Entraste a la API'});
});

api.post('/signup', UserController.signup);
api.post('/signin', UserController.signin);
api.get('/user', UserController.getUsers);

api.use(UserController.tokenCheck);
api.get('/authenticated', UserController.getAuthenticatedUser);
api.get('/user/:email', UserController.getUser);

module.exports = api;