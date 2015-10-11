
var DX=[-2,-1,0,0,0,0,1,2];
var DY=[0,0,-2,-1,1,2,0,0];
var c = $('#canvas');
var ctx = c[0].getContext('2d');

var status = 0;	//0:设置 1:运行
var timerID;
var time = 400;

var width = 100;
var height = 70;
var cellPixel = 100;
var selectMinPixel = 10;
var playMinPixel = 5;

var map, mapold;	//0:死 1:活 2墙

function init() {
	screenW = window.screen.availWidth - 31;
	screenH = $(window).height() - 51;
	c.click(function(ev) {
		if(status == 0) {
			x = getBlockNumber(ev.offsetX);
			y = getBlockNumber(ev.offsetY);
			if(map[x][y] != 1) {
				map[x][y] = 1;
				paintBlockAt(x, y, 1);
			}
			else {
				map[x][y] = 0;
				paintBlockAt(x, y, 0);
			}
		}
	});

	c.rightClick(function(ev) {
		if(status == 0) {
			x = getBlockNumber(ev.offsetX);
			y = getBlockNumber(ev.offsetY);
			if(map[x][y] != 2) {
				map[x][y] = 2;
				paintBlockAt(x, y, 2);
			}
			else {
				map[x][y] = 0;
				paintBlockAt(x, y, 0);
			}
		}
	});

	buildMapArray();
	buildMap(playMinPixel);
	randomStart(0.6);
}

function buildMapArray() {
	map = new Array(width);
	mapold = new Array(width);
	for(var i = 0; i < width; i++) {
		map[i] = new Array(height);
		mapold[i] = new Array(height);
		for(var j = 0; j < width; j++) {
			mapold[i][j] = map[i][j] = 0;
		}
	}
}

function drawFrame() {
	ctx.fillStyle = "#fff";
	ctx.fillRect(0, 0, cellPixel * width, cellPixel * height);
	ctx.beginPath();
	ctx.lineWidth = 1;
	ctx.strokeStyle = '#aaa';
	for(var i = 0; i <= width; i ++) {
		ctx.moveTo(i * cellPixel, 0);
		ctx.lineTo(i * cellPixel, height * cellPixel);
	}
	for(var i = 0; i <= height; i++) {
		ctx.moveTo(0, i * cellPixel);
		ctx.lineTo(width * cellPixel, i * cellPixel);
	}
	ctx.stroke();
}

function drawCell() {
	for(var i = 0; i < width; i++) {
		for(var j = 0; j < height; j++) {
			paintBlockAt(i, j, map[i][j]);
		}
	}
}

//w, h
function buildMap(minPixel) {
	cellPixel = parseInt(Math.min(screenH / height, screenW / width));
	if(cellPixel < minPixel)
		cellPixel = minPixel;
	c.attr('width', cellPixel * width + "px");
	c.attr('height', cellPixel * height + "px");
	drawFrame();
	drawCell();
}

function getBlockNumber(x) {
	return parseInt(x / cellPixel);
}

function isCheckable(x, y) {
	return x >= 0 && y >= 0 && x < width && y < height;
} 

function paintBlockAt(x, y, t) {
	if(t == 0) ctx.fillStyle = "#fff";
	else if(t == 1) ctx.fillStyle = "#000";
	else ctx.fillStyle = "#a00";
	ctx.fillRect(x * cellPixel + 1, y * cellPixel + 1, cellPixel - 2, cellPixel - 2);
}

function timer() {
	for(var i = 0; i < width; i++) {
		for(var j = 0; j < height; j++) {
			mapold[i][j] = map[i][j];
		}
	}
	for(var i = 0; i < width; i++) {
		for(var j = 0; j < height; j++) {
			if(mapold[i][j] == 2) {
				continue;
			}
			var num = 0;
			for(var k = 0; k < 8; k++) {
				var nowX = i + DX[k];
				var nowY = j + DY[k];
				if(isCheckable(nowX, nowY) && mapold[nowX][nowY] == 1) {
					num++;
				}
			}
			if(num == 3) {
				if(map[i][j] == 0) {
					map[i][j] = 1;
					paintBlockAt(i, j, 1);
				}
			}
			else if(num != 2 && map[i][j] == 1) {
				map[i][j] = 0;
				paintBlockAt(i, j, 0);
			}
		}
	}
	timerID = setTimeout(timer, time);
}

function randomStart(ratio) {
	for(var i = 0; i < width; i++) {
		for(var j = 0; j < height; j++) {
			if(map[i][j] != 2) {
				if(Math.random() > ratio) {
					map[i][j] = 1;
					paintBlockAt(i, j, 1);
				}
				else {
					map[i][j] = 0;
					paintBlockAt(i, j, 0);
				}
			}
		}
	}
	start();
}

function start() {
	status = 1;
	buildMap(playMinPixel);
	timerID = setTimeout(timer, 200);
	$('#restart')[0].innerHTML = "重新开始";
}

function random() {
	bootbox.prompt({
		title: "请输入每个方块成为活细胞的概率，为一个0~1区间的浮点数",
		value: 0.6,
		callback: function(result) {
			if(result === null || isNaN(result) || result < 0 || result > 1) {
				bootbox.alert("非法输入!");
			} else {
				randomStart(1 - result);
			}
		}
	});
}

function restart() {
	if(status == 0) {
		start();
	}
	else {
		$('#restart')[0].innerHTML = "布置完成";
		clearTimeout(timerID);
		bootbox.prompt({
			title: "请输入列数，应为一个正整数",
			value: width, 
			callback: function(result) {
				if(result === null || isNaN(result) || result <= 0 || parseInt(result) != result ) {
					bootbox.alert("非法输入!");
					restartBuildMap();
				} else {
					width = result;
					$('#width')[0].innerHTML = "列数：" + width;
					//////////////////////////////////////
					bootbox.prompt({
						title: "请输入行数，应为一个正整数",
						value: height, 
						callback: function(result) {
							if(result === null || isNaN(result) || result <= 0 || parseInt(result) != result ) {
								bootbox.alert("非法输入!");
								restartBuildMap();
							} else {
								height = result;
								$('#height')[0].innerHTML = "行数：" + height;
								///////////////////////////////////
								bootbox.prompt({
									title: "请输入时间间隔（ms），应为一个不小于100的正整数",
									value: time, 
									callback: function(result) {
										if(result === null || isNaN(result) || result < 100 || parseInt(result) != result ) {
											bootbox.alert("非法输入!");
										} else {
											time = result;
											$('#time')[0].innerHTML = "时间间隔：" + time + "ms";
										}
										restartBuildMap();
									}
								});
								////////////////////////////////////
							}
						}
					});
					//////////////////////////////////////
				}
			}
		});
		
	}
}

function restartBuildMap() {
	status = 0;
	buildMapArray();
	buildMap(selectMinPixel);
}

init();


