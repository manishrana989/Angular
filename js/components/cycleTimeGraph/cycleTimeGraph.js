
const cycleTimeGraphDirective = function ($timeout, LeaderMESservice, graphFunctions) {
    var template = "js/components/cycleTimeGraph/cycleTimeGraph.html";

    var controller = function($scope){
        $scope.closeExpanded = function(){
            if($scope.expandedView) {
                $scope.expandedView = false;
                $scope.cycleDrawGraph();
            }
        }
    }

    var link = function (scope, element, attrs) {
        scope.getValidPoints = graphFunctions.getValidPoints;
        var e = element;
        graphPresent = false;
        scope.dataUpdated = false;
        scope.days = []
        scope.ticks = 0;
        scope.expandedView = false;

        
        scope.getGraphData(scope.machineId,scope.parameter);
        let remakeTemplate = function(){

            var directive = d3.select(element[0]);
            var cycleTimeGraph = directive.select(".cycleTimeGraph");
            cycleTimeGraph.selectAll('*').remove();         
            
            let svg = cycleTimeGraph.append("svg");
            let g = svg.append("g").attr("class", "g-contain");
            g.append("path").attr("class", "line");
            g.append("g").attr("class", "x axis");
            g.append("g").attr("class", "y axis")
        }
        remakeTemplate();

        let getSvg = function(){
            var directive = d3.select(element[0]);
            var cycleTimeGraph = directive.select(".cycleTimeGraph");
            var svg = cycleTimeGraph.select("svg");
            return svg
        }


        // target specific svg of directive and get its apprpriate width
        let graphWidth = element[0].parentNode;



        //var graph = angular.element(graphContainer[0]).parent()[0];
        //var graphWidth = d3.select(".show-as-inline")[0][0];

        //linking custom API
        scope.customAPI = LeaderMESservice.customAPI;
        scope.data = [];

        //representation of days in seconds. used to select which hours are to be printed on the x axis
        let daysInSeconds = [
            "12",
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
            "11",
            "12",
            "13",
            "14",
            "15",
            "16",
            "17",
            "18",
            "19",
            "20",
            "21",
            "22",
            "23"
        ]
        //a function which translates time from hh:mm:ss to seconds
        timeInSeconds = function (time) {
            let temp = time.split(":");
            let seconds = 0;
            for (let i = 0; i < temp.length; i++) {
                seconds += parseInt(temp[i]) * (3600 / (Math.pow(60, i)))
            }
            return seconds;
        }

        //takes start and end time in seconds and updates timeAxisValues with the corresponding schedule: [7am, 8am, ...]. its also cyclic. it uses daysInSeconds
        scope.getTimeAxisValues = function (startTime, endTime) {
            scope.days = [];
            let start = Math.floor(startTime / 3600);
            let end = Math.ceil(endTime / 3600);
            if (end * 3600 < endTime) {
                end++;
            }
            let i = start;
            while ((i % 24) != end) {
                scope.days.push(daysInSeconds[i % 24]);
                i++;
            }
            return scope.days;
        };

        scope.updateData = function (data) {
            let curr = Math.floor(data[0].x / 3600);
            for (let i = 0, y = 0; y < data.length; y++) {
                if (Math.floor(data[y].x / 3600) != curr) {
                    curr = Math.floor(data[y].x / 3600);
                    i += 1;
                }
                data[y].x = 3600 * i + data[y].x % 3600;
            }
            return data;
        }

        scope.cycleDrawGraph = function (newWidth,newHeight) {
            if (!scope.graph) {
                return;
            }
            //change "PEE" to "CycleTime"

            remakeTemplate();
            let svg = getSvg();

            if (!scope.graphData ||
                scope.graphData.length == 0 ){
                return;
            }
            var limitMin = scope.graphData[0].MinValue;
            var limitMax = scope.graphData[0].MaxValue;
            
            let pointsAsDate = scope.graphData[0].Items;
            var minY = null;
            var maxY = null;
            scope.data = [];
            pointsAsDate.forEach(function (element) {
                //the element is of the format "yyyy-mm-ddThh:mm:ss".
                let temp = element["X"].split('T');
                let date = temp[0].split('-');
                let time = temp[1];
                //ignore points with no data (null)
                if (element["Y"]) {
                    scope.data.push({ "x": timeInSeconds(time), y: element["Y"] });
                }
            })
            let array = scope.data.map(obj => {
                let arr = [];
                arr[0] = obj.x;
                arr[1] = obj.y;
                return arr;
            })

            scope.data = scope.getValidPoints(array, true, true);

            scope.data = scope.data.map(arr => {
                let obj = {};
                obj.x = arr[0];
                obj.y = arr[1];
                if (minY === null){
                    minY = arr[1];
                }
                else if (arr[1] < minY ){
                    minY = arr[1];
                }
                if (maxY === null){
                    maxY = arr[1];
                }
                else if (arr[1] > maxY ){
                    maxY = arr[1];
                }
                return obj
            })


           // pointsAsDate = scope.getValidPoints(pointsAsDate, true, true);
            if (!scope.data || scope.data.length == 0){
                scope.graph = false;
                return;
            }
            scope.days = scope.getTimeAxisValues(scope.data[0].x, scope.data[scope.data.length - 1].x);
            scope.data = scope.updateData(scope.data);


            // start drawing svg graph
            let margin = { top: 10, right: 30, bottom: 20, left: 20 };
            if(LeaderMESservice.isLanguageRTL()){
                margin.right = 20;
                margin.left = 30;
            }
            if(!(newWidth ===undefined)) width = newWidth;


            var width = graphWidth.offsetWidth - margin.left;
            
            if (scope.editMode)
                width -= 30;
            var height = 40;

            if(!(newHeight ===undefined)) height = newHeight;
            // Set the ranges
            var x = d3.scale.linear().range([0, newWidth || width]);
            var y = d3.scale.linear().range([newHeight ||height, 0]);

            // Define the axes
            // var xAxis = d3.svg.axis().scale(x)
            //     .orient("bottom").ticks().tickFormat(function (d) {
            //         return d;
            //     });
            let tickVals =[];
            for(let i=0; i < scope.days.length; i++){
                tickVals.push(i*3600);
            }
            var xAxis = d3.svg.axis().scale(x)
                .orient("bottom")
                .tickValues(tickVals)
                .tickFormat(function (d) {
                    let a = Math.floor(d / 3600); //d = 0 +5*10^iteration e.g. 0, 5000, 10000, 15000
                    let b = scope.days[0] //[9,10,11,12]
                    return ((Math.floor(d / 3600)) + Number(scope.days[0])) % 24;

                });

            var yAxis = d3.svg.axis().scale(y)
                .orient("left").ticks(5);

            // Define the line
            var valueline = d3.svg.line()
                .x(function (d, i) { return x(d.x); })
                .y(function (d, i) { return y(d.y); });

            // Adds the svg canvas

            if(!(newWidth ===undefined) && (!(newHeight ===undefined))){
               width = newWidth;
               height =newHeight;
            }

            svg.attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)

                .select(".g-contain")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            scope.data.forEach(function (d) {
                d.y = +d.y;
            });

            if (limitMin > 0 && limitMax > 0){
                if (limitMin < minY){
                    minY = limitMin;
                }
                if (limitMax > maxY){
                    maxY = limitMax;
                }
            }

            // Scale the range of the data
            x.domain([0, scope.days.length * 3600]);
            y.domain([minY - minY * 0.05, maxY + maxY * 0.05]);


            if (limitMin > 0 && limitMax > 0){
                svg.select(".g-contain").append("line").attr("x1", 0).attr("y1",y(limitMin)).attr("x2",width)
                    .attr("y2",y(limitMin)).attr("stroke", "red").attr("stroke-width",1).attr("stroke-dasharray","4");

                svg.select(".g-contain").append("line").attr("x1", 0).attr("y1",y(limitMax)).attr("x2",width)
                    .attr("y2",y(limitMax)).attr("stroke", "red").attr("stroke-width",1).attr("stroke-dasharray","4");
            }

            //find slope of a two points
            var getSlope = function(x1,y1,x2,y2){
                if (x1 == x2) return false;
                return (y2 - y1) / (x2 - x1);
            }

                //find intercept of a two points
            var getIntercept = function(x,y, slope) {
                if (slope === null) {
                    // vertical line
                    return y;
                }
            
                return y - slope * x;
            }

            //find intersection of lines
            var intersection = function(y,m,b)
            {                    
                var  x = (y - b) / m;                        
                return x;
    
            }

                    
            var red = [];
            var redTemp = [];
            var blackTemp = [];
            var yy;
            var reddd=0;
           // add new graph
            svg.select(".g-contain").selectAll(".node").data(scope.data).enter().append("g").classed("node", true).append("circle").style("fill", 
            function(d,count){

                if(d.y < limitMin || d.y > limitMax){   

                    //check if the intersection in the limitMin or limitMax
                    if(d.y < limitMin)
                    {
                        yy = limitMin;
                    }
                    if(d.y > limitMax)
                    {
                        yy = limitMax;
                    }  
                    
                    if(blackTemp.length > 0)
                    {                                   
                        slope = getSlope(blackTemp[blackTemp.length-1].x,blackTemp[blackTemp.length-1].y,d.x,d.y);
                        intercept = getIntercept(d.x,d.y,slope)
                        point = intersection(yy,slope,intercept);
                        //push the intersection point
                        redTemp.push({"x" : point , "y" : yy});
                        redTemp.push({"x" : d.x , "y" : d.y });
                        blackTemp = [];
                    }
                    else
                    {
                        redTemp.push({"x" : d.x , "y" : d.y});
                    }
                    reddd=1;
                    return "red";                
                }  
                  else{   

                   if(redTemp.length > 0)            
                    {
                        //check if the inetersection in the limiMin or limitMax
                        if(redTemp[redTemp.length - 1].y < limitMin)
                        {
                            yy = limitMin;
                        }
                        if(redTemp[redTemp.length - 1].y  > limitMax)
                        {
                            yy = limitMax;
                        }     
                        
                        slope = getSlope(redTemp[redTemp.length-1].x,redTemp[redTemp.length-1].y,d.x,d.y);                        
                        intercept = getIntercept(redTemp[redTemp.length-1].x,redTemp[redTemp.length-1].y,slope)
                        //get the intersection point
                        point = intersection(yy,slope,intercept);

                        redTemp.push({"x" : point , "y" : yy});
                        blackTemp.push({"x" : d.x , "y" : d.y});    
                        red.push(redTemp);                                       
                        redTemp = [];
                    }
                    else{
                        blackTemp.push({"x" : d.x , "y" : d.y});                         
                    }
                    reddd=0;
                    return "#00004f";

                                        
                }
            })
            .attr("cx", function (d) {
                return x(d.x);
            }).attr("cy", function (d) {
                return y(d.y)
            }).attr("r", 1)

            // Add the valueline path.
            svg.select("path.line")
            .attr("class", "line")
            .attr("d", valueline(scope.data)).style("stroke","black");

            //if all the points were red
            if(red.length == 0){
                svg.select(".g-contain").append("path").attr("class","line")
                .attr("d", valueline(redTemp)).style("stroke","red");           
            }
            else
            {                
                //if there black and red dots
                if(red.length > 0 && reddd == 1)
                {
                    red.push(redTemp);
                }                
                red.forEach(function(d){                 
                    svg.select(".g-contain").append("path").attr("class","line")
                    .attr("d", valueline(d)).style("stroke","red");      
                })               
            }

            // Add the X Axis
            svg.select("g.x.axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            // Add the Y Axis
            svg.select("g.y.axis")
                .call(yAxis);

            svg.select("g.y.axis").selectAll(".tick line").attr("x2", width);
            svg.select("g.x.axis").selectAll(".tick line").attr("y2", -1 * height);

            graphPresent = true;

        }
        $(window).resize(function () {
            $timeout(function () {
                scope.cycleDrawGraph();
                return;
            });
        });

        scope.$watch('editMode', function () {
            scope.cycleDrawGraph()
        });

        scope.$watch('graphData', function () {
            scope.cycleDrawGraph();
        });

        scope.$watch('parameter', function () {
            scope.getGraphData(scope.machineId,scope.parameter);
        });

    }

    return {
        restrict: "EA",
        templateUrl: template,
        scope: {
            editMode: '=',
            graph: "=",
            departmentId : "=",
            machineId : "=",
            parameter : "=",
            getGraphData : "=",
            graphData : "="
        },
        controller : controller,
        link, link
    };
}

angular.module('LeaderMESfe')
    .directive('cycleTimeGraphDirective', cycleTimeGraphDirective)