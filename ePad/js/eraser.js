;(function() {
	"use strict";
	var modeMap = {
		circular: 0,
		quadrate: 1
	};

	var pos = null;

	function Eraser(params) {
		this.name = params.name || "Eraser";
		this.buffer = [];
	}

	Eraser.prototype = {
		constructor: Eraser,
		active: function() {},
		mouseRender: function(data) {
			var self = this;
			data = {type: "eraser", data: [data.x, data.y], mode: modeMap[self.current.name], from: self.params.id};
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
			self.mouseRender.call(self, pos);
		},
		lesser: function() {
			var self = this,
				eraserSize = self.params.eraserSize;

			eraserSize--;
			self.params.eraserSize = Math.max.apply(Math, [5, eraserSize]);
			self.mouseRender.call(self, pos);
		},
		bufferRender: function(data) {
			if(!data) return ;
			var self = this, _data = [data.x, data.y, self.params.eraserSize/2];
			data = {type: "eraser", data: _data, status: 1, mode: modeMap[self.current.name], origin: !!origin, from: self.params.id};
			self.current.buffer.push(data);
			self.render(data);
		},
		render: function(data) {
			if(!data) return ;
			var self = this, _data = [data.x, data.y, self.params.eraserSize/2];
			data = {type: "eraser", data: _data, status: 1, mode: modeMap[self.current.name], origin: !!origin, from: self.params.id};
			self.current.buffer.push(data);
			self.render(data);
		}
	};

	var vm = window.vm || {};
	vm.module = vm.module || {};
	vm.module.eraser = Eraser;
	window.vm = vm;
}());