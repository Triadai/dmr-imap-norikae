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

  

  return {};
}();