;(function() {
	"use strict";
	var modeMap = {
		circular: 0,
		quadrate: 1
	};

	var pos = null;

	function Eraser(params) {
		this.name = params.name || "Eraser";
		this.interimBuffer = [];
		this.buffer = [];
	}

	Eraser.prototype = {
		constructor: Eraser,
		active: function() {},
		mouseRender: function(data) {
			var self = this;
			data = {type: "eraser", data: [data.x, data.y, self.params.eraserSize], mode: modeMap[self.current.name], from: self.params.id};
			pos = data;
			self.mouseRender.call(self, data);
		},
		largen: function() {
			var self = this,
				eraserSize = self.params.eraserSize,
				cw = self.mainCanvas.clientWidth,
				ch = self.mainCanvas.clientHeight;

			eraserSize++;
			self.params.eraserSize = Math.min.apply(Math, [eraserSize, cw, ch]);
			pos.data[2] = self.params.eraserSize;
			self.mouseRender.call(self, pos);
		},
		lesser: function() {
			var self = this, eraserSize = self.params.eraserSize;
			eraserSize--;
			self.params.eraserSize = Math.max.apply(Math, [5, eraserSize]);
			pos.data[2] = self.params.eraserSize;
			self.mouseRender.call(self, pos);
		},
		bufferRender: function(data, origin) {
			if(!data) return ;
			var self = this;
			data.size = self.params.eraserSize;
			data = {type: "eraser", data: data, status: 0, origin: !!origin, mode: modeMap[self.current.name], from: self.params.id, width: self.params.width, height: self.params.height};
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
	vm.module.eraser = Eraser;
	window.vm = vm;
}());