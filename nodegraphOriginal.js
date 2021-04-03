var width = 1200;
var height = 800;
var color = d3.scaleOrdinal(d3.schemeCategory10);

d3.json("podcast_graph.json").then(function(graph) {

    global_label = {
        'nodes': [],
        'links': []
    };

    graph.nodes.forEach(function(d, i) {
        global_label.nodes.push({node: d});
        global_label.nodes.push({node: d});
        global_label.links.push({
            source: i * 2,
            target: i * 2 + 1
        });
    });

    // get a list of podcasts for suggestions
    all_podcasts = [];

    for (i=0; i<global_label.nodes.length; i++){
        // console.log(label.nodes[i])
        all_podcasts.push(global_label.nodes[i]['node']['name'])
    }

    all_podcasts_unique = d3.set(all_podcasts).values();

    // Jquery auto-complete suggestion
    $("#podcast_search_box").autocomplete({
        source: all_podcasts_unique
    })

    // Pressing enter on search
    $("podcast_search_box").keyup(function (e){
        if (e.keyCode == 13) {
            // 13 is the "Enter" key.
            console.log("Selected Podcast and pressed Enter");
            selected_podcast();
        }
    });
    
    
});


    // filter out the podcast

    function selected_podcast(){
        podcast = $('#podcast_search_box').val();

        if (all_podcasts_unique.indexOf(podcast) != -1){
            console.log("selected podcast -> SDFSDFSDsdfsdfsdfF ", podcast)
            make_directed_graph(podcast);
            // make_word_cloud(podcast);

            $.getScript("wordcloud.js", function(){
                make_word_cloud(podcast);
            })

            // $.getScript("stackedbarchart.js", function(){
            //     make_stacked_bar_chart(podcast);
            // })
                       
            // }
  
        };
    

    function change_word_cloud(podcast_name){
        $.getScript("wordcloud.js", function(){
            make_word_cloud(podcast_name);
        })
    }
    
    // function change_stacked_barchart(podcast_name){
    //     $.getScript("stackedbarchart.js", function(){
    //         make_stacked_bar_chart(podcast_name);
    //     })
    
    } // end of select_podcast
/* ##############################################################
##############################################################
######################## force direct graph ##################
##############################################################
##############################################################
############################################################## */
   
function make_directed_graph(podcast){
    // the podcast being input into this function will allow us to filter it out

    // the function below clears out the graph whenever we want to do something different
    d3.select("#viz").html("");

    d3.json("podcast_graph.json").then(function(graph) {

        label = {
            'nodes': [],
            'links': []
        };

        top10 = {
            'nodes': [],
            'links': []
        };

        // the group number is the look up ID for podcast
        var group_number = 0

        graph.nodes.forEach(function(d, i) {
            if (d.name != podcast) {
           
                label.nodes.push({node: d});
                label.nodes.push({node: d});
            } else {
                group_number = d.group
                top10.nodes.push({node: d});
                top10.nodes.push({node: d});
            }
            });
        
        // console.log("group number ->", group_number)

        graph.links.forEach(function(d) {
            // console.log("link source ->", d.source)
            if (d.source != group_number){
                label.links.push({
                    source: d.source,
                    target: d.target,
                    value: d.value
                    }) 
            } else {
                top10.links.push({
                    source: d.source,
                    target: d.target,
                    value: d.value
                })
            }
        })

        top10_list = []
        top10_values = []

        top10.links.forEach(function(d){
            // console.log("top 10 d", d.target)
            top10_list.push(d.target)
            top10_values.push(d.value)
        })

        // console.log(top10_list)
        // console.log(label)
        // console.log(top10)
        console.log(label.nodes)
        console.log(label.links)
 

        // get a list of podcasts for suggestions
        all_podcasts = [];

        for (i=0; i<label.nodes.length; i++){
            // console.log(label.nodes[i])
            all_podcasts.push(label.nodes[i]['node']['name'])
        }

    var labelLayout = d3.forceSimulation(label.nodes)
        .force("charge", d3.forceManyBody().strength(-50))
        .force("link", d3.forceLink(label.links).distance(0).strength(2));

    var graphLayout = d3.forceSimulation(graph.nodes)
        .force("charge", d3.forceManyBody().strength(-3000))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("x", d3.forceX(width / 2).strength(1))
        .force("y", d3.forceY(height / 2).strength(1))
        .force("link", d3.forceLink(graph.links).id(function(d) {return d.group; }).distance(50).strength(1))
        .on("tick", ticked);

    var adjlist = [];

    graph.links.forEach(function(d) {
        adjlist[d.source.index + "-" + d.target.index] = true;
        adjlist[d.target.index + "-" + d.source.index] = true;
    });

    function neigh(a, b) {
        return a == b || adjlist[a + "-" + b];
    }

    
    //  a line scale to determine the width of the lines depending on the similiarty score (value)
    var lineScale = d3.scaleSqrt().domain(d3.extent(top10_values)).range([0.5,5.5])

    // a scale similar to the above to change nodes for top 10
    var nodeScale = d3.scaleSqrt().domain(d3.extent(top10_values)).range([10,20])
    // console.log("top 10 values", top10_values)
    // console.log("linescale", lineScale)
    // console.log("nodeScale", nodeScale)

    var svg = d3.select("#viz").attr("width", width).attr("height", height);
    var container = svg.append("g");

    var tooltip = d3.tip()
        .attr("class", "d3-tip")
        .style("opacity", 0)
        // .offset([-5,0])
        .html(function (d) {
            console.log(d)
            var podcast_name = d.name
            var podcast_rating = "5.0" // need to edit this
            var podcast_review_count = 2324 // need to edit this
            var unique_words = 429 // need to edit this
            var podcast_description = 'BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH'
            var similarity_score = 0
            graph.links.forEach(function(e){
                if (e.target == d.group) {
                    similarity_score = e.value
                }
            })

            return ("<b>Podcast name</b>: " + podcast_name + "<br />"
                                + "<b>Avg Rating</b>: " + podcast_rating + "<br />"
                                + "<b>Total Review Count</b>: " + podcast_review_count + "<br />"
                                + "<b>Num. Unique Words</b>: " + unique_words + "<br />"
                                + "<b>Similarity Score</b>: " + similarity_score + "<br />"
                                + "<b>Podcast Description</b>: " + podcast_description )

            
        })
    
    var tipg = d3.select("#my-tooltip").attr("width", width).attr("height", height)
    
    tipg.append('rect').attr('id', 'tiparea')

        // svg.append('rect').attr('id','tiparea')    
  
   
    // allows zoom on double click
    svg.call(
        d3.zoom()
            .scaleExtent([.1, 1.5])
            .on("zoom", function() { container.attr("transform", d3.event.transform); }),
            tooltip
    );

      
    


    var link = container.append("g").attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter()
        .append("line")
        .attr("stroke", "#aaa")
        .attr("stroke-width", function(d){return lineScale(d.value)});
    
        

    var node = container.append("g").attr("class", "nodes")
        .selectAll("g")
        .data(graph.nodes)
        .enter()
        .append("circle")
        .attr("r", function(d){ 
            // console.log(d.group)
            // console.log(top10_list)
            if (group_number == d.group){
                return 25;}
            else if (top10_list.includes(d.group)) {
                // since graph.nodes and graph.links are different
                // we have to look up where node.group matches links.target
                top10.links.forEach(function(e){
                    if (e.target == d.group) {
                        group_value = e.value
                    }
                })
                //  console.log("group val", group_value)

                return nodeScale(group_value);
            } else {
                return 5;
            }
        })
        .attr("fill", function(d) { 
            // console.log(d.group)
            // console.log(top10_list)

            if (group_number == d.group){
                return "#0059FF";}
            else if (top10_list.includes(d.group)) {
                return "#0D99E3";
            } else {
                return "#E1E1E1";
                    }
                }
            )
        .on("dblclick", function(d, i){
            podcast_name = d.name
            console.log("dblclick podcast name", podcast_name)

            var index = d3.select(d3.event.target).datum().index;
            node.style("opacity", function(o) {
                return neigh(index, o.index) ? 1 : 0.1;
            });
            labelNode.attr("display", function(o) {
                return neigh(index, o.node.index) ? "block": "none";
            });
            link.style("opacity", function(o) {
                return o.source.index == index || o.target.index == index ? 1 : 0.1;
                         
            });
            // change word cloud
            change_word_cloud(podcast_name)   

            // change stacked bar graph
            change_stacked_barchart(podcast_name)

            // tool tip on double click
            tooltip.show(d)

            // this determines the ABSOLUTE position of the tooltip
            // i can't figure out how to make it relative
            // in certain situations, this blocks the search bar and intro
            tooltip.style('top', 650 + "px")
            tooltip.style('left', 30 + "px")
        })
        .on("click", function(d, i){
            labelNode.attr("display", "block");
            node.style("opacity", 1);
            link.style("opacity", 1)
        })

    
    node.call(tooltip)
    // node.on("mouseover", focus).on("mouseout", unfocus);


    node.call(
        d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
    );

    var labelNode = container.append("g").attr("class", "labelNodes")
        .selectAll("text")
        .data(label.nodes)
        .enter()
        .append("text")
        .text(function(d, i) { return d.node.name; })
        .attr("dx", 5)
        .attr("dy", "-.70em")
        .style("fill", "#555")
        .style("font-family", "Arial")
        .style("font-size", 12)
        .style("pointer-events", "none") // to prevent mouseover/drag capture
        


    // node.on("mouseover", focus).on("mouseout", unfocus);


    function ticked() {

        node.call(updateNode);
        link.call(updateLink);

        labelLayout.alphaTarget(0.3).restart();
        labelNode.each(function(d, i) {
            d.x = d.node.x
            d.y = d.node.y

        });
        labelNode.call(updateNode);

    }

    function fixna(x) {
        if (isFinite(x)) return x;
        return 0;
    }

    function focus(d) {
        var index = d3.select(this).datum().index;
        node.style("opacity", function(o) {
            return neigh(index, o.index) ? 1 : 0.1;
        });
        labelNode.attr("display", function(o) {
        return neigh(index, o.node.index) ? "block": "none";
        });
        link.style("opacity", function(o) {
            return o.source.index == index || o.target.index == index ? 1 : 0.1;
        });
    }

    function unfocus() {
    labelNode.attr("display", "block");
    node.style("opacity", 1);
    link.style("opacity", 1);
    }

    function updateLink(link) {
        link.attr("x1", function(d) { return fixna(d.source.x); })
            .attr("y1", function(d) { return fixna(d.source.y); })
            .attr("x2", function(d) { return fixna(d.target.x); })
            .attr("y2", function(d) { return fixna(d.target.y); });
    }

    function updateNode(node) {
        node.attr("transform", function(d) {
            return "translate(" + fixna(d.x) + "," + fixna(d.y) + ")";
        });
    }

    function dragstarted(d) {
        d3.event.sourceEvent.stopPropagation();
        if (!d3.event.active) graphLayout.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;

    }

    function dragended(d) {
        if (!d3.event.active) graphLayout.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }


    })
}