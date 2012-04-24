/**
CLEANED UP IN JSLINT.

Use the class "remove-from-popups" to eliminate something from the display.
Accept the class "show-in-popups"
*/
(function ($) {

  "use strict";
  var rotationCycleMS = 5000, announcementRefId = null, modalUp = false;
  function log(v) {
    try {
      if (console && console.log) {
        //console.log(">> an >> " + v);
      }
    } catch (e) {
    }
  }
/**
This cleans up things that don't belong in popups.
*/
  function cleanColorbox(arg) {
    log("clean colorbox"); // line 20
    arg.find(".remove-from-popups").remove();
    arg.find("img[width='100%']").attr("width", null);
    return arg;
  }

  jQuery.fn.tabAnnouncements = function () {
    var rand, announcementId, liAdd;
    log("tab announcements");
    if (!!jQuery(this).attr("id")) {
      announcementRefId = "#" + jQuery(this).attr("id");
    } else {
      rand = Math.floor(Math.random() * 1000);
      announcementId = "tabAnnouncement_" + rand;
      jQuery(this).attr("id", announcementId);
      announcementRefId = "#" + announcementId;
    }
	log("announcementRefId=" + announcementRefId)
    $(this).tabs();

    liAdd = $("<li class='ui-state-default ui-corner-bottom' style='float:right;'><a><span class='ui-icon ui-icon-pause ui-announcement-playpause'></span></a></li>");
    $(this).find("ul.ui-tabs-nav").append(liAdd);

    liAdd.find("a")
      .on("mouseenter", function () { liAdd.find("a").addClass("ui-state-hover"); }) // line 50
      .on("mouseleave", function () { liAdd.find("a").removeClass("ui-state-hover"); })
      .on("click", function () {
        liAdd.find("a").toggleClass("ui-state-hover ui-state-active");
        liAdd.find("span").toggleClass("ui-icon-pause ui-icon-play");
      });

    $(this).tabs("rotate", rotationCycleMS, true);
    $(this).find(".ui-tabs-panel").on("click", {id: announcementRefId}, function (e) {
      var $w, $clone, $e = $(e.currentTarget);
		var $ee = $(e.target);
		if (!!$ee.attr("href")) {
			return;
		}
      $w = $(window);
      $clone = cleanColorbox($e.clone());
      $clone.dialog({
        title: "Announcement:",
        modal: true,
        resizable: false,
        height: $w.height() - 150,
        width: $w.width() - 150,
        open: function () {
          log("triggered dialogopen 1");
          modalUp = true;
          log("triggered dialogopen 2");
          $("div#cboxLoadedContent").addClass("ui-widget-content");
          $("#cboxLoadedContent .ui-tabs-panel").css("border-bottom", "0px solid black");
        },
        close: function () {
          log("triggered dialogclose (on " + announcementRefId + ")");
          modalUp = false; // line 80
          $(announcementRefId).tabs("rotate", rotationCycleMS, true);
        }
      });
    }).on("cbox_open", {id : announcementRefId}, function () {
      modalUp = true;
    }).on("cbox_complete", {id: announcementRefId}, function () {
      $("div#cboxLoadedContent").addClass("ui-widget-content");
      $("#cboxLoadedContent .ui-tabs-panel").css("border-bottom", "0px solid black");
    }).on("cbox_cleanup", {id: announcementRefId}, function (e) {
      modalUp = false;
      $(e.data.id).tabs("rotate", rotationCycleMS, true);
    });

    $(this).on("mouseover", {id: announcementRefId}, function (e) {
      log("triggered mouseover pause (on " + e.data.id + ")");
      $(e.data.id).tabs("rotate", null, false);
    }).on("mouseout", {id: announcementRefId}, function (e) {
      log("triggered mouseover unpause (on " + e.data.id + ")");
      var isPaused, $e = $(announcementRefId);
      isPaused = !!$e.find(".ui-icon-play").length;
      if (!modalUp && !isPaused) {
        $(e.data.id).tabs("rotate", rotationCycleMS, true);
      }
    });
  };
}(jQuery));