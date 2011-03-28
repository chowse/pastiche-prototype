
(function($) {
	$.fn.scrollTo = function(opts) {
		if (!this.length) return this;
		opts = $.extend({
			duration: 500,
			marginTop: 0,
			complete: undefined
		}, opts || { });
		var top = this.offset().top - opts.marginTop;
		$('html, body').animate({ 'scrollTop': top }, opts.duration, undefined, opts.complete);
		return this;
	};
})(jQuery);


(function($) {
	$.fn.personaQueue = function() {
		return this.each(function() {
			var queue = this;
			var currentPersona = 0;
			var cacheQueueHeight;
			
			var personas = $('.persona', queue).map(function() {
				return {
					element: this,
					top: 0
				};
			}).get();

			$(window).scroll(function() {
				updateMetrics();
				var i = findCurrentPersona();
				if (i != currentPersona) {
					switchPersona( findCurrentPersona() );
				}
			});

			$('.persona .choices button', this).click(function(e) {
				var i = getPersonaParent(e.currentTarget);
				personaActions.approve(i);
				return false;
			});
			
			$(document).keyup(function(e) {
				if (!$(queue).hasClass('shortcuts')) return;
				
				var key = String.fromCharCode(e.which).toLowerCase();
				var action = keymap[key];
				if (action && !e.ctrlKey && !e.altKey && !e.metaKey) {
					personaActions[action](currentPersona);
					return false;
				}
			});

			$('.persona', queue).removeClass('active');
			updateMetrics();
			switchPersona( findCurrentPersona() );
			
			
			function updateMetrics()
			{
				var queueHeight = $(queue).height();
				if (queueHeight === cacheQueueHeight) return;
				cacheQueueHeight = queueHeight;
				
				$.each(personas, function(i, obj) {
					var elem = $(obj.element);
					obj.top = elem.offset().top + elem.outerHeight()/2;
				});
			}
			
			function getPersonaParent(elem)
			{
				var parent = $(elem).closest('.persona').get(0);
				for (var i = 0; i < personas.length; i++) {
					if (personas[i].element == parent) {
						return i;
					}
				}
				return -1;
			}
			
			function gotoPersona(i, delay, duration)
			{
				delay = delay || 0;
				duration = duration || 250;
				
				setTimeout(function() {
					if (i < 0) {
						alert('Previous Page');
					} else if (i >= personas.length) {
						alert('Next Page');
					} else {
						$(personas[i].element).scrollTo({ duration: duration, marginTop: 20 });
					}
				}, delay);
			}

			function switchPersona(i)
			{
				$(personas[currentPersona].element).removeClass('active');
				$(personas[i].element).addClass('active');
				currentPersona = i;
			}

			function findCurrentPersona()
			{
				var pageTop = $(window).scrollTop();

				if (pageTop <= personas[currentPersona].top) {
					for (var i = currentPersona-1; i >= 0; i--) {
						if (personas[i].top < pageTop) {
							break;
						}
					}
					return i+1;
				}

				else {
					for (var i = currentPersona; i < personas.length-1; i++) {
						if (pageTop <= personas[i].top) {
							break;
						}
					}
					return i;
				}
			}
			
			
			var personaActions = {
				'next': function (i) { gotoPersona(i+1); },
				'prev': function (i) { gotoPersona(i-1); },
				
				'approve': function (i) {
					$('.status', personas[i].element).addClass('reviewed');
					
					if ($(queue).hasClass('advance')) {
						gotoPersona(i+1, 500);
					}
				}
			};

			var keymap = {
				'j': 'next',
				'k': 'prev',
				'a': 'approve',
				'r': 'approve',
				'd': 'approve',
				'f': 'approve',
				'm': 'approve'
			};
		});
	};
	
	$.fn.personaQueueOptions = function(queueSelector) {
		return this.each(function() {
			var self = this;
			
			$('input', self).click(onChange);
			$('select', self).change(onChange);
			onChange();
			
			function onChange(e)
			{
				var category = $('#rq-category', self).val();
				var details = $('#rq-details:checked', self).val();
				var advance = $('#rq-advance:checked', self).val();
				var single = $('#rq-single:checked', self).val();
				var shortcuts = $('#rq-shortcuts:checked', self).val();
				
				$(queueSelector)
					.toggleClass('details', details !== undefined)
					.toggleClass('advance', advance !== undefined)
					.toggleClass('single', single !== undefined)
					.toggleClass('shortcuts', shortcuts !== undefined);
					
				$('.shortcuts', self).css({ visibility: shortcuts ? 'visible' : 'hidden' });
			}
		});
	};
})(jQuery);


$(document).ready(function() {
	var personas = $('.persona-queue .persona');
	for (var i = 1; i < 3; i++) personas.clone().appendTo('.persona-queue');
	
	$('.zoombox').zoomBox();
	$('.persona-queue').personaQueue();
	$('.sidebar').personaQueueOptions('.persona-queue');
});
