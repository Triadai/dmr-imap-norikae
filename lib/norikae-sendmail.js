module.exports = function(){
  function debug(message){
    if(global.debug){ global.debug("(sendmail): ".green + message); }
    else{ console.log(message); }
  }
  function error(message){
    if(global.error){ global.error("(sendmail) ".green + message); }
    else{ console.log(message); }
  }
  function die(error){
  	if(global.die){
    	global.die("(sendmail) ".green + error);
    }
    else{ console.log(error);}
  }

  emailjs = require("emailjs");

  function parse(conf, result, connections){
  		var body = "", subject = result.from + "->" + result.to;
  		debug("faking email send");
  		debug(connections);

  		var i = 0, length = connections.length;
  		for(; i < length; i++){
  			var conn = connections[i];
  			body += conn.departure + " -> " + conn.arrival + " ";
  			if(conn.mark_cheap){ body += "(安)"; }
  			if(conn.mark_fast){ body += "(早)"; }
  			if(conn.mark_raku){ body += "(楽)"; }
  			body += "\n";
  			body += conn.total_time + " - " + conn.price;
  			body += "\n\n"; 
  			//debug("body: " + body);
  		}

  		var server = emailjs.server.connect(conf);
  		console.log(result.author);
  		server.send({
  			"from" : "dmrnode@gmail.com",
  			"subject" : subject,
  			"to" : result.author[0].address,
  			"text" : body
  		}, function(err, msg){ if(err){error(err);} });
  }

  return { send : function(conf, result, connections){ parse(conf, result, connections);}};
}();