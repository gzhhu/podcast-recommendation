var width = 600;
var height = 600;
var color = d3.scaleOrdinal(d3.schemeCategory10);

d3.json("podcast_names_list.json").then(function(graph) {

    all_podcasts_unique = d3.set(graph).values();

    // Jquery auto-complete suggestion
    $.ui.autocomplete.prototype._renderItem = function( ul, item){
      var term = this.term.split(' ').join('|');
      var re = new RegExp("(" + term + ")", "gi") ;
      var t = item.label.replace(re,"<b>$1</b>");
      return $( "<li></li>" )
         .data( "item.autocomplete", item )
         .append( "<a>" + t + "</a>" )
         .appendTo( ul );
       };

    $("#podcast_search_box").autocomplete({
        minLength:2,
        delay:0,
        autoFocus:true,
        source: function (request, response) {
          var results = $.ui.autocomplete.filter(all_podcasts_unique, request.term);
          response(results.slice(0, 20));
        }
    });

    $("podcast_search_box").keyup(function (e){
        if (e.keyCode == 13) {
            // 13 is the "Enter" key.
            console.log("Selected Podcast and pressed Enter");
            selected_podcast();
        };
    });
});

// This is the configuration to import our master csv file via PapaParse https://www.papaparse.com/docs#config
// It requires a call back function to make data useable
function parseCSV(url, callBack){
    Papa.parse(url, {
        delimiter: "\t",	// since titles have commas, we are using a tab delimited file
        newline: "",	// auto-detect
        quoteChar: '"',
        escapeChar: '"',
        header: true,
        transformHeader: undefined,
        dynamicTyping: false,
        preview: 0,
        encoding: "",
        worker: false,
        comments: false,
        step: undefined,
        complete: undefined,
        error: undefined,
        download: false,
        downloadRequestHeaders: undefined,
        downloadRequestBody: undefined,
        skipEmptyLines: false,
        chunk: undefined,
        chunkSize: undefined,
        fastMode: undefined,
        beforeFirstChunk: undefined,
        withCredentials: undefined,
        transform: undefined,
        download: true,
        complete: function(results){
            callBack(results)
        }
    })
}



    // filter out the podcast

    function selected_podcast(){
        podcast = $('#podcast_search_box').val();

        if (all_podcasts_unique.indexOf(podcast) != -1){
            console.log("selected podcast -> ", podcast)

            // call back function to send podcast name and papaparse array to graph function
            function setVar(podcast_array){
                make_directed_graph(podcast, podcast_array)
            }
            parseCSV('podcast_clean_papa.csv', setVar)

                       
            }
  
        };
    

    function change_word_cloud(podcast_name){
        $.getScript("wordcloud.js", function(){
            make_word_cloud(podcast_name);
        })
    }

/* ##############################################################
##############################################################
######################## force direct graph ##################
##############################################################
##############################################################
############################################################## */


   
function make_directed_graph(podcast, podcast_dict){
    // the podcast being input into this function will allow us to filter it out

    // the function below clears out the graph whenever we want to do something different
    d3.select("#viz").html("");
    
    d3.json("recommendations_top10.json").then(function(graph) {
            top10 = {
                'nodes': [],
                'links': []
            };

            og_top_10 = []
        
    
            // the group number is the look up ID for podcast
            var group_number = 0
        
            // a foor loop to find group number from the list of 17k podcasts
            for (var i = 0; i < graph.nodes.length; i++){
                    if (graph.nodes[i]["name"] == podcast) {
                        group_number = graph.nodes[i]["group"]
                        top10.nodes.push(graph.nodes[i])
    
                           
                }
            }
            // console.log('the ringer node, should be 1', ringer_top10.nodes)
            // console.log('there should be 1 node only', top10.nodes)
            // console.log('group_number should be 0', group_number)
            
        
            // a for loop to find all the links from the user selection (group_number)
            for (var i = 0; i < graph.links.length; i++){
         
                    if (graph.links[i]["source"] == group_number){
                        // console.log(graph.links[i])
                        top10.links.push({source: graph.links[i]['source'],
                        target: graph.links[i]['target'],
                        value: graph.links[i]['value']
                    })
                        og_top_10.push(graph.links[i]['target'])
                  
                }
            }
            // console.log("top recommendation links", top10.links)
        
            // filter out targets from the links so we can do another filter
            top10_list = []
            for (var i = 0; i < top10.links.length; i++){
                // console.log(top10.links[i])
                top10_list.push(top10.links[i]['target'])
            }
            // console.log("list of top recommendation (targets)", top10_list)
        
            // a for loop to find all the node information from the targets and append them to nodes
            for (var i = 0; i < graph.nodes.length; i++){
                var node_group = graph.nodes[i]["group"]
                if (top10_list.indexOf(node_group) !== -1){
                    top10.nodes.push(graph.nodes[i])
                    // top10.nodes.push({node:graph.nodes[i]})
                }
            }
            // console.log("there should now be 6 nodes", top10.nodes)
            
            // these are the additional X2 recommendations to the original top X recommendations
            var extra_list = []
    
            // a for loop to find all the links of targets
            for (var i = 0; i < graph.links.length; i++){
                var node_group = graph.links[i]["source"]
                if (top10_list.indexOf(node_group) !== -1){
                    top10.links.push({source: graph.links[i]['source'],
                                      target: graph.links[i]['target'],
                                      value: graph.links[i]['value']   })
                                      extra_list.push(graph.links[i]['target'])
                }
            }
            console.log("there should now be 30 links", top10.links)
            // console.log("extra_list", extra_list)
    
            extra_list = [...new Set(extra_list)]
            // need to add these additional recommendations as nodes
            for (var i = 0; i < graph.nodes.length; i++){
                var node_group = graph.nodes[i]["group"]
    
             
                if (extra_list.indexOf(node_group) !== -1){
                    var exist = top10.nodes.filter(function(node) {
                        return node.group == node_group;
                    });
                    if (exist.length == 0){
                        top10.nodes.push(graph.nodes[i])
                    }
                }
            }
            
            // debugger;


            top10_list = []
            top10_values = []
            scatterplot_list = []
    
            top10.links.forEach(function(d){
                // console.log("top 10 d", d.target)
                top10_list.push(d.target)
                top10_values.push(d.value)
            })

            top10.nodes.forEach(function (d){
                for (var i = 0; i < podcast_dict.data.length; i++){
                    if (podcast_dict.data[i].name == d.name){
                        scatterplot_list.push(podcast_dict.data[i])
                    }
                }
            })

            /* ###########################
               ###########################
                Post data cleaning console log tests
               ###########################
               ########################### */

            // console.log("podcast_dict length -> ", podcast_dict.data.length)
            // console.log("scatterplot list -> ", scatterplot_list)

            // console.log(top10_list)
            // console.log(top10_values)
            // console.log("top 10 nodes", top10.nodes)
            // console.log("top 10 links", top10.links)
            // console.log("TEST")
            // console.log("papaparse array -> ", podcast_dict)

            /* ###########################
               ###########################
                End test section
               ###########################
               ########################### */
            
              drag = simulation => {
      
                function dragstarted(d) {
                    d3.event.sourceEvent.stopPropagation();
                    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                }
    
                function dragged(d) {
                    d.fx = d3.event.x;
                    d.fy = d3.event.y;
    
                }
    
                function dragended(d) {
                    if (!d3.event.active) simulation.alphaTarget(0);
                        d.fx = null;
                        d.fy = null;
                    }
                
                    return d3.drag()
                        .on("start", dragstarted)
                        .on("drag", dragged)
                        .on("end", dragended);
                }  
    
             
                const links = top10.links
                const nodes = top10.nodes

                var lineScale = d3.scaleLinear().domain(d3.extent(top10_values)).range([0.5,3.5])
                var nodeScale = d3.scaleSqrt().domain(d3.extent(top10_values)).range([8,20])


                const width = 800
                const height = 800

                // ################### Tool Tip Section ########################
                var tooltip = d3.tip()
                    .attr("class", "d3-tip")
                    .style("opacity", 0)
                    // .offset([-5,0])
                    .html(function (d) {
                        console.log(d)
                        var podcast_name = d.name
                        var podcast_rating = "NA" // default to NA if null
                        var podcast_review_count = "NA" // default to NA if null
                        var num_episodes = "NA" // default to NA if null
                        var similarity_score = 1 // set to 1 because by default it is 100% similar to itself

                        podcast_dict.data.forEach(function(e){
                            if (e.name == d.name)
                                podcast_rating = parseFloat(e.avg_review_score).toFixed(2)
                        })

                        podcast_dict.data.forEach(function(e){
                            if (e.name == d.name)
                                podcast_review_count = e.num_reviews
                        })

                        podcast_dict.data.forEach(function(e){
                            if (e.name == d.name)
                                num_episodes = e.episode_count
                        })

                        graph.links.forEach(function(e){
                            if (e.target == d.group) {
                                similarity_score = e.value
                            }
                        })

                        return ("<b>Podcast name</b>: " + podcast_name + "<br />"
                                            + "<b>Avg Rating</b>: " + podcast_rating + "<br />"
                                            + "<b>Total Review Count</b>: " + podcast_review_count + "<br />"
                                            + "<b>Num. Episodes</b>: " + num_episodes + "<br />"
                                            + "<b>Similarity Score</b>: " + similarity_score.toPrecision(4) * 100 + "%")

                    })
                
                var tipg = d3.select("#my-tooltip").attr("width", width).attr("height", height)
                
                tipg.append('rect').attr('id', 'tiparea')

                
               // ###########################################

                const simulation = d3.forceSimulation(nodes)
                    .force("link", d3.forceLink(links).id(d => d.group).distance(300))
                    .force("charge", d3.forceManyBody())
                    .force("center", d3.forceCenter(width / 2, height / 2));
              
                const svg = d3.select("#viz").attr("width", width).attr("height", height);
              
                const link = svg.append("g")
                    .attr("stroke", "#999")
                    .attr("stroke-opacity", 0.6)
                  .selectAll("line")
                  .data(links)
                  .join("line")
                  .attr("stroke-width", function(d){return lineScale(d.value)});

                
                const node = svg.append("g")
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 1.5)
                  .selectAll("circle")
                  .data(nodes)
                  .join("circle")
                    .attr("r", function(d){ 
                        // console.log(d.group)
                        // console.log(top10_list)
                        if (group_number == d.group){
                            return 25;}
                        else if (og_top_10.includes(d.group)) {
                        
                            top10.links.forEach(function(e){
                                // console.log(e)
                                if (e.target.group == d.group) {
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
                        else if (og_top_10.includes(d.group)) {
                            return "#0D99E3";
                        } else {
                            return "#E1E1E1";
                                }
                            })
                    .call(drag(simulation))
                    .on("mouseover", function(d, i){
                        // console.log(d.name)
                        tooltip.show(d)  
                            tooltip.style('top', (d3.event.pageY + 20) + "px")
                            tooltip.style('left', (d3.event.pageX + 20) + "px")
                    })
                    .on("mouseout", tooltip.hide)
                    .on("dblclick", function(d, i){
                        $.getScript("wordcloud.js", function(){
                        make_word_cloud(d.name);

                        $.getScript("scatterplot.js", function(){
                            make_scatterplot(scatterplot_list);
                            })
                        })
                    })


                var text = svg.append("g").selectAll("text")
                    .data(nodes).enter().append("text")
                    .attr("x", function(d) {
                            return d.x;
                            })
                    .attr("y", function(d) {
                            return d.y;
                            })
                    .attr("dx",12)
                    .attr("dy",".35em")
                    .text(function(d){
                        return d.name;
                    });    
                  
                // Call tool tip, this is placed here bceuase it has to be after svg is defined
                svg.call(tooltip)
              
                simulation.on("tick", () => {
                  link
                      .attr("x1", d => d.source.x)
                      .attr("y1", d => d.source.y)
                      .attr("x2", d => d.target.x)
                      .attr("y2", d => d.target.y);
              
                  node
                      .attr("cx", d => d.x)
                      .attr("cy", d => d.y);
                  
                  text
                    .attr("x", d => d.x)
                    .attr("y", d => d.y)
                });
              
              
                // return svg.node();
                
              
    
      
    
    
    
    })



}
