const offset = 10;
const order = 10;
const period = 1000;
const quick = 200;
const nodeRadius = 1;
const nodeColor = 'aqua';
const lineColor = 'pink';
const layers = [
	'chart'
];

var data;
var limit;
var svg;
var width;
var height;
var layer;
var chartScaleY;
var chartScaleX;
var index;

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

	layer['chart'].selectAll('circle.node')
	.data(data).enter().append('circle')
	.classed('node', true).attr('r', nodeRadius)
	.attr('cx', (d,i) => chartScaleX(i))
	.attr('cy', (d,i) => chartScaleY(d))
	.style('fill', nodeColor);

	index = Math.floor(limit*Math.random());
	layer['chart'].append('line').classed('index', true)
	.attr('x1', chartScaleX(index)).attr('x2', chartScaleX(index))
	.attr('y1', 0).attr('y2', chartScaleY(data[index]))
	.style('stroke', lineColor);
}

init();
