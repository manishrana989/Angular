/**
 * pageTitle - Directive for set Page title - mata title
 */
function pageTitle($rootScope, $timeout,) {
    return {
        link: function (scope, element) {

            scope.element = element;

            var listener = function (event, toState, toParams, fromState, fromParams) {
                // Default title - load on Dashboard 1
                var title = 'Matics | Responsive Admin Theme';
                // Create your own title pattern
                if (toState.data && toState.data.pageTitle) title = 'Matics | ' + toState.data.pageTitle;
                $timeout(function () {
                    element.text(`${scope.client} ${title}`);
                });
            };
            $rootScope.$on('$stateChangeStart', listener);
        },
        controller: function ($scope, $timeout) {
            $scope.client = location.hostname.split(".")[0]
            $scope.$on('changeTitle', function (event, title) {
                $timeout(function () {
                    $scope.element.text(`${$scope.client} ${title}`);
                });
            });
        }
    }
}

/**
 * sideNavigation - Directive for run metsiMenu on sidebar navigation
 */
function sideNavigation($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element) {
            // Call the metsiMenu plugin and plug it to sidebar navigation
            $timeout(function () {
                element.metisMenu();
            });
        }
    };
}


/**
 * iboxTools - Directive for iBox tools elements in right corner of ibox
 */
function iboxTools($timeout) {
    return {
        restrict: 'A',
        scope: {
            machineBox: '=',
            groupData: '=',
            subMenuAppPartID: '=',
            departmentData: '='
        },
        templateUrl: 'views/common/ibox_tools.html',
        controller: function ($scope, $element, LeaderMESservice) {
            var opened = true;
            var hidden = true;
            // Function for collapse ibox

            var ibox;
            var iboxTitle;
            var icon;
            var content;
            var machineCircleStatus;
            var iboxMachineTitle;
            var boxPerMachine;
            var init = function () {
                $scope.faIconChevron = "fa fa-chevron-up";
                ibox = $element.closest('div.ibox');
                content = ibox.find('div.ibox-content');
                $scope.showCollapse = true;
                if ($scope.machineBox) {
                    $scope.showCollapse = false;
                    iboxTitle = $element.closest('div.ibox-title');
                    machineCircleStatus = ibox.find('div.machineCircleStatus');
                    iboxMachineTitle = ibox.find('div.iboxMachineTitle');
                    boxPerMachine = $element.closest('div.boxPerMachine');

                    if ($scope.machineBox.collapsed === true) {
                        machineCircleStatus.show();
                        iboxMachineTitle.hide();
                        boxPerMachine.height(150);
                        iboxFunc();
                        /*$timeout(function () {
                         $scope.$emit('ngRepeatMachineFinished');
                         });*/
                    }
                    else {
                        machineCircleStatus.hide();
                    }
                }
                else if ($scope.departmentData) {
                    $scope.faIconChevron = "fa fa-chevron-down";
                    $scope.showCollapse = $scope.departmentData.showCollapse;
                }

                if (LeaderMESservice.isLanguageRTL() == true) {
                    $scope.rtl = "pull-right";
                }

                if ($scope.groupData) {
                    if ($scope.groupData.Value.UserGroupStateID === 2) {
                        $scope.showhide();
                    }
                    $scope.simpleBox = false;
                }
                else {
                    $scope.simpleBox = true;
                }
            };

            var departmentFunc = function () {
                $scope.$parent.showHideDepartment();
            };


            var iboxFunc = function () {
                icon = $element.find('i:first');
                if ((!content || content.length == 0) && !$scope.departmentData) {
                    content = ibox.find('div.ibox-content');
                }
                content.slideToggle(200);
                // Toggle icon from up to down
                icon.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
                if (!$scope.machineBox) {
                    ibox.toggleClass('').toggleClass('border-bottom');
                }
                $timeout(function () {
                    ibox.resize();
                    ibox.find('[id^=map-]').resize();
                }, 50);
            };

            $scope.showhide = function () {
                opened = !opened;
                if ($scope.departmentData) {
                    departmentFunc();
                }
                $timeout(function () {
                    iboxFunc();
                });
            };

            $scope.saveBox = function () {
                var userID = LeaderMESservice.getUserID();
                var requestBody = {
                    subMenuAppPartID: $scope.groupData.subMenuAppPartId,
                    formID: $scope.groupData.menuId,
                    userID: $scope.groupData.Value.UserID,
                    userGroupValue: [
                        {
                            userID: $scope.groupData.Value.UserID,
                            GroupID: $scope.groupData.Key,
                            UserGroupStateID: (opened === true ? 1 : 2)
                        }
                    ]
                };
                LeaderMESservice.updateUserFormFieldGroups(requestBody).then(function (response) {
                    $scope.showSuccess = response.error == null;
                    $timeout(function () {
                        $scope.showSuccess = undefined;
                    }, 2000)
                });
            };
            $scope.$on('collapseMachines', function (event, collapse, departmentID, callback) {
                if ($scope.machineBox && $scope.machineBox.DepartmentID == departmentID) {
                    var boxPerMachine = $element.closest('div.boxPerMachine');
                    var callThisAtTheEnd = callback().callbackFun;
                    if (collapse == false) {
                        machineCircleStatus.hide();
                        iboxMachineTitle.show();
                        $scope.showTitle = true;
                        boxPerMachine.height($scope.machineBox.height + 78);
                        $scope.$parent.collapseMachine();
                        boxPerMachine.attr("data-ss-colspan", $scope.machineBox.BoxSize.toString());
                    }
                    else {
                        machineCircleStatus.show();
                        iboxMachineTitle.hide();
                        $scope.showTitle = false;
                        boxPerMachine.height(150);
                        $scope.$parent.collapseMachine();
                        boxPerMachine.attr("data-ss-colspan", "3");
                    }
                    iboxFunc();
                    $timeout(function () {
                        callThisAtTheEnd();
                    }, 1000);
                }
            });

            init();

        }
    };
}


/**
 * iboxTools with full screen - Directive for iBox tools elements in right corner of ibox with full screen option
 */
function iboxToolsFullScreen($timeout) {
    return {
        restrict: 'A',
        scope: true,
        templateUrl: 'views/common/ibox_tools_full_screen.html',
        controller: function ($scope, $element) {
            // Function for collapse ibox
            $scope.showhide = function () {
                var ibox = $element.closest('div.ibox');
                var icon = $element.find('i:first');
                var content = ibox.find('div.ibox-content');
                content.slideToggle(200);
                // Toggle icon from up to down
                icon.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
                ibox.toggleClass('').toggleClass('border-bottom');
                $timeout(function () {
                    ibox.resize();
                    ibox.find('[id^=map-]').resize();
                }, 50);
            };
            // Function for close ibox
            $scope.closebox = function () {
                var ibox = $element.closest('div.ibox');
                ibox.remove();
            };
            // Function for full screen
            $scope.fullscreen = function () {
                var ibox = $element.closest('div.ibox');
                var button = $element.find('i.fa-expand');
                $('body').toggleClass('fullscreen-ibox-mode');
                button.toggleClass('fa-expand').toggleClass('fa-compress');
                ibox.toggleClass('fullscreen');
                setTimeout(function () {
                    $(window).trigger('resize');
                }, 100);
            }
        }
    };
}

/**
 * minimalizaSidebar - Directive for minimalize sidebar
 */
function minimalizaSidebar($timeout) {
    return {
        restrict: 'A',
        template: '<div class="navbar-minimalize minimalize-styl-2 btn" href="" ng-click="minimalize()"></div>',
        controller: function ($scope, $window, $element, $timeout) {
            var w = angular.element($window);
            $scope.minimalize = function () {
                $("body").toggleClass("mini-navbar");
                if (!$('body').hasClass('mini-navbar') || $('body').hasClass('body-small')) {
                    // Hide menu in order to smoothly turn on when maximize menu
                    $('#side-menu').hide();
                    // For smoothly turn on menu
                    setTimeout(
                        function () {
                            $('#side-menu').fadeIn(400);
                            $(window).trigger('resize');
                            //for react reduxL sidemenu open? true:
                            if (window.store && window.SetMenuOpen) {
                                window.store.dispatch(window.SetMenuOpen(true))
                            }
                        }, 400);
                } else if ($('body').hasClass('fixed-sidebar')) {
                    $('#side-menu').hide();
                    setTimeout(
                        function () {
                            $('#side-menu').fadeIn(400);
                            $(window).trigger('resize');
                            //for react reduxL sidemenu open? : false
                            if (window.store && window.SetMenuOpen) {
                                window.store.dispatch(window.SetMenuOpen(false))
                            }
                        }, 400);
                } else {
                    // Remove all inline style from jquery fadeIn function to reset menu state
                    $('#side-menu').removeAttr('style');
                    $(window).trigger('resize');
                }
            }
        }
    };
}

/**
 * icheck - Directive for custom checkbox icheck
 */
function icheck($timeout) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function ($scope, element, $attrs, ngModel) {
            return $timeout(function () {
                var value;
                value = $attrs['value'];

                $scope.$watch($attrs['ngModel'], function (newValue) {
                    $(element).iCheck('update');
                });

                return $(element).iCheck({
                    checkboxClass: 'icheckbox_square-green',
                    radioClass: 'iradio_square-green'

                }).on('ifChanged', function (event) {
                    if ($(element).attr('type') === 'checkbox' && $attrs['ngModel']) {
                        $scope.$apply(function () {
                            return ngModel.$setViewValue(event.target.checked);
                        });
                    }
                    if ($(element).attr('type') === 'radio' && $attrs['ngModel']) {
                        return $scope.$apply(function () {
                            return ngModel.$setViewValue(value);
                        });
                    }
                });
            });
        }
    };
}

function requireiftrue($compile) {
    return {
        require: '?ngModel',
        link: function (scope, el, attrs, ngModel) {
            if (!ngModel) {
                return;
            }

            if (attrs.requireiftrue === "true") {
                el.attr('required', true);
                el.removeAttr('requireiftrue');
                $compile(el[0])(scope);
            }
        }
    };
}


function breadCrumbs($compile) {

    var breadCrumbsController = function ($scope, $state, BreadCrumbsService, AuthService, LeaderMESservice) {

        var initBreadCrumb = function () {
            $scope.BreadCrumbs = BreadCrumbsService.getAll();

        };

        $scope.goHome = function () {
            var homePage = AuthService.getHomePage();
            if (homePage !== undefined && homePage !== null) {
                var mainMenu = LeaderMESservice.getMainMenu();
                for (var i = 0; i < mainMenu.length; i++) {
                    var foundSubMenu = _.find(mainMenu[i].subMenu, { SubMenuAppPartID: homePage });
                    if (foundSubMenu) {
                        $state.go(foundSubMenu.state, {
                            menuContent: {
                                subMenu: foundSubMenu,
                                topMenu: mainMenu[i]
                            }
                        });
                        return;
                    }
                }
            }
            $state.go('index.main', {}, { reload: true });
        };

        initBreadCrumb();
    };

    return {
        restrict: 'E',
        templateUrl: 'views/common/breadcrumbs.html',
        controller: breadCrumbsController
    };
}

function breadCrumbsLast($compile) {

    var breadCrumbsLastController = function ($scope, $state, BreadCrumbsService) {

        var initBreadCrumb = function () {
            $scope.BreadCrumbsLast = BreadCrumbsService.getAll();
            $scope.getTitle();

        };

        $scope.getTitle = function () {
            if ($scope.BreadCrumbsLast) {
                if ($scope.BreadCrumbsLast.length) {
                    if ($scope.BreadCrumbsLast.length > 0 && $scope.BreadCrumbsLast.length < 5) {
                        $scope.spicTitle = $scope.BreadCrumbsLast[1].label;

                    }
                    else {
                        $scope.spicTitle = $scope.BreadCrumbsLast[$scope.BreadCrumbsLast.length - 1].label;
                        $scope.spicTitle = $scope.spicTitle.substring(0, $scope.spicTitle.indexOf('#'));

                    }
                }
            }

        };

        $scope.goHome = function () {
            console.log("xxxx");
            //$state.go('index.main',{},{reload : true});
        };

        initBreadCrumb();
    };

    return {
        restrict: 'E',
        templateUrl: 'views/common/breadcrumbsLast.html',
        controller: breadCrumbsLastController
    };
}


function integer() {
    return {
        require: 'ngModel',
        link: function (scope, ele, attr, ctrl) {
            ctrl.$parsers.unshift(function (viewValue) {
                if (viewValue === '' || viewValue === null || typeof viewValue === 'undefined') {
                    return null;
                }
                return parseInt(viewValue, 10);
            });
        }
    };
}



function clockPicker() {
    return {
        restrict: 'A',
        link: function (scope, element) {
            element.clockpicker();
        }
    };
}

/**
 *
 * Pass all functions into module
 */
angular
    .module('LeaderMESfe')
    .directive('pageTitle', pageTitle)
    .directive('sideNavigation', sideNavigation)
    .directive('iboxTools', iboxTools)
    .directive('minimalizaSidebar', minimalizaSidebar)
    .directive('iboxToolsFullScreen', iboxToolsFullScreen)
    .directive('icheck', icheck)
    .directive('requireiftrue', requireiftrue)
    .directive('breadCrumbs', breadCrumbs)
    .directive('breadCrumbsLast', breadCrumbsLast)
    .directive('integer', integer)
    .directive('clockPicker', clockPicker)
    .directive('onFinishRender', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                if (scope.$last === true) {
                    $timeout(function () {
                        scope.$emit('ngRepeatFinished');
                    });
                }
            }
        }
    })
    .directive('onMachineFinishRender', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                if (scope.$last === true) {
                    $timeout(function () {
                        scope.$emit('ngRepeatMachineFinished');
                    });
                }
            }
        }
    })
    .directive('onActionFinishRender', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                if (scope.$last === true) {
                    $timeout(function () {
                        scope.$emit('ngRepeatActionFinished');
                    });
                }
            }
        }
    })
    .directive('onPrintFinishRender', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                if (scope.$last === true) {
                    $timeout(function () {
                        scope.$emit('ngRepeatPrintFinished');
                    });
                }
            }
        }
    })
    .directive('customFocusMe', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            link: function ($scope, $element) {
                $timeout(function () {
                    $element[0].focus();
                }, 400);
            }
        }
    }])
    .directive('printMultiselectDropdown', function () {
        return {
            restrict: 'E',
            scope: {
                model: '=',
                options: '=',
            },
            template: "<div class='btn-group printoutsidebutton' data-ng-class='{open: open}' style='width: 200px;'>" +
                "<button class='test btn btn-small '  type='button' style='width: 160px; background-color: #FFFFFF;border-radius: 1px;border: 1px solid #e5e6e7;'  data-ng-click='openDropdown()'>{{'FIELDS' | translate}}</button>" +
                "<button class='test btn btn-small dropdown-toggle ' type='button' data-ng-click='openDropdown()' style='width: 40px;; background-color: #FFFFFF;border-radius: 1px;border: 1px solid #e5e6e7;' ><span class='caret' style='background-color:white'></span></button>" +
                "<ul class='dropdown-menu printdropdown-menu ' aria-labelledby='dropdownMenu'  style='position: absolute;overflow-y: scroll;" +
                "min-height: 30px;max-height:500px;width: inherit;" +
                "'>" +
                "<li style='cursor:pointer;' data-ng-repeat='option in options' class='pull-left'>" +
                "<a ng-show='!rtl' data-ng-click='toggleSelectItem(option)'>" +
                "<span  data-ng-class='getClassName(option)' aria-hidden='true'></span> {{option.EName}}</a>" +
                "<a ng-show='rtl' data-ng-click='toggleSelectItem(option)'>" +
                "<span  data-ng-class='getClassName(option)' aria-hidden='true'  style='padding-left: 20px;'></span> {{option.LName}}</a>" +
                "</li>" +
                "</ul>" +
                "</div>",

            controller: function ($scope, LeaderMESservice, $filter) {
                $scope.rtl = LeaderMESservice.isLanguageRTL();
                $scope.openDropdown = function () {
                    $scope.open = !$scope.open;
                    $scope.$parent.printModalCtrl.resetWidthPercentage(1);
                    $scope.$parent.printModalCtrl.initTablePercent();
                    $scope.$parent.printModalCtrl.clearTable();
                };
                $(document).mouseup(function (e) {

                    var container = $(".printdropdown-menu");
                    if (!container.is(e.target) // if the target of the click isn't the container...
                        && container.has(e.target).length === 0) // ... nor a descendant of the container
                    {
                        if (!e.target.className.toString().startsWith('test')) {
                            if ($scope.open)
                                $scope.openDropdown();
                        }

                        // $scope.$apply();
                    }

                    // var container = $(".Printmultiselect");
                    // if (!container.is(e.target) // if the target of the click isn't the container...
                    //     && container.has(e.target).length === 0 && printModalCtrl.openModal == 2 && e.target.nodeName !== "LI") // ... nor a descendant of the container
                    // {
                    //     printModalCtrl.openModal = 0;
                    //     $scope.$apply();
                    // }
                });
                $scope.selectAll = function () {

                    $scope.model = [];
                    angular.forEach($scope.options, function (item, index) {

                        $scope.model.push(item);

                    });

                };
                //
                // $scope.deselectAll = function () {
                //     $scope.model = [];
                //
                // };

                $scope.toggleSelectItem = function (option) {
                    var intIndex = -1;

                    angular.forEach($scope.model, function (item, index) {

                        if (item.Name == option.Name) {

                            intIndex = index;

                        }

                    });

                    if (intIndex >= 0) {

                        $scope.model.splice(intIndex, 1);

                    } else {

                        $scope.model.push(option);

                    }

                };

                $scope.getClassName = function (option) {

                    var varClassName = 'glyphicon glyphicon-remove-circle printRedIcon';

                    angular.forEach($scope.model, function (item, index) {

                        if (item.Name == option.Name) {

                            varClassName = 'glyphicon glyphicon-ok-circle printGreenIcon';

                        }

                    });

                    return (varClassName);

                };

            }
        }

    });

