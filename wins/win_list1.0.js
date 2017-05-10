;(function(fn, undefined) {
	"use strict";
	var duang = fn.call(this),
		doc = window.document,
		baseConfig = {
			id: "",
			header: true,
			footer: true,
			title: "提示",
			width: "auto",
			height: "auto",
			auto: false,
			time: 3000,
			content: "",
			position: 4,
			mask: false,
			isShow: false,
			closeBtn: false,
			sureBtn: true,
			close: function() {},
			sure: function() {}
		};

	var alertCount = 0,
		confirmCount = 0,
		noticeCount = 0,
		mask = null,
		maskCount = 0,
		showCount = 0;

	var baseHtml = "\
			<div id='$DIALOGID$' class='dialog-wrap dialog-hide'>\
				$HEADER$\
				<i class='dialog-close hide iconfont icon-close'></i>\
				<div class='dialog-inner-wrap'><div class='dialog-content-wrap'>$CONTENT$</div></div>\
				$FOOTER$\
			</div>";

	var headerHtml = "<div class='dialog-title-wrap'><h3 class='dialog-title'>$TITLE$</h3><i class='iconfont icon-close dialog-close'></i></div>",
		footerHtml = "<div class='btn-wrap'>$BTNS$</div>",
		closeBtnHtml = "<button class='btn btn-close ml10'>取消</button>",
		sureBtnHtml = "<button class='btn btn-primary btn-sure ml10'>确定</button>";

	var winFn = function(tool) {
		var tool = tool || (vm && vm.module["tool"]) || window.tool;
		
		function createMask() {
			mask = doc.createElement("DIV");
			mask.className = "dialog-mask hide";
			doc.body.appendChild(mask);
		}
		
		function showDialog(obj) {
			var options = obj.options;
			
			if(options.mask) {
				tool.replaceClass(mask, "hide", "show");
				maskCount++;
			}
			
			if(!isNaN(options.width)) {
				obj.winObj.style.width = options.width + "px";
			}
			
			if(!isNaN(options.height)) {
				obj.winObj.style.height = options.height + "px";
			}
			
			obj.winObj.style.zIndex = 1001 + showCount;
			tool.replaceClass(obj.winObj, "dialog-hide", "dialog-show");
			
			obj.rePosition();
			
			tool.addEvent(window, "resize", function() {
				if(options.isShow) {
					obj.rePosition();
				}
			});
			
			if(options.auto) {
				options.it = setTimeout(function() {
					obj.close();
				}, options.time);
			}
			
			showCount++;
			options.isShow = true;
		}
		
		var Win = function() {
			this.name = "Win";
			var self = this;
			
			this.init = function() {
				var options = self.options,
				btns = "";
				
				if(options.sureBtn) btns += sureBtnHtml;
				if(options.closeBtn) btns += closeBtnHtml;
				
				var winHtml = baseHtml.replace("$DIALOGID$", options.winId)
				.replace("$HEADER$", options.header?headerHtml:"")
				.replace("$TITLE$", options.title)
				.replace("$CONTENT$", options.content || (options.id && document.getElementById(options.id).innerHTML))
				.replace("$FOOTER$", options.footer?footerHtml:"")
				.replace("$BTNS$", btns);
				
				tool.insertHTML(doc.body, "BeforeEnd", winHtml);
				
				var winObj = doc.getElementById(options.winId),
				shutBtns = winObj.getElementsByClassName("dialog-close");
				
				self.closeBtn = winObj.getElementsByClassName("btn-close")[0];
				self.sureBtn = winObj.getElementsByClassName("btn-sure")[0];
				self.contentObj = winObj.getElementsByClassName("dialog-content-wrap")[0];
				self.innerWrap = winObj.getElementsByClassName("dialog-inner-wrap")[0];
				self.titleObj = winObj.getElementsByClassName("dialog-title-wrap")[0];
				self.winObj = winObj;
				
				var len = shutBtns.length;
				while(len--) {
					tool.addEvent(shutBtns[len], "click", function(){
						self.close();
					});
				}
				
				if(!options.header) {
					tool.removeClass(shutBtns[0], "hide");
				}
				
				if(options.mask && !mask) {
					createMask();
				}
			};
		};
		
		Win.prototype = {
				constructor: Win,
				open: function() {},
				close: function() {
					var self = this,
					options = self.options;
					
					options.close.call(self);
					self.hide();
					
					if(options.it) {
						clearTimeout(options.it);
					}
				},
				hide: function() {
					var self = this,
					options = self.options;
					
					if(!options.isShow) return ;
					
					tool.replaceClass(self.winObj, "dialog-show", "dialog-hide");
					self.winObj.style.cssText = "";
					self.innerWrap.style.cssText = "";
					
					if(options.mask && maskCount>0) {
						if(0===--maskCount) {
							tool.replaceClass(mask, "show", "hide");
						}
					}
					
					showCount--;
					options.isShow = false;
				},
				rePosition: function() {
					var self = this,
					options = self.options,
					bodyWidth = doc.body.clientWidth,
					bodyHeight = doc.body.clientHeight,
					dialogWidth = self.winObj.offsetWidth,
					dialogHeight = self.winObj.offsetHeight,
					_left = 0,
					_top = 0;
					
					if("notice"!==self.name) {
						_left = (bodyWidth-dialogWidth)/2>=0?(bodyWidth-dialogWidth)/2:0;
						_top = (bodyHeight-dialogHeight)/2>=0?(bodyHeight-dialogHeight)/2:0;
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
					
					if(!isNaN(options.height)) {
						self.innerWrap.style.height = self.winObj.clientHeight - self.titleObj.offsetHeight + "px";
					}
					self.winObj.style.left = _left + "px";
					self.winObj.style.top = _top + "px";
				},
				isShow: function() {
					return this.options.isShow;
				}
		};
		
// ================================================================Alert======================================================================
		var Alert = function(opts) {
			Win.call(this);
			this.name = "Alert";
			this.options = tool.deepCopy(baseConfig, {});
			this.options = tool.deepCopy(opts, this.options);
			this.options.winId = "myAlert_" + alertCount++;
			this.init();
			
			tool.addEvent(self.closeBtn, "click", function() {
				self.close();
			});
		};
		Alert.prototype = new Win();
		Alert.prototype.open = function(p1, p2) {
			var self = this,
			options = self.options;
			
			if(options.isShow) return ;
			
			if("function"!==typeof(p1) && "undefined"!==typeof(p1) && null!=p1) {
				self.contentObj.innerHTML = p1;
				
				if(self.sureBtn) {
					self.sureBtn.onclick = function() {
						if("function"===typeof(p2)) {
							p2.call(self);
						} else {
							options.sure.call(self);
						}
						self.hide();
					};
				}
			} else if("function"===typeof(p1)) {
				if(self.sureBtn) {
					self.sureBtn.onclick = function() {
						p1.call(self);
						self.hide();
					};
				}
			} else {
				if(self.sureBtn) {
					self.sureBtn.onclick = function() {
						options.sure.call(self);
						self.hide();
					};
				}
			}
			
			showDialog(self);
		};
// ================================================================Alert======================================================================
		
// ================================================================Confirm======================================================================
		var Confirm = function(opts) {
			Win.call(this);
			this.name = "Confirm";
			this.options = tool.deepCopy(baseConfig, {});
			this.options.closeBtn = true;
			this.options = tool.deepCopy(opts, this.options);
			this.options.winId = "myConfirm_" + confirmCount++;
			this.init();
		};
		Confirm.prototype = new Win();
		Confirm.prototype.open = function(p1, p2, p3) {
			var self = this,
			options = self.options;
			
			if(options.isShow) return ;
			
			if("function"!==typeof(p1) && "undefined"!==typeof(p1) && null!=p1) {
				self.contentObj.innerHTML = p1;
				
				if(self.sureBtn) {
					self.sureBtn.onclick = function() {
						if("function"===typeof(p2)) {
							p2.call(self);
						} else {
							options.sure.call(self);
						}
						self.hide();
					};
				}
				
				if(self.closeBtn) {
					self.closeBtn.onclick = function() {
						if("function"===typeof(p3)) {
							p3.call(self);
							self.hide();
						} else {
							self.close();
						}
					};
				}
			} else {
				if(self.sureBtn) {
					self.sureBtn.onclick = function() {
						p1.call(self);
						self.hide();
					};
				}
				
				if(self.closeBtn) {
					self.closeBtn.onclick = function() {
						if("function"===typeof(p2)) {
							p2.call(self);
							self.hide();
						} else {
							self.close();
						}
					};
				}
			}
			
			showDialog(self);
		};
// ================================================================Confirm======================================================================
		
// ================================================================Notice======================================================================
		var Notice = function(opts) {
			Win.call(this);
			this.name = "Notice";
			this.options = tool.deepCopy(baseConfig, {});
			this.options.footer = false;
			this.options = tool.deepCopy(opts, this.options);
			this.options.winId = "myNotice_" + noticeCount++;
			this.init();
		};
		Notice.prototype = new Win();
// ================================================================Notice======================================================================
		
		return {
			alert: function(opts) {
				return new Alert(opts);
			},
			confirm: function(opts) {
				return new Confirm(opts);
			},
			notice: function(opts) {
				return new Notice(opts);
			}
		};
	};
	
	void 0!==duang?(function() {
		duang.module("Tool", []).controller("win", ["tool"], winFn);
	}()):(function() {
		window.vm = window.vm || {};
		window.vm.module = window.vm.module || {};
		window.vm.module["win"] = winFn();
	}());
})(function() {
	return window.duang || void 0;
});