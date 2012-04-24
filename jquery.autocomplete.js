/**
 * @author Thomas Olson
 * Autocomplete parameter listing (all attributes should have the "autocomplete:" prefix):
 
 * @param autofill			Automatically populates the input box with the topmost suggested value.
 * @param type				Type of interaction autocomplete has with Services. ("$$url$$/Services/db/$$type$$/get")
 * @param display			Expression of the autocomplete suggestion list. Is an array, so [value1, value2] can display as "value1 (value2)" 
 * @param return			return type when autocomplete finished.
 * @param url				URL root ... gateway for plumtree ("$$url$$/Services/db/$$type$$/get")
 
 * @param mode				Forces autocomplete form. [default, dropdown, autocomplete]
 * @param limit				limits number of autocomplete values returned.
 * @param startText			Default text for autocomplete. Should not be a potential autocomplete value.
 * @param suggestonfocus	On an initial box click show a set of suggested values.
 * @param sortby 			Sort order based on web service.
 *
 */
(function(jQuery){

	var _prefix = "autocomplete_";
	var events = {
		_updateSelected : _prefix + "updateSelected",
		attachedAutocompletes : _prefix + "attachedAutocompletes",
		selectedAutocomplete : _prefix + "attachedAutocompletes"
	}

	jQuery.fn.getAutocompleteEvent = function (eventName) {
		return events[eventName];
	}
	
	var log = function (s) {
		try {
			if (console && console.log) {
				// console.log(s)
			}
		} catch (e) {
		}
	}
 
	/* variables */
	var UP=38; var DOWN=40; var TAB=9; var ENTER=13; ; var SHIFT=16; var ESC=27;/* keys */
	var ZINDEX =100; /* z-index */
	var cachedTypes = {};
	
	var autocomplete_ajax_table = new Array();
	
	/** Strips the HTML from a string. */
	String.prototype.stripHtml = function() {  
		var regexp = /<("[^"]*"|'[^']*'|[^'">])*>/gi;  
		return this.replace(regexp,"");  
	}

	jQuery.fn._act_flushAjaxTable = function() {
				if (typeof(autocomplete_ajax_table) === 'undefined' ) {
			autocomplete_ajax_table = new Array();
		}

		while (autocomplete_ajax_table.length != 0) { /* this kills previous instances. */
			log("killing...");
			try {
				autocomplete_ajax_table.pop().abort();
			} catch (err) {
				log('Kills previous calles');
			}
		}
	}
	
	/**
	Prompts the suggestion block for the input box.
	*/
	jQuery.fn._act_suggest = function (e) {
		/* vars */
		var input = jQuery(e.target)
		var wrapper = input.parent();
		var suggestionBox = wrapper.find("div.suggestions:eq(0)");
		var key = e.keyCode;

		/* remove default start text if in the cell. */
		if (e.data.startText == input.val()) { input.val(""); }
		/* focus on input box */
		if (e.type == "focus") { e.target.select(); }
		if (input.val().length != 0) {
			suggestionBox.show();
			jQuery.fn._act_updateSuggestionSurroundingsVisibility(suggestionBox, "hidden");
		} else if (e.data.suggestonfocus) {
			suggestionBox.show();
		} else {
			suggestionBox.hide();
			log(input.val() + ", suggestonfocus is true");
		}
		
		if (e.type == "keyup") {
			if (key == ESC) {
				input.attr('autocomplete:id', -1);
				var suggestionBox = wrapper.find(".suggestions");
				suggestionBox.find("div.selected").removeClass("selected");
				jQuery.fn._act_hide(e);
			} else if (key == UP || key == DOWN) { /* if moving up or down, navigate through the autocomplete box. */
				var len = suggestionBox.find("div.row").length;
				var index = -1;
				if (null != input.attr("autocomplete:index")) {
					index = parseInt(input.attr("autocomplete:index"));
				}
				suggestionBox.find("div.selected").removeClass("selected");
				if (index == undefined || index == null || index == NaN || len < index) {
					index = 0;
				} else {
					if (key == DOWN) {index = (index+1) %len }
					else if (key == UP) {index = (index-1) %len }
					if (index < 0) { index += len }
				}
				input.attr("autocomplete:index", index);
				
			} else if (key == ENTER) {
				if (input.val() != "") {
					jQuery.fn._act_hide(e);
				}
			} else if (key != SHIFT) {
				input.attr('autocomplete:id', -1);
				input.attr("autocomplete:index", -1);
				jQuery.fn._act_flushAjaxTable();
				autocomplete_ajax_table.push(jQuery.ajax({
					type: 'GET',
					dataType: 'json',
					url : e.data.url + '/Services/db/' + e.data.type + "/get?s=" + input.val()
						+ "&sort=" + e.data.sortby
						+ ((e.data.inc != undefined) ? "&inc=" + e.data.inc :"") /* This bit is for supporting legacy country codes, etc. */
						+ ((e.data.limit != undefined) ? "&l=" + e.data.limit :""),
					success: function (json) {
						suggestionBox.html("");
						if (json.rows != undefined && !(!e.data.suggestonfocus && input.val().length == 0)) {
							for (r = 0; r < json.rows.length; r++) {
								row = json.rows[r];
								suggestionRow = jQuery("<div />").addClass("row").css("zIndex", "100");
								for (d = 0; d < e.data.display.length; d++) {
									var term = jQuery("<a href='#' onclick='return false;' />").addClass(e.data.display[d]).html(row[e.data.display[d]]);
									term = term.wrap("<a href='#' onclick='return false;' />");
									if (d == 1) { term = term.prepend(" (").append(")"); }
									suggestionRow.append(term);
									suggestionRow.attr('autocomplete:'+e.data.display[d], row[e.data.display[d]]);
								}
								if (row['id'] != undefined) {
									suggestionRow.attr('autocomplete:id', row['id']);
								} else if (e.data.id != undefined && e.data.id.length > 0 && row[e.data.id] != undefined) {
									suggestionRow.attr('autocomplete:id', row[e.data.id]); /* custom id values.  */
								}
								suggestionBox.append(suggestionRow);
								
								suggestionRow.bind(events._updateSelected, function (e) {
									var n = jQuery(e.target);
									if (!n.hasClass("row")) { n = n.parent(); }
									
									n.parent().find(".selected").each( function () {
										jQuery(this).removeClass("selected")
									});
									if (e.clear != true) { n.addClass("selected"); }
								});
								
								/* event binding. */
								suggestionRow.bind("mouseenter", function (e) { jQuery(e.target).trigger(events._updateSelected) });
								suggestionRow.find("span").each(function () {
									jQuery(this).bind("mouseenter", function (e) { jQuery(e.target).trigger(events._updateSelected) });
									jQuery(this).bind("mouseleave", function (e) { jQuery(e.target).trigger(events._updateSelected), {clear:true} });
								});
								suggestionRow.find("a").each(function () {
									jQuery(this).bind("mouseenter", function (e) { jQuery(e.target).trigger(events._updateSelected) });
									jQuery(this).bind("mouseleave", function (e) { jQuery(e.target).trigger(events._updateSelected), {clear:true} });
								});
							}
							jQuery.fn._act_updateSuggestionSurroundingsVisibility(suggestionBox, "hidden")
						}
						if (autocomplete_ajax_table.length != 0) {
							autocomplete_ajax_table.pop();
						}
					},
					error: function (json) {
						/* if the autocomplete is invalid, any former id match should be removed. */
						suggestionRow.attr('autocomplete:id', -1);
					}
				}));
			}
		}
		/* set the top suggestion as the selected one */
		if (len > 0 && index != undefined && index != null) {
			suggestionBox.find("div.row:eq("+(index%len)+")").addClass("selected");
		}
	}

jQuery.fn._act_updateSuggestionSurroundingsVisibility = function (suggestionBox, forceState) {
	log("Apply fn__updateSuggestionSurroundingsVisibility: " + suggestionBox.css("visibility"));
	if (suggestionBox != null && suggestionBox != undefined && suggestionBox.css("visibility") != "hidden") {
		var top = suggestionBox.offset().top;
		var left = suggestionBox.offset().left;
		var bottom = suggestionBox.offset().top + suggestionBox.innerHeight();
		var right = suggestionBox.offset().left + suggestionBox.innerWidth();
	} else {
		suggestionBox = null;
	}
	jQuery(".ecf-portlet").find("input").each(function () {
		var elt = jQuery(this);
		log("suggestionBox: "+ top + ", " + bottom);
		log("elt: "+ elt.offset().top);
		if (suggestionBox == null || forceState == "visible" || suggestionBox.prev("input").attr("id") == elt.attr("id")) { /* make everything visible. */
			log("ignored " + elt.attr("id"));
			elt.css("visibility", "");
		} else if (bottom >= elt.offset().top && top <= elt.offset().top) {
			log("hid " + elt.attr("id"));
			elt.css("visibility", forceState);
		}
	});
	jQuery(".ecf-portlet").find("a.remove").each(function () {
		var elt = jQuery(this);
		log("suggestionBox: "+ top + ", " + bottom);
		log("elt: "+ elt.offset().top);
		if (suggestionBox == null || forceState == "visible" || suggestionBox.prev("input").attr("id") == elt.attr("id")) { /* make everything visible. */
			log("ignored " + elt.attr("id"));
			elt.css("visibility", "");
		} else if (bottom >= elt.offset().top && top <= elt.offset().top) {
			log("hid " + elt.attr("id"));
			elt.css("visibility", forceState);
		}
	});
	jQuery(".ecf-portlet").find(".filter").each(function () {
		var elt = jQuery(this);
		log("suggestionBox: "+ top + ", " + bottom);
		log("elt: "+ elt.offset().top);
		if (suggestionBox == null || forceState == "visible" || suggestionBox.prev("input").attr("id") == elt.attr("id")) { /* make everything visible. */
			log("ignored " + elt.attr("id"));
			elt.css("visibility", "");
		} else if (bottom >= elt.offset().top && top <= elt.offset().top) {
			log("hid " + elt.attr("id"));
			elt.css("visibility", forceState);
		}
	});
	log("Leave fn__updateSuggestionSurroundingsVisibility")
}

jQuery.fn._act_hide_delay = function (e) {
	try {
		var runner = jQuery.ajax({
			type: 'GET',
			dataType: 'json',
			url : e.data.url + '/Services/db/' + e.data.type + "/get?s="
				+ "&sort=" + e.data.sortby
				+ ((e.data.inc != undefined) ? "&inc=" + e.data.inc :"") /* This bit is for supporting legacy country codes, etc. */
				+ ((e.data.limit != undefined) ? "&l=" + e.data.limit :""),
			success: function (json) {
				if (autocomplete_ajax_table.length == 0) {
					jQuery.fn._act_hide(e);
				} else {
					jQuery.fn._act_flushAjaxTable();
					jQuery.fn._act_hide_delay(e);
				}
			},
			error: function (json) {
				jQuery.fn._act_hide(e);
			}
		});
	} catch (err) {
		log(err.message);
	}
}
/**
	Hides the suggestion box, entering the selected suggestion value into the input, if applicable.
*/
jQuery.fn._act_hide = function (e) {
	log("Apply fn_act_hide.");
	var input = jQuery(e.target)
	var wrapper = input.parent();
	var suggestionBox = wrapper.find(".suggestions");
	
	var selectedDiv = suggestionBox.find("div.selected");
	if (selectedDiv.length > 0) {
		if (selectedDiv.attr('autocomplete:id') != undefined) {
			log("Apply autocomplete:id onto input box.");
			input.attr('autocomplete:id', selectedDiv.attr('autocomplete:id'));
		}
		
		for (d = 0; d < e.data.display.length; d++) {
			input.attr("autocomplete:value:" + e.data.display[d], selectedDiv.attr("autocomplete:" + e.data.display[d]).stripHtml())
		}

		input.val(selectedDiv.attr("autocomplete:" + e.data.returnFormat[0]).stripHtml());
	} else if (e.data.autofill) {
		try {
			var input = jQuery(e.target)
			var wrapper = input.parent();
			var suggestionBox = wrapper.find(".suggestions");
			log("fn._hide::autofill");
			if (suggestionBox.find("div.row:eq(0)").attr('autocomplete:id') != undefined) {
				log("Apply autocomplete:id onto input box. (as autofill)");
				input.attr('autocomplete:id', suggestionBox.find("div.row:eq(0)").attr('autocomplete:id'));
			}
			
			for (d = 0; d < e.data.display.length; d++) {
				input.attr("autocomplete:value:" + e.data.display[d], suggestionBox.find("div.row:eq(0)").attr("autocomplete:" + e.data.display[d]).stripHtml())
			}
			input.val(suggestionBox.find("div.row:eq(0)").attr("autocomplete:" + e.data.returnFormat[0]).stripHtml());
		} catch (err) {
			/* This error means there were no suggestions. */
			if (e.data.startText != undefined) {
				input.val(e.data.startText);
			} else {
				input.val(""); /* This resets the input box. */
			}
		}
	} else {
		log("fn._hide::no_selected_or_autofill: ");
		input.attr('autocomplete:id', -1);
	}
	suggestionBox.hide();
	jQuery.fn._act_updateSuggestionSurroundingsVisibility(suggestionBox, "visible")
	log("autocomplete_autocompleteSelectionMade triggering")
	input.trigger(events.selectedAutocomplete);
	log("autocomplete_autocompleteSelectionMade triggered")
}

jQuery.fn._act_cancelenter = function(e) {
	if (e.keyCode == ENTER) {
		if (jQuery(e.target).next().is(":visible")) {
			e.preventDefault();
		}
	} else if (e.keyCode == TAB) {
		log("TAB trigger!")
		jQuery.fn._act_suggest(e);
	}
}

/**
	Construct the autocomplete wrapper.
*/
jQuery.fn.service_autocomplete = function(options){
	var myoptions = jQuery.extend({}, jQuery.fn.service_autocomplete.defaults, options);
	var input = jQuery(this);
	
	/* START All Standalone calls result in the dropdown now. Comment out this section to re-enable. *
	if (typeof PTIncluder === "undefined" || PTIncluder == null) {
		myoptions.mode = "dropdown";
	}
	* CLOSE All Standalone calls result in the dropdown now. Comment out this section to re-enable. */
	
																			/* IE6 switch to handle burn through with autocomplete. */
	if (myoptions.mode == "autocomplete" || (myoptions.mode != "dropdown" && !(jQuery.browser.msie && jQuery.browser.version <= 6))) {
		/* This creates a standard autocomplete. */
		var wrapper = input.wrap("<span></span>").parent().addClass("wrapper");
		wrapper.css({"position": "relative" });
		suggestionBox = jQuery("<div />")
							.css({
									"position": "absolute",
									"left": "0",
									"background-color": "white",
									"z-index": ZINDEX, /* this moves suggestions over other elements */
									"top": ((input.outerHeight() != 0) ? input.outerHeight() : "1.5em"),
									"white-space": "nowrap" /* this allows width to extend */
								})
							.addClass("suggestions")
							.hide()
							.html("<a class='dummy' href='#'>.</a>");
		wrapper.append(suggestionBox);
		input.removeClass("autocomplete");
		var acType = myoptions.type;
		if (input.val() == "") {
			input.val(myoptions.startText);
		}
		input
			.on("keyup focus", myoptions, jQuery.fn._act_suggest)
			.on("keydown", myoptions, jQuery.fn._act_cancelenter)
			.on("blur", myoptions, jQuery.fn._act_hide_delay)
			.on("dblclick", myoptions, function (e) {
					input.val("");
					jQuery.fn._act_suggest(e); 
				}) /* doubleclick to clear. */
		
	} else {
	
		/* The standard dropdown action doesn't always fire properly.
		 changing the async is meant to force the change along. */
		var doAsync = false;
		/*
		jQuery("input.autocomplete:visible").each(
			function () {
				var elt = jQuery(this);
				if (elt.attr("id") == input.attr("id")) {
					doAsync = false;
				}
			}
		);
		*/
		/* This creates a standard dropdown instead of an autocomplete.
		 This is a result of autocomplete having IE6 trouble. */
		input.removeClass("autocomplete");
		input.attr("value","loading...");
		input.prop("disabled", true);

		var dropdownAlt = jQuery("<select />");
		dropdownAlt[0].className = input[0].className;
		if (myoptions.id != undefined && myoptions.id.length > 0) {
			dropdownAlt[0][myoptions.id] = input[0][myoptions.id]; /* for non-standard IDs. */
		} else {
			dropdownAlt[0].id = input[0].id;
		}
		dropdownAlt[0].name = input[0].name;

		if (cachedTypes[myoptions.type] === undefined) {
			jQuery.fn._act_flushAjaxTable();
			autocomplete_ajax_table.push(jQuery.ajax({
				type: 'GET',
				async: doAsync,
				dataType: 'json',
				url : options.url + '/Services/db/' + options.type + "/get?s=&sort="+myoptions.sortby+"&l=999999", /* limit high to get all values */
				success: function (json) {
					dropdownAlt.append(jQuery("<option/>").text("Select...").val(""));
					for (r = 0; r < json.rows.length; r++) {
						var row = json.rows[r];
						option = jQuery("<option />");
						
						option.text(row[myoptions.display[0]]);
						if (myoptions.display.length > 1) {
						option.text(option.text() + " (" + row[myoptions.display[1]] + ")");
						}
						option.attr("value", row[myoptions.returnFormat[0]]);
						dropdownAlt.append(option);
					}
					input.replaceWith(dropdownAlt);
					if (autocomplete_ajax_table.length != 0) {
						autocomplete_ajax_table.pop();
					}
					cachedTypes[myoptions.type] = dropdownAlt;
				}
			}));
		} else {
			var list = cachedTypes[myoptions.type].children();
			for (c = 0; c < list.length; c++) {
				dropdownAlt.append(jQuery(list.eq(c).clone()))
			}
			input.replaceWith(dropdownAlt);
		}
	}
	return input;
};

/**
	Default values.
*/
jQuery.fn.service_autocomplete.defaults  = {
	id : '',					/* id, if blank or undefined, goes on the 'id' default. If there is a non-empty value, use that ID. (added in for countries)*/
	type : "countries",			/* autocomplete type */
	inc : undefined,			/* autocomplete inc */
	display: ['name','abbr'],	/* display of suggestions */
	returnFormat: ['abbr'],		/* format of results getting returned */
	url : "",					/* number of items to show initially */
	limit : 5,					/* number of items to show of retults */
	startText : 'Select...',	/* text for the mouseover that reveals the additional links (if available) */
	autofill : true,			/* autofill on tab out */
	mode : 'default',			/* modes.
									default:		chooses between autocomplete and dropdown, depending on browser.
									autocomplete:	always as autocomplete.
									dropdown:		always as dropdown.
								*/
	suggestonfocus : false,		/* allow the suggest on focus */
	sortby : ['name'],			/* sortby function */
	success : function () { }	/* @unused
									success function overload. not used at this time, may be later though.
								*/
}
})(jQuery);

/**
	Attach autocompletes to all inputs with an "autocomplete" class.
*/
jQuery.attachAutocompletes = function() {
//	log("starting to attach autocompletes");
	var c = 0;
	jQuery("input.autocomplete").each( function () {
		c++;
		
		/* get parameters */
		var dID = jQuery(this).attr("autocomplete:id");
		var dType = jQuery(this).attr("autocomplete:type");
		var dInc = jQuery(this).attr("autocomplete:inc");
		var dDisplay = (jQuery(this).attr("autocomplete:display") != undefined) ? jQuery(this).attr("autocomplete:display").split(",") : undefined;
		var dReturn = (jQuery(this).attr("autocomplete:return") != undefined) ? jQuery(this).attr("autocomplete:return").split(",") : undefined;
		var dURL = jQuery(this).attr("autocomplete:url");
		if (dURL != undefined) {
			while (dURL.charAt(dURL.length-1) == "/") {
				dURL = dURL.substring(0, dURL.length-1);
			}
		}
		var dMode = jQuery(this).attr("autocomplete:mode");
		var dLimit = jQuery(this).attr("autocomplete:limit");
		var autoFill = undefined;
		var dAutofill = undefined;
		try {
			autoFill = jQuery(this).attr("autocomplete:autofill");
			dAutofill = (autoFill != undefined) ? "true" == autoFill.toLowerCase() : undefined;
			if (dMode == "dropdown") { /* autofill is irrelevant for dropdowns */
				dAutofill = false;
			}
		} catch (err) {
			autoFill = undefined;
			dAutofill = undefined;		
		}
		var dStartText = jQuery(this).attr("autocomplete:startText");

		var dSortBy = (jQuery(this).attr("autocomplete:sortby") != undefined) ? jQuery(this).attr("autocomplete:sortby").split(",") : undefined;
		var dSuggestOnFocus = (jQuery(this).attr("autocomplete:suggestonfocus") != undefined) ? ("true" == jQuery(this).attr("autocomplete:suggestonfocus").toLowerCase()) : undefined;
		if (dType == "country") { dType = "countries"; }

		/* send parameters */
		jQuery(this).service_autocomplete({
			id: (dID != undefined) ? dID : jQuery.fn.service_autocomplete.defaults.id,
			type: (dType != undefined) ? dType : jQuery.fn.service_autocomplete.defaults.type,
			inc: (dInc != undefined) ? dInc : jQuery.fn.service_autocomplete.defaults.inc,
			display : (dDisplay != undefined) ? dDisplay : jQuery.fn.service_autocomplete.defaults.display,
			returnFormat : (dReturn != undefined) ? dReturn : jQuery.fn.service_autocomplete.defaults.returnFormat,
			url: (dURL != undefined) ? dURL : jQuery.fn.service_autocomplete.defaults.url,
			limit: (dLimit != undefined) ? dLimit : jQuery.fn.service_autocomplete.defaults.limit,
			
			mode: (dMode != undefined) ? dMode : jQuery.fn.service_autocomplete.defaults.mode,
			suggestonfocus: (dSuggestOnFocus != undefined) ? dSuggestOnFocus : jQuery.fn.service_autocomplete.defaults.suggestonfocus,
			autofill: (dAutofill != undefined) ? dAutofill : jQuery.fn.service_autocomplete.defaults.autofill,
			sortby: (dSortBy != undefined) ? dSortBy : jQuery.fn.service_autocomplete.defaults.sortby,
			startText: (dStartText != undefined) ? dStartText : jQuery.fn.service_autocomplete.defaults.startText
		});
	});
//	log("finished attaching autocompletes ("+c+")");
}

/**
	ONLOAD event to attach autocompletes to all inputs with an "autocomplete" class.
*/
jQuery(document).ready(function() {
		jQuery.attachAutocompletes();
		jQuery(document).trigger(jQuery().getAutocompleteEvent('attachedAutocompletes'));
});

