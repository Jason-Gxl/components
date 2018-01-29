;(function() {
	"use strict";

	function Text(params) {
		this.name = params.name || "Text";
		this.interimBuffer = [];
		this.points = [];
		this.buffer = [];
	}

	Text.prototype = {
		constructor: Text,
		active: function() {},
		bufferRender: function(data, origin) {
			var self = this;

			if(origin) {
				self.current.points = [];
				self.current.points.push(data.x);
				self.current.points.push(data.y);
				self.textInput.style.cssText = "visibility: visible; z-index: 101; left: " + data.x + "px; top: " + (data.y-self.textInput.offsetHeight/2) + "px";
				self.textInput.focus();
				data = {type: "text", data: [data.x, data.y], status: 0, origin: !!origin, color: self.params.color, from: self.params.id, width: self.params.width, height: self.params.height};
				self.current.interimBuffer.push(data);
			}
		},
		render: function(content) {
			if("[object String]"!=Object.prototype.toString.call(content)) return ;
			content = content.replace(/^\s*|\s*$/, "");
			if(!content) return ;
			var self = this, data = self.current.interimBuffer.pop();
			if(!data) return ;
			data.data.push(content);
			self.textInput.value = "";
			self.textInput.removeAttribute("style");
			data.status = 1;
			self.current.buffer.push(data);
			self.render(data);
			self.current.interimBuffer.length = 0;
		}
	};

	var vm = window.vm || {};
	vm.module = vm.module || {};
	vm.module.text = Text;
	window.vm = vm;
}());