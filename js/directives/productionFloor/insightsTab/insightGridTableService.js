angular.module("LeaderMESfe").factory("insightGridTableService", function ($filter, uiGridGroupingConstants) {
  var machineTemplate = [
    {
      name: "Department",
      visible: false,
      groupingShowAggregationMenu: false,
    },
    {
      name: "MachineName",
      visible: true,
      groupingShowAggregationMenu: false,
      grouping: { groupPriority: 0 },
      sort: { priority: 1, direction: "asc" },
    },
    {
      name: "Index",
      visible: false,
      groupingShowAggregationMenu: false,
    },
    {
      name: "WorkerID",
      visible: false,
      groupingShowAggregationMenu: false,
    },
    {
      name: "WorkerName",
      visible: true,
      groupingShowAggregationMenu: false,
    },
    {
      name: "JoshID",
      visible: false,
      groupingShowAggregationMenu: false,
    },
    {
      name: "JobERP",
      visible: true,
      groupingShowAggregationMenu: false,
    },
    {
      name: "StartTime",
      visible: true,
      groupingShowAggregationMenu: false,
    },
    {
      name: "EndTime",
      visible: true,
      groupingShowAggregationMenu: false,
    },
    {
      name: "SetupDownTime",
      visible: true,
      groupingShowAggregationMenu: false
    },
    {
      name: "SetupProductionTime",
      visible: true,
      groupingShowAggregationMenu: false,
    },
    {
      name: "WeightOfRejects",
      visible: false,
      groupingShowAggregationMenu: false,
      treeAggregationType: uiGridGroupingConstants.aggregation.SUM,
      customTreeAggregationFinalizerFn: function (aggregation) {
        aggregation.rendered = $filter("translate")("TOTAL") + ": " + $filter("thousandsSeperator")(parseFloat(aggregation?.value?.toFixed(2)));
      },
    },
    {
      name: "WeightOfRejectsKG",
      visible: false,
      groupingShowAggregationMenu: false,
      treeAggregationType: uiGridGroupingConstants.aggregation.SUM,
      customTreeAggregationFinalizerFn: function (aggregation) {
        aggregation.rendered = $filter("translate")("TOTAL") + ": " + $filter("thousandsSeperator")(parseFloat(aggregation?.value?.toFixed(2)));
      },
    },
    {
      name: "UnitsProducedTheoretically",
      visible: true,
      groupingShowAggregationMenu: false,
      treeAggregationType: uiGridGroupingConstants.aggregation.SUM,
      customTreeAggregationFinalizerFn: function (aggregation) {        
          aggregation.rendered = $filter("translate")("TOTAL") + ": " + $filter("thousandsSeperator")(parseFloat(aggregation?.value?.toFixed(2))); 
      },
    },
    {
      name: "UnitsRatio",
      visible: true,
      groupingShowAggregationMenu: false,
    },
    {
      name: "InActiveTime",
      visible: true,
      groupingShowAggregationMenu: false,
    },
    {
      name: "QualityIndex",
      visible: true,
      groupingShowAggregationMenu: false,
    },
    {
      name: "Duration",
      visible: false,
      groupingShowAggregationMenu: false,
    },
    {
      name: "ProductName",
      visible: true,
      groupingShowAggregationMenu: false,         
    },
    {
      name: "CatalogID",
      visible: false,
      groupingShowAggregationMenu: false,
    },
    {
      name: "JobID",
      visible: false,
      groupingShowAggregationMenu: false,
    },
    {
      name: "MoldEName",
      visible: false,
      groupingShowAggregationMenu: false,
    },
    {
      name: "MoldLName",
      visible: false,
      groupingShowAggregationMenu: false,
    },
    {
      name: "ProductGroupName",
      visible: false,
      groupingShowAggregationMenu: false,
    },
    {
      name: "UnitsTarget",
      visible: true,
      groupingShowAggregationMenu: false,
      treeAggregationType: uiGridGroupingConstants.aggregation.SUM,
      customTreeAggregationFinalizerFn: function (aggregation) {        
          aggregation.rendered = $filter("translate")("TOTAL") + ": " + $filter("thousandsSeperator")(parseFloat(aggregation?.value?.toFixed(2))); 
      },
    },
    {
      name: "WeightTarget",
      visible: false,
      groupingShowAggregationMenu: false,
      treeAggregationType: uiGridGroupingConstants.aggregation.SUM,
      customTreeAggregationFinalizerFn: function (aggregation) {
        aggregation.rendered = $filter("translate")("TOTAL") + ": " + $filter("thousandsSeperator")(parseFloat(aggregation?.value?.toFixed(2)));
      },
    },
    {
      name: "UnitsProduced",
      visible: true,
      groupingShowAggregationMenu: false,
      treeAggregationType: uiGridGroupingConstants.aggregation.SUM,
      customTreeAggregationFinalizerFn: function (aggregation) {
        aggregation.rendered = $filter("translate")("TOTAL") + ": " + $filter("thousandsSeperator")(parseFloat(aggregation?.value?.toFixed(2)));
      },
    },
    {
      name: "UnitsProducedLeft",
      visible: false,
      groupingShowAggregationMenu: false,
      treeAggregationType: uiGridGroupingConstants.aggregation.SUM,
      customTreeAggregationFinalizerFn: function (aggregation) {
        aggregation.rendered = $filter("translate")("TOTAL") + ": " + $filter("thousandsSeperator")(parseFloat(aggregation?.value?.toFixed(2)));
      },
    },
    {
      name: "UnitsProducedOK",
      visible: false,
      groupingShowAggregationMenu: false,
      treeAggregationType: uiGridGroupingConstants.aggregation.SUM,
      customTreeAggregationFinalizerFn: function (aggregation) {
        aggregation.rendered = $filter("translate")("TOTAL") + ": " + $filter("thousandsSeperator")(parseFloat(aggregation?.value?.toFixed(2)));
      },
    },
    {
      name: "UnitWeight",
      visible: false,
      groupingShowAggregationMenu: false,
    },
    {
      name: "UnReportedRejects",
      visible: false,
      groupingShowAggregationMenu: false,
      treeAggregationType: uiGridGroupingConstants.aggregation.SUM,
      customTreeAggregationFinalizerFn: function (aggregation) {
        aggregation.rendered = $filter("translate")("TOTAL") + ": " + $filter("thousandsSeperator")(parseFloat(aggregation?.value?.toFixed(2)));
      },
    },
    {
      name: "RejectsTotal",
      visible: false,
      groupingShowAggregationMenu: false,
      treeAggregationType: uiGridGroupingConstants.aggregation.SUM,
      customTreeAggregationFinalizerFn: function (aggregation) {
         aggregation.rendered =  $filter("translate")("TOTAL") + ": " + $filter("thousandsSeperator")(parseFloat((aggregation.value).toFixed(2)));
      },
    },
    {
      name: "CycleTimeStandard",
      visible: false,
      groupingShowAggregationMenu: false,
    },
    {
      name: "CycleTimeAvg",
      visible: false,
      groupingShowAggregationMenu: false,
      customTreeAggregationFn: function (aggregation, fieldValue, numValue, row) { 
        if (!aggregation.value) {
          if (!aggregation.durationTotal) {
            aggregation.durationTotal = 0;
          }
          if (!aggregation.weightedAvg) {
            aggregation.weightedAvg = 0;
          }
          aggregation.durationTotal += row.entity.Duration;
          aggregation.weightedAvg += row.entity.Duration * numValue;
        }
      },
      customTreeAggregationFinalizerFn: function (aggregation) {
            aggregation.rendered = aggregation.durationTotal ? parseFloat((aggregation.weightedAvg / aggregation.durationTotal).toFixed(2)) : 0;
      },
    },
    {
      name: "Units/Hour std",
      visible: false,
      groupingShowAggregationMenu: false,
    },
    {
      name: "Units/Hour avg",
      visible: false,
      groupingShowAggregationMenu: false,
      customTreeAggregationFn: function (aggregation, fieldValue, numValue, row) {
        if (!aggregation.value) {
          if (!aggregation.durationTotal) {
            aggregation.durationTotal = 0;
          }
          if (!aggregation.weightedAvg) {
            aggregation.weightedAvg = 0;
          }
          aggregation.durationTotal += row.entity.Duration;
          aggregation.weightedAvg += row.entity.Duration * numValue;
        }
      },
      customTreeAggregationFinalizerFn: function (aggregation) {
        aggregation.rendered = aggregation.durationTotal ? parseFloat((aggregation.weightedAvg / aggregation.durationTotal).toFixed(2)) : 0 ;
      },
    },
    {
      name: "Units/Min std",
      visible: false,
      groupingShowAggregationMenu: false,
    },
    {
      name: "Units/Min avg",
      visible: false,
      groupingShowAggregationMenu: false,
      customTreeAggregationFn: function (aggregation, fieldValue, numValue, row) {
        if (!aggregation.value) {
          if (!aggregation.durationTotal) {
            aggregation.durationTotal = 0;
          }
          if (!aggregation.weightedAvg) {
            aggregation.weightedAvg = 0;
          }
          aggregation.durationTotal += row.entity.Duration;
          aggregation.weightedAvg += row.entity.Duration * numValue;
        }
      },
      customTreeAggregationFinalizerFn: function (aggregation) {
        aggregation.rendered = aggregation.durationTotal ? parseFloat((aggregation.weightedAvg / aggregation.durationTotal).toFixed(2)) : 0 ;
      },
    },
    {
      name: "TotalWeight",
      visible: false,
      groupingShowAggregationMenu: false,
      treeAggregationType: uiGridGroupingConstants.aggregation.SUM,
      customTreeAggregationFinalizerFn: function (aggregation) {
        aggregation.rendered = $filter("translate")("TOTAL") + ": " + $filter("thousandsSeperator")(parseFloat(aggregation?.value?.toFixed(2)));
      },
    },
    {
      name: "Kg/Hour",
      visible: false,
      groupingShowAggregationMenu: false,
    },
    {
      name: "Efficiency",
      visible: true,
      groupingShowAggregationMenu: false,
      customTreeAggregationFn: function (aggregation, fieldValue, numValue, row) { 
        if (!aggregation.value) {
          if (!aggregation.durationTotal) {
            aggregation.durationTotal = 0;
          }
          if (!aggregation.weightedAvg) {
            aggregation.weightedAvg = 0;
          }
          aggregation.durationTotal += row.entity.Duration;
          aggregation.weightedAvg += row.entity.Duration * numValue;
        }
      },
      customTreeAggregationFinalizerFn: function (aggregation) {
        aggregation.rendered = aggregation.durationTotal ? parseFloat((aggregation.weightedAvg / aggregation.durationTotal).toFixed(2)):0;
      },
    },
    {
      name: "AvailabilityPE",
      visible: false,
      groupingShowAggregationMenu: false,
    },
    {
      name: "AvailabilityOEE",
      visible: false,
      groupingShowAggregationMenu: false,
    },
    {
      name: "ActiveTime",
      visible: false,
      groupingShowAggregationMenu: false,
    },
    {
      name: "ProductionTime",
      visible: false,
      groupingShowAggregationMenu: false,
    },
    {
      name: "Downtime",
      visible: false,
      groupingShowAggregationMenu: false,
    },
    {
      name: "Setup",
      visible: false,
      groupingShowAggregationMenu: false,
    },
    {
      name: "CycleTimeCost",
      visible: false,
      groupingShowAggregationMenu: false,
      customTreeAggregationFn: function (aggregation, fieldValue, numValue, row) {
        if (!aggregation.value) {
          if (!aggregation.durationTotal) {
            aggregation.durationTotal = 0;
          }
          if (!aggregation.weightedAvg) {
            aggregation.weightedAvg = 0;
          }
          aggregation.durationTotal += row.entity.Duration;
          aggregation.weightedAvg += row.entity.Duration * numValue;
        }
      },
      customTreeAggregationFinalizerFn: function (aggregation) {
        aggregation.rendered = parseFloat((aggregation.weightedAvg / aggregation.durationTotal).toFixed(2));
      },
    },
    {
      name: "CycleTimeCostSec",
      visible: false,
      groupingShowAggregationMenu: false,
    },
    {
      name: "Unit/Min Cost",
      visible: false,
      groupingShowAggregationMenu: false,
    },
    {
      name: "Unit/Hour Cost",
      visible: false,
      groupingShowAggregationMenu: false,
    },
    {
      name: "ShiftID",
      visible: false,
      groupingShowAggregationMenu: false,
    },
    {
      name: "ShiftName",
      visible: false,
      groupingShowAggregationMenu: false,
    },
    {
      name: "UnitsReportedOK",
      visible: false,
      groupingShowAggregationMenu: false,
      treeAggregationType: uiGridGroupingConstants.aggregation.SUM,
      customTreeAggregationFinalizerFn: function (aggregation) {
         aggregation.rendered =  $filter("translate")("TOTAL") + ": " + $filter("thousandsSeperator")(parseFloat((aggregation.value).toFixed(2)));
      },
    },
    {
      name: "PE",
      visible: true,
      groupingShowAggregationMenu: false,
      customTreeAggregationFn: function (aggregation, fieldValue, numValue, row) {
        if (!aggregation.value) {
          if (!aggregation.durationTotal) {
            aggregation.durationTotal = 0;
          }
          if (!aggregation.weightedAvg) {
            aggregation.weightedAvg = 0;
          }
          aggregation.durationTotal += row.entity.Duration;
          aggregation.weightedAvg += row.entity.Duration * numValue;
        }
      },
      customTreeAggregationFinalizerFn: function (aggregation) {
        aggregation.rendered = parseFloat((aggregation.weightedAvg / aggregation.durationTotal).toFixed(2));
      },
    },
    {
      name: "OEE",
      visible: true,
      groupingShowAggregationMenu: false,
      customTreeAggregationFn: function (aggregation, fieldValue, numValue, row) {
        if (!aggregation.value) {
          if (!aggregation.durationTotal) {
            aggregation.durationTotal = 0;
          }
          if (!aggregation.weightedAvg) {
            aggregation.weightedAvg = 0;
          }
          aggregation.durationTotal += row.entity.Duration;
          aggregation.weightedAvg += row.entity.Duration * numValue;
        }
      },
      customTreeAggregationFinalizerFn: function (aggregation) {
        aggregation.rendered = parseFloat((aggregation.weightedAvg / aggregation.durationTotal).toFixed(2));
      },
    },
  ];



  var GetWaterfallOEETemplate = [
    {
      name: "",
      visible: true,
      groupingShowAggregationMenu: false,
    },
    {
      name: "PE",
      visible: true,
      groupingShowAggregationMenu: false,
    },
    {
      name: "QualityTimeLost",
      visible: true,
      groupingShowAggregationMenu: false,
    },
    {
      name: "CavitiesEfficiencyLostPC",
      visible: true,
      groupingShowAggregationMenu: false,
    },
    {
      name: "RateTimeLost",
      visible: true,
      groupingShowAggregationMenu: false,
    },
    {
      name: "NoCommunication",
      visible: true,
      groupingShowAggregationMenu: false,
    },
    {
      name: "Unreported",
      visible: true,
      groupingShowAggregationMenu: false,
    },
    {
      name: "Setup",
      visible: true,
      groupingShowAggregationMenu: false,
    },
    {
      name: "Idle",
      visible: true,
      groupingShowAggregationMenu: false,
    },
    {
      name: "NonWorkingShiftTime",
      visible: true,
      groupingShowAggregationMenu: false,
    },
  ];

  return {
    machineTemplate: machineTemplate,
    GetWaterfallOEETemplate:GetWaterfallOEETemplate
  };
});
