angular.module('LeaderMESfe').directive('resizable', function($timeout,shiftService){
    

    function link(scope, elem, attrs){

        let resizable = elem[0];
        scope.containers = shiftService.containers;
        scope.graphIndex = _.findIndex(scope.containers.data,scope.graph);
        let resizingButton = document.createElement('div');
        resizingButton.className = 'resizer';
        resizingButton.addEventListener('mousedown', initDrag, false);
        resizable.appendChild(resizingButton);
        
        let startX, startY, startWidth, startHeight;

        function initDrag(e) {
            startX = e.clientX;
            startY = e.clientY;
            startWidth = parseInt(document.defaultView.getComputedStyle(resizable).width, 10);
            startHeight = parseInt(document.defaultView.getComputedStyle(resizable).height || 500, 10);
            document.documentElement.addEventListener('mousemove', doDrag, false);
            document.documentElement.addEventListener('mouseup', stopDrag, false);
            e.stopPropagation();
        }

        function doDrag(e) {
            let height = (startHeight + e.clientY - startY);
            if (height < 350){
                height = 350;
            }
            // resizable.style.height = height + 'px';
            const sameLines = _.filter(scope.containers.data,{options : {line : scope.graph.options.line}});
            sameLines.forEach(function(graph){
                if (graph && graph.options){
                    graph.options.maxHeight = height;
                    graph.options.height = height;
                }
            });
        }

        function stopDrag(e) {
            document.documentElement.removeEventListener('mousemove', doDrag, false);
            document.documentElement.removeEventListener('mouseup', stopDrag, false);
        }
    }

    return{
        restrict: 'A',
        scope: {
            graph : "=",
        },
        link: link,
    };
})