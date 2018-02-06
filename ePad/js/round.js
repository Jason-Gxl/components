;(function() {
	"use strict";

	var modeMap = {
		circle: 0,
		roundel: 1,
		ellipesstroke: 2,
		ellipes: 3
	};

	function Round(params) {
		this.name = params.name || "Round";
		this.interimBuffer = [];
		this.points = [];
		this.buffer = [];
	}

	Round.prototype = {
		constructor: Round,
		active: function() {},
		bufferRender: function(data, origin) {
			var self = this;

			if(origin) {
				self.current.points = [];
				self.current.points.push(data.x);
				self.current.points.push(data.y);
			} else {
				var _data = [],
					originX = self.current.points[0],
					originY = self.current.points[1],
					mode = modeMap[self.current.name],
					xc = data.x - originX,
					yc = data.y - originY;

				_data.push((originX+data.x)/2);
				_data.push((originY+data.y)/2);

				if(0===mode || 1===mode) {
					_data.push(Math.abs(xc)>Math.abs(yc)?Math.abs(xc)/2:Math.abs(yc)/2);
				} else {
					_data.push(Math.abs(xc)/2);
					_data.push(Math.abs(yc)/2);
				}
				
				self.current.interimBuffer.pop();
				data = {type: "round", data: _data, status: 0, mode: mode, origin: true, color: self.params.color, from: self.params.id, width: self.params.width, height: self.params.height};
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
	vm.module.round = Round;
	window.vm = vm;
}());