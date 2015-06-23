var express = require('express'),
 	app = express(),
 	path = require('path'),
 	cookieparser = require('cookie-parser'),
 	session = require('express-session'),
 	config = require('./config/config.js'), 
  	ConnectMongo = require('connect-mongo')(session),
 	mongoose = require('mongoose').connect(config.dbURL),
 	passport = require('passport'),
 	FacebookStrategy = require('passport-facebook').Strategy,
 	rooms = []

app.set('views',path.join(__dirname,'views'));
app.engine('html',require('hogan-express'));
 app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));//./public
 app.use(cookieparser());
 //app.use(session({secret:'catscanfly',saveUninitialize:true,resave:true}));

 var env = process.env.NODE_ENV || 'development';

if(env === 'development'){ 
	//dev
app.use(session({secret:'config.sessionSecret'}))
} 
else
{
	//pro
app.use(session({
	secret:config.sessionSecret,
	store:new ConnectMongo({
		//url:config.dbURL, 
		mongoose_connection:mongoose.connections[0],
		stringify:true
	})
}))
}

app.use(passport.initialize());
app.use(passport.session());

require('./auth/passportAuth.js')(passport,FacebookStrategy,config, mongoose);
require('./routes/route.js')(express, app ,passport, config, rooms ); 

//  app.listen(3000,function(){

// console.log('chat working on port 3000');
// console.log('mode :'+ env);
//  })
app.set('port',process.env.PORT || 3000);
var server =require('http').createServer(app);

var io = require('socket.io').listen(server);

require('./socket/socket.js')(io, rooms);


server.listen(app.get('port'),function(){
console.log('Chat on port : '+ app.get('port'));
});
