var number = 0,
	fileListWrap = document.getElementsByClassName("file-list-wrap")[0],
	fileWrapItem = fileListWrap.getElementsByClassName("file-item-wrap")[0],
	tabNameInputWrap = document.getElementsByClassName("tab-name-wrap")[0];

document.getElementById("add_btn").addEventListener("click", function() {
	number++;
	var _fileWrapItem = fileWrapItem.cloneNode(1);
	_fileWrapItem.getElementsByTagName("input")[0].name = "file"+number;
	fileListWrap.appendChild(_fileWrapItem);
});

document.getElementById("show_btn").addEventListener("click", function() {
	var files = [],
		fileInputs = [].slice.call(fileListWrap.getElementsByTagName("input"), 0),
		tabNameInput = tabNameInputWrap.getElementsByTagName("input")[0];

	fileInputs.forEach(function(fileItem) {
		files.push(fileItem.value);
	});

	var data = {
		files: files,
		newTab: true,
		isShow: true,
		tabName: tabNameInput.value || "",
		from: 1,
		original: true,
		tabId: Date.now()
	};

	pad1.showFiles(data);
});

var pad1 = wPad.init({
	id: 1,
	// size: "1920*1080",
	wrap: document.getElementById("pad1"),
	background: "#fff",
	autoSaveTime: 5,
	disable: false,
	// toolbars: ["pen", "line", "text", "image", "export", "clear"],
	onRender: function(data) {
		pad2.render(data);
		console.log(data);
	},
	onShowFiles: function(data) {
		pad2.showFiles(data);
		console.log(data);
	},
	onMousemove: function(data) {
		console.log(data);
		pad2.mouseCtrl(data);
	},
	onClear: function(data) {
		pad2.clear(data);
	},
	onTabChange: function(id) {
		console.log(1);
		pad2.changeTab(id);
	},
	onTabRemove: function(id) {
		pad2.removeTab(id);
	},
	onPageTurn: function(id, pageNumber, data) {
		console.log(data);
		pad2.turnPage(id, pageNumber);
	}
});

var pad2 = wPad.init({
	id: 2,
	// size: "4:3",
	wrap: document.getElementById("pad2"),
	background: "#fff",
	autoSaveTime: 5,
	disable: false,
	onRender: function(data) {
		//pad1.render(data);
		console.log(data);
	},
	onShowFiles: function(data) {
		
	},
	onMousemove: function(data) {
		//pad1.mouseCtrl(data);
	},
	onClear: function(data) {
		//pad1.clear(data);
	},
	onTabChange: function(id) {
		//pad1.changeTab(id);
	},
	onTabRemove: function(id) {
		//pad1.removeTab(id);
	},
	onPageTurn: function(id, pageNumber) {
		//pad1.turnPage(id, pageNumber);
	}
});