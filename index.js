function removeNodePopup() {
    $("#nodePopup").remove();
}

function showNodePopup(node) {
    removeNodePopup();
    if (!node['data']) {
        return;
    }

    var data = node['data'];
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
    htmlStr += '    <div class="nodePopupImage"><img src="' + node['image'] + '" style="width: 130px;" /></div>';
    htmlStr += '</div>';

    $("body").append(htmlStr);
    $("#nodePopupCloseButton").click(removeNodePopup);
}

const LINK_DEFAULT_COLOR = "#ccc";
const NODE_DEFAULT_COLOR = "gray";
const DEFAULT_OPACITY = 1;
const BACKGROUND_OPACITY = 0.2;

function Graph(elementId) {
    var svg;
    var simulation;
    var mNodesData = [];
    var mEdgesData = [];
    var mNode = null;
    var mLink = null;
    var elementId;
    var heightDelta = 100;
    var width = window.innerWidth;
    var height = window.innerHeight - heightDelta;

    return {
        init: function () {
            svg = d3.select('#' + elementId)
                .append("svg")
                .attr("width", width)
                .attr("height", height);

            simulation = d3.forceSimulation()
                .force(".edge", d3.forceLink())
                .force("charge", d3.forceManyBody().strength(-600))
                .force("center", d3.forceCenter(width / 2, height / 2));

            mLink = svg.selectAll(".edge")
                .attr("class", "edge")
                .style("stroke", LINK_DEFAULT_COLOR)
                .style("stroke-width", function (e) {
                    return 1
                    /* e.width*/
                });

            mNode = svg.selectAll(".node")
                .attr("class", "node");
        },
        clearGraph: function () {
            $('#' + this.elementId).empty();
        },
        getNodes: function () {
            return mNodesData;
        },
        getEdges: function () {
            return mEdgesData;
        },
        addNodes: function (nodes) {
            mNodesData = mNodesData.concat(nodes);
        },
        addEdges: function (edges) {
            mEdgesData = mEdgesData.concat(edges);
        },
        onMouseOut: function () {
            // removePopup();
            mNode.select("image").style("opacity", DEFAULT_OPACITY);
            mNode.select("circle").style("opacity", DEFAULT_OPACITY);
            mLink.style("opacity", DEFAULT_OPACITY).style("stroke", LINK_DEFAULT_COLOR);
        },
        draw: function () {
            mLink = svg.selectAll(".edge")
                .data(mEdgesData)
                .enter()
                .append("line")
                .attr("class", "edge")
                .style("stroke", LINK_DEFAULT_COLOR)
                .style("stroke-width", function (e) {
                    return 2
                    /* e.width*/
                }).merge(mLink).lower();

            mNode = svg.selectAll(".node")
                .data(mNodesData)
                .enter()
                .append("g")
                .attr("class", "node").merge(mNode);

            mNode.call(d3.drag()
                .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended));

            mNode.on('mouseover', function (thisNode) {
                showNodePopup(thisNode);
                var thisNodeID = thisNode.id;
                var connectedNodes = mEdgesData.filter(function(d) {
                    return d.source.id === thisNodeID || d.target.id === thisNodeID
                }).map(function(d) {
                    return d.source.id === thisNodeID ? d.target.id : d.source.id
                });

                mNode.each(function (otherNode, id) {
                    var image = d3.select(this).select("image");
                    var circle = d3.select(this).select("circle");
                    if (connectedNodes.indexOf(otherNode.id) > -1 || thisNodeID == otherNode.id) {
                        image.style("opacity", DEFAULT_OPACITY);
                        circle.style("opacity", DEFAULT_OPACITY);
                    }
                    else {
                        image.style("opacity", BACKGROUND_OPACITY);
                        circle.style("opacity", BACKGROUND_OPACITY);
                    }
                });

                mLink.filter(function (otherLink) {
                    return (thisNode !== otherLink.source && thisNode !== otherLink.target);
                }).style("opacity", BACKGROUND_OPACITY);

                mLink.filter(function (otherLink) {
                    return (thisNode == otherLink.source || thisNode == otherLink.target);
                }).style("opacity", DEFAULT_OPACITY);
            })
                .on('mouseout', this.onMouseOut);

            mLink.on('mouseover', function (currentLink) {
                mLink.filter(function (otherLink) {
                    return (currentLink == otherLink);
                }).style("stroke", "black");
                mLink.filter(function (otherLink) {
                    return (currentLink !== otherLink);
                }).style("opacity", BACKGROUND_OPACITY);

                mNode.filter(function (otherNode) {
                    return (currentLink.source != otherNode || currentLink.target != otherNode);
                }).select("image").style("opacity", BACKGROUND_OPACITY);
                mNode.filter(function (otherNode) {
                    return (currentLink.source != otherNode || currentLink.target != otherNode);
                }).select("circle").style("opacity", BACKGROUND_OPACITY);

                mNode.filter(function (d1) {
                    return (d1 == currentLink.source || d1 == currentLink.target);
                }).select("image").style("opacity", DEFAULT_OPACITY);
                mNode.filter(function (d1) {
                    return (d1 == currentLink.source || d1 == currentLink.target);
                }).select("circle").style("opacity", DEFAULT_OPACITY);

            }).on('mouseout', this.onMouseOut);

            var nodeCircle = mNode.append("circle")
                .attr("r", function (d) {
                    return 0.5 * Math.max(d.width, d.height)
                })
                .attr("stroke", NODE_DEFAULT_COLOR)
                .attr("stroke-width", "2px")
                .attr("fill", "white");

            var nodeImage = mNode.append("image")
                .attr("xlink:href", function (d) {
                    return d.image
                })
                .attr("height", function (d) {
                    return d.height + ""
                })
                .attr("width", function (d) {
                    return d.width + ""
                })
                .attr("x", function (d) {
                    return -0.5 * d.width
                })
                .attr("y", function (d) {
                    return -0.5 * d.height
                })
                .attr("clip-path", function (d) {
                    return "circle(" + (0.48 * Math.max(d.width, d.height)) + "px)"
                });


            simulation.nodes(mNodesData);
            simulation.force(".edge").links(mEdgesData);

            simulation.on("tick", function () {
                mLink.attr("x1", function (d) {
                    return d.source.x;
                })
                    .attr("y1", function (d) {
                        return d.source.y;
                    })
                    .attr("x2", function (d) {
                        return d.target.x;
                    })
                    .attr("y2", function (d) {
                        return d.target.y;
                    })

                mNode.attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ")"
                });
                mNode.attr("cx", function (d) {
                    return d.x = Math.max(d.width, Math.min(width - d.width, d.x));
                })
                    .attr("cy", function (d) {
                        return d.y = Math.max(d.height, Math.min(height - heightDelta - d.height, d.y));
                    });
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

$.when(getData()).then(function (data) {
    graph.addNodes(data.nodes);
    graph.addEdges(data.edges);
    graph.draw();

});


function add() {
    graph.addNodes([{
        "id": 4,
        "image": "images/4.jpg",
        "height": 20,
        "width": 20,
        "data": {
            "name": "Number4",
            "groupId": "Bla4",
            "desc": "Desc4",
            "leaderId": "1234-1234"
        }
    }]);
    graph.addEdges([{
        "source": 4,
        "target": 3,
        "width": 1,
        "data": {
            "counter": 500
        }
    }])
    graph.draw();
}

