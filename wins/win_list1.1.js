(function(global) {
	"use strict"

	var baseConfig = {
		id: "",
		title: "提示",
		width: 350,
		height: "auto",
		auto: false,
		time: 3000,
		content: "",
		position: 4,
		mask: false,
		isShow: false,
		closeBtn: false,
		sureBtn: true,
		beforeClose: function() {},
		sure: function() {}
	};

	var alertCount = 0,
		confirmCount = 0,
		noticeCount = 0,
		mask = null,
		maskCount = 0,
		doc = global.document;

	var baseHtml1 = "\
		<div id='$DIALOGID$' class='dialog-wrap dialog-hide'>\
			<div class='dialog-title-wrap'>\
				<h2 class='dialog-title'>$TITLE$</h2>\
			</div>\
			<div class='dialog-content-wrap'>$CONTENT$</div>\
			<div class='btn-wrap'>$BTNS$</div>\
		</div>";

	var baseHtml2 = "\
		<div id='$DIALOGID$' class='dialog-wrap dialog-hide'>\
			<div class='dialog-title-wrap'>\
				<h2 class='dialog-title'>$TITLE$</h2>\
			</div>\
			<div class='dialog-content-wrap'>$CONTENT$</div>\
		</div>";

	var baseHtml3 = "\
		<div id='$DIALOGID$' class='dialog-wrap dialog-hide'>\
			<div class='dialog-content-wrap'>$CONTENT$</div>\
		</div>";

	function copy(newOpt, oldOpt) {
		var opts = {};
		for(var key in oldOpt) {
			opts[key] = "undefined"!==typeof newOpt[key]?newOpt[key]:oldOpt[key];
		}
		return opts;
	}

	function addEvent(target, type, fn, useCaption) {
		if(doc.addEventListener) {
			target.addEventListener(type, function() {
				var e = arguments[0] || global.event;
				fn.call(this, e);
			}, useCaption || false);
		} else {
			target.attachEvent(type, function() {
				var e = arguments[0] || global.event;
				fn.call(this, e);
			});
		}
	}

	function insertHTML(el, where, html) {
		if (!el) {
			return false;
		}
		
		where = where.toLowerCase();
		
		if (el.insertAdjacentHTML) {//IE
			el.insertAdjacentHTML(where, html);
		} else {
			var range = el.ownerDocument.createRange(),
				frag = null;
			
			switch (where) {
				case "beforebegin":
					range.setStartBefore(el);
					frag = range.createContextualFragment(html);
					el.parentNode.insertBefore(frag, el);
					return el.previousSibling;
				case "afterbegin":
					if (el.firstChild) {
						range.setStartBefore(el.firstChild);
						frag = range.createContextualFragment(html);
						el.insertBefore(frag, el.firstChild);
					} else {
						el.innerHTML = html;
					}
					return el.firstChild;
				case "beforeend":
					if (el.lastChild) {
						range.setStartAfter(el.lastChild);
						frag = range.createContextualFragment(html);
						el.appendChild(frag);
					} else {
						el.innerHTML = html;
					}
					return el.lastChild;
				case "afterend":
					range.setStartAfter(el);
					frag = range.createContextualFragment(html);
					el.parentNode.insertBefore(frag, el.nextSibling);
					return el.nextSibling;
			}
		}
	}

	// <==========================================================================================================================================>

	var build = function(obj, winId) {
		var options = obj.options,
			baseHtml = "notice"===obj.name?baseHtml2:baseHtml1,
			winHtml = baseHtml.replace("$DIALOGID$", winId).replace("$TITLE$", options.title),
			btns = "";

		if(options.id) {
			var _node = doc.getElementById(options.id);
			options.content = _node.insertHTML;
			_node.parentNode.removeChild(_node);
		}

		if(options.closeBtn) {
			btns += obj.closeBtn;
		}

		if (options.sureBtn) {
			btns += obj.sureBtn;
		};

		winHtml = winHtml.replace("$CONTENT$", options.content).replace("$BTNS$", btns);
		insertHTML(doc.body, "beforeend", winHtml);

		if(options.mask && !mask) {
			mask = doc.createElement("DIV");
			mask.className = "dialog-mask hide";
			doc.body.appendChild(mask);
		}

		var winObj = doc.getElementById(winId);

		var closeBtn = winObj.getElementsByClassName("btn-close")[0];
		if(closeBtn) {
			addEvent(closeBtn, "click", function() {
				obj.close();
			});
		}

		var sureBtn = winObj.getElementsByClassName("btn-sure")[0];
		if(sureBtn) {
			addEvent(sureBtn, "click", function() {
				options.sure.call(obj);
			});
		}
		
		obj.winObj = winObj;
		obj.options = options;
	};

	function Win(opts) {
		this.name = "win";
		this.isShow = false;
		this.baseConfig = baseConfig;
		this.closeBtn = "<button class='btn btn-close ml10'>关闭</button>";
		this.sureBtn = "<button class='btn btn-primary btn-sure ml10'>确定</button>";
	}

	Win.prototype = {
		open: function() {
			var self = this,
				options = self.options;

			if(options.isShow) return ;

			if(options.mask) {
				mask.className = mask.className.replace("hide", "show");
				maskCount++;
			}

			self.winObj.style.width = options.width + "px";
			if("auto"!==options.height) {
				self.winObj.style.width = options.height + "px";
			}
			self.winObj.className = self.winObj.className.replace("dialog-hide", "dialog-show");

			self.rePosition();

			if(options.auto) {
				setTimeout(function() {
					self.close();
				}, options.time);
			}

			addEvent(global, "resize", function() {
				if(options.isShow) {
					self.rePosition();
				}
			});

			options.isShow = true;
		},
		rePosition: function() {
			var self = this,
				options = self.options,
				bodyWidth = doc.body.clientWidth,
				bodyHeight = doc.body.clientHeight,
				dialogWidth = options.width,
				dialogHeight = self.winObj.offsetHeight,
				_left = 0,
				_top = 0;

			if("notice"!==self.name) {
				_left = (bodyWidth-dialogWidth)/2;
				_top = (bodyHeight-dialogHeight)/2;
			} else {
				switch(options.position) {
					case 1 :
						_left = 0, _top = bodyHeight - dialogHeight;
					break;
					case 2:
						_left = 0, _top = 0;
					break;
					case 3:
						_left = bodyWidth - dialogWidth, _top = 0;
					break;
					case 4:
						_left = bodyWidth - dialogWidth, _top = bodyHeight - dialogHeight;
				}
			}
			self.winObj.style.left = _left + "px";
			self.winObj.style.top = _top + "px";
		},
		close: function() {
			var self = this,
				options = self.options;

			if(!options.isShow) return ;

			options.beforeClose.call(self);

			self.winObj.className = self.winObj.className.replace("dialog-show", "dialog-hide");
			self.winObj.style.cssText = "";

			if(options.mask && maskCount>0) {
				if(0===--maskCount) {
					mask.className = mask.className.replace("show", "hide");
				}
			}

			options.isShow = false;
		}
	};

	// alert
	function Alert(opts) {
		this.name = "alert";
		this.baseConfig = copy({}, this.baseConfig);
		this.options = copy("string"===typeof opts?{content:opts}:opts, this.baseConfig);
		var winId = "alert_" + alertCount;
		build(this, winId);
		alertCount++;
	};

	Alert.prototype = new Win();

	// confirm
	function Confirm(opts) {
		this.name = "confirm";
		this.baseConfig = copy({}, this.baseConfig);
		this.baseConfig.closeBtn = true;
		this.options = copy("string"===typeof opts?{content:opts}:opts, this.baseConfig);
		var winId = "confirm_" + confirmCount;
		build(this, winId);
		confirmCount++;
	}

	Confirm.prototype = new Win();

	// notice
	function Notice(opts) {
		this.name = "notice";
		this.baseConfig = copy({}, this.baseConfig);
		this.baseConfig.sureBtn = false;
		this.baseConfig.auto = true;
		this.options = copy("string"===typeof opts?{content:opts}:opts, this.baseConfig);
		var winId = "notice_" + noticeCount;
		build(this, winId);
		noticeCount++;
	}

	Notice.prototype = new Win();

	// <======================================================================================================================================================>

	global.win = global.win || {};

	global.win["open"] = function(opts) {
		return new Win(opts);
	}
	global.win["alert"] = function(opts) {
		return new Alert(opts);
	};
	global.win["confirm"] = function(opts) {
		return new Confirm(opts);
	};
	global.win["notice"] = function(opts) {
		return new Notice(opts);
	}
})(window)