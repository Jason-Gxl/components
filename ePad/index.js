;(function() {
	"use strict";
	var vm = window.vm || {},
		toString = Object.prototype.toString,
		padMap = {},
		padCount = 0,
		padTab = [],
		isMobile = /\bmobile\b/i.test(navigator.userAgent),
		layoutClassMap = {
			leftTop: "left-top",
			rightTop: "right-top",
			rightBottom: "right-bottom",
			leftBottom: "left-bottom"
		},
		defaultConfig = {
			layout: "leftTop",
			size: "100%",
			vertical: false,
			disable: false,
			wrap: document.body,
			autoSaveTime: 10,
			saveImgStep: 5,
			color: "#000",
			background: "#fff",
			eraserSize: 5,
			ferulaSize: 5,
			toolbars: ["ferula", "pen", "line", "rectangle", "round", "text", "image", "eraser", "export", "clear", "color"]
			//toolbars: ["ferula", "ellipesstroke", "rectstroke", "pen", "eraser", "rect", "ellipes", "text", "line", "arrow", "color", "export", "scissors", "clear", "enlarge", "file", "handPad"]
		},
		childToolbars = {
			rectangle: ["rectstroke", "rect"],
			line: ["line", "arrow"],
			round: ["circle", "roundel", "ellipesstroke", "ellipes"],
			eraser: ["circular", "quadrate"]
		},
		titles = {
			ferula: "教鞭",
			circle: "空心圆",
			roundel: "实心圆",
			ellipesstroke: "空心椭圆", 
			rectstroke: "空心矩形", 
			pen: "画笔",
			circular: "圆形橡皮擦",
			quadrate: "方形橡皮擦",
			rect:'实心矩形',
			ellipes: '实心椭圆',
			text: "文本",
			line: "直线", 
			arrow: "箭头", 
			color: "颜色", 
			export: "导出", 
			scissors:"截图",
			clear: "清空",
			image: "图片"
		},
		classes = {
			ferula: "icon-teach-rod",
			circle: "icon-round-a",
			roundel: "icon-round-c",
			ellipesstroke: "icon-ellipse-b",
			rectstroke: "icon-rectangle-a",
			pen: "icon-pen",
			circular: "icon-xiangpica",
			quadrate: "icon-rubber",
			rect: "icon-rectangle-c",
			ellipes: "icon-ellipse-a",
			text: "icon-font",
			line: "icon-line",
			arrow: "icon-arrow",
			color: "icon-colour",
			export: "icon-keep",
			scissors: "icon-screenshot",
			clear: "icon-empty",
			image: "icon-pic"
		},
		tabNameMap = {
			0: "白板",
			1: "文档演示"
		};

	var tpl1 = '\
		<div class="pad-wrap $LAYOUT$ $DISABLED$">\
			<div class="toolbar-wrap">\
				<ul class="toolbar-list">$TOOLBARS$</ul>\
			</div>\
			<div class="can-wrap-outer">\
				<div class="can-wrap">\
					<input type="text" class="text-input tool-input"/>\
					<canvas class="main-can">抱歉！您的浏览器版本太低，暂时不支持此白板！</canvas>\
					<canvas class="buffer-can-4"></canvas>\
					<canvas class="buffer-can-3"></canvas>\
					<canvas class="buffer-can-2"></canvas>\
					<canvas class="buffer-can-1"></canvas>\
					<div class="split-page-wrap"></div>\
				</div>\
				<div class="scroll-y-wrap pad-hide"><span class="scroll-y scroll-toolbar"></span></div>\
				<div class="scroll-x-wrap pad-hide"><span class="scroll-x scroll-toolbar"></span></div>\
			</div>\
			<div class="pad-tab-wrap">\
				<ul class="pad-tab-list"></ul>\
			</div>\
			<input type="file" accept="image/png, image/jpeg" class="file-input tool-input"/>\
			<input type="color" class="color-input tool-input"/>\
		</div>';

	var tpl2 = '<li class="toolbar-item" title="$TITLE$"><span class="item-icon iconfont $ICONCLASS$" item="$ITEM$" level="$LEVEL$"></span>$CHILDTOOLBARS$</li>';

	var tpl3 = '<ul class="child-toolbar-list">$CHILDTOOLBARITEM$</ul>';

	var tpl4 = '\
		<div>\
			<a href="javascript:void(0);" class="pre-page-btn">上一页</a>\
			<a href="javascript:void(0);" class="next-page-btn">下一页</a>\
			<span>第<input type="text" class="page-number-input"/>页<a href="javascript:void(0);" class="go-page-btn">GO</a></span>\
		</div>';

	vm.module = vm.module || {};

	var ele = {
		addEvent: window.addEventListener?function(target, type, fn, use) {
			target.addEventListener(type, fn, use||false);
		}:function(target, type, fn) {
			target.attachEvent("on"+type, fn);
		},
		delEvent: window.addEventListener?function(target, type, fn, use) {
			target.removeEventListener(type, fn, use||false);
		}:function(target, type, fn) {
			target.detachEvent("on"+type, fn);
		},
		addClass: function(ele, className) {
			if(ele===void(0) || className===void(0)) return ;
			var reg = new RegExp("\\b"+className+"\\b", "g");

			if(!reg.test(ele.className)) {
				ele.className = ele.className + " " + className;
			}
		},
		removeClass: function(ele, className) {
			if(ele===void(0) || className===void(0)) return ;
			var reg = new RegExp("\\b"+className+"\\b", "g");

			if(reg.test(ele.className)) {
				ele.className = ele.className.replace(reg, "");
			}
		},
		preNode: function(ele) {
			return ele.previousElementSibling || ele.previousSibling;
		},
		nextNode: function(ele) {
			return ele.nextElementSibling || ele.nextSibling;
		},
		css: function(ele, attrName, attrValue) {
			ele.style[attrName] = attrValue || "";
		}
	};

	var scroll = (function() {
		var moveEvent = function() {
			var args = [].slice.call(arguments, 0),
				e = args[0] || window.event,
				type = moveEvent.type,
				node = moveEvent.node,
				rect = node.offsetParent.getBoundingClientRect();

			if(0===type) {
				var val = e.x - moveEvent.dValue - rect.x;
				val = 0>val?0:(val + node.offsetWidth>rect.width?rect.width-node.offsetWidth:val);
				node.style.left = val + "px";
			} else {
				var val = e.y - moveEvent.dValue - rect.y;
				val = 0>val?0:(val + node.offsetHeight>rect.height?rect.height-node.offsetHeight:val);
				node.style.top = val + "px";
			}

			moveEvent.callback(val);
		};

		return {
			init: function(node, type, callback) {
				ele.addEvent(node, "mousedown", function() {
					var args = [].slice.call(arguments, 0),
						e = args[0] || window.event,
						start = 0===type?e.x:e.y,
						rect = this.getBoundingClientRect();

					moveEvent.type = type;
					moveEvent.node = this;
					moveEvent.callback = callback;
					moveEvent.dValue = start - (0===type?rect.x:rect.y);
					ele.addEvent(document, "mousemove", moveEvent);

					ele.addEvent(document, "mouseup", function() {
						ele.delEvent(document, "mousemove", moveEvent);
					});
				});				
			}
		};
	}());

	var data = {
		get uuid() {
			var len = 20, str = ""
			for(;str.length<len;str+=Math.random().toString().substr(2));
			return str.substr(0, len);
		},
		copy: function() {
			var args = [].slice.call(arguments, 0),
				firstArg = args.shift(),
				len = args.length;

			if(len) {
				var type = toString.call(firstArg);
				if("[object Object]"!=type && "[object Array]"!=type) return firstArg;

				args.forEach(function(arg) {
					var _type = toString.call(arg);
					if("[object Object]"!=_type && "[object Array]"!=_type) return ;

					if("[object Object]"===_type) {

						if("[object Array]"===type) {
							var container = {};
						}

						for(var key in arg) {
							var val = arg[key],
								type = toString.call(val);

							if(container) {
								if("[object Object]"===type || "[object Array]"===type) {
									container[key] = data.copy(val);
								} else {
									container[key] = val;
								}
							} else {
								if("[object Object]"===type || "[object Array]"===type) {
									firstArg[key] = data.copy(val);
								} else {
									firstArg[key] = val;
								}
							}							
						}

						if(container) {
							firstArg.push(container);
						}
					} else {
						arg.forEach(function(item, index) {
							var _type = toString.call(item);

							if("[object Object]"===type) {
								if("[object Object]"===_type || "[object Array]"===_type) {
									firstArg[index] = data.copy(val);
								} else {
									firstArg[index] = val;
								}
							} else {
								if("[object Object]"===_type || "[object Array]"===_type) {
									firstArg.push(data.copy(val));
								} else {
									firstArg.push(val);
								}
							}
						});
					}
				});

				return firstArg;
			} else {
				var type = toString.call(firstArg);

				if("[object Object]"!=type && "[object Array]"!=type) {
					return firstArg;
				} else {
					if("[object Object]"===type) {
						var container = {};

						for(var key in firstArg) {
							var val = firstArg[key],
								type = toString.call(val);

							if("[object Object]"===type || "[object Array]"===type) {
								container[key] = data.copy(val);
							} else {
								container[key] = val;
							}
						}
					} else {
						var container = [];

						firstArg.forEach(function(item) {
							var type = toString.call(item);

							if("[object Object]"===type || "[object Array]"===type) {
								container.push(data.copy(item));
							} else {
								container.push(item);
							}
						});
					}					
				}

				return container;
			}
		},
		saveAsImage: function(_data, type) {
			var self = this,
				count = 0,
				arr = [],
				file = null,
				len = _data.length,
				mainCanvas = self.mainCanvas,
				activeTab = self.tab.getActive(),
				createImageCanvas = self.createImageCanvas;

			var _createImage = function() {
				var imgData=createImageCanvas.toDataURL(),
					page = self.tab.getPage(activeTab.id);
				createImageCanvas.width = createImageCanvas.width;

				var _data_ = {
					data: [imgData, 0, 0],
					type: "image",
					width: 0,
					height: 0,
					status: 1, 
					origin: true,
					from: "auto"
				};

				if(page) {
					_data_.pageNumber = page.getPageNumber();
				}

				file && _data.push(file);
				_data.push(_data_);
				[].push.apply(_data, arr);
				self.tab.saveData.call(self);
			};

			var next = function(list) {
				var d = list.shift();
				if(!d) return _createImage();

				if("file"===d.type) {
					file = d;
					next(list);
				} else {
					data.render.call(self, d, function() {
						next(list);
					}, true);
				}
			};

			while(len--) {
				var d = _data.pop();
				arr.unshift(d);
				d.origin && count++;

				if(self.params.saveImgStep<=count) {
					createImageCanvas.width = createImageCanvas.width;

					if(_data.length) {
						next(_data);
					} else {
						[].push.apply(_data, arr);
					}

					break;
				}
			}
		},
		trim: function(content) {
			if(!content || "[object String]"!=toString.call(content)) return ;
			return content.replace(/^\s*|\s*$/, "");
		},
		splitPage: function(_data) {
			var obj = {},
				keys = [],
				list = [];

			_data.forEach(function(d) {
				if("[object String]"===toString.call(d)) {
					list.push(d);
				} else {
					obj[d.pageNumber] = obj[d.pageNumber] || [];
					obj[d.pageNumber].push(d);
				}
			});

			for(var key in obj) {
				keys.push(key);
			}

			keys.sort();

			keys.forEach(function(key) {
				list.push(obj[key]);
			});

			return list;
		},
		renderPen: function(params, callback, isCreateImage) {
			var self = this,
				canvas = isCreateImage?self.createImageCanvas:(0===params.status?self.bufferCanvas:self.mainCanvas),
				data = params.data,
				ctx = canvas.getContext("2d");
			
			ctx.strokeStyle = params.color;
			ctx.lineWidth = 1;

			if(params.origin) {
				ctx.beginPath();
				ctx.moveTo(data.x, data.y);
			} else {
				ctx.lineTo(data.x, data.y);
				ctx.stroke();
			}

			if(0!=params.status && params.origin) self.bufferCanvas.width = self.bufferCanvas.width;
			ctx.save();
			callback && callback();
		},
		renderRect: function(params, callback, isCreateImage) {
			var self = this,
				mode = params.mode,
				canvas = isCreateImage?self.createImageCanvas:(0===params.status?self.bufferCanvas:self.mainCanvas),
				data = params.data,
				ctx = canvas.getContext("2d");

			if(0===params.status) {
				canvas.width = canvas.width;
			} else {
				self.bufferCanvas.width = self.bufferCanvas.width;
			}

			if(0===params.mode) {
				ctx.strokeStyle = params.color;
				ctx.lineWidth = 1;
				ctx.strokeRect(data[0], data[1], data[2], data[3]);
			} else {
				ctx.fillStyle = params.color;
				ctx.fillRect(data[0], data[1], data[2], data[3]);
			}

			ctx.save();
			callback && callback();
		},
		renderLine: function(params, callback, isCreateImage) {
			var self = this,
				mode = params.mode,
				canvas = isCreateImage?self.createImageCanvas:(0===params.status?self.bufferCanvas:self.mainCanvas),
				data = params.data,
				ctx = canvas.getContext("2d");

			if(0===params.status) {
				canvas.width = canvas.width;
			} else {
				self.bufferCanvas.width = self.bufferCanvas.width;
			}

			ctx.strokeStyle = params.color;
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(data[0], data[1]);
			ctx.lineTo(data[2], data[3]);
			ctx.stroke();
			ctx.save();
			callback && callback();
		},
		renderRound: function(params, callback, isCreateImage) {
			var self = this,
				mode = params.mode,
				canvas = isCreateImage?self.createImageCanvas:(0===params.status?self.bufferCanvas:self.mainCanvas),
				data = params.data,
				ctx = canvas.getContext("2d");

			if(0===params.status) {
				canvas.width = canvas.width;
			} else {
				self.bufferCanvas.width = self.bufferCanvas.width;
			}
			
			ctx.beginPath();

			switch(mode) {
				case 0:
				ctx.strokeStyle = params.color;
				ctx.lineWidth = 1;
				ctx.arc(data[0], data[1], data[2], 0, 2*Math.PI);
				ctx.stroke();
				break;
				case 1:
				ctx.fillStyle = params.color;
				ctx.arc(data[0], data[1], data[2], 0, 2*Math.PI);
				ctx.fill();
				break;
				case 2:
				break;
				case 3:
				break;
			}

			ctx.save();
			callback && callback();
		},
		renderText: function(params, callback, isCreateImage) {
			var self = this,
				canvas = isCreateImage?self.createImageCanvas:(0===params.status?self.bufferCanvas:self.mainCanvas),
				data = params.data,
				ctx = canvas.getContext("2d");

			if(0===params.status) {
				canvas.width = canvas.width;
			} else {
				self.bufferCanvas.width = self.bufferCanvas.width;
			}
			
			ctx.beginPath();
			ctx.fillStyle = params.color;
			ctx.fillText(data[2], data[0], data[1]);
			ctx.save();
			callback && callback();
		},
		renderImage: function(params, callback, isCreateImage) {
			var self = this,
				canvas = isCreateImage?self.createImageCanvas:(0===params.status?self.bufferCanvas:self.mainCanvas),
				data = params.data,
				img = new Image(),
				ctx = canvas.getContext("2d");

			img.src = data[0];
			var cw = canvas.clientWidth, ch = canvas.clientHeight;

			img.onload = function() {
				var imgWidth = img.width, 
					imgHeight = img.height,
					dw = cw - img.width, 
					dh = ch - img.height;

				data.width = imgWidth;
				data.height = imgHeight;

				if(dw>=0 && dh>=0) {
					ctx.drawImage(img, dw/2, dh/2);
				} else {
					var cwhp = cw/ch, iwhp = img.width/img.height;

					if(cwhp>iwhp) {
						ctx.drawImage(img, (cw-ch*iwhp)/2, 0, ch*iwhp, ch);
					} else {
						ctx.drawImage(img, 0, (ch-cw/iwhp)/2, cw, cw/iwhp);
					}
				}

				ctx.save();
				callback && callback();
			};
		},
		delete: function(params, callback, isCreateImage) {
			var self = this,
				canvas = isCreateImage?self.createImageCanvas:(0===params.status?self.bufferCanvas:self.mainCanvas),
				data = params.data,
				ctx = canvas.getContext("2d");
			
			ctx.strokeStyle = self.params.background;
			ctx.lineWidth = data.size;
			ctx.fillStyle = self.params.background;

			if(0===params.mode) {
				ctx.lineJoin = "round";
				ctx.lineCap = "round";
			} else {
				ctx.lineCap = "square";
				ctx.lineJoin = "bevel";
			}

			if(params.origin) {
				ctx.beginPath();
				ctx.moveTo(data.x, data.y);
				ctx.lineTo(data.x, data.y);
				if(0!=params.status) self.bufferCanvas.width = self.bufferCanvas.width;
			} else {
				ctx.lineTo(data.x, data.y);
			}

			ctx.stroke();
			ctx.save();
			callback && callback();
		},
		render: function(_data, callback, isCreateImage) {
			var self = this, type = _data.type;

			switch(type) {
				case "pen":
				data.renderPen.call(self, _data, callback, isCreateImage);
				break;
				case "rectangle":
				data.renderRect.call(self, _data, callback, isCreateImage);
				break;
				case "line":
				data.renderLine.call(self, _data, callback, isCreateImage);
				break;
				case "round":
				data.renderRound.call(self, _data, callback, isCreateImage);
				break;
				case "text":
				data.renderText.call(self, _data, callback, isCreateImage);
				break;
				case "image":
				data.renderImage.call(self, _data, callback, isCreateImage);
				break;
				case "file":
				data.renderImage.call(self, _data, callback, isCreateImage);
				break;
				case "eraser":
				data.delete.call(self, _data, callback, isCreateImage);
			}
		}
	};

	var mouse = {
		eraser: function(params) {
			var self = this,
				canvas = self.mouseIconCanvas,
				data = params.data,
				mode = params.mode,
				ctx = canvas.getContext("2d");

			canvas.width = canvas.width;
			ctx.beginPath();

			if(0===mode) {
				ctx.arc(data[0], data[1], data[2]/2, 0, 2*Math.PI);
				ctx.stroke();
			} else {
				var px = data[0]-data[2]/2,
					py = data[1]-data[2]/2;
				ctx.rect(px, py, data[2], data[2]);
				ctx.stroke();
			}
		},
		ferula: function(params) {
			var self = this,
				canvas = self.mouseIconCanvas,
				data = params.data,
				ferulaSize = self.params.ferulaSize,
				ctx = canvas.getContext("2d");

			canvas.width = canvas.width;
			ctx.beginPath();
			ctx.fillStyle = "red";
			ctx.arc(data[0], data[1], ferulaSize, 0, 2*Math.PI);
			ctx.fill();
		},
		render: function(_data) {
			var self = this, type = _data.type;
			mouse[type] && mouse[type].call(self, _data);
		}
	};

	var Tab = (function() {
		var UL = document.createElement("UL"),
			tabTpl = '<li class="pad-tab-item">$LABEL$$DELETEBTN$</li>',
			delTpl = '<i class="iconfont icon-close"></i>';

		function _tab(wrap) {
			var self = this,
				tabMap = {},
				dataMap = {},
				canvasMap = {},
				activeObj = {},
				idList = [],
				saving = false,
				pageMap = {},
				stepCountMap = {},
				tabWrap = wrap.getElementsByClassName("pad-tab-list")[0];

			self.build = function(canvas, type, _data, id, del) {
				if(!canvas) return ;
				var that = this,
					_id = id || (0===type?0:data.uuid),
					_tabTpl = tabTpl.replace(/\$LABEL\$/g, tabNameMap[type]).replace(/\$DELETEBTN\$/g, del?delTpl:"");

				UL.innerHTML = _tabTpl;
				idList.push(_id);
				var li = UL.firstElementChild || UL.firstChild;

				tabMap[_id] = li;
				dataMap[_id] = _data || [];
				canvasMap[_id] = canvas;

				if(del) {
					ele.addEvent(li.getElementsByTagName("i")[0], "click", function() {
						var args = [].slice.call(arguments, 0),
						 	e = args[0] || window.event;
						
						if(window.event) {
							e.returnValue = false;
							e.cancelBubble = true;
						} else {
							e.preventDefault();
							e.stopPropagation();
						}

						self.remove.call(that, _id);
						that.params.onTabRemove && that.params.onTabRemove(_id);
					});
				}

				ele.addEvent(li, "click", function() {
					if(this===activeObj.tab) return ;
					that.params.onTabChange && that.params.onTabChange(_id);
					self.active.call(that, _id);
				});

				id++;
				tabWrap.appendChild(li);

				that.container[_id] = {
					data: dataMap[_id],
					type: type,
					splitPage: 0,
					del: del
				};

				return _id;
			};

			self.push = function(id, _data) {
				var self = this;
				if(!dataMap[id]) dataMap[id] = [];
				dataMap[id].push(_data);
				self.tab.saveData.call(self);

				if(_data.origin) {
					var _count = stepCountMap[id] || 0;
					_count++;

					if(_count>=self.params.saveImgStep) {
						stepCountMap[id] = 0;
						data.saveAsImage.call(self, dataMap[id], self.container[id].type);
					} else {
						stepCountMap[id] = _count;
					}
				}
			};

			self.saveData = function() {
				var self = this;
				if(saving || "never"===self.params.autoSaveTime) return ;
				self.params.autoSaveTime = isNaN(self.params.autoSaveTime)?10:+self.params.autoSaveTime;

				var it = setTimeout(function() {
					for(var key in pageMap) {
						var page = pageMap[key];
						dataMap[key].length = 0;
						[].push.apply(dataMap[key], page.getData());
					}

					window.localStorage.setItem(self.id+"_pad", JSON.stringify(self.container));
					clearTimeout(it);
					saving = false;
				}, self.params.autoSaveTime*1000);

				saving = true;
			};

			self.remove = function(_id) {
				var self = this,
					li = tabMap[_id],
					index = idList.indexOf(_id);
				delete tabMap[_id];
				delete dataMap[_id];
				delete canvasMap[_id];
				delete self.container[_id];

				if(pageMap[_id]) {
					pageMap[_id].hide();
					delete pageMap[_id];
				}

				tabWrap.removeChild(li);
				idList.splice(index, 1);
				_id = idList[index-1>=0?index-1:0];
				self.tab.active.call(self, _id);
				window.localStorage.setItem(self.id+"_pad", JSON.stringify(self.container));
			};

			self.active = function(_id) {
				var self = this, _data = dataMap[_id];

				if(activeObj.canvas) {
					ele.css(activeObj.canvas, "zIndex");
					ele.removeClass(activeObj.tab, "active");
				}

				if(activeObj.page) {
					activeObj.page.hide();
					delete activeObj.page;
				}

				activeObj.tab = tabMap[_id];
				activeObj.data = dataMap[_id];
				activeObj.canvas = canvasMap[_id];
				activeObj.id = _id;
				activeObj.type = self.container[_id].type;
				activeObj.page = pageMap[_id];
				self.mainCanvas = activeObj.canvas;
				ele.css(activeObj.canvas, "zIndex", 2);
				ele.addClass(activeObj.tab, "active");
				activeObj.page && activeObj.page.show();

				if(_data && !activeObj.page) {
					activeObj.canvas.width = activeObj.canvas.width;
					var i = 0, len = _data.length;

					var next = function() {
						var d = _data[i];

						d && data.render.call(self, d, function() {
							i++;
							i<len && next();
						});
					};

					next();
				}
			};

			self.getActive = function() {
				return activeObj;
			};

			self.getTab = function(id) {
				return tabMap[id];
			};

			self.clear = function(id) {
				var self = this;

				if(void(0)===id) {
					activeObj.data.length = 0;
					self.container[activeObj.id].splitPage = 0;
					activeObj.canvas.width = activeObj.canvas.width;

					if(activeObj.page) {
						activeObj.page.hide();
						delete activeObj.page;
					}
				} else {
					dataMap[id].length = 0;
					self.container[id].splitPage = 0;
					canvasMap[id].width = canvasMap[id].width;

					if(pageMap[id]) {
						pageMap[id].hide();
						delete pageMap[id];
					}
				}

				window.localStorage.setItem(self.id+"_pad", JSON.stringify(self.container));
			};

			self.setPage = function(id, page) {
				var that = this;
				pageMap[id] = page;
				that.container[id].splitPage = 1;
			};

			self.getPage = function(id) {
				return pageMap[id];
			};
		}

		_tab.prototype = {
			constructor: _tab
		};

		return _tab;
	}());

	function Page(params) {
		if(!this instanceof Page) {
			return new Page(params);
		}

		var self = this,
			stepCountMap = {},
			currentPage = 1,
			that = params.that,
			_data = data.splitPage(params.data),
			total = _data.length,
			tabId = params.tabId,
			show = params.show || false,
			div = document.createElement("DIV"),
			pageWrap = that.params.wrap.getElementsByClassName("split-page-wrap")[0];

		div.innerHTML = tpl4;
		var pageEle = div.removeChild(div.firstElementChild || div.firstChild),
			prePageBtn = pageEle.getElementsByClassName("pre-page-btn")[0],
			nextPageBtn = pageEle.getElementsByClassName("next-page-btn")[0],
			goPageBtn = pageEle.getElementsByClassName("go-page-btn")[0],
			pageNumberInput = pageEle.getElementsByClassName("page-number-input")[0];

		ele.addEvent(prePageBtn, "click", function() {
			if(that.params.disable || currentPage<=1) return ;
			self.pre();
		});

		ele.addEvent(nextPageBtn, "click", function() {
			if(that.params.disable || currentPage>=total) return ;
			self.next();
		});

		ele.addEvent(goPageBtn, "click", function() {
			if(that.params.disable) return ;
			var pageNumber = pageNumberInput.value;
			self.go(pageNumber);
		});

		this.pre = function() {
			currentPage--;
			this.go(currentPage);
		};

		var render = function(pageNumber, start) {
			var __data = _data[pageNumber-1];

			if("[object Array]"===toString.call(__data)) {
				__data.some(function(d, index) {
					if(index<start) return ;
					var flag = false;

					if("file"===d.type) {
						flag = true;

						data.render.call(that, d, function() {
							render(pageNumber, ++index);
						});
					} else {
						data.render.call(that, d);
					}

					return flag;
				});
			} else {
				data.render.call(that, __data);
			}
		};

		this.go = function(pageNumber, out) {
			pageNumber = pageNumber<=1?1:pageNumber;
			pageNumber = pageNumber>=total?total:pageNumber;
			that.mainCanvas.width = that.mainCanvas.width;
			render(pageNumber, 0);
			currentPage = pageNumber;
			pageNumberInput.value = pageNumber;

			switch(true) {
				case currentPage<=1 && currentPage<total:
					ele.addClass(prePageBtn, "no");
					ele.removeClass(nextPageBtn, "no");
					break;
				case currentPage>1 && currentPage>=total:
					ele.removeClass(prePageBtn, "no");
					ele.addClass(nextPageBtn, "no");
					break;
				default:
					ele.removeClass(prePageBtn, "no");
					ele.removeClass(nextPageBtn, "no");
			}

			!out && that.params.onPageTurn && that.params.onPageTurn(tabId, pageNumber, _data[pageNumber-1][0]);
		};

		this.next = function() {
			currentPage++;
			this.go(currentPage);
		};

		this.show = function() {
			pageWrap.innerHTML = "";
			_data.length>1 && pageWrap.appendChild(pageEle);
			that.page = self;
			this.go(currentPage);
		};

		this.hide = function() {
			if(that.page!=self) return ;
			_data.length>1 && pageWrap.removeChild(pageEle);
			delete that.page;
		};

		this.getPageNumber = function() {
			return currentPage;
		};

		this.empower = function() {
			pageNumberInput.removeAttribute("readonly");
		};

		this.disable = function() {
			pageNumberInput.setAttribute("readonly", "readonly");
		};

		_data.forEach(function(d, i) {
			if("[object String]"===toString.call(d)) {
				_data[i] = [{
					data: [d, 0, 0],
					pageNumber: i+1,
					width: that.params.width,
					height: that.params.height,
					status: 1,
					type: "file",
					from: params.from
				}];
			}
		});

		this.push = function(d) {
			var activeTab = that.tab.getActive();
			d.pageNumber = currentPage;
			_data[currentPage-1].push(d);
			that.tab.saveData.call(that);

			if("file"!=d.type && d.origin) {
				var _count = stepCountMap[currentPage] || 0;
				_count++;

				if(_count>=that.params.saveImgStep) {
					stepCountMap[currentPage] = 0;
					data.saveAsImage.call(that, _data[currentPage-1], that.container[activeTab.id].type);
				} else {
					stepCountMap[currentPage] = _count;
				}
			}
		};

		this.getData = function() {
			var i = 0, arr = [];

			while(i<total) {
				[].push.apply(arr, _data[i]);
				i++;
			}

			return arr;
		};

		that.params.disable && this.disable();
		that.tab.saveData.call(that);

		if(show) {
			pageWrap.innerHTML = "";
			_data.length>1 && pageWrap.appendChild(pageEle);
			self.go(1);
		}
	}

	Page.prototype = {
		constructor: Page
	};

	function WPad(params) {
		if(!this instanceof WPad) {
			return new WPad(params);
		}

		var that = {
			pad: this,
			params: params,
			waitList: [],
			container: {},
			id: params.id || padCount++,
			render: function(_data) {
				data.render.call(that, _data);
				_data.width = that.mainCanvas.width;
				_data.height = that.mainCanvas.height;

				if(_data.status) {
					var activeTab = that.tab.getActive();

					if(activeTab.page) {
						activeTab.page.push.call(that, _data);
					} else {
						that.tab.push.call(that, activeTab.id, _data);
					}
				}

				if(params.onRender) {
					var outData = data.copy(_data), obj = {}, activeTab = that.tab.getActive();

					obj[activeTab.id] = {
						data: outData,
						type: activeTab.type,
						splitPage: activeTab.page?1:0
					};

					params.onRender(obj);
				}
			},
			mouseRender: function(_data) {
				mouse.render.call(that, _data);
				_data.width = that.mainCanvas.width;
				_data.height = that.mainCanvas.height;

				if(params.onMousemove) {
					var outData = data.copy(_data), obj = {}, activeTab = that.tab.getActive();

					obj[activeTab.id] = {
						data: outData,
						type: activeTab.type
					};

					params.onMousemove(obj);
				}
			}
		};
		
		buildPad.call(that);

		var render = function(_data) {
			var scaleWidth = null,
				scaleHeight = null,
				scaleArea = null,
				activeTab = that.tab.getActive();

			for(var key in _data) {
				var val = _data[key],
					type = val.type,
					val = val.data;

				if(!scaleWidth || !scaleHeight) {
					scaleWidth = that.mainCanvas.width/val.width;
					scaleHeight = that.mainCanvas.height/val.height;
					scaleArea = (that.mainCanvas.width*that.mainCanvas.height)/(val.width*val.height);
				}

				switch(val.type) {
					case "pen":
					val.data.x = val.data.x * scaleWidth;
					val.data.y = val.data.y * scaleHeight;
					break;
					case "text":
					val.data[0] = val.data[0] * scaleWidth;
					val.data[1] = val.data[1] * scaleWidth;
					break;
					case "image":

					break;
					case "file":

					break;
					case "eraser":
					val.data.x = val.data.x * scaleWidth;
					val.data.y = val.data.y * scaleHeight;
					val.data.size = val.data.size * scaleWidth;
					break;
					default:
					if(val.data[0]) val.data[0] = !isNaN(val.data[0])?val.data[0] * scaleWidth:val.data[0];
					if(val.data[1]) val.data[1] = !isNaN(val.data[1])?val.data[1] * scaleWidth:val.data[1];
					if(val.data[2]) val.data[2] = !isNaN(val.data[2])?val.data[2] * scaleWidth:val.data[2];
					if(val.data[3]) val.data[3] = !isNaN(val.data[3])?val.data[3] * scaleWidth:val.data[3];
				}

				if(key==activeTab.id) {
					data.render.call(that, val);

					if(val.status) {
						if(activeTab.page) {
							activeTab.page.push.call(that, val);
						} else {
							that.tab.push.call(that, key, val);
						}
					}
				} else {
					if(that.tab.getTab(key)) {
						if(val.status) {
							var page = that.tab.getPage(key);

							if(page) {
								page.push.call(taht, val, key);
							} else {
								that.tab.push.call(that, key, val);
							}
						}
					} else {
						that.tab.build.call(that, that.fileCanvas, 1, [val], key, false);
					}
				}
			}
		};

		var renderMouse = function(_data) {
			var scaleWidth = null,
				scaleHeight = null;

			for(var key in _data) {
				var val = _data[key],
					type = val.type,
					val = val.data;

				if(!scaleWidth || !scaleHeight) {
					scaleWidth = that.mainCanvas.width/val.width;
					scaleHeight = that.mainCanvas.height/val.height;
				}

				switch(val.type) {
					default:
					if(val.data[0]) val.data[0] = !isNaN(val.data[0])?val.data[0] * scaleWidth:val.data[0];
					if(val.data[1]) val.data[1] = !isNaN(val.data[1])?val.data[1] * scaleWidth:val.data[1];
					if(val.data[2]) val.data[2] = !isNaN(val.data[2])?val.data[2] * scaleWidth:val.data[2];
					if(val.data[3]) val.data[3] = !isNaN(val.data[3])?val.data[3] * scaleWidth:val.data[3];
				}

				mouse.render.call(that, val);
			}
		};

		this.render = function(_data) {
			if("[object Object]"!=toString.call(_data)) {
				console.error("TypeError: data must be Object");
				return ;
			}

			render(_data);
		};

		this.renderAll = function(dataArr) {
			if("[object Object]"!=toString.call(dataArr)) {
				console.error("TypeError: data must be Array");
				return ;
			}

			dataArr.forEach(function(_data) {
				render(_data);
			});
		};

		this.mouseCtrl = function(_data) {
			if("[object Object]"!=toString.call(_data)) {
				console.error("TypeError: data must be Object");
				return ;
			}

			renderMouse(_data);
		};

		this.clear = function(id) {
			that.tab.clear.call(that, id);
		};

		this.disable = function() {
			ele.addClass(params.wrap.firstElementChild||params.wrap.firstChild, "disabled");
			params.disable = true;
		};

		this.enable = function() {
			ele.removeClass(params.wrap.firstElementChild||params.wrap.firstChild, "disabled");
			params.disable = false;
		};

		this.createImage = function() {
			return that.mainCanvas.toDataURL();
		};

		this.changeTab = function(id) {
			that.tab.active.call(that, id);
		};

		this.turnPage = function(id, number) {
			var activeTab = that.tab.getActive();

			if(id===activeTab.id) {
				var pageObj = that.tab.getPage.call(that, id);
				pageObj.go(number, true);
			}
		};

		this.removeTab = function(id) {
			if(void(0)===id) return ;
			that.tab.remove.call(that, id);
		};

		ele.addEvent(params.wrap, "mouseenter", function() {
			that.active = true;
		});

		ele.addEvent(params.wrap, "mouseleave", function() {
			that.active = false;
		});
	}

	function buildPad() {
		var self = this,
			params = this.params,
			wrap = params.wrap,
			toolbars = params.toolbars,
			toolbarMap = {},
			handPad = false,
			current = null,
			curActiveNode = null,
			curActiveChildNode = null,
			fr = new FileReader(),
			active = false,
			scrollWrapY = null,
			scrollWrapX = null,
			scrollY = null,
			scrollX = null,
			toolbarStr = "";

		var colorInput = null,
			fileInput = null,
			textInput = null,
			mainCanvas = null,
			bufferCanvas1 = null,
			bufferCanvas2 = null,
			bufferCanvas3 = null,
			bufferCanvas4 = null;

		toolbars.forEach(function(toolbar) {
			var _childToolbars = childToolbars[toolbar];

			switch(toolbar) {
				case "handPad":

				break;
				case "color":

				break;
				case "clear":

				break;
				case "export":

				break;
				default:
				if(!_childToolbars) {
					toolbarMap[toolbar] = new vm.module[toolbar]({name: toolbar});
				} else {
					_childToolbars.forEach(function(_toolbar) {
						toolbarMap[_toolbar] = new vm.module[toolbar]({name: _toolbar});
					});
				}
			}

			var _tpl2 = tpl2.replace(/\$ITEM\$/g, !_childToolbars?toolbar:_childToolbars[0])
							.replace(/\$ICONCLASS\$/g, !_childToolbars?classes[toolbar]:classes[_childToolbars[0]])
							.replace(/\$TITLE\$/g, !_childToolbars?titles[toolbar]:titles[_childToolbars[0]])
							.replace(/\$LEVEL\$/g, 0);
				
			_tpl2 = _tpl2.replace(/\$CHILDTOOLBARS\$/g, !_childToolbars?"":tpl3);

			if(_childToolbars) {
				var childToolbarStr = "";

				_childToolbars.forEach(function(toolbar) {
					childToolbarStr += tpl2.replace(/\$ITEM\$/g, toolbar)
											.replace(/\$ICONCLASS\$/g, classes[toolbar])
											.replace(/\$TITLE\$/g, titles[toolbar])
											.replace(/\$CHILDTOOLBARS\$/g, "")
											.replace(/\$LEVEL\$/g, 1);
				});

				_tpl2 = _tpl2.replace(/\$CHILDTOOLBARITEM\$/g, childToolbarStr);
			}
			
			toolbarStr += _tpl2;
		});

		var __str__ = tpl1.replace(/\$LAYOUT\$/g, layoutClassMap[params.layout]+(params.vertical?" vertical":"")).replace(/\$TOOLBARS\$/g, toolbarStr).replace(/\$DISABLED\$/g, params.disable?"disabled":"");
		var _data = params.data || JSON.parse(window.localStorage.getItem(self.id+"_pad"));
		wrap.innerHTML = __str__;
		this.toolbarMap = toolbarMap;
		
		var	canvasWrap = wrap.getElementsByClassName("can-wrap")[0],
			toolbarWrap = wrap.getElementsByClassName("toolbar-list")[0];

		colorInput = wrap.getElementsByClassName("color-input")[0];
		fileInput = wrap.getElementsByClassName("file-input")[0];
		textInput = wrap.getElementsByClassName("text-input")[0];
		mainCanvas = wrap.getElementsByClassName("main-can")[0];
		scrollWrapX = wrap.getElementsByClassName("scroll-x-wrap")[0];
		scrollWrapY = wrap.getElementsByClassName("scroll-y-wrap")[0];
		scrollX = scrollWrapX.getElementsByClassName("scroll-x")[0];
		scrollY = scrollWrapY.getElementsByClassName("scroll-y")[0];
		bufferCanvas1 = wrap.getElementsByClassName("buffer-can-1")[0];
		bufferCanvas2 = wrap.getElementsByClassName("buffer-can-2")[0];
		bufferCanvas3 = wrap.getElementsByClassName("buffer-can-3")[0];
		bufferCanvas4 = wrap.getElementsByClassName("buffer-can-4")[0];

		if("100%"===params.size) {
			var canvasWrapWidth = canvasWrap.clientWidth, 
				canvasWrapHeight = canvasWrap.clientHeight;
		} else {
			var sizeArr = params.size.split(/\*/);

			if(2!=sizeArr.length) {
				var canvasWrapWidth = canvasWrap.clientWidth, 
					canvasWrapHeight = canvasWrap.clientHeight;
			} else {
				var canvasWrapWidth = isNaN(sizeArr[0])?canvasWrap.clientWidth:sizeArr[0],
					canvasWrapHeight = isNaN(sizeArr[1])?canvasWrap.clientHeight:sizeArr[1];
			}
		}
		
		mainCanvas.width = canvasWrapWidth;
		mainCanvas.height = canvasWrapHeight;
		bufferCanvas1.width = canvasWrapWidth;
		bufferCanvas1.height = canvasWrapHeight;
		bufferCanvas2.width = canvasWrapWidth;
		bufferCanvas2.height = canvasWrapHeight;
		bufferCanvas3.width = canvasWrapWidth;
		bufferCanvas3.height = canvasWrapHeight;
		bufferCanvas4.width = canvasWrapWidth;
		bufferCanvas4.height = canvasWrapHeight;
		params.width = canvasWrapWidth;
		params.height = canvasWrapHeight;

		var resizePad = function() {
			var canvasWrapWidth = canvasWrap.clientWidth,
				canvasWrapHeight = canvasWrap.clientHeight;

			if(canvasWrapWidth<params.width) {
				ele.removeClass(scrollWrapX, "pad-hide");
				var scrollWidth = canvasWrapWidth - (params.width - canvasWrapWidth);
				scrollWidth = scrollWidth<10?10:scrollWidth;
				scrollX.style.width = scrollWidth + "px";
			} else {
				ele.addClass(scrollWrapX, "pad-hide");
			}

			if(canvasWrapHeight<params.height) {
				ele.removeClass(scrollWrapY, "pad-hide");
				var scrollHeight = canvasWrapHeight - (params.height - canvasWrapHeight);
				scrollHeight = scrollHeight<10?10:scrollHeight;
				scrollY.style.height = scrollHeight + "px";
			} else {
				ele.addClass(scrollWrapY, "pad-hide");
			}
		};
		
		ele.addEvent(window, "resize", function() {
			resizePad();
		});

		ele.addEvent(canvasWrap, "mousewheel", function() {
			var args = [].slice.call(arguments, 0),
				e = args[0] || window.event;

			canvasWrap.scrollTop = canvasWrap.scrollTop + e.deltaY;
			scrollY.style.top = (scrollWrapY.clientHeight - scrollY.offsetHeight)*(canvasWrap.scrollTop/(canvasWrap.scrollHeight - canvasWrap.clientHeight)) + "px";
		});

		scroll.init(scrollX, 0, function(val) {
			var rect = scrollWrapX.getBoundingClientRect(),
				moveDest = rect.width - scrollX.offsetWidth,
				hideWidth = canvasWrap.scrollWidth - canvasWrap.offsetWidth;

			canvasWrap.scrollLeft = val*(hideWidth/moveDest);
		});

		scroll.init(scrollY, 1, function(val) {
			var rect = scrollWrapY.getBoundingClientRect(),
				moveDest = rect.height - scrollY.offsetHeight,
				hideHeight = canvasWrap.scrollHeight - canvasWrap.offsetHeight;

			canvasWrap.scrollTop = val*(hideHeight/moveDest);
		});

		resizePad();
		self.tab = new Tab(params.wrap);
		self.textInput = textInput;
		self.mouseIconCanvas = bufferCanvas1;
		self.createImageCanvas = bufferCanvas3;
		self.fileCanvas = bufferCanvas4;
		ele.css(mainCanvas, "background", self.params.background);
		ele.css(bufferCanvas4, "background", self.params.background);

		ele.addEvent(colorInput, "change", function() {
			self.params.color = this.value;
		});

		self.pad.showFiles = function(params) {
			var files = params.files,
				newTab = params.newTab,
				isShow = params.isShow,
				from = params.from,
				tabId = params.tabId,
				activeTab = self.tab.getActive();

			files = "[object Array]"===toString.call(files)?files:[files];

			var _showFiles = function() {
				self.pad.clear();

				var pageObj = new Page({
					data: files, 
					show: isShow, 
					that: self,
					tabId: newTab?id:activeTab.id
				});

				self.tab.setPage.call(self, void(0)!=id?id:activeTab.id, pageObj);
				activeTab.page = pageObj;
			};

			if(newTab) {
				var id = self.tab.build.call(self, bufferCanvas4, 1, null, tabId, from===self.params.id);
				params.tabId = id;

				if(isShow) {
					self.tab.active.call(self, id);
					_showFiles();
					self.params.onTabChange && self.params.onTabChange(id);
				}
			} else {
				_showFiles();
			}
		};

		fr.onload = function(data) {
			self.toolbarMap.image.renderBuffer.call(self, data.target.result);
			self.toolbarMap.image.render.call(self, [0, 0]);
			fileInput.value = "";
		};

		ele.addEvent(fileInput, "change", function() {
			fr.readAsDataURL(this.files[0]);
		});

		ele.addEvent(textInput, "keyup", function() {
			var args = [].slice.call(arguments, 0),
				e = args[0] || window.event;

			if(13===e.which) {
				var val = data.trim(this.value);
				current.render.call(self, val);
			}
		});

		ele.addEvent(document, "keydown", function() {
			var args = [].slice.call(arguments, 0),
				e = args[0] || window.event,
				which = e.which;

			if(!self.active) return ;

			switch(true) {
				case 107===which || (187===which && e.shiftKey):
				current.largen && current.largen.call(self);
				break;
				case 109===which || (189===which && e.shiftKey):
				current.lesser && current.lesser.call(self);
				break;
			}
		});

		ele.addEvent(toolbarWrap, "click", function() {
			if(params.disable) return ;

			var args = [].slice.call(arguments, 0),
				e = args[0] || window.event,
				span = e.srcElement || e.target,
				level = +span.getAttribute("level"),
				item = span.getAttribute("item");

			if(!item) return ;

			switch(item) {
				case "handPad":
				handPad = !handPad;
				if(handPad) {
					span.setAttribute("active", "");
				} else {
					span.removeAttribute("active");
				}
				break;
				case "color":
				colorInput.click();
				break;
				case "clear":
				self.tab.clear.call(self);
				params.onClear && "[object Function]"===toString.call(params.onClear) && params.onClear(self.tab.getActive().id);
				break;
				case "export":
				var image = self.mainCanvas.toDataURL().replace(/image\/png/, "image/octet-stream;Content-Disposition:attachment;filename="+data.uuid+".png");
				location.href = image;
				break;
				case "image":
				fileInput.click();
				break;
				default:
				current = toolbarMap[item] || current;
				if(!current) return ;
				self.current = current;
				current.active();

				if(0===level) {
					curActiveNode && curActiveNode.removeAttribute("active");
					curActiveNode = span;
					var lastSpan = toolbarWrap.getElementsByClassName("selected-item")[0];

					if(span.parentNode!=lastSpan) {
						ele.removeClass(lastSpan, "selected-item");
					}

					ele.addClass(span.parentNode, "selected-item");
				}

				if(1===level) {
					curActiveChildNode && curActiveChildNode.removeAttribute("active");
					var parentSpan = ele.preNode(span.parentNode.parentNode);
					parentSpan.title = span.parentNode.title;
					parentSpan.className = parentSpan.className.replace(/\bicon-[\w-]+\b/, span.className.match(/\bicon-[\w-]+\b/));
					curActiveChildNode = span;
				}

				span.setAttribute("active", "");
			}

			if(item) {
				if(window.event) {
					e.returnValue = false;
					e.cancelBubble = true;
				} else {
					e.preventDefault();
					e.stopPropagation();
				}
			}
		});

		ele.addEvent(toolbarWrap, "mousedown", function() {
			var args = [].slice.call(arguments, 0),
				e = args[0] || window.event;

			if(window.event) {
				e.returnValue = false;
				e.cancelBubble = true;
			} else {
				e.preventDefault();
				e.stopPropagation();
			}
		});

		ele.addEvent(bufferCanvas1, "mousemove", function() {
			if(!current) return ;

			var args = [].slice.call(arguments, 0),
				e = args[0] || window.event,
				rect = this.getBoundingClientRect(),
				item = current.name.toLowerCase(),
				pos = {x:e.clientX-(rect.x || rect.left), y:e.clientY- (rect.y || rect.top)};

			if(handPad || active) {
				switch(item) {
					case "ferula":
					current.mouseRender.call(self, pos);
					break;
					case "circular":
					case "quadrate":
					current.mouseRender.call(self, pos);
					default:
					current.bufferRender.call(self, pos);
				}
			} else {
				current.mouseRender && current.mouseRender.call(self, pos);
			}

			if(window.event) {
				e.returnValue = false;
				e.cancelBubble = true;
			} else {
				e.preventDefault();
				e.stopPropagation();
			}
		});

		ele.addEvent(bufferCanvas1, "mousedown", function() {
			var args = [].slice.call(arguments, 0),
				rect = this.getBoundingClientRect(),
				lastSpan = toolbarWrap.getElementsByClassName("selected-item")[0],
				e = args[0] || window.event,
				pos = {x:e.clientX-(rect.x || rect.left), y:e.clientY- (rect.y || rect.top)};

			active = true;
			ele.removeClass(lastSpan, "selected-item");
			current && current.bufferRender && current.bufferRender.call(self, pos, true);

			if(window.event) {
				e.returnValue = false;
				e.cancelBubble = true;
			} else {
				e.preventDefault();
				e.stopPropagation();
			}
		});

		ele.addEvent(document, "mousedown", function() {
			var lastSpan = toolbarWrap.getElementsByClassName("selected-item")[0];
			ele.removeClass(lastSpan, "selected-item");
			self.textInput.removeAttribute("style");
		});

		ele.addEvent(document, "mouseup", function() {
			if(active) {
				active = false;
				current && current.render && current.render.call(self);
			}
		});

		ele.addEvent(bufferCanvas1, "mouseup", function() {
			var args = [].slice.call(arguments, 0),
				e = args[0] || window.event;
			active = false;
			current && current.render && current.render.call(self);
		});

		ele.addEvent(canvasWrap, "mouseleave", function() {
			bufferCanvas1.width = bufferCanvas1.width;
		});

		self.bufferCanvas = bufferCanvas2;

		if(!_data) {
			var _n = self.tab.build.call(self, mainCanvas, 0);
			self.tab.active.call(self, _n);
		} else {
			for(var key in _data) {
				var val = _data[key];
				var _n = self.tab.build.call(self, 0===val.type?mainCanvas:bufferCanvas4, val.type, val.data, key, val.del);

				if(val.splitPage) {
					var pageObj = new Page({
						data: val.data, 
						show: 0===val.type, 
						that: self,
						tabId: _n
					});

					self.tab.setPage.call(self, _n, pageObj);
				}

				0===val.type && self.tab.active.call(self, _n);
			}
		}
	}

	window.wPad = {
		init: function(params) {
			var _params = data.copy({}, defaultConfig);
			_params = data.copy(_params, params);
			var pad = new WPad(_params);
			void(0)!=_params.id && (padMap[_params.id] = pad);
			padTab.push(pad);
			return pad;
		},
		getPadById: function(id) {
			if(void(0)===id) return ;
			return padMap[id];
		},
		getPadByIndex: function(index) {
			if(void(0)===index) return ;
			return padTab[index];
		}
	};
}());