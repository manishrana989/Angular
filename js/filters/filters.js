angular
  .module("LeaderMESfe")
  .filter("getComboText", function () {
    return function (comboData, localLanguage) {
      if (comboData) {
        var found = _.find(comboData.comboValues, {
          ComboValueField: parseInt(comboData.value),
        });
        if (found) {
          return found;
        }
      }
    };
  })
  .filter("getSubComboText", function () {
    return function (comboData, parentCombo) {
      if (parentCombo.value && parentCombo.value != "" && comboData.comboValues[parentCombo.value]) {
        var found = _.find(comboData.comboValues[parentCombo.value][0].ChildcomboValues, { ComboValueField: parseInt(comboData.value) });
        if (found) {
          return found;
        }
      }
    };
  })
  .filter("checkMachineDisplay", function (shiftService) {
    var shiftData = shiftService.shiftData;
    return function (machineId) {
      return shiftData.machinesDisplay[machineId];
    };
  })
  .filter("customTranslate", function () {
    return function (input, ename, lname, local) {
      if (!input) {
        return "";
      }
      if (local == true) return input[lname];
      return input[ename];
    };
  })
  .filter("getHtmlCode", function ($sce) {
    return function (input) {
      return $sce.trustAsHtml(input);
    };
  })

  .filter("reversePrintTable", function () {
    return function (items) {
      if (items) {
        return items.slice().reverse();
      }
      return items;
    };
  })
  .filter("reversePrintTableAttributes", function () {
    return function (items) {
      var arr = [];
      var newItems = [];
      var arr = _.map(items, function (item, index) {
        return {
          key: index,
          value: item,
        };
      });
      for (var i = arr.length - 1; i >= 0; i--) {
        newItems.push(arr[i].value);
      }
      return newItems;
    };
  })
  .filter("customDateNumberFilter", function ($filter) {
    return function (value, type) {
      if (type == 4) {
        return $filter("number")(value);
      }
      return $filter("date")(value);
    };
  })
  .filter("getOperatorsByType", function ($filter) {
    return function (operators, type) {
      if (!type) {
        return operators;
      }
      var tempOper = [];
      operators.forEach(function (op) {
        if (op.excludeFor.indexOf(type) < 0) {
          tempOper.push(op);
        }
      });
      return tempOper;
    };
  })
  .filter("getDurationInHours", function ($filter) {
    return function (value) {
      if (!value) {
        return;
      }
      var temp = value / 60;
      return $filter("number")(temp, 2) + $filter("translate")("HOURS_SHORT");
    };
  })
  .filter("getDurationInHoursMinutes", function ($filter) {
    return function (value) { 
     
      if (value === 0) {
        return "";
      }
       else if (!value) {
        return;
      }
     
      var hours = Math.trunc(value / 60);
      hours = hours > 9 ? hours : "0" + hours;
      var minutes = value % 60;
      minutes = Math.trunc(minutes);
      minutes = minutes > 9 ? minutes : "0" + minutes;
      return hours + ":" + minutes;
    };
  })
  .filter("getDurationInHrMin", function ($filter) {
    return function (value) {
      if (!value) {
        return value == 0 ? 0 : "";
      }
      var hours = Math.trunc(value / 60);
      // hours = hours;
      var minutes = value % 60;
      minutes = Math.trunc(minutes);
      // minutes = minutes;
      if (hours && minutes) {
        return hours + $filter("translate")("HOURS_SHORT") + " " + minutes + $filter("translate")("MINUTES_SHORT2");
      } else if (hours) {
        return hours + $filter("translate")("HOURS_SHORT");
      } else if (minutes) {
        return minutes + $filter("translate")("MINUTES_SHORT2");
      }
    };
  })
  .filter("getDurationInHoursMinutesShort", function ($filter) {
    return function (value) {
      if (!value) {
        return;
      }
      var hours = Math.trunc(value / 60);
      hours = hours > 9 ? hours : "0" + hours;
      var minutes = value % 60;
      minutes = Math.trunc(minutes);
      minutes = minutes > 9 ? minutes : "0" + minutes;
      return hours + ":" + minutes;
    };
  })
  .filter("convertToTranslatePlaceholder", function () {
    return function (value) {
      if (value) {
        return value.replace(/ | /g, "_").toUpperCase();
      }
      return null;
    };
  })
  .filter("convertToTranslate", function ($filter) {
    return function (value) {
      if (value && typeof value === "string") {
        return $filter("translate")(value.replace(/ | /g, "_").toUpperCase());
      }
      return value;
    };
  })
  .filter("machineIdToIcon", function () {
    return function (id) {
      if (id != undefined) {
        var icon = "";
        switch (id) {
          case 0:
            icon = "no_job.svg";
            break;
          case 1:
            icon = "working.svg";
            break;
          case 2:
            icon = "param_deviation.svg";
            break;
          case 3:
            icon = "stopped.svg";
            break;
          case 4:
            icon = "comm_faillure.svg";
            break;
          case 5:
            icon = "setup_working.svg";
            break;
          case 6:
            icon = "setup_stopped.svg";
            break;
          case 7:
            icon = "comm_faillure.svg";
            break;
          case 8:
            icon = "stop_idle.svg";
            break;
          case 9:
            icon = "no-job-copy.svg";
            break;
        }
        return icon;
      }
      return null;
    };
  })
  .filter("displayHoursMinutes", function ($filter) {
    return function (value) {
      if (!value) {
        return;
      }
      var remainder = value % 1;
      var remainderTime = new Date(remainder * 3600 * 1000);
      var newValue = Math.floor(value);
      if (newValue < 10) {
        newValue = "0" + newValue;
      }
      return newValue + ":" + ("0" + remainderTime.getMinutes()).slice(-2);
    };
  })
  .filter("dateToHour", function () {
    return function (dateString) {
      if (dateString) {
        return dateString.slice(-8, -3) + " hr";
      }
      return "";
    };
  })
  .filter("displayHoursMinutesFooter", function ($filter) {
    return function (value) {
      if (!value) {
        return;
      }
      value = value / 60;
      var remainder = value % 1;
      var remainderTime = new Date(remainder * 3600 * 1000);
      var newValue = Math.floor(value);
      if (newValue < 10) {
        newValue = "0" + newValue;
      }
      return newValue + ":" + ("0" + remainderTime.getMinutes()).slice(-2);
    };
  })
  .filter("svgTextWrap", function () {
    return function (value, length) {
      if (!value) {
        return;
      }
      if (!length) {
        return value;
      }
      var textLength = value.length;
      if (textLength > length && value.length > 0) {
        value = value.slice(0, -(textLength - length));
        value = value + "...";
      }
      return value;
    };
  })
  .filter("formatDateExport",function() {       
    return function (date) {
      if(typeof date == 'object')
      {
        return date.format("DD/MM/YYYY HH:mm:ss")
      }
      return date
    };
  })
  .filter("addNewline", function () {       
    return function (text) {
     return text.replace(" ", "<br />")
    };
  })
  .filter("toK", function () {
    return function (num) {
      var suffex;
      if ((num / 1000).toFixed(1).indexOf(".0") > -1) {
        suffex = (num / 1000).toFixed(0);
      } else {
        suffex = (num / 1000).toFixed(1);
      }
      return num > 999 ? suffex + "k" : num ? num.toFixed(0) : num;
    };
  })
  .filter("toKCelingFixed", function () {       
    return function (num) {
      var suffex;
      if ((num / 1000).toFixed(1).indexOf(".0") > -1) {
        suffex = (num / 1000).toFixed(0);
      } else {
        suffex = (num / 1000).toFixed(1);
      }
        return num > 999 ? suffex + "k" : num && num < 100 && num > -100 ? parseFloat(num.toFixed(2)) : num && typeof value != "string" ? Math.ceil(num) : num
    };
  })
  .filter("toFixedLessThanHundered", function () {       
    return function (num) {
      if(num)
      {
        if(num < 100 && num > -100){
          return num.toFixed(2)
        }
        else
        {
          return parseInt(num)
        }
      }
      return num
    };
  })
  .filter("removeSpaces", function () {
    return function (text) {
      if (text) {
        return text.replace(/ /g, "");
      }
      return "";
    };
  })
  .filter("minutesToHHMM", function ($filter) {
    return function (input) {
      if (!input) {
        input = 0;
      }

      /**
       * Will convert 's' to any 'fm' according to 'fm' array input
       * @param {} s - input to convert in SECONDS
       * @param {*} fm - formatted date. can be DD:HH or HH:MM or Minutes
       */
      function sformatHrMin(fm) {
        return fm[0].toFixed(0) + $filter("translate")("HOURS_SHORT") + " " + fm[1].toFixed(0) + $filter("translate")("MINUTES_SHORT");
      }

      function sformatDayHr(fm) {
        return fm[0].toFixed(0) + $filter("translate")("DAYS_SHORT") + " " + fm[1].toFixed(0) + $filter("translate")("HOURS_SHORT");
      }

      function sformatDayMin(fm) {
        return fm[0].toFixed(0) + $filter("translate")("DAYS_SHORT") + " " + fm[1].toFixed(0) + $filter("translate")("MINUTES_SHORT");
      }

      //fix for negative input which is not supposed to happen anyway!
      if (input < 0) {
        input = input * -1;
      }

      //if time is less than one hour
      if (input < 60) {
        return parseFloat(input.toFixed(2)) + $filter("translate")("MINUTES_SHORT");
      }

      //if time is less than one DAY
      if (input < 1440) {
        var format = sformatHrMin([
          Math.floor(input / 60) % 24, // HOURS
          Math.floor(input) % 60, // MINUTES
        ]);
        return format;
      }

      // if time is greater than one DAY
      if (input >= 1440) {
        var format =
          Math.floor(input / 60) % 24 == 0
            ? sformatDayMin([
                Math.floor(input / 60 / 24), // DAYS
                Math.floor(input) % 60, // MINUTES
              ])
            : sformatDayHr([
                Math.floor(input / 60 / 24), // DAYS
                Math.floor(input / 60) % 24, // HOURS
              ]);

        return format;
      }
    };
  })
  .filter("minutesToHRMIN", function ($filter) {
    return function (input) {
      if (!input) {
        input = 0;
      }

      /**
       * Will convert 's' to any 'fm' according to 'fm' array input
       * @param {} s - input to convert in SECONDS
       * @param {*} fm - formatted date. can be DD:HH or HH:MM or Minutes
       */
      function sformatHrMin(fm) {
        return fm[0].toFixed(0) + ":" + fm[1].toFixed(0) ;
      }

      function sformatDayHr(fm) {
        return fm[0].toFixed(0) + ":" + fm[1].toFixed(0) ;
      }

      function sformatDayMin(fm) {
        return fm[0].toFixed(0) + ":" + fm[1].toFixed(0) ;
      }

      //fix for negative input which is not supposed to happen anyway!
      if (input < 0) {
        input = input * -1;
      }

      //if time is less than one hour
      if (input < 60) {
        return parseFloat(input.toFixed(2));
      }

      //if time is less than one DAY
      if (input < 1440) {
        var format = sformatHrMin([
          Math.floor(input / 60) % 24, // HOURS
          Math.floor(input) % 60, // MINUTES
        ]);
        return format;
      }

      // if time is greater than one DAY
      if (input >= 1440) {
        var format =
          Math.floor(input / 60) % 24 == 0
            ? sformatDayMin([
                Math.floor(input / 60 / 24), // DAYS
                Math.floor(input) % 60, // MINUTES
              ])
            : sformatDayHr([
                Math.floor(input / 60 / 24), // DAYS
                Math.floor(input / 60) % 24, // HOURS
              ]);

        return format;
      }
    };
  })
  .filter("secondsToHHMMSS", function ($filter) {
    return function (input) {
      if (!input) {
        input = 0;
      }
      /**
       * Will convert 's' to any 'fm' according to 'fm' array input
       * @param {} s - input to convert in SECONDS
       * @param {*} fm - formatted date. can be DD:HH or HH:MM or Minutes
       */

      function sformatHrMin(fm) {
        return fm[0].toFixed(0) + $filter("translate")("HOURS_SHORT") + " " + fm[1].toFixed(0) + $filter("translate")("MINUTES_SHORT");
      }

      function sformatMinSec(fm) {
        if (+fm[1].toFixed(0)) {
          return fm[0].toFixed(0) + $filter("translate")("MINUTES_SHORT") + " " + fm[1].toFixed(0) + $filter("translate")("SECONDS_SHORT");
        } else {
          return fm[0].toFixed(0) + $filter("translate")("MINUTES_SHORT");
        }
      }
      //fix for negative input which is not supposed to happen anyway!
      if (input < 0) {
        input = input * -1;
      }
      //if the time less than 60 sec
      if (input < 60) {
        return input + $filter("translate")("SECONDS_SHORT");
      }

      //if the time more than 1 minute and under 1 hour
      if (input > 59 && input < 3600) {
        var format = sformatMinSec([
          Math.floor(input / 60), // MINUTES
          Math.floor(input) % 60, // SECONDS
        ]);
        return format;
      }

      //if the time more than 1 hour
      if (input > 3600) {
        var format = sformatHrMin([
          Math.floor(input / 3600), // HOURS
          Math.floor(input % 60), // MINUTES
        ]);
        return format;
      }

      return format;
    };
  })
  .filter("minutesToHH", function ($filter) {
    return function (input) {
      if (!input) {
        input = 0;
      }
      /**
       * Will convert 's' to any 'fm' according to 'fm' array input
       * @param {} s - input to convert in SECONDS
       * @param {*} fm - formatted date. can be DD:HH or HH:MM or Minutes
       */
      function sformatHr(fm) {
        return fm[0] + $filter("translate")("HOURS_SHORT");
      }

      //fix for negative input which is not supposed to happen anyway!
      if (input < 0) {
        input = input * -1;
      }

      //if time is less than one hour

      var format = sformatHr([Math.floor(input / 60)]);
      return format;
    };
  })
  .filter("minutesToHM", function ($filter) {
    return function (input) {
      if (input < 0) {
        return "";
      }
      if (!input) {
        input = 0;
      }
      /**
       * Will convert 's' to any 'fm' according to 'fm' array input
       * @param {} s - input to convert in SECONDS
       * @param {*} fm - formatted date. can be DD:HH or HH:MM or Minutes
       */
      function sformatHrMin(fm) {
        return $filter("translate")("FORMAT_HR_MIN", {
          num1: fm[0],
          num2: fm[1],
          type1: $filter("translate")("HOURS_SHORT2"),
          type2: $filter("translate")("MINUTES_SHORT2"),
        });
      }

      function sformatDayHr(fm) {
        return $filter("translate")("FORMAT_HR_MIN", {
          num1: fm[0],
          num2: fm[1],
          type1: $filter("translate")("DAYS_SHORT"),
          type2: $filter("translate")("HOURS_SHORT2"),
        });
      }

      function sformatDayMin(fm) {
        return $filter("translate")("FORMAT_HR_MIN", {
          num1: fm[0],
          num2: fm[1],
          type1: $filter("translate")("DAYS_SHORT"),
          type2: $filter("translate")("MINUTES_SHORT2"),
        });
      }

      //fix for negative input which is not supposed to happen anyway!
      if (input < 0) {
        input = input * -1;
      }

      //if time is less than one hour
      if (input < 60) {
        return input + $filter("translate")("MINUTES_SHORT2");
      }

      //if time is less than one DAY
      if (input < 1440) {
        var format = sformatHrMin([
          Math.floor(input / 60) % 24, // HOURS
          Math.floor(input) % 60, // MINUTES
        ]);
        return format;
      }

      // if time is greater than one DAY
      if (input >= 1440) {
        var format =
          Math.floor(input / 60) % 24 == 0
            ? sformatDayMin([
                Math.floor(input / 60 / 24), // DAYS
                Math.floor(input) % 60, // MINUTES
              ])
            : sformatDayHr([
                Math.floor(input / 60 / 24), // DAYS
                Math.floor(input / 60) % 24, // HOURS
              ]);

        return format;
      }
    };
  })
  .filter("maxFilter", function ($filter) {
    return function (input, max) {
      if (input > max) {
        return max;
      }
      return input;
    };
  })
  .filter("thousandsSeperator", function ($filter) {
    return function (input) {
      if (input > 999) {
        return input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      } else {
        return input;
      }
    };
  })
  .filter('trustHtml',function($sce){
    return function(html){
      return $sce.trustAsHtml(html)
    }
  })
  .filter("getIconByMachineStatusId", function ($filter) {
    return function (MachineStatusID) {
      switch (MachineStatusID) {
        case 1:
          return "working.png";
        case 2:
          return "param_deviation.png";
        case 3:
          return "stopped.png";
        case 4:
          return "comm_faillure.png";
        case 5:
          return "setup_working.png";
        case 6:
          return "setup_working.png";
        case 7:
          return "comm_faillure.png";
        case 8:
          return "stop_idle.png";
        case 9:
          return "no-job-copy.png";
        case 0:
          return "no-job@2x.png";
      }
      return "no_job.png";
    };
  })
  .filter("getFieldByName", function ($filter) {
    return function (machineParams, FieldName, FieldValue) {
      if (machineParams) {
        var tmp = {};
        tmp[FieldName] = FieldValue;
        var param = _.find(machineParams, tmp);
        return param;
      } else {
        return null;
      }
    };
  })
  .filter("roundup", function () {
    return function (value) {
      if (typeof value == "string") {
        return value;
      }
      return Math.ceil(value);
    };
  })
  .filter("hideTargets", function () {
    return function (targets, showPencils) {
      return _.filter(targets, function (target) {
        if ((target.IsActive && !showPencils.value) || showPencils.value) {
          return true;
        }
        return false;
      });
    };
  })
  .filter("replaceAll", function () {
    return function (string, from, to) {
      if (string) {
        return string.replace(new RegExp(from, "g"), to);
      }
      return "";
    };
  })
  .filter("onlineSortMachine", function () {
    return function (machines, field, ascending) {
      if (field) {
        // if (field == 'MachineStatusID') {
        // var ordering = {};
        // var sortOrder = [1, 5, 2, 3, 6, 8, 0, 4];

        // for (var i = 0; i < sortOrder.length; i++)
        //     ordering[sortOrder[i]] = i;

        // machines.sort(function (a, b) {
        //     return (ordering[a.MachineStatusID] - ordering[b.MachineStatusID]);
        // });

        // if (!ascending) {
        //     machines.reverse();
        // }
        // return machines;

        // } else {
        var sortedMachines = _.sortBy(machines, field);
        if (!ascending) {
          sortedMachines.reverse();
        }
        return sortedMachines;
        // }
      }
      return machines;
    };
  })
  .filter("getDiffDates", function () {
    return function (endDate, startDate) {
      if (startDate) {
        return ((new Date(endDate).getTime() - new Date(startDate).getTime()) / 1000 / 60).toFixed(0);
      }
      return 0;
    };
  })
  .filter("getTechnicianIcon", function () {
    return function (responseType) {
      switch (responseType) {
        case 0:
          //sent
          return "images/onlineIcons/technician-sent.svg";
        case 1:
          //recieved
          return "images/onlineIcons/technician-received.svg";

        //declined
        case 2:
          return "images/onlineIcons/technician-decline-grey.png";
        //in progress
        case 4:
          return "images/startServiceGGS.png";
        //completed
        case 5:
          return "images/onlineIcons/technician-done-grey.png";
        // canceled
        case 6:
          return "images/onlineIcons/technician-cancel-grey.png";
      }
    };
  })
  .filter("sortString", function () {
    return function (input) {
      if (input) return input.sort();
    };
  })
  .filter("langTranslate", function () {
    return function (input, dict) {
      if (!input || !dict || !dict[0]) return input;

      let found = _.find(dict[0], { langshortname: input });
      return found ? found.langfullname : input;
    };
  })
  /**
   *  a generic filter which will receive a dataset and search in it, for an object
   *  which has a property named @id with the value @key.
   *
   *  If such an object is found, then return its value which is named @val
   *  @param key: the property value
   *  @param id: the property name we are interested in
   *  @param dataset: the dataset to search in
   *  @param val: the value name of the found object we are interested in
   */
  .filter("getValByKey", function () {
    return function (key, dataset, id, val) {
      let searchObj = {};
      searchObj[id] = key;

      const foundObj = _.find(dataset, searchObj);

      if (!foundObj) {
        return;
      }

      return foundObj[val];
    };
  })
  .filter("getAvailableFields", function () {
    return function (fieldset, list1, list2) {
      var newFieldSet = [];
      fieldset.forEach(function (field) {
        if (_.findIndex(list1 || [], { FieldName: field.FieldName }) < 0 && _.findIndex(list2 || [], { FieldName: field.FieldName }) < 0) {
          newFieldSet.push(field);
        }
      });
      return newFieldSet;
    };
  })
  .filter("jobObjectDisplay", () => {
    return (job) => {
      if (job.ERPJobID) return job["ID"] + "(" + job["ERPJobID"] + ")";
      else return job["ID"] + "(-)";
    };
  })
  .filter("fileNameDisplay", () => {
    return (fileKey) => {
      return fileKey.substr(fileKey.indexOf("/") + 1, fileKey.length);
    };
  })
  .filter("getPeriodNameByValue", () => {
    return (value, options) => {
      var option = _.find(options, { viewType: value });
      return (option && option.label) || "";
    };
  })
  .filter("getUserDateFormat", () => {
    return (date,userDateFormat) => {
      return moment(date).format(userDateFormat);
    };
  })
    .filter("twoLettersName", () => {
      return (name) => {
        if(!name){
          return '';
        }
        let splittedName=name.split(' ');
        if(splittedName.length>1){
          return (splittedName[0].substring(0,1) + splittedName[1].substring(0,1)).toUpperCase()
        }
        return (splittedName[0].substring(0,2)).toUpperCase();
      };
    }).filter("notificationsSubTopic", () => {
  return (notification) => {
    let parameterDeviation=notification.TextKeysValues.split(';')[1];
    if(!notification.TopicKey || !parameterDeviation){
      return false;
    }
    return $scope.data.notificationsSettingsOBJ[notification.TopicKey][parameterDeviation].isActive==true;
  };
});
