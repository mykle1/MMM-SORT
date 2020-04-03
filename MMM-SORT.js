/* Magic Mirror
 * Module: MMM-SORT = Static Or Rotating Tides
 *
 * By Mykle1
 * MIT License
 */

Module.register("MMM-SORT", {

    // Module config defaults.
    defaults: {
        apiKey: "",                     // Free apiKey @ https://www.worldtides.info/register
        lat: "",                        // your latitude
        lon: "",                        // your longitude
        mode: "static",                 // static or rotating
        timeFormat: "",
        height: "ft",                   // ft = feet, m = meters for tide height
        LowText: "Low",                 // Low tide text. Whatever you want or nothing ""
        HighText: "High",               // High tide text. Whatever you want or nothing ""
        useHeader: false,               // False if you don't want a header
        header: "",                     // Change in config file. useHeader must be true
        maxWidth: "300px",
        animationSpeed: 3000,           // fade speed
        initialLoadDelay: 3250,
        retryDelay: 2500,
        rotateInterval: 30 * 1000,      // seconds
        updateInterval: 60 * 60 * 1000, // Equals 720 of 1000 free calls a month
    },

    getStyles: function() {
        return ["MMM-SORT.css"];
    },

    getScripts: function(){
		return ['moment.js']; // needed for MM versions without moment
	},

    start: function() {
        Log.info("Starting module: " + this.name);


        //  Set locale.
        this.url = "https://www.worldtides.info/api?extremes&lat=" + this.config.lat + "&lon=" + this.config.lon + "&length=604800&key=" + this.config.apiKey;
        this.tides = [];
        this.activeItem = 0;
        this.rotateInterval = null;
        this.scheduleUpdate();
    },


    getDom: function() {

		// create wrapper
        var wrapper = document.createElement("div");
        wrapper.className = "wrapper";
        wrapper.style.maxWidth = this.config.maxWidth;

		// Loading
        if (!this.loaded) {
            wrapper.innerHTML = "First the tide rushes in . . .";
            wrapper.classList.add("bright", "light", "small");
            return wrapper;
        }

		// header
        if (this.config.useHeader != false) {
            var header = document.createElement("header");
            header.classList.add("xsmall", "bright", "header");
            header.innerHTML = this.config.header;
            wrapper.appendChild(header);
        }

///////////////////  Suggested by @yawns. ////////////////////

//////////////////  Almost got there  ////////////////////////

//////////////////  Corrected by Cowboysdude (GURU) //////////

///////////// First - IF the rotating data ///////////////////

		if(this.config.mode != "static"){

            // Rotating my data
            var tides = this.tides; // must also be defined in the else portion of statement

            var keys = Object.keys(this.tides);
        if (keys.length > 0) {
            if (this.activeItem >= keys.length) {
                this.activeItem = 0;
            }
            var tides = this.tides[keys[this.activeItem]];

            //	console.log(tides); // for checking

            var top = document.createElement("div");
            top.classList.add("list-row");

            // Weekday and date adjusts to users local time and format // Stackoverflow.com
            var dt = document.createElement("div");
            dt.classList.add("small", "bright", "dt");
            //	console.log(tides) // for checking
            dt.innerHTML = moment.utc(tides.dt * 1000).local().format("dddd, MMM DD, YYYY"); // Stackoverflow.com
            wrapper.appendChild(dt);


            // type = High or Low tide, icon AND time
            var type = document.createElement("div");
            type.classList.add("small", "bright", "type");
        if (tides.type == "Low") {
                type.innerHTML = tides.type + " tide" + " &nbsp " + " <img class = img src=modules/MMM-SORT/images/low.png width=10% height=10%>" + " &nbsp " + moment.utc(tides.dt * 1000).local().format(this.config.timeFormat);
        } else {
                type.innerHTML = tides.type + " tide" + " &nbsp " + " <img class = img src=modules/MMM-SORT/images/high.png width=10% height=10%>" + " &nbsp " + moment.utc(tides.dt * 1000).local().format(this.config.timeFormat);
            }
            wrapper.appendChild(type);


            // height of tide variance (round to two decimals for ft, m is three decimals)
            var height = document.createElement("div");
            height.classList.add("small", "bright", "height");
        if (this.config.height == "ft") {
                height.innerHTML = "Tidal variance is " + Number(Math.round(tides.height * 3.28 + 'e2') + 'e-2') + " ft"; // https://jsfiddle.net/k5tpq3pd/36/
        } else {
                height.innerHTML = "Tidal variance is " + tides.height + " meters";
            }
            wrapper.appendChild(height);


            // Tide station nearest to config lat and lon
            var station = document.createElement("div");
            station.classList.add("small", "bright", "station");
            station.innerHTML = this.station;
            wrapper.appendChild(station);


            // lat and lon of tide station nearest to config lat and lon
            var latLon = document.createElement("div");
            latLon.classList.add("small", "bright", "latLon");
            latLon.innerHTML = "Tide station " + this.respLat + ", " + this.respLon;
            wrapper.appendChild(latLon);

        }

        ////////////////// ELSE - the static data //////////////

		} else {

		////// MAKE CONFIG OPTIONS FOR ICON AND LOW?HIGH  ///////////


		var tides = this.tides;  // need to define tides again for "else" section....

		var top = document.createElement("div");
        top.classList.add("list-row");


        // place
        var place = document.createElement("div");
        place.classList.add("small", "bright", "place");
        place.innerHTML = this.station;
        top.appendChild(place);


        // Tide #1 = High/Low icon, day of the week, time of tide (am/pm)
        var date = document.createElement("div");


		var LowText = this.config.LowText;
		var HighText = this.config.HighText;


		// IF time NOW is later than epoch time of tide, dim this tide
		if (Date.now() > (tides[0].dt * 1000) ) {
				 date.classList.add("xsmall", "dimmed", "date");
		} else { date.classList.add("xsmall", "bright", "date");
	}
		if (tides[0].type == "Low") {
            date.innerHTML = "<img class = img src=modules/MMM-SORT/images/low.png width=12% height=12%>" + " &nbsp " + moment.utc(tides[0].dt * 1000).local().format("ddd") + " &nbsp" + moment.utc(tides[0].dt * 1000).local().format(this.config.timeFormat) + " <font color=#FCFF00>" + " &nbsp " + LowText + "</font>"; // Stackoverflow.com
        } else {
            date.innerHTML = "<img class = img src=modules/MMM-SORT/images/high.png width=12% height=12%>" + " &nbsp " + moment.utc(tides[0].dt * 1000).local().format("ddd") + " &nbsp" + moment.utc(tides[0].dt * 1000).local().format(this.config.timeFormat) + " <font color=#f3172d>" + " &nbsp " + HighText + "</font>"; // Stackoverflow.com
        }

		top.appendChild(date);



		// Tide #2 = High/Low icon, day of the week, time of tide (am/pm)
        var date2 = document.createElement("div");
        date2.classList.add("xsmall", "bright", "date2");
		if (tides[1].type == "Low") {
            date2.innerHTML = "<img class = img src=modules/MMM-SORT/images/low.png width=12% height=12%>" + " &nbsp " + moment.utc(tides[1].dt * 1000).local().format("ddd") + " &nbsp" + moment.utc(tides[1].dt * 1000).local().format(this.config.timeFormat) + " <font color=#FCFF00>" + " &nbsp " + LowText + "</font>" ; // Stackoverflow.com
        } else {
            date2.innerHTML = "<img class = img src=modules/MMM-SORT/images/high.png width=12% height=12%>" + " &nbsp " + moment.utc(tides[1].dt * 1000).local().format("ddd") + " &nbsp" + moment.utc(tides[1].dt * 1000).local().format(this.config.timeFormat) + " <font color=#f3172d>" + " &nbsp " + HighText + "</font>"; // Stackoverflow.com
        }
		top.appendChild(date2);


		// Tide #3 = High/Low icon, day of the week, time of tide (am/pm)
        var date = document.createElement("div");
        date.classList.add("xsmall", "bright", "date");
		if (tides[2].type == "Low") {
            date.innerHTML = "<img class = img src=modules/MMM-SORT/images/low.png width=12% height=12%>" + " &nbsp " + moment.utc(tides[2].dt * 1000).local().format("ddd") + " &nbsp" + moment.utc(tides[2].dt * 1000).local().format(this.config.timeFormat) + " <font color=#FCFF00>" + " &nbsp " + LowText + "</font>" ; // Stackoverflow.com
        } else {
            date.innerHTML = "<img class = img src=modules/MMM-SORT/images/high.png width=12% height=12%>" + " &nbsp " + moment.utc(tides[2].dt * 1000).local().format("ddd") + " &nbsp" + moment.utc(tides[2].dt * 1000).local().format(this.config.timeFormat) + " <font color=#f3172d>" + " &nbsp " + HighText + "</font>"; // Stackoverflow.com
        }
		top.appendChild(date);


		// Tide #4 = High/Low icon, day of the week, time of tide (am/pm)
        var date2 = document.createElement("div");
        date2.classList.add("xsmall", "bright", "date2");
		if (tides[3].type == "Low") {
            date2.innerHTML = "<img class = img src=modules/MMM-SORT/images/low.png width=12% height=12%>" + " &nbsp " + moment.utc(tides[3].dt * 1000).local().format("ddd") + " &nbsp" + moment.utc(tides[3].dt * 1000).local().format(this.config.timeFormat) + " <font color=#FCFF00>" + " &nbsp " + LowText + "</font>" ; // Stackoverflow.com
        } else {
            date2.innerHTML = "<img class = img src=modules/MMM-SORT/images/high.png width=12% height=12%>" + " &nbsp " + moment.utc(tides[3].dt * 1000).local().format("ddd") + " &nbsp" + moment.utc(tides[3].dt * 1000).local().format(this.config.timeFormat) + " <font color=#f3172d>" + " &nbsp " + HighText + "</font>"; // Stackoverflow.com
        }
		top.appendChild(date2);


		// Tide #5 = High/Low icon, day of the week, time of tide (am/pm)
        var date = document.createElement("div");
        date.classList.add("xsmall", "bright", "date");
		if (tides[4].type == "Low") {
            date.innerHTML = "<img class = img src=modules/MMM-SORT/images/low.png width=12% height=12%>" + " &nbsp " + moment.utc(tides[4].dt * 1000).local().format("ddd") + " &nbsp" + moment.utc(tides[4].dt * 1000).local().format(this.config.timeFormat) + " <font color=#FCFF00>" + " &nbsp " + LowText + "</font>" ; // Stackoverflow.com
        } else {
            date.innerHTML = "<img class = img src=modules/MMM-SORT/images/high.png width=12% height=12%>" + " &nbsp " + moment.utc(tides[4].dt * 1000).local().format("ddd") + " &nbsp" + moment.utc(tides[4].dt * 1000).local().format(this.config.timeFormat) + " <font color=#f3172d>" + " &nbsp " + HighText + "</font>"; // Stackoverflow.com
        }
		top.appendChild(date);


		// Tide #6 = High/Low icon, day of the week, time of tide (am/pm)
        var date2 = document.createElement("div");
        date2.classList.add("xsmall", "bright", "date2");
		if (tides[5].type == "Low") {
            date2.innerHTML = "<img class = img src=modules/MMM-SORT/images/low.png width=12% height=12%>" + " &nbsp " + moment.utc(tides[5].dt * 1000).local().format("ddd") + " &nbsp" + moment.utc(tides[5].dt * 1000).local().format(this.config.timeFormat) + " <font color=#FCFF00>" + " &nbsp " + LowText + "</font>" ; // Stackoverflow.com
        } else {
            date2.innerHTML = "<img class = img src=modules/MMM-SORT/images/high.png width=12% height=12%>" + " &nbsp " + moment.utc(tides[5].dt * 1000).local().format("ddd") + " &nbsp" + moment.utc(tides[5].dt * 1000).local().format(this.config.timeFormat) + " <font color=#f3172d>" + " &nbsp " + HighText + "</font>"; // Stackoverflow.com
        }
		top.appendChild(date2);


		// Tide #7 = High/Low icon, day of the week, time of tide (am/pm)
        var date = document.createElement("div");
        date.classList.add("xsmall", "bright", "date");
		if (tides[6].type == "Low") {
            date.innerHTML = "<img class = img src=modules/MMM-SORT/images/low.png width=12% height=12%>" + " &nbsp " + moment.utc(tides[6].dt * 1000).local().format("ddd") + " &nbsp" + moment.utc(tides[6].dt * 1000).local().format(this.config.timeFormat) + " <font color=#FCFF00>" + " &nbsp " + LowText + "</font>" ; // Stackoverflow.com
        } else {
            date.innerHTML = "<img class = img src=modules/MMM-SORT/images/high.png width=12% height=12%>" + " &nbsp " + moment.utc(tides[6].dt * 1000).local().format("ddd") + " &nbsp" + moment.utc(tides[6].dt * 1000).local().format(this.config.timeFormat) + " <font color=#f3172d>" + " &nbsp " + HighText + "</font>"; // Stackoverflow.com
        }
		top.appendChild(date);


		// Tide #8 = High/Low icon, day of the week, time of tide (am/pm)
        var date2 = document.createElement("div");
        date2.classList.add("xsmall", "bright", "date2");
		if (tides[7].type == "Low") {
            date2.innerHTML = "<img class = img src=modules/MMM-SORT/images/low.png width=12% height=12%>" + " &nbsp " + moment.utc(tides[7].dt * 1000).local().format("ddd") + " &nbsp" + moment.utc(tides[7].dt * 1000).local().format(this.config.timeFormat) + " <font color=#FCFF00>" + " &nbsp " + LowText + "</font>" ; // Stackoverflow.com
        } else {
            date2.innerHTML = "<img class = img src=modules/MMM-SORT/images/high.png width=12% height=12%>" + " &nbsp " + moment.utc(tides[7].dt * 1000).local().format("ddd") + " &nbsp" + moment.utc(tides[7].dt * 1000).local().format(this.config.timeFormat) + " <font color=#f3172d>" + " &nbsp " + HighText + "</font>"; // Stackoverflow.com
        }
		top.appendChild(date2);

        wrapper.appendChild(top);

		} // closes else

        return wrapper;
    },


    /////  Add this function to the modules you want to control with voice //////

    notificationReceived: function(notification, payload) {
        if (notification === 'HIDE_TIDES') {
            this.hide(1000);
            this.updateDom(300);
        }  else if (notification === 'SHOW_TIDES') {
            this.show(1000);
            this.updateDom(300);
        }

    },


    processTides: function(data) {
        this.respLat = data.responseLat; // before extremes object
        this.respLon = data.responseLon; // before extremes object
        this.station = data.station; // before extremes object
        this.tides = data.extremes; // Object
    //	console.log(this.tides); // for checking
        this.loaded = true;

    },

    scheduleCarousel: function() {
        console.log("Carousel of Tides fucktion!");
        this.rotateInterval = setInterval(() => {
            this.activeItem++;
            this.updateDom(this.config.animationSpeed);
        }, this.config.rotateInterval);
    },

    scheduleUpdate: function() {
        setInterval(() => {
            this.getTides();
        }, this.config.updateInterval);
        this.getTides(this.config.initialLoadDelay);
    },

    getTides: function() {
        this.sendSocketNotification('GET_TIDES', this.url);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "TIDES_RESULT") {
            this.processTides(payload);
            if (this.config.mode != 'static' && this.rotateInterval == null) {   // if you want static it will return false and will not try to run
            //these statements BOTH have to be true to run... if one is false the other true it will not run. Huge props to Cowboysdude for this!!!
                this.scheduleCarousel();
            }
            this.updateDom(this.config.animationSpeed);
        }
        this.updateDom(this.config.initialLoadDelay);
    },
});
