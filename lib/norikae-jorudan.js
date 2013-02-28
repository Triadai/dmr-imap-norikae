module.exports = function(){
	function lookup(from, to, time){
		return { results : "none" };
	}

	return {
		getConnections : function(from, to, time){
			return 	lookup(from, to, time);
		}
	};
}()
