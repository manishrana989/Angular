function kpiCustomization() {

    const template = 'js/components/kpiCustomization/kpiCustomization.html';

    const controller = function ($modal, $scope, LeaderMESservice, $filter, $state, toastr, BreadCrumbsService,$translate) {

        const kpiCustomizationCtrl = this;
        kpiCustomizationCtrl.localLanguage = LeaderMESservice.showLocalLanguage();
        $scope.curruntLanguage = LeaderMESservice.getLanguage();
        kpiCustomizationCtrl.showBreadCrumb = true;
        if ($state.current.name == "customFullView") {
            kpiCustomizationCtrl.showBreadCrumb = false;
        }

        if (!$state.params.menuContent) {
            $scope.stateParams = LeaderMESservice.getStateParams();
        } else {
            $scope.stateParams = $state.params.menuContent;
        }
        if (kpiCustomizationCtrl.showBreadCrumb) {
            BreadCrumbsService.init();
            if (kpiCustomizationCtrl.localLanguage == true) {
                BreadCrumbsService.push($scope.stateParams.topMenu.TopMenuLName, 0);
                BreadCrumbsService.push($scope.stateParams.subMenu.SubMenuLName, 0);
                $scope.topPageTitle = $scope.stateParams.subMenu.SubMenuLName;
            } else {
                BreadCrumbsService.push($scope.stateParams.topMenu.TopMenuEName, 0);
                BreadCrumbsService.push($scope.stateParams.subMenu.SubMenuEName, 0);
                $scope.topPageTitle = $scope.stateParams.subMenu.SubMenuEName;
            }
        }


        $scope.showOpacity = false;
        $scope.showOpacityRowID = -1;

        $scope.sharedCards = [
            {
                name:"CycleTimeEfficiency",
                icon: 'images/edit.png',
                title: 'CYCLE_TIME_EFF',
                subSubtitle: 'CT_STANDARD',
                totalDescription: 'ACTUAL_CT',
                time: "",
                outerIcon: 'images/operators/multiple.png',
                editMode: false
            },
            {
                name:"QualityIndex",
                icon: 'images/edit.png',
                title: 'QUALITY',
                subSubtitle: 'UNITS_PRODUCED_OK',
                totalDescription: 'TOTAL_UNITS_PRODUCED',
                time: "",
                outerIcon: 'images/operators/multiple.png',
                editMode: false
            },
            {
                name:"UnitsInCycleEfficiency",
                icon: 'images/edit.png',
                title: 'CAVITIES_EFFICIENCY',
                subSubtitle: 'ACTUAL_UNITS_IN_CYCLE',
                totalDescription: 'UNITS_IN_CYCLE_STANDARD',
                time:"",
                outerIcon: 'images/equal.png',
                editMode: false
            }
        ];

        $scope.upperCards = [
            {
                name:"AvailabilityOEE",
                icon: 'images/edit.png',
                title: 'AVAILABILITY',
                subSubtitle: 'PRODUCTION_TIME',
                totalDescription: "",
                time: 'TOTAL_TIME_24/7',
                outerIcon: 'images/operators/multiple.png',
                editMode: false
            },
            $scope.sharedCards[0],
            $scope.sharedCards[1],
            $scope.sharedCards[2],
            {
                name:"OEE",
                icon: 'images/edit.png',
                title: 'OEE',
                subSubtitle: "",
                totalDescription: 'TOTAL_TIME',
                time: '24/7',
                outerIcon: 'images/equal-big.png',
                editMode: false
            }
        ];

        $scope.lowerCards = [
            {
                name:"ProductionAvailability",
                icon: 'images/edit.png',
                title: 'AVAILABILITY',
                subSubtitle: 'PRODUCTION_TIME',
                totalDescription: 'PRODUCTION_PLANNED_TIME',
                time: "",
                outerIcon: 'images/operators/multiple.png',
                editMode: false
            },
            $scope.sharedCards[0],
            $scope.sharedCards[1],
            $scope.sharedCards[2],
            {
                name:"PE",
                icon: 'images/edit.png',
                title: 'PE',
                subSubtitle: "",
                totalDescription: "",
                time: 'PRODUCTION_PLANNED_TIME',
                outerIcon: 'images/equal-big.png',
                editMode: false
            }
        ];




        $scope.cardsRows = [];
        $scope.cardsRows.push( $scope.upperCards );
        $scope.cardsRows.push( $scope.lowerCards );

        /**
         * Open translations modal and handle logic inside
         */
        $scope.openTranslationsModal = function (card) {
            const upperScope = $scope;
            $modal.open({
                templateUrl: 'js/components/kpiCustomization/verticalTranslationModel.html',
                windowClass: "verticalTranslationModel",
                controllerAs: 'verticalTranslationCtrl',
                controller: function ($scope, $modalInstance, LeaderMESservice) {
                    const verticalTranslationCtrl = this;
                    $scope.fetching = false;
                    $scope.popupFlags = {};
                    $scope.curLang = upperScope.curruntLanguage;
                    $scope.machinesWithThisDictionary = [];
                    /**
                     * Get translations from the server and splits them to two objects.
                     * One object contains translations with values and another object contains
                     * translations with null values to assign them in the dropdown for the user to add values.
                     */

                    /**
                     * Holds the array of language mapping key and value (eng -> English)
                     * @type {Array}
                     */
                    verticalTranslationCtrl.dict = [];

                    /**
                     * Holds empty translations to display in the Add Language dropdown options
                     * @type {Array}
                     */
                    verticalTranslationCtrl.emptyTranslations = [];

                    /**
                     * Will hold the displayed table of current available translations sent from the server
                     * @type {Array}
                     */
                    verticalTranslationCtrl.currentTranslations = [];
                    let copyCard = {...card};
                    let languageList = {}
                    angular.forEach(upperScope.dataTable[0], (item) => {
                        languageList[item.langshortname] = item.langfullname;
                    });
                    for (prop in copyCard) {
                        if (!(languageList.hasOwnProperty(prop)) && (prop !== "ID")) {
                            delete copyCard[prop]
                        }
                    }
                    verticalTranslationCtrl.currentTranslations.push(copyCard)

                    // values will certainly hold one item at least which is the group dictionary itself
                    // even if the group did not have any reasons. So we are extracting the dictionary
                    verticalTranslationCtrl.dict = upperScope.dataTable;

                    // assign empty translations as all availble language for now, will delete keys from it once we notice
                    // that there exist at least one translated value in this langauge key
                    verticalTranslationCtrl.emptyTranslations = _.map(verticalTranslationCtrl.dict[0], function (i) {
                        return i.langshortname
                    });


                    // separate empty translations
                    angular.forEach(verticalTranslationCtrl.currentTranslations, function (translatedRow) {
                        angular.forEach(translatedRow, function (val, key) {
                            if (val) {
                                const indexToRemove = verticalTranslationCtrl.emptyTranslations.indexOf(key);
                                if (indexToRemove > -1)
                                    verticalTranslationCtrl.emptyTranslations.splice(indexToRemove, 1);
                            }
                        });
                    });

                    verticalTranslationCtrl.emptyTranslations.sort();

                    // remove keys for non translated columns to not render these columns in ui
                    angular.forEach(verticalTranslationCtrl.currentTranslations, function (translatedRow) {
                        angular.forEach(translatedRow, function (val, key) {
                            if (verticalTranslationCtrl.emptyTranslations.indexOf(key) > -1) {
                                delete translatedRow[key]
                            }
                        });
                    });


                    /**
                     * Adds lang to currentTranslations and delete the lang from empty langs
                     * in order to prevent adding duplicated translations
                     */
                    $scope.addLanguage = function (lang) {
                        var lang = $scope.selectedLang;
                        const langIndx = verticalTranslationCtrl.emptyTranslations.indexOf(lang);

                        if (!lang) return;

                        angular.forEach(verticalTranslationCtrl.currentTranslations, function (row) {
                            row[lang] = null;
                        });

                        if (langIndx > -1) {
                            verticalTranslationCtrl.emptyTranslations.splice(langIndx, 1);
                        }
                        $scope.selectedLang = null;
                    };

                    /**
                     * Close and Save user changes
                     */
                    $scope.saveAndClose = function () {
                        const promises = [];

                        $scope.fetching = true;
                        new Promise(function(resolve, reject) {
                            upperScope.savingCurrentState(verticalTranslationCtrl.currentTranslations,resolve,reject);
                        }).then(function(result) { // (**)
                            $scope.fetching = false;
                            $modalInstance.close();
                        })
                    };

                    $scope.close = function () {
                        $modalInstance.close()
                    }
                },
            }).result.then(function () {
            });
        };


        $scope.savingCurrentState = function (currentTranslations,resolve,reject) {
            const promises = [];
            $scope.fetching = true;
            angular.forEach(currentTranslations, function (currentTranslation) {
                let bodyReq = {
                    ID: currentTranslation.ID,
                    values: currentTranslation
                };
                delete bodyReq.values.ID;
                bodyReq.values = _.map(bodyReq.values, function (val, key) {
                    return {key: key, value: val}
                });

                // remove num of machines from body req

                bodyReq.values = bodyReq.values.filter(function (i) {
                    return i.key != 'NumOfMachines' && i.key != 'commonDictionariesPopup'
                });
                bodyReq = JSON.stringify(bodyReq);
                let currentPromise = LeaderMESservice.customAPI('UpdateTranslationForKPIS', bodyReq);
                promises.push(currentPromise)
            });

            Promise.all(promises).then( (r)=> {
                    toastr.success("", $filter('translate')('TRANSLATIONS_SAVED_SUCCESSFULLY'));
                    $scope.getTranslationForKPIS();
                    $scope.fetching = false;
                    $translate.refresh($scope.curruntLanguage);
                    if(resolve)
                        resolve(true);
                },
                 (err)=> {
                    toastr.error("", $filter('translate')('SOMETHING_WENT_WRONG'));
                     if(reject)
                         reject(false);
                })
        };


        $scope.switchMode = function (showEditMode, card, saving,rowID) {
            //edit mode again
            if ($scope.showOpacity && showEditMode)
                return;
            // first time
            if (showEditMode && !card.editMode) {
                $scope.showOpacityRowID = rowID;
                $scope.cardCopy = {...card};
            }
            // when cancel
            if (!showEditMode && card.editMode && !saving) {
                $scope.showOpacityRowID = -1;
                card.title = $scope.cardCopy.title;
            }

            $scope.showOpacity = showEditMode;
            card.editMode = showEditMode;

            if (saving) {
                // TODO write save function callback... still not defined by the product manager
                $scope.showOpacityRowID = -1;
                card[$scope.curruntLanguage] = card.title;
                let copyCard = {...card};
                let languageList = {}
                angular.forEach($scope.dataTable[0], (item) => {
                    languageList[item.langshortname] = item.langfullname;
                });
                for (prop in copyCard) {
                    if (!(languageList.hasOwnProperty(prop)) && (prop !== "ID")) {
                        delete copyCard[prop]
                    }
                }
                $scope.savingCurrentState([copyCard]);
            }
        };


        $scope.getTranslationForKPIS = function () {
            $scope.showOpacity = false;
            LeaderMESservice.customAPI('GetTranslationForKPIS', {})
                .then(function (response) {
                    $scope.dataTable = response.ResponseDataTable;
                    $scope.cardsContentList = response.ResponseList;
                    angular.forEach($scope.cardsRows, function (row, rowIndex) {
                        angular.forEach(row, function (card, cardIndex) {
                            let filteredCard =  _.filter($scope.cardsContentList, {Name: card.name})||[];
                            card.title = _.map(filteredCard, $scope.curruntLanguage)[0];
                            card.rowID = rowIndex;
                            for (prop in filteredCard[0]){
                                card[prop] = filteredCard[0][prop];
                            }
                        });
                    });
                });
        };

        $scope.getTranslationForKPIS();

    };

    return {
        transclude: true,
        restrict: "EA",
        templateUrl: template,
        scope: {},
        controller: controller,
        controllerAs: "kpiCustomizationCtrl"
    };
}

angular
    .module('LeaderMESfe')
    .directive('kpiCustomization', kpiCustomization);
