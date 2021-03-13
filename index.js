const offset = 10;
const order = 8;
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

function render(){
	nodes
	.attr('cx', (d,i) => chartScaleX(i))
	.attr('cy', (d,i) => chartScaleY(data[i]));

	lines
	.attr('x2', chartScaleX(index))
	.attr('x1', chartScaleX(index))
	.attr('y2', chartScaleY(data[index]||0))
	.attr('y1', 0);
}

// function lineHandler(lineName, index, color){
// 	if(color==null)	color = Math.random();
// 	var i = lines.findIndex(d => d.name==lineName);
// 	if(index<0||index>=limit&&i!=-1){
// 		lines[i] = lines[lines.length-1];
// 		lines.pop();
// 	}
// 	if(i==-1)	lines.push({
// 		name: lineName,
// 		color: color
// 	});
//	else	lines[i].index = index;
// }

async function shuffle(){
	for(var i=data.length-1; i>=0; i--){
		index = Math.floor(limit*Math.random());
		render();
		await new Promise(r => setTimeout(r, 0));
		var t = data[i];
		data[i] = data[index];
		data[index] = t;
	}
	index = -1;
	render();
	sortedFrom = data.length;
}

async function sort(){
	while(sortedFrom){
		var l = sortedFrom--;
		for(var i=0; i<l; i++){
			// index = i;
			// render();
			// await new Promise(r => setTimeout(r, 0));
			if(data[i]<=data[i+1])	continue;
			var t = data[i];
			data[i] = data[i+1];
			data[i+1] = t;
		}
		index = l;
		render();
		await new Promise(r => setTimeout(r, 0));
	}
	index = -1;
	render();
}

function init(){
	// calculate limit based on the order const
	limit = 1<<order;

	// init data
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

	index = -1;
	layer['line'].append('line').classed('index', true)
	.attr('x1', chartScaleX(index)).attr('x2', chartScaleX(index))
	.attr('y1', 0).attr('y2', chartScaleY(data[index]||0))
	.style('stroke-width', nodeRadius)
	.style('stroke', lineColor);

	layer['node'].selectAll('circle.node')
	.data(data).enter().append('circle')
	.classed('node', true).attr('r', nodeRadius)
	.attr('cx', (d,i) => chartScaleX(i))
	.attr('cy', (d,i) => chartScaleY(data[i]))
	.style('fill', nodeColor);

	nodes = layer['node'].selectAll('circle.node');
	lines = layer['line'].select('line.index');
}

init();
