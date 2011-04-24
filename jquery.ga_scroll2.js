/**
 * jQuery.ga_scroll2
 * 
 * Copyright 2010, @yosimox and @ishiiyoshinori on Twitter
 * 
 * Version: 0.91
 */
;(function($){

	var default_options = {
		tracker_name: '',				// トラッカー名（t2など,通常は空文字でOK）
		page_var: [],				// サイト内で使用しているページレベルのカスタム変数が入ってるスロット
		custom_var: {
			enable: true,
			slot: 3,
			category: 'ga_scroll',
			scope: 2
		},
		track_scroll: {
			enable: true,
			category: 'scroll',
			action: location.pathname,
			label : ''
		},
		track_duration: {
			enable: true,
			category: 'duration',
			action: location.pathname,
			label : ''
		},	};

	var params = {
		duration_time: 0,	// ページ滞在時間（秒）
		scroll: 0,			// スクロール量（%）
	};

	var settings = {};

	var methods = {

		init: function(options) {
			var timer_start = new Date().getTime();

			options = options || {};
			$.extend(true, settings, default_options, options);

			methods._update_scroll_ratio();

			$(window).scroll(function(){
				methods._update_scroll_ratio();
			}).unload(function(){
				
				for (var i=0; i<settings.page_var.length; i++) {
					methods._push(['_deleteCustomVar', i]);
				}
				
				params.duration_time = parseInt((new Date().getTime() - timer_start) / 1000, 10);

				if (settings.custom_var.enable) {
					var custom_var = methods._histogram(params.scroll, 10);
					
					methods._push([
						'_setCustomVar',
						parseInt(settings.custom_var.slot, 10),
						settings.custom_var.category,
						custom_var,
						parseInt(settings.custom_var.scope, 10)
					]);
				}
				
				if (settings.track_scroll.enable) {
					var custom_link = custom_var || methods._histogram(params.scroll, 10);
					methods._push([
						'_trackEvent',
						settings.track_scroll.category,
						settings.track_scroll.action,
						custom_link,
						params.scroll
					]);
				}

				if (settings.track_duration.enable) {
					var custom_link = methods._histogram(params.duration_time, 30);
					methods._push([
						'_trackEvent',
						settings.track_duration.category,
						settings.track_duration.action,
						custom_link,
						params.duration_time
					]);
				}


			});

		},

		_update_scroll_ratio: function() {

			var ratio = params.scroll;

			if (ratio < 100) {

				// コンテンツの高さ
				var contents_height = $(document).height();
				// 描画領域の高さ
				var window_height = $(window).height();

				if (contents_height <= window_height) {

					ratio = 100;

				} else {

					var scrolled_ratio = parseInt((($(window).scrollTop() + window_height) / contents_height) * 100, 10);

					if (ratio < scrolled_ratio) {

						ratio = scrolled_ratio;

					}

				}

				params.scroll = 100 < ratio ? 100 : ratio;

			}
			console.log(params.scroll);
		},

		_push: function(params) {

			if (settings.tracker_name != '') {

				params[0] = settings.tracker_name + '.' + params[0];

			}

			if (window._gaq) {
				window._gaq.push(params);
			}

		},
		
		_histogram : function(data, interval, num){
				var num = num || interval;
				if(data < num){
						return (String(num - interval) + "-" + String(num));
				}else{
						return methods._histogram(data, interval, num+interval);
				}
		},

	};

	$.ga_scroll2 = function(method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.' + name);
		}
	};
})(jQuery);
