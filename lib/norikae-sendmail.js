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
  		var body = result.from + " → " + result.to +"\n\n", subject = result.from + "->" + result.to;
  		debug("Sending response email.");
  		//debug(connections);

  		var i = 0, length = connections.length;
      debug(length +" connections")
  		for(; i < length; i++){
  			var conn = connections[i];
  			body += conn.departure + " → " + conn.arrival + " ";
		  	if(conn.mark_cheap || conn.mark_fast || conn.mark_raku){ body += "("; }
  			if(conn.mark_cheap){ body += "安"; }
  			if(conn.mark_fast){ body += "早"; }
  			if(conn.mark_raku){ body += "楽"; }
		  	if(conn.mark_cheap || conn.mark_fast || conn.mark_raku){ body += ")"; }
  			body += "\n";
        body += conn.total_time + " - " + conn.price + " - " + conn.transfers + "\n";
        var j = 0; var jength = conn.route.length;
        for(; j < jength; j++){
          if(conn.route[j].type === "station"){
             body+=conn.route[j].name + "\n";
          }
          if(conn.route[j].type === "train"){
             body+= "↓ " + conn.route[j].line + " (" + conn.route[j].time + " - " + conn.route[j].duration +")\n";
          }
        }

  			body += "\n"; 
  			//debug("body: " + body);
  		}

  		var server = emailjs.server.connect(conf);
  		//console.log(result.author);
  		server.send({
  			"from" : "dmrnode@gmail.com",
  			"subject" : subject,
  			"to" : result.author[0].address,
  			"text" : body
  		}, function(err, msg){ if(err){error(err);} });
  }

  return { send : function(conf, result, connections){ parse(conf, result, connections);}};
}();
