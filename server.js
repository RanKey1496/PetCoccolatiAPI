var app = require('./app');
var mongoose = require('mongoose');
var config = require('./config');

mongoose.connect(config.db, function(err, res){
	if(err){
		console.log(err);
	} else {
  		console.log('Conection Established');
	}
  	app.listen(config.port, function(){
    	console.log('Server at http://localhost:3000');
  	});
});