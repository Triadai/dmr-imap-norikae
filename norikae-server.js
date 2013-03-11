// @author: David M. Roehrscheid
// Twitter: @daviddavid
global.DEBUG = true;
global.debug = function(message){
  if ( global.DEBUG ) {
    console.log(message);
  }
};
global.error = function(message){
  console.log(message);
};
global.die = function(error){
  global.error("I'm dieing: " + error);
  process.exit(1);
};

var  inspect = require("util").inspect,
     http = require("http"),  
     colors = require("colors"),

     lookup = require("./lib/norikae-jorudan.js"),
     mailbox = require("./lib/norikae-mailbox.js"),
     mailparser = require("./lib/norikae-parsemail.js"),
     mailsender = require("./lib/norikae-sendmail.js"),

     mailconf = {
      user: "",
      password: "",
      host: "imap.gmail.com",
      port: 993,
      secure: true,
      ssl: true
     },
     sendmailconf = {
        host : "smtp.gmail.com",
        ssl: true
     },

     mailcount = 0,
     requestcount = 0;

// Add different commands here
function evaluate(result){
  if ( result.command === "norikae" ){
    debug("server: ".red + "Got a 'norikae' request: " + result.from + " --> " + result.to);
    lookup.getConnections(result, function(conf, res){ return function(connections){ mailsender.send(conf, res, connections); }}(sendmailconf, result));
  }
}

// Mailbox
if ( process.env.norikaeusername && process.env.norikaepassword ) { 
  debug("server: ".red + "Setting user and password from environment variables.");
  mailconf.user = process.env.norikaeusername;
  mailconf.password = process.env.norikaepassword;
}
else{
  debug("server: ".red + "Setting user and password from json file.");
  userdata = require("./account.json");
  mailconf.user = userdata.user;
  mailconf.password = userdata.password;
}
sendmailconf.user = mailconf.user;
sendmailconf.password = mailconf.password;

mailbox.connect(mailconf);

mailbox.on("mailreadytoparse", function(mail){ 
  debug("server: ".red + "Parsing new mail.");
  mailcount++;
  mailparser.parsemail(mail, function(result){
    if ( result.success ){
      requestcount++;
      evaluate(result);
    }
  });
});

mailbox.on("error", function(error){ debug("mailbox on error: " + error);});
mailbox.on("end", function(){ debug("maibox on end");});
mailbox.on("close", function(bool){ var s = "mailbox on close with"; if(!bool){ s+="out";} s+=" error"; debug(s); });

/* ***** */
// Http Server
var port = process.env.PORT || 8080;
var app = http.createServer(httphandler);
app.listen(port);
debug("server: ".red + "listening to http on port " + port);

function httphandler(req, res){
  res.writeHead(200);
  var response = "Parsed " + mailcount + " mails since start - " + requestcount + " requests. Server is ";
  if ( mailbox.is_connected() ){ response += "connected";}
  else{ response += "not connected";}

  response += " and ";

  if ( mailbox.is_authenticated() ){ response += "authenticated";}
  else{ response += "not authenticated";}

  res.end(response);
}
