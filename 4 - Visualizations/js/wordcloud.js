function make_word_cloud(podcast){

    // console.log("word cloud podcast ->", podcast)

    d3.select("#wordcloud").html("");

    // Add graph description above the graph
    d3.select("#wordcloud")
    .append("foreignObject")
    .attr("width", 500)
    .attr("height", 200)
    .append("xhtml:body")
    .style("font", "14px 'Helvetica Neue'")
    .html("<p><b>Word Cloud</b></p><p>The below is a word cloud created from our Bag-of-Words output. Word clouds are an important but simple visualization for any text based data analysis. Our model takes into account the frequency of the word as well as it's relevance (TD-IDF) to calculate importance. <br><br>The bigger and bolder the words appear in the cloud, the more often it is mentioned in the podcast description or user reviews. <br><br> <i>This visualzation changes upon clicking on a different node in the node graph.</i></p>")




    d3.json("data/top100_words.json").then(function(graph) {

    // console.log(graph)

    // list of words
    var myWords = []
    for (const [key, value] of Object.entries(graph)){
        if (key == podcast){
            myWords = value
            }
        };

    maxSize = d3.max(myWords, function(d) { return d.count; });
    minSize = d3.min(myWords, function(d) { return d.count; });

    // console.log(myWords)
    // console.log(maxSize)

    var fontScale = d3.scale.linear()
                        .domain([minSize, maxSize])
                        .range([15,85])


    // set the dimensions and margins of the graph
    var margin = {top: 200, right: 10, bottom: 10, left: 0},
        width = 500 - margin.left - margin.right,
        height = 750 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#wordcloud")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Wordcloud features that are different from one word to the other must be here
    var layout = d3.layout.cloud()
    .size([width, height])
    .words(myWords.map(function(d) { return {text: d.word, count:d.count}; }))
    .padding(2)        //space between words
    .rotate(function() { return ~~(Math.random() * 2) * 90; })
    .font("Arial")
    .fontSize(function(d) { return fontScale(d.count); })      // font size of words
    .on("end", draw);

    // initiate word cloud
    layout.start();


    // This function takes the output of 'layout' above and draw the words
    // Wordcloud features that are THE SAME from one word to the other can be here
    function draw(words) {
    svg.append("g")
        .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
        .selectAll("text")
            .data(words)
        .enter().append("text")
            .style("font-size", function(d) { return d.size +"px"; })
            .style("fill", "#0D99E3")
            .attr("text-anchor", "middle")
            .style("font-family", "Arial")
            .attr("transform", function(d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function(d) { return d.text; });
        }
    })
}
