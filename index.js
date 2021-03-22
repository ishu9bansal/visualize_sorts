const offset = 10;
const nodeTransition = 500;
const renderingLimit = 5;	// approx time render method can take (depends on machine and method complexity)
const humanWaitTime = 10000;
const shufflePeriod = 2000;
const nodeColor = 'black';
const lineColor = 'pink';
const boxFontColor = 'black';
const boxColor = 'aqua';
const boxOpacity = 0.5;
const boxWidth = 100;
const boxHeight = 63;
const boxX = x => x - boxWidth/2;
const boxY = y => y - boxHeight/2;
const layers = [
	'line',
	'node',
	'control'
];

var controlWidth;
var nodeRadius;
var data;
var limit;
var svg;
var width;
var height;
var layer;
var chartScaleY;
var chartScaleX;
var colorScale;
var index;
var nodes;
var lines;
var sortedFrom;
var order;
var canvas;

function render(period, resolve){
	setTimeout(resolve, period);
	// var t = svg.transition().duration(period).on('end', resolve);
	nodes
	// .transition(t)
	.attr('cx', (d,i) => chartScaleX(i))
	.attr('cy', (d,i) => chartScaleY(data[i]));

	// layer['line'].selectAll('line')
	// .data(lines, d => d.name)
	// .join(
	// 	enter => enter.append('line')
	// 	.style('stroke-width', nodeRadius)
	// 	.style('stroke', d => d.color)
	// 	.attr('x1', d => d.x1).attr('y1', d => d.y1)
	// 	.attr('x2', d => d.x1).attr('y2', d => d.y1)
	// 	.call(enter => enter.transition(t)
	// 		.attr('x2', d => d.x1).attr('y2', d => d.y1)
	// 	),
	// 	update => update.call(update => update.transition(t)
	// 		.attr('x1', d => d.x1).attr('y1', d => d.y1)
	// 		.attr('x2', d => d.x2).attr('y2', d => d.y2)
	// 	),
	// 	exit => exit.call(exit => exit.transition(t)
	// 		.attr('x1', d => d.x2).attr('y1', d => d.y2)
	// 		.attr('x2', d => d.x2).attr('y2', d => d.y2)
	// 		.remove()
	// 	)
	// );

	line_update = layer['line']
	.selectAll('line.line').data(lines, d => d.name);

	line_update.exit()
	// .transition(t)
	.attr('x1', d => d.x2).attr('y1', d => d.y2)
	.attr('x2', d => d.x2).attr('y2', d => d.y2)
	.remove();

	line_update.enter().append('line').classed('line', true)
	.style('stroke-width', nodeRadius)
	.style('stroke', d => d.color)
	.attr('x1', d => d.x1).attr('y1', d => d.y1)
	.attr('x2', d => d.x1).attr('y2', d => d.y1);

	layer['line']
	.selectAll('line.line')
	// .transition(t)
	.attr('x1', d => d.x1).attr('y1', d => d.y1)
	.attr('x2', d => d.x2).attr('y2', d => d.y2);
	
}

function lineHandler(lineName, lineData){
	var i = lines.findIndex(d => d.name==lineName);
	if(i!=-1&&lineData)	lines[i] = lineData;
	else if(lineData)	lines.push(lineData);
	else if(i!=-1)	lines.splice(i,1);
}

function indexLine(i){
	var lineName = 'index';
	lineHandler(lineName, i<0||i>=limit?null:{
		name: lineName,
		color: 'pink',
		x1: chartScaleX(i),
		x2: chartScaleX(i),
		y1: chartScaleY(0),
		y2: chartScaleY(data[i])
	});
}

function refLine(i){
	var lineName = 'ref';
	lineHandler(lineName, i<0||i>=limit?null:{
		name: lineName,
		color: 'aqua',
		x1: chartScaleX(i),
		x2: chartScaleX(i),
		y1: chartScaleY(limit-1),
		y2: chartScaleY(data[i])
	});
}

async function shuffle(){
	var tick = renderingLimit;
	var period = shufflePeriod/data.length/2;
	var skipper = 1;
	if(period<tick){
		skipper = Math.ceil(data.length*2*tick/shufflePeriod);
		period = tick;
	}
	for(var i=data.length-1; i>=0; i--){
		r = Math.floor(i*Math.random());
		indexLine(r);
		refLine(i);
		if(!(i%skipper))
		await new Promise(res => render(period, res));
		var t = data[i];
		data[i] = data[r];
		data[r] = t;
		indexLine(r);
		refLine(i);
		if(!(i%skipper))
		await new Promise(res => render(period, res));
	}
	indexLine(limit);
	refLine(limit);
	render(period);
	sortedFrom = data.length;
}



async function sort(){
	var tick = renderingLimit;
	var skipper;
	var renderPerLoop = humanWaitTime/tick/sortedFrom;
	while(sortedFrom){
		var l = --sortedFrom;
		skipper = Math.ceil(l/renderPerLoop);
		for(var i=0; i<l; i++){
			indexLine(i);
			if(!(i%skipper))
			await new Promise(r => render(tick, r));
			if(data[i]<=data[i+1])	continue;
			var t = data[i];
			data[i] = data[i+1];
			data[i+1] = t;
		}
		indexLine(l);
		await new Promise(r => render(tick, r));
	}
	indexLine(limit);
	render(tick);
}

function changeOrder(o){
	// only allow a few orders
	if(o<2||o>11)	return;

	// set global vars
	order = o;
	limit = 1<<order;
	data = [];
	for(var i=0; i<limit; i++)
		data.push(i);
	sortedFrom = 0;

	nodeRadius = Math.max(2,width/limit)/2;

	chartScaleY = d3.scaleLinear().domain([0,limit-1]).range([0,height]);
	chartScaleX = d3.scaleLinear().domain([0,limit-1]).range([0,width]);

	canvas.fillStyle = 'white';
	canvas.fillRect(0,0,width,height);

	canvas.fillStyle = 'black';
	for(var i=0; i<limit; i++){
		canvas.beginPath();
		canvas.arc(chartScaleX(i), chartScaleY(data[i]), nodeRadius, 0, 2*Math.PI);
		canvas.fill();
	}

	// // animate entry and exit
	// var t = svg.transition().duration(nodeTransition);

	// node_update = layer['node']
	// .selectAll('circle.node').data(data);

	// nodes_enter = node_update.enter().append('circle')
	// .classed('node', true).attr('r', 0)
	// .attr('cx', (d,i) => chartScaleX(i))
	// .attr('cy', (d,i) => chartScaleY(0))
	// .style('fill', nodeColor);

	// node_update.exit().transition(t)
	// .attr('cy', (d,i) => chartScaleY(limit))
	// .attr('r', 0).remove();

	// node_update = node_update.merge(nodes_enter)
	// node_update.transition(t)
	// .attr('cx', (d,i) => chartScaleX(i))
	// .attr('cy', (d,i) => chartScaleY(data[i]))
	// .attr('r', nodeRadius);

	// // set global nodes
	// nodes = node_update;

	// // as nodes is only used in render and which is callled upon user click only
	// // hence the above assignment can be skipped and render method can directly fetch the latest nodes from d3 seledtion
}

function addControlButton(x, y, text, lambda){
	// add text for control button
	layer['control'].append('text').classed(text, true)
	.attr('x', x).attr('y', y)
	.style('font-size', 20).style('fill', boxFontColor)
	.attr("dominant-baseline", "middle").attr("text-anchor", "middle")
	.text(text);
	// add button
	layer['control'].append('rect').classed(text, true)
	.attr('x', boxX(x)).attr('y', boxY(y))
	.attr('width', boxWidth).attr('height', boxHeight)
	.style('opacity', boxOpacity).style('fill', boxColor)
	.on('click', lambda);
}

function randn_bm() {
	// https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve/36481059#36481059
	let u = 0, v = 0;
	while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
	while(v === 0) v = Math.random();
	let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
	num = num / 10.0 + 0.5; // Translate to 0 -> 1
	if (num > 1 || num < 0) return randn_bm() // resample between 0 and 1
	return num
}

function getRandomOrder(){
	return Math.floor(d3.scaleLinear().domain([0,1]).range([3,11])(randn_bm()));
}

function init(){
	// set height and width of the svg element
	width = window.innerWidth - 2*offset;
	height = window.innerHeight - 2*offset;

	canvas = d3.select("canvas")
	.attr("width", width).attr("height", height)
	.style("top", offset).style("left", offset);
	canvas = canvas.node().getContext('2d');

	svg = d3.select("svg")
	.attr("width", width).attr("height", height)
	.style("top", offset).style("left", offset);

	// add layers to the svg
	layer = {};
	for(var i of layers){
		layer[i] = svg.append('g');
	}

	// controller buttons
	addControlButton(boxWidth, height - boxHeight, 'sort', sort);
	addControlButton(width - boxWidth, boxHeight, 'shuffle', shuffle);
	// addControlButton(width/2, height/2, 'order', () => changeOrder(Math.floor(10*Math.random())));

	// set initial order and lines
	lines = [];
	changeOrder(getRandomOrder());
}

init();
