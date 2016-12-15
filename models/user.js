var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');

var beautifyUnique = require('mongoose-beautiful-unique-validation');

var UserSchema = Schema({
	email: {
		type: String, unique: true, lowercase: true, required: true
	},
	password: {
		type: String, select: false, required: true
	},
	name: {
		first: { type: String, required: true, trim: true},
		last: { type: String, required: true, trim: true}
	},
	addresses: [{
		street: String,
		city: String,
		country: String
	}],
	phone: [{
		type: {type: String},
		number: String
	}],
	picture: String,
	pets: [{
		name: String,
		type: {type: String},
		gender: String, enum: ['male', 'female'],
		picture: String
	}],
	signupDate: {
		type: Date, default: Date.now()
	},
	role: {
		type: String, default: 'user'
	}
});

UserSchema.pre('save', function(next){
	var user = this;
	if(!user.isModified('password')){
		return next();
	};
	bcrypt.genSalt(10, function(err, salt){
		if(err){
			return next();
		}
		bcrypt.hash(user.password, salt, null, function(err, hash){
			if(err){
				return next(err);
			}
			user.password = hash;
			next();
		});
	});
});

UserSchema.plugin(beautifyUnique);

module.exports = mongoose.model('User', UserSchema);