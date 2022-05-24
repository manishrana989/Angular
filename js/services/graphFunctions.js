angular.module('LeaderMESfe')
    .factory('graphFunctions', function(){
        //array looks like [[x1, y1], [x2, ...], ...]
        let calcAverage = function(array){
            let sum=0;
            for(let i=0; i<array.length; i++){
                sum+= array[i];
                }
            return sum/(array.length)
        }
        let sigma = function(array, avg){
            const reducer = (accumulator, currentValue) => accumulator + Math.pow(currentValue - avg, 2);
            return Math.sqrt(array.reduce(reducer)/array.length);
        }

        let getValidPoints = function(array, filtered, visible){
            if(array.length < 1){
                return [];
            }
            if(!filtered || !visible){
                return array;
            }
            //array without invalid null points
            let noNullPoints = array.filter(element => element[1] != null);

            //array with only the y values to calc avg
            let newArrayYVals = noNullPoints.map(element => element[1]);
            let avg = calcAverage(newArrayYVals)

            //calc sigma
            let sig = sigma(newArrayYVals, avg);

            //removing all points deviating over 3 times the standard deviation, while keeping all nulls
            let validPoints = array.filter(element => element[1] == null || !(Math.abs(element[1] - avg) >= 3*sig) );
            return validPoints;
        };

        return{
            getValidPoints: getValidPoints
        }
    });