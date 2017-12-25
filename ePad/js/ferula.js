;(function() {
	"use strict";
	var pos = null;

	function Ferula(params) {
		this.name = params.name || "Ferula";
		this.buffer = [];
	}

	Ferula.prototype = {
		constructor: Ferula,
		active: function() {},
		mouseRender: function(data) {
			var self = this;
			data = {type: "ferula", data: [data.x, data.y], from: self.params.id};
			pos = data;
			self.mouseRender.call(self, data);
		},
	};

	var vm = window.vm || {};
	vm.module = vm.module || {};
	vm.module.ferula = Ferula;
	window.vm = vm;
}());