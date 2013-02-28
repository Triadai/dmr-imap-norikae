module.exports = function(){
  function debug(message){
    global.debug("(mailbox): ".green + message)
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

	  imap.on("error", function(err){ error("Error event fired: " + err); });
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

                msg.on("headers", function(hdrs){ headers = hdrs; });

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

      imap.connect(function(err){
	      if(err) { die(err); }
	      imap.openBox("INBOX", true, function(err, mbox){
		      if (err) { die(err); }
		        debug("Connetcted to mailbox.");
 		       mailbox = mbox;
	    });
	  });
  };

  return {
    connect : function(configuration){
      imapconf = configuration;
      connect_to_server();
    },

    on : function(event, callback){
      if(imap){
        imap.on(event, callback);
      }
    }, // end on
    empty : "empty"
  }; // end returned object
}(); // end module
