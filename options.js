var translate = require('./translations').translate;
var getAllLanguages = require('./translations').getAllLanguages;

module.exports = {
	isHelper : function(lang) {
	  return {
		  keyboard: [[{text: translate(lang, 'helper')}],
				   [{text: translate(lang, 'helpee')}]],
		  resize_keyboard: false,
		  one_time_keyboard: true,
		  force_reply: true
	  };
	},

	isMale : function(lang) {
	  return {
		keyboard: [[{text: translate(lang, 'female')}],
				   [{text: translate(lang, 'male')}]],
		  resize_keyboard: false,
		  one_time_keyboard: true,
		  force_reply: true
	  };
	},

	phoneNumber : function(lang) {
		return {
		keyboard: [[{text: translate(lang, 'shareNumber'),
					 request_contact: true}]],
		  resize_keyboard: false,
		  one_time_keyboard: true,
		  force_reply: true
	  };
	},

	currentLocation : function(lang) {
	  return {
		  keyboard: [[{text: translate(lang, 'shareLocation'),
					 request_location: true}]],
		  resize_keyboard: false,
		  one_time_keyboard: true,
		  force_reply: true
	  };
	},
	
	uiLang : function (lang) {
		return {
		  keyboard: getAllLanguages().map(languageToButton),
		  resize_keyboard: false,
		  one_time_keyboard: true,
		  force_reply: true
	  }
	}
}

function languageToButton(languageName){
	return [{text: languageName}];
}
