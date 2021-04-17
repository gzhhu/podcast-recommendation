// v5 basic scatterplot: https://bl.ocks.org/d3noob/a44d21b304b9f7260a284b1883232002
// size of dot variation: https://www.d3-graph-gallery.com/graph/bubblemap_circleFeatures.html
// tooltip: http://bl.ocks.org/woodyrew/645d0258415db9205da52cb0e049ca28

function make_scatterplot(scatterplot_list){
// set the dimensions and margins of the graph

// clear old plots
d3.select("#scatterplot").html("");

var margin = {top: 100, right: 250, bottom: 100, left: 100},
width = 800 - margin.left - margin.right,
height = 600 - margin.top - margin.bottom;

// set the ranges
var x = d3.scaleLinear()
          .range([0, width]);
var y = d3.scaleLinear()
          .range([height, 0]);

// define tooltip
const div = d3.select('#scatterplot')
  .append('div')
  .attr('class', 'tooltip')
  .style('opacity', 0);

const min_circle_radius = 1
const max_circle_radius = 20

// append the svg object to the body of the page
var svg = d3.select('#scatterplot')//"#scatterplot")
            // .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Read the data
// d3.csv("scatterplot_podcast_raw.csv").then(function(data) {
data = scatterplot_list
// format the data
data.forEach(function(d) {
    d.name = d.name;
    d.duration_hours = +d.total_duration/3600
    d.avg_review_score = +d.avg_review_score;
    d.num_reviews = +d.num_reviews;

});

// Scale the range of the data
x.domain([1,5]); // Can change between 1 and 3 for full range or better range
y.domain([0, d3.max(data, function(d) { return +d.duration_hours; })]);

// Add a scale for bubble size
var size = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) { return d.num_reviews})])  // What's in the data
    .range([min_circle_radius, max_circle_radius])  // Size in pixel

var max_reviews = d3.max(data, function(d) { return +d.num_reviews})
var min_reviews = d3.min(data, function(d) { return +d.num_reviews})

// Add X axis label   
svg.append("text")
    .attr("x", width / 2 )
    .attr("y", height + margin.bottom / 2)
    .style("text-anchor", "middle")
    .text("Podcast Average Rating");

// Add Y axis label
svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x",0 - (height / 2))
    .attr("y", 0 - margin.left * 2 / 3)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Total Duration (Hours)");  

// Add Chart Title
svg.append("text")
    .attr("x", (width / 2))             
    .attr("y", -15)
    .attr("text-anchor", "middle")  
    .style("font-size", "24px") 
    .attr("font-weight",function(d,i) {return 700;}) // Boldness is between 100 - 900
    .text("Top Podcasts");

// Add Legend

// Big Circle Drawing - max_circle_radius
svg.append("circle")
    .attr("cx", width + margin.right/3 + 5)
    .attr("cy", height-52)
    .attr("r", 20)
    .text("legend")
    .attr("fill", "grey")
    .attr("stroke","black")

// Big Circle Text - max_circle_radius
svg.append("text")
    .attr("x", width + margin.right/3 + 30)
    .attr("y", height-48)
    .style("font-size", "12px") 
    .attr("font-weight",function(d,i) {return 500;}) // Boldness is between 100 - 900
    .attr("stroke", "black")
    .text(max_reviews +" Reviews")//d3.max(data, function(d) { d.duration_hours }))

// Small Circle Drawing - min_circle_radius
svg.append("circle")
    .attr("cx", width + margin.right/3 + 5)
    .attr("cy", height-85)
    .attr("r", 1)
    .text("legend")
    .attr("fill", "none")
    .attr("stroke","black")

// Small Circle - min_circle_radius
svg.append("text")
    .attr("x", width + margin.right/3 + 30)
    .attr("y", height-85)
    .style("font-size", "12px") 
    .attr("font-weight",function(d,i) {return 500;}) // Boldness is between 100 - 900
    .attr("stroke", "black")
    .text(min_reviews+" Review");

// Legend Box
svg.append("rect")
    .attr("x", width + 58)
    .attr("y", height - 105)
    .attr("width", 125)
    .attr("height", 85)
    .style("fill", "none")
    .style("stroke", "black")
    .style("stroke-width", "1px");

var tooltip = d3.tip()
    .attr("class", "d3-tip")
    .style("opacity", 0)
    // .offset([-5,0])
    .html(function (d) {
        console.log(d)
        return ('Podcast: '.bold()+d.name + '<br/>' + 'Rating: '.bold()+d.avg_review_score.toFixed(1) + '<br/>' + 'Duration: '.bold()+d.duration_hours.toFixed(1) + '<br/>' + 'Reviews: '.bold()+d.num_reviews)

    })

var tipg = d3.select("#my-tooltip").attr("width", width).attr("height", height)

tipg.append('rect').attr('id', 'tiparea')

svg.call(tooltip)

var color = d3.scaleOrdinal(d3.schemeBlues[5])

// Add the scatterplot
svg.selectAll("dot")
    .data(data)
      .enter().append("circle")
    .attr("r", function(d) { return size(d.num_reviews)})
    .attr("cx", function(d) { return x(d.avg_review_score); })
    .attr("cy", function(d) { return y(d.duration_hours); })
    .attr("stroke-width", 3)
    // .attr("fill-opacity", .4)
    .attr("fill", function(d) {return color(d.avg_review_score)})
    .style('cursor', 'pointer')
    .on('mouseover', d => {
      tooltip.show(d)
      tooltip.style('top', (d3.event.pageY + 20) + "px")
      tooltip.style('left', (d3.event.pageX + 20) + "px")
   
    })
    .on('mouseout', () => {
      div
        .transition()
        .duration(500)
        .style('opacity', 0);
    });


// Add the X Axis
svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

// Add the Y Axis
svg.append("g")
    .call(d3.axisLeft(y));

;
}