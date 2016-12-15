var jwt = require('jsonwebtoken');
var User = require('../models/user');
var config = require('../config');
var bcrypt = require('bcrypt-nodejs');

function signup(req, res){
	var user = new User({
		email: req.body.email,
		password: req.body.password,
		name: {
			first: req.body.first,
			last: req.body.last
		},
		addresses: {
			street: req.body.street,
			city: req.body.city,
			country: req.body.country
		},
		phone: {
			type: req.body.type,
			number: req.body.number
		}
	});

	user.save(function(err, data){
		if(err){
			return res.status(400).json({success: false, 
				message: err
			});
		}

		res.json({success: true, 
			message: 'Registration successful'
		});
	});
};

function signin(req, res){
	if(!req.body.email || !req.body.password){
		return res.status(400).json({success: false, 
			message: { 
				errors: 'Invalid email or password', 
				message: 'User validation failed', 
				name: 'ValidationError'
			}
		});
	}
	User.findOne({ email: req.body.email.toLowerCase() }, 'password role name email', function(err, user){
		if(err){
			return res.status(400).json({ success: false, 
				message: err
			});
		}

		if(!user){
			return res.status(400).json({ success: false, 
				message: { 
					errors: 'User not found', 
					message: 'User validation failed', 
					name: 'ValidationError'
				}
			});
		} else if (user){
			bcrypt.compare(req.body.password, user.password, function(errB, resB){
				if(errB){
					return res.status(500).json({ success: false, 
						message: errB 
					});
				}

				if(!resB){
					return res.status(400).json({ success: false, 
						message:{ 
							errors: 'E-mail and password do not match', 
							message: 'User validation failed', 
							name: 'ValidationError'
						}
					});
				} else {
					var token = jwt.sign({
						email: user.email,
						name: user.name,
						role: user.role
					}, config.hash_secret, {
						expiresIn: '2m'
					});

					res.json({ success: true, 
						message: token
					});
				}
			});
		}
	});
};

function tokenCheck(req, res, next){
	if(req.headers && req.headers.authorization){
		var parts = req.headers.authorization.split(' ');
		if(parts.length == 2){
			token = parts[1];
		} else {
			return res.status(401).json({ success: false, 
				message: {
					errors: 'Invalid token format',
					message: 'Token validation failed',
					name: 'ValidationError'
				}
			});
		}
	} else if(req.body && req.query && req.params){
		if(req.body.token) token = req.body.token;
		if(req.query.token) token = req.query.token;
		if(req.params.token) token = req.params.token;
	} else {
		return res.status(401).json({ success: false, 
			message: {
				errors: 'Token header invalid',
				message: 'Token validation failed',
				name: 'ValidationError'
			}
		});
	}

	jwt.verify(token, config.hash_secret, function(err, decoded) {      
      	if (err) {
        	return res.status(400).json({ success: false, 
        		message: err });
      	} else {
        	req.decoded = decoded;    
        	next();
      	}
	});
};

function getAuthenticatedUser(req, res){
	return res.json({success: true, 
		message: req.decoded
	});
};

function uploadPicture(req, res){
	if(!req.file){
		return res.status(404).json({success: false, 
			message: {
				errors: 'No files were uploaded',
				message: 'No images were uploaded',
				name: 'ValidationError'
			}
		});
	}

	var file = 'http://localhost:3000/pictures/'.concat(req.file.filename);
	User.findOneAndUpdate({ email: req.decoded.email }, {picture: file}, function(err, data){
		if(err){
			return res.status(500).json({success: false, 
				message: err
			});
		}

		return res.json({success: true, 
			message: 'Picture update'});
	});
};

module.exports = {
	tokenCheck,
	signup,
	signin,
	getAuthenticatedUser,
	uploadPicture
}