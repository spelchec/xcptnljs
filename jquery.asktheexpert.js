/**
  * @param autofill			Automatically populates the input box with the topmost suggested value.
 * @param type				Type of interaction autocomplete has with Services. ("$$url$$/Services/db/$$type$$/get")
 * @param display			Expression of the autocomplete suggestion list. Is an array, so [value1, value2] can display as "value1 (value2)" 
 * @param return			return type when autocomplete finished.
 * @param url				URL root ... gateway for portal ("$$url$$/Services/db/$$type$$/get")
 
 * @param mode				Forces autocomplete form. [default, dropdown, autocomplete]
 * @param limit				limits number of autocomplete values returned.
 * @param startText			Default text for autocomplete. Should not be a potential autocomplete value.
 * @param suggestonfocus	On an initial box click show a set of suggested values.
 * @param sortby 			Sort order based on web service.
 *
 */
 (function(jQuery){

	function log(s) {
		try {
			if (typeof(s) == 'object') {
				if (console && console.debug) {
					console.debug("asktheexpert:: " + s);
				} else if (console && console.log) {
					console.log("asktheexpert:: " + s);
				}
			}
			else if (console && console.log) {
				console.log("asktheexpert:: " + s)
			}
		} catch (e) {
		}
	}
 
 	jQuery.fn._copyToClipboard = function(e){
		
		var target = jQuery(e.target);
		var emailText = target.parent(".email").text().replace("[copy]", "");
		var emailInput = jQuery("<input id='clipcopy' name='clipcopy' type='hidden' />").val(emailText);
		target.after(emailInput);
		emailInput.select();
		if (document.selection) { /* IE object */
			CopiedTxt = document.selection.createRange();
			CopiedTxt.execCommand("Copy");
		} else if (window.clipboardData && clipboardData.setData) {
			clipboardData.setData("Text", s);
		} else {
			// This is important but it's not noted anywhere
			netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');

			// create interface to the clipboard
			var clip = Components.classes['@mozilla.org/widget/clipboard;[[[[1]]]]'].createInstance(Components.interfaces.nsIClipboard);
			if (!clip) return;

			// create a transferable
			var trans = Components.classes['@mozilla.org/widget/transferable;[[[[1]]]]'].createInstance(Components.interfaces.nsITransferable);
			if (!trans) return;

			// specify the data we wish to handle. Plaintext in this case.
			trans.addDataFlavor('text/unicode');

			// To get the data from the transferable we need two new objects
			var str = new Object();
			var len = new Object();

			var str = Components.classes["@mozilla.org/supports-string;[[[[1]]]]"].createInstance(Components.interfaces.nsISupportsString);
			var copytext=meintext;
			str.data=copytext;
			trans.setTransferData("text/unicode",str,copytext.length*[[[[2]]]]);
			var clipid=Components.interfaces.nsIClipboard;
			if (!clip) return false;
			clip.setData(trans,null,clipid.kGlobalClipboard);
		}
		return false;
		//document.Form1.txtArea.select(); 
	}
	/*
 	jQuery.fn._openExpertData = function(email, successFunc){
		jQuery.ajax({
			type: 'GET',
			dataType: 'json',
			url: '/Services/db/experts/get/by/email?email=' + email, 
			success: successFunc
		});
	}
	*/
	
	function inVerticalRange($obj, min, max) {
		var top = $obj.offset().top
		var height = $obj.outerHeight();
		var isInRange = ((min <= top && top <= max) || (min <= top + height && top + height <= max))
		log("inVerticalRange: isInRange="+isInRange+"; object("+$obj.attr("id") + ", top="+top+", height="+height+") between " + min + " and " + max)
		return isInRange;
	}
	
	function inHorizontalRange($obj, min, max) {
		var left = $obj.offset().left
		var width = $obj.outerWidth();
		var isInRange = ((min <= left && left <= max) || (min <= left + width && left + width <= max))
		log("inHorizontalRange: isInRange="+isInRange+"; object("+$obj.attr("id") + ", left="+left+", width="+width+") between " + min + " and " + max)
		return isInRange;
	}

	
	jQuery.fn._errorFunc = function (jqXHR, textStatus, errorThrown) {
		log('error: ' + errorThrown);
	}

	jQuery.fn._openExpertData = function(value, successFunc){
		if (value != null && value != undefined) {
			if (value.indexOf("@") != -1) {
				jQuery.ajax({
					type: 'GET',
					dataType: 'json',
					url: '/Services/db/experts/get/by/email?email=' + value, 
					success: successFunc,
					error: jQuery.fn._errorFunc
				});
			} else {
				if (!value) {
					throw "No value passed to _openExpertData";
				}
				var v = value.split(",")
				if (value.indexOf(',') > -1) {
					v = value.split(' ');
				}
				while (v.length < 2) {
					v.push("")
				}
				jQuery.ajax({
					type: 'GET',
					dataType: 'json',
					url: '/Services/db/experts/get?s=' + v[1].trim() + " " + v[0].trim(), /* moves "LNAME, FNAME" to be "FNAME LNAME". */ 
					success: successFunc,
					error: jQuery.fn._errorFunc
				});		
			}
		}
	}

	
 	jQuery.fn._openExpertDataEvent = function(e) {
		jQuery.fn._openExpertData(jQuery(e.target).attr("rel"), 
			function (d) {
				if (!!d.rows && d.rows.length > 0) {
					SystemFunctions.popOut("/mids/experts/profile?id=" + d.rows[0].id, "_blank", "expert-profile");
				} else {
					log("0 results returned with the Ask the Expert click request.")
				}
			});
	}
/*
 	jQuery.fn._expandExpertDataEvent = function(e) {
		var item = jQuery(e.target);
		var data = { imageserver : item.attr("imageserver") }
		var overlay = jQuery("<div class='askTheExpert_overlay' />");
		jQuery.fn._openExpertData(item.attr("rel"), 
			function (d) {
				var rowEmail = d.rows[0].email
				if (rowEmail == undefined) { rowEmail = d.rows[0].EMAIL }
				var rowFullName = d.rows[0].fullname
				if (rowFullName == undefined) { rowFullName = d.rows[0].FULLNAME.replace(/<\/?b>/g, "") } * remove the bold tags if they exist *
				var rowPhone = d.rows[0].phone
				if (rowPhone == undefined) { rowPhone = d.rows[0].PHONE }
				var rowId = d.rows[0].id
				var rowPic = d.rows[0].pictureurl
				if (rowPic == undefined) { rowPic = d.rows[0].PICTUREURL }
				if (d.count == 0) {
					 jQuery.fn._errorFunc(undefined, "Row Count is 0", "Row Count is 0" )
				}

				var profileImage = new Image();
				profileImage.src = rowPic;
				var profile = jQuery("<img style='display:none;' class='profile'/>").attr("src", profileImage.src);
				
				var info = jQuery("<div class='info'/>");
				var href = "/mids/experts/profile?id=" + rowId;
				info.append(jQuery("<div class='title' />").append(jQuery("<a class='name' target='_blank' />").text(rowFullName).attr("href", href)));
				
				var iconEmail = jQuery("<a class='icon iconEmail' target='_blank'/>");
				var iconProfile = jQuery("<a class='icon iconProfile' target='_blank'/>");
				info.find(".title").append(iconEmail.append(jQuery("<img src='" + data.imageserver + "mail.gif' />")).attr("href", "mailto:" + rowEmail));
				info.find(".title").append(iconProfile.append(jQuery("<img src='" + data.imageserver + "profile.gif' />")).attr("href", href));
				info.append(jQuery("<div class='phone contact' />").text(rowPhone));

				var email = jQuery("<div class='email contact' />")
				var copy = jQuery("<a class='copy' />").text("[copy]").attr("href", '#');
				email.append(jQuery("<a />").text(rowEmail).attr("href", "mailto:" + rowEmail))
				info.append(email);

				var gotoProfile = jQuery("<a target='_blank' />").text("View Profile >>").attr("href", '#');
				gotoProfile.attr("href", href)
				info.append(jQuery("<div class='goto contact'/>").append(gotoProfile));
				
				overlay.append(profile)
				overlay.append(info);
				profile.height("100")
				profile.css("display", "");
				item.after(overlay);
		
				overlay.bind("mouseleave", jQuery.fn._collapseExpertDataEvent);
				copy.bind("click", jQuery.fn._copyToClipboard)
			});
	}
*/

	/* Defaults for creating a tile */
	jQuery.fn.askTheExpert_createTileDefaults = {
		"email" : null,
		"name" : null,
		"phone" : null,
		"picture" : null,
		"id" : null,
		"imageserver" : null
	}
	
	function _createTile(json) {
		var obj = jQuery.extend({}, jQuery.fn.askTheExpert_createTileDefaults, json);
		
		var img = new Image(); /* preload */
		img.src = obj.picture;
		
		obj.href = "/mids/experts/profile?id=" + obj.id;
					
		
		htmlString = "<table><tbody>"
			  + "<tr><td class='leftTD image' rowspan='5'><img style='display:none;' class='profile' style='height: 100px; display: inherit;' /></td></tr>"
			  + "<tr><td class='rightTD titlehead'><img style='display:none;' class='profile' src='" + img.src + "' />"
				  + "<a class='name' target='_blank' href='" + obj.href + "'>" + obj.name + "</a>"
				  + "<a class='icon iconEmail' target='_blank'><img href='mailto: " + obj.email + "' src='" + obj.imageserver + "mail.gif' /></a>"
				  + "<a class='icon iconProfile' target='_blank'><img href='" + obj.href + "' src='" + obj.imageserver + "profile.gif' /></a>"
			  +"</td></tr>"
			  + "<tr><td class='rightTD phone contact'>"+obj.phone+"</td></tr>"
			  + "<tr><td class='rightTD email contact'><a href='mailto:"+obj.email+"'>"+obj.email+"</a></td></tr>"
			  + "<tr><td class='rightTD profilelink'><a href='#' target='_blank'>View Profile &gt;&gt;</a></td></tr>"
		  + "</tbody></table>"
		 return $(htmlString)
	}
	
	
	function _hideStuffAroundTile(obj) {
		log("entering: _hideStuffAroundTile(obj)")
		if (!!obj.jquery) {
			var top = obj.offset().top
			var left = obj.offset().left
			var width = obj.width();
			var height = obj.height();
			
			obj.parentsUntil(".portletBase, body").find("input:visible").each(function () {
				var $my = $(this);
				if (inVerticalRange($my, top, top + height) && inHorizontalRange($my, left, left + width)) {
					log("hiding: " + $my.attr("id"))
					$my.css({"visibility" : "hidden"}).data("hideStuffAroundTile", true)
				} else {
					log("NOT hiding: " + $my.attr("id"))
				}
			});
			
			obj.data("top", top)
			obj.data("left", left)
			obj.data("width", width)
			obj.data("height", height)
		}
		log("leaving: _hideStuffAroundTile(obj)" + obj.data())
	}
	function _showStuffAroundTile(obj) {
		log("entering: _showStuffAroundTile(obj)" + obj.data())
		if (!!obj.jquery) {
			var top = obj.data("top") ? obj.data("top") : obj.offset().top;
			var left = obj.data("left") ? obj.data("left") : obj.offset().left;
			var width = obj.data("width") ? obj.data("width") : obj.outerWidth();
			var height = obj.data("height") ? obj.data("height") : obj.outerHeight();
			
			obj.parentsUntil(".portletBase, body").find("input:visible").each(function () {
				var $my = $(this);
				if (inVerticalRange($my, top, top + height) && inHorizontalRange($my, left, left + width)) {
					if ($my.data("hideStuffAroundTile")) {
						log("showing: " + $my.attr("id"))
						$my.css({"visibility" : "visible"}).data("hideStuffAroundTile", false);
					} else {
						log("NOT showing: " + $my.attr("id"))
					}
				} else {
					log("inVerticalRange=" + inVerticalRange($my, top, top + height) + "; inHorizontalRange="+ inHorizontalRange($my, left, left + width))
				}
			})
			
		}
		log("leaving: _showStuffAroundTile(obj)")
	}
	function _bindTile(obj) {
	}

 	jQuery.fn._expandExpertDataEvent = function(e) {
		log("starting jQuery.fn._expandExpertDataEvent")
		var item = jQuery(e.target);
		var data = { imageserver : item.attr("imageserver") }
		var overlay = jQuery("<div class='askTheExpert_overlay' />");
		jQuery.fn._openExpertData(item.attr("rel"), 
			function (d) {
				if (!!d.rows && d.rows.length > 0) {
					var rowEmail = d.rows[0].email
					if (rowEmail == undefined) { rowEmail = d.rows[0].EMAIL }
					var rowFullName = d.rows[0].fullname
					if (rowFullName == undefined) { rowFullName = d.rows[0].FULLNAME.replace(/<\/?b>/g, "") } /* remove the bold tags if they exist */
					var rowPhone = d.rows[0].phone
					if (rowPhone == undefined) { rowPhone = d.rows[0].PHONE }
					var rowPic = d.rows[0].pictureurl
					if (rowPic == undefined) { rowPic = d.rows[0].PICTUREURL }
					var rowId = d.rows[0].id
					if (d.count == 0) {
						 jQuery.fn._errorFunc(undefined, "Row Count is 0", "Row Count is 0" )
					}

					tableView = _createTile({
						email: rowEmail,
						name: rowFullName,
						phone: rowPhone,
						picture: rowPic,
						id: rowId,
						imageserver: data.imageserver
					});
					
					var copy = jQuery("<a class='copy' />").text("[copy]").attr("href", '#');

					overlay.append(tableView);
					item.after(overlay);
			
					overlay.bind("mouseenter", function (e) { _hideStuffAroundTile($(e.currentTarget)) });
					overlay.bind("mouseleave", function (e) { _showStuffAroundTile($(e.currentTarget)) });
					overlay.bind("mouseleave", jQuery.fn._collapseExpertDataEvent);

					copy.bind("click", jQuery.fn._copyToClipboard)
				} else {
					log("0 results returned with the Ask the Expert mouseover request.")
				}
			});
		log("leaving jQuery.fn._expandExpertDataEvent")
	}

 	jQuery.fn._old_expandExpertDataEvent = function(e) {
		var item = jQuery(e.target);
		var data = { imageserver : item.attr("imageserver") }
		var overlay = jQuery("<div class='askTheExpert_overlay' />");
		jQuery.fn._openExpertData(item.attr("rel"), 
			function (d) {
				if (!!d.rows && d.rows.length > 0) {
					var rowEmail = d.rows[0].email
					if (rowEmail == undefined) { rowEmail = d.rows[0].EMAIL }
					var rowFullName = d.rows[0].fullname
					if (rowFullName == undefined) { rowFullName = d.rows[0].FULLNAME.replace(/<\/?b>/g, "") } /* remove the bold tags if they exist */
					var rowPhone = d.rows[0].phone
					if (rowPhone == undefined) { rowPhone = d.rows[0].PHONE }
					var rowPic = d.rows[0].pictureurl
					if (rowPic == undefined) { rowPic = d.rows[0].PICTUREURL }
					var rowId = d.rows[0].id
					if (d.count == 0) {
						 jQuery.fn._errorFunc(undefined, "Row Count is 0", "Row Count is 0" )
					}

					/* create the image, add it to the left side of the table. */
					var imageTD = jQuery("<td class='leftTD image' rowspan='4' />")
					var profileImage = new Image();
					profileImage.src = rowPic;
					var profile = jQuery("<img style='display:none;' class='profile'/>").attr("src", profileImage.src);
					imageTD.append(profile)
					
					var titleTD = jQuery("<td class='rightTD titlehead' />")
					var href = "/mids/experts/profile?id=" + rowId;
					titleTD.append(jQuery("<a class='name' target='_blank' />").text(rowFullName).attr("href", href));
					
					var iconEmail = jQuery("<a class='icon iconEmail' target='_blank'/>");
					var iconProfile = jQuery("<a class='icon iconProfile' target='_blank'/>");
					titleTD.append(iconEmail.append(jQuery("<img src='" + data.imageserver + "mail.gif' />")).attr("href", "mailto:" + rowEmail));
					titleTD.append(iconProfile.append(jQuery("<img src='" + data.imageserver + "profile.gif' />")).attr("href", href));

					var tbodyBlock = jQuery("<tbody />").append(jQuery("<tr />").append(imageTD).append(titleTD));
					var tableView = jQuery("<table />").append(tbodyBlock);

					var phoneRow = jQuery("<tr />")
					phoneRow.append(jQuery("<td class='rightTD phone contact' />").text(rowPhone));
					tbodyBlock.append(phoneRow);
					
					var emailTD = jQuery("<td class='rightTD email contact' />")
					var copy = jQuery("<a class='copy' />").text("[copy]").attr("href", '#');
					emailTD.append(jQuery("<a />").text(rowEmail).attr("href", "mailto:" + rowEmail))
					tbodyBlock.append(jQuery("<tr />").append(emailTD));

					var gotoProfile = jQuery("<a target='_blank' />").text("View Profile >>").attr("href", '#');
					gotoProfile.attr("href", href)
					tbodyBlock.append(jQuery("<tr />").append(jQuery("<td class='rightTD profilelink' />").append(gotoProfile)));
					
					profile.height("100")
					profile.css("display", "");

					overlay.append(tableView);
					item.after(overlay);
			
					overlay.bind("mouseleave", jQuery.fn._collapseExpertDataEvent);
					copy.bind("click", jQuery.fn._copyToClipboard)
				} else {
					log("0 results returned with the Ask the Expert mouseover request.")
				}
			});
	}
	
 	jQuery.fn._collapseExpertDataEvent = function(e) {
		jQuery(".askTheExpert_overlay").find(".title").unbind();
		jQuery(".askTheExpert_overlay").find("img").unbind();
		jQuery(".askTheExpert_overlay").unbind().remove();
	}
	
	jQuery.fn.askTheExpert = function(options){
		var myoptions = jQuery.extend({}, jQuery.fn.askTheExpert.defaults, options);
		var $input = jQuery(this);
		log("Triggering askTheExpert on " + $input.attr("id") + 
		", class " + $input.attr("class"));
		
		if (myoptions.version == 1) { /* used in the case folder. */
			log("version = 1");
			
			String.prototype.trim = function() { return this.replace(/^\s+|\s+$/, ''); };
			
			var email = $input.find("a:first").text().trim();
			var name = $input.find(".name:first").text().trim();
			
			log("current info: { prefixText: " + myoptions.prefixText + ", name : " + name + ", email : " + email + "}")
			if (myoptions.prefixText.length > 1 && !!name && name.indexOf(myoptions.prefixText) != -1) {
				if (!!name && name.indexOf(myoptions.prefixText) != -1) {
					name = name.split(myoptions.prefixText)[1];
				}
			}

			log("Collected info: { prefixText: " + myoptions.prefixText + ", name : " + name + ", email : " + email + "}")
			if (!email && !name) {return $input;}
			log("beat the check");

			var newObj = jQuery("<span />").text(myoptions.prefixText);

			if (email != "") { 
				newObj.append(jQuery("<a />").text(email).attr("rel", email).attr("imageserver", myoptions.imageserver)); //.attr("href", "mailto:" + email);
			} else { /*if name != "" */
				newObj.append(jQuery("<a/>").text(name).attr("rel", name).attr("imageserver", myoptions.imageserver)); //.attr("href", "mailto:" + email);
			}

			var newObjA = newObj.children("a");
			log("binding to " + newObjA.length + " children")
			$input.html(newObj);
			newObjA.bind("click", jQuery.fn._openExpertDataEvent);
			newObjA.bind("mouseover", myoptions, jQuery.fn._expandExpertDataEvent);
			
			newObj.wrap("<div class='askTheExpert_anchor' style='position:relative;' />")
		
		} else {
			/* Assumes a tag with mailto:email@address.com. This allows for */
			log("No identified version.");
			var email = $input.attr("href");
			var pos = email.indexOf("mailto:");
			var emailAddressStartPos = pos + ("mailto:".length);
			var emailAddress = email.substr(emailAddressStartPos, email.length);
			var name = $input.attr("title"); /* if the name is defined */
		
		}

		return $input;
	};

	/**
		Default values.
	*/
	jQuery.fn.askTheExpert.defaults = {
		prefixText : 'Ask the Expert:',
		version : 1, /* 1 is for case folder, 2 is for shorter A tag lookups. */
		imageserver : 'http://domeetingserver.ess.ess/imageserver/RemoteGadgets/icons/'  /* Where imageserver icons/images are stored. */
	}
})(jQuery);
