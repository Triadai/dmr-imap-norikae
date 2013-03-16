module.exports = function(){
  function debug(message){
    global.debug("(mailbox): ".green + message);
  }
  function error(message){
    global.error("(mailbox) ".green + message);
  }
  function die(error){
    global.die("(mailbox) ".green + error);
  }

  var Imap = require("imap"),
  Stream = require("stream"),
  Parser = require("mailparser").MailParser,
  imap, imapconf, mailbox;

  function connect_to_server(){
    imap = new Imap(imapconf);

    imap.on("error", function(error){ error("mailbox error event: " + error);});
    imap.on("end", function(){ debug("maibox end event fired");});
    imap.on("close", function(bool){ var s = "mailbox close event with"; if(!bool){ s+="out";} s+=" error"; debug(s); });

    imap.on("mail", function(maxmessages){
      debug("New mail: " + maxmessages + " mails"); 

      if(maxmessages < 1){ die("Less than 1 new message?"); }
      debug("Total messages in inbox:" + mailbox.messages.total);

      var to_fetch = mailbox.messages.total - maxmessages + 1;
      imap.seq.fetch(to_fetch + ":*", {struct: false}, 
        { headers : {parse : false},
        body : true,
        cb : function(fetch){
          var parse = new Parser();

          parse.on("end", function(mailobject){
            imap.emit("mailreadytoparse", mailobject);
          });

          fetch.on("message", function(msg){ 
            debug("Retrieved message " +  msg.seqno);

            msg.on("data", function(chunk){ parse.write(chunk); });

            msg.on("end", function(){
                  //imap.emit("mailreadytoparse", { "headers": headers, "body" : body});
                  parse.end();
                });
              }); // end msg
            } // end cb
          } // end parameters
        ); // end fetch
    });

    handle_connect();
  }

function handle_connect(){
  imap.connect(function(err){
    if(err) { die("Error while connecting: " + err); }
    debug("Opening INBOX");
    imap.openBox("INBOX", true, function(err, mbox){
      if (err) { die(err); }
      debug("Connetcted to mailbox.");
      mailbox = mbox;
      debug(imap.connected);
    });
  });
}

return {
  connect : function(configuration){
    imapconf = configuration;
    connect_to_server();
  },

  reconnect : function(){
    debug("Mailbox reconnecting");
    if(imap.logout){ 
      imap.logout(function(err){
        debug("logout callback called.");
        if(err){ die("Error while logging out: " + err);}
        // There seems to be a bug with the logout callback. It does not wait until
        // the logout process is really finished but rather is called immediately.
        // As a workaround, we wait for 2000ms and reconnect then.
        setTimeout(handle_connect, 2000);
      });
    }
  },

  on : function(event, callback){
    if(imap){
      imap.on(event, callback);
    }
  }, // end on

  is_connected : function(){
    return imap.connected;
  },

  is_authenticated : function(){
    return imap.authenticated;
    //return imap.authenticated;
  },

  empty : "empty"
}; // end returned object


}(); // end module
