/*
getQueryStringParam("q"); returns the q value (escaped).
*/

getQueryStringParam = function(paramName) {
	paramName = paramName.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	var regexS = "[\\?&]"+paramName+"=([^&#]*)";
	var regex = new RegExp( regexS );
	var results = regex.exec( window.location.href );
	
	return results != null ? results[1] : ""; 
}
