var en = require('./en.json');
var es = require('./es.json');
var de = require('./de.json');
var fr = require('./fr.json');
var it = require('./it.json');
var tr = require('./tr.json');

var languages = {
  english: en,
  'español': es,
  'deutsch' : de,
  'français' : fr,
  'italiano': it,
  'türkçe' : tr  
};

exports.getAllLanguages = function() {
	return Object.keys(languages);
}

exports.translate = function(lang, key) {
  var language = lang ? (languages[lang.toLowerCase()] || en) : en;
  return language[key];
};
