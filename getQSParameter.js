/*
	Little Scripts
*/
getQSParameter = function (paramName) {
	paramName = paramName.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	var regexS = "[\\?&]"+paramName+"=([^&#]*)";
	var regex = new RegExp( regexS );
	var results = regex.exec( window.location.href );
	return results != null ? results[1] : "";
};

replaceParameterInURL = function (param, value, url) {
	if (typeof(url) == "undefined") {
		url = location.href+"";
	}
	var params = null;
	var base = url.split("?")[0];
	var qs = url.split("?")[1];
	if (qs == null ) {
		params = null;
	} else {
		params = qs.split("&");
		var found = false;
		for (var p = 0; p < params.length; p++) {
			if (params[p].indexOf(param+"=") != -1) {
				params[p] = param+"="+escape(value);
				found = true;
			}
		}
		if (!found) { params.push(param+"="+escape(value)); }

	}
	if (params == null) {
		params = new Array();
		params.push(param+"="+escape(value));
	}
	base+="?";
	for (var p = 0; p < params.length; p++) {
		base+=params[p];
		if (params.length-1 != p) {
			base+="&";
		}
	}
	return base;
}