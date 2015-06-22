module.exports = function(passport, FacebookStrategy, config, mongoose) {

	var chatUser = new mongoose.Schema({
		profileId: String,
		fullName: String,
		profilePic: String
	});

	var userModel = mongoose.model('chatUser', chatUser);

	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		userModel.findById(id, function(err, user) {
			done(err, user);
		})
	});

	passport.use(new FacebookStrategy({
		clientID: config.facebook.appID,
		clientSecret: config.facebook.appSecret,
		callbackURL: config.facebook.callbackURL,
		profileFields: ['id', 'displayName', 'photos']
	}, function(accessToken, refreshToken, profile, done) {
		userModel.findOne({'profileID': profile.id}, function(err, result) {
			if(result) {
				done(null, result);
			} else {
				// Create a new user in MongoDB
				var newChatUser = new userModel({
					profileID: profile.id,
					fullName: profile.displayName,
					profilePic: profile.photos[0].value || ''
				});

				newChatUser.save(function(err) {
					done(null, newChatUser);
				});
			}
		})
	}));
}