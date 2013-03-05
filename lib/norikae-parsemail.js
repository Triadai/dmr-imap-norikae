module.exports = function(){
  function debug(message){
    if(global.debug){ global.debug("(parsemail): ".blue + message); }
    else{ console.log(message); }
  }
  function error(message){
    if(global.error){ global.error("(parsemail) ".blue + message); }
    else{ console.log(message); }
  }
  function die(error){
    if(global.die){
      global.die("(parsemail) ".blue + error);
    }
    else{ console.log(error);}
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
	var home = "曳舟";
    	if ( mailobject.subject && mailobject.text){
    		if( mailobject.subject === "乗り換え"){
    			returned.command = "norikae";

    			var lines = mailobject.text.split("\n");
    			if ( lines.length > 1 ){
    				returned.from = lines[0].replace(/\s+/g, '');
    				returned.to = lines[1].replace(/\s+/g, '');
			        returned.author = mailobject.from;

				if(returned.to == ""){
					returned.to = home ;
				}

				if(returned.to == "終電"){
					returned.to = home;
					returned.mode = "last";
				}

				if(lines[2] == "終電"){
					returned.mode = "last";
				}

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
