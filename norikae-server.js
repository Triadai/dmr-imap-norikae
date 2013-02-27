// @author: David M. Roehrscheid
// Twitter: @daviddavid

var Imap = require("imap"),
	inspect = require("util").inspect,
	userdata = require("./account.json");

var imap = new Imap(
	{
		user: userdata.user,
		password: userdata.password,
		host: "imap.gmail.com",
		port: 993,
		secure: true
	}
);

var DEBUG = true;

var state = {};

/* **** */

function debug(message){
	if ( DEBUG ){
		console.log(message);
	}
}
function log(message){
	console.log(message);
}
function error(message){
	log(message);
}

function die(err){
	error("Error: " + err);
	process.exit(1)
}

function openInbox(callback){
	imap.connect(function(err){
		if ( err ) { die(err); }
		imap.openBox("INBOX", true, callback);
	});
}

imap.on("mail", function(maxmessages){
	debug("New maiL!");
	debug(state.mailbox.messages);
	//imap.seq.fetch(state.mailbox);
	process.exit(0);
});

imap.on("error", function(err){
	error("Error event fired: " + err)
});

openInbox(function(err, mailbox){
	if (err){ die(err); }
	state.mailbox = mailbox;
	debug("Successfully logged in.")
});