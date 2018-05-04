module.exports = {
	/*css: [
		{
			files: ["./css/index.css", "./icon/*.css", "!./icon/demo.css"],
			dirname: "/css",	//生成的文件目录，在dist/的基础之后的目录，如果为空生成的文件就在dist/js/下
			prefix: "",			//生成的文件前缀，默认为空
			output: "index",	//生成的文件主名，默认为main
			extname: "",		//生成的文件的拓展名，默认为.min
			suffix: "", 		//生成的文件的后缀名，默认为.js
			basePath: "./demo"
		},
		{
			files: ["./css/test.css"],
			dirname: "/css",	//生成的文件目录，在dist/的基础之后的目录，如果为空生成的文件就在dist/js/下
			prefix: "",			//生成的文件前缀，默认为空
			output: "test",		//生成的文件主名，默认为main
			extname: "",		//生成的文件的拓展名，默认为.min
			basePath: "./demo",
			suffix: "" 			//生成的文件的后缀名，默认为.js
		}
	],*/
	css: [{
		files: "./css/*.css",
		dirname: "",
		basePath: ""
	}/*, {
		files: "./css/demo.less",
		output: "demo"
	}*/],
	js: {
		files: ["./js/eraser.js", "./js/ferula.js", "./js/image.js", "./js/line.js", "./js/pen.js", "./js/rectangle.js", "./js/round.js", "./js/text.js", "./js/index.js"],
		output: "index",
		basePath: ""
	},
	/*img: {
		files: ["./img/*.{png,jpg}"],
		dirname: "/img",		
		progressive: true,		//无损压缩jpg图片  默认：false
		interlaced: true,		//隔行扫描gif进行渲染  默认：false
		multipass: true,		//多次优化svg直到完全优化  默认：false
		basePath: "./demo",
		optimizationLevel: 5	//优化等级  默认：3  取值范围0-7
	},*/
	/*file: {
		files: ["./icon/iconfont.{eot,svg,ttf,woff}"],
		basePath: "./demo",
		dirname: "/css",
	},*/
	/*html: ["./page/*.html"],*/
	host: "china.dev.com",	//域名
	port: 3000,	//端口
	pagePath: "./",	//从哪里开始找页面
	homePage: "./demo/index.html",	//首页面
	//proxy: "china.dev.com:8080",	//代理
	browser: ["chrome"]    //[object Array]  可选项"chrome", "firefox", "explorer"
};