Geo = function (latitude, longitude) {
	/*
	 "38° 53' 23" N, 77° 00' 32" W" is "38.889722°, -77.008889°".
	*/
	this.latitude = undefined
	this.longitude = undefined
	this.latitudeDecimal = undefined;
	this.longitudeDecimal = undefined;
	
	if ((""+latitude).indexOf('N') != -1 || (""+latitude).indexOf('S') != -1) {
		/* if N,E,W,S */
		this.latitude = latitude; /* N,S */
		this.longitude = longitude; /* E,W */
	} else {
		/* if numerics */
		this.latitudeDecimal = latitude; /* N,S */
		this.longitudeDecimal = longitude; /* E,W */
	}
}

Geo.prototype.getDec = function () {
	with (this) {
		if (undefined==latitudeDecimal) {
			var D = latitude.substring(0,2);
			var M = latitude.substring(2,4);
			var S = latitude.substring(4,6);
			latitudeDecimal = (1*D + 1*(M/60) + 1*(S/3600));

			D = longitude.substring(0,2);
			M = longitude.substring(2,4);
			S = longitude.substring(4,6);
			longitudeDecimal = (1*D + 1*(M/60) + 1*(S/3600));
			
			if (longitude.charAt(6).toUpperCase() == 'S') { latitudeDecimal *= -1; }
			if (longitude.charAt(6).toUpperCase() == 'W') { longitudeDecimal *= -1; }

		}
		return (latitudeDecimal * 1).toFixed(6) + ", " + (longitudeDecimal * 1).toFixed(6);
	}
}

Geo.prototype._padZeroes = function (num,count) {
	var numZeropad = num + '';
	while(numZeropad.length < count) {
		numZeropad = "0" + numZeropad;
	}
	return numZeropad;
}

Geo.prototype.getDMS = function () {
	with (this) {
		if (undefined==latitudeDecimal) {
			return latitude + ", " + longitude; // Using DMS already
		} else {

			var sign, lAbs, fract;
			var set1, set2, set3;
			var obj1, obj2, obj3;
		
			/* latitude */
			sign = (latitudeDecimal >= 0) ? 1 : -1;
			lAbs = sign * Math.round(latitudeDecimal * 1000000.);
			if (lAbs > 90 * 1000000) {
				throw "Degrees Latitude must be in the range of -90. to 90."
			}
			fract = lAbs / 1000000;
			set1 = Math.floor(fract);
			set2 = Math.floor((fract - Math.floor(fract)) * 60);
			set3 = Math.floor(((((fract) - Math.floor(fract)) * 60) - Math.floor(((fract) - Math.floor(fract)) * 60)) * 100000) * 60 / 100000
			
			if ( 60 == Math.round(set3) ) { obj3 = 0; } else { obj3 = set3; }
			
			if ( 60 == Math.round(set3) && 60 == Math.round(set2 + 1) ) { obj2 = 0; }
			else if ( 60 == Math.round(set3) ) { obj2 = set2 + 1; }
			else { obj2 = set2; }

			if ( 60 == Math.round(set3) && 0 == obj2 && 180 == Math.round(set1 + 1) ) { obj1 = 0; }
			else if ( 60 == Math.round(set3) && 0 == obj2 ) { obj1 = set1 + 1; }
			else { obj1 = set1; }

			latitude = "" + Geo.prototype._padZeroes(Math.round(obj1), 2) + Geo.prototype._padZeroes(Math.round(obj2), 2) + Geo.prototype._padZeroes(Math.round(obj3), 2) + ((sign > 0) ? "N" : "S");
			/* latitude */

			/* longitude */
			sign = (longitudeDecimal >= 0) ? 1 : -1;
			lAbs = sign * Math.round(longitudeDecimal * 1000000.);
			if (lAbs > 180 * 1000000) {
				throw "Degrees Latitude must be in the range of -180. to 180."
			}
			fract = lAbs / 1000000;
			set1 = Math.floor(fract);
			set2 = Math.floor((fract - Math.floor(fract)) * 60);
			set3 = Math.floor(((((lAbs / 1000000) - Math.floor(fract)) * 60) - Math.floor(((fract) - Math.floor(fract)) * 60)) * 100000) * 60 / 100000
			
			if ( 60 == Math.round(set3) ) { obj3 = 0; } else { obj3 = set3; }
			
			if ( 60 == Math.round(set3) && 60 == Math.round(set2 + 1) ) { obj2 = 0; }
			else if ( 60 == Math.round(set3) ) { obj2 = set2 + 1; }
			else { obj2 = set2; }

			if ( 60 == Math.round(set3) && 0 == obj2 && 180 == Math.round(set1 + 1) ) { obj1 = 0; }
			else if ( 60 == Math.round(set3) && 0 == obj2 ) { obj1 = set1 + 1; }
			else { obj1 = set1; }

			longitude = "" + Geo.prototype._padZeroes(Math.round(obj1), 2) + Geo.prototype._padZeroes(Math.round(obj2), 2) + Geo.prototype._padZeroes(Math.round(obj3), 2) + ((sign <= 0) ? "W" : "E");
			/* longitude */

			
		}
		return latitude + ", " + longitude; // Converted.
	}
}

/*
Geo.prototype.addToLat = function () {
}

Geo.prototype.addToLon = function () {
}
*/

/**
http://www.meridianworlddata.com/Distance-Calculation.asp
*/
Geo.prototype.diff = function (lat1, lon1, lat2, lon2) {
	return Math.acos(
		Math.sin(lat1) * Math.sin(lat2) + cos(lat1) * cos(lat2) * cos(lon2-lon1)
	);
}


