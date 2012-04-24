(function(jQuery) {

	jQuery.fn.wrapTable = function(settings) {
		var config = {'height': '100px', 't_headHeight': '1.5em'};

		if (settings) jQuery.extend(config, settings);

		this.each(function() {
	 
			var table1 = jQuery(this);
			table1.wrap("<div></div>");
			var wrapper = table1.parent().attr("id", table1.attr("id") + "_wrapper");
			var table2 = table1.clone();
			table1.attr("id", table1.attr("id") + "_head");
			wrapper.append(table2);
			
			var tableWrapper1 = table1.wrap("<div></div>").parent();
			var tableWrapper2 = table2.wrap("<div></div>").parent();
			
			var thead = table1.find("thead");
			var tbody = table1.find("tbody").css("height", "1px").css("overflow", "hidden").css("visibility", "hidden");
			var theadHeight = thead.outerHeight();
			if (theadHeight < 3) {
				theadHeight = config.t_headHeight;
			} else {
				theadHeight = theadHeight + "px";
			}
			tableWrapper1.css("height", theadHeight).css("overflow", "hidden").css("border", "1px solid gray");
			
			table2.find("thead").css("height", "1px").css("line-height", "1px").css("overflow", "hidden").css("visibility", "hidden");
			tableWrapper2.css("height", config.height).css("overflow-y", "scroll").css("border", "1px solid gray");

			tableWrapper1.css("padding-right", "20px");
		});

	return this;

	};

})(jQuery);