(function($){
	$.fn.extend({
		"rightClick":function(fn) {
			$(this).bind('contextmenu', function(e) {
				return false;
			});
			$(this).mousedown(function(e) {
				if(3 == e.which) {
					fn(e);
				}
			});
		}
	});
})(jQuery);