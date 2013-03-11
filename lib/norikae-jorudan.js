module.exports = function(){
  function debug(message){
    if(global.debug){ global.debug("(jorudan): ".yellow + message); }
    else{ console.log(message); }
  }
  function error(message){
    if(global.error){ global.error("(jorudan) ".yellow + message); }
    else{ console.log(message); }
  }
  function die(error){
    if(global.die){
        global.die("(jorudan) ".yellow + error);
    }
    else{ console.log(error);}
  }

    var http = require("http"),
        jsdom = require("jsdom"),
        request = require("request"),
        url = require("url"),
        inspect = require("util").inspect;

    function show(obj){ return inspect(obj, false, Infinity); }

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

    function lookup(command, callback){
        var query = translateCommand(command),
            connections = [];

        var uri = lookupurl + "?";
        for ( key in query ){
            uri += key + "=" + encodeURIComponent(query[key]) + "&";
        }
        // magic string. I don't knoww what these settings do, but it doesn't work properly without them
        uri += "S.x=59&S.y=8&Cmap1=&rf=nr&pg=0&eok1=&eok2=&eok3=&Csg=1";

        debug("Connecting to Jorudan... " + uri);
        request({'uri' : uri}, function(err, response, body){

            if ( err ){ error("Request failed."); }

            debug("Connected!");
            jsdom.env(
                {html: body,
                 scripts: ['http://code.jquery.com/jquery-1.9.1.min.js']},
                 function(err, window){
                    var $ = window.jQuery;

                    $(".bk_result").each(function(){ 
                        var connection = {}, tmp;

                        connection["mark_fast"] = !!$('img[alt="早い"]' ,this).length;
                        connection["mark_cheap"] = !!$('img[alt="安い"]' ,this).length;
                        connection["mark_raku"] = !!$('img[alt="乗換回数が少ない"]' ,this).length;

                        tmp = $(".data .tm b", this).not("b.ymd"); // Ignore dates for the next day
                        connection["departure"] = tmp.eq(0).text();
                        connection["arrival"] = tmp.eq(2).text();

                        tmp = $("dd", this);
                        connection["total_time"] = tmp.eq(0).text();
                        connection["transfer_time"] = tmp.eq(1).text();
                        connection["transfers"] = tmp.eq(2).text();
                        connection["price"] = tmp.eq(3).text();
                        connection["distance"] = tmp.eq(4).text();

                        tmp = $("div.route", this).find("tr.eki, tr.rosen");
                        connection["route"] = [];
                        tmp.each(function(){
                            var step = {};
                            if($(this).hasClass("eki")){
                                step["type"] = "station";
                                step["name"] = $("td", this).eq(2).text();
                                step["transter_time"] = $("td", this).eq(0).text().replace(/\s+/g, "");
                            }
                            else{
                                step["type"] = "train";
                                step["line"] = $("td", this).eq(3).text();
                                step["time"] = $($("td", this).eq(0).html().split("<br>")[0]).text();
                                step["duration"] = $($("td", this).eq(0).html().split("<br>")[1]).text();
                            }
                            connection["route"].push(step);
                        });

                        debug("Result: " + show(connection));
                        connections.push(connection);
                    });

                    callback(connections);
                 }
            );

            //callback(connections);
        });

        //debug(connections);
    }

// { from, to, via, year, month, day, hour, minutes, boolean airplane, boolean bus, boolean express, mode = shuppatsuetc, transfer_mode
    function translateCommand(command){
        var returned = {},
        date = new Date(),
        tmp, month, year;

        // Convert to Japan Standard Time & normaliye arguments
        date.setMinutes(date.getMinutes() + date.getTimezoneOffset() + 540);

        if ( command.from && command.to ){
            returned["eki1"] = command.from;
            returned["eki2"] = command.to;
            
            if ( command.via ) { returned["eki3"] = command.via; }
            returned["via_on"] = 1;

            /* Set Date. If something is fishy, default to today for year, month, day separetely */
            tmp = "";
            if ( command.year && parseInt(command.year) >= 0 ) {
                tmp = command.year;
            }
            else{
                tmp = date.getFullYear();
            }
            year = tmp;

            if ( command.month && parseInt(command.month) > 0 && parseInt(command.month) < 13){
                if(parseInt(command.month) < 10){
                    tmp += "0";
                }
                tmp += command.month;
                month = command.month;
            }
            else{
                month = date.getMonth() + 1;
                //tmp = month;
                if( month < 10 ){ tmp = tmp + "0" }
                tmp = tmp + month;
            }
            returned["Dym"] = tmp;

            returned["Ddd"] = date.getDate();
            if (command.day && parseInt(command.day) > 0 && parseInt(command.day) <  new Date(year,month,0).getDate()){
                returned["Ddd"] = command.day;
            }
            
            /* Set Time. Default to now for minutes and hours separately if something is fishy */
            returned["Dhh"] = date.getHours();
            if ( command.hour && parseInt(command.hour) > 0 && parseInt(command.hour) < 25 ){
                returned["Dhh"] = command.hour;
            }

            returned["Dmn2"] = date.getMinutes() % 10;
            returned["Dmn1"] = (date.getMinutes() - returned["Dmn2"])/10;
            if( command.minutes && parseInt(command.minutes) >= 0 && parseInt(command.minutes) < 60){
                returned["Dmn2"] = parseInt(command.minutes) % 10;
                returned["Dmn1"] = (parseInt(command.minutes) - returned["Dmn2"]) / 10;
            }

            // Options
            // Airplane?
            returned["C2"] = 0;
            if ( command.airplane ){ returned["C2"] = 1; }
            // 高速バス?
            returned["C3"] = 0;
            if ( command.bus ){ returned["C3"] = 1;}
            // 有料特急
            returned["C1"] = 0;
            if ( command.express ){ returned["C1"] = 1;}
            // 優先座席
            returned["C4"] = 0;
            if ( command.seat_elderly ){ returned["C4"] = 1;}
            // How much time you'd like to have for transfers. 乗換時間. Defaults to normal.
            returned["C6"] = 2;
            if ( command.transfer_mode){
                if ( command.transfer_mode === "quick" || command.transfer_mode == "1"){
                    returned["C6"] = 1;
                }
                if ( command.transfer_mode === "slow" || command.transfer_mode == "3"){
                    returned["C6"] = 3;
                }
            }

            // This is only for timecards
            returned["C7"] = 1;

            // Cway=0 // 0=出発, 1=到着, 2=始発, 3=終電
            // Default to "departure time"
            returned["Cway"] = 0;
            if( command.mode){
                if(command.mode === "arrival" || command.mode == "1"){returned["Cway"] = 1; }
                if(command.mode === "first" || command.mode == "2"){returned["Cway"] = 2; }
                if(command.mode === "last" || command.mode == "3"){returned["Cway"] = 3; }
            }

        }
        else{
            // must give at least from and to parameters
            global.die("Must give at least two and from parameters.");
        }

        return returned;
    }

    return {
        getConnections : function(command, callback){
            return lookup(command, callback);
        }
    };
}()
