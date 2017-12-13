function Graph(elementId) {
    var mNodes = [];
    var mEdges = [];
    var elementId;
    var heightDelta = 100;
    var width = window.innerWidth;
    var height = window.innerHeight - heightDelta;
    var svg;
    var simulation;

    return {
        init: function () {
            svg = d3.select('#' + elementId)
                .append("svg")
                .attr("width", width)
                .attr("height", height);

            simulation = d3.forceSimulation()
                .force("link", d3.forceLink())
                .force("charge", d3.forceManyBody().strength(-600))
                .force("center", d3.forceCenter(width / 2, height / 2));
        },
        clearGraph: function () {
            $('#' + this.elementId).empty();
        },
        getNodes: function () {
            return mNodes;
        },
        getEdges: function () {
            return mEdges;
        },
        addNodes: function (nodes) {
            mNodes = nodes;
        },
        addEdges: function (edges) {
            mEdges = edges;
        },
        draw: function () {
            var links = svg.selectAll("foo")
                .data(mEdges)
                .enter()
                .append("line")
                .style("stroke", "#ccc")
                .style("stroke-width", function (e) { return 1/* e.width*/ });

            var node = svg.selectAll("foo")
                .data(mNodes)
                .enter()
                .append("g")
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended));

            node.on('mouseover', function (d) {
                function removePopup() {
                    $("#nodePopup").remove();
                }

                function showPopup(d) {
                    removePopup();
                    if (!d['data']) {
                        return;
                    }

                    var data = d['data'];
                    var htmlStr = '';
                    htmlStr += '<div id="nodePopup" >';
                    htmlStr += '    <div><button id="nodePopupCloseButton" type="button" class="close" data-dismiss="alert"><span class="glyphicon glyphicon-remove" style="font-size: 13px;"> </span> </div>';
                    htmlStr += '    <div class="nodePopupName">' + data['name'] + '</div>';
                    if (data['desc']) {
                        if (data['desc'].startsWith("http")) {
                            htmlStr += '    <a class="nodePopupLink" href="' + data['desc'] + '" target="_blank">Go to post..</a>';
                        }
                        else {
                            htmlStr += '    <div class="nodePopupDesc">' + data['desc'] + '</div>';
                        }
                    }
                    htmlStr += '    <div class="nodePopupGroup">GROUP: ' + data['groupId'] + '</div>';
                    htmlStr += '    <div class="nodePopupLeader">LEADER: ' + data['leaderId'] + '</div>';
                    htmlStr += '    <div class="nodePopupImage"><img src="' + d['image'] + '" style="width: 130px;" /></div>';
                    htmlStr += '</div>';

                    $("body").append(htmlStr);
                    $("#nodePopupCloseButton").click(removePopup);
                }

                showPopup(d);

                node.filter(function (d1) {
                    return (d !== d1 && d1.adjacents.indexOf(d.id) == -1);
                }).select("image").style("opacity", 0.2);
                node.filter(function (d1) {
                    return (d !== d1 && d1.adjacents.indexOf(d.id) == -1);
                }).select("circle").style("stroke", "#f6f6f6");
                links.filter(function (d1) {
                    return (d !== d1.source && d !== d1.target);
                }).style("opacity", 0.2);

                node.filter(function (d1) {
                    return (d == d1 || d1.adjacents.indexOf(d.id) !== -1);
                }).select("image").style("opacity", 1);
                node.filter(function (d1) {
                    return (d == d1 || d1.adjacents.indexOf(d.id) !== -1);
                }).select("circle").style("stroke", "gray");
                links.filter(function (d1) {
                    return (d == d1.source || d == d1.target);
                }).style("opacity", 1);
            })
                .on('mouseout', function () {
                    // removePopup();
                    node.select("image").style("opacity", 1);
                    node.select("circle").style("stroke", "gray");
                    links.style("opacity", 1);
                });

            var nodeCircle = node.append("circle")
                .attr("r", function (d) { return 0.5 * Math.max(d.width, d.height) })
                .attr("stroke", "gray")
                .attr("stroke-width", "2px")
                .attr("fill", "white");

            var nodeImage = node.append("image")
                .attr("xlink:href", function (d) { return d.image })
                .attr("height", function (d) { return d.height + "" })
                .attr("width", function (d) { return d.width + "" })
                .attr("x", function (d) {return -0.5 * d.width })
                .attr("y", function (d) {return -0.5 * d.height })
                .attr("clip-path", function (d) { return "circle(" + (0.48 * Math.max(d.width, d.height)) + "px)"});

            simulation.nodes(mNodes);
            simulation
                .force("link")
                .links(mEdges);

            simulation.on("tick", function() {
                links.attr("x1", function(d) {
                    return d.source.x;
                })
                    .attr("y1", function(d) {
                        return d.source.y;
                    })
                    .attr("x2", function(d) {
                        return d.target.x;
                    })
                    .attr("y2", function(d) {
                        return d.target.y;
                    })

                node.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"});
                node.attr("cx", function(d) { return d.x = Math.max(d.width, Math.min(width - d.width, d.x)); })
                    .attr("cy", function(d) { return d.y = Math.max(d.height, Math.min(height - heightDelta - d.height, d.y)); });
            });

            function dragstarted(d) {
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
        }
    }
}

function getData() {
    return $.ajax({
        url: 'api/v1/data.json',
        type: "GET",
    });
}

var graph = Graph('d3Graph');
graph.init();

$.when(getData()).then(function(data) {
    graph.addNodes(data.nodes);
    graph.addEdges(data.edges);
    graph.draw();
});


