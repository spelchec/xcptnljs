(function ($) {
	"use strict";
	/********************************/
	/* JSLINT COMPLIANT */
	/********************************/
	/* if you look at the Array directly, most recent is on the right. */
	var len = 5;

	function log(v) {
		try {
			if (console && console.log) {
				//console.log("cookiehistory >> " + v);
			}
		} catch (e) {
		}
	}
	/**********************************************************/
	function setCookie(c_name, value, exdays, path) {
		log("entering set cookie: " + c_name + "," + value + "," + exdays + "," + path);
		if (!value) {
			value = "";
		}
		var exdate = new Date(), c_value;
		exdate.setDate(exdate.getDate() + exdays);
		c_value = escape(value) + ((exdays === null) ? "" : "; expires=" + exdate.toUTCString());
		if (!!path) {
			c_value += "; path=" + path;
		}
		log("set cookie: " + (c_name + "=" + c_value));
		document.cookie = c_name + "=" + c_value;
	}
	function getCookie(c_name) {
		log("get cookie: '" + c_name + "' " + document.cookie);
		var i, x, y, ARRcookies = document.cookie.split(";");
		for (i = 0; i < ARRcookies.length; i += 1) {
			x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
			y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
			x = x.replace(/^\s+|\s+$/g, "");
			if (x === c_name) {
				return unescape(y);
			}
		}
		throw "Cookie property '" + c_name + "' not found."
	}
	
	/*
	function checkCookie() {
		var username = getCookie("username");
		if (username !== null && username !== "") {
			alert("Welcome again " + username);
		} else {
			username = prompt("Please enter your name:", "");
			if (username !== null && username !== "") {
				setCookie("username", username, 365);
			}
		}
	}
	*/
	/**********************************************************/

	function t_loadHistoryFromCookie(bucket) {
		var arr = null, a, i;
		try {
			arr = getCookie(bucket);
		} catch (e) {
			log("warning: " + e.message);
		}
		if (!arr) {
			log("returned an empty array.");
			return [];
		}
		a = arr.split("||");
		log("loading " + bucket + " content: ");
		for (i = 0; i < a.length; i++) {
			log(unescape(a[i]))
		}
		return a;
	}


	function t_saveHistoryToCookie(bucket, array) {
		var s = "", exp = 365, i;
		log(typeof (array));
		if (!array || !t_loadHistoryFromCookie(bucket)) {
			s = undefined;
			exp = -1;
		} else {
			for (i = 0; i < array.length; i += 1) {
				s += (array[i] + "||");
			}
			s = s.substring(0, s.length - 2);
		}
		log("set " + bucket + " to piped content : " + s);
		setCookie(bucket, s, exp, "/");
	}

	function t_isInBucket(arr, term) {
		var i;
		for (i = 0; i < arr.length; i += 1) {
			if (arr[i] === term) {
				return i;
			}
		}
		return -1;
	}

	function t_print(arr) {
		log("display: " + unescape(arr));
		var s = "", i;
		if (!!arr && arr.length > 0) {
			for (i = arr.length - 1; i >= 0; i -= 1) {
				s += "<span>" + unescape(arr[i]) + "</span>, ";
			}
		}
		s = s.substring(0, s.length - 2);
		return s;
	}

	$.fn.setCookieSizeLimit = function (num) {
		$(this).limit = num;
	};

	$.fn.clearHistory = function (bucket) {
		var $b = $("#" + bucket);
		log("Entering $.fn.clearHistory(#" + bucket + ")");
		t_saveHistoryToCookie(bucket);
		$b.html(t_print());
	};

	$.fn.addToHistory = function (bucket, term) {
		var $e = $(this), $b = $("#" + bucket), tot = typeof (term), t, arr, whereInBucket, newArr;
		if (tot === "undefined") { term = $e.children(); }
		term = term.clone(true).removeClass("highlighted"); /* highlighted is used to identify selected nodes, and should be ignored. */
		t = escape($("<div></div>").append(term).html());
		arr = t_loadHistoryFromCookie(bucket);
		whereInBucket = t_isInBucket(arr, t);
		if (whereInBucket >= 0) {
			log("is in bucket at position " + whereInBucket);
			newArr = arr.slice(0, whereInBucket).concat(arr.slice(whereInBucket + 1, arr.length));
			arr = newArr;
		} else {
			log("bucket " + bucket + " does not have t=" + t);
		}
		arr.push(t);
		log("array added term(" + t + "); " + arr);
		if (arr.length > len) {
			arr = arr.slice(arr.length - len, arr.length);
		}
		t_saveHistoryToCookie(bucket, arr);
		$b.html(t_print(arr));
		log("refreshed " + ((!$b) ? "elt" : $b.attr("id")));
	};
	$(document).on("ready", function () {
		$(".cookiehistory").each(function () {
			var $e = $(this), arr;
			arr = t_loadHistoryFromCookie($e.attr("id"));
			$e.html(t_print(arr));
		});
	});
/* document, console, escape, unescape, alert, prompt, jQuery */
}(jQuery));