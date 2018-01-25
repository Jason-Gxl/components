;(function() {
	"use strict";

	function Pen(params) {
		this.name = params.name || "Pen";
		this.interimBuffer = [];
		this.buffer = [];
	}

	Pen.prototype = {
		constructor: Pen,
		active: function() {},
		bufferRender: function(data, origin) {
			var self = this;
			data = {type: "pen", data: data, status: 0, origin: !!origin, color: self.params.color, from: self.params.id, width: self.params.width, height: self.params.height};
			self.current.interimBuffer.push(data);
			self.render(data);
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
	vm.module.pen = Pen;
	window.vm = vm;
}());