var telegram = require('telegram-bot-api');
var translate = require('./translations').translate;
var keyboardOptions = require('./options.js');

var MongoClient = require('mongodb').MongoClient;

var MONGO_URL = 'mongodb://localhost:27017/lmhybot';
var dbClient = MongoClient.connect(MONGO_URL);

console.log("Sälem, Älem!");

var bot = new telegram({
	token: '234839025:AAFSsyt0y0XoQDNiO1tJaqaPwCNlEcCoJfU',
	updates: {
		enabled: true,
		get_interval: 1000
	}
});

var currentUser;
var cmd;

function includes(searched) {
	return this.indexOf(searched) > -1;
}


var newUser = {
	chat_id: undefined,
	name: undefined,
	tel: undefined,
	isHelper: undefined,
	location: undefined,
	isMale: undefined,
	uiLang: 'english',
	languages: []
};

bot.on('message', function(message) {

  var usersCollection;
  console.log(message);

  dbClient.then(function(db) {
    console.log('connected to db');
    usersCollection = db.collection('users');
    usersCollection.createIndex({location: '2dsphere'});
    return usersCollection.findOne({chat_id: message.chat.id});
  })
    .then(function(user) {
      if (user === null) {
        console.log('creating user', Object.assign({}, newUser, {chat_id: message.chat.id}));
        return usersCollection.insert(
          Object.assign({}, newUser, {chat_id: message.chat.id})
        );
      } else {
        console.log('found user', user);
        return user;
      }
    })
    .then(function(user) {
	    currentUser = message.chat.id;

	    if (message.contact) {
			usersCollection.update(
			  {chat_id: user.chat_id},
			  {$set: {tel: message.contact.phone_number, name: message.contact.first_name }}
			);
		    sendMessageWithOptions(currentUser,
                               translate(user.uiLang, 'askLocation'),
                               JSON.stringify(keyboardOptions.currentLocation(user.uiLang)));
	    } else if (message.location){
			var point = {
			  type: "Point",
			  coordinates: [
				message.location.latitude,
				message.location.longitude
			  ]
			};
			  usersCollection.update(
			    {chat_id: user.chat_id},
			    {$set: {location: point}}
			  );
			searchNearestUser(point, !user.isHelper)
          .then(function(foundUser) {
            return sendFoundUser(currentUser, foundUser);
          })
          .catch(function (err) {console.log(err);})
	    } else {
		    cmd = message.text;
			cmd.includes = includes;
		    switch(cmd) {
				case "/start" : 
					if (false)
						sendMessage(currentUser, translate(user.uiLang, 'notNewbie'));
					else 
						sendMessageWithOptions(currentUser,
                                   translate(user.uiLang, 'whoAreYou'),
                                   JSON.stringify(keyboardOptions.isHelper(user.uiLang)));
					break;
					
				case "/whoisyourdaddy" :
					sendMessage(currentUser, translate(user.uiLang, 'daddy'));
					break;
					
				case "/help" :
					sendMessage(currentUser, translate(user.uiLang, 'help'));
					break;
					
				case "/search" :
          searchNearestUser(user.location, !user.isHelper)
            .then(function(foundUser) {
              return sendFoundUser(currentUser, foundUser);
            })
            .catch(function(err) {
              console.error(err);
            });
					break;
					
				case "/remove" :
					removeUserFromDB(currentUser);
					break;
					
				  default :
					console.log("default cmd");
				  var helper = translate(user.uiLang, 'helper');
				  var helpee = translate(user.uiLang, 'helpee');
				  var male = translate(user.uiLang, 'male');
				  var female = translate(user.uiLang, 'female');
					if (cmd.includes(helper) || cmd.includes(helpee)) {
						usersCollection.update(
							{chat_id: user.chat_id},
							{$set: {isHelper: (cmd == helper)}}
						);						
						sendMessageWithOptions(currentUser,
                                   translate(user.uiLang, 'askGender'),
                                   JSON.stringify(keyboardOptions.isMale(user.uiLang)));
					}
					else if (cmd.includes(male) || cmd.includes(female)){
						usersCollection.update(
							{chat_id: user.chat_id},
							{$set: {isMale: (cmd == male)}}
						);
						sendMessageWithOptions(currentUser,
                                   translate(user.uiLang, 'askNumber'),
                                   JSON.stringify(keyboardOptions.phoneNumber(user.uiLang)));
					}
					else
					  sendMessage(currentUser, translate(user.uiLang, 'couldntRecognize'));
		    }
      }
	  
	  
    }).catch(function(err) {
      console.error('->', err);
    });
});


function sendMessageWithOptions(recipient, msg, options) {
	bot.sendMessage({
			chat_id: recipient,
			text: msg, 
			reply_markup: options
		}, function(err, message)
		{R
			if(err)console.log(err);	
		});
}

function sendMessage(recipient, msg) {
	bot.sendMessage({
			chat_id: recipient,
			text: msg 
		}, function(err, message)
		{
			if(err)console.log(err);
		});
}

function sendFoundUser(currentUser, foundUser) {
  if (foundUser === null) {
    sendMessage(currentUser, 'no match found');
  } else {
    sendMessage(currentUser, 'found: ' + foundUser.name);
		sendContact(currentUser, foundUser);
		sendLocation(currentUser, foundUser);
  }
}

function sendContact(recipient, user) {
	return bot.sendContact({
		chat_id: recipient,
		phone_number: user.tel,
		first_name: user.name
	});
}

function sendLocation(recipient, user) {
	bot.sendLocation({
			chat_id: recipient,
			latitude: user.location.coordinates[0],
			longitude: user.location.coordinates[1]
		});
}

function searchNearestUser(point, isHelper) {
  return dbClient.then(function(db) {
    var users = db.collection('users');
    return users.findOne({
      location: {$near: point},
      isHelper: isHelper})
  });
}


function removeUserFromDB(user) {
	
}
