;(function(fn, undefined) {
	var duang = fn(),
		UL = document.createElement("UL"),
		toString = Object.prototype.toString;

	var tpl = '\
		<li level="$LEVEL$">\
			<span>\
				<i class="iconfont"></i>\
				<label title="$NAME$">$NAME$</label>\
			</span>\
		</li>';

	var tpl1 = '\
		<div class="multi-select-wrap">\
			<div class="multi-select-left"></div>\
			<ul class="multi-select-center">\
				<li><a href="javascript:void(0);" class="ctrl-btn" action="selectAll">选择全部</a></li>\
				<li><a href="javascript:void(0);" class="ctrl-btn" action="select">选择</a></li>\
				<li><a href="javascript:void(0);" class="ctrl-btn" action="remove">移除</a></li>\
				<li><a href="javascript:void(0);" class="ctrl-btn" action="removeAll">移除全部</a></li>\
			</ul>\
			<div class="multi-select-right"></div>\
		</div>';

	var dataTemp = {
		sort: function(data, pid, level) {
			var params = this.params,
				self = this,
				level = level || 0,
				container = [],
				i = 0,
				len = data.length,
				data = "[object Array]"===toString.call(data)?data:[data];

			if(void(0)===pid) {
				while(i<len) {
					var d = data[i];

					if(void(0)===d[params.nexus]) {
						container.push(d);
						d.level = 0;
						data.splice(i, 1);
						var children = dataTemp.sort.call(self, data, d[params.key], ++level);
						if(children && children.length>0) d.children = children;
						len = data.length;
					} else {
						i++;
					}
				}
			} else {
				while(i<len) {
					var d = data[i];

					if(d[params.nexus]==pid) {
						container.push(d);
						d.level = level;
						data.splice(i, 1);
						var children = dataTemp.sort.call(self, data, d[params.key], ++level);
						if(children && children.length>0) d.children = children;
						len = data.length;
					} else {
						i++;
					}
				}
			}

			if(void(0)===pid && data.length>0) {
				[].push.apply(container, data);
			}

			return container;
		},
		deepCopy: function(data) {
			if("[object Array]"!=toString.call(data) && "[object Object]"!=toString.call(data)) return data;

			if("[object Array]"===toString.call(data)) {
				var container = [];

				data.forEach(function(d) {
					if("[object Array]"===toString.call(d) || "[object Object]"===toString.call(d)) {
						container.push(dataTemp.deepCopy(d));
					} else {
						container.push(d);
					}
				});
			} else {
				var container = {};

				for(var key in data) {
					var val = data[key];

					if("[object Array]"===toString.call(val) || "[object Object]"===toString.call(val)) {
						container[key] = dataTemp.deepCopy(val);
					} else {
						container[key] = val;
					}
				}
			}

			return container;
		},
		splitSelected: function(data) {
			var params = this.params,
				self = this,
				selected = "[object Array]"===toString.call(params.selected)?params.selected:[params.selected],
				data = "[object Array]"===toString.call(data)?data:[data];

			data.forEach(function(data) {
				selected.forEach(function(d) {
					if(data[params.key]===d[params.key]) {
						data.selected = true;
						self.selected.push(data);
					}
				});
			});
		},
		getData: function(data, callback) {
			var params = this.params,
				self = this;

			if(params.getFun) {
				params.getFun(data, function(data) {
					callback.call(self, data);
				});
			}
		}
	};

	var ele = {
		createNode: function(d) {
			var params = this.params,
				_tpl = tpl.replace(/\$LEVEL\$/g, d.level).replace(/\$NAME\$/g, d[params.show]);
			UL.innerHTML = _tpl;
			var li = UL.removeChild(UL.firstElementChild);
			return li;
		},
		buildTree: function(data, type) {
			var params = this.params,
				ul = UL.cloneNode(1),
				self = this;

			data.forEach(function(d) {
				if(1===type) {
					self.selected.some(function(item) {
						var flag = false;

						if(item[params.key]===d[params.key]) {
							d = item;
							flag = true;
						}

						return flag;
					});
				}

				var li = ele.createNode.call(self, d),
					label = li.getElementsByTagName("label")[0],
					childShow = false;

				if(d.children) {
					var childNode = ele.buildTree.call(self, d.children, type);
					li.appendChild(childNode);
				} else {
					ele.addClass(li, "no-child");
				}

				if(0===type) {
					!d.selected && ul.appendChild(li);
				} else {
					d.selected && ul.appendChild(li);
				}

				ele.addEvent(li.getElementsByTagName("i")[0], "click", function() {
					childShow = !childShow;

					if(childShow) {
						ele.removeClass(li, "hide-child");
					} else {
						ele.addClass(li, "hide-child");
					}
				});

				ele.addEvent(label, "dblclick", function() {
					if(d.children) return ;
					ele.removeClass(this, "selected");
					d.selected = !d.selected;

					if(d.selected) {
						self.selected.push(d);
						ul.removeChild(li);
						var rightBox = params.wrap.getElementsByClassName("multi-select-right")[0];
						rightBox.innerHTML = "";
						rightBox.appendChild(ele.buildTree.call(self, dataTemp.sort.call(self, dataTemp.deepCopy(self.selected)), 1));
					} else {
						self.selected.splice(self.selected.indexOf(d), 1);
						ul.removeChild(li);
						d.parentNode.appendChild(d.node);
					}
				});

				ele.addEvent(label, "click", function() {
					if(d.children) {
						childShow = !childShow;

						if(childShow) {
							ele.removeClass(li, "hide-child");
						} else {
							ele.addClass(li, "hide-child");
						}
					} else {
						var selected = !this.getAttribute("selected");

						if(selected) {
							this.setAttribute("selected", "selected");
						} else {
							this.removeAttribute("selected");
						}

						if(params.multiple) {
							if(selected) {
								ele.addClass(this, "selected");

								if(0===type) {
									self.leftSelected.push({data: d, node: li, parentNode: ul});
								} else {
									self.rightSelected.push({data: d, node: li, parentNode: ul});
								}
							} else {
								ele.removeClass(this, "selected");

								if(0===type) {
									self.leftSelected.some(function(item, index) {
										var flag = false;

										if(item.data===d) {
											flag = true;
											self.leftSelected.splice(index, 1);
										}

										return flag;
									});
								} else {
									self.rightSelected.some(function(item, index) {
										var flag = false;

										if(item.data===d) {
											flag = true;
											self.rightSelected.splice(index, 1);
										}

										return flag;
									});
								}
							}
						} else {
							if(selected) {
								ele.addClass(this, "selected");

								if(0===type) {
									var lastOne = self.leftSelected.shift();
									lastOne && ele.removeClass(lastOne.node.getElementsByTagName("label")[0], "selected");
									self.leftSelected.push({data: d, node: li, parentNode: ul});
								} else {
									var lastOne = self.rightSelected.shift();
									lastOne && ele.removeClass(lastOne.node.getElementsByTagName("label")[0], "selected");
									self.rightSelected.push({data: d, node: li, parentNode: ul});
								}
							} else {
								ele.removeClass(this, "selected");

								if(0===type) {
									self.leftSelected.shift();
								} else {
									self.rightSelected.shift();
								}
							}
						}
					}
				});
				
				ele.addClass(li, "hide-child");

				if(0===type) {
					d.node = li;
					d.parentNode = ul;
				}
			});

			return ul;
		},
		addEvent:window.addEventListener?function(ele, type, fn, use) {
			ele.addEventListener(type, fn, use||false);
		}:function(ele, type, fn) {
			ele.attachEvent("on"+type, fn);
		},
		addClass: function(ele, _className) {
			var className = ele.className,
				reg = new RegExp(_className, "g");

			if(!reg.test(className)) {
				ele.className = className + " " + _className;
			}
		},
		removeClass: function(ele, _className) {
			var reg = new RegExp("\\s*"+_className, "g");
			ele.className = ele.className.replace(reg, "");
		}
	};

	function moveData(item) {
		var self = this,
			data = item.data,
			node = item.node,
			label = node.getElementsByTagName("label")[0],
			params = this.params,
			parentNode = item.parentNode;
		data.selected = !data.selected;

		if(data.selected) {
			self.selected.push(data);
			parentNode.removeChild(node);
			ele.removeClass(label, "selected");
			label.removeAttribute("selected");
			var rightBox = params.wrap.getElementsByClassName("multi-select-right")[0];
			rightBox.innerHTML = "";
			rightBox.appendChild(ele.buildTree.call(self, dataTemp.sort.call(self, dataTemp.deepCopy(self.selected)), 1));
		} else {
			self.selected.splice(self.selected.indexOf(data), 1);
			ele.removeClass(label, "selected");
			label.removeAttribute("selected");
			parentNode.removeChild(node);
			data.parentNode.appendChild(data.node);
		}
	}

	function MultiSelect(params) {
		if(!this instanceof MultiSelect) {
			return new MultiSelect(params);
		}

		this.name = "MultiSelect";

		var that = {
			params: params,
			selected: [],
			leftSelected: [],
			rightSelected: []
		};

		params.selected && dataTemp.splitSelected.call(that, params.data);
		var wrap = params.wrap;
		wrap.innerHTML = tpl1;
		var leftBox = wrap.getElementsByClassName("multi-select-left")[0],
			rightBox = wrap.getElementsByClassName("multi-select-right")[0],
			ctrlBtns = wrap.getElementsByClassName("ctrl-btn");

		if(params.data) {
			if(void(0)!=params.nexus) {
				var data = dataTemp.sort.call(that, params.data);
			} else {
				var data = params.data;
			}

			leftBox.appendChild(ele.buildTree.call(that, data, 0));
			rightBox.appendChild(ele.buildTree.call(that, dataTemp.sort.call(that, dataTemp.deepCopy(that.selected)), 1));
		} else {
			dataTemp.getData(null, function(data) {
				leftBox.appendChild(ele.buildTree.call(that, data), 0);
			});
		}

		[].slice.call(ctrlBtns, 0).forEach(function(ctrlBtn) {
			ele.addEvent(ctrlBtn, "click", function() {
				var action = this.getAttribute("action");

				switch(action) {
					case "selectAll":
					break;
					case "select":
						that.leftSelected.forEach(function(item) {
							moveData.call(that, item);
						});

						that.leftSelected.length = 0;			
					break;
					case "remove":
						that.rightSelected.forEach(function(item) {
							moveData.call(that, item);
						});

						that.rightSelected.length = 0;
					break;
					case "removeAll":
				}
			});
		});

		this.constructor.prototype.getSelected = function() {
			return that.selected;
		};
	}

	MultiSelect.prototype = {
		constructor: MultiSelect
	};

	window.multiSelect = {
		init: function(params) {
			if(!params.wrap || (!params.data && !params.url)) return ;
			return new MultiSelect(params);
		}
	};
}(function() {
	return window.duang || null;
}));