module.exports = function(){
  function debug(message){
    global.debug("(parser): ".blue + message)
  }
  function error(message){
    global.error("(parser) ".blue + message);
  }
  function die(error){
    global.die("(parser) ".blue + error);
  }

  var Parser = require("mailparser").MailParser,
      inspect = require("util").inspect;

  function parseMailObject(mailobj, callback){
  	debug("Parsed mail.");
  	debug(show(mailobj));
  }

  function show(obj){ return inspect(obj, false, Infinity); }

  return {
    parsemail : function(mailobject, callback){
    	var returned = {};
    	if ( mailobject.subject && mailobject.text){
    		if( mailobject.subject === "乗り換え"){
    			returned.command = "norikae";

    			var lines = mailobject.text.split("\n");
    			if ( lines.length > 1 ){
    				returned.from = lines[0].replace(/\s+/g, '');
    				returned.to = lines[1].replace(/\s+/g, '');

    				if ( returned.from.length > 0 && returned.to.length > 0 ){
    				  returned.success = true;
    				}
    			} 
    		}
    	}

    	callback( returned ); 
    }
  };
}();