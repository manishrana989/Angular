function MainCtrl($scope, LeaderMESservice, AuthService, $state, $rootScope, COPYRIGHT, 
  commonFunctions, GLOBAL, SETTINGS_ICON, $modal, $sce, configuration, shiftService, 
  $timeout, $sessionStorage, $translate, $filter, notify, $interval, TASKS, Upload, BASE_URL, customServices) {
  var mainCtrl = this;
  this.settingsData = SETTINGS_ICON;
  mainCtrl.userAuth = $sessionStorage.userAuthenticated;

  configuration.getSpecific("main", "sideMenuImage").then(function (data) {
    mainCtrl.sideBarImage = data;
  });

  $translate.refresh();

  $scope.rootScope = $rootScope;

  $scope.loading = true;

  $scope.menuAndSubMenu = null;

  $rootScope.showMainColor = true;

  $scope.settings = { saveEditTaskDisabled: false };

  $scope.menuSearchText = { value: '', status: false };

  // notify.config({ duration: 2000 });

  // $sessionStorage.mainMenu
  //$sessionStorage.tabsMenu

  if ($sessionStorage.language !== "eng" && $sessionStorage.language !== "heb") {
    $sessionStorage.tabsMenu.forEach(function (menu) {
      menu.TopMenuENameTemp = menu.TopMenuEName;
      menu.TopMenuEName = menu.TopMenuLName;
      menu.Actions.forEach(function (action) {
        action.SubMenuENameTemp = action.SubMenuLName;
        action.SubMenuEName = action.SubMenuLName;
      });
      menu.subMenu.forEach(function (action) {
        action.SubMenuENameTemp = action.SubMenuLName;
        action.SubMenuEName = action.SubMenuLName;
      });
    });
    $sessionStorage.mainMenu.forEach(function (menu) {
      menu.TopMenuENameTemp = menu.TopMenuEName;
      menu.TopMenuEName = menu.TopMenuLName;
      menu.subMenu.forEach(function (action) {
        action.SubMenuENameTemp = action.SubMenuLName;
        action.SubMenuEName = action.SubMenuLName;
      });
    });
  }

  $scope.copyRight = COPYRIGHT.YEAR;

  $scope.knowledgeBaseUrl = GLOBAL.knowledgeBaseUrl[LeaderMESservice.getLanguage()];
  $scope.containers = shiftService.containers;
  $scope.shiftData = shiftService.shiftData;

  LeaderMESservice.customGetAPI("GetDashboardStructure").then(function (response) {
    if (response.GeneralStructure) {
      var tempContainers = JSON.parse(response.GeneralStructure);
      if (tempContainers && !shiftService.versionChange) {
        shiftService.loadNewTemplate(tempContainers);
      }
    }
  });

  LeaderMESservice.customAPI("GetDepartmentMachine", {
    DepartmentID: 0,
  }).then(function (response) {
    var depNames = _.map(response.DepartmentMachine, function (dep) {
      return dep.Key;
    });
    $sessionStorage.departmentNames = depNames;
  });
  $scope.userID = LeaderMESservice.getUserID();


  $scope.fetchTasksData = function () {
    LeaderMESservice.customAPI("GetTaskProgress", {
      SourceTaskCreationPlatform: 1,
    }).then(function (response) {
      const allTasks = response && 
        response.ResponseDictionaryValues && 
        response.ResponseDictionaryValues.TaskProgress
      $scope.openTasks = [];
      angular.forEach(allTasks || [], function (task) {
        if (task.TaskStatus !== 1 &&  Number(task["Assignee"]) === $scope.userID && 
          (task.StatusName === 'TO-DO' || task.StatusName === 'InProgress')
        ){
          $scope.openTasks.push(task);
        }
      });
    });
  };

  $scope.fetchTasksData();
  
  refreshFunction = $interval($scope.fetchTasksData, $sessionStorage.onlineRefreshTime);

  $scope.$on("$destroy", function () {
    $interval.cancel(refreshFunction);
  });

  var timeoutPromise;
  var delayInMs = 2000;
  $scope.saveDashboardStructure = function () {
    $scope.containers.data.map((component) => {
      let comp = component;
      if (comp.options.localMachines) {
        delete comp.options.localMachines;
      }
      return comp;
    });

    var obj = {
      containers: $scope.containers,
      machinesDisplay: $scope.shiftData.machinesDisplay,
    };

    if ($sessionStorage.produtionFloorTab?.selectedTab == "shift") {
      delete obj.containers;
      obj.shiftInsights = $scope.containers;
    }

    LeaderMESservice.customAPI("SaveDashboardStructure", {
      dashboardStructure: {
        GeneralStructure: JSON.stringify(obj),
      },
    }).then(function (response) {
      if (response && response.error) {
      }
    });
  };

  $scope.$watch(
    "containers",
    function watchCallback(newValue, oldValue) {
      if (JSON.stringify(newValue) == JSON.stringify(oldValue)) {
        return;
      }
      $timeout.cancel(timeoutPromise);
      timeoutPromise = $timeout(function () {
        $scope.saveDashboardStructure();
      }, delayInMs);
    },
    true
  );

  shiftService.displayUpdateDefferd.promise.then(null, null, function () {
    $timeout.cancel(timeoutPromise);
    timeoutPromise = $timeout(function () {
      $scope.saveDashboardStructure();
    }, delayInMs);
  });

  $scope.openCustomModal = topMenu => {
    customServices.customGetCode($scope, topMenu.TopMenuTargetTYpe);
  };

  $scope.activeTopMenu = { name: '', status: false };
  $scope.selectActiveTopMenu = function (menuName) {
    if ($scope.activeTopMenu.name === menuName) {
      $scope.activeTopMenu.status = !$scope.activeTopMenu.status;
    } else {
      $scope.activeTopMenu = {name: menuName, status: true}
    }
  }

  $scope.getMenu = function () {
    
    $scope.menuAndSubMenu =  LeaderMESservice.getMainMenu();

    var productionFloorMenu = _.find($scope.menuAndSubMenu, {
      TopMenuAppPartID: 500,
    });
    if (productionFloorMenu) {
      productionFloorMenu.oneLevel = true;
      var allMachinesSubMenu = _.find(productionFloorMenu.subMenu, {
        SubMenuAppPartID: 540,
      });
      if (allMachinesSubMenu) {
        productionFloorMenu.state = allMachinesSubMenu.state;
        productionFloorMenu.fullView = allMachinesSubMenu.fullView;
        productionFloorMenu.fullViewData = allMachinesSubMenu.fullViewData;
        productionFloorMenu.subMenuNew = allMachinesSubMenu;
      }
    }

    $scope.loading = false;
  };

  $scope.filterMenu = function () {
    var initMenu = LeaderMESservice.getMainMenu();
    var tempMenuArr = [];

    console.log("initMenu", initMenu)

    _.map(initMenu, (topMenu) => {
      var tempTopMenu = _.cloneDeep(topMenu);
      if(!tempTopMenu.oneLevel) {
        var initialSubMenu = tempTopMenu.subMenu;
        var filteredSubMenu = _.filter(initialSubMenu, function (subMenu) {
          return subMenu?.SubMenuLName?.toLowerCase().includes($scope.menuSearchText.value.toLowerCase());
        });
        tempTopMenu.subMenu = filteredSubMenu;
        if (tempTopMenu.subMenu.length > 0) {
          tempMenuArr.push(tempTopMenu);
        };
      } else if (!tempTopMenu.modal) {
        if (tempTopMenu?.TopMenuLName?.toLowerCase().includes($scope.menuSearchText.value.toLowerCase())) {
          tempMenuArr.push(tempTopMenu)
        };
      }
      return;
    });

    $scope.menuAndSubMenu = tempMenuArr;
    $scope.menuSearchText.status = true;
  }

  $scope.version = LeaderMESservice.getVersion();

  $scope.getState = function (subMenuType, fullView) {
    if (fullView == true) {
      return subMenuType + "FullView";
    }
    if (subMenuType === "") {
      return "index.main";
    } else if (subMenuType.indexOf("custom") === 0) {
      return "index.custom";
    }
    return "index." + subMenuType;
  };

  $scope.getStateData = function (subMenu) {
    if (subMenu.SubMenuTargetTYpe == "report") {
      return {
        reportID: subMenu.SubMenuExtID,
      };
    } else if (subMenu.SubMenuTargetTYpe == "appObject") {
      var objectMenu = LeaderMESservice.getTabsByID(subMenu.SubMenuExtID);
      if (objectMenu) {
        return {};
      }
    }
    return {};
  };

  $scope.openFullView = function (subMenu) {
    var url = $state.href(subMenu.fullView, subMenu.fullViewData);
    window.open(url, "_blank");
  };

  if (LeaderMESservice.isLanguageRTL() == true) {
    $scope.rtl = "rtl";
    $rootScope.rtl = "rtl";
    $scope.navBarLogOut = "navbar-left";
  } else {
    $rootScope.rtl = "";
    $scope.rtl = "";
    $scope.navBarLogOut = "navbar-right";
  }

  $scope.openChangeUserForm = function () {
    $scope.content = {
      targetParameters: {},
    };
    commonFunctions.wizard(
      $scope,
      {
        SubMenuExtID: 46,
        newTargetParameters: {
          FieldName: "Name",
          Eq: $scope.userName,
          DataType: "text",
        },
        SkipSaveOperation: true,
      },
      0
    );
  };

  this.userName = AuthService.getUsername();
  $scope.userName = this.userName;
  this.helloText = "Welcome to Matics";
  this.descriptionText = "Agile Solutions for the Digital Factory";

  $scope.showLocalLanguage = LeaderMESservice.showLocalLanguage();

  // if (COGNOS.enable == true){
  //     $scope.enableCognos = true;
  //     $scope.cognosUrl = COGNOS.url;
  //     $('#cookieIframe').attr("src", BASE_URL.url + "GetKeyForCognos/" + AuthService.getAccessToken());
  // }

  $("html, body").animate(
    {
      scrollTop: 0,
    },
    "fast"
  );
  $("html, body").animate(
    {
      scrollTop: 1,
    },
    "fast"
  );

  this.openSetting = function (url) {
    var settingsUrl = url[LeaderMESservice.getLanguage()];
    window.open(settingsUrl, "_blank");
    return;
  };

  if ($sessionStorage.userAuthenticated.ShowPopUp) {
    // this.openSetting(mainCtrl.settingsData[0].url);
  }

  mainCtrl.setHomePage = function () {
    var stateParams = LeaderMESservice.getStateParams();
    LeaderMESservice.customAPI("SaveUserHomePage", {
      HomePage: stateParams && stateParams.subMenu && stateParams.subMenu.SubMenuAppPartID,
      SubObjectPage: ($sessionStorage && $sessionStorage.produtionFloorTab && $sessionStorage.produtionFloorTab.selectedTab) || "",
    });
    if (stateParams && stateParams.subMenu && stateParams.subMenu.SubMenuAppPartID) {
      mainCtrl.currentHomePage = stateParams.subMenu.SubMenuAppPartID;
      mainCtrl.userAuth.HomePage = stateParams.subMenu.SubMenuAppPartID;
    }
    if ($sessionStorage && $sessionStorage.produtionFloorTab && $sessionStorage.produtionFloorTab.selectedTab !== "") {
      mainCtrl.userAuth.HomePageSubObject = $sessionStorage.produtionFloorTab.selectedTab;
    }
  };


  $rootScope.$on("$stateChangeStart", function (event, next) {
    $timeout(function () {
      var stateParams = LeaderMESservice.getStateParams();
      if (stateParams && stateParams.subMenu && stateParams.subMenu.SubMenuAppPartID) {
        mainCtrl.currentHomePage = stateParams.subMenu.SubMenuAppPartID;
      }
    }, 100);
  });

  $scope.goToHomePage = function () {
    var homePage = AuthService.getHomePage();
    var homePageTab = AuthService.getHomePageTab();
    if (homePageTab && homePageTab !== "") {
      if ($sessionStorage.produtionFloorTab) {
        $sessionStorage.produtionFloorTab.selectedTab = homePageTab;
      }
    }
    if (homePage !== undefined && homePage !== null) {
      var mainMenu = LeaderMESservice.getMainMenu();
      for (var i = 0; i < mainMenu.length; i++) {
        var foundSubMenu = _.find(mainMenu[i].subMenu, {
          SubMenuAppPartID: homePage,
        });
        if (foundSubMenu) {
          $state.go(foundSubMenu.state, {
            menuContent: {
              subMenu: foundSubMenu,
              topMenu: mainMenu[i],
            },
          });
          return;
        }
      }
    }
    $state.go(
      "index.main",
      {},
      {
        reload: true,
      }
    );
  };

  $scope.CurrentDate = moment().format("MMM Do YY");

  $scope.CollapseTasksBar = function () {
    if (!$(".tasksGrid").hasClass("tasksGridFade")) {
      $(".topbar-collapse").hide();
    }
    setTimeout(() => {
      $(".tasksGrid").toggleClass("tasksGridFade");
      $(".topbar-collapse").slideToggle(300);
      $(".cover").fadeToggle(200);
      $("#statusTO-DOW").slideToggle(200);
    }, 250);

    if (!$(".tasksGrid").hasClass("tasksGridFade")) $scope.tasksSearchInputFilter["input"] = "";
  };

  $scope.toggleSlideNewTaskWindow = function () {
    // $(".newTaskWindowMiddle").toggleClass("newTaskWindowMiddleFade");
    $(".newTaskWindowMiddle").fadeToggle(300);
    $(".cover").fadeToggle(200);
  };

  $scope.showFilterGroupBy = false;
  $scope.filterIsNotChecked = true;
  $scope.displayByChecked = false;
  $scope.changeDisplayBy = function () {
    $scope.tasksOrderBy["order"] = $scope.tasksOrderBy["orderDisplay"];
  };
  $scope.toggleDisplayBy = function () {
    let orederByStringLength = $scope.tasksOrderBy["order"].length;
    $scope.tasksOrderBy["order"] = $scope.tasksOrderBy["order"].substr(0, 1) == "-" ? "+" + $scope.tasksOrderBy["order"].substr(1, orederByStringLength) : "-" + $scope.tasksOrderBy["order"].substr(1, orederByStringLength);
  };

  $scope.getFocus = (elementID) => {
    let myEl = document.getElementById(elementID);
    let angularEl = angular.element(myEl);
    angularEl.focus();
  };

  $scope.openurl = function (url) {
    window.open(url, "_blank");
  };

  $scope.getMenu();
}

angular.module("LeaderMESfe").controller("MainCtrl", MainCtrl);
