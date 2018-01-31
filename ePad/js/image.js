;(function() {
	"use strict";

	function Image(params) {
		this.name = params.name || "Image";
		this.interimBuffer = [];
		this.buffer = [];
	}

	Image.prototype = {
		constructor: Image,
		active: function() {},
		renderBuffer: function(data) {
			var self = this;
			var data = {type: "image", data: [data], status: 0, origin: true, from: self.params.id, width: self.params.width, height: self.params.height};
			self.toolbarMap.image.interimBuffer.push(data);
		},
		render: function(_data) {
			if(!_data) return ;
			var self = this, data = self.toolbarMap.image.interimBuffer.shift();
			if(!data) return ;

			do {
				data.status = 1;
				data.data = [].concat.apply(data.data, _data);
				self.toolbarMap.image.buffer.push(data);
				self.render(data);
				data = self.toolbarMap.image.interimBuffer.shift();
			} while(data);
		}
	};

	var vm = window.vm || {};
	vm.module = vm.module || {};
	vm.module.image = Image;
	window.vm = vm;
}());