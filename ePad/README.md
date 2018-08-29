### 介绍

电子白板

### 安装依赖项

```sh
npm install
```

### 运行Demo

```sh
npm run start
```

### 功能

教鞭, 笔, 线条, 方形, 圆, 文本, 图片, 橡皮擦, 导出, 清除, 颜色, 演示文档

### 例子

```javascript
//白板初始化，生成pad对象
var pad = wPad.init({
	id: 1,
	layout: "leftTop",
	vertical: false,
	disable: false,
	wrap: document.body,
	saveImgStep: 5,
	color: "#000",
	background: "#fff",
	eraserSize: 5,
	ferulaSize: 5,
	autoSaveTime: 5,
	onRender: function(data) {
		console.log(data);
	},
	onMousemove: function(data) {
		console.log(data);
	},
	onClear: function(id) {
		console.log("clear------"+id);
	}
});

//通过pad对象调用白板对外开放的接口
pad.render(data);
```

### 初始化参数

|名称|类型|说明|
|----|----|----|
|id|String|给创建的白板一个唯一的标识符|
|data|Object|白板数据|
|super|Boolean|表示用户为超级，有所有操作权限|
|layout|String|定义白板的工具栏的位置，有四个可选值["leftTop", "leftBottom", "rightTop", "rightBottom"]，分别表示：左上、左下、右上、右下，默认是左上|
|vertical|Boolean|定义白板的工具栏的布局方式，默认是横向排列，vertical表示纵向排列|
|disable|Boolean|定义白板是否有操作权限，默认是有操作权限|
|wrap|DOMElement|放白板的容器，DOM节点|
|autoSaveTime|Number|白板操作的数据保存的时间间隔，默认是10s，单位：(s)|
|saveImgStep|Number|白板操作的数据保存成图片需要预留的步数，为了减少浏览器缓存的数据，默认是5步|
|color|String|白板的默认颜色，默认是黑色|
|fullScreen|Boolean|是否要全屏按钮，默认有|
|background|String|白板的默认背景色，默认是白色|
|eraserSize|Number|橡皮擦的默认大小，默认是5px，单位：(px)|
|ferulaSize|Number|教鞭的默认大小，默认是5px，单位：(px)|
|noCache|Boolean|表示白板数据是否要在本地存储，默认存储|
|noToolbar|Boolean|表示是否显示工具条，默认为false|
|noTab|Boolean|表示是否显示下方的标签条，默认为false|
|splitpageLayout|String|表示分页页码显示在什么位置，["left", "cetner", "right"]，默认为:right|
|toolbars|Array|工具列表，默认："ferula", "pen", "line", "rectangle", "round", "text", "image", "eraser", "export", "clear", "color"|
|onRender|Function|白板操作的回调，当用户在白板上做任务操作，都会触发此回调，回调接受一个参数，为当前白板操作生成的数据，此数据可以直接传入需要同步的白板的render接口进行图像绘制|
|onMousemove|Function|监测鼠标在白板上移动的回调，回调接受一个参数，为当前鼠标在白板上的信息，此数据可以直接传入需要同步的白板的mouseCtrl接口进行鼠标移动|
|onClear|Function|清除白板触发的回调|
|onTabChange|Function|当用户激活白板下方的某个tab时触发此回调，回调接受一个参数，为当前的tab的唯一标识，此参数直接传入需要同步的白板的changeTab接口|
|onTabRemove|Function|当用户移除白板下方的某个tab时触发此回调，回调接受一个参数，为当前的tab的唯一标识，此参数直接传入需要同步的白板的removeTab接口|
|onPageTurn|Function|如果演示的文档有多页时会分页，切页时触发些回，回调接受一个参数，此参数直接传入需要同步的白板的turnPage接口|
|onShowFiles|Function|演示文档时的回调|
|onScroll|Function|滚动事件|

### 接口

|名称|说明|
|----|----|
|render|绘制接口，初始化参数中的onRender回调中的参数直接传入就可以绘制出同样的图案|
|mouseCtrl|绘制鼠标，初始化参数中的onMousemove回调中的参数直接传入可以同步鼠标|
|renderAll|同时绘制多个图案，参数类型为Array|
|clear|清空白板|
|disable|禁止使用白板|
|enable|允许使用白板|
|createImage|将白板中的所有数据生成图片并返回|
|changeTab|激活白板下面的某个tab，需要传入一个tab的唯一标识|
|turnPage|文档演示时进行同步翻页，需要传入由onPageTurn回调传出的参数|
|removeTab|移除白板下面的某个tab，需要传入一个tab的唯一标识|
|resize|手动触发白板大小变化，白板内容会重绘|
|fullScreen|全屏|
|cleanCache|清除缓存|
|scroll|如果出现滚动条，此接口有用，滚到指定位置，参数于onScroll事件抛出|
|exitFullScreen|退出全屏|
|getData|获取白板某页签下或所有数据，参数为页签id，如果不传入id返回白板所有数据|
|showFiles|演示文档，参数：<br\>{<br\>files: [],  //文件list<br\> newTab: true,  //生成一个新的tab<br\> isShow: true,  //立刻激活新tab<br\> from: "",   //由谁演示的文档<br\> tabId: "",  tab的唯一标识，可以不传<br\> tabName: "文档"   //tab名，可以不传<br\> }|