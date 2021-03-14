const offset = 10;
const order = 9;
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
	var period = shufflePeriod/data.length;
	for(var i=data.length-1; i>=0; i--){
		r = Math.floor(i*Math.random());
		indexLine(r);
		refLine(i);
		await new Promise(res => render(period, res));
		var t = data[i];
		data[i] = data[r];
		data[r] = t;
		indexLine(r);
		refLine(i);
		await new Promise(res => render(period, res));
	}
	indexLine(limit);
	refLine(limit);
	render(period);
	sortedFrom = data.length;
}

async function sort(){
	var tick = 1;
	while(sortedFrom){
		var l = --sortedFrom;
		for(var i=0; i<l; i++){
			// indexLine(i);
			// await new Promise(r => render(tick, r));
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

function init(){
	// calculate limit based on the order const
	limit = 1<<order;

	// init data
	lines = [];
	data = [];
	for(var i=0; i<limit; i++)
		data.push(i);

	sortedFrom = 0;
	// set height and width of the svg element
	width = window.innerWidth - 2*offset;
	height = window.innerHeight - 2*offset;

	nodeRadius = Math.max(2,width/limit)/2;

	svg = d3.select("svg")
	.attr("width", width).attr("height", height)
	.attr("x", offset).attr("y", offset);

	chartScaleY = d3.scaleLinear().domain([0,limit-1]).range([0,height]);
	chartScaleX = d3.scaleLinear().domain([0,limit-1]).range([0,width]);

	// add layers to the svg
	layer = {};
	for(var i of layers){
		layer[i] = svg.append('g');
	}

	// controller buttons
	layer['control'].append('text').classed('sort', true)
	.attr('x', (boxWidth)).attr('y', (height - boxHeight))
	.style('font-size', 20).style('fill', boxFontColor)
	.attr("dominant-baseline", "middle").attr("text-anchor", "middle")
	.text('sort');
	layer['control'].append('text').classed('shuffle', true)
	.attr('x', (width - boxWidth)).attr('y', (boxHeight))
	.style('font-size', 20).style('fill', boxFontColor)
	.attr("dominant-baseline", "middle").attr("text-anchor", "middle")
	.text('shuffle');
	layer['control'].append('rect').classed('sort', true)
	.attr('x', boxX(boxWidth)).attr('y', boxY(height - boxHeight))
	.attr('width', boxWidth).attr('height', boxHeight)
	.style('opacity', boxOpacity).style('fill', boxColor)
	.on('click', sort);
	layer['control'].append('rect').classed('shuffle', true)
	.attr('x', boxX(width - boxWidth)).attr('y', boxY(boxHeight))
	.attr('width', boxWidth).attr('height', boxHeight)
	.style('opacity', boxOpacity).style('fill', boxColor)
	.on('click', shuffle);

	// enter nodes
	layer['node'].selectAll('circle.node')
	.data(data).enter().append('circle')
	.classed('node', true).attr('r', nodeRadius)
	.attr('cx', (d,i) => chartScaleX(i))
	.attr('cy', (d,i) => chartScaleY(data[i]))
	.style('fill', nodeColor);

	nodes = layer['node'].selectAll('circle.node');
}

init();
