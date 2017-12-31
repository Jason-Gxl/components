;(function() {
	"use strict";
	var vm = window.vm || {},
		toString = Object.prototype.toString,
		padMap = {},
		padCount = 0,
		padTab = [],
		layoutClassMap = {
			leftTop: "left-top",
			rightTop: "right-top",
			rightBottom: "right-bottom",
			leftBottom: "left-bottom"
		},
		defaultConfig = {
			layout: "leftTop",
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
			<div class="can-wrap">\
				<input type="text" class="text-input tool-input"/>\
				<canvas class="main-can">抱歉！您的浏览器版本太低，暂时不支持此白板！</canvas>\
				<canvas class="buffer-can-4"></canvas>\
				<canvas class="buffer-can-3"></canvas>\
				<canvas class="buffer-can-2"></canvas>\
				<canvas class="buffer-can-1"></canvas>\
			</div>\
			<div class="pad-tab-wrap">\
				<ul class="pad-tab-list"></ul>\
			</div>\
			<input type="file" accept="image/png, image/jpeg" class="file-input tool-input"/>\
			<input type="color" class="color-input tool-input"/>\
			<img src="" class="tool-img"/>\
		</div>';

	var tpl2 = '<li class="toolbar-item" title="$TITLE$"><span class="item-icon iconfont $ICONCLASS$" item="$ITEM$" level="$LEVEL$"></span>$CHILDTOOLBARS$</li>';

	var tpl3 = '<ul class="child-toolbar-list">$CHILDTOOLBARITEM$</ul>';

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

	var data = {
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
		saveAsImage: function() {
			var self = this,
				mainCanvas = self.mainCanvas;
		},
		trim: function(content) {
			if(!content || "[object String]"!=toString.call(content)) return ;
			return content.replace(/^\s*|\s*$/, "");
		},
		renderPen: function(params, callback) {
			var self = this,
				canvas = 0===params.status?self.bufferCanvas:self.mainCanvas,
				data = params.data,
				ctx = canvas.getContext("2d");

			ctx.strokeStyle = params.color;

			if(params.origin) {
				ctx.beginPath();
				ctx.moveTo(data.x, data.y);
			} else {
				ctx.lineTo(data.x, data.y);
				ctx.stroke();
			}

			if(0!=params.status && params.origin) self.bufferCanvas.width = self.bufferCanvas.width;
			callback && callback();
		},
		renderRect: function(params, callback) {
			var self = this,
				mode = params.mode,
				canvas = 0===params.status?self.bufferCanvas:self.mainCanvas,
				data = params.data,
				ctx = canvas.getContext("2d");

			if(0===params.status) {
				canvas.width = canvas.width;
			} else {
				self.bufferCanvas.width = self.bufferCanvas.width;
			}

			if(0===params.mode) {
				ctx.strokeStyle = params.color;
				ctx.rect(data[0], data[1], data[2], data[3]);
				ctx.stroke();
			} else {
				ctx.fillStyle = params.color;
				ctx.fillRect(data[0], data[1], data[2], data[3]);
			}

			callback && callback();
		},
		renderLine: function(params, callback) {
			var self = this,
				mode = params.mode,
				canvas = 0===params.status?self.bufferCanvas:self.mainCanvas,
				data = params.data,
				ctx = canvas.getContext("2d");

			if(0===params.status) {
				canvas.width = canvas.width;
			} else {
				self.bufferCanvas.width = self.bufferCanvas.width;
			}

			ctx.strokeStyle = params.color;
			ctx.beginPath();
			ctx.moveTo(data[0], data[1]);
			ctx.lineTo(data[2], data[3]);
			ctx.stroke();
			callback && callback();
		},
		renderRound: function(params, callback) {
			var self = this,
				mode = params.mode,
				canvas = 0===params.status?self.bufferCanvas:self.mainCanvas,
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

			callback && callback();
		},
		renderText: function(params, callback) {
			var self = this,
				canvas = 0===params.status?self.bufferCanvas:self.mainCanvas,
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
			callback && callback();
		},
		renderImage: function(params, callback) {
			var self = this,
				canvas = self.mainCanvas,
				data = params.data,
				wrap = self.params.wrap,
				img = document.createElement("IMG"),
				ctx = canvas.getContext("2d");

			img.src = data[0];
			img.style.cssText = "position: absolute; z-index: -1; visibility: hidden;";
			var cw = canvas.clientWidth,
				ch = canvas.clientHeight,
				dw = cw - data[1],
				dh = ch - data[2];

			img.onload = function() {
				switch(true) {
					case dw>=0 && dh>=0:
					ctx.drawImage(img, dw/2, dh/2);
					break;
					case dw<0 && dh<0:
					if(Math.abs(dw)>Math.abs(dh)) {
						ctx.drawImage(img, 0, dh/2, cw, cw*(data[2]/data[1]));
					} else {
						ctx.drawImage(img, dw/2, 0, ch*(data[1]/data[2]), ch);
					}
					break;
					default:
					if(dw<0) {
						ctx.drawImage(img, 0, dh/2, cw, cw*(data[2]/data[1]));
					} else {
						ctx.drawImage(img, dw/2, 0, ch*(data[1]/data[2]), ch);
					}
				}

				wrap.removeChild(this);
				callback && callback();
			};

			wrap.insertBefore(img, wrap.firstElementChild||wrap.firstChild);
		},
		delete: function(params, callback) {
			var self = this,
				mode = params.mode,
				canvas = 0===params.status?self.bufferCanvas:self.mainCanvas,
				data = params.data,
				ctx = canvas.getContext("2d");

			if(0===params.status) {
				canvas.width = canvas.width;
			} else {
				self.bufferCanvas.width = self.bufferCanvas.width;
			}

			ctx.beginPath();
			ctx.fillStyle = self.params.background;

			if(0===mode) {
				ctx.arc(data[0], data[1], data[2], 0, 2*Math.PI);
				ctx.fill();
			} else {
				ctx.fillRect(data[0], data[1], data[2], data[3]);
			}

			callback && callback();
		},
		render: function(_data, callback) {
			var self = this,
				type = _data.type;

			switch(type) {
				case "pen":
				data.renderPen.call(self, _data, callback);
				break;
				case "rectangle":
				data.renderRect.call(self, _data, callback);
				break;
				case "line":
				data.renderLine.call(self, _data, callback);
				break;
				case "round":
				data.renderRound.call(self, _data, callback);
				break;
				case "text":
				data.renderText.call(self, _data, callback);
				break;
				case "image":
				data.renderImage.call(self, _data, callback);
				break;
				case "eraser":
				data.delete.call(self, _data, callback);
			}
		}
	};

	var mouse = {
		eraser: function(params) {
			var self = this,
				canvas = self.mouseIconCanvas,
				data = params.data,
				mode = params.mode,
				eraserSize = self.params.eraserSize,
				ctx = canvas.getContext("2d");

			canvas.width = canvas.width;
			ctx.beginPath();

			if(0===mode) {
				ctx.arc(data[0], data[1], eraserSize/2, 0, 2*Math.PI);
				ctx.stroke();
			} else {
				var px = data[0]-eraserSize/2,
					py = data[1]-eraserSize/2;
				ctx.rect(px, py, eraserSize, eraserSize);
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
			var self = this,
				type = _data.type;
			mouse[type] && mouse[type].call(self, _data);
		}
	};

	var Tab = (function() {
		var UL = document.createElement("UL"),
			tabTpl = '<li class="pad-tab-item">$LABEL$$DELETEBTN$</li>',
			delTpl = '<i class="iconfont icon-close"></i>';

		function _tab(wrap) {
			var self = this,
				number = 0,
				tabMap = {},
				dataMap = {},
				canvasMap = {},
				activeObj = {},
				saving = false,
				tabWrap = wrap.getElementsByClassName("pad-tab-list")[0];

			var step = (function() {
				var i = 0, arr = [], callback = null;

				var _fn  = function() {
					i++;
					callback(arr[i], _fn);
				};

				var _step = function(_data, start, _callback) {
					arr = _data;
					i = start;
					callback = _callback;
					callback(_data[start], _fn);
				};

				return _step;
			}());

			self.build = function(canvas, type, _data, del) {
				if(!canvas) return ;
				var that = this,
					_number = number,
					_tabTpl = tabTpl.replace(/\$LABEL\$/g, tabNameMap[type]).replace(/\$DELETEBTN\$/g, del?delTpl:"");

				UL.innerHTML = _tabTpl;
				var li = UL.firstElementChild || UL.firstChild;

				tabMap[_number] = li;
				dataMap[_number] = _data || [];
				canvasMap[_number] = canvas;

				if(del) {
					ele.addEvent(li.getElementsByTagName("i")[0], "click", function() {
						var args = [].slice.call(arguments, 0),
						 	e = args[0] || window;

						delete tabMap[_number];
						delete dataMap[_number];
						delete canvasMap[_number];
						delete that.container[_number];
						tabWrap.removeChild(li);
						_number = _number - 1;
						self.active.call(that, _number);
						window.localStorage.setItem(that.id+"_pad", JSON.stringify(that.container));
						//TODO
						//这里需要将前面一个标签对应的数据渲染出来
						if(window.event) {
							e.returnValue = false;
							e.cancelBubble = true;
						} else {
							e.preventDefault();
							e.stopPropagation();
						}
					});
				}

				ele.addEvent(li, "click", function() {
					if(this===activeObj.tab) return ;
					self.active.call(that, _number);
				});

				number++;
				tabWrap.appendChild(li);

				that.container[_number] = {
					data: dataMap[_number],
					type: type
				};

				return _number;
			};

			self.push = function(id, data) {
				var self = this;
				!dataMap[id] && (dataMap[id] = []);
				dataMap[id].push(data);

				if(!saving && !!+self.params.autoSaveTime) {
					var it = setTimeout(function() {
						window.localStorage.setItem(self.id+"_pad", JSON.stringify(self.container));
						clearTimeout(it);
						saving = false;
					}, self.params.autoSaveTime*1000);

					saving = true;
				}
			};

			self.active = function(_number) {
				var self = this,
					_data = dataMap[_number];

				if(activeObj.canvas) {
					ele.css(activeObj.canvas, "zIndex");
					ele.removeClass(activeObj.tab, "active");
				}

				activeObj.tab = tabMap[_number];
				activeObj.data = dataMap[_number];
				activeObj.canvas = canvasMap[_number];
				activeObj.id = _number;
				activeObj.type = self.container[_number].type;
				self.mainCanvas = activeObj.canvas;
				ele.css(activeObj.canvas, "zIndex", 2);
				ele.addClass(activeObj.tab, "active");

				_data && step(_data, 0, function(d, next) {
					if(!d) return ;

					data.render.call(self, d, function() {
						next();
					});
				});
			};

			self.getActive = function() {
				return activeObj;
			};

			self.clear = function(id) {
				var self = this;

				if(void(0)===id) {
					activeObj.data.length = 0;
					activeObj.canvas.width = activeObj.canvas.width;
				} else {
					dataMap[id].length = 0;
					canvasMap[id].width = canvasMap[id].width;
				}

				window.localStorage.setItem(self.id+"_pad", JSON.stringify(self.container));
			};
		}

		_tab.prototype = {
			constructor: _tab
		};

		return _tab;
	}());

	function WPad(params) {
		if(!this instanceof WPad) {
			return new WPad(params);
		}

		var that = {
			pad: this,
			params: params,
			container: {},
			id: params.id || padCount++,
			render: function(_data) {
				data.render.call(that, _data);
				_data.width = that.mainCanvas.width;
				_data.height = that.mainCanvas.height;

				if(_data.status) {
					var activeTab = that.tab.getActive();
					that.tab.push.call(that, activeTab.id, _data);
				}

				if(params.render) {
					var outData = data.copy(_data), obj = {}, activeTab = that.tab.getActive();

					obj[activeTab.id] = {
						data: outData,
						type: activeTab.type
					};

					params.render(obj);
				}
			},
			mouseRender: function(_data) {
				mouse.render.call(that, _data);
				_data.width = that.mainCanvas.width;
				_data.height = that.mainCanvas.height;

				if(params.mousemove) {
					var outData = data.copy(_data), obj = {}, activeTab = that.tab.getActive();

					obj[activeTab.id] = {
						data: outData,
						type: activeTab.type
					};

					params.mousemove(obj);
				}
			}
		};
		
		buildPad.call(that);

		var render = function(_data) {
			var scaleWidth = null,
				scaleHeight = null,
				activeTab = that.tab.getActive();

			for(var key in _data) {
				var val = _data[key],
					type = val.type,
					val = val.data;

				if(!scaleWidth || !scaleHeight) {
					scaleWidth = that.mainCanvas.width/val.width;
					scaleHeight = that.mainCanvas.height/val.height;
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
					default:
					if(val.data[0]) val.data[0] = !isNaN(val.data[0])?val.data[0] * scaleWidth:val.data[0];
					if(val.data[1]) val.data[1] = !isNaN(val.data[1])?val.data[1] * scaleWidth:val.data[1];
					if(val.data[2]) val.data[2] = !isNaN(val.data[2])?val.data[2] * scaleWidth:val.data[2];
					if(val.data[3]) val.data[3] = !isNaN(val.data[3])?val.data[3] * scaleWidth:val.data[3];
				}

				if(val.status) {
					that.tab.push.call(that, +key, val);
				}

				if(+key===activeTab.id) {
					data.render.call(that, val);
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

		this.clear = function(number) {
			that.tab.clear.call(that, number);
		};

		this.disable = function() {
			ele.addClass(params.wrap.firstElementChild||params.wrap.firstChild, "disabled");
			params.disable = true;
		};

		this.enable = function() {
			ele.removeClass(params.wrap.firstElementChild||params.wrap.firstChild, "disabled");
			params.disable = false;
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
			stepCount = 0,
			active = false,
			toolbarStr = "";

		var colorInput = null,
			fileInput = null,
			textInput = null,
			tempImg = null,
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
		var canvasWrap = wrap.getElementsByClassName("can-wrap")[0],
			toolbarWrap = wrap.getElementsByClassName("toolbar-list")[0];

		colorInput = wrap.getElementsByClassName("color-input")[0];
		fileInput = wrap.getElementsByClassName("file-input")[0];
		textInput = wrap.getElementsByClassName("text-input")[0];
		tempImg = wrap.getElementsByClassName("tool-img")[0];
		mainCanvas = wrap.getElementsByClassName("main-can")[0];
		bufferCanvas1 = wrap.getElementsByClassName("buffer-can-1")[0];
		bufferCanvas2 = wrap.getElementsByClassName("buffer-can-2")[0];
		bufferCanvas3 = wrap.getElementsByClassName("buffer-can-3")[0];
		bufferCanvas4 = wrap.getElementsByClassName("buffer-can-4")[0];

		var canvasWrapWidth = canvasWrap.clientWidth,
			canvasWrapHeight = canvasWrap.clientHeight;
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

		self.tab = new Tab(params.wrap);
		self.textInput = textInput;
		self.mouseIconCanvas = bufferCanvas2;
		ele.css(mainCanvas, "background", self.params.background);
		ele.css(bufferCanvas4, "background", self.params.background);

		ele.addEvent(colorInput, "change", function() {
			self.params.color = this.value;
		});

		self.pad.showFiles = function(files, newTab, isShow) {
			if(newTab) {
				var number = self.tab.build.call(self, bufferCanvas4, 1, null, true);
				isShow && self.tab.active.call(self, number);
			}
			
			self.toolbarMap.image.renderBuffer.call(self, files);
			tempImg.src = files;
		};

		fr.onload = function(data) {
			self.toolbarMap.image.renderBuffer.call(self, data.target.result);
			tempImg.src = data.target.result;
		};

		tempImg.onload = function() {
			self.toolbarMap.image.render.call(self, [this.offsetWidth, this.offsetHeight]);
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

			console.log(e);
		});

		ele.addEvent(toolbarWrap, "click", function() {
			if(params.disable) return ;

			var args = [].slice.call(arguments, 0),
				e = args[0] || window.event,
				span = e.fromElement || e.srcElement,
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
				params.clear && "[object Function]"===toString.call(params.clear) && params.clear(self.tab.getActive().id);
				break;
				case "export":
				var image = self.mainCanvas.toDataURL().replace(/image\/png/, "image/octet-stream;Content-Disposition: attachment;filename="+((Math.random()*10000000000)>>0)+".png");
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
					current.render.call(self, pos);
					break;
					default:
					current.bufferRender.call(self, pos);
					stepCount++;

					if(stepCount>=params.saveImgStep) {
						data.saveAsImage.call(self);
						stepCount = 0;
					}
				}
			} else {
				current.mouseRender && current.mouseRender.call(self, pos);
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

			if(window.event) {
				e.returnValue = false;
				e.cancelBubble = true;
			} else {
				e.preventDefault();
				e.stopPropagation();
			}
		});

		ele.addEvent(canvasWrap, "mouseleave", function() {
			bufferCanvas2.width = bufferCanvas2.width;
		});

		self.bufferCanvas = bufferCanvas1;

		if(!_data) {
			var _n = self.tab.build.call(self, mainCanvas, 0);
			self.tab.active.call(self, _n);
		} else {
			for(var key in _data) {
				var val = _data[key];
				var _n = self.tab.build.call(self, 0===val.type?mainCanvas:bufferCanvas4, val.type, val.data, 0!=val.type);
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