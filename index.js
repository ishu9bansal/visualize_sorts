const offset = 10;
const order = 8;
const nodeColor = 'black';
const lineColor = 'pink';
const layers = [
	'line',
	'node'
];

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
}

async function sort(){
	for(var l=data.length-1; l>=0; l--){
		for(var i=0; i<l; i++){
			index = i;
			render();
			await new Promise(r => setTimeout(r, 0));
			if(data[i]<=data[i+1])	continue;
			var t = data[i];
			data[i] = data[i+1];
			data[i+1] = t;
		}
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

	index = Math.floor(limit*Math.random());
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
