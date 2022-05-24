angular.module("LeaderMESfe").factory("graphFunctionsInsights", function() {
  let calcAverage = function(array) {
    let sum = 0;
    for (let i = 0; i < array.length; i++) {
      sum += array[i];
    }
    return sum / array.length;
  };
  let sigma = function(array, avg) {
    const reducer = (accumulator, currentValue) => accumulator + Math.pow(currentValue - avg, 2);
    return Math.sqrt(array.reduce(reducer) / array.length);
  };

  let getValidPoints = function(array, filtered, visible, param, objName) {
    let validPoints;
    if (array && Array.isArray(array)) {
      for (var i = 0; i < array.length; i++) {
        if (array[i].length < 1) {
          return [];
        }
        if (!filtered || !visible) {
          return array;
        }
        //array without invalid null points
        let noNullPoints = array[i].filter(element => {
          if (element[param]) {
            return element;
          }
        });

        //array with only the y values to calc avg
        let newArrayYVals = noNullPoints.map(element => element[param]);
        let avg = calcAverage(newArrayYVals);

        //calc sigma
        let sig = sigma(newArrayYVals, avg);

        //removing all points deviating over 3 times the standard deviation, while keeping all nulls
        validPoints = array[i].filter(element => element[param] == null || !(Math.abs(element[param] - avg) >= 3 * sig));
        array[i] = validPoints;
      }
      return array;
    } else if (array) {
      // dataInfo.dataParts.forEach(function(temp) {
      //    if (array[temp].length < 1) {
      //     return [];
      //   }
      //   if (!filtered || !visible) {
      //     return array;
      //   }
      //   //array without invalid null points
      //   let noNullPoints = array[i].filter(element => {
      //     if (element[param]) {
      //       return element;
      //     }
      //   });
      //   //array with only the y values to calc avg
      //   let newArrayYVals = noNullPoints.map(element => element[param]);
      //   let avg = calcAverage(newArrayYVals);
      //   //calc sigma
      //   let sig = sigma(newArrayYVals, avg);
      //   //removing all points deviating over 3 times the standard deviation, while keeping all nulls
      //   validPoints = array[i].filter(element => element[param] == null || !(Math.abs(element[param] - avg) >= 3 * sig));
      //   array[i] = validPoints;
      // }


      
      // for (var i = 0; i < array.length; i++) {
      //   if (array[i].length < 1) {
      //     return [];
      //   }
      //   if (!filtered || !visible) {
      //     return array;
      //   }
      //   //array without invalid null points
      //   let noNullPoints = array[i].filter(element => {
      //     if (element[param]) {
      //       return element;
      //     }
      //   });
      //   //array with only the y values to calc avg
      //   let newArrayYVals = noNullPoints.map(element => element[param]);
      //   let avg = calcAverage(newArrayYVals);
      //   //calc sigma
      //   let sig = sigma(newArrayYVals, avg);
      //   //removing all points deviating over 3 times the standard deviation, while keeping all nulls
      //   validPoints = array[i].filter(element => element[param] == null || !(Math.abs(element[param] - avg) >= 3 * sig));
      //   array[i] = validPoints;
      // }
      // return array;
    }
    return [null, null];
  };

  return {
    getValidPoints: getValidPoints
  };
});
