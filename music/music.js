;(function() {
	"use strict";
	var div = document.createElement("DIV"),
		li = document.createElement("LI"),
		a = document.createElement("A"),
		toString = Object.prototype.toString;

	var tpl1 = "\
		<div class='music-player-wrap'>\
			<div class='player-controls-wrap'>\
				<div class='progress-area'>\
					<div class='video-progress-area'>\
						<ul class='play-wrap'>\
							<li class='play-time'>00:00</li>\
							<li class='time-progress-wrap'></li>\
							<li class='total-time'>00:00</li>\
						</ul>\
					</div>\
					<div class='voice-progress-area'>\
						<ul class='audio-wrap'>\
							<li class='icon-volume-wrap'>\
								<i class='iconfont icon-volume'></i>\
							</li>\
							<li class='voice-progress-wrap'></li>\
						</ul>\
					</div>\
				</div>\
				<ul class='song-control'>\
					<li class='play-mode-wrap'><a href='javascript:void(0);' class='ctrl' action='mode'></a></li>\
					<li class='pre-wrap'><a href='javascript:void(0);' class='ctrl' action='pre'></a></li>\
					<li class='play-control'><a href='javascript:void(0);' class='ctrl' action='ctrl'></a></li>\
					<li class='next-wrap'><a href='javascript:void(0);' class='ctrl' action='next'></a></li>\
					<li class='song-list-btn-wrap'><a href='javascript:void(0);' class='ctrl' action='list'></a></li>\
				</ul>\
			</div>\
			<ul class='song-list-wrap'></ul>\
			<audio src='' autoPlay='autoPlay' volume='0.5'></audio>\
		</div>";

	var tpl2 = "\
		<div class='progress-outer'>\
			<span class='drag-background'></span>\
			<span class='drag-btn'></span>\
		</div>";

	var ele = {
		createNode: function(str) {
			div.innerHTML = str;
			return div.removeChild(div.firstElementChild);
		},
		addEvent: window.addEventListener?function(target, type, fn, use) {
			target.addEventListener(type, fn, use||false);
		}:function(target, type, fn) {
			target.attachEvent("on"+type, fn);
		},
		removeEvent: window.removeEventListener?function(target, type, fn, use) {
			target.removeEventListener(type, fn, use||false);
		}:function(target, type, fn) {
			target.detachEvent("on"+type, fn);
		},
		addClass: function(node, cn) {
			var className = node.className,
				reg = new RegExp("\\b"+cn+"\\b", "g");
			if(!reg.test(className)) {
				node.className = className + " " + cn;
			}
		},
		removeClass(node, cn) {
			var className = node.className,
				reg = new RegExp("\\b"+cn+"\\b", "g");
			node.className = className.replace(reg, "");
		}
	};

	function buildMusicList(musics) {
		var self = this;

		if("[object Array]"===toString.call(musics)) {
			var frag = document.createDocumentFragment();

			musics.forEach(function(music) {
				var _li_ = li.cloneNode(1),
					_a_ = a.cloneNode(1);
				_a_.innerHTML = music.name;
				_a_.href = "javascript:void(0);";
				_li_.appendChild(_a_);
				frag.appendChild(_li_);

				ele.addEvent(_a_, "click", function() {
					self.current = music;
					self.play(music.url);
				});
			});

			return frag;
		} else if("[object Object]"===toString.call(musics)) {
			var _li_ = li.cloneNode(1),
				_a_ = a.cloneNode(1);
			_a_.innerHTML = musics.name;
			_a_.href = "javascript:void(0);";
			_li_.appendChild(_a_);

			ele.addEvent(_a_, "click", function() {
				self.current = musics;
				self.play(musics.url);
			});

			return _li_;
		}

		return null;
	}

	function buildProgress(fn) {
		div.innerHTML = tpl2;
		var state = 0,
			wrapLeft = 0,
			wrapWidth = 0,
			mouseLeft = 0,
			dvalue = 0,
			progress = div.removeChild(div.firstElementChild),
			background = progress.getElementsByClassName("drag-background")[0],
			dragBtn = progress.getElementsByClassName("drag-btn")[0];

		var shifting = function(n) {
			var pos = ((dragBtn.offsetParent.clientWidth - dragBtn.offsetWidth)*n)>>0
			dragBtn.style.left = pos + "px";
			background.style.width = pos + "px";
		};

		var drag = function() {
			var e = arguments[0] || window.event,
				pos = e.clientX - wrapLeft - dvalue;
			dragBtn.style.left = (pos<0?0:(pos>(wrapWidth-dragBtn.offsetWidth)?(wrapWidth-dragBtn.offsetWidth):pos)) + "px";
			background.style.width = (pos<0?0:(pos>(wrapWidth-dragBtn.offsetWidth)?(wrapWidth-dragBtn.offsetWidth):pos)) + dragBtn.offsetWidth/2 + "px";
			fn(pos/(wrapWidth-dragBtn.offsetWidth));
		};

		var stopDrag = function() {
			state = 0;
			ele.removeEvent(document, "mousemove", drag);
			ele.removeEvent(document, "mouseup", stopDrag);
		};

		ele.addEvent(dragBtn, "mousedown", function() {
			state = 1;
			var wrapRect = this.offsetParent.getBoundingClientRect(),
				e = arguments[0] || window.event;
			wrapLeft = wrapRect.left;
			wrapWidth = this.offsetParent.clientWidth;
			dvalue = e.clientX - this.getBoundingClientRect().left;
			ele.addEvent(document, "mousemove", drag);
			ele.addEvent(document, "mouseup", stopDrag);
		});

		return {
			node: progress,
			shifting: shifting
		};
	}

	function timeFormat(time, n) {
		var t = (time/n)>>0;
		if(t<10) t = "0"+t;
		n = n/60;

		if(n>=1) {
			var nt = timeFormat(time-n*60*t, n);
			t = t + ":" + nt;
		}

		return t;
	};

	function MusicPlayer(params) {
		if(!this instanceof MusicPlayer) {
			return new MusicPlayer(params);
		}

		this.name = "MusicPlayer";
		var wrap = params.wrap;
		wrap.innerHTML = tpl1;

		var vb = wrap.getElementsByTagName("audio")[0],
			playTimeNode = wrap.getElementsByClassName("play-time")[0],
			totalTimeNode = wrap.getElementsByClassName("total-time")[0],
			volumeBtn = wrap.getElementsByClassName("icon-volume")[0],
			volumeIconWrap = wrap.getElementsByClassName("icon-volume-wrap")[0],
			ctrlBtns = [].slice.call(wrap.getElementsByClassName("ctrl"), 0),
			noVolume = false,
			volume = 0,
			totalTime = 0;

		ele.addEvent(vb, "ended", function() {
			timeProgress.shifting(0);
			playTimeNode.innerHTML = "00:00";
			totalTimeNode.innerHTML = "00:00";
		});

		ele.addEvent(vb, "timeupdate", function() {
			timeProgress.shifting(this.currentTime/totalTime);
			playTimeNode.innerHTML = timeFormat(this.currentTime>>0, 3600).replace(/^00:/, "");
		});

		ele.addEvent(vb, "durationchange", function() {
			totalTime = this.duration;
			totalTimeNode.innerHTML = timeFormat(totalTime>>0, 3600).replace(/^00:/, "");
		});

		ele.addEvent(volumeBtn, "click", function() {
			if(!noVolume) {
				volume = vb.volume;
				volume = volume || 0.5;
				ele.addClass(volumeIconWrap, "no-volume");
				voiceProgress.shifting(0);
				vb.volume = 0;
			} else {
				vb.volume = volume;
				ele.removeClass(volumeIconWrap, "no-volume");
				voiceProgress.shifting(volume);
			}

			noVolume = !noVolume;
		});

		ctrlBtns.forEach(function(ctrlBtn) {
			ele.addEvent(ctrlBtn, "click", function() {
				var action = this.getAttribute("action");

				switch(action) {
					case "mode":

					break;
					case "pre":

					break;
					case "next":

					break;
					case "list":
					
					break;
					default:
				}
			});
		});


		var obj = {
			mp: this,
			play: function(url) {
				timeProgress.shifting(0);
				vb.src = params.root || "" + url;
			}
		};

		var musicList = buildMusicList.call(obj, params.musics);
		musicList && wrap.getElementsByClassName("song-list-wrap")[0].appendChild(musicList);

		var timeProgress = buildProgress(function(n) {
			//vb.fastSeek(totalTime*n);
		});

		var voiceProgress = buildProgress(function(n) {
			volume = n<0?0:(n<1?n:n>>0);
			vb.volume = volume;

			if(0===volume && !noVolume) {
				ele.addClass(volumeIconWrap, "no-volume");
				noVolume = true;
			}

			if(0!=volume && noVolume) {
				ele.removeClass(volumeIconWrap, "no-volume");
				noVolume = false;
			}
		});

		wrap.getElementsByClassName("time-progress-wrap")[0].appendChild(timeProgress.node);
		wrap.getElementsByClassName("voice-progress-wrap")[0].appendChild(voiceProgress.node);
		voiceProgress.shifting(0.5);
		vb.volume = 0.5;
	}

	window.mp = {
		init:  function(params) {
			if(!params.wrap || !params.musics) return ;
			return new MusicPlayer(params);
		}
	};
}());