var express = require('express');
var UserController= require('../controllers/user');
var api = express.Router();
var multer = require('multer');

//Image upload
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '.jpg')
  }
});
var upload = multer({ storage: storage }).single('avatar');

api.get('/', function(req, res){
	return res.status(200).send({message: 'Entraste a la API'});
});

api.post('/signup', UserController.signup);
api.post('/signin', UserController.signin);

api.use(UserController.tokenCheck);
api.get('/authenticated', UserController.getAuthenticatedUser);
api.post('/upload', upload, UserController.uploadPicture);

module.exports = api;