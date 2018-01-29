;(function() {
	"use strict";
	var modeMap = {
		rectstroke: 0,
		rect: 1
	};

	function Rectangle(params) {
		this.name = params.name || "Rectangle";
		this.interimBuffer = [];
		this.points = [];
		this.buffer = [];
	}

	Rectangle.prototype = {
		constructor: Rectangle,
		active: function() {},
		bufferRender: function(data, origin) {
			var self = this;

			if(origin) {
				self.current.points = [];
				self.current.points.push(data.x);
				self.current.points.push(data.y);
			} else {
				self.current.points[2] = data.x-(self.current.points[0]||0);
				self.current.points[3] = data.y-(self.current.points[1]||0);
				self.current.interimBuffer.pop();
				data = [].concat.apply([], self.current.points);
				data = {type: "rectangle", data: data, status: 0, mode: modeMap[self.current.name], origin: !!origin, color: self.params.color, from: self.params.id, width: self.params.width, height: self.params.height};
				self.current.interimBuffer.push(data);
				self.render(data);
			}
		},
		render: function() {
			var self = this, data = self.current.interimBuffer.shift();
			if(!data) return ;

			do {
				data.status = 1;
				self.current.buffer.push(data);
				self.render(data);
				data = self.current.interimBuffer.shift();
			} while(data);
		}
	};

	var vm = window.vm || {};
	vm.module = vm.module || {};
	vm.module.rectangle = Rectangle;
	window.vm = vm;
}());