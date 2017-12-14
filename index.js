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
                    .style("stroke", "#ccc")
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
            draw: function () {
                mLink = svg.selectAll(".edge")
                    .data(mEdgesData)
                    .enter()
                    .append("line")
                    .attr("class", "edge")
                    .style("stroke", "#ccc")
                    .style("stroke-width", function (e) {
                        return 1
                        /* e.width*/
                    }).merge(mLink);

                mNode = svg.selectAll(".node")
                    .data(mNodesData)
                    .enter()
                    .append("g")
                    .attr("class", "node").merge(mNode);

                mNode.call(d3.drag()
                    .on("start", dragstarted)
                        .on("drag", dragged)
                        .on("end", dragended));

                mNode.on('mouseover', function (d) {
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

                    mNode.filter(function (d1) {
                        return (d !== d1 && d1.adjacents.indexOf(d.id) == -1);
                    }).select("image").style("opacity", 0.2);
                    mNode.filter(function (d1) {
                        return (d !== d1 && d1.adjacents.indexOf(d.id) == -1);
                    }).select("circle").style("stroke", "#f6f6f6");
                    mLink.filter(function (d1) {
                        return (d !== d1.source && d !== d1.target);
                    }).style("opacity", 0.2);

                    mNode.filter(function (d1) {
                        return (d == d1 || d1.adjacents.indexOf(d.id) !== -1);
                    }).select("image").style("opacity", 1);
                    mNode.filter(function (d1) {
                        return (d == d1 || d1.adjacents.indexOf(d.id) !== -1);
                    }).select("circle").style("stroke", "gray");
                    mLink.filter(function (d1) {
                        return (d == d1.source || d == d1.target);
                    }).style("opacity", 1);
                })
                    .on('mouseout', function () {
                        // removePopup();
                        mNode.select("image").style("opacity", 1);
                        mNode.select("circle").style("stroke", "gray");
                        mLink.style("opacity", 1);
                    });

                var nodeCircle = mNode.append("circle")
                    .attr("r", function (d) {
                        return 0.5 * Math.max(d.width, d.height)
                    })
                    .attr("stroke", "gray")
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
            "adjacents": [0],
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
            "width": 1
        }])
        graph.draw();
        // graph.draw();
    }

