var treeGraphDirective = function ($interval) {
    var Template = 'views/custom/graphs/treeGraph.html';

    function controller($scope, $compile, $timeout, LeaderMESservice,
        notify, actionService, $interval, commonFunctions, $state, $filter) {
        $scope.localLanguage = LeaderMESservice.showLocalLanguage();
        $scope.selectedNode = null;
        $scope.changes = [];
        $scope.treeGraph = true;
        $scope.loadingForm = false;
        $scope.jobClicked = null;
        $scope.graphSideMenu = true;
        $scope.settingsData = {
            graphToolList: [],
            relativeAmount: false,
            isvisible: {},
            objHide: []
        }
        if ($scope.content.linkItem == 'Product') {
            $scope.ratioEnabled = true;
            $scope.settingsData.relativeAmount = false;
        }
        commonFunctions.fieldChanges($scope);
        var ObjectID = $scope.content.ID;
        var requestAPI = $scope.requestapi;
        var requestBody = $scope.requestbody;
        var margin = {
            top: 20,
            right: 120,
            bottom: 20,
            left: 120
        },
            width = 2000 - margin.right - margin.left,
            height = 1000 - margin.top - margin.bottom;
        var ShapeToSvg = {
            "Circle": "circle",
            "Square": "rect",
            "Rectangle": "rect",
            "Rhombus": "polygon",
            "Octagon": "polygon",
            "Hexagon": "polygon"
        };
        var graphYmin = 0, graphYmax = 0, graphXmin = 0, graphXmax = 0;
        $scope.rtl = LeaderMESservice.isLanguageRTL();
        $scope.rtlL = LeaderMESservice.isLanguageRTL();
        $scope.loading = true;


        var graphRender = function (response) {
            var loopInTree = false;
            //check for errors
            var refreshDuration = response.RefreshRateInSeconds || 0;
            if ($scope.options && $scope.options.machine) {
                refreshDuration = 0;
            }
            if (response.error) {
                notify({
                    message: response.error.ErrorCode + ' - ' + response.error.ErrorDescription,
                    classes: 'alert-danger',
                    duration: 0,
                    templateUrl: 'views/common/notify.html'
                });
                return;
            }
            $scope.displayOrder = response.NodeDisplayOrder;

            var newRoot = response.Root;
            $scope.rootNodeType = newRoot.AppObjectName;
            $scope.rootID = newRoot.ObjectID;
            if (!newRoot) {
                return;
            }
            $scope.treeId = response.TreeID;

            function calcArithmetics(response, nodes) {
                var operations = response.TreeNodeArithmeticParameters;
                if (operations == null || operations.length == 0) {
                    return;
                }
                $scope.result = {};
                $scope.result.left = 0;
                $scope.result.right = 0;
                operations.forEach(function (op) {
                    if (op.arithmeticOperationType) {
                        if (op.arithmeticOperationType.toLowerCase() == "sum") {
                            var sum = Number(0);
                            nodes.forEach(function (node) {
                                sum += Number(node.data.ObjectParameters[op.fieldName].FieldValue);
                            });
                            op.arithmeticOperationDisplayOrder == 1 ? ($scope.result.left = sum) : ($scope.result.right = sum);
                        }
                        if (op.arithmeticOperationType.toLowerCase() == "multiplication") {
                            var sum = 1;
                            response.Root.Child.forEach(function (node) {
                                sum *= node.ObjectParameters[op.fieldName].FieldValue;
                            });
                            op.arithmeticOperationDisplayOrder == 1 ? ($scope.result.left = sum) : ($scope.result.right = sum);
                        }
                    }
                    if (op.arithmeticOperationType == null || op.arithmeticOperationType == "") {
                        var sum = response.Root.ObjectParameters[op.fieldName].FieldValue;
                        op.arithmeticOperationDisplayOrder == 1 ? ($scope.result.left = sum) : ($scope.result.right = sum);
                    }
                });
            }
            $scope.DisaplyConfigFromRoot = response.DisaplyConfigFromRoot;

            var loopEM = '';
            (function LoopError(dd) {
                if (dd && dd.HasLoop) {
                    loopInTree = true;
                }
                if (dd && dd.LoopError) {
                    loopEM = loopEM + dd.LoopError + '\n';
                }
                if (dd.Child && dd.Child.length > 0) {
                    dd.Child.forEach(LoopError);
                }
                $scope.settingsData.graphToolList.push(dd);
            })(newRoot);

            if (loopEM != '') {
                // notify({
                //     message: 'Loop Error  - \n' + loopEM,
                //     classes: 'alert-danger',
                //     templateUrl: 'views/common/notify.html'
                // });
            }

            $scope.settingsData.graphToolList = _.uniq($scope.settingsData.graphToolList, 'AppObjectName');
            $scope.settingsData.graphToolList = _.sortBy($scope.settingsData.graphToolList, function (data) {
                var displayOrder = _.find($scope.displayOrder, { AppObjectName: data.AppObjectName });
                if (displayOrder) {
                    return displayOrder.NodeLevelDisplayOrder;
                }
                return 100;
            });

            $scope.nodeToRoot = (response.NodeConnectionDirection == "NodeToRoot");
            $timeout(function () {

                getSettings();
                var ObjectType = $scope.content.linkItem;
                var i = 0,
                    duration = 750,
                    rectW = 60,
                    rectH = 60,
                    circleW = 110,
                    circleH = 110,
                    maxDepth = 1,
                    depthW = 100,
                    nodeMargin = 5,
                    fontSize = 12;
                var connect = function (d) {
                    var s = d.source;
                    var t = d.target;

                    return "M " + (parseInt(t.y) + (t.data ? (!$scope.rtl ? t.data.ShapeOuterLengthX + 10 : -10) : 0)) + " " + t.x +
                        "H " + ($scope.rtl ? (s.y + 2 * t.y) / 3 + " " : (2 * s.y + t.y) / 3 + " ") +
                        "V " + s.x + " " +
                        "H " + (parseInt(s.y) + (s.data ? ($scope.rtl ? s.data.ShapeOuterLengthX + 12 : -12) : 0));
                };
                var zooming = false;
                $scope.loading = false;
                var svg = d3.select("#tree-graph").classed("svg-container", true).append("svg")
                    .attr("viewBox", "0 0 2000 1000").attr("preserveAspectRatio", "xMinYMin meet").classed("svg-content", true)
                    .call(zm = d3.behavior.zoom().scaleExtent([0.4, 10]).on("zoom", redraw)).on("dblclick.zoom", null)
                    .append("g").attr("id", "tree-layout");

                var flextree = d3.flextree().children(function (data) {
                    return data.Child.filter(function (d) {
                        return _.indexOf($scope.settingsData.objHide, d.AppObjectName) == -1;
                    });
                }).nodeSize(function (node) {
                    if (node.data.ShapeOuterLengthX * 2 > depthW) {
                        depthW = node.data.ShapeOuterLengthX * 2;
                    }
                    return [node.data.ShapeOuterLengthX, node.data.ShapeOuterLengthY];
                }).spacing(30);

                $scope.defs = svg.append("defs");
                var arc = d3.svg.arc();
                var halfcircle = function (elem, x, y, rad) {
                    return elem.append('path')
                        .attr('transform', 'translate(' + [x, y] + ')')
                        .attr('d', arc({
                            innerRadius: 0,
                            outerRadius: rad,
                            startAngle: -Math.PI * 0.5,
                            endAngle: Math.PI * 0.5
                        }));
                }
                newRoot.x0 = 0;
                newRoot.y0 = height / 2;

                angular.forEach($scope.settingsData.graphToolList, function (item) {
                    if (!item.NodeDisplayState) {
                        $scope.settingsData.objHide.push(item.AppObjectName);
                    }
                    $scope.settingsData.isvisible[item.AppObjectName] = item.NodeDisplayState;
                });

                var tree = flextree.hierarchy(newRoot);
                tree.x0 = 0;
                tree.y0 = height / 2;
                tree.id = 'root';
                function expand(d) {
                    if (d.Child) {
                        d.children = null;
                        d.children = d.Child;
                        d._children = null;
                    }
                    d.children.forEach(expand);
                }

                newRoot.children = newRoot.Child;
                newRoot.children.forEach(expand);
                update(tree);
                svg.attr("transform", "translate(" + ($scope.rtl ? width - (maxDepth) * depthW + 60 : maxDepth * depthW + 20) + "," + height / 2 + ")");
                zm.translate([($scope.rtl ? width - (maxDepth) * depthW + 60 : maxDepth * depthW + 20), height / 2]);
                d3.select("#tree-graph").style("height", ($scope.options && $scope.options.height) ? $scope.options.height - 2 + "px" : "800px");
                centerGraph();

                function update(source, skipNodeRebuild, duration) {
                    duration = duration || 750;
                    // Compute the new tree layout.
                    var nodes = flextree(tree).nodes,
                        links = tree.links(nodes);
                    // Normalize for fixed-depth.
                    nodes.forEach(function (d) {
                        maxDepth = d.depth > maxDepth ? d.depth : maxDepth;
                        d.y = d.depth * depthW * ($scope.rtl ? 1 : -1);
                        if ((d.data.ObjectID == $scope.content.ID) && (d.data.AppObjectName == $scope.content.linkItem)) {
                            startHereNode = d;
                        }
                    });
                    if (!skipNodeRebuild) {
                        svg.selectAll("g.node").remove();
                        graphXmax = 0;
                        graphXmin = 0;
                        graphYmax = 0;
                        graphYmin = 0;
                    }

                    // Update the nodes…
                    var node = svg.selectAll("g.node")
                        .data(nodes, function (d) {
                            return d.id || (d.id = ++i);
                        });
                    // Enter any new nodes at the parent's previous position.
                    var nodeEnter = node.enter().append("g")
                        .attr("class", "node")
                        .attr("transform", function (d) {
                            return "translate(" + source.y0 + "," + source.x0 + ")";
                        })

                    nodeEnter.filter(function (d) {
                        if ($scope.selectedNode && ($scope.selectedNode.ObjectID == d.data.ObjectID) && ($scope.selectedNode.AppObjectName == d.data.AppObjectName)) {
                            return true;
                        }
                        return false;
                    }).classed("selected", true);

                    shapeAppend(nodeEnter);
                    calcArithmetics(response, nodes);
                    // add result of operation
                    if ($scope.result != undefined && $scope.result.left != undefined && $scope.result.right != undefined) {
                        // add text to root node if rtl
                        var placeholder = $filter('translate')('RESULT_OF_OPERATION');


                        nodeEnter.filter(function (d) {
                            return (d.data.ObjectID == $scope.rootID && $scope.rtl && (!d.data.HasLoop));
                        }).append('text').attr('x', function (d) {
                            return -150;
                        }).attr("text-anchor", "end").text(placeholder)
                            .style("font-size", 22).style("font-weight", function (o) { return "bold" });
                        nodeEnter.filter(function (d) {
                            return (d.data.ObjectID == $scope.rootID && $scope.rtl && (!d.data.HasLoop));
                        }).append('text').attr('x', function (d) {
                            return -180;
                        }).attr('y', function (d) {
                            return 24;
                        }).attr("text-anchor", "end").text($scope.result.left + "/" + $scope.result.right)
                            .style("font-size", 22);
                        //// add text to root node if !rtl
                        nodeEnter.filter(function (d) {
                            return (d.data.ObjectID == $scope.rootID && !$scope.rtl && (!d.data.HasLoop));
                        }).append('text').attr('x', function (d) {
                            return d.data.ShapeOuterLengthX + 30;
                        }).attr("text-anchor", "start").text(placeholder)
                            .style("font-size", 22).style("font-weight", function (o) { return "bold" });
                        nodeEnter.filter(function (d) {
                            return (d.data.ObjectID == $scope.rootID && !$scope.rtl && (!d.data.HasLoop));
                        }).append('text').attr('x', function (d) {
                            return d.data.ShapeOuterLengthX + 30;
                        }).attr('y', function (d) {
                            return 20;
                        }).attr("text-anchor", "start").text($scope.result.left + "/" + $scope.result.right)
                            .style("font-size", 22);
                    }
                    // Transition nodes to their new position.
                    var nodeUpdate = node.transition()
                        .duration(duration)
                        .attr("transform", function (d) {
                            if (d.x > graphYmax) {
                                graphYmax = d.x + d.data.ShapeOuterLengthY / 2;
                            }
                            if (d.x < graphYmin) {
                                graphYmin = d.x - d.data.ShapeOuterLengthY / 2;
                            }
                            if (d.y > graphXmax) {
                                graphXmax = d.y + d.data.ShapeOuterLengthX / 2;
                            }
                            if (d.y < graphXmin) {
                                graphXmin = d.y - d.data.ShapeOuterLengthX / 2;
                            }
                            return "translate(" + d.y + "," + d.x + ")";
                        });

                    shape(nodeUpdate);

                    nodeUpdate.select("text")
                        .style("fill-opacity", 1);

                    // Transition exiting nodes to the parent's new position.
                    var nodeExit = node.exit()
                        .transition()
                        .duration(duration)
                        .attr("transform", function (d) {
                            return "translate(" + source.y + "," + source.x + ")";
                        }).remove();

                    //shape(nodeExit);
                    nodeExit.select("text");

                    // Update the links…
                    var link = svg.selectAll("path.link")
                        .data(links, function (d) {
                            return d.target.id;
                        });

                    // Enter any new links at the parent's previous position.
                    link.enter().insert("path", "g")
                        .attr("class", "link")
                        .attr("x", rectW / 2)
                        .attr("y", rectH / 2)
                        .attr("d", function (d) {
                            var o = {
                                x: source.x0,
                                y: source.y0
                            };
                            return connect({
                                source: o,
                                target: o
                            });
                        });

                    // Transition links to their new position.
                    link.transition()
                        .duration(duration)
                        .attr("d", connect);

                    // Transition exiting nodes to the parent's new position.
                    link.exit().transition()
                        .duration(duration)
                        .attr("d", function (d) {
                            var o = {
                                x: source.x,
                                y: source.y
                            };
                            return connect({
                                source: o,
                                target: o
                            });
                        })
                        .remove();

                    // Stash the old positions for transition.
                    nodes.forEach(function (d) {
                        d.x0 = d.x;
                        d.y0 = d.y;
                    });
                    d3.selectAll("polyline.node-toggle").filter(function (d) {
                        return (d._children && d._children.length > 0) ? true : false;
                    })
                        .attr("points", function (d) {
                            return arrowDir(false, d.data.ShapeOuterLengthX);
                        })
                        .attr("fill", "#072345");
                    d3.selectAll("polyline.node-toggle").filter(function (d) {
                        return (d.children && d.children.length > 0) ? true : false;
                    })
                        .attr("points", function (d) {
                            return arrowDir(true, d.data.ShapeOuterLengthX);
                        })
                        .attr("fill", "#072345");
                    //add \ to nodes with loop
                    var textRemove = $filter('translate')('REMOVE_THIS_NODE');
                    node.filter(function (d) {
                        return d.data.HasLoop;
                    })
                        .append('line')
                        .attr('x1', 0)
                        .attr('y1', function (d) {
                            return -d.data.ShapeOuterLengthX / 2;
                        })
                        .attr('x2', function (d) {
                            return d.data.ShapeOuterLengthX;
                        })
                        .attr('y2', function (d) {
                            return d.data.ShapeOuterLengthY / 2;
                        })
                        .attr('stroke', 'red')
                        .attr('stroke-width', 4);
                    // add REMOVE_TEXT
                    node.filter(function (d) {
                        return d.data.HasLoop;
                    })
                        .append('text').text(textRemove).attr('text-anchor', 'end')
                        .style('fill', 'red')
                        .style('font-size', 20)
                        .attr('x', 0)
                        .attr('y', function (d) {
                            return (-d.data.ShapeOuterLengthX / 2) - 10;
                        })
                }
                $scope.update = update;


                function arrowDir(opened, shapeW) {
                    var openArrow, closeArrow;
                    if ($scope.rtl) {
                        openArrow = (20 + shapeW) + ",-7 " + (10 + shapeW) + ",0 " + (20 + shapeW) + ",7";
                        closeArrow = (20 + shapeW) + ",0 " + (10 + shapeW) + ",-7 " + (10 + shapeW) + ",7";
                        if (!$scope.nodeToRoot) {
                            closeArrow = (20 + shapeW + depthW / 6 - 22) + ",0 " + (10 + shapeW + depthW / 6 - 22) + ",-7 " + (10 + shapeW + depthW / 6 - 22) + ",7";
                        }
                    } else {
                        openArrow = "-20,-7 -10,0 -20,7";
                        closeArrow = "-20,0 -10,-7 -10,7";
                        if (!$scope.nodeToRoot) {
                            closeArrow = (-10 - depthW / 3 + 12) + ",0 " + (-depthW / 3 + 12) + ",-7 " + (-depthW / 3 + 12) + ",7";
                        }
                    }
                    if (!$scope.nodeToRoot) {
                        opened = !opened;
                    }
                    return opened ? openArrow : closeArrow;
                }

                // Toggle Child on click.
                function click(d) {
                    if (d.children) {
                        d._children = d.children;
                        d.children = null;
                    } else {
                        d.children = d._children;
                        d._children = null;
                    }
                    update(d, true);
                }

                function shape(nodes) {
                    nodes
                        .filter(function (node) {
                            return node.data.Shape == "Circle";
                        })
                        .select(function (d) {
                            return this.children.item(ShapeToSvg[d.data.Shape]);
                        })
                        .attr("cx", function (d) {
                            return d.data.ShapeOuterLengthX / 2;
                        })
                        .attr("cy", 0)
                        .attr("r", function (d) {
                            return d.data.ShapeOuterLengthX / 2;
                        })
                        .style("filter", function (d) {
                            return makeFilter(d.data.ShadowColor, d.data.Shape);
                        });

                    nodes
                        .filter(function (node) {
                            return node.data.Shape == "Square";
                        })
                        .select(function (d) {
                            return this.children.item(ShapeToSvg[d.data.Shape]);
                        })
                        .attr("width", function (d) {
                            return d.data.ShapeOuterLengthX;
                        })
                        .attr("height", function (d) {
                            return d.data.ShapeOuterLengthY;
                        })
                        .attr("y", function (d) {
                            return -d.data.ShapeOuterLengthY / 2;
                        })
                        .style("filter", function (d) {
                            return makeFilter(d.data.ShadowColor, d.data.Shape);
                        })
                        .attr("rx", 4)
                        .attr("ry", 4)
                        .style("fill", "white")
                    nodes
                        .filter(function (node) {
                            return node.data.Shape != "Square" && node.data.Shape != "Circle";
                        })
                        .select(function (d) {
                            return this.children.item(ShapeToSvg[d.data.Shape]);
                        })
                        .attr("points", function (d) {
                            var H = d.data.ShapeOuterLengthY;
                            var W = d.data.ShapeOuterLengthX;
                            if (d.data.Shape == 'Rhombus') {
                                var halfW = W / 2;
                                var halfH = H / 2;
                                return '0,0 ' + halfW + ',' + (-halfH) + ' ' + 2 * halfW + ',0 ' + halfW + ',' + halfH;
                            }
                            if (d.data.Shape == 'Octagon') {
                                var octEdgeW = W / (1 + Math.sqrt(2));
                                var octEdgeH = H / (1 + Math.sqrt(2));
                                return '0,' + (-octEdgeH / 2) + ' 0,' + octEdgeH / 2 + ' ' + (octEdgeW / Math.sqrt(2)) + ',' + H / 2 + ' ' + (W - (octEdgeW / Math.sqrt(2))) + ',' + H / 2 + ' '
                                    + W + ',' + octEdgeH / 2 + ' ' + W + ',' + (-octEdgeH / 2) + ' ' + (W - (octEdgeW / Math.sqrt(2))) + ',' + (-H / 2) + ' '
                                    + (octEdgeW / Math.sqrt(2)) + ',' + (-H / 2);
                            }
                            if (d.data.Shape == 'Hexagon') {
                                return '0,' + (-H / 4) + ' ' + '0,' + H / 4 + ' ' + W / 2 + ',' + H / 2 + ' ' + W + ',' + H / 4 + ' ' + W + ',' + (-H / 4) + ' ' + W / 2 + ',' + (-H / 2);
                            }
                        })
                        .style("fill", "white")
                        .style("filter", function (d) {
                            return makeFilter(d.data.ShadowColor, 'Square');
                        });
                }

                function shapeAppend(nodes) {
                    // append shape
                    nodes.append(function (d) {
                        return document.createElementNS("http://www.w3.org/2000/svg", ShapeToSvg[d.data.Shape]);
                    }).classed("shape", true);
                    //append half shape
                    nodes.filter(function (d) {
                        return d.data.Shape == "Circle";
                    }).append('path')
                        .attr('transform', function (d) {
                            return 'translate(' + [d.data.ShapeOuterLengthX / 2, 0] + ')';
                        })
                        .attr('d', function (d) {
                            return arc({
                                innerRadius: 0,
                                outerRadius: d.data.ShapeOuterLengthX / 2,
                                startAngle: -Math.PI * 0.5,
                                endAngle: Math.PI * 0.5
                            });
                        }).style("fill", function (d) {
                            return d.data.Color
                        });
                    nodes.filter(function (d) {
                        return d.data.Shape == "Square" || d.data.Shape == "Rectangle";
                    }).append(function (d) {
                        return document.createElementNS("http://www.w3.org/2000/svg", ShapeToSvg[d.data.Shape]);
                    }).attr("width", function (d) {
                        return d.data.ShapeOuterLengthX;
                    })
                        .attr("height", function (d) {
                            return d.data.ShapeOuterLengthY / 2;
                        })
                        .attr("y", function (d) {
                            return -d.data.ShapeOuterLengthY / 2;
                        })
                        .attr("rx", 4)
                        .attr("ry", 4)
                        .style("fill", function (d) {
                            return d.data.Color
                        });
                    nodes.filter(function (d) {
                        return d.data.Shape == "Square" || d.data.Shape == "Rectangle";
                    }).append('rect')
                        .attr("width", function (d) {
                            return d.data.ShapeOuterLengthX;
                        })
                        .attr("height", function (d) {
                            return 4;
                        })
                        .attr("y", function (d) {
                            return -4;
                        })
                        .style("fill", function (d) {
                            return d.data.Color
                        });
                    nodes.filter(function (d) {
                        return d.data.Shape != "Square" && d.data.Shape != "Rectangle" && d.data.Shape != "Circle";
                    }).append('polygon')
                        .attr('points', function (d) {
                            var H = d.data.ShapeOuterLengthY;
                            var W = d.data.ShapeOuterLengthX;
                            if (d.data.Shape == 'Rhombus') {
                                var halfW = W / 2;
                                var halfH = H / 2;
                                return '0,0 ' + halfW + ',' + (-halfH) + ' ' + 2 * halfW + ',0 ';
                            }
                            if (d.data.Shape == 'Octagon') {
                                var octEdgeW = W / (1 + Math.sqrt(2));
                                var octEdgeH = H / (1 + Math.sqrt(2));
                                return '0,' + (-octEdgeH / 2) + ' 0,0 ' + W + ',0 ' +
                                    +W + ',' + octEdgeH / 2 + ' ' + W + ',' + (-octEdgeH / 2) + ' ' + (W - (octEdgeW / Math.sqrt(2))) + ',' + (-H / 2) + ' '
                                    + (octEdgeW / Math.sqrt(2)) + ',' + (-H / 2);
                            }
                            if (d.data.Shape == 'Hexagon') {
                                return '0,' + (-H / 4) + ' ' + '0,0 ' + W + ',0 ' + W + ',' + (-H / 4) + ' ' + W / 2 + ',' + (-H / 2);
                            }
                        })
                        .style('fill', function (d) {
                            return d.data.Color;
                        });
                    // attach icons
                    nodes.each(function (d) {
                        var data = d.data;
                        var iconsObj = {
                            "arr": [],
                            "numIcons": 0
                        };
                        if ((data.AppObjectName == ObjectType) && (data.ObjectID == ObjectID)) {
                            iconsObj.arr.push("youAreHereIcon");
                            iconsObj.numIcons += 1;
                        }
                        var configIcon = _.find(data.ObjectParameters, { IconName: "ConfigIcon" });
                        if (configIcon) {
                            if (typeof configIcon.IconCriteria == 'string' && configIcon.IconCriteria !== '' &&
                                configIcon.IconCriteria !== null) {
                                configIcon.IconCriteria = JSON.parse(configIcon.IconCriteria);
                            }
                            var actionsParams = {};
                            var ObjectParameters = data.ObjectParameters;
                            if (configIcon.IconCriteria && configIcon.IconCriteria.criteria) {
                                for (var j = 0; j < configIcon.IconCriteria.criteria.params.length; j++) {
                                    if (ObjectParameters && ObjectParameters[configIcon.IconCriteria.criteria.params[j]] &&
                                        ObjectParameters[configIcon.IconCriteria.criteria.params[j]].FieldValue) {
                                        actionsParams[configIcon.IconCriteria.criteria.params[j]] = ObjectParameters[configIcon.IconCriteria.criteria.params[j]].FieldValue;
                                    }
                                }
                            }
                            if (configIcon.IconCriteria !== "") {
                                var criteria = configIcon.IconCriteria;
                                if (jsonLogic.apply(criteria.criteria.condition, actionsParams)) {
                                    iconsObj.arr.push("jobIcon");
                                    iconsObj.numIcons += 1;
                                }
                            }
                        }
                        d.data.icons = iconsObj.arr;
                        if (iconsObj.numIcons > 0) {
                            var icons = d3.select(this).append("g").classed("icons-container", true);
                            iconsObj.arr.forEach(function (type, index) {
                                icons.append("svg:image")
                                    .attr("xlink:href", function () {
                                        var iconImg = ""
                                        if (type == "youAreHereIcon") {
                                            iconImg = "here.svg";
                                        } else if (type == "jobIcon") {
                                            iconImg = "jobs-icon.svg";
                                        } else if (type == "loopIcon") {
                                            iconImg = "warning.svg";
                                        }
                                        return "images/treeGraph/" + iconImg;
                                    })
                                    .attr('x', function (d) {
                                        return d.data.ShapeOuterLengthX / 2 - 30 + ((3 - iconsObj.numIcons) % 3) * 10 + (index * 20);
                                    })
                                    .attr('y', function (d) {
                                        return -d.data.ShapeOuterLengthY / 2 + 8;
                                    })
                                    .attr("width", "20")
                                    .attr("height", "20")
                                    .style('object-fit', 'contain')
                                    .style("cursor", ((type == "jobIcon") ? "pointer" : "default"));
                            });
                        }
                    });
                    if ($scope.DisaplyConfigFromRoot) {
                        $scope.getConfigData($scope.rootID);
                    }
                    // append progress bar
                    nodesWithProgress = nodes.filter(function (d) {
                        return (d.data.AppObjectName == 'Job') && d.data.ObjectParameters.JobProgress;
                    });
                    nodes.filter(function (d) {
                        return (d.data.AppObjectName == 'Job') && d.data.ObjectParameters.JobProgress;
                    }).append('line')
                        .attr('x1', 0)
                        .attr('y1', 0)
                        .attr('x2', function (d) {
                            if (d.data.ObjectParameters.JobProgress.HasProgressBar && d.data.ObjectParameters.JobProgress.FieldValue) {
                                return d.data.ShapeOuterLengthX;
                            }
                            return 0;
                        })
                        .attr('y2', 0)
                        .attr('stroke', '#cecece')
                        .attr('stroke-width', 4);
                    nodes.filter(function (d) {
                        return (d.data.AppObjectName == 'Job') && d.data.ObjectParameters.JobProgress;
                    }).append('line')
                        .attr('x1', 0)
                        .attr('y1', 0)
                        .attr('x2', function (d) {
                            if (d.data.ObjectParameters.JobProgress.HasProgressBar && d.data.ObjectParameters.JobProgress.FieldValue) {
                                var progress = d.data.ObjectParameters.JobProgress.FieldValue.split('/');
                                if (progress[1] > 0 && progress[0] >= 0) {
                                    return (d.data.ShapeOuterLengthX) * (Math.min(progress[0], progress[1]) / (progress[1] == "0" ? 1 : progress[1]));
                                }
                            }
                            return 0;
                        })
                        .attr('y2', 0)
                        .attr('stroke', 'black')
                        .attr('stroke-width', 4);
                    nodes.filter(function (d) {
                        return (d.data.AppObjectName == 'Job') && d.data.ObjectParameters.JobProgress;
                    }).append("text")
                        .attr("x", function (d) {
                            return d.data.ShapeOuterLengthX / 2;
                        })
                        .attr("y", -20)
                        .text(function (d) {
                            return d.data.ObjectParameters.JobProgress.FieldValue;
                        })
                        .style("font-size", 16)
                        .style("font-weight", 600)
                        .style("fill", "white")
                        .attr("text-anchor", "middle");
                    // TODO removed for previous sprint
                    //append drop-down circle
                    nodes.append('circle').filter(function (d) {
                        var ObjectParameters = d.data.ObjectParameters;
                        _.remove(d.data.ObjectActions, function (action) {
                            if (loopInTree && action.ActionEName == "Alternative Parents") {
                                return true;
                            }
                            var actionsParams = {};
                            if (typeof action.ActionCriteria == 'string' && action.ActionCriteria !== '' &&
                                action.ActionCriteria !== null) {
                                action.ActionCriteria = JSON.parse(action.ActionCriteria);
                            }
                            if (action.ActionCriteria && action.ActionCriteria.criteria) {
                                for (var j = 0; j < action.ActionCriteria.criteria.params.length; j++) {
                                    if (ObjectParameters && ObjectParameters[action.ActionCriteria.criteria.params[j]] &&
                                        ObjectParameters[action.ActionCriteria.criteria.params[j]].FieldValue) {
                                        actionsParams[action.ActionCriteria.criteria.params[j]] = ObjectParameters[action.ActionCriteria.criteria.params[j]].FieldValue;
                                    }
                                }
                            }
                            if (action.ActionCriteria !== "") {
                                var criteria = action.ActionCriteria;
                                return !jsonLogic.apply(criteria.criteria.condition, actionsParams);
                            }
                            return false;
                        });
                        return d.data.ObjectActions.length > 0;
                    })
                        .attr("cx", function (d) {
                            return (($scope.nodeToRoot ? !$scope.rtl : $scope.rtl) ? d.data.ShapeOuterLengthX - 2 : 2);
                        })
                        .attr("cy", 0)
                        .attr("r", 8)
                        .style('fill', function (d) {
                            return d.data.Color;
                        })
                        .style('stroke-width', 2)
                        .style('stroke', 'white')
                        .style("cursor", "pointer")
                        .on('click', function (d) {
                            dropDownClick(this.parentElement.getElementsByClassName('drop-down-arrow')[0], d.data.ObjectParameters);
                            d3.event.stopPropagation();
                        });

                    //append arrow for drop-down
                    nodes.append("polyline").filter(function (d) {
                        return d.data.ObjectActions.length > 0;
                    })
                        .attr("x", function (d) {
                            return d.data.ShapeOuterLengthX;
                        })
                        .attr("y", 0)
                        .attr("points", function (d) {
                            if (($scope.nodeToRoot ? $scope.rtl : !$scope.rtl)) {
                                return (-2) + ',-2 ' + (+6) + ',-2 ' + (2) + ',3';
                            }
                            return (d.data.ShapeOuterLengthX - 6) + ',-2 ' + (d.data.ShapeOuterLengthX + 2) + ',-2 ' + (d.data.ShapeOuterLengthX - 2) + ',3';
                        })
                        .classed('drop-down-active', false)
                        .classed('drop-down-arrow', true)
                        .style("fill", 'white')
                        .style("cursor", "pointer")
                        .on('click', function (d) {
                            dropDownClick(this.parentElement.getElementsByClassName('drop-down-arrow')[0], d.data.ObjectParameters);
                            d3.event.stopPropagation();
                        });

                    //append top half
                    appendTopHalf(nodes);

                    // append sub-title
                    appendBottomHalf(nodes)

                    nodes.selectAll("text").style('font-family', 'ProximaNova').each(function (d) {
                        var len = d.data.ShapeOuterLengthX;
                        var lenToY = 0;
                        if (d.data.Shape == "Circle") {
                            lenToY = Math.abs(parseInt(d3.select(this).attr("y"))) + 5;
                            len = 2 * Math.sqrt(Math.pow((d.data.ShapeOuterLengthX / 2), 2) - Math.pow(lenToY, 2));
                        }
                        if (d.data.Shape == 'Rhombus') {
                            lenToY = Math.abs(parseInt(d3.select(this).attr("y"))) + 5;
                            len = (d.data.ShapeOuterLengthY / 2 - lenToY) * len / (d.data.ShapeOuterLengthY / 2)
                        }
                        wrap(this, len - 10);
                    });

                    //append status text
                    nodes.filter(function (d) {
                        var ans = (_.find(d.data.ObjectParameters, function (val, key) {
                            return val.IsExternalLabel;
                        }));
                        return ans;
                    }).append('text')
                        .attr('x', function (d) {
                            return d.data.ShapeOuterLengthX / 2;
                        })
                        .attr('y', function (d) {
                            return d.data.ShapeOuterLengthY / 2 + 10;
                        })
                        .attr('text-anchor', 'middle')
                        .text(function (d) {
                            var text = "";
                            var value = _.find(d.data.ObjectParameters, function (val, key) {
                                return val.IsExternalLabel;
                            });
                            if (value) {
                                return value.FieldValue;
                            }
                            return "";
                        })
                        .style('font-size', 9)
                        .style('fill', '#a3a3a3');

                    //append expand/collapse arrow
                    nodes.append("polyline")
                        .attr("x", function (d) {
                            return d.data.ShapeOuterLengthX / 2;
                        })
                        .attr("y", 0)
                        .attr("text-anchor", "middle")
                        .style("cursor", "pointer")
                        .classed("node-toggle", true)
                        .on("click", function (d) {
                            click(d);
                            d3.event.stopPropagation();
                        });

                    // add node click
                    d3.selectAll("g.node").on('click', function (d) {
                        var elem = d3.select("g.node.selected");
                        if (!elem.empty()) {
                            elem.classed("selected", false);
                        }
                        d3.select(this).classed("selected", true);
                        if (d && d.data && d.data.TargetFormID) {
                            if ($scope.selectedNode == d.data) {
                                return;
                            }
                            const selectedNode = d.data;
                            var request = {
                                "LeaderID": selectedNode.ObjectID,
                                "formID": selectedNode.TargetFormID,
                                "pairs":
                                    [
                                    ]
                            };
                            var requestResponse = {
                                "LeaderID": selectedNode.ObjectID,
                                "formID": selectedNode.TargetFormID
                            };


                            $scope.formId = selectedNode.TargetFormID;
                            $scope.leaderId = selectedNode.ObjectID;
                            $scope.pairs = [];
                            $scope.actionName = "SAVE_CHANGES";
                            $scope.request = request;
                            $scope.SkipSaveOperation = false;
                            $scope.api = 'DisplayFormResults'
                            $scope.fullSize = true;
                            $scope.loading = false;
                            // commonFunctions.formResults($scope, request, requestResponse, 'DisplayFormResults', [], false);

                            if (!$scope.DisaplyConfigFromRoot) {
                                if (d.data.icons && d.data.icons.indexOf('jobIcon') >= 0) {
                                    $scope.getConfigData(d.data.ObjectID);
                                }
                                else {
                                    $scope.jobConfigs = [];
                                }
                            }
                            $timeout(() => {
                                $scope.selectedNode = selectedNode;
                            }, 50);
                        }
                    });
                }

                function appendTopHalf(nodes) {
                    nodes.each(function (d) {
                        var positionIndex = 0;
                        var paramLen = 0;
                        // var nodeTemp = $scope.settingsData.graphToolList[_.findIndex($scope.settingsData.graphToolList, function(o) { return o.AppObjectName == d.data.AppObjectName; })];
                        for (index in d.data.ObjectParameters) {
                            if (d.data.ObjectParameters[index].DisplayOnTopHalf) {
                                paramLen += 1;
                            }
                        }
                        if (paramLen == 0) {
                            paramLen = 1;
                        }
                        for (index in d.data.ObjectParameters) {
                            if (!d.data.ObjectParameters[index].DisplayOnTopHalf) {
                                continue;
                            }
                            if (d.data.ObjectParameters[index].HasLink) {
                                d3.select(this).append("text")
                                    .attr("fill", "white")
                                    .attr("text-decoration", function (d) {
                                        if ((d.data.AppObjectName == ObjectType) && d.data.ObjectID == ObjectID) {
                                            return "none";
                                        }
                                        return "underline";
                                    })
                                    .style("cursor", function (d) {
                                        if ((d.data.AppObjectName == ObjectType) && d.data.ObjectID == ObjectID) {
                                            return "default";
                                        }
                                        return "pointer";
                                    })
                                    .attr("x", function (d) {
                                        return d.data.ShapeOuterLengthX / 2;
                                    })
                                    .attr("y", function (d) {
                                        return ((d.data.AppObjectName == 'Job') && d.data.ObjectParameters.JobProgress) ? (-40 - 16 * positionIndex) : (-20 - 16 * positionIndex);
                                    })
                                    .attr("text-anchor", "middle")
                                    .text(function (d) {
                                        return (index == "Amount" ? "x" : "") + d.data.ObjectParameters[index].FieldValue; s
                                    })
                                    .style("font-size", 16)
                                    .style("font-weight", 600)
                                    .on('click', function (d) {
                                        if ((d.data.AppObjectName == ObjectType) && d.data.ObjectID == ObjectID) {
                                            return;
                                        }
                                        var link = "#/appObjectFullView/" + d.data.AppObjectName + "/" + d.data.ObjectID + "/";
                                        var target = d.data.AppObjectName + "_tree";
                                        window.open(link, target);
                                        d3.event.stopPropagation();
                                    })
                                    .append("svg:title").text(function (d) {
                                        return (index == "Amount" ? "x" : "") + d.data.ObjectParameters[index].FieldValue;
                                    });
                                positionIndex += 1;
                            } else {
                                d3.select(this).append("text")
                                    .attr("x", function (d) {
                                        return d.data.ShapeOuterLengthX / 2;
                                    })
                                    .attr("y", function (d) {
                                        return ((d.data.AppObjectName == 'Job') && d.data.ObjectParameters.JobProgress) ? (-40 - 16 * positionIndex) : (-20 - 16 * positionIndex);
                                    })
                                    .attr("text-anchor", "middle")
                                    .text(function (d) {
                                        if ($scope.ratioEnabled && $scope.settingsData.relativeAmount) {
                                            return (index == "Amount" ? "x" : "") + (index == "Amount" ? d.data.RelativAmount : d.data.ObjectParameters[index].FieldValue);
                                        }
                                        else {
                                            return (index == "Amount" ? "x" : "") + d.data.ObjectParameters[index].FieldValue;
                                        }
                                    })
                                    .style("font-size", 16)
                                    .style("fill", "white")
                                    .style("font-weight", 600)
                                    .append("svg:title").text(function (d) {
                                        return d.data.ObjectParameters[index].FieldValue;
                                    });
                                positionIndex += 1;
                            }
                        }
                    })
                }

                function appendBottomHalf(nodes) {
                    nodes.each(function (d) {
                        var positionIndex = 0;
                        var paramLen = 0;
                        var nodeTemp = $scope.settingsData.graphToolList[_.findIndex($scope.settingsData.graphToolList, function (o) { return o.AppObjectName == d.data.AppObjectName; })];
                        for (index in d.data.ObjectParameters) {
                            if (nodeTemp.ObjectParameters[index].Pinned || (nodeTemp.ObjectParameters[index].IsDisplay && nodeTemp.ObjectParameters[index].IsDisplayInNodeElements)) {
                                paramLen += 1;
                            }
                        }
                        if (paramLen == 0) {
                            paramLen = 1;
                        }
                        for (index in d.data.ObjectParameters) {
                            if (!(nodeTemp.ObjectParameters[index].Pinned || (nodeTemp.ObjectParameters[index].IsDisplay && nodeTemp.ObjectParameters[index].IsDisplayInNodeElements))) {
                                continue;
                            }
                            if (d.data.ObjectParameters[index].HasLink) {
                                d3.select(this).append("text")
                                    .attr("fill", function (d) {
                                        if ((d.data.AppObjectName == ObjectType) && d.data.ObjectID == ObjectID) {
                                            return "#072345";
                                        }
                                        return "#337ab7";
                                    })
                                    .attr("text-decoration", function (d) {
                                        if ((d.data.AppObjectName == ObjectType) && d.data.ObjectID == ObjectID) {
                                            return "none";
                                        }
                                        return "underline";
                                    })
                                    .style("cursor", function (d) {
                                        if ((d.data.AppObjectName == ObjectType) && d.data.ObjectID == ObjectID) {
                                            return "default";
                                        }
                                        return "pointer";
                                    })
                                    .attr("x", function (d) {
                                        return d.data.ShapeOuterLengthX / 2;
                                    })
                                    .attr("y", function (d) {
                                        return 15 * positionIndex + 10;
                                    })
                                    .attr("text-anchor", "middle")
                                    .text(function (d) {
                                        return d.data.ObjectParameters[index].FieldValue;
                                    })
                                    .style("font-size", 12)
                                    .on('click', function (d) {
                                        if ((d.data.AppObjectName == ObjectType) && d.data.ObjectID == ObjectID) {
                                            return;
                                        }
                                        var link = "#/appObjectFullView/" + d.data.AppObjectName + "/" + d.data.ObjectID + "/";
                                        var target = d.data.AppObjectName + "_tree";
                                        window.open(link, target);
                                        d3.event.stopPropagation();
                                    })
                                    .append("svg:title").text(function (d) {
                                        return d.data.ObjectParameters[index].FieldValue;
                                    });
                                positionIndex += 1;
                            } else {
                                d3.select(this).append("text")
                                    .attr("x", function (d) {
                                        return d.data.ShapeOuterLengthX / 2;
                                    })
                                    .attr("y", function (d) {
                                        return 15 * positionIndex + 10;
                                    })
                                    .attr("text-anchor", "middle")
                                    .text(function (d) {
                                        return d.data.ObjectParameters[index].FieldValue;
                                    })
                                    .style("font-size", 12)
                                    .style("fill", "#072345")
                                    .append("svg:title").text(function (d) {
                                        return d.data.ObjectParameters[index].FieldValue;
                                    });
                                positionIndex += 1;
                            }
                        }
                    })
                }

                $scope.updateGraph = function (value, hide) {
                    if (!hide) {
                        _.remove($scope.settingsData.objHide, function (n) {
                            return n == value;
                        });
                    } else {
                        $scope.settingsData.objHide.push(value);
                    }
                    $scope.settingsData.objHide = _.uniq($scope.settingsData.objHide);
                    svg.selectAll("path.link").remove();
                    tree = flextree.hierarchy(newRoot);
                    tree.x0 = 0;
                    tree.y0 = height / 2;
                    update(tree);
                }

                // initialize num of selections object
                $scope.numOfCheckboxSelection = {};
                for (var i = 0; i < $scope.settingsData.graphToolList.length; i++) {
                    $scope.numOfCheckboxSelection[i] = 0;
                    angular.forEach($scope.settingsData.graphToolList[i].ObjectParameters, function (param) {
                        if (param.IsDisplay && !param.Pinned) {
                            $scope.numOfCheckboxSelection[i]++;
                        }
                    })
                }

                $scope.updateTextGraph = function (model, maxDisplay, index) {
                    update(tree, false, 1);
                    if (model) {
                        $scope.numOfCheckboxSelection[index]++;
                    } else {
                        $scope.numOfCheckboxSelection[index]--;
                    }
                };

                $scope.ratioChanged = function (newValue) {
                    $scope.settingsData.relativeAmount = newValue;
                    update(tree);
                };

                $scope.dropDownToggle = function (index) {
                    document.getElementById('nodeOption' + index).classList.toggle("active");
                    document.getElementById('dropDown' + index).classList.toggle("active");
                    var btn = document.getElementById('nodeOption' + index).getElementsByClassName("graph-options")[0];
                    if (btn.innerText == $filter("translate")("OPTIONS")) {
                        btn.innerText = $filter("translate")("CLOSE");
                        $scope.settingsData.graphToolList[index].showKeys = false;
                    } else {
                        btn.innerText = $filter("translate")("OPTIONS");
                        $scope.settingsData.graphToolList[index].showKeys = true;
                    }

                }
                $scope.toggleDir = function (value) {
                    $scope.rtl = $scope.nodeToRoot ? value : !value;
                    svg.selectAll("path.link").remove();
                    update(tree);
                    centerGraph();
                }
                $scope.optionChange = function (node, key) {
                    $scope.settingsData.graphToolList[_.findIndex($scope.settingsData.graphToolList, function (o) { return o.AppObjectName == node.AppObjectName; })].ObjectParameters[key].IsDisplay = false;
                    $scope.updateTextGraph();
                }
                function centerGraph() {
                    var graphSize = {
                        "y": graphYmin,
                        "x": graphXmin,
                        "width": Math.abs(graphXmax - graphXmin),
                        "height": Math.abs(graphYmax - graphYmin)
                    };
                    var newX, newY = 0;
                    var newScale = 1;
                    var widthWP = width - 50;
                    var heightWP = height - 100;
                    if (graphSize.width > widthWP) {
                        newScale = widthWP / graphSize.width;
                    }
                    if (graphSize.height * newScale > heightWP) {
                        newScale = heightWP / (graphSize.height * newScale);
                    }
                    newY = height / 2 - (graphYmax + graphYmin) * newScale;
                    newX = width / 2 + ($scope.rtl ? -1 : 1) * (newScale * graphSize.width / 2);
                    zm.translate([newX, newY]).scale(newScale);
                    svg.attr("transform", "translate(" + newX + "," + newY + ")" +
                        " scale(" + newScale + ")");
                }
                $scope.centerGraph = centerGraph;
                //Redraw for zoom
                function redraw() {
                    svg.attr("transform", "translate(" + d3.event.translate + ")" +
                        " scale(" + d3.event.scale + ")");
                }

                if (refreshDuration > 0) {
                    $scope.treeGraphInterval = $interval(function () {
                        LeaderMESservice.customAPI(requestAPI, requestBody).then(function (response) {
                            var newRoot = response.Root;
                            if (!newRoot) {
                                return;
                            }
                            newRoot.x0 = 0;
                            newRoot.y0 = height / 2;
                            tree = flextree.hierarchy(newRoot);
                            tree.x0 = 0;
                            tree.y0 = height / 2;
                            update(tree, false, 1);
                        });
                    }, refreshDuration * 1000);
                    $scope.treeGraphInterval;
                }



                function getSettings() {
                    LeaderMESservice.customAPI("GetTreeStructure", { "treeID": $scope.treeId }).then(function (response) {
                        if (!response || !response.GeneralStructure) {
                            return;
                        }
                        var currentElemnets = _.map($scope.settingsData.graphToolList, function (element) {
                            return element.AppObjectName;
                        })
                        var data = JSON.parse(response.GeneralStructure);
                        if (data) {
                            if (data.relativeAmount !== undefined) {
                                $scope.settingsData.relativeAmount = data.relativeAmount;
                            }

                            if (data.graphToolList !== undefined) {
                                for (var i = 0; i < data.graphToolList.length; i++) {
                                    var graphObject = _.find($scope.settingsData.graphToolList, { AppObjectName: data.graphToolList[i].AppObjectName });
                                    if (graphObject) {
                                        for (var key in data.graphToolList[i].ObjectParameters) {
                                            if (graphObject.ObjectParameters[key] !== undefined) {
                                                graphObject.ObjectParameters[key].IsDisplay = data.graphToolList[i].ObjectParameters[key].IsDisplay;
                                            }
                                        }
                                    }
                                }
                            }
                            for (var i = 0; i < currentElemnets.length; i++) {
                                var index = _.findIndex(data.visibleNodes, currentElemnets[i]);
                                if (index > -1) {
                                    $scope.settingsData.isvisible[currentElemnets[i]] = true;
                                    continue;
                                }
                                index = _.findIndex(data.objHide, currentElemnets[i]);
                                if (index > -1) {
                                    $scope.settingsData.objHide.push(currentElemnets[i]);
                                    continue;
                                }

                            }
                            $scope.settingsData.objHide = _.uniq($scope.settingsData.objHide);

                        }
                        svg.selectAll("path.link").remove();
                        tree = flextree.hierarchy(newRoot);
                        tree.x0 = 0;
                        tree.y0 = height / 2;
                        update(tree);
                    });
                }
            }, 300);

        };
        var timeoutPromise;
        var delayInMs = 1000;
        $scope.$watch("settingsData", function () {
            $timeout.cancel(timeoutPromise);
            timeoutPromise = $timeout(function () {
                if (!$scope.treeId) {
                    return;
                }

                var data = {
                    visibleNodes: [],
                    graphToolList: _.map($scope.settingsData.graphToolList, function (graph) {
                        return {
                            AppObjectName: graph.AppObjectName,
                            ObjectParameters: graph.ObjectParameters
                        }
                    }),
                    relativeAmount: $scope.settingsData.relativeAmount,
                    objHide: $scope.settingsData.objHide
                }
                for (var key in $scope.settingsData.isvisible) {
                    if ($scope.settingsData.isvisible[key]) {
                        data.visibleNodes.push(key);
                    }
                }
                LeaderMESservice.customAPI("SaveTreeStructure",
                    {
                        "treeStructure":
                            { "TreeID": $scope.treeId, "GeneralStructure": JSON.stringify(data) }
                    }).then(function (response) {
                        if (response.error) {
                            console.log("couldn't save tree setting: " + response.error);
                        }
                    });
            }, delayInMs);
        }, true)

        function dropDownClick(elem, ObjectParameters) {
            var btn = d3.select(elem);
            var parentNode = d3.select(elem.parentNode);
            var dropDownW = 100;
            if (btn.classed('drop-down-active')) {
                parentNode.select('.drop-down').remove();
                btn.classed('drop-down-active', false);
                btn.transition().attr("points", function (d) {
                    if (($scope.nodeToRoot ? $scope.rtl : !$scope.rtl)) {
                        return (-2) + ',-2 ' + (+6) + ',-2 ' + (2) + ',3';
                    }
                    return (d.data.ShapeOuterLengthX - 6) + ',-2 ' + (d.data.ShapeOuterLengthX + 2) + ',-2 ' + (d.data.ShapeOuterLengthX - 2) + ',3';
                });
            } else {
                d3.select('.drop-down').remove();
                d3.select(".drop-down-active").classed('drop-down-active', false).transition().attr("points", function (d) {
                    if (($scope.nodeToRoot ? $scope.rtl : !$scope.rtl)) {
                        return (-2) + ',-2 ' + (+6) + ',-2 ' + (2) + ',3';
                    }
                    return (d.data.ShapeOuterLengthX - 6) + ',-2 ' + (d.data.ShapeOuterLengthX + 2) + ',-2 ' + (d.data.ShapeOuterLengthX - 2) + ',3';
                });
                var parentNode = d3.select(elem.parentNode);
                var dropDownRect = parentNode.insert('g')
                    .classed('drop-down', true);

                var nodeData = dropDownRect.datum();
                if (nodeData.data.ObjectActions) {
                    dropDownRect.append('rect')
                        .attr('y', -10)
                        .attr('x', function (d) {
                            return ($scope.nodeToRoot ? !$scope.rtl : $scope.rtl) ? d.data.ShapeOuterLengthX + 10 : -dropDownW - 10;
                        })
                        .attr('width', dropDownW)
                        .attr('height', function (d) {
                            return d.data.ObjectActions.length * 35;
                        })
                        .on('click', function (d) {
                            d3.event.stopPropagation();
                        })
                        .style('fill', 'white')
                        .style('filter', makeFilter('Black', 'Square'));
                    nodeData.data.ObjectActions.forEach(function (action, i) {
                        // add rect behind text to click on
                        dropDownRect
                            .append('rect')
                            .attr('x', function (d) {
                                return ($scope.nodeToRoot ? !$scope.rtl : $scope.rtl) ? d.data.ShapeOuterLengthX + 10 : -dropDownW - 10;
                            })
                            .attr('y', 35 * (i))
                            .attr('width', dropDownW)
                            .attr('height', function (d) {
                                return 35;
                            })
                            .style('cursor', 'pointer')
                            .style('fill', 'white')
                            .on('click', function (d) {
                                dropDownClick(elem, ObjectParameters);
                                $scope.content.ID = d.data.ObjectID;
                                action.ObjectParameters = d.data.ObjectParameters;
                                actionService.openAction($scope, action);
                                d3.event.stopPropagation();
                            });
                        // end add rect behind action
                        dropDownRect
                            .append('text')
                            .attr('text-anchor', 'middle')
                            .attr('x', function (d) {
                                return (($scope.nodeToRoot ? !$scope.rtl : $scope.rtl) ? d.data.ShapeOuterLengthX + 10 : -dropDownW - 10) + dropDownW / 2;
                            })
                            .attr('y', 17.5 - 13 + 35 * (i))
                            .text($scope.localLanguage ? action.ActionLName : action.ActionEName)
                            .style('cursor', 'pointer')
                            .on('click', function (d) {
                                dropDownClick(elem, ObjectParameters);
                                $scope.content.ID = d.data.ObjectID;
                                action.ObjectParameters = d.data.ObjectParameters;
                                actionService.openAction($scope, action);
                                d3.event.stopPropagation();
                            });
                        dropDownRect
                            .append('line')
                            .attr('x1', function (d) {
                                return (($scope.nodeToRoot ? !$scope.rtl : $scope.rtl) ? d.data.ShapeOuterLengthX + 10 : -dropDownW - 10);
                            })
                            .attr('y1', 35 * (i + 1) - 10)
                            .attr('x2', function (d) {
                                return ((($scope.nodeToRoot ? !$scope.rtl : $scope.rtl)) ? d.data.ShapeOuterLengthX + 10 : -dropDownW - 10) + dropDownW;
                            })
                            .attr('y2', 35 * (i + 1) - 10)
                            .style('stroke-width', 1)
                            .style('stroke', '#e9e9eb')
                    });
                    d3.selectAll("drop-down-active").attr("click-outside", null);
                    btn.classed('drop-down-active', true);
                    btn.attr("click-outside", "closeDropDown()");
                    btn.transition().attr("points", function (d) {
                        if (($scope.nodeToRoot ? $scope.rtl : !$scope.rtl)) {
                            return (-2) + ',2 ' + (+6) + ',2 ' + (+2) + ',-3';
                        }
                        return (d.data.ShapeOuterLengthX - 6) + ',2 ' + (d.data.ShapeOuterLengthX + 2) + ',2 ' + (d.data.ShapeOuterLengthX - 2) + ',-3';
                    })
                    d3.selectAll('.drop-down text').each(function (d) {
                        wrap(this, dropDownW - 5);
                    });
                }
            }

            recompile();
        };


        //recompile svg
        function recompile() {
            var elem = angular.element("#tree-graph svg");
            var compiled = $compile(elem);
            compiled($scope);
        };

        function wrap(elem, textLen) {
            var self = d3.select(elem),
                textLength = self.node().getComputedTextLength(),
                text = self.text(),
                titleText = text;

            while (textLength > (textLen) && text.length > 0) {
                text = text.slice(0, -1);
                self.text(text + '...');
                textLength = self.node().getComputedTextLength();
            }
            self.append("svg:title").text(titleText);
        }

        function makeFilter(color, shape) {
            //make a filter if filter id not present
            var color = color.replace(' ', '').replace(',', '').replace('.', '').replace('(', '').replace(')', '').replace('#', '');
            var id = shape + color;
            if ($scope.defs.selectAll("#" + id).empty()) {
                if (shape == 'Circle') {
                    $scope.defs.append("filter")
                        .attr("id", id)
                        .append("feDropShadow")
                        .attr("dx", "0")
                        .attr("dy", "0")
                        .attr("stdDeviation", "1")
                        .attr('flood-opacity', 1)
                        .attr('stroke-width', 10)
                        .attr("flood-color", color);
                }
                if (shape == 'Square') {
                    $scope.defs.append("filter")
                        .attr("id", id)
                        .append("feDropShadow")
                        .attr("dx", "0")
                        .attr("dy", "0")
                        .attr("stdDeviation", "2")
                        .attr('flood-opacity', 0.5)
                        .attr("flood-color", color)
                }
            }
            return 'url(#' + id + ")"; //return the filter id
        }

        LeaderMESservice.customAPI(requestAPI, requestBody).then(graphRender);


        $scope.updateData = function () {
            d3.select("#tree-graph").html("");
            $scope.selectedNode = null;
            LeaderMESservice.customAPI(requestAPI, requestBody).then(graphRender);
        }


        $scope.getTargetParameters = function (targetParameters, $scope, objectParameters) {
            var targetParametersSplit = targetParameters.split(",");
            var ans = {};
            for (var i = 0; i < targetParametersSplit.length; i++) {
                var targetParameterSplit = targetParametersSplit[i].split("=");
                targetParameterSplit[1] = targetParameterSplit[1].replace(/\[/g, '');
                targetParameterSplit[1] = targetParameterSplit[1].replace(/\]/g, '');
                if (objectParameters && objectParameters[targetParameterSplit[1]] && objectParameters[targetParameterSplit[1]].FieldValue) {
                    ans[targetParameterSplit[0]] = parseInt(objectParameters[targetParameterSplit[1]].FieldValue);
                }
            }
            return ans;
        };

        $scope.getName = function (actionItem) {
            if ($scope.localLanguage == true) {
                return actionItem.SubMenuLName;
            }
            return actionItem.SubMenuEName;
        };

        $scope.emptyPage = $scope.updateData;

        $scope.resetSelectedNode = function () {
            var elem = d3.select("g.node.selected")
            $scope.selectedNode = null;
            if (!elem.empty()) {
                elem.classed("selected", false);
            }
        };


        //drop down close after click-outside
        $scope.closeDropDown = function () {
            var elem = d3.select(".drop-down-active");
            if (!elem.empty()) {
                dropDownClick(elem[0][0], null);
            }
        };

        $scope.getConfigData = function (id) {
            LeaderMESservice.customAPI("GetListOfJobConfiguraions", { "JobID": id }).then(function (response) {
                $scope.jobConfigs = [];
                for (var i = 0; i < response.JobConfigurations.length; i++) {
                    var newJobConfig = {};
                    var jobData = _.find(response.JobConfigurations[i], { propertyName: "ID" });
                    if (jobData) {
                        newJobConfig.ID = jobData.propertyValue;
                        var productName = _.find(response.JobConfigurations[i], { propertyName: "ProductName" });
                        if (productName) {
                            newJobConfig.producName = productName.propertyValue;
                        }
                        var filePath = _.find(response.JobConfigurations[i], { propertyName: "FilePath" });
                        if (filePath) {
                            newJobConfig.filePath = filePath.propertyValue;
                        }
                        $scope.jobConfigs.push(newJobConfig);
                    }
                }
            });
        }

        $scope.openNodeWizardItem = function (item) {

        }

        $scope.openJob = function (jobId) {
            var url = $state.href('appObjectFullView', { appObjectName: 'Job', ID: jobId, tabId: 10562 });
            var childWindow = window.open(url, 'Job');
            childWindow.location.reload();
        }

        // function getSettings(){
        //     LeaderMESservice.customAPI("GetTreeStructure", {"treeID":$scope.treeId}).then(function(response){
        //         if(!response || !response.GeneralStructure){
        //             return;
        //         }
        //         var data = JSON.parse(response.GeneralStructure);
        //         if(data.graphToolList){
        //             $scope.settingsData.graphToolList = data.graphToolList;
        //         }
        //         $scope.update(tree);
        //     });
        // }
        //
        // var timeoutPromise;
        // var delayInMs = 2000;
        // $scope.$watch("settingsData",function(){
        //     $timeout.cancel(timeoutPromise);
        //     timeoutPromise = $timeout(function(){
        //         if(!$scope.treeId){
        //             return;
        //         }
        //         LeaderMESservice.customAPI("SaveTreeStructure",
        //             { "treeStructure":
        //                     { "TreeID":$scope.treeId, "GeneralStructure":JSON.stringify($scope.settingsData)}
        //             }).then(function(response) {
        //             console.log(response);
        //         });
        //     });
        // }, true)
    }

    return {
        restrict: "E",
        templateUrl: Template,
        link: function (scope, element, attr) {
            element.on('$destroy', function () {
                if (scope.treeGraphInterval) {
                    $interval.cancel(scope.treeGraphInterval);
                }
            });
        },
        scope: {
            requestapi: '=',
            requestbody: '=',
            content: '=',
            options: '='
        },
        controller: controller,
        controllerAs: 'treeGraphCtrl'
    };
};


angular
    .module('LeaderMESfe')
    .directive('treeGraphDirective', treeGraphDirective);