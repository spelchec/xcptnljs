(function ($) {
	var numberOfSections;
	var numberOfOpenSections;
	var numberOfClosedSections;
	var rootId;
	var offsetFromTop;
	var elementHeight;
	var boundedElement;
	
	addSectionFullCSS = function (obj) {
		obj.addClass("section-full")
		obj.children(".ui-expandable-column-content")
			.addClass("ui-expandable-column-content-visible")
			.removeClass("ui-expandable-column-content-hidden")
	}
	removeSectionFullCSS = function (obj) {
		obj.removeClass("section-full")
		obj.children(".ui-expandable-column-content")
			.addClass("ui-expandable-column-content-hidden")
			.removeClass("ui-expandable-column-content-visible")
	}
	
	reset = function (root) {
		$(this).children(".content").css("height", null); 
		var siblings = root.children("div");
		var titleHeight = siblings.find(".ui-expandable-column-title").height();
		var titleGroupHeight = numOpenSections * titleHeight;
		var stuckOpenHeights = 0;
		root.find(".section-stuck-open").each(function () {
			$(this).height($(this).attr("forcedheight"));
			stuckOpenHeights += (1*$(this).attr("forcedheight"));
		});
		var selectedItemHeight = (elementHeight - (numClosedSections * titleHeight)) / numOpenSections - stuckOpenHeights;

		var showState = {height: selectedItemHeight }
		var hideState = {height: titleHeight}
		siblings.not(".section-stuck-open").each( function () {
			$(this).children(".ui-expandable-column-content").height(elementHeight); 
			removeSectionFullCSS($(this));
			$(this).find("div.openDialog").remove();
			if ($(this).hasClass("section-open")) {
				jQuery(this).stop().animate(showState);
			} else if ($(this).hasClass("section")){
				jQuery(this).stop().animate(hideState);
			}
		});
	}

	var prevAdj = null;
	toggleToSection = function (obj) {
		while (obj != null && !obj.hasClass("section")) {
			obj = obj.parent();
		}
		if (obj.hasClass("section-full") || obj.hasClass("section-stuck-open")) {
			return;
		}
		var root = obj.parent();
		var siblings = root.children("div")
		var titleHeight = obj.find(".ui-expandable-column-title").height();
		var titleGroupHeight = (numberOfSections - 1) * titleHeight;
		var selectedItemHeight = elementHeight - titleGroupHeight;
		
		var showState = {height: selectedItemHeight}
		var hideState = {height: titleHeight}
		siblings.each( function () {
			if ($(this).html() == obj.html() && $(this).hasClass("section")) {
				$(this).stop().animate(showState, {complete: 
					function () {
						var $children = $(this).children(".ui-expandable-column-content");
						$children.height(selectedItemHeight - titleHeight).width(root.width() - 0); /* IE needs this */
						addSectionFullCSS($(this))
						if ($.browser.msie) {
							$children.css("overflow-y", "scroll")
						}
					}
				});
				
				try {
				if ($(this).find("div.openDialog").length == 0) {
					$(this).find("div:eq(1)").css("position", "relative").append(
						jQuery("<div class='openDialog'>full screen &gt;</div>").css({"position" : "relative", "z-index" : "500", "bottom" : "0", "right" : "0"})
							.attr("href", "#")
							.on("click", function (e) {
								$w = $(window);
								$content = $(e.target).parent();
								$title = $content.prev();
								$clone = $(e.target).parent().parent().clone(true);
								$clone.children().eq(0).remove();
								$clone.children().eq(0).css({height: $w.height() - 200, width: $w.width() - 200});	
								$clone.find("div.openDialog").remove();
								$clone.find(".remove-from-popups").remove();
								$clone.find(".only-in-popups").removeClass("only-in-popups");
								var heightVal = ($.browser.msie ? "90%" : $w.height() - 150)
								$dialog = $clone.dialog({title: $title.text(), modal: true, resizable: false, height: heightVal, width: $w.width() - 150});
								$dialog.on("click", "a", function () {
									$clone.dialog("close");
								});
							})
					);
				}
				} catch (er) {
					alert(er)
				}

			} else if ($(this).hasClass("section")) {
				$(this).children(".ui-expandable-column-content").height(selectedItemHeight - titleHeight); 
				$(this).stop().animate(hideState, {complete: function () { removeSectionFullCSS($(this))}});
			}
		});
	}
	
	$.fn.expandableColumn = function(data) {
		var root = jQuery(this)
//		elementHeight = $(window).height() - data.offsetFromTop
		boundedElement = data.boundedElement;
		elementHeight = boundedElement.height();
		numberOfSections = root.children("div").length;
		numOpenSections = root.children(".section-open, .section-stuck-open").not(".section-stuck-open").length;
		numClosedSections = root.children(".section-closed").length

		var siblings = jQuery(this).children("div");

		var windowHeight = $(window).height();
		var heightValue = (100 / numberOfSections) + "%";
		heightValue = $(window).height() * ((100 / numberOfSections) / 100)

		//siblings.css("height", heightValue).css("width", "100%")
		root.addClass("ui-expandable-column").addClass("ui-widget");
		siblings.each(function () {
			$(this).children("div").eq(0).addClass("ui-expandable-column-title").addClass("ui-accordion-header ui-helper-reset ui-state-default ui-corner-all");;
			$(this).children("div").eq(1).addClass("ui-expandable-column-content")
				.addClass("ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom ui-accordion-content-active")
		}).find(".section-stuck-open").each(function () {
			$(this).height($(this).attr("forcedheight"));
		});

		if (jQuery(this).attr("id") == null) {
			var rand = Math.floor(Math.random()*1000);
			jQuery(this).attr("id", "expandableColumn_"+rand)
		}
		rootId = "#" + jQuery(this).attr("id");
		jQuery(this)
			.on("click", ".section", function (e) {
				var o = jQuery(e.target);
				toggleToSection(o)
			}).on("mouseleave", ".section", {ref: root}, function (e) {
				reset(jQuery(rootId))
			});

		jQuery(window).on("resize", function () {elementHeight = boundedElement.height(); reset(jQuery(rootId)) })
		reset(root);
	}

})(jQuery);