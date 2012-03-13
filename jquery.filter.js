(          
function (jQuery) {
	/**
		Events associated with the Filter jQuery object.
	*/
	var dateInMillis = function () {
		var d = new Date()
		return (Date.UTC(d.getFullYear(), d.getMonth(), d.getDay(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()));
	}

	function log(s) {
		try {
			if (typeof(s) == 'object' && (console && console.debug)) {
				console.debug(s);
			} else if (console && console.log) {
				console.log(s);
			}
		} catch (e) {
		}
	}
	
	var eventlist = {
		/**
			Event following choosing the operator. When the operator is selected a set of input boxes should show up for entering values.
		*/
		chooseOperator: function (e) {
			var json = e.data;
			var target = jQuery(e.target);

			var operand = jQuery(e.target).prev(".operand")
			var operandIndex = operand.prop("selectedIndex") - 1;
			var operator = jQuery(e.target);
			var operatorIndex = operator.prop("selectedIndex") - 1;
			var values = target.parent().find(".values:first");

			/* retains values on operand change */
			var oldValues = new Array();
			if (json.keepOnChange) {
				jQuery(target.parent().find(".values input.value[operator-type=string]")).each(function (i) {
					oldValues.push($(this).val())
				});
			}
			/* /retains values on operand change */
			
			values.html("");
			if ((isNaN(operandIndex) || operandIndex < 0) || (isNaN(operatorIndex) || operatorIndex < 0)) {
				values.hide()
			} else {
				values.show()
				/* set the number of parameters. */
				var numValues = json.operands[operandIndex].operators[operatorIndex].params;
				if (numValues == undefined) numValues = 1;

				var valueType = jQuery(operator.find("option")[operatorIndex+1]).attr("operator-type");
				if (valueType == undefined) valueType = "string";
				
				/* LOOP for number of parameters */
				for (k = 0; k < numValues; k++) {
					/* SELECT dropdown */
					if (valueType == "select") {
						var valueDropdown = jQuery("<select class='value'></select>");
						if (json.text.selectdef != null)
							valueDropdown.append("<option>"+json.text.selectdef+"</option>");
						else 
							valueDropdown.append("<option>"+jQuery.fn.attachFilterPanel.defaults.text.selectdef+"</option>");
						var valueSet = json.operands[operandIndex].operators[operatorIndex].values;
						for (j = 0; j < valueSet.length; j++) {
							var valueDropdownOption;
							if (valueSet[j].name == "undefined") {
								valueDropdownOption = jQuery("<option>"+valueSet[j]+"</option>");
								valueDropdownOption.attr("value", valueSet[j]);
							} else {
								valueDropdownOption = jQuery("<option>"+ ((valueSet[j].display != "undefined") ? valueSet[j].display : valueSet[j].name) +"</option>");
								valueDropdownOption.attr("value", valueSet[j].name );
								if (valueSet[j].isDefault == true) {
									valueDropdownOption.attr("selected", "selected");
									valueDropdownOption.attr("onselected", "selected");
								}
							}
							valueDropdown.append(valueDropdownOption);
						}
						if (valueDropdown.find("option[selected=selected]").length > 0 || valueDropdown.find("option[onselected=selected]").length > 0) {
							valueDropdown.find("option:first").css("display","none");
						}
						values.append(valueDropdown);

					} else if (valueType == "autocomplete") {
						var input = jQuery("<input class='value' type='text' />");
						input.attr("operator-type", valueType);
						input.addClass(valueType).addClass("formSelectText");
						input.attr("autocomplete:type", json.operands[operandIndex].operators[operatorIndex].ac_type);
						
						if (undefined != json.operands[operandIndex].operators[operatorIndex].ac_return) {
							input.attr("autocomplete:return", json.operands[operandIndex].operators[operatorIndex].ac_return);
						}
						if (undefined != json.operands[operandIndex].operators[operatorIndex].mode) {
							input.attr("autocomplete:mode", json.operands[operandIndex].operators[operatorIndex].mode);
						}
						if (undefined != json.operands[operandIndex].operators[operatorIndex].ac_inc) {
							input.attr("autocomplete:inc", json.operands[operandIndex].operators[operatorIndex].ac_inc);
						}
						if (undefined != json.operands[operandIndex].operators[operatorIndex].ac_display) {
							input.attr("autocomplete:display", json.operands[operandIndex].operators[operatorIndex].ac_display);
						}
						if (undefined != json.operands[operandIndex].operators[operatorIndex].ac_startText) {
							input.attr("autocomplete:startText", json.operands[operandIndex].operators[operatorIndex].ac_startText);
						}
						
						input.attr("autocomplete:autofill", false);
						if (undefined != json.operands[operandIndex].operators[operatorIndex].ac_autofill) {
							input.attr("autocomplete:autofill", json.operands[operandIndex].operators[operatorIndex].ac_autofill);
						}
						input.attr("autocomplete:url", $("#translatorUrl").attr("href") + "/../../");
						
						/* For the moment this only ever assumes the autocomplete in the filter is for a country lookup. */
						var ac_startText = json.operands[operandIndex].operators[operatorIndex].ac_startText;
						input.attr("autocomplete:startText", (ac_startText != undefined) ? ac_startText : "Enter a Country..." );

						var t = "input_"+json.initial.id+"_"+operandIndex+"_"+operatorIndex+dateInMillis();
						input.attr("id", t);

						values.append(input);

						try {
						/*
						jQuery("input.autocomplete").each( function () {
								var dType = jQuery(this).attr("autocomplete:type");
*								var dReturn = jQuery(this).attr("autocomplete:return"); *
								var dStartText = jQuery(this).attr("autocomplete:startText");
								if (dType == "country") { dType = "countries"; }
								jQuery(this).autocomplete({
									type: dType,
*									returnFormat: dReturn, *
									startText: dStartText,
									url: jQuery(".portalgateway:first").text() + "/../../",
									autofill:true
								});
							})
							*/
//							jQuery.attachAutocompletes();
						} catch (e) {
							log(e);
						}
					/* INPUT BOX selection */
					} else {
						var input = jQuery("<input class='value' type='text' />");
						input.attr("operator-type", valueType);
						input.addClass(valueType);
						
						input.attr("id", "item_"+json.initial.id+"_"+operandIndex+"_"+operatorIndex+dateInMillis());
						values.append(input);
						if (valueType == "popup") {

							var popup = null;
							if (json.showAs == "text") {
								popup = jQuery("<a class='popup' href='#'>"+json.text.popupdef+"</a>").removeClass("button");
							} else {
								popup = jQuery("<div class='popup button'></div>").attr("alt",json.text.popupdef).attr("title",json.text.popupdef);
							}
							popup.bind( "click", { 'id':input.attr("id") }, json.operands[operandIndex].operators[operatorIndex].popup);
							values.append(popup);
						}
					}
				}
				
				values.find(".button").bind("mouseenter mouseleave", function(e){
					jQuery(this).toggleClass("over");
				});
				
				/* Adds enter event triggers. */
				values.find("input").each (function (i) {
					$(this).keypress( function (e) {
							if (e.which == 13) {
								log("Filter enter event trigger.")
								jQuery(e.target).parent().parent().parent().next().find(".get").trigger("click");
							}
					});
				});

				/* retains values on operand change */
				if (json.keepOnChange) {
					jQuery(target.parent().find(".values input.value[operator-type=string]")).each(function (i) {
						if (i < oldValues.length) {
							$(this).val(oldValues[i])
						}
					});
				}
				/* /retains values on operand change */
			}
		},
		
		/**
			Event following choosing the operand. When the operand is selected a operator dropdown shows up.
		*/
		chooseOperand: function (e) {
			var json = e.data;
			var target = jQuery(e.target);
			var operand = jQuery(e.target);
			var operandIndex = operand.prop("selectedIndex") - 1;
			var operator = target.next(".operator");
			var values = target.parent().find(".values:first");

			/* retains values on operand change */
			var oldValues = new Array();
			if (json.keepOnChange) {
				jQuery(target.parent().find(".values input.value[operator-type=string]")).each(function (i) {
					oldValues.push($(this).val())
				});
			}
			/* /retains values on operand change */
			
			operator.html("");
			operator.unbind("change", eventlist.chooseOperator );
			if (isNaN(operandIndex) || operandIndex < 0) {
				operator.hide();
				values.hide()
			} else {
				operator.show();
				values.hide()
				if (json.text.selectdef != null)
					operator.append("<option>"+json.text.selectdef+"</option>");
				else 
					operator.append("<option>"+jQuery.fn.attachFilterPanel.defaults.text.selectdef+"</option>");
				for (k = 0; k < json.operands[operandIndex].operators.length; k++) {
					try {
						var obj = json.operands[operandIndex].operators[k];
						if (obj != null) {
							var disp = obj.display;
							var name = obj.name;
							optionTag = jQuery("<option>"+((disp != undefined)? disp : name)+"</option>");
							optionTag.attr("value", json.operands[operandIndex].operators[k].name);
							optionTag.attr("selected", json.operands[operandIndex].operators[k].isDefault);

							if (json.operands[operandIndex].operators[k].type != undefined && json.operands[operandIndex].operators[k].type != null) {
								optionTag.attr("operator-type", json.operands[operandIndex].operators[k].type);
								/* alert("optionTag.operator-type is the type of field that is expected: " + optionTag.attr("operator-type")); */

							}
							operator.append(optionTag);
						}
					} catch (ef) {
						alert(ef.message)
					}
				}
			}
			operator.bind("change", json, eventlist.chooseOperator )
			if (operator.find("option[selected=true]").length > 0) { /* if there is a selected item */
				operator.find("option:first").css("display", "none");
				operator.trigger("change")
			};
			
			/* retains values on operand change */
			if (json.keepOnChange) {
				jQuery(target.parent().find(".values input.value[operator-type=string]")).each(function (i) {
					if (i < oldValues.length) {
						$(this).val(oldValues[i])
					}
				});
			}
			/* /retains values on operand change */

			/* when no operator options actually exist */
			/* alert("operator selectbox has " + operator.children().length + " options") */
			if (operator.children().length == 2) {
				log("chooseOperand::Operator only has two children.");
				if (operator.prop("selectedIndex") == 0) {
					operator.prop("selectedIndex", 1);
				} else {
					log("chooseOperand::selectedIndex is not 0 (" + operator.prop("selectedIndex") + ")");
				}
				operator.trigger("change");
				log("chooseOperand::Triggered change event for selectedIndex " + operator.prop("selectedIndex"));
				/* alert("operator=" + operator.find("option").length + ", values=" + values.length); */
				operator.hide();
			} else {
				if (operator.prop("selectedIndex") == 0) {
					operator.prop("selectedIndex", 1);
				} else {
					log("chooseOperand::selectedIndex is not 0 (" + operator.prop("selectedIndex") + ")");
				}
				operator.trigger("change");
			}
			log("chooseOperand::completed selectedIndex section.");			
			/* when no operator options actually exist */

			if (operator.is(":focus") || operator.prev(".operand").is(":focus")) {
				/* This triggers when you are changing the autocompletes by hand. (not with loadJSON) */
				jQuery.attachAutocompletes();
			}

			values.show();
			log("chooseOperand::finished.");						
		},

		/**
			Event to remove a single filter.
		*/
		removeFilter: function (e) {
			log("Entering removeFilter");
			if (e != undefined) { /* TODO undefstand why this can be undefined. */
				var target = jQuery(e.target);
				target.unbind("click", eventlist.removeFilter);
				target.parent().remove();
			}
			log("Exiting removeFilter");
			return false;
		},
		
		/**
			Event to remove a single filter.
		*/
		removeAllFilters: function (e) {
			log("Entering removeAllFilters");
			jQuery(e.target).parent().parent().find(".filter .remove[display!=none]").each(
				function (i) {
					jQuery(this).trigger("click");
				}
			);
			log("Exiting removeAllFilters");
		},
		addFilter: function (e) {
			log("Entering addFilter");
			var panel = jQuery(e.target).parent().parent();
			log("jQuery.fn.attachFilterPanel.addFilter = " + e.data.operands.length);
			retMe = panel.addFilter(e.data).bind("mouseenter mouseleave", function (e) { jQuery(e.target).toggleClass("filter-highlight") } );
			log("Exiting addFilter");
			return retMe;
		},

		getFilterAsJSON : function (e) {
			log("Entering getFilterAsJSON");
			var panel = jQuery(e.target).parent().parent();
			var filters = panel.find(".filter");
			var s = "{filter:[";
			var numFilters = filters.length - 1;
			filters.each(
				function (i) {
					s += "{";

					var operand = undefined;
					if (jQuery(this).find(".operand:first option:selected").length) {
						operand = jQuery(this).find(".operand:first option:selected").attr("value");
					} else {
						operand = jQuery(this).find(".operand:first").text();
					}
					s += "operand: '" + escape(operand) + "', ";

					var operator = undefined;
					if (jQuery(this).find(".operator:first option:selected").length) {
						operator = jQuery(this).find(".operator:first option:selected").attr("value");
					} else {
						operator = jQuery(this).find(".operator:first").text();
					}
					s += "operator: '" + escape(operator) + "', ";

					s += "values: ["
					var valueSet = jQuery(this).find(".values .value");
					valueSet.each(
						function (ii) {
							s += "'";
							s += escape(jQuery(this).attr("value"));
							s += "'";
							if (valueSet.length - 1 != ii) {
								s += ",";
							}
						}
					)
					s += "]"
					s += "}";
					if (numFilters != i) {
						s += ",";
					}
				}
			);
			s += "]}";
			//alert(s);
			log("Exiting getFilterAsJSON");
			return eval(s);
		}

	};

	/* PLUGIN */
	/*
	filter:[{operand: 'shipName', operator: 'equals', values: ['']},{operand: 'operand', operator: 'operator', values: ['']}]}
	*/
	jQuery.fn.loadJSON = function (options) {
		var myoptions = jQuery.extend({},jQuery.fn.loadJSON.defaults, options);
		log('Number of filters to process: ' + myoptions.filter.length);
		/* alert(jQuery(this).attr("nodeName") + " " + jQuery(this).attr("className")) */ /* check on node's name and class. */
		var addLink = jQuery(this).find("div.add");
		if (myoptions.filter.length && myoptions.filter.length > 0) {
			for (filter in myoptions.filter) {
				var operand = (myoptions.filter[filter].operand)
				var operator = (myoptions.filter[filter].operator)
				var values = (myoptions.filter[filter].values)
				addLink.trigger("click");
				var filter = jQuery(this).find("div.filter:last"); /* .addFilter(); is wrong, because it adds based on default values. */
				
				/* alert(jQuery(filter).attr("nodeName") + " " + jQuery(filter).attr("className")) */ /* check on node's name and class. */
				log("c="+filter+", operand="+operand+",operator="+operator+",values="+values);
				filter.find(".operand option").each( function (e) {
					if (jQuery(this).attr("value") == operand) {
						jQuery(this).attr("selected", "true");
					}
				});
				filter.find(".operand").trigger("change");

				filter.find(".operator option").each( function (e) {
					if (jQuery(this).attr("value") == operator) {
						jQuery(this).attr("selected", "true");
					}
				});
				filter.find(".operator").trigger("change");

				filter.find(".values .value").each( function (i) {
					if (values[i] != undefined) {
						jQuery(this).attr("value", values[i]);
					}
				});

			}
		}
	};
	/**
		Function that gets {.operand, .operator, and .values .value} fields and returns a matching JSON Object.
	*/
	jQuery.fn.getFilterAsJSON = function (options) {
		var myoptions = jQuery.extend({},jQuery.fn.attachFilterPanel.defaults, options);
		var panel = jQuery(this);
		var filters = panel.find(".filter");
		panel.find(".customfilter").each(function (i) { filters.push($(this)); } );
		
		var numFilters = filters.length - 1;

		/**/
		var t = "{filter:[";
		var table = panel.find("table");
		table.find("tr").each(
			function (i) {
				jQuery(this).find("td.operand").each(
					function (ii) {
						if (jQuery(this).text() != myoptions.text.selectdef) { // if not the default "Select..." option.
							t += "{";
							t += "operand : '" + escape(jQuery(this).text().substring(0, jQuery(this).text().indexOf(":"))) 
							t += "', values : ['" + escape(jQuery(this).next("td").find(".value").attr("value")) +"']";
							t += "},";
						}
					}
				);				
			}
		);
		if (t[t.length-1] == ',') t = t.substring(0, t.length - 1);
		t += "]}";
		
		/**/
		
		var s = "{filter:[";
		filters.each(
			function (i) {

				var operand = undefined;
				var operator = undefined;

				if (jQuery(this).find(".operand:first option:selected").length) {
					operand = jQuery(this).find(".operand:first option:selected").attr("value");
				} else {
					operand = jQuery(this).find(".operand:first").text();
				}

				if (operand != myoptions.text.selectdef) { // if not the default "Select..." option.
					s += "{";
					s += "operand: '" + escape(operand) + "', ";

					if (jQuery(this).find(".operator:first option:selected").length) {
						operator = jQuery(this).find(".operator:first option:selected").attr("value");
					} else {
						operator = jQuery(this).find(".operator:first").text();
					}

					s += "operator: '" + escape(operator) + "', ";
					
					s += "values: ["
					var valueSet = jQuery(this).find(".values .value");
					valueSet.each(
						function (ii) {
							s += "'";
							s += escape(jQuery(this).attr("value"));
							s += "'";
							if (valueSet.length - 1 != ii) {
								s += ",";
							}
						}
					)
					s += "]"
					s += "}";
					if (numFilters != i) {
						s += ",";
					}
				}
			}
		);
		s += "]}";
		//alert(s); // see the JSON Response.

//		alert(t)
//		alert(s)
		
		var jsont;
		try {
			jsont = eval(t);
		} catch (e) {
//			alert(e);
		}
		var jsons;
		try {
			jsons = eval(s);
		} catch (e) {
//			alert(e);
		}
//		alert(JSON.stringify(jsont))
//		alert(JSON.stringify(jsons))

		
//		var result = jQuery.mergeJSON(jsont, jsons)
//		alert("BLARM: " + JSON.stringify(result))
		/* @TODO Needs togetherness */
//		return result;
		return jsons;
	}

	/**
		Function to allow adding a filter to a panel.
	*/
	jQuery.fn.addFilter = function (options) {
		log('Add Filter Function!');
		var myoptions = jQuery.extend({},jQuery.fn.attachFilterPanel.defaults, options);

		var includeRequired = (myoptions.initial.required != undefined && myoptions.initial.required == false) ? false : true;
		log("includeRequired = " + includeRequired);
		var filter = jQuery("<div class='filter IE6dots'></div>");
		
		operand = jQuery("<select class='operand' />");
		if (myoptions.text.selectdef != null)
			operand.append("<option>"+myoptions.text.selectdef+"</option>");
		else 
			operand.append("<option>"+jQuery.fn.attachFilterPanel.defaults.text.selectdef+"</option>");
		for (k = 0; k < myoptions.operands.length; k++) {
			if (includeRequired == true || myoptions.operands[k].required != true) {
				var operandDisplay = (myoptions.operands[k].display != undefined) ? myoptions.operands[k].display : myoptions.operands[k].name;
				var operandOption = jQuery("<option>" + operandDisplay + "</option>");
				operandOption.attr("value", myoptions.operands[k].name);
				if (myoptions.operands[k].isDefault != undefined) {
					log("myoptions.operands["+k+"].isDefault=" + myoptions.operands[k].name +  ", " + myoptions.operands[k].isDefault)
					if (myoptions.operands[k].isDefault == true) {
						log(" bool");
					}
					if (myoptions.operands[k].isDefault == 'true') {
						log(" str");
					}
				}
				if (myoptions.operands[k].isDefault == true) {
					operandOption.attr("selected", "selected"); /* value should be selected. */
					operandOption.attr("onselected", "selected");
				}
				operand.append(operandOption);
			}
		}
		log("binding chooseOperand to change event.");
		operand.bind("change", myoptions, eventlist.chooseOperand );
		log("binded chooseOperand to change event.");
		operator = jQuery("<select class='operator' style='display:none' />");
		values = jQuery("<span class='values'/>");
		
		var removeFilter = null;
		if (myoptions.showAs == "text") {
			removeFilter = jQuery("<a class='remove' href='#'>"+myoptions.text.remove+"</a>").removeClass("button");
		} else {
			removeFilter = jQuery("<div class='remove button'></div>").attr("alt",myoptions.text.remove).attr("title",myoptions.text.remove);
		}
		removeFilter.bind( "click", eventlist.removeFilter );
		filter.append(operand).append(operator).append(values).append(removeFilter).append("<br />");
		filter.find(".button").bind("mouseenter mouseleave", function(e) { jQuery(this).toggleClass("over"); });
		jQuery(this).find(".panel").append(filter);
		if (operand.find("option[selected=selected]").length > 0 || operand.find("option[onselected=selected]").length > 0) { /* if there is a selected item */
			operand.find("option:first").css("display", "none");
			operand.trigger("change")
		};
		return filter;

	};
	
	/**
		Function to allow adding Required Filters on load. Required fields are also removed from operand selection boxes by default (@param initial.required).
	*/
	jQuery.fn.addRequiredFilters = function (options) {
		var myoptions = jQuery.extend({}, jQuery.fn.attachFilterPanel.defaults, options, {initial: {required:true} });
		log('Start addRequiredFilters');
		s = "";
		for (i = 0; i < myoptions.operands.length; i++) {
			s += myoptions.operands[i].name + ","
		}
		for (i = 0; i < myoptions.operands.length; i++) {
			if (myoptions.operands[i].required) {
//				jQuery(this).find(".add").trigger("click");
				jQuery(this).addFilter(myoptions);
				var filter = jQuery(this).find(".filter:last");
				filter.find("select.operand").prop("disabled", "true");
				filter.find("select.operand").prop("selectedIndex", i+1).change();

				for (ii = 0; ii < myoptions.operands[i].operators.length; ii++) {
					if (myoptions.operands[i].operators[ii].required) {
						filter.find("select.operator").prop("disabled", "true");
						filter.find("select.operator").prop("selectedIndex", ii+1).change();
					}
				}
				filter.find(".remove").remove();
			}
		}
		log('Close addRequiredFilters');
	};
	
	/**
	Attach the Filter panel within a DIV.
	*/
	jQuery.fn.attachFilterPanel = function(options) {
		log("Entering jQuery.fn.attachFilterPanel");	
		var myoptions = jQuery.extend({}, jQuery.fn.attachFilterPanel.defaults, options);

		log("jQuery.fn.attachFilterPanel = " + myoptions.operands.length);
		
		jQuery(this).html("");
		jQuery(this).addClass("JQuery_FilterPanel");
		var dashboard = jQuery("<div class='dashboard'></div>")
		if (myoptions.text.title && myoptions.text.title.length > 0) {
			dashboard.append("<h2>"+myoptions.text.title+"</h2>");
		}
		var addFilter = jQuery("<div class='add button'></div>")
				.attr("alt",myoptions.text.add).attr("title",myoptions.text.add)
				.bind("click", myoptions, eventlist.addFilter);
//				.bind("click", myoptions, jQuery(this).addFilter);
		var removeAllFilters = jQuery("<div class='clear button'></div>")
				.attr("alt",myoptions.text.clear).attr("title",myoptions.text.clear)
				.bind("click", eventlist.removeAllFilters);
		dashboard.append(addFilter).append(removeAllFilters);

		var panel = jQuery("<div class='panel'></div>");

		var footer = jQuery("<div class='footer'></div>");
		footer.append("<div class='get button'></div>")
				.attr("alt",myoptions.text.get).attr("title",myoptions.text.get)
//				.bind("click", eventlist.getFilterAsJSON);
				.bind("click", myoptions.onsubmit);
		jQuery(this).append(dashboard);
		jQuery(this).append(panel);
		jQuery(this).append(footer);
		
		jQuery(this).find(".button").bind("mouseenter mouseleave", function(e){
			jQuery(this).toggleClass("over");
		});
		
		jQuery(this).addRequiredFilters(myoptions);
		try {
			for (i = 0; i < myoptions.initial.filters; i++) {
				jQuery(this).find(".add").trigger("click");
			}
		} catch (e) {
			log("click trigger on add failed. " + e.message);
			/* This bug appears in IE6, butit doesn't seem to cause any ill effects if caught. */
		}
		return jQuery(this);
	};

	/**
		The initial set of parameters. These are configurable by passing in the appropriate JSON arguments.
		@ TODO make the popups a configurable setting directly.
	*/
	var popups = {
		alertType : function (e) { alert("ALERT TYPE on "+e.data.id); },
		defaultType : function (e) { 
			jQuery('#modal-pivot').attr("id", "");
			jQuery(e.target).attr("id", "modal-pivot");
			jQuery.modal("<iframe src='' style='border: 1px solid black; height:350px; width:650px;' ></iframe>",
				{
					backgroundColor:"#fff",
					borderColor:"#0063dc",
					overlay:80,
					overlayCss: {backgroundColor:"#fff"}
					/*
					overlayClose:true,
					closeHTML: '<div style="position: absolute; left:3px; top:3px;">[close]</div>'
					*/
				})
			return false;
		}
	}
	var jsonShortcuts = {
		basictypes : [
			{									name:'equal', 			isDefault: true},
			{									name:'contains'},
			{	display:'sounds like',			name:'soundslike'},
			{	display:"starts with", 			name:'startswith'}
		],
		basicnumeric : [
			{									name:'equal', 			isDefault: true},
			{	display:'greater than',			name:'greaterThan'},
			{	display:'less than',			name:'lessThan'},
			{									name:'between',			params:2},
			{									name:'not'}
		],
		autocomplete_flag : [
			{	display:'equals',				name:'equal',			isDefault: true,	type:"autocomplete", ac_type:"country", ac_return:"digraph" },
			{									name:'contains',							type:"autocomplete", ac_type:"country", ac_return:"digraph" },
			{display:'sounds like',				name:'soundslike', 							type:"autocomplete", ac_type:"country", ac_return:"digraph" },
			{display:'starts with',				name:'startswith',							type:"autocomplete", ac_type:"country", ac_return:"digraph" }
		],
		st_popup : [
			{									name:'equal',			isDefault: true,	type:"popup", popup: popups.defaultType },
			{									name:'contains',							type:"popup", popup: popups.defaultType },
			{display:'sounds like',				name:'soundslike', 							type:"popup", popup: popups.defaultType },
			{display:'starts with',				name:'startswith',							type:"popup", popup: popups.defaultType }
		]
	};
	jQuery.fn.loadJSON.defaults = {};
	jQuery.fn.attachFilterPanel.defaults = {
		operands: [
			{	display: 'Readable Term 1',     name:'term1', 		operators: jsonShortcuts.basictypes			},
			{	display: 'Readable Term 2',     name:'term2',		operators: jsonShortcuts.basicnumeric    	},
			{	display: 'Readable Term 3',     name:'term3', 		operators: jsonShortcuts.autocomplete_flag	},
			{	display: 'Readable Term 4',     name:'term4',		operators: jsonShortcuts.basictypes			},
			{	display: 'Readable Term 5',     name:'term5', 		operators: jsonShortcuts.basictypes			},
			{	display: 'Readable Term 6',     name:'term6',		operators: jsonShortcuts.basictypes			},
			{	display: 'Readable Term 7',     name:'term7', 		operators: jsonShortcuts.basictypes			},
			{	display: 'Readable Term 8',     name:'term8',		operators: jsonShortcuts.popuptype			}
		],
		text: {
			title:		'',
			add:		'Add a filter ',
			remove:		'[X]',
			clear:		'Clear filter ',
			get:		'Get results ',
			selectdef:	'Select...',
			popupdef:	'...'
		},
		keepOnChange: true,				/* Keep values on operand/operator changes. */
		showAs: 'text',
		initial: {
			id: '',
			filters: 0,
			required: false
		},
		onsubmit : function (e) {
			var panel = jQuery(e.target).parent().parent();
			var json = panel.getFilterAsJSON();
			var text = "{";
			for (j = 0; j < json.length; j++) {
				text += "operand = " + json[j].operand + ", ";
				text += "operator = " + json[j].operator + ", ";
				text += "values = [" + json[j].values+ "]";
				if  (j < json.length-1) {
					text += "}, {"
				}
			}
			text += "}"
			alert("RETURN " + text);
		}

	};
	
})(jQuery);