module.exports = function(){
	var http = require("http");

	var lookupurl = "http://www.jorudan.co.jp/norikae/cgi/nori.cgi";
    /*
	var lookupurl = "http://www.jorudan.co.jp/norikae/cgi/nori.cgi?
	eki1= // from
	eki2= // to 
	eki3= // via
	via_on=1
	Dym=201303 // yyyymm
	Ddd=1 // day
	Dhh=22 // hour
	Dmn1=3 // minutes 10th
	Dmn2=5 // minutes
	Cway=0 // 0=出発, 1=到着, 2=始発, 3=終電
	C7=1 // 定期の種類
	C2=0 // 飛行機
	C3=0 // 高速バス
	C1=0 // 有料特急
	C4=0 // 優先座席
	C6=2　// 乗換時間
	S.x=46
	S.y=24
	Cmap1=
	rf=nr
	pg=0
	eok1=
	eok2=
	eok3=
	Csg=1";
	*/

	function lookup(command){

		return { results : "none" };
	}

	return {
		getConnections : function(command){
			return 	lookup(command);
		}
	};
}()
