angular
    .module("LeaderMESfe")
    .factory("getInsightTitleParameters", function( $filter 
    ) {
      var insightSplit = ["[]", "[num]", "[insightArg]","[insightArg2]","[insightArg3]","[insightKPIs]","[XAxis]"];

      return function(temp, insight) {  
              
        if (temp) {
          var sentencesObjs = [];

          var sentences = temp.split("\n");
  
          if (sentences[sentences.length - 1] == "") {
            sentences.pop();
          }
          sentences.forEach(function(sentence) {
            insightSplit.forEach(function(split) {
              if (sentence.indexOf(split) > -1) {
                var obj = {
                  sentence: sentence.replace(split, ""),
                  dropBox: split,
                  type: ""
                };
                if (insight.MergePC) {
                  obj.type = "MergePC";
                }
                sentencesObjs.push(obj);
              }
            });
          });
          if (insight.XAxisChange) {
            sentencesObjs.push({
              sentence: $filter("translate")("X_AXIS"),
              dropBox: "[XAxisChange]",
              type: insight.XAxisChange
            });
          }
          return sentencesObjs;
        }
      };
     
    });
  
    
    
    
    
    
   