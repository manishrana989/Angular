
/**
 * Created by Joe on 12/28/15.
 */


var paddingZerosToDate = function (value) {
  if (value < 10) return "0" + value;
  return value;
};

function convertDate(date) {
  return [paddingZerosToDate(date.getFullYear()), paddingZerosToDate(date.getMonth() + 1), paddingZerosToDate(date.getDate())].join("-") + " " + [paddingZerosToDate(date.getHours()), paddingZerosToDate(date.getMinutes()), paddingZerosToDate(date.getSeconds())].join(":");
}

angular.module("LeaderMESfe").service("Session", function () {
  this.create = function (userAuthenticated) {
    this.userAuthenticated = userAuthenticated;
  };
  this.destroy = function () {
    this.userAuthenticated = null;
  };
});

angular
  .module("LeaderMESfe")
  .factory("LeaderMESservice", function ($rootScope, $q, Restangular, $sessionStorage, $translate, $localStorage, $http, GLOBAL) {
    var actions = [
      {
        AppPartID: 10675,
        API: "OptimizeApproval",
        type: "notification",
      },
      {
        AppPartID: 10640,
        linkitem: "Product",
        reportLink: 6,
      },
    ];
    var defaultLanguage = $localStorage.defaultLang;
    var localLanguage = false;
    $rootScope.lang = $sessionStorage.language;
    if ($sessionStorage.localLanguage) {
      localLanguage = $sessionStorage.localLanguage;
    }
    var mainMenu = [];
    if ($sessionStorage.mainMenu) {
      mainMenu = $sessionStorage.mainMenu;
    }

    var tabsMenu = [];

    if ($sessionStorage.tabsMenu) {
      tabsMenu = $sessionStorage.tabsMenu;
    }

    if ($sessionStorage.language) {
      $translate.use($sessionStorage.language);
    }
    if ($sessionStorage.DatePickLng) {
      moment.locale($sessionStorage.DatePickLng);
    }

    var getAllLanguages = function () {
      return Restangular.all("JGetLanguageList").get("");
    };

    var setLanguage = function (lang, setDefault) {
      if (setDefault == true) {
        $localStorage.defaultLang = lang;
        defaultLanguage = lang;
      }
      $rootScope.lang = lang.ShortName;
      localLanguage = lang.ShortName !== "eng";
      $sessionStorage.language = lang.ShortName;
      $sessionStorage.DatePickLng = lang.DatePickLng;
      $sessionStorage.localLanguage = localLanguage;
      $sessionStorage.rtl = lang.LngRtl;
      $translate.use(lang.ShortName);
      let evt = new CustomEvent('changeLanguage', { detail: lang.ShortName });
      window.dispatchEvent(evt);

    };

    var getLanguage = function () {
      if ($sessionStorage.language) return $sessionStorage.language;
      return "eng";
    };

    var getDefaultLanguage = function () {
      return defaultLanguage;
    };

    var isLanguageRTL = function () {
      return $sessionStorage.rtl;
    };

    var showLocalLanguage = function () {
      return localLanguage;
    };

    var getBWByColor = function (color, threshold, alpha) {
      try {
        if (typeof color == "string") {
          var jsColor = chroma(color.trim());
        }
        else {
          var jsColor = chroma(color);
        }
        if (!jsColor || jsColor.alpha() < (alpha || 0.3)) {
          return 'black';
        }
        const rgbColor = jsColor.rgb();
        if (rgbColor[0] * 0.299 + rgbColor[1] * 0.587 + rgbColor[2] * 0.114 > (threshold || 186)) {
          return "#000000";
        } else {
          return "#ffffff";
        }
      }
      catch (err) {
        return "black";
      };
    }

    var setMainMenu = function (callback) {
      Restangular.one("JGetMenuAndSubMenu/object")
        .get("")
        .then(function (res) {
          tabsMenu = res.menuAndSubMenu;
          $sessionStorage.tabsMenu = tabsMenu;
          Restangular.one("JGetMenuAndSubMenu/menu")
            .get("")
            .then(function (res) {
              mainMenu = res.menuAndSubMenu;
              for (var i = 0; i < mainMenu.length; i++) {
                var topMenu = mainMenu[i];
                if (topMenu.TopMenuAppPartID === 7608) {
                  topMenu.oneLevel = true;
                  topMenu.state = "index.custom";
                  topMenu.fullView = "customFullView";
                  topMenu.fullViewData = {
                    subMenuId: 0,
                    topMenuId: 7608,
                  };
                  topMenu.subMenuNew = topMenu.subMenu[0];
                  topMenu.subMenuNew.SubMenuAppPartID = 97608;
                  topMenu.subMenuNew.SubMenuTargetTYpe = topMenu.TopMenuTargetTYpe;
                  topMenu.subMenuNew.state = topMenu.state;
                  topMenu.subMenuNew.fullView = topMenu.fullViewData;
                  continue;
                }
                if (topMenu.TopMenuAppPartID === 1250) {
                  topMenu.oneLevel = true;
                  topMenu.state = "index.custom";
                  topMenu.fullView = "customFullView";
                  topMenu.fullViewData = {
                    subMenuId: 0,
                    topMenuId: 1250,
                  };
                  topMenu.subMenuNew = topMenu.subMenu[0];
                  topMenu.subMenuNew.SubMenuAppPartID = 97608;
                  topMenu.subMenuNew.SubMenuTargetTYpe = topMenu.TopMenuTargetTYpe;
                  topMenu.subMenuNew.state = topMenu.state;
                  topMenu.subMenuNew.fullView = topMenu.fullViewData;
                  continue;
                }
                if (topMenu.TopMenuAppPartID === 1300) {
                  topMenu.oneLevel = true;
                  topMenu.state = "index.custom";
                  topMenu.fullView = "customFullView";
                  topMenu.fullViewData = {
                    subMenuId: 0,
                    topMenuId: 1300,
                  };
                  topMenu.subMenuNew = topMenu.subMenu[0];
                  topMenu.subMenuNew.SubMenuAppPartID = 97608;
                  topMenu.subMenuNew.SubMenuTargetTYpe = topMenu.TopMenuTargetTYpe;
                  topMenu.subMenuNew.state = topMenu.state;
                  topMenu.subMenuNew.fullView = topMenu.fullViewData;
                  continue;
                }
                if (topMenu.TopMenuAppPartID === 1402) {
                  topMenu.oneLevel = true;
                  topMenu.state = "index.custom";
                  topMenu.fullView = "customFullView";
                  topMenu.fullViewData = {
                    subMenuId: 0,
                    topMenuId: 1402,
                  };
                  topMenu.subMenuNew = topMenu.subMenu[0];
                  topMenu.subMenuNew.SubMenuAppPartID = 97608;
                  topMenu.subMenuNew.SubMenuTargetTYpe = topMenu.TopMenuTargetTYpe;
                  topMenu.subMenuNew.state = topMenu.state;
                  topMenu.subMenuNew.fullView = topMenu.fullViewData;
                  continue;
                }
                for (var j = 0; j < topMenu.subMenu.length; j++) {
                  var subMenu = topMenu.subMenu[j];
                  subMenu.state = subMenu.SubMenuTargetTYpe;
                  if (!subMenu.SubMenuTargetTYpe || subMenu.SubMenuTargetTYpe === "") {
                    subMenu.SubMenuTargetTYpe = topMenu.TopMenuTargetTYpe;
                  }
                  if (subMenu.SubMenuTargetTYpe.indexOf("custom") === 0) {
                    subMenu.state = "index.custom";
                    subMenu.fullView = "customFullView";
                    subMenu.fullViewData = {
                      topMenuId: topMenu.TopMenuAppPartID,
                      subMenuId: subMenu.SubMenuAppPartID,
                    };
                  } else {
                    subMenu.state = "index." + subMenu.SubMenuTargetTYpe;
                    subMenu.fullView = subMenu.SubMenuTargetTYpe + "FullView";
                    if (subMenu.SubMenuTargetTYpe == "report") {
                      subMenu.fullViewData = {
                        reportID: subMenu.SubMenuExtID,
                        IsUserReport: "false",
                      };
                    } else if (subMenu.SubMenuTargetTYpe == "appObject") {
                      var objectMenu = getTabsByID(subMenu.SubMenuExtID);
                      if (objectMenu) {
                        subMenu.fullViewData = {
                          appObjectName: objectMenu.TopMenuObjectKey,
                          ID: 0,
                        };
                      }
                    } else if (subMenu.SubMenuTargetTYpe == "multiforms") {
                      subMenu.fullViewData = {
                        topMenuId: topMenu.TopMenuAppPartID,
                        subMenuId: subMenu.SubMenuAppPartID,
                      };
                    }
                  }
                }
              }
              $sessionStorage.mainMenu = mainMenu;
              callback(mainMenu);
            });
        });
    };

    var getMainMenu = function () {
      return mainMenu;
    };

    var getDisplayFormResults = function (postBody) {
      return Restangular.all("DisplayFormResults").post(postBody);
    };

    var getUnScheduledJobs = function (postBody, DepartmentIDs) {
      return new Promise((resolve, reject) => {
        const promises = [];
        promises.push(customAPI("GetJobsToAssign", { DepartmentID: DepartmentIDs || [] }));
        promises.push(
          Restangular.all("DisplayFormResults").post({
            ...postBody,
            LeaderID: -1,
          })
        );
        Promise.all(promises).then((data) => {
          const jobs = data[0].ResponseDictionaryDT.Jobs || [];
          const machines = data[0].ResponseDictionaryDT.Machines;
          const response = data[1];
          response.ReportStructure.ReportColumnsOrder = "";
          const recordsTemplate = response.recordTemplate;
          jobs.forEach((job) => {
            const recordValue = [];
            const recordTemplateMachine = _.find(recordsTemplate, (v) => v.Name.toLowerCase() === 'machineid');
            const machinesCombo = [];
            if (recordTemplateMachine) {
              recordTemplateMachine.DisplayType = 2;
              recordTemplateMachine.DisplayTypeName = "Combo";
              machines.forEach((machine) => {
                machinesCombo.push({
                  ChildcomboValues: [],
                  ComboChainField: null,
                  machineType: machine.machinetype,
                  department: machine.department,
                  ComboQueryEField: machine.machinename,
                  ComboQueryHField: machine.machinelname,
                  ComboValueField: machine.id,
                  isDefault: false,
                });
              });
              recordTemplateMachine.comboValues = machinesCombo;
            }
            Object.keys(job).forEach((key) => {
              const recordTemplate = _.find(recordsTemplate, (v) => v.Name.toLowerCase() === key);
              if (recordTemplate) {
                const newObj = { ...recordTemplate };
                newObj.value = job[key];
                if (key === "machineid") {
                  console.log(key);
                  newObj.comboValues = angular.copy(recordTemplate.comboValues);
                  const selectedCombo = _.find(newObj.comboValues, { ComboValueField: job[key] });
                  if (selectedCombo) {
                    selectedCombo.isDefault = true;
                  }
                } else if (key === "productid") {
                  newObj.AllowEntry = false;
                  newObj.value = job["productname"];
                } else {
                  newObj.AllowEntry = false;
                }
                recordValue.push(newObj);
              }
            });
            response.AllrecordValue.push(recordValue);
          });
          response.recordValue = [];
          response.machines = machines;
          resolve(response);
        });
      });
    };


    const getProductionProgressColorDefinitionDefferd = $q.defer();
    const getProductionProgressColorDefinition = () => {
      customAPI("GetProductionProgressColorDefinition", {}).then(function (response) {
        getProductionProgressColorDefinitionDefferd.resolve(response.ResponseList);
      });
    }

    const getProductionProgressColorDefinitionData = () => {
      return new Promise((resolve, reject) => {
        getProductionProgressColorDefinitionDefferd.promise.then(function (data) {
          resolve(data);
        });
      });
    };

    var InsertRecordByForm = function (body, post) {
      if (post) return Restangular.all("UpsertRecordByForm").post(body);
      else return Restangular.all("UpsertRecordByForm").customPUT(body);
    };

    var getDisplayReportSearchFields = function (body) {
      return Restangular.all("DisplayReportSearchFields").post(body);
    };

    var getResultFromTable = function (reportID) {
      return Restangular.all("getResultFromTable/" + reportID).get("");
    };

    var getDisplayNewObjectFields = function (body) {
      return Restangular.all("DisplayNewObjectFields").post(body);
    };

    var saveStateParams = function (params) {
      $sessionStorage.stateParams = params;
    };

    var getStateParams = function () {
      return $sessionStorage.stateParams;
    };

    var getResultSearchFields = function (body) {
      return Restangular.all("GetResultSearchFields").post(body);
    };

    var getResultSearchFieldsRecipe = function (body, split, materialSplit, callback) {
      return Restangular.all("GetResultSearchFields")
        .post(body)
        .then(function (response) {
          callback(split, materialSplit, response);
        });
    };

    var multiRecordsUpsert = function (body) {
      return Restangular.all("multiRecordsUpsert").post(body);
    };

    var savePageId = function (pageId) {
      $sessionStorage.pageId = pageId;
    };

    var getPageId = function () {
      return $sessionStorage.pageId;
    };

    var getTabsByAppName = function (appName) {
      var appObject = _.find(tabsMenu, { TopMenuObjectKey: appName });
      if (appObject) {
        return appObject;
      } else {
        appObject = _.find(tabsMenu, { TopMenuENameTemp: appName });
        if (appObject) {
          return appObject;
        }
      }
      return null;
    };

    var getTabsByID = function (id) {
      var appObject = _.find(tabsMenu, { TopMenuAppPartID: id });
      if (appObject) {
        return appObject;
      }
      return null;
    };

    var getActionsById = function (id) {
      return _.find(actions, { AppPartID: id });
    };

    var actionAPI = function (api, body) {
      return Restangular.all(api).post(body);
    };

    var customAPI = function (api, body, canceler) {
      if ($rootScope.unauthorized) {
        return $q.reject("user unauthorized");
      }
      if (!canceler) {
        return Restangular.all(api).post(body);
      } else {
        return Restangular.all(api).withHttpConfig({ timeout: canceler.promise }).post(body);
      }
    };

    var customDeleteAPI = function (api, data) {
      return Restangular.all(api).customDELETE("", "", {}, data);
    };

    var customGetAPI = function (api) {
      return Restangular.all(api).get("");
    };

    var getPopUpData = function () {
      return Restangular.all("GetPopUpData").get("");
    };

    var updateUserFormFieldGroups = function (body) {
      return Restangular.all("UpdateUserFormFieldGroups").post(body);
    };

    var refreshPage = function ($scope, ID, action) {
      var count = 10;
      var currentScope = $scope;
      while (count > 0 && currentScope) {
        if (currentScope.emptyPage) {
          if (ID > 0) {
            currentScope.content.ID = ID;
          }
          if (action) {
            currentScope.emptyPage(0);
          } else {
            currentScope.emptyPage(currentScope.pageDisplay);
          }
          return;
        }
        currentScope = currentScope.$parent;
        count = count - 1;
      }
      return null;
    };

    //for loading boxes structure only
    var MachinesBox = function (callback) {
      return $http.get("js/resources/MachinesBoxesStructure.json").then(function (response) {
        callback(response);
      });
    };

    //get Current Language File
    var getCurrentLanguageFile = function (lang) {
      return $http.get(`js/langs/${lang}.json`);
    };

    //for loading boxes data only
    var MachinesBoxData = function (callback) {
      return $http.get("js/resources/DepartmentsMachinesBoxesData.json").then(function (response) {
        callback(response);
      });
    };

    //for loading boxes structure only
    var MachinesBoxTetro = function (callback) {
      return $http.get("js/resources/MachinesBoxesStructureTetro.json").then(function (response) {
        callback(response);
      });
    };

    //for loading boxes data only
    var MachinesBoxDataTetro = function (callback) {
      return $http.get("js/resources/DepartmentsMachinesBoxesDataTetro.json").then(function (response) {
        callback(response);
      });
    };

    var getUserID = function () {
      return $sessionStorage.userID;
    };

    var getBoxesStructures = function () {
      return $http.get("js/resources/BoxStructures.json");
    };

    var getCubeStructure = function () {
      return Restangular.all("GetCubeStructure").post("");
    };

    var getMachineParameters = function (id) {
      return Restangular.all("GetMachineParameters").post({ MachineType: id });
    };

    var saveCubeStructure = function (request) {
      return Restangular.all("SaveCubeStructure").post(request);
    };

    var getKeyForCognos = function () {
      return Restangular.all("GetKeyForCognos").get("");
    };

    var updateStateParamsByReportID = function (reportID) {
      for (var i = 0; i < mainMenu.length; i++) {
        for (var j = 0; j < mainMenu[i].subMenu.length; j++) {
          if (mainMenu[i].subMenu[j].SubMenuExtID == parseInt(reportID) && mainMenu[i].subMenu[j].SubMenuTargetTYpe == "report") {
            $sessionStorage.stateParams = {
              subMenu: mainMenu[i].subMenu[j],
              topMenu: mainMenu[i],
            };
            return $sessionStorage.stateParams;
          }
        }
      }
    };

    var getVersion = function () {
      return GLOBAL.version;
    };

    var getDimensionsData = function () {
      return Restangular.all("GetDimensionsData").get("");
    };

    var GetKPIList = function () {
      return Restangular.all("GetKPIList").post("");
    };

    var getKPIRawData = function (from, to) {
      return Restangular.all("GetKPIRawData").post({ from: from, to: to });
    };

    var GetKPIStructure = function () {
      return Restangular.all("GetKPIStructure").get("");
    };

    var SaveKPIStructure = function (data) {
      return Restangular.all("SaveKPIStructure").post(data);
    };

    var ResetGraphData = function () {
      return Restangular.all("ResetGraphData").post("");
    };

    var GetObjectPrintFields = function (data) {
      return Restangular.all("GetObjectPrintFields").post(data);
    };

    var GetTemplateOption = function () {
      return Restangular.all("GetTemplateOption").get("");
    };

    var GetLabelFieldsTemplateOption = function () {
      return Restangular.all("GetLabelFieldsTemplateOption").get("");
    };

    var SaveObjectPrintDefinition = function (data) {
      return Restangular.all("SaveObjectPrintDefinition").post(data);
    };

    var GetPrintData = function (data) {
      return Restangular.all("GetPrintData").post(data);
    };

    var DeletePrintStructure = function (data) {
      return Restangular.all("DeletePrintStructure").post(data);
    };

    var GetPrintStructure = function (data) {
      return Restangular.all("GetPrintStructure").post(data);
    };

    var GetLabelFields = function (data) {
      return Restangular.all("GetLabelFields").post(data);
    };

    var SaveLabelDefinition = function (data) {
      return Restangular.all("SaveLabelDefinition").post(data);
    };

    var GetLabelStructure = function (data) {
      return Restangular.all("GetLabelStructure").post(data);
    };

    var CopySystemLabelStructureToExternalObject = function (data) {
      return Restangular.all("CopySystemLabelStructureToExternalObject").post(data);
    };

    var GetObjectPrintOptions = function () {
      return Restangular.all("GetObjectPrintOptions").post("");
    };

    var GetObjectPrintFieldsAndStructure = function (data) {
      return Restangular.all("GetObjectPrintFieldsAndStructure").post(data);
    };

    var SavePrintDefinition = function (data) {
      return Restangular.all("SavePrintDefinition").post(data);
    };

    var GetPrintStructureAndData = function (data) {
      return Restangular.all("GetPrintStructureAndData").post(data);
    };
    var GetPrintFileObjectsByObjectType = function (data) {
      return Restangular.all("GetPrintFileObjectsByObjectType").post(data);
    };

    var GetAllGroupsAndUsers = function () {
      return Restangular.all("GetAllGroupsAndUsers").get("");
    };

    var GetDepartmentShiftData = function () {
      return Restangular.all("GetDepartmentShiftData").post(data);
    };

    var convertPxToVW = function (px) {
      var vwValue = parseFloat(px / window.innerWidth) * 100;
      vwValue = vwValue.toFixed(4);
      return parseFloat(vwValue);
    };

    // Public API here
    return {
      customGetAPI: customGetAPI,
      customDeleteAPI: customDeleteAPI,
      updateStateParamsByReportID: updateStateParamsByReportID,
      getAllLanguages: getAllLanguages,
      setLanguage: setLanguage,
      getLanguage: getLanguage,
      getDefaultLanguage: getDefaultLanguage,
      isLanguageRTL: isLanguageRTL,
      showLocalLanguage: showLocalLanguage,
      getMainMenu: getMainMenu,
      setMainMenu: setMainMenu,
      getBWByColor: getBWByColor,
      getDisplayFormResults: getDisplayFormResults,
      getUnScheduledJobs: getUnScheduledJobs,
      InsertRecordByForm: InsertRecordByForm,
      getProductionProgressColorDefinition: getProductionProgressColorDefinition,
      getProductionProgressColorDefinitionData: getProductionProgressColorDefinitionData,
      getDisplayReportSearchFields: getDisplayReportSearchFields,
      getDisplayNewObjectFields: getDisplayNewObjectFields,
      saveStateParams: saveStateParams,
      getStateParams: getStateParams,
      getResultSearchFields: getResultSearchFields,
      multiRecordsUpsert: multiRecordsUpsert,
      getTabsByAppName: getTabsByAppName,
      getTabsByID: getTabsByID,
      savePageId: savePageId,
      getPageId: getPageId,
      getActionsById: getActionsById,
      actionAPI: actionAPI,
      customAPI: customAPI,
      updateUserFormFieldGroups: updateUserFormFieldGroups,
      refreshPage: refreshPage,
      MachinesBox: MachinesBox,
      MachinesBoxData: MachinesBoxData,
      getCurrentLanguageFile: getCurrentLanguageFile,
      getUserID: getUserID,
      getBoxesStructures: getBoxesStructures,
      getCubeStructure: getCubeStructure,
      MachinesBoxTetro: MachinesBoxTetro,
      MachinesBoxDataTetro: MachinesBoxDataTetro,
      getMachineParameters: getMachineParameters,
      saveCubeStructure: saveCubeStructure,
      getResultSearchFieldsRecipe: getResultSearchFieldsRecipe,
      getKeyForCognos: getKeyForCognos,
      getVersion: getVersion,
      getPopUpData: getPopUpData,
      getDimensionsData: getDimensionsData,
      GetKPIList: GetKPIList,
      getKPIRawData: getKPIRawData,
      GetKPIStructure: GetKPIStructure,
      SaveKPIStructure: SaveKPIStructure,
      ResetGraphData: ResetGraphData,
      GetObjectPrintFields: GetObjectPrintFields,
      GetTemplateOption: GetTemplateOption,
      GetLabelFieldsTemplateOption: GetLabelFieldsTemplateOption,
      SaveObjectPrintDefinition: SaveObjectPrintDefinition,
      GetPrintData: GetPrintData,
      DeletePrintStructure: DeletePrintStructure,
      GetPrintStructure: GetPrintStructure,
      GetLabelFields: GetLabelFields,
      SaveLabelDefinition: SaveLabelDefinition,
      GetLabelStructure: GetLabelStructure,
      CopySystemLabelStructureToExternalObject: CopySystemLabelStructureToExternalObject,
      GetObjectPrintOptions: GetObjectPrintOptions,
      GetObjectPrintFieldsAndStructure: GetObjectPrintFieldsAndStructure,
      SavePrintDefinition: SavePrintDefinition,
      GetPrintStructureAndData: GetPrintStructureAndData,
      GetPrintFileObjectsByObjectType: GetPrintFileObjectsByObjectType,
      GetAllGroupsAndUsers: GetAllGroupsAndUsers,
      GetDepartmentShiftData: GetDepartmentShiftData,
      convertPxToVW: convertPxToVW,
      getResultFromTable: getResultFromTable,
    };
  })

  .factory("AuthService", function ($rootScope, Restangular, $sessionStorage, $localStorage, $filter, USER_ROLES, Session, intercomService, BASE_URL, $timeout) {
    var accessToken = {};
    var userAuth = $sessionStorage.userAuthenticated;

    var initialHighchartsLang = () => {
      $timeout(() => {
        if(!HighchartsCore.setOptions)
          return;
        HighchartsCore.setOptions({
          lang: {
              downloadJPEG: $filter('translate')('DOWNLOAD_JPEG'),
              viewFullscreen: $filter('translate')('VIEW_FULL_SCREEN'),
              downloadPNG: $filter('translate')('DOWNLOAD_PNG'),
              printChart: $filter('translate')('PRINT_CHART'),
              downloadPDF: $filter('translate')('DOWNLOAD_PDF'),
              downloadSVG: $filter('translate')('DOWNLOAD_SVG'),
              downloadCSV: $filter('translate')('DOWNLOAD_CSV'),
          }
        });
        if (Highcharts) {
          Highcharts.setOptions({
            lang: {
                downloadJPEG: $filter('translate')('DOWNLOAD_JPEG'),
                viewFullscreen: $filter('translate')('VIEW_FULL_SCREEN'),
                downloadPNG: $filter('translate')('DOWNLOAD_PNG'),
                printChart: $filter('translate')('PRINT_CHART'),
                downloadPDF: $filter('translate')('DOWNLOAD_PDF'),
                downloadSVG: $filter('translate')('DOWNLOAD_SVG'),
                downloadCSV: $filter('translate')('DOWNLOAD_CSV'),
            }
          });
        }
      }, 500);
    };

    if (userAuth) {
      Session.create(userAuth);
      accessToken = {
        "x-access-token": userAuth.accessToken,
        UniqueID: $sessionStorage.azureUser || undefined,
      };
      initialHighchartsLang();
      intercomService.updateSettings(userAuth.userName, userAuth.email, userAuth.loginTimeStamp, userAuth.siteName, $sessionStorage.userID);
      Restangular.setDefaultHeaders(accessToken);
    }
    

    var getSiteName = function () {
      if (userAuth && userAuth.siteName) return userAuth.siteName;
      return "FACTORY_NAME";
    };

    var getUsername = function () {
      if (userAuth && userAuth.userName) return userAuth.userName;
      return "example Username";
    };

    var getUserDateFormat = function () {
      return userAuth && userAuth.UserDateFormat;
    };

    var getTemplateID = function () {
      return userAuth && userAuth.TemplateID;
    };

    var getAccessToken = function () {
      return userAuth.accessToken;
    };

    var getHomePage = function () {
      return userAuth.HomePage;
    };

    var getHomePageTab = function () {
      return userAuth.HomePageSubObject;
    };

    var clearSession = function () {
      $sessionStorage.userAuthenticated = null;
      $sessionStorage.mainMenu = null;
      $sessionStorage.localLanguage = null;
      $sessionStorage.userID = null;
      $sessionStorage.HasEmail = null;
      $sessionStorage.ValidatedEmail = null;
      Restangular.setDefaultHeaders({});
      Session.destroy();
    };

    var getEncryptedPassword = function (pass) {
      return Restangular.all("JGetEncryptedPassword").post(pass);
    };

    var login = function (api, credentials) {
      return Restangular.all(api)
        .post(credentials)
        .then(function (res) {
          var response = (res && res.JGetUserSessionIDResult) || res;
          if (response && response.error == null) {

            var userAuthenticated = {
              accessToken: response.session[0].session,
              userName: credentials.Username || credentials.userName,
              userRoles: USER_ROLES.all,
              siteName: response.session[0].SiteName,
              HomePage: response.session[0].HomePage,
              HomePageSubObject: response.session[0].HomePageSubObject,
              ShowPopUp: response.session[0].ShowPopUp,
              TemplateID: response.session[0].TemplateID,
              UserDateFormat: response.session[0].UserDateFormat || "DD/MM/YYYY HH:mm:ss",
              loginTimeStamp: Date.now(),
              email: response.session[0].Email,
              allowQCTestsEdit: response.session[0].AllowQCTestsEdit,
              AllowSetDefaultMachineStructure: response.session[0].AllowSetDefaultMachineStructure
            };
            intercomService.updateSettings(userAuthenticated.userName, userAuthenticated.email, userAuthenticated.loginTimeStamp, userAuthenticated.siteName, response.session[0].UserID);
            if (userAuthenticated.ShowPopUp) {
              const onlineRefreshTime = $sessionStorage.onlineRefreshTime;
              const exportCSVDelimiter = $sessionStorage.exportCSVDelimiter;
              const azureRequestsInterval = $sessionStorage.azureRequestsInterval;
              $sessionStorage.$reset();
              $localStorage.$reset();
              $sessionStorage.onlineRefreshTime = onlineRefreshTime;
              $sessionStorage.exportCSVDelimiter = exportCSVDelimiter;
              $sessionStorage.azureRequestsInterval = azureRequestsInterval;
              $sessionStorage.baseUrl = BASE_URL.url;
            }
            if (response.session[0].UserDateFormat) {
              sessionStorage.setItem("userDateFormat", response.session[0].UserDateFormat);
            }
            Session.create(userAuthenticated);
            initialHighchartsLang();
            accessToken = {
              "x-access-token": response.session[0].session,
              UniqueID: $sessionStorage.azureUser || undefined,
            };
            Restangular.setDefaultHeaders(accessToken);
            $sessionStorage.userAuthenticated = userAuthenticated;
            userAuth = userAuthenticated;
            $sessionStorage.userID = response.session[0].UserID;
            $sessionStorage.HasEmail = response.session[0].HasEmail;
            $sessionStorage.ValidatedEmail = response.session[0].ValidatedEmail;
            $rootScope.unauthorized = false;
            if (userAuthenticated.ShowPopUp) {
              Restangular.all('UpdateShowPopUp').post({
                ShowPopUpStatus: false,
              }).then(function (response) {
                userAuthenticated.ShowPopUp = false;
              });
            }
            if (response.session[0].ManageTasks === true) {
              $sessionStorage.tasksPermissionLevel = 2;
            } else if (response.session[0].IsOpenTasksForOthers === true) {
              $sessionStorage.tasksPermissionLevel = 1;
            } else {
              $sessionStorage.tasksPermissionLevel = 0;
            }
          }
          return res;
        });
    };

    var reLogin = function (credentials) {
      return Restangular.all("JGetUserSessionID")
        .post(credentials)
        .then(function (res) {
          if (res.JGetUserSessionIDResult.error == null) {
            $sessionStorage.userAuthenticated.accessToken = res.JGetUserSessionIDResult.session[0].session;
            accessToken = {
              "x-access-token": res.JGetUserSessionIDResult.session[0].session,
            };
            Restangular.setDefaultHeaders(accessToken);
            userAuth = $sessionStorage.userAuthenticated;
          }
          return res;
        });
    };

    var isAuthenticated = function () {
      if (Session && Session.userAuthenticated) return !!Session.userAuthenticated;
      return false;
    };

    var isAuthorized = function (authorizedRoles) {
      if (!angular.isArray(authorizedRoles)) {
        authorizedRoles = [authorizedRoles];
      }
      return isAuthenticated() && authorizedRoles.indexOf(Session.userAuthenticated.userRoles) !== -1;
    };
    return {
      getEncryptedPassword: getEncryptedPassword,
      login: login,
      reLogin: reLogin,
      isAuthenticated: isAuthenticated,
      isAuthorized: isAuthorized,
      clearSession: clearSession,
      getUsername: getUsername,
      getAccessToken: getAccessToken,
      getSiteName: getSiteName,
      getHomePage: getHomePage,
      getHomePageTab: getHomePageTab,
      getTemplateID: getTemplateID,
      getUserDateFormat: getUserDateFormat,
    };
  })

  .factory("commonFunctions", function ($compile, $state, $filter, LeaderMESservice, BreadCrumbsService, notify, $modal, toastr, SweetAlert, $timeout, AuthService, $localStorage) {
    var initCommonCode = function ($scope) {
      $scope.changes = [];
      $scope.doneLoading = false;
      $scope.localLanguage = LeaderMESservice.showLocalLanguage();
      if (!$state.params.menuContent && $state.params.reportID) {
        $scope.stateParams = LeaderMESservice.updateStateParamsByReportID($state.params.reportID);
      } else if (!$state.params.menuContent) {
        $scope.stateParams = LeaderMESservice.getStateParams();
      } else {
        $scope.stateParams = $state.params.menuContent;
        LeaderMESservice.saveStateParams($scope.stateParams);
      }
      if (!$scope.parentScope) {
        $scope.topPageTitle = {
          title: "",
        };
        if (!$scope.stateParams) {
          $scope.stateParams = {
            subMenu: $scope.content,
            topMenu: {
              TopMenuLName: "Report",
              TopMenuEName: "Report",
            },
          };
        }
        if ($scope.stateParams.subMenu) {
          if ($scope.localLanguage) {
            $scope.topPageTitle.title = $scope.stateParams.subMenu.SubMenuLName;
          } else {
            $scope.topPageTitle.title = $scope.stateParams.subMenu.SubMenuEName;
          }
        }
      }
      $scope.breadCrumbChange = function (click) {
        if (click > 0) {
          /*if (click == 1 && $scope.displayCriteria == false) {
                     return;
              }*/
          BreadCrumbsService.breadCrumbChange(click);
          $scope.pageDisplay = click;
          $scope.subPages.splice(click);
          var clickData = BreadCrumbsService.get(click);
          if (clickData) {
            clickData.callback();
          }
        }
      };

      var initBreadCrumb = function () {
        BreadCrumbsService.init();
        if ($scope.localLanguage == true) {
          BreadCrumbsService.push($scope.stateParams.topMenu.TopMenuLName, 0);
          BreadCrumbsService.push($scope.stateParams.subMenu.SubMenuLName, 0);
        } else {
          BreadCrumbsService.push($scope.stateParams.topMenu.TopMenuEName, 0);
          BreadCrumbsService.push($scope.stateParams.subMenu.SubMenuEName, 0);
        }
        if (!$scope.parentScope && $scope.subPages.length > 0) {
          BreadCrumbsService.push($scope.subPages[$scope.pageDisplay - 1].title, $scope.subPages[$scope.pageDisplay - 1].pageDisplay, function () {
            $scope.topPageTitle.title = $scope.localLanguage ? $scope.stateParams.subMenu.SubMenuLName : $scope.stateParams.subMenu.SubMenuEName;
            $scope.$emit("changeTitle", "Search");
          });
        }
      };
      if ($scope.parentScope) {
        return;
      }
      if ($scope.modal === undefined || $scope.modal === null) {
        initBreadCrumb();
      }
    };

    var commonCodeNew = function ($scope) {
      $scope.formId = $scope.formID;
      $scope.leaderId = 0;
      $scope.SkipSaveOperation = false;
      $scope.api = 'DisplayFormResults'

      $scope.searchPage = false;
      initCommonCode($scope, $compile, $state, LeaderMESservice, BreadCrumbsService);
      if (!$scope.parentScope) {
        $scope.searchPage = false;
        $scope.subPages = [
          {
            pageDisplay: 1,
            title: "ADD",
            template: "views/common/form.html",
          },
        ];
        $scope.$emit("changeTitle", "New");
      }
      fieldChanges($scope);


      $scope.request = {
        leaderID: 0,
        formID: $scope.formID,
        pairs: $scope.getChanges()
      }

      //$scope.add = function (pairs) { old react
      $scope.add = function (pairs, formID) {


        var request = {
          leaderID: 0,
          // formID: $scope.formID,
          formID: formID || $scope.formID,
          // pairs: $scope.getChanges(), old react
          pairs: pairs || $scope.getChanges(),
          skipSaveOperation: false,
        };


        LeaderMESservice.InsertRecordByForm(request, true).then(function (response) {
          $scope.buttonDisabled = false;
          if (response.sucess === true) {
            if ($scope.parentScope) {
              $scope.modalInstance.close(response.NewRecordID);
              return;
            }
            var appObject = LeaderMESservice.getTabsByID($scope.content.SubMenuExtID);
            if (appObject === null) return;
            $scope.topPageTitle = {
              title: "",
            };
            var appObjectTabsStruct = {
              ID: response.NewRecordID,
              linkItem: appObject.TopMenuObjectKey,
              fieldName: "ID",
              title: $scope.localLanguage === true ? appObject.TopMenuLName : appObject.TopMenuEName,
              topPageTitle: $scope.topPageTitle,
            };
            $scope.subPages.push({
              pageDisplay: $scope.pageDisplay + 1,
              title: $scope.localLanguage === true ? appObject.TopMenuLName : appObject.TopMenuEName,
              template: "views/common/appObjectTabsTemplate.html",
              ID: response.NewRecordID,
              linkItem: appObject.TopMenuObjectKey,
              fieldName: "ID",
              data: appObjectTabsStruct,
              topPageTitle: $scope.topPageTitle,
            });
            $scope.changes = [];
            $scope.doneLoading = true;
            $scope.pageDisplay++;

            $scope.topPageTitle.title = $scope.localLanguage === true ? appObject.TopMenuLName + " # " + ID : appObject.TopMenuEName + " # " + ID;
            BreadCrumbsService.push($scope.subPages[$scope.pageDisplay - 1].title + " # " + response.NewRecordID, $scope.subPages[$scope.pageDisplay - 1].pageDisplay, function () {
              $scope.topPageTitle.title = $scope.localLanguage ? $scope.stateParams.subMenu.SubMenuLName : $scope.stateParams.subMenu.SubMenuEName;
            });
          } else {
            if (response.PreAction.length !== 0 || response.PostAction.length !== 0) {
              for (var i = 0; i < response.PreAction.length; i++) {
                notify({
                  message: response.PreAction[i].Value,
                  classes: "alert-danger",
                  templateUrl: "views/common/notify.html",
                });
              }
              for (var i = 0; i < response.PostAction.length; i++) {
                notify({
                  message: response.PostAction[i].Value,
                  classes: "alert-danger",
                  templateUrl: "views/common/notify.html",
                });
              }
            }
            //toastr.error(response.error.ErrorMessage, response.error.ErrorDescription + ":[" + response.error.ErrorCode + "]");
            else if (response.error !== null) {
              notify({
                message: response.error.ErrorCode + " - " + response.error.ErrorDescription,
                classes: "alert-danger",
                templateUrl: "views/common/notify.html",
              });
              return;
            } else if (response.PreAction.length !== 0 || response.PostAction.length !== 0) {
              for (var i = 0; i < response.PreAction.length; i++) {
                notify({
                  message: response.PreAction[i].Value,
                  classes: "alert-danger",
                  templateUrl: "views/common/notify.html",
                });
              }
              for (var i = 0; i < response.PostAction.length; i++) {
                notify({
                  message: response.PostAction[i].Value,
                  classes: "alert-danger",
                  templateUrl: "views/common/notify.html",
                });
              }
              return;
            }
          }
        });
      };

      $scope.getNewObjectFields = function (customRequest, customAPI) {
        var request = {
          LeaderID: 0,
          formID: $scope.formID,
        };
        var requestResponse = {
          LeaderID: 0,
          formID: $scope.formID,
        };
        formResults($scope, customRequest || request, requestResponse, customAPI || "DisplayFormResults", []);
      };

      $scope.formCallBack = function () {
        $scope.add();
      };

      $scope.actionName = "ADD";
    };

    var commonCodeSearch = function ($scope) {      
      $scope.searchPage = true;
      $scope.subPages = [
        // {
        //     pageDisplay: 1,
        //     title: 'SEARCH',
        //     template: 'views/common/search.html'
        // }
      ];
      $scope.$emit("changeTitle", "Search");
      $scope.displayCriteria = true;

      initCommonCode($scope);

      fieldChanges($scope, true);

      $scope.getDisplayReportSearchFields = function () {        
        $scope.search();
        //     LeaderMESservice.getDisplayReportSearchFields({
        //         reportID: $scope.reportID,
        //         IsUserReport: $scope.IsUserReport
        //     }).then(function (response) {
        //         if (response && response.error == null && response.recordValue) {
        //             $scope.reportSearchFields = response.recordValue;
        //             $scope.reportSearchFields = _.sortBy($scope.reportSearchFields, 'DisplayOrder');
        //             var displayCrietria = _.find(response.recordValue, {DisplayCriteria: false});
        //             if (displayCrietria) {
        //                 $scope.displayCriteria = false;
        //                 $scope.doneLoading = true;
        //                 $scope.search();
        //                 return;
        //             }
        //         }
        //         else {
        //             toastr.clear();
        //             toastr.error(response.error.ErrorMessage, response.error.ErrorDescription + ":[" + response.error.ErrorCode + "]");
        //         }
        //         $scope.doneLoading = true;
        //     });
      };

      $scope.search = function () {          
        if ($scope.qcTestResultSearch) {
          var productID = _.find($scope.searchFieldsTemp, { ID: 1 })?.value ? [_.find($scope.searchFieldsTemp, { ID: 1 })?.value] : []
          var jobIDs = _.find($scope.searchFieldsTemp, { ID: 2 })?.value || []
          var machineIDs = _.find($scope.searchFieldsTemp, { ID: 3 })?.value ? [_.find($scope.searchFieldsTemp, { ID: 3 })?.value] : []
          var subTypeIDs =$scope.qualityTest.value!=undefined ? [$scope.qualityTest.value]:[]
          var materialID = _.find($scope.searchFieldsTemp, { ID: 5 })?.value ? [_.find($scope.searchFieldsTemp, { ID: 5 })?.value] : []
          var TestStatus=_.find($scope.searchFieldsTemp, { ID: 7 })?.value ? _.find($scope.searchFieldsTemp, { ID: 7 })?.value : []
          var Batch=_.find($scope.searchFieldsTemp, { ID: 9})?.value ? [_.find($scope.searchFieldsTemp, { ID: 9 })?.value] : []
          var subTypeIDsMatrial = _.find($scope.searchFieldsTemp, { ID: 6 })?.value ? [_.find($scope.searchFieldsTemp, { ID: 6 }).value] : []
        }

        var searchResultsRequest = {
          data: {
            functionCallBack: "$parent.$parent.rowClicked",
            onlyNewTab: false,
            ID: $scope.formId,
            newTabState: $scope.mainPageState,
            returnValue: $scope.returnValue || false,
            disableLinks: $scope.disableLinks || false,
            openSearchInNewTab: false,
            reportID: $scope.reportID,
            reportTitle: $scope.topPageTitle.title,
            multiSelect: $scope.multiSelect,
            AppPartId: ($scope.content && $scope.content.SubMenuAppPartID) || 0,
            chosenIds: $scope.chosenIds || [],
            showApply: $scope.returnValue || $scope.showApply || false,
            hasProductGroup: $scope.hasProductGroup
          },
        };
        if ($scope.reportID == 100147 && $scope.qcTestResultSearch) {
          searchResultsRequest.request = {
            JobIDs: jobIDs,
            MachineIDs: machineIDs,
            SubTypes: subTypeIDs,
            TestType: $scope.selectedGroup?.ID,
            sfCriteria: $scope.sfCriteria,
          };
          searchResultsRequest.api = "QCGetProductsForReport";
        } else if ($scope.reportID == 100148 && $scope.qcTestResultSearch) {
          //quality test
          searchResultsRequest.request = {
            SubTypes: subTypeIDsMatrial,
            TestType: $scope.selectedGroup?.ID,
            sfCriteria: $scope.sfCriteria,
          };
          searchResultsRequest.api = "QCGetMaterialsForReport";
        } 
        
        else if ($scope.reportID == 503 && $scope.qcTestResultSearch) {
          //QCGetBatchesForReport
          searchResultsRequest.request = {
            ProductIDs: productID,
            JobIDs: jobIDs,
            TestStatus:TestStatus,
            SubTypes: subTypeIDs,
            MachineIDs: machineIDs,
            MaterialIDs: materialID,
            TestType: $scope.selectedGroup?.ID,
            sfCriteria: $scope.sfCriteria,
          };
          searchResultsRequest.api = "QCGetBatchesForReport";
        } 
        else if ($scope.reportID == 100121 && $scope.qcTestResultSearch) {
          //TestStatusesForReport
          searchResultsRequest.request = {
            ProductIDs: productID,
            JobIDs: jobIDs,
            BatchIDs:Batch,
            SubTypes: subTypeIDs,
            MachineIDs: machineIDs,
            MaterialIDs: materialID,
            TestType: $scope.selectedGroup?.ID,
            sfCriteria: $scope.sfCriteria,
          };
          searchResultsRequest.api = "QCGetTestStatusesForReport";
        } 
        else if ($scope.reportID == 15 && $scope.qcTestResultSearch) {
          // jobs
          searchResultsRequest.request = {
            ProductIDs: productID,
            MachineIDs: machineIDs,
            SubTypes: subTypeIDs,
            TestType: $scope.selectedGroup?.ID,
            sfCriteria: $scope.sfCriteria,
          };
          searchResultsRequest.api = "QCGetJobsForReport";
        } else if ($scope.reportID == 100120 && $scope.qcTestResultSearch) {
          //machines
          searchResultsRequest.request = {
            ProductIDs: productID,
            JobIDs: jobIDs,
            SubTypes: subTypeIDs,
            TestType: $scope.selectedGroup?.ID,
            sfCriteria: $scope.sfCriteria,
          };
          searchResultsRequest.api = "QCGetMachinesForReport";
        } else if (($scope.reportID == 336 || $scope.reportID == 337) && $scope.qcTestResultSearch) {
          searchResultsRequest.request = {
            ProductIDs: productID,
            JobIDs: jobIDs,
            MachineIDs: machineIDs,
            MaterialIDs: materialID,
            TestType: $scope.selectedGroup?.ID,
            sfCriteria: $scope.sfCriteria,
          };
          searchResultsRequest.api = "QCGetSubTypesForReport";
        } else {
          searchResultsRequest.request = {
            reportID: $scope.reportID,
            sfCriteria: $scope.sfCriteria,
            IsUserReport: $scope.IsUserReport
          }
          searchResultsRequest.api = "GetResultSearchFields"
        }

     
          $scope.subPages.push({
            pageDisplay: 1,
            title: "SEARCH_RESULTS",
            template: "views/common/searchResultsCommonTemplateReact.html",
            data: searchResultsRequest,
          });

       
        

        $scope.$emit("changeTitle", "Search Results");
        $scope.pageDisplay++;
        if ($scope.modal === undefined || $scope.modal === null) {
          BreadCrumbsService.push($scope.subPages[$scope.pageDisplay - 1].title, $scope.subPages[$scope.pageDisplay - 1].pageDisplay, function () {
            $scope.topPageTitle.title = $scope.localLanguage ? $scope.stateParams.subMenu.SubMenuLName : $scope.stateParams.subMenu.SubMenuEName;
            $scope.$emit("changeTitle", "Search Results");
          });
        }
      };

      $scope.rowClicked = function (ID, linkItem, fieldName) {
        var appObject = LeaderMESservice.getTabsByAppName(linkItem);
        if (appObject === null) return;
        $scope.topPageTitle = {
          title: "",
        };
        var appObjectTabsStruct = {
          ID: ID,
          linkItem: linkItem,
          fieldName: fieldName,
          rowClicked: $scope.rowClicked,
          title: $scope.localLanguage == true ? appObject.TopMenuLName : appObject.TopMenuEName,
          topPageTitle: $scope.topPageTitle,
        };
        $scope.subPages.push({
          pageDisplay: $scope.pageDisplay + 1,
          title: $scope.localLanguage == true ? appObject.TopMenuLName : appObject.TopMenuEName,
          template: "views/common/appObjectTabsTemplate.html",
          ID: ID,
          linkItem: linkItem,
          fieldName: fieldName,
          data: appObjectTabsStruct,
          topPageTitle: $scope.topPageTitle,
        });
        $scope.topPageTitle.title = $scope.localLanguage == true ? appObject.TopMenuLName + " # " + ID : appObject.TopMenuEName + " # " + ID;
        LeaderMESservice.customAPI("DisplayAppObjectHeaderFields", {
          appObject: linkItem,
          LeaderID: ID,
        }).then(function (response) {
          if (response.Data && response.Data.length > 0) {
            for (var i = 0; i < response.Data.length; i++) {
              var fieldName = $scope.localLanguage ? response.Data[i].DisplayLName : response.Data[i].DisplayEName;
              var fieldValue = response.Data[i].Value;
              if (response.Data[i].UrlTarget && response.Data[i].UrlTarget != "") {
                fieldValue = '<a target="' + response.Data[i].UrlTarget + '" href="#/appObjectFullView/' + response.Data[i].UrlTarget + "/" + response.Data[i].ID + '/">' + response.Data[i].Value + "</a>";
              }
              $scope.topPageTitle.title = $scope.topPageTitle.title + " , " + fieldName + " = " + fieldValue;
            }
          }
        });
        $scope.pageDisplay++;
        BreadCrumbsService.push($scope.subPages[$scope.pageDisplay - 1].title + " # " + ID, $scope.subPages[$scope.pageDisplay - 1].pageDisplay, function () {
          $scope.topPageTitle.title = $scope.localLanguage === true ? appObject.TopMenuLName + " # " + ID : appObject.TopMenuEName + " # " + ID;
          LeaderMESservice.customAPI("DisplayAppObjectHeaderFields", {
            appObject: linkItem,
            LeaderID: ID,
          }).then(function (response) {
            for (var i = 0; i < response.Data.length; i++) {
              var fieldName = $scope.localLanguage ? response.Data[i].DisplayLName : response.Data[i].DisplayEName;
              var fieldValue = response.Data[i].Value;
              if (response.Data[i].UrlTarget && response.Data[i].UrlTarget != "") {
                fieldValue = '<a target="' + response.Data[i].UrlTarget + '" href="#/appObjectFullView/' + response.Data[i].UrlTarget + "/" + response.Data[i].ID + '/">' + response.Data[i].Value + "</a>";
              }
              $scope.topPageTitle.title = $scope.topPageTitle.title + " , " + fieldName + " = " + fieldValue;
            }
          });
        });
      };
    };

    var commonCodeObjectFullView = function ($scope) {
      $scope.searchPage = false;
      $scope.subPages = [
        {
          pageDisplay: 1,
          title: "SEARCH",
          template: "views/common/search.html",
        },
      ];
      $scope.displayCriteria = true;

      $scope.breadCrumbChange = function (click) {
        if (click > 0) {
          if (click == 1 && $scope.displayCriteria == false) {
            return;
          }
          BreadCrumbsService.breadCrumbChange(click);
          $scope.pageDisplay = click;
          $scope.subPages.splice(click);
          var clickData = BreadCrumbsService.get(click);
          if (clickData) {
            clickData.callback();
          }
        }
      };
      $scope.subPages = [];
      $scope.pageDisplay = 0;
      $scope.rowClicked = function (ID, linkItem, fieldName) {
        var appObject = LeaderMESservice.getTabsByAppName(linkItem);
        if (appObject === null) return;
        $scope.topPageTitle = {
          title: "",
        };
        var appObjectTabsStruct = {
          ID: ID,
          title: $scope.localLanguage === true ? appObject.TopMenuLName : appObject.TopMenuEName,
          linkItem: linkItem,
          fieldName: fieldName,
          rowClicked: $scope.rowClicked,
          topPageTitle: $scope.topPageTitle,
        };

        $scope.subPages.push({
          pageDisplay: $scope.pageDisplay + 1,
          title: $scope.localLanguage === true ? appObject.TopMenuLName : appObject.TopMenuEName,
          template: "views/common/appObjectTabsTemplate.html",
          ID: ID,
          linkItem: linkItem,
          fieldName: fieldName,
          data: appObjectTabsStruct,
          topPageTitle: $scope.topPageTitle,
        });
        $scope.topPageTitle.title = $scope.localLanguage === true ? appObject.TopMenuLName + " # " + ID : appObject.TopMenuEName + " # " + ID;
        LeaderMESservice.customAPI("DisplayAppObjectHeaderFields", {
          appObject: appObject.TopMenuObjectKey,
          LeaderID: ID,
        }).then(function (response) {
          if (response.Data && response.Data.length > 0) {
            for (var i = 0; i < response.Data.length; i++) {
              var fieldName = $scope.localLanguage ? response.Data[i].DisplayLName : response.Data[i].DisplayEName;
              var fieldValue = response.Data[i].Value;
              if (response.Data[i].UrlTarget && response.Data[i].UrlTarget != "") {
                fieldValue = '<a target="' + response.Data[i].UrlTarget + '" href="#/appObjectFullView/' + response.Data[i].UrlTarget + "/" + response.Data[i].ID + '/">' + response.Data[i].Value + "</a>";
              }
              $scope.topPageTitle.title = $scope.topPageTitle.title + " , " + fieldName + " = " + fieldValue;
            }
          }
        });
        $scope.pageDisplay++;
        BreadCrumbsService.push($scope.subPages[$scope.pageDisplay - 1].title + (ID != 0 ? " # " + ID : ""), $scope.subPages[$scope.pageDisplay - 1].pageDisplay, function () {
          $scope.topPageTitle.title = $scope.localLanguage === true ? appObject.TopMenuLName + " # " + ID : appObject.TopMenuEName + " # " + ID;
          LeaderMESservice.customAPI("DisplayAppObjectHeaderFields", {
            appObject: appObject.TopMenuObjectKey,
            LeaderID: ID,
          }).then(function (response) {
            if (response.Data && response.Data.length > 0) {
              for (var i = 0; i < response.Data.length; i++) {
                var fieldName = $scope.localLanguage ? response.Data[i].DisplayLName : response.Data[i].DisplayEName;
                var fieldValue = response.Data[i].Value;
                if (response.Data[i].UrlTarget && response.Data[i].UrlTarget != "") {
                  fieldValue = '<a target="' + response.Data[i].UrlTarget + '" href="#/appObjectFullView/' + response.Data[i].UrlTarget + "/" + response.Data[i].ID + '/">' + response.Data[i].Value + "</a>";
                }
                $scope.topPageTitle.title = $scope.topPageTitle.title + " , " + fieldName + " = " + fieldValue;
              }
            }
          });
        });
      };
    };
    // DON'T TOUCH THIS FUNCTION CAUTION
    var fieldChanges = function ($scope, isSearch) {
      var userDateFormat = AuthService.getUserDateFormat();
      $scope.updateValue = function (contentName, value, type, op, childName) {
        //if (value == null || value === "" || (Array.isArray(value) && value.length === 0) || value == undefined) {
        //    if (!(type == 'combo' && value == null)) {
        //        return _.remove($scope.changes, function (obj) {
        //            if (obj.FieldName == contentName)
        //                return true;
        //            return false;
        //        });
        //    }
        //}
        if ((contentName === 'JoshID' || contentName === 'PackageTypeID') && value && value.ComboValueField) {
          const joshIDValue = value.ComboValueField;
          let effectiveAmountField = null;
          let packageTypeField = null;
          if ($scope.groups && $scope.groups.length > 0) {
            for (let i = 0; i < $scope.groups.length; i++) {
              const group = $scope.groups[i];
              for (let j = 0; j < group.recordValue.length; j++) {
                const recordValue = group.recordValue[j];
                if (recordValue.Name === 'EffectiveAmount') {
                  effectiveAmountField = recordValue;
                }
                if (recordValue.Name === 'PackageTypeID') {
                  packageTypeField = recordValue;
                }
              }
            }
          }
          const updateEffectiveAmountField = (packageTypes, packageTypeValue, effectiveAmountField) => {
            const packageType = _.find(packageTypes, { ID: +packageTypeValue });
            if (packageType) {
              effectiveAmountField.value = packageType.EffectiveAmount;
              effectiveAmountField.loading = true;
              $timeout(() => {
                effectiveAmountField.loading = false;
              });
            }
          };

          if (effectiveAmountField && packageTypeField) {
            if (contentName === 'PackageTypeID' && packageTypeField.packageTypes) {
              updateEffectiveAmountField(
                packageTypeField.packageTypes,
                value.ComboValueField,
                effectiveAmountField
              )
            }
            else if (contentName === 'JoshID') {
              LeaderMESservice.customAPI('GetPackageTypes', { JoshID: joshIDValue }).then((response) => {
                if (response &&
                  response.ResponseDictionaryDT &&
                  response.ResponseDictionaryDT.PackageTypes) {
                  packageTypeField.packageTypes = response.ResponseDictionaryDT.PackageTypes;
                  let packageTypeValue = packageTypeField.value;
                  if (!packageTypeValue) {
                    packageTypeComboField = _.find(packageTypeField.comboValues, { isDefault: true });
                    if (packageTypeComboField) {
                      packageTypeValue = packageTypeComboField.ComboValueField;
                    }
                  }
                  updateEffectiveAmountField(
                    response.ResponseDictionaryDT.PackageTypes,
                    packageTypeValue,
                    effectiveAmountField
                  )
                }
              });
            }
          }
        };
        var typeLower = type.toLowerCase();
        if (typeLower == "date") {
          if (typeof value === "string" && value != "" && value != null) {
            value = moment(value, userDateFormat || "DD-MM-YYYY HH:mm:ss"); //todo Joe: as khateeb about this, it was with / instead of -
          }
          if (value && value._d && value._d instanceof Date) {
            value = convertDate(value._d);
          } else {
            value = null;
          }
        }
        if (typeLower == "combo") {
          type = "num";
          if (Array.isArray(value)) {
            if (value.length > 0) {
              var tmp = [];
              for (var i = 0; i < value.length; i++) {
                tmp.push(value[i].ComboValueField);
              }
              value = tmp;
            } else {
              value = [];
            }
          } else {
            if (value) {
              value = value.ComboValueField;
            } else {
              value = null;
            }
          }
        }
        if (typeLower == "true/false" || typeLower == "checkbox") {
          if (typeof value === "string") {
            if (value.toLowerCase() == "true") {
              value = 1;
            } else if (value.toLowerCase() == "false") {
              value = 0;
            }
          } else if (value != null) {
            type = "num";
            value = value ? 1 : 0;
          } else {
            return _.remove($scope.changes, function (obj) {
              if (obj.FieldName == contentName) return true;
              return false;
            });
          }
        }

        var keyIndex = -1;
        if (!isSearch) {
          keyIndex = _.findIndex($scope.changes, function (obj) {
            if (obj.hasOwnProperty(op) && obj.FieldName == contentName) return true;
            return false;
          });
        }

        if (value == undefined) {
          value = null;
        }
        if (keyIndex >= 0) {
          $scope.changes[keyIndex][op] = value;
        } else {
          var addNewField = { FieldName: contentName };
          addNewField[op] = value;
          //if (report === true) {
          addNewField["DataType"] = type;
          //}
          $scope.changes.push(addNewField);
        }
        if (childName) {
          _.remove($scope.changes, function (obj) {
            if (obj[op] && obj.FieldName == childName) return true;
            return false;
          });
        }
      };
      $scope.getChanges = function () {
        return $scope.changes;
      };
    };

    var editableTable = function ($scope, formID, FieldNameParent, pairs, LeaderID, skipSaveOperation) {
      var FieldNameLeaderID = "ID";
      var request = { LeaderID: LeaderID, formID: formID };
      if (pairs) {
        request.pairs = pairs;
      }
      $scope.multiformLodaing = true;
      $scope.editableTableData = {
        data: {
          functionCallBack: "rowClicked",
          openNewAppObject: $scope.content.rowClicked,
          selectedDepartmentIds: $scope.selectedDepartmentIds,
          onlyNewTab: true,
          hasCheckbox: false,
          callback: function (success) {
            if (success) {
              $scope.multiformLodaing = false;
            }
          },
        },
        request: request,
      };
      $scope.editableTableNew = [];
      $scope.editableTableRemove = [];
      $scope.editableTableUpdate = [];
      $scope.editableTableReorder = [];

      $scope.cleanDateNAN = function (records) {
        for (var i = 0; i < records.length; i++) {
          if (records[i].pairs) {
            for (var j = 0; j < records[i].pairs.length; j++) {
              if (records[i].pairs[j].DataType == "Date") {
                if ((records[i].pairs[j].Eq && records[i].pairs[j].Eq.indexOf("NaN") !== -1) || !records[i].pairs[j].Eq) {
                  records[i].pairs[j].Eq = "";
                }
              }
            }
          }
        }
        return records;
      };
      $scope.save = function () {
        $localStorage.ganttUnassignedJobsModalWidth = $('.unassigned-jobs .modal-content').width();
        $localStorage.ganttUnassignedJobsModalHeight = $('.unassigned-jobs .modal-content').height();
        if ($scope.editableTableNew == [] && $scope.editableTableRemove == [] && $scope.editableTableUpdate == []) {
          return;
        }
        if ($scope.editableTableSaveInProgress) {
          return;
        }
        $scope.editableTableSaveInProgress = true;
        var dataToSend = {
          TopObjectID: LeaderID,
          formID: formID,
          records: [],
          skipSaveOperation: skipSaveOperation,
        };
        for (var i = 0; i < $scope.editableTableRemove.length; i++) {
          dataToSend.records.push($scope.editableTableRemove[i]);
        }
        for (var i = 0; i < $scope.editableTableUpdate.length; i++) {
          _.remove($scope.editableTableUpdate[i].pairs, function (data) {
            if (data.Eq === undefined) {
              return true;
            }
            return false;
          });
          dataToSend.records.push($scope.editableTableUpdate[i]);
        }
        for (var i = 0; i < $scope.editableTableNew.length; i++) {
          dataToSend.records.push($scope.editableTableNew[i]);
        }
        LeaderMESservice.multiRecordsUpsert(dataToSend).then(function (response) {
          if (response.error != null || response.AllErrors.length > 0) {
            var messageText = "";
            if (response.error != null) {
              messageText = messageText + response.error.ErrorCode + " - " + response.error.ErrorDescription + "\n\n";
              //notify({ message: response.error.ErrorCode + ' - ' + response.error.ErrorDescription, classes: 'alert-danger', templateUrl: 'views/common/notify.html'});
            }
            if (response.AllErrors.length > 0) {
              for (var i = 0; i < response.AllErrors.length; i++) {
                messageText = messageText + response.AllErrors[i] + "\n\n";
                //notify({ message: response.AllErrors[i], classes: 'alert-danger', templateUrl: 'views/common/notify.html'});
              }
            }
            notify({
              message: messageText,
              classes: "alert-danger",
              templateUrl: "views/common/notify.html",
            });
            $scope.editableTableSaveInProgress = false;
            return;
          }
          // notify({
          //   message: $filter("translate")("SAVED_SUCCESSFULLY"),
          //   classes: "alert-success",
          //   templateUrl: "views/common/notify.html",
          // });
          $scope.editableTableNew = [];
          $scope.editableTableRemove = [];
          $scope.editableTableUpdate = [];
          toastr.clear();
          toastr.success("", $filter("translate")("SAVED_SUCCESSFULLY"));
          if ($scope.continuousForm == true) {
            $scope.searchMultiForm();
          } else {
            $scope.emptyPage($scope.pageDisplay);
          }
          $scope.editableTableSaveInProgress = false;
        });
      };

      $scope.updateReorder = function (data) {
        $scope.updateExistingValues("ID", data, "MachineJobOrder");
      };

      $scope.updateExistingValues = function (FieldNamePrimary, object, fieldName, type) {
        var DataType = "num";
        switch (type) {
          case "checkbox":
            DataType = "num";
            break;
          case "combo":
            DataType = "num";
            break;
          case "text":
            DataType = "text";
            break;
          case "Date":
            DataType = "Date";
            break;
          default:
            DataType = "num";
            break;
        }
        if (type === "checkbox") {
          if (object[fieldName] === true) object[fieldName] = 1;
          else object[fieldName] = 0;
        } else if (type === "combo") {
          object[fieldName] = object[fieldName].value;
        }
        // TODO should be changed
        if (object.ID == "") {
          var found = _.find($scope.editableTableNew, {
            Action: "New",
            pairs: [{ FieldName: FieldNamePrimary, Eq: object[FieldNamePrimary], DataType: DataType }],
          });
          if (found) {
            var fieldFound = _.find(found.pairs, { FieldName: fieldName });
            if (fieldFound) {
              fieldFound.Eq = object[fieldName + "Values"] !== undefined ? (object[fieldName + "Values"] ? object[fieldName + "Values"].ComboValueField : "0") : object[fieldName];
              return;
            }
            found.pairs.push({
              FieldName: fieldName,
              Eq: object[fieldName + "Values"] !== undefined ? (object[fieldName + "Values"] ? object[fieldName + "Values"].ComboValueField : "0") : object[fieldName],
              DataType: DataType,
            });
          }
          return;
        }
        var found = _.find($scope.editableTableUpdate, {
          Action: "Update",
          pairs: [{ FieldName: FieldNameLeaderID, Eq: object[FieldNameLeaderID], DataType: "num" }],
        });

        if (found) {
          var fieldFound = _.find(found.pairs, { FieldName: fieldName });
          if (fieldFound) {
            fieldFound.Eq = object[fieldName + "Values"] !== undefined ? (object[fieldName + "Values"] ? object[fieldName + "Values"].ComboValueField : "0") : object[fieldName];
            return;
          }
          found.pairs.push({
            FieldName: fieldName,
            Eq: object[fieldName + "Values"] !== undefined ? (object[fieldName + "Values"] ? object[fieldName + "Values"].ComboValueField : "0") : object[fieldName],
            DataType: DataType,
          });
          return;
        }
        var field = {
          Action: "Update",
          pairs: [],
        };
        field.pairs.push({
          FieldName: FieldNameLeaderID,
          Eq: object[FieldNameLeaderID],
          DataType: "num",
        });
        if (FieldNameLeaderID != fieldName) {
          field.pairs.push({
            FieldName: fieldName,
            Eq: object[fieldName + "Values"] !== undefined ? (object[fieldName + "Values"] ? object[fieldName + "Values"].ComboValueField : "0") : object[fieldName],
            DataType: DataType,
          });
        }
        $scope.editableTableUpdate.push(field);
      };

      $scope.removeValue = function (FieldName, object, hasCheckBox) {
        if (object.multiFormNewRow) {
          _.remove($scope.editableTableNew, {
            Action: "New",
            pairs: [
              {
                uiIndex: object.multiFormIndex,
              },
            ],
          });
          return;
        } else if (hasCheckBox) {
          _.remove($scope.editableTableUpdate, {
            Action: "Update",
            pairs: [{ FieldName: FieldName, Eq: object[FieldName] }],
          });
          return;
        }
        var field = {
          Action: "Delete",
          pairs: [
            {
              FieldName: FieldNameLeaderID,
              Eq: object.ID,
              DataType: "num",
              uiIndex: object.multiFormIndex,
            },
          ],
        };
        _.remove($scope.editableTableUpdate, {
          Action: "Update",
          pairs: [{ FieldName: FieldNameLeaderID, Eq: object[FieldNameLeaderID] }],
        });
        $scope.editableTableRemove.push(field);
      };

      var getTargetParameters = function (FieldNameParent) {
        if ($scope.content.targetParameters) {
          return $scope.content.targetParameters[FieldNameParent] ? $scope.content.targetParameters[FieldNameParent] : $scope.content.ID;
        } else {
          return $scope.content.ID;
        }
      };

      $scope.newValue = function (FieldName, object, value, type, rowValues) {
        if (FieldNameParent == FieldName) {
          return;
        }
        if ($scope.editableTableNew.length > 0) {
          var row = _.find($scope.editableTableNew, {
            Action: "New",
            pairs: [
              {
                uiIndex: object.multiFormIndex,
              },
            ],
          });
          if (row) {
            var fieldData = _.find(row.pairs, { FieldName: FieldName });
            if (fieldData) {
              fieldData.Eq = value;
            } else {
              row.pairs.push({
                FieldName: FieldName,
                Eq: value,
                DataType: type,
              });
            }
            return;
          }
        }
        var pair = {
          Action: "New",
          pairs: [
            {
              FieldName: FieldName,
              Eq: value,
              DataType: type,
              uiIndex: object.multiFormIndex,
            },
          ],
        };
        if (FieldName != FieldNameLeaderID) {
          pair.pairs.push({
            FieldName: FieldNameLeaderID,
            Eq: 0,
            DataType: "num",
          });
        }
        if (FieldNameParent) {
          pair.pairs.push({
            FieldName: FieldNameParent,
            Eq: getTargetParameters(FieldNameParent),
            DataType: "num",
          });
        }
        for (var key in rowValues) {
          if (key != FieldName && key != FieldNameLeaderID) {
            pair.pairs.push({
              FieldName: key,
              Eq: rowValues,
              DataType: "num",
            });
          }
        }

        $scope.editableTableNew.push(pair);
      };
    };

    var searchResults = function ($scope, reportID, targetParameters, functionCallBack, onlyNewTab, returnValue, openSearchInNewTab, title) {
      $scope.searchResultsRequest = {
        data: {
          functionCallBack: functionCallBack,
          onlyNewTab: onlyNewTab,
          returnValue: returnValue,
          openSearchInNewTab: openSearchInNewTab,
          reportTitle: title,
        },
        request: {
          reportID: reportID,
          sfCriteria: targetParameters,
        },
        api: "GetResultSearchFields",
      };
    };
    var formResults = function ($scope, request, responseRequest, API, pairs, generalTab, wizardForm, actionCtrl) {
      if (generalTab === true) {
        $scope.showActions = false;
      }
      request.pairs = pairs;
      $scope.loadingForm = true;
      LeaderMESservice.customAPI(API, request).then(function (res) {
        if (res.error == null || (res.error != null && res.error.ErrorCode != null)) {
          if (res.CurrentFormID && res.CurrentFormID != null) {
            responseRequest.formID = res.CurrentFormID;
          }
          $scope.groups = res.groupData;
          $scope.formResults = res.recordValue;
          if ($scope.formID == 0) {
            $scope.formID = res.CurrentFormID;
          }
          $scope.formResults = _.sortBy($scope.formResults, "DisplayOrder");
          var length = $scope.formResults.length;
          if ($scope.groups != null) {
            for (var i = 0; i < $scope.groups.length; i++) {
              $scope.groups[i].recordValue = [];
              $scope.groups[i].menuId = request.formID;
              if ($scope.tabs) {
                $scope.groups[i].subMenuAppPartId = $scope.tabs[$scope.pageDisplay - 1].SubMenuAppPartID;
              } else if ($scope.content && $scope.content.SubMenuAppPartID) {
                $scope.groups[i].subMenuAppPartId = $scope.content.SubMenuAppPartID;
              }
            }
          }
          $scope.recordValue = [];
          for (var i = 0; i < length; i++) {
            $scope.formResults[i].index = i;
            if ($scope.formResults[i].DisplayType == 6) {
              if ($scope.formResults[i].value == "" || $scope.formResults[i].value == null) {
                $scope.formResults[i].value = null;
              } else {
                $scope.formResults[i].value = parseFloat($scope.formResults[i].value);
                if ($scope.formResults[i].DecimalPoint != null) {
                  $scope.formResults[i].value = parseFloat($scope.formResults[i].value.toFixed($scope.formResults[i].DecimalPoint));
                }
              }
            } else if ($scope.formResults[i].DisplayType == 7) {
              if ($scope.formResults[i].value !== null && $scope.formResults[i].value != "") {
                var fullDateTmp = $scope.formResults[i].value.split(" ");
                var dateTmp = fullDateTmp[0].split("/");
                var newDate = dateTmp[2] + "/" + dateTmp[1] + "/" + dateTmp[0] + " " + fullDateTmp[1];
                $scope.formResults[i].value = newDate;
              }
            } else if ($scope.formResults[i].DisplayType == 16) {
              var fileType = _.find($scope.formResults, { Name: "FileTypeID" });
              if (fileType) {
                if (fileType.value == "" || fileType.value == null) {
                  $scope.formResults[i].fileType = "General";
                } else {
                  var type = _.find(fileType.comboValues, { ComboValueField: parseInt(fileType.value) });
                  if (type) {
                    $scope.formResults[i].fileType = type.ComboQueryEField;
                  } else {
                    $scope.formResults[i].fileType = "General";
                  }
                }
              } else {
                $scope.formResults[i].fileType = "General";
              }
            } else if ($scope.formResults[i].DisplayType == 12) {
              if ($scope.formResults[i].value == "") {
                $scope.allowFileUpload = true;
              } else {
                $scope.allowFileUpload = false;
              }
              continue;
            }
            if ($scope.formResults[i].GroupID !== null) {
              var group = _.find($scope.groups, { Key: $scope.formResults[i].GroupID });
              if (group) {
                group.recordValue.push($scope.formResults[i]);
              }
            } else {
              $scope.recordValue.push($scope.formResults[i]);
            }
          }
          if (generalTab === true) {
            for (var key in $scope.actionsData.params) {
              if (key === "UserID") {
                $scope.actionsData.params[key] = LeaderMESservice.getUserID();
                continue;
              }
              var field = _.find($scope.recordValue, { Name: key });
              if (field) {
                $scope.actionsData.params[key] = field.value;
                if (typeof $scope.actionsData.params[key] == "number") {
                  $scope.actionsData.params[key] = parseInt($scope.actionsData.params[key]);
                }
                continue;
              }
              for (var i = 0; i < $scope.groups.length; i++) {
                var group = $scope.groups[i];
                field = _.find(group.recordValue, { Name: key });
                if (field) {
                  $scope.actionsData.params[key] = field.value;
                  if (typeof $scope.actionsData.params[key] == "number") {
                    $scope.actionsData.params[key] = parseInt($scope.actionsData.params[key]);
                  }
                  break;
                }
              }
            }
            if ($scope.actionsData.actions.length > 0) {
              $scope.showActions = true;
            }
            if ($scope.initTabs) {
              $scope.initTabs();
            }
          }
          if (actionCtrl) {
            actionCtrl.loading = false;
          }
        } else {
          notify({
            message: res.error.ErrorCode + " - " + res.error.ErrorDescription,
            classes: "alert-danger",
            templateUrl: "views/common/notify.html",
          });
        }
        $scope.loadingForm = false;
      });

      $scope.saveForm = function () {       

    if(($scope.IsNextButonCLick ||$scope.IsSaveButonCLick) && responseRequest.LeaderID===0){      
      responseRequest.LeaderID=$scope.newRecordId===undefined?0:$scope.newRecordId;
    }
        if ($scope.buttonDisabled) {
          return;
        }
        $scope.buttonDisabled = true;
        if ($scope.actionName == "ADD") {
          $scope.add();
          return;
        }
        responseRequest.pairs = $scope.getChanges();
        //if (actionCtrl && actionCtrl.targetLeaderID === 0 && pairs){
        //    for (var i = 0 ; i < pairs.length ; i++){
        //        var found = _.find(responseRequest.pairs,{FieldName : pairs[i].FieldName });
        //        if (!found) {
        //            responseRequest.pairs.push(pairs[i]);
        //        }
        //    }
        //}
        LeaderMESservice.InsertRecordByForm(responseRequest, true).then(
          function (response) {
            $scope.NewRecordID = response.NewRecordID;
            if (response.PreAction.length !== 0 || response.PostAction.length !== 0) {
              for (var i = 0; i < response.PreAction.length; i++) {
                notify({
                  message: response.PreAction[i].Value,
                  classes: "alert-danger",
                  templateUrl: "views/common/notify.html",
                });
              }
              for (var i = 0; i < response.PostAction.length; i++) {
                notify({
                  message: response.PostAction[i].Value,
                  classes: "alert-danger",
                  templateUrl: "views/common/notify.html",
                });
              }
            } else if (response.error !== null) {
              //   $scope.emptyPage($scope.pageDisplay);
              notify({
                message: response.error.ErrorCode + " - " + response.error.ErrorDescription,
                classes: "alert-danger",
                templateUrl: "views/common/notify.html",
              });
            } else if (actionCtrl) {
              if (response.NewRecordID !== 0) {
                actionCtrl.targetLeaderID = response.NewRecordID;
              }
              if (actionCtrl.formSteps[actionCtrl.currentForm - 1].isLastStep === true) {
                if (response.error != null) {
                  notify({
                    message: response.error,
                    classes: "alert-danger",
                    templateUrl: "views/common/notify.html",
                  });
                } else if (actionCtrl.targetLeaderID > 0) {
                  if ($scope.content.parentScope && $scope.content.parentScope.calendarPairs && $scope.content.parentScope.calendarCallBackFucntion) {
                    $scope.content.parentScope.calendarCallBackFucntion(responseRequest.pairs, actionCtrl.targetLeaderID);
                    toastr.clear();
                    toastr.success("", $filter("translate")("SAVED_SUCCESSFULLY"));
                    actionCtrl.close();
                    return;
                  }
                  if (actionCtrl.actionItem && actionCtrl.actionItem.updateData) {
                    console.log("dataUpdated");
                    actionCtrl.actionItem.updateData();
                  }
                  actionCtrl.openNewTab();
                  LeaderMESservice.refreshPage($scope.content.parentScope, 0, true);
                  actionCtrl.close();
                } else {
                  if ($scope.content.parentScope && $scope.content.parentScope.calendarPairs && $scope.content.parentScope.calendarCallBackFucntion) {
                    $scope.content.parentScope.calendarCallBackFucntion(responseRequest.pairs, actionCtrl.targetLeaderID);
                    toastr.clear();
                    toastr.success("", $filter("translate")("SAVED_SUCCESSFULLY"));
                    actionCtrl.close();
                    return;
                  }
                  if (actionCtrl.actionItem && actionCtrl.actionItem.updateData) {
                    console.log("dataUpdated");
                    actionCtrl.actionItem.updateData();
                  }
                  toastr.clear();
                  toastr.success("", $filter("translate")("SAVED_SUCCESSFULLY"));
                  LeaderMESservice.refreshPage($scope.content.parentScope, 0, true);
                  actionCtrl.close();
                }
              } else {
                actionCtrl.DisplayFormResultsSteps(actionCtrl.currentForm, responseRequest.pairs);
              }
            } else {
              //clear previous toastr to prevent multiple notifications
              toastr.clear();
              toastr.success("", $filter("translate")("SAVED_SUCCESSFULLY"));
              $scope.emptyPage($scope.pageDisplay);
              $scope.formResults = null;
              $scope.recordValue = null;
              //     $scope.groups = null;
            }
            $scope.buttonDisabled = false;
          },
          function (error) {
            $scope.buttonDisabled = false;
          }
        );
      };
    };

    var newObjectFields = function ($scope, formID) {
      LeaderMESservice.getDisplayNewObjectFields({ formID: formID }).then(function (response) {
        if (response.PreAction.length !== 0) {
          for (var i = 0; i < response.PreAction.length; i++) {
            notify({
              message: response.PreAction[i].Value,
              classes: "alert-danger",
              templateUrl: "views/common/notify.html",
            });
          }
          return;
        } else if (response.error !== null) {
          //   $scope.emptyPage($scope.pageDisplay);
          notify({
            message: response.error.ErrorCode + " - " + response.error.ErrorCode.ErrorDescription,
            classes: "alert-danger",
            templateUrl: "views/common/notify.html",
          });
          return;
        }
        if (response && response.error === null) {
          $scope.newObjectFieldsValues = response.recordValue;
          $scope.newObjectFieldsValues = _.sortBy($scope.newObjectFieldsValues, "DisplayOrder");
        }
      });
    };

    var wizard = function ($scope, actionItem, scopeID) {
      var actionModalInstance = $modal.open({
        templateUrl: "views/common/actions/customActionModal.html",
        resolve: {
          ID: function () {
            return scopeID;
          },
          targetParameters: function () {
            if ($scope.treeGraph) {
              return actionItem.ObjectParameters;
            }
            return $scope.content.targetParameters;
          },
          parentScope: function () {
            return $scope;
          },
        },
        controller: function ($scope, $compile, $modalInstance, $timeout, commonFunctions, $state, ID, targetParameters, parentScope) {
          var actionModalInstanceCtrl = this;
          actionModalInstanceCtrl.loading = true;
          actionModalInstanceCtrl.actionItem = actionItem;
          actionModalInstanceCtrl.currentForm = 0;
          actionModalInstanceCtrl.template = "views/common/formAction.html";
          actionModalInstanceCtrl.targetLeaderID = 0;
          actionModalInstanceCtrl.rtl = LeaderMESservice.isLanguageRTL();
          $scope.localLanguage = LeaderMESservice.showLocalLanguage();
          $scope.actionModalInstanceCtrl = actionModalInstanceCtrl;
          $scope.wizard = true;

          $scope.content = {
            SubMenuAppPartID: actionItem.SubMenuAppPartID,
            parentScope: parentScope,
          };

          if (actionItem.LeaderIDTargetParameter) {
            actionModalInstanceCtrl.targetLeaderID = targetParameters[actionItem.LeaderIDTargetParameter];
          }

          var getTargetParameters = function () {
            if (actionItem.SubMenuTargetParameters) {
              var targetParameter = actionItem.SubMenuTargetParameters.split("=");
              if (targetParameters) {
                targetParameter[1] = targetParameter[1].slice(1, -1);
                if (parentScope.treeGraph) {
                  return {
                    FieldName: targetParameter[0],
                    Eq: targetParameters[targetParameter[1]] ? parseInt(targetParameters[targetParameter[1]].FieldValue) : ID,
                    DataType: "num",
                  };
                }
                var result = {
                  FieldName: targetParameter[0],
                  Eq: targetParameters[targetParameter[1]] ? targetParameters[targetParameter[1]] : ID,
                  DataType: "num",
                };
                return result;
              } else {
                return {
                  FieldName: targetParameter[0],
                  Eq: ID,
                  DataType: "num",
                };
              }
            } else if (actionItem.newTargetParameters) {
              return actionItem.newTargetParameters;
            }
          };


          //new 
          $scope.SkipSaveOperation = actionItem.SkipSaveOperation;

          var targetParameters = getTargetParameters();
          var pairs = [];
          if (targetParameters != null) {
            pairs.push(targetParameters);
          }
          if (parentScope.calendarPairs) {
            pairs = pairs.concat(parentScope.calendarPairs);
          }


          $scope.pairs = pairs;

          actionModalInstanceCtrl.DisplayFormResultsStepsPrev = function () {
            actionModalInstanceCtrl.loading = true;
            actionModalInstanceCtrl.currentForm = actionModalInstanceCtrl.currentForm - 2;
            //actionModalInstanceCtrl.DisplayFormResultsSteps(actionModalInstanceCtrl.currentForm);
          };

          actionModalInstanceCtrl.DisplayFormResultsSteps = function (stepIndex, previousPairs) {
            actionModalInstanceCtrl.loading = true;
            $timeout(function () {
              $scope.actionName = "NEXT";
              if (actionModalInstanceCtrl.formSteps[stepIndex].isLastStep == true) {
                $scope.actionName = "FINISH";
              }
              $scope.formId = actionModalInstanceCtrl.formSteps[stepIndex].NextFormID;
              $scope.SkipSaveOperation = actionItem.SkipSaveOperation;
              var request = {
                LeaderID: actionModalInstanceCtrl.targetLeaderID,
                formID: actionModalInstanceCtrl.formSteps[stepIndex].NextFormID,
              };
              var requestResponse = {
                LeaderID: actionModalInstanceCtrl.targetLeaderID,
                formID: actionModalInstanceCtrl.formSteps[stepIndex].NextFormID,
                skipSaveOperation: actionItem.SkipSaveOperation,
              };
              $scope.SkipSaveOperation = actionItem.SkipSaveOperation;


              if (parentScope.calendarPairs) {
                pairs = pairs.concat(parentScope.calendarPairs);
              }
              if (previousPairs) {
                for (var i = 0; i < previousPairs.length; i++) {
                  var found = _.find(pairs, { FieldName: previousPairs[i].FieldName });
                  if (!found) {
                    pairs.push(previousPairs[i]);
                  }
                }
              }

              $scope.pairs = pairs;
              $scope.closeModal = function () {
                $modalInstance.close();
              }
              //formResults($scope, request, requestResponse, "DisplayFormResults", pairs, false, true, actionModalInstanceCtrl);
              actionModalInstanceCtrl.currentForm++;
              actionModalInstanceCtrl.loading = false;
            }, 1000);
          };

          fieldChanges($scope);
          $scope.changes = [];
          $scope.formCallBack = function () {
            $scope.saveForm();
          };

          actionModalInstanceCtrl.openNewTab = function () {
            toastr.clear();
            toastr.success("", $filter("translate")("SAVED_SUCCESSFULLY"));
            if (actionModalInstanceCtrl.targetAppObject !== "") {
              var url = $state.href("appObjectFullView", {
                appObjectName: actionModalInstanceCtrl.targetAppObject,
                ID: actionModalInstanceCtrl.targetLeaderID,
              });
              window.open(url, "_blank");
            }
          };

          actionModalInstanceCtrl.close = function () {
            $modalInstance.close();
          };

          $scope.wizardid = actionItem.SubMenuExtID;
          LeaderMESservice.customAPI("GetWizardDetails", { WizardID: actionItem.SubMenuExtID }).then(function (response) {

            //sami deleted for react
            actionModalInstanceCtrl.title = $scope.localLanguage ? response.LName : response.EName;
            actionModalInstanceCtrl.formSteps = response.steps;
            actionModalInstanceCtrl.targetAppObject = response.TargetAppObject;
            actionModalInstanceCtrl.DisplayFormResultsSteps(actionModalInstanceCtrl.currentForm);
          });
        },
        controllerAs: "actionModalInstanceCtrl",
      });
    };

    var notification = function ($scope, actionItem, targetParameters, isAction) {
      LeaderMESservice.actionAPI(actionItem.PreActionFunction, targetParameters).then(
        function (response) {
          if (response.error == null) {
            toastr.clear();
            toastr.success($scope.getName(actionItem), "ACTION_SUCCEEDED");
            LeaderMESservice.refreshPage($scope, 0, isAction);
            if (actionItem.updateData) {
              console.log("dataUpdated");
              actionItem.updateData();
            }
          } else {
            toastr.clear();
            toastr.error(response.error.ErrorMessage, "Failed :" + response.error.ErrorCode);
          }
          if ($scope.disableButton) {
            $scope.disableButton = false;
          }
        },
        function () {
          if ($scope.disableButton) {
            $scope.disableButton = false;
          }
        }
      );
    };

    var modalDialog = function ($scope, actionItem, targetParameters, finishCallback) {
      var currentDisplay;
      if ($scope.content.parentScope) {
        currentDisplay = $scope.content.parentScope.pageDisplay;
        $scope.content.parentScope.pageDisplay = 0;
      }
      LeaderMESservice.actionAPI(actionItem.PreActionFunction, targetParameters).then(
        function (response) {
          if ($scope.content.parentScope) {
            $scope.content.parentScope.pageDisplay = currentDisplay;
          }
          if (response.error === null) {
            SweetAlert.swal({
              title: $filter("translate")("ACTION_SUCCEEDED"),
              text: $scope.getName(actionItem),
            });
            if (actionItem.CloseObjAfterAction) {
              $scope.content.parentScope.pageDisplay = 0;
              $timeout(() => {
                window.close();
              }, 1000);
              return;
            }
            if (response.LeaderRecordID > 0) {
              $scope.content.rowClicked(response.LeaderRecordID, $scope.content.linkItem, "ID");
            } else {
              LeaderMESservice.refreshPage($scope, response.LeaderRecordID, true);
            }
            if (actionItem.updateData) {
              console.log("dataUpdated");
              actionItem.updateData();
            }
          } else {
            SweetAlert.swal({
              title: $filter("translate")("ACTION_FAILED"),
              text: response.error.ErrorMessage + " (" + response.error.ErrorCode + ")",
            });
          }
          finishCallback();
        },
        function (error) {
          finishCallback();
        }
      );
    };

    var continuousForm = function ($scope, formID, FieldNameParent, pairs, LeaderID, skipSaveOperation) {
      $scope.dataLoaded = false;
      $scope.searchBoxFields = [];
      LeaderMESservice.getDisplayFormResults({ LeaderID: 0, formID: formID }).then(function (response) {
        if (response.error === null && response.AllrecordValue.length > 0) {
          for (var i = 0; i < response.AllrecordValue[0].length; i++) {
            if (response.AllrecordValue[0][i].ShowInCriteria === true) {
              $scope.searchBoxFields.push(response.AllrecordValue[0][i]);
              response.AllrecordValue[0][i].AllowEntry = true;
              response.AllrecordValue[0][i].MandatoryField = false;
              if (response.AllrecordValue[0][i].value !== null && response.AllrecordValue[0][i].value !== "") {
                $scope.changes.push({
                  FieldName: response.AllrecordValue[0][i].Name,
                  Eq: response.AllrecordValue[0][i].value.toString(),
                  DataType: response.AllrecordValue[0][i].DisplayTypeName,
                });
              }
            }
          }
        }
      });

      $scope.searchMultiForm = function () {
        $scope.dataLoaded = false;
        $timeout(function () {
          var newPairs = pairs.concat($scope.changes);
          editableTable($scope, formID, FieldNameParent, newPairs, 0, skipSaveOperation);
          $scope.dataLoaded = true;
        }, 100);
      };
    };

    var searchParent = function (scope, functionName) {
      for (var i = 0; i < 15; i++) {
        if (scope[functionName] !== undefined) {
          return scope[functionName];
        }
        if (!scope || !scope.$parent) {
          break;
        }
        if (scope && scope.$parent) {
          scope = scope.$parent;
        }
      }
      console.log(`function ${functionName} not found`);
      return null;
    };

    var formInModal = ($scope, formName, formId, leaderId) => {
      var actionModalInstance = $modal.open({
        templateUrl: "views/common/formInModal.html",
        resolve: {
          ID: function () {
            return leaderId;
          },
          formId: function () {
            return formId;
          },
          formName: function () {
            return formName;
          },
          parentScope: function () {
            return $scope;
          },
        },
        controller: function ($scope, $modalInstance, commonFunctions, $state, ID, formId, formName, parentScope) {
          var formInModalCtrl = this;
          commonFunctions.fieldChanges($scope);
          $scope.formName = formName;
          $scope.changes = [];
          $scope.recordValue = [];

          $scope.formCallBack = function () {
            $scope.emptyPage();
          };
          $scope.ID = ID;
          const request = {
            "LeaderID": ID,
            "formID": formId,
          }
          const requestResponse = {
            "LeaderID": ID,
            "formID": formId,
          }

          $scope.formId = formId;
          $scope.leaderId = ID;
          $scope.pairs = [];
          $scope.actionName = "SAVE_CHANGES";
          $scope.alwaysShowFooter = true;
          $scope.request = request;
          $scope.SkipSaveOperation = false;
          $scope.api = 'DisplayFormResults'
          $scope.fullSize = false;
          $scope.loading = false;
          $scope.cancelButton = true;
          $scope.modalClose = () => {
            $scope.emptyPage();
          };
  
          $scope.changes = [];

          // commonFunctions.formResults($scope, request, requestResponse, "DisplayFormResults", [], false);

          $scope.emptyPage = function () {
            if (parentScope.successCallback) {
              parentScope.successCallback();
            }
            $timeout(() => {
              $modalInstance.close();
            }, 500);
          };

          $scope.close = () => {
            $modalInstance.close();
          };
        },
        controllerAs: "formInModalCtrl",
      });
    };

    return {
      commonCodeSearch: commonCodeSearch,
      commonCodeNew: commonCodeNew,
      fieldChanges: fieldChanges,
      editableTable: editableTable,
      searchResults: searchResults,
      formResults: formResults,
      newObjectFields: newObjectFields,
      wizard: wizard,
      notification: notification,
      modalDialog: modalDialog,
      commonCodeObjectFullView: commonCodeObjectFullView,
      continuousForm: continuousForm,
      searchParent: searchParent,
      formInModal: formInModal,
    };
  })
  .factory("BreadCrumbsService", function () {
    var data = [];
    return {
      push: function (item, id, callback) {
        if (_.find(data, { id: id })) {
          return;
        }
        data.push({
          click: id,
          label: item,
          callback: callback,
        });
      },
      get: function (id) {
        return _.find(data, { click: id });
      },
      getAll: function () {
        return data;
      },
      init: function () {
        data = [];
      },
      breadCrumbChange: function (click) {
        return _.remove(data, function (n) {
          return n.click > click;
        });
      },
    };
  })
  .factory("ExpandedMachinesService", function ($sessionStorage, LeaderMESservice) {
    /**
     * Initial Check
     * Checks if initial session storage was empty, then, create new session object for Exapnded Machines
     */
    if (!$sessionStorage.machinesExpandedData) {
      $sessionStorage.machinesExpandedData = [];
    }

    /**
     * Initial structure for array of params
     */
    var initialStructure = {
      params: [
        {
          FieldName: "TimeLeftHour",
          FieldLName: "Time Left (Hours)",
          FieldEName: "Time Left (Hours)",
        },
        {
          FieldName: "CavitiesCurrent",
          FieldLName: "יחידות במחזור",
          FieldEName: "Cycle Units",
        },
        {
          FieldName: "RejectsTotal",
          FieldLName: "מספר פסולים",
          FieldEName: "Rejects",
        },
      ],
      staticField1: {
        FieldName: "CycleTime",
        FieldLName: "זמן מחזור ממוצע (רבע שעה)",
        FieldEName: "Cycle Time (15Min.)",
      },
      staticField2: {
        FieldName: "Job Progress",
        FieldLName: "Job Progress",
        FieldEName: "Job Progress",
        visibility: true,
      },
      staticField3: {
        FieldName: "Josh Progress",
        FieldLName: "Josh Progress",
        FieldEName: "Josh Progress",
        visibility: true,
      },
      staticField4: {
        FieldName: "Product",
        FieldLName: "ProductLName",
        FieldEName: "ProductEName",
        visibility: true,
        translate: "PRODUCT",
        type: 1,
      },
    };

    var initialMachineStructure = {
      params: [
        {
          FieldName: "TimeLeftHour",
          FieldLName: "Time Left (Hours)",
          FieldEName: "Time Left (Hours)",
        },
        {
          FieldName: "CavitiesCurrent",
          FieldLName: "יחידות במחזור",
          FieldEName: "Cycle Units",
        },
        {
          FieldName: "RejectsTotal",
          FieldLName: "מספר פסולים",
          FieldEName: "Rejects",
        },
        {
          FieldName: "CavitiesCurrent",
          FieldLName: "יחידות במחזור",
          FieldEName: "Cycle Units",
        },
        {
          FieldName: "RejectsTotal",
          FieldLName: "מספר פסולים",
          FieldEName: "Rejects",
        },
      ],
      staticField1: {
        FieldName: "CycleTime",
        FieldLName: "זמן מחזור ממוצע (רבע שעה)",
        FieldEName: "Cycle Time (15Min.)",
        visibility: true,
      },
      staticField2: {
        FieldName: "Job Progress",
        FieldLName: "Job Progress",
        FieldEName: "Job Progress",
        visibility: true,
      },
      staticField3: {
        FieldName: "Josh Progress",
        FieldLName: "Josh Progress",
        FieldEName: "Josh Progress",
        visibility: true,
      },
    };

    var getInitialStructure = function () {
      return angular.copy(initialStructure);
    };

    var getInitialMachineStructure = function () {
      return angular.copy(initialMachineStructure);
    };

    var getInitialStructureParams = function () {
      return angular.copy(initialStructure.params);
    };

    /**
     * Get expanded machine data by machine id
     * @param machineId - machine id
     */
    var getDataByMachineId = function (machineId, typeID) {
      var machineObject = _.find($sessionStorage.machinesExpandedData, { id: machineId });
      if (machineObject) {
        if (!machineObject.typeID) {
          machineObject.typeID = typeID;
        }
        return machineObject.data;
      }
      var newItem = {
        id: machineId,
        typeID: typeID,
        data: angular.copy(initialStructure),
      };

      $sessionStorage.machinesExpandedData.push(newItem);
      return newItem.data;
    };

    var updateVisibilityForStaticFields = function (updating, machineType, field) {
      $sessionStorage.machinesExpandedData.forEach(function (machineObject) {
        if (machineType == machineObject.typeID) {
          if (machineObject.data[field]) {
            machineObject.data[field].visibility = updating;
          }
        }
      });
    };

    /**
     * Callback of updating static field of machinebox
     * @param {} machineId - machine id
     * @param {*} chosenParam - new updated static field
     * @param {*} applyAll - if apply all is true, update should apply to all machine boxes in the view
     */
    var updateStaticField = function (machineId, chosenParam, applyAll, machineType, field) {
      if (applyAll) {
        $sessionStorage.machinesExpandedData.forEach(function (machineObject) {
          if (machineType == machineObject.typeID) {
            machineObject.data[field] = {
              FieldName: chosenParam.FieldName,
              FieldEName: chosenParam.FieldEName,
              FieldLName: chosenParam.FieldLName,
              visibility: true,
            };
          }
        });
      } else {
        var machineObject = _.find($sessionStorage.machinesExpandedData, { id: machineId });
        if (machineObject) {
          machineObject.data[field] = {
            FieldName: chosenParam.FieldName,
          };
        }
      }
    };

    /**
     * Callback of updating one of the array of machinebox params
     * @param {*} machineId - machine id
     * @param {*} param - new updated param
     * @param {*} applyAll - if apply all is true, update should apply to all machine boxes in the view
     * @param {*} index - index of the updated param in the array of params
     */
    var updateParams = function (machineId, param, applyAll, index, machineType) {
      var machineObject = _.find($sessionStorage.machinesExpandedData, { id: machineId });
      if (applyAll) {
        $sessionStorage.machinesExpandedData.forEach(function (machineObject) {
          if (machineType == machineObject.typeID) {
            machineObject.data.params[index] = {
              FieldName: param.FieldName,
            };
          }
        });
      } else if (index >= 0) {
        machineObject.data.params[index] = {
          FieldName: param.FieldName,
        };
      }
    };

    var addNewParams = function () {
      for (var i = 0; i < $sessionStorage.machinesExpandedData.length; i++) {
        var oldParams = $sessionStorage.machinesExpandedData[i].data.params;
        var newParams = angular.copy(initialStructure.params);
        $sessionStorage.machinesExpandedData[i].data.params = oldParams.concat(newParams);
      }
    };

    var removeParams = function () {
      for (var i = 0; i < $sessionStorage.machinesExpandedData.length; i++) {
        $sessionStorage.machinesExpandedData[i].data.params = $sessionStorage.machinesExpandedData[i].data.params.splice(0, 3);
      }
    };

    var resetStructure = function () {
      for (var i = 0; i < $sessionStorage.machinesExpandedData.length; i++) {
        $sessionStorage.machinesExpandedData[i].data.staticField1 = angular.copy(initialStructure.staticField1);
        $sessionStorage.machinesExpandedData[i].data.staticField2 = angular.copy(initialStructure.staticField2);
        $sessionStorage.machinesExpandedData[i].data.staticField3 = angular.copy(initialStructure.staticField3);
        $sessionStorage.machinesExpandedData[i].data.params = angular.copy(initialStructure.params);
      }
    };

    return {
      updateVisibilityForStaticFields: updateVisibilityForStaticFields,
      getDataByMachineId: getDataByMachineId,
      updateStaticField: updateStaticField,
      updateParams: updateParams,
      addNewParams: addNewParams,
      removeParams: removeParams,
      resetStructure: resetStructure,
      getInitialStructure: getInitialStructure,
      getInitialStructureParams: getInitialStructureParams,
      getInitialMachineStructure: getInitialMachineStructure,
    };
  })
  .factory("googleAnalyticsService", function (GOOGLE_ANALYTICS, $state) {
    var gaEvent = function (screen, eventName) {
      gtag("event", screen + "_" + eventName);
    };

    var gaPV = function (pageTile) {
      gtag("config", GOOGLE_ANALYTICS.tracking_id, {
        page_title: pageTile,
        page_path: pageTile,
      });
    };

    return {
      gaEvent: gaEvent,
      gaPV: gaPV,
    };
  });
