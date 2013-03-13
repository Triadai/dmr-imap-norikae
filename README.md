dmr-imap-norikae
================

Send me an eMail and I'll tell you what train to take.

Short description
------------------

Being able to look up train connections on the go is vital in Tokyo. If, however, you're one of the few (?) people still using a feature-phone, it can be quite slow and annoying to do that. The eMail application on these phones on the other hand is usually very easy to use.

This project implements an application that logs
into a (google) mail account and looks for new mail. If a new mail in a certain format arrives, it automatially looks up train connections and sends them in a
plain-text format back to the author of the original eMail.

A basic explanation in Japanese [can be found here](http://dl.dropbox.com/u/1297172/share/app.html)

ジョルダン Api
--------------

The most useful part of this project is probably the interface for the [ジョルダン](http://www.jorudan.co.jp/) website.

The module in *lib/norikae-jorudan.js* exposes one function

    getConnections(command, callback)

where *command* has the form

    {
    	from : String, // Name of your 出発駅
    	to : String, // Name of your 到着駅
    	via : String,　// Name of a station you want to pass
    	year : Integer, // Date and time for the train connection
    	month : Integer,
    	day : Integer,
    	hour : Integer,
    	minutes : Integer,
    	airplane : boolean, // Do you want to use airplanes? Defaults to true.
    	bus : boolean, // Do you want to use highway buses? Defaults to true.
    	express : boolean, // Do you want to use express trains with special fees? Defaults to true.
    	seat_elderly : boolean, // Do you require the train to have special seats? Defaults to true.
    	transfer_mode : either an element of [1,2,3] or ["quick", "normal", "slow"], // How much time do you want between transfers? Defaults to normal.
    	mode : either an element of [1,2,3] or ["arrival", "first", "last"] // Search for trains arriving at a certain time instead of leaving. Alternatively, look for the first or last train on that day.
    }

The names of the stations have to exactly match those on the ジョルダン site which can be a problem for station names that
exist multiple times across Japan. If you do not specify a date, it defaults to the current Japanese Standard Time. 

After the lookup, the *callback* is called with the results as an argument. The results are saved in an array of
*connection* objects, which have the form

    {
    	mark_fast : boolean, // This connection is considered "fast" among the results
    	mark_cheap : boolean, // This connection is considered "cheap" among the results
    	mark_raku : boolean, // This connection has a low number of transfers
    	arrival : String, // Arrival time as a string
        departure : String, // Departure time as a string
        total_time : String, // Total duration of the train ride as a string
        transfer_time : String, // How much time you spend transfering
        transfers : String, // How many times you need to transfer
        price : String, // Price
        distance : String, // Distance
        route : {
        	steps...	
        },
    }

and the step objects within the route object have the form

    {
        type : "station",
        name : String, // Station name
        transfer_time : String // Time spent at this station
    }

or

    {
    	type : "train",
    	line : String, // Name of the train line
    	time : String, // departure and arrival time of the train
    	duration: String // Duration of the ride in this line
    }

Almost all properties are strings at the moment and directly scraped from the Jorudan website - some even have 回,分 or 円 characters in them. Parsing them into a nicer format is something I need to do but haven't done yet.
