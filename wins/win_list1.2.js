/**
 *
 *
 * 弹出框
 * @Author Jason
 * @Date 2017-5-2
 *
 *
 */

 ;(function(tool) {
 	var toString = Object.prototype.toString;

 	var defaultConfig = {
 		id: "",
 		auto: false,
 		time: 3000,
 		title: "提示",
 		mark: true,
 		header: false,
 		footer: true,
 		disposable: true,
 		beforeCancel: function() {return true},
 		afterCancel: function() {return true},
 		beforeClose: function() {return true},
 		afterClose: function() {return true}
 	};

 	var hasMark = false,
 		markIsShow = false,
 		markObj = null,
 		showList = [],
 		zIndex = 10000,
 		showMarkCount = 0;

 	var headerTpl = "\
 		<div class='dialog-header'>\
 			<span>$TITLE$</span>\
 			<i class='close-btn'></i>\
 		</div>";
 	var bodyTpl = "<div class='dialog-body'>$CONTENT$</div>";
 	var footerTpl1 = "\
 		<div class='dialog-footer'>\
 			<a href='javascript:void(0);' class='dialog-btn dialog-btn-cancel' type='cancel'>取消</a>\
 			<a href='javascript:void(0);' class='dialog-btn dialog-btn-sure' type='sure'>确定</a>\
 		</div>";
 	var footerTpl2 = "\
 		<div class='dialog-footer'>\
 			<a href='javascript:void(0);' class='dialog-btn dialog-btn-sure' type='sure'>确定</a>\
 		</div>";
 	var footerTpl3 = "<div class='dialog-footer'>$BOTTON$</div>";
 	var markTpl = "<div class='dialog-mark mark-hidden'></div>";

 	tool.addEvent(window, "resize", function() {
 		var i = 0, len = showList.length;
 		for(;len>i;setSite.call(showList[i], true),i++);
 	});

 	function buildWin(params) {
 		var self = this;
 		var tpl = "<div class='dialog-wrap dialog-hidden win-"+this.name.toLowerCase()+"'>";

 		if(params.mark && !hasMark) {
 			markObj = tool.createElement(markTpl);
 			document.body.appendChild(markObj);
 			hasMark = true;
 		}

 		if(params.header) {
 			tpl+=headerTpl.replace(/\$TITLE\$/, params.title);
 		}

 		var str = params.content || (document.getElementById(params.id) && document.getElementById(params.id).innerHTML) || "";
 		tpl += bodyTpl.replace(/\$CONTENT\$/g, str);

 		if(params.footer) {
 			tpl += ((params.btns && footerTpl3.replace(/\$BOTTON\$/g, params.btns)) || "alert"===this.name.toLowerCase()?footerTpl2:footerTpl1);
 		}

 		tpl += "</div>";
 		var winObj = tool.createElement(tpl);

 		tool.addEvent(winObj.getElementsByClassName("dialog-footer"), "click", function() {
 			var e = arguments[0] || window.event,
 				target = e.target,
 				type = tool.attr(target, "type");

 			if(type) {
 				"sure"===type.toLowerCase() && self.close();
 				"cancel"===type.toLowerCase() && self.cancel();
 				e.preventDefault();
 				e.stopPropagation();
 			}
 		});

 		document.body.appendChild(winObj);

 		this.getWinNode = function() {
 			return winObj;
 		};

 		params.disposable && showWin.call(this);
 	}

 	function showWin() {
 		var self = this;
 		var winObj = this.getWinNode(), params = this.getParams();
 		tool.removeClass(winObj, "dialog-hidden");

 		if(params.mark) {
 			showMarkCount++;
 			!markIsShow && tool.removeClass(markObj, "mark-hidden");
 		}

 		this.isShow = true;
 		showList.push(this);
 		setSite.call(this, true, zIndex++);

 		if(params.auto) {
 			this.timer = setTimeout(function() {
 				self.close();
 			}, +params.time||3000);
 		}
 	}

 	function hideWin() {
 		var winObj = this.getWinNode(), params = this.getParams();
 		this.isShow = false;
 		showList.splice(showList.indexOf(this), 1);
 		this.timer && clearTimeout(this.timer);

 		if(params.disposable) {
 			winObj.parentNode.removeChild(winObj);
 		} else {
	 		tool.addClass(winObj, "dialog-hidden");
	 		setSite.call(this);
 		}

 		if(params.mark) {
 			showMarkCount--;
 			!markIsShow && !showMarkCount && tool.addClass(markObj, "mark-hidden");
 		}
 	}

 	function setSite(show, zIndex) {
 		var winObj = this.getWinNode(),
 			params = this.getParams();

 		if(show) {
	 		if(params.width) {
	 			winObj.style.width = params.width + "px";
	 		}

	 		if(params.height) {
	 			winObj.style.height = params.height + "px";
	 		}

	 		var screenWidth = document.documentElement.clientWidth || document.body.clientWidth,
	 			screenHeight = document.documentElement.clientHeight || document.body.clientHeight;

	 		winObj.style.left = (screenWidth-winObj.offsetWidth)/2 + "px";
	 		winObj.style.top = (screenHeight-winObj.offsetHeight)/2 + "px";
	 		zIndex && (winObj.style.zIndex = zIndex);
 		} else {
 			tool.removeAttr(winObj, "style");
 		}
 	}

 	function Win() {
 		this.name = "Win";
 	}

 	Win.prototype = {
 		constructor: Win,
 		open: function() {
 			if(this.isShow) return ;
 			showWin.call(this);
 		},
 		close: function() {
 			if(!this.isShow) return ;
 			var self = this;
 			var params = this.getParams();

 			if(params.beforeClose.call(this)) {
 				hideWin.call(this);
 				setTimeout(function() {
 					params.afterClose.call(self);
 				}, 0);
 			}
 		},
 		hide: function() {
 			hideWin.call(this);
 		}
 	};

 	function Alert(config) {
 		if(!this instanceof Alert) {
 			return new Alert(config);
 		}
 		this.name = "Alert";
 		this.isShow = false;
 		var params = tool.deepCopy(defaultConfig, config, true);

 		this.getParams = function() {
 			return params;
 		};

 		buildWin.call(this, params);
 	}

 	Alert.prototype = new Win();
 	Alert.prototype.constructor = Alert;

 	function Confirm(config) {
 		if(!this instanceof Confirm) {
 			return new Confirm(config);
 		}
 		this.name = "Confirm";
 		this.isShow = false;
 		var params = tool.deepCopy(defaultConfig, config, true);

 		this.getParams = function() {
 			return params;
 		};

 		buildWin.call(this, params);
 	}

 	Confirm.prototype = new Win();
 	Confirm.prototype.constructor = Confirm;

 	Confirm.prototype.cancel = function() {
 		if(!this.isShow) return ;
		var params = this.getParams();

		if(params.beforeCancel.call(this)) {
			hideWin.call(this);
			params.afterCancel.call(this);
		}
 	};

 	function Tip() {
 		if(!this instanceof Tip) {
 			return new Tip(arguments);
 		}

 		this.name = "Tip";
 		this.isShow = false;

 		var args = [].slice.call(arguments[0], 0),
 			config = {
 				content: args.shift(),
 				auto: true,
 				footer: false,
 				afterClose: args.pop(),
 				time: args.shift(),
 				mark: false
 			};

 		if(!isNaN(config.afterClose)) {
 			config.time = config.afterClose;
 			delete config.afterClose;
 		}

 		var params = tool.deepCopy(defaultConfig, config, true);

 		this.getParams = function() {
 			return params;
 		};

 		buildWin.call(this, params);
 	}

 	Tip.prototype = new Win();
 	Tip.prototype.constructor = Tip;

 	window.win = {
 		alert: function(params) {
 			if(!params) return ;
 			params = "[object String]"===toString.call(params)?{content:params}:params;
 			var alertObj = new Alert(params);
 			params = alertObj.getParams();
 			return params.disposable?null:alertObj;
 		},
 		confirm: function(params) {
 			if(!params) return ;
 			params = "[object String]"===toString.call(params)?{content:params}:params;
 			var confirmObj = new Confirm(params);
 			params = confirmObj.getParams();
 			return params.disposable?null:confirmObj;
 		},
 		tip: function() {
 			new Tip(arguments);
 		}
 	};
 }(window.tool, void(0)));