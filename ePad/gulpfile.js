"use strict";

//=====================gulp 插件============================
const gulp = require("gulp");
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const through = require('through2');
const gutil = require('gulp-util');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const reactify = require('reactify');
const del = require("del");
const watchify = require("watchify");
const rename = require("gulp-rename");
const eslint = require("gulp-eslint");
const less = require("gulp-less");
const sass = require("gulp-sass");
const concat = require("gulp-concat");
const uglifycss = require("gulp-uglifycss");
const notify = require("gulp-notify");
const sequence = require('run-sequence');
const cache = require("gulp-cache");
const imagemin = require("gulp-imagemin");
const watch = require("gulp-watch");
const browserSync = require('browser-sync').create();
const config = require("./file.config.js");
//=====================gulp 插件============================

const toString = Object.prototype.toString;

//=====================需要被打包的文件及打包后的输出信息============================
const jsConfig = config.js;
const cssConfig = config.css;
const imgConfig = config.img;
const fileConfig = config.file;
const htmlConfig = config.html;
//=====================需要被打包的文件及打包后的输出信息============================

//=====================所有任务============================
const jsTasks = [];
const cssTasks = [];
const imgTasks = [];
const fileTasks = [];
const htmlTasks = [];
//=====================所有任务============================

const jsFiles = [];
const cssFiles = [];
const imgFiles = [];
const fileFiles = [];
const htmlFiles = [];

function doWatchify(jsConfig) {
	// 在这里添加自定义 browserify 选项
	var browserifyOpts = {
		entries: jsConfig.files,
		debug: true,
		transform: [reactify]
	};

	var opts = Object.assign({}, watchify.args, browserifyOpts);
	var b = watchify(browserify(opts));
	// 当任何依赖发生改变的时候，运行打包工具
	b.on('update', bundle.bind(global, b, jsConfig));
	// 输出编译日志到终端
	b.on('log', gutil.log); 
	return b;
}

function bundle(b, jsConfig) {
	// gulp 希望任务能返回一个 stream，因此我们在这里创建一个
	let bundledStream = through();

	bundledStream
	// 将输出的 stream 转化成为一个包含 gulp 插件所期许的一些属性的 stream
	.pipe(source((jsConfig.output||"index")+".min.js"))
	.pipe(buffer())
	.pipe(sourcemaps.init({loadMaps: true}))
	// 在这里将相应 gulp 插件加入管道
	.pipe(uglify())
	.on("error", gutil.log)
	.pipe(sourcemaps.write("./"))
	.pipe(gulp.dest((jsConfig.basePath||".")+"/dist/"+(jsConfig.dirname||"js")+"/"));

	del([(jsConfig.basePath||".")+"/dist/js/"+(jsConfig.output||"index")+".min.js", (jsConfig.basePath||".")+"/dist/js/"+(jsConfig.output||"index")+".min.js.map"]);

	// 将 Browserify stream 接入到我们之前创建的 stream 中去
	// 这里是 gulp 式管道正式开始的地方
	b.bundle().pipe(bundledStream);

	// 最后，我们返回这个 stream，这样 gulp 会知道什么时候这个任务会完成
	return bundledStream;
}

function buildCss(file) {
	return gulp.src(file.files)
			.pipe(less())
			.pipe(sass())
			.pipe(sourcemaps.init({loadMaps: true}))
			.pipe(concat("all.css"))
			.pipe(uglifycss({
				uglyComments: true
			}))
			.pipe(rename({
				basename: file.output || "index",
				suffix: file.extname || ".min",
				extname: file.suffix || ".css"
			}))
			.pipe(sourcemaps.write("."))
			.pipe(gulp.dest((file.basePath||".")+"/dist/"+(file.dirname||"css")+"/"));
}

function buildImg(file) {
	return gulp.src(file.files)
			.pipe(cache(imagemin({
				progressive: file.progressive || false,
				interlaced: file.interlaced || false,
				multipass: file.multipass || false,
				optimizationLevel: file.optimizationLevel || 3
			})))
			.pipe(gulp.dest((file.basePath||".")+"/dist/"+(file.dirname||"img")+"/"));
}

function buildFile(file) {
	return gulp.src(file.files)
			.pipe(gulp.dest((file.basePath||".")+"/dist/"+(file.dirname || "file")+"/"));
}

function doLint(files, exit) {
	return gulp.src(files)
			.pipe(eslint({
				rules: {
					"block-scoped-var": 0,
					"camelcase": 2
		        }
			}))
			.pipe(eslint.format())
			.pipe(exit ? eslint.failAfterError() : eslint.result(function () {}));
}

function initJsTask() {
	let obj = {};

	if("[object Array]"===toString.call(jsConfig)) {
		[].forEach.call(jsConfig, function(js, index) {
			var taskName = "buildJS-"+index;

			gulp.task(taskName, () => {
				if(!obj[(js.basePath||".")]) {
					return del([(js.basePath||".")+"/dist/"+(js.dirname||"js")]).then(function() {
						return bundle.call(global, doWatchify.call(global, js), js);
					});

					obj[(js.basePath||".")] = 1;
				} else {
					return bundle.call(global, doWatchify.call(global, js), js);
				}
			});

			[].push.apply(jsFiles, "[object Array]"===toString.call(js.files)?js.files:[js.files]);
			jsTasks.push(taskName);
		});
	} else {
		gulp.task("buildJS", () => {
			if(!obj[(jsConfig.basePath||".")]) {
				return del([(jsConfig.basePath||".")+"/dist/"+(jsConfig.dirname||"js")]).then(function() {
					return bundle.call(global, doWatchify.call(global, jsConfig), jsConfig);
				});

				obj[(jsConfig.basePath||".")] = 1;
			} else {
				return bundle.call(global, doWatchify.call(global, jsConfig), jsConfig);
			}
		});

		[].push.apply(jsFiles, "[object Array]"===toString.call(jsConfig.files)?jsConfig.files:[jsConfig.files]);
		jsTasks.push("buildJS");
	}
}

function initCssTask() {
	let obj = {};

	if("[object Array]"===toString.call(cssConfig)) {
		[].forEach.call(cssConfig, function(css, index) {
			var taskName = "buildCSS-"+index;

			gulp.task(taskName, () => {
				if(!obj[(css.basePath||".")]) {
					return del([(css.basePath||".")+"/dist/"+(css.dirname||"css")]).then(function() {
						return buildCss(css);
					});

					obj[(css.basePath||".")] = 1;
				} else {
					return buildCss(css);
				}
			});

			watch(css.files, {events: ['add', 'change', 'unlink'], read: false}, function() {
				gulp.start(taskName);
				browserSync.reload();
			});

			[].push.apply(cssFiles, "[object Array]"===toString.call(css.files)?css.files:[css.files]);
			cssTasks.push(taskName);
		});
	} else {
		gulp.task("buildCSS", () => {
			if(!obj[(cssConfig.basePath||".")]) {
				return del([(cssConfig.basePath||".")+"/dist/"+(cssConfig.dirname||"css")]).then(function() {
					return buildCss(cssConfig);
				});

				obj[(cssConfig.basePath||".")] = 1;
			} else {
				return buildCss(cssConfig);
			}
		});

		watch(cssConfig.files, {events: ['add', 'change', 'unlink'], read: false}, function() {
			gulp.start("buildCSS");
			browserSync.reload();
		});

		[].push.apply(cssFiles, "[object Array]"===toString.call(cssConfig.files)?cssConfig.files:[cssConfig.files]);
		cssTasks.push("buildCSS");
	}
}

function initImgTask() {
	let obj = {};

	if("[object Array]"===toString.call(imgConfig)) {
		[].forEach.call(imgConfig, function(img, index) {
			var taskName = "buildIMG-"+index;

			gulp.task(taskName, () => {
				if(!obj[(img.basePath||".")]) {
					return del([(img.basePath||".")+"/dist/"+(img.dirname||"img")]).then(function() {
						return buildImg(img);
					});

					obj[(img.basePath||".")] = 1;
				} else {
					return buildImg(img);
				}
			});

			watch(img.files, {events: ['add', 'change', 'unlink'], read: false}, function() {
				gulp.start(taskName);
				browserSync.reload();
			});

			[].push.apply(imgFiles, "[object Array]"===toString.call(img.files)?img.files:[img.files]);
			imgTasks.push(taskName);
		});
	} else {
		gulp.task("buildIMG", () => {
			if(!obj[(imgConfig.basePath||".")]) {
				return del([(imgConfig.basePath||".")+"/dist/"+(imgConfig.dirname||"img")]).then(function() {
					return buildImg(imgConfig);
				});

				obj[(imgConfig.basePath||".")] = 1;
			} else {
				return buildImg(imgConfig);
			}
		});

		watch(imgConfig.files, {events: ['add', 'change', 'unlink'], read: false}, function() {
			gulp.start("buildIMG");
			browserSync.reload();
		});

		[].push.apply(imgFiles, "[object Array]"===toString.call(imgConfig.files)?imgConfig.files:[imgConfig.files]);
		imgTasks.push("buildIMG");
	}
}

function initFileTask() {
	let obj = {};

	if("[object Array]"===toString.call(fileConfig)) {
		[].forEach.call(fileConfig, function(file, index) {
			var taskName = "buildFILE-"+index;

			gulp.task(taskName, () => {
				if(!obj[(file.basePath||".")]) {
					return del([(file.basePath||".")+"/dist/"+(file.dirname||"file")]).then(function() {
						return buildFile(file);
					});

					obj[(file.basePath||".")] = 1;
				} else {
					return buildFile(file);
				}
			});

			watch(file.files, {events: ['add', 'change', 'unlink'], read: false}, function() {
				gulp.start(taskName);
				browserSync.reload();
			});

			[].push.apply(fileFiles, "[object Array]"===toString.call(file.files)?file.files:[file.files]);
			fileTasks.push(taskName);
		});
	} else {
		gulp.task("buildFILE", () => {
			if(!obj[(fileConfig.basePath||".")]) {
				return del([(fileConfig.basePath||".")+"/dist/"+(fileConfig.dirname||"file")]).then(function() {
					return buildFile(fileConfig);
				});

				obj[(fileConfig.basePath)||"."] = 1;
			} else {
				return buildFile(fileConfig);
			}
		});

		watch(fileConfig.files, {events: ['add', 'change', 'unlink'], read: false}, function() {
			gulp.start("buildFILE");
			browserSync.reload();
		});

		[].push.apply(fileFiles, "[object Array]"===toString.call(fileConfig.files)?fileConfig.files:[fileConfig.files]);
		fileTasks.push("buildFILE");
	}
}

jsConfig && initJsTask();
cssConfig && initCssTask();
imgConfig && initImgTask();
fileConfig && initFileTask();

gulp.task("lint", () => {
	return doLint([].concat.apply(jsFiles, ["gulpfile.js", "file.config.js"]), true);
});

//服务任务
gulp.task("server", () => {
	let opts = {
		ui: false,
		open: "external",
		logLevel: "debug",
		reloadDelay: 100,
		logFileChanges: true,
		host: config.host||"localhost",
		port: config.port||3000,
		https: !!config.https,
		startPath: config.homePage||"",
		browser: config.browser||["firefox", "chrome", "explorer"]
	};

	if(config.proxy) {
		opts.proxy = config.proxy;
	} else {
		opts.server = { baseDir: config.pagePath||"./" };
	}

	browserSync.init(opts);	
});

gulp.task("releaseJs", [].concat.apply(["lint"], jsTasks));
gulp.task("releaseCss", cssTasks);
gulp.task("releaseImg", imgTasks);
gulp.task("releaseFile", fileTasks);
gulp.task("default", ["releaseJs", "releaseCss", "releaseImg", "releaseFile", "server"]);