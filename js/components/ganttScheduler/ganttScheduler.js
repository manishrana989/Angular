function ganttScheduler() {

  var controller = function ($scope, customServices, LeaderMESservice, $element, $timeout, GanttSchedulerService, googleAnalyticsService,
    $rootScope, GanttSchedulerSingleMachioneService, $filter, $state, $localStorage, $rootScope, SweetAlert, $sessionStorage, $compile, actionService) {
    var ganttSchedulerCtrl = this;
    googleAnalyticsService.gaPV("gantt");
    ganttSchedulerCtrl.ganttElement = $element.find('.gantt');
    ganttSchedulerCtrl.localLanguage = LeaderMESservice.showLocalLanguage();
    ganttSchedulerCtrl.rtl = LeaderMESservice.isLanguageRTL();
    ganttSchedulerCtrl.machineListOpen = true;
    ganttSchedulerCtrl.singleMachine = false;
    // ganttSchedulerCtrl.ganttStyle = {
    //   height :'calc(100vh * ' + $rootScope.scaleAfterZoom + ' - 85px)',
    //   maxHeight :'calc(100vh * ' + $rootScope.scaleAfterZoom + ' - 85px)',
    // }
    if ($localStorage.ganttFilterData) {
      ganttSchedulerCtrl.useJobColor = $localStorage.ganttFilterData.useJobColor;
      ganttSchedulerCtrl.jobColors = $localStorage.ganttFilterData.colors;
      ganttSchedulerCtrl.setupColors = $localStorage.ganttFilterData.setupColors;
    }
    if (!$localStorage.ganttDefaults) {
      $localStorage.ganttDefaults = {
        displayMachineEvents: false,
        coloringField: null,
        coloringValue: null,
        displayMachineShifts: false,
        timeField: 'resourceTimelineDay',
        timeCalendarField: 'timeGridDay',
        selectedMachines: [],
        peFilter: 0,
        jobsNotForRelease: false
      }
    }

    ganttSchedulerCtrl.periodOptions = [
      {
        label: 'HOUR',
        viewType: 'resourceTimelineHour',
        viewTypeCalendar: null
      },
      {
        label: 'DAY',
        viewType: 'resourceTimelineDay',
        viewTypeCalendar: 'timeGridDay'
      },
      {
        label: 'WEEK',
        viewType: 'resourceTimelineWeekCustom',
        viewTypeCalendar: 'timeGridWeekCustom'
      },
      {
        label: 'MONTH',
        viewType: 'resourceTimelineMonthCustom',
        viewTypeCalendar: 'dayGridMonth'
      },
    ]

    ganttSchedulerCtrl.ganttHeaderParams = $localStorage.ganttDefaults;

    if (!ganttSchedulerCtrl.ganttHeaderParams.timeField) {
      ganttSchedulerCtrl.ganttHeaderParams.timeField = 'resourceTimelineDay';
    }
    ganttSchedulerCtrl.ganttHeaderParams.coloringValue = null;
    ganttSchedulerCtrl.ganttHeaderParams.coloringField = null;
    $scope.tooltips = {};
    $scope.jobEventsTooltips = {};

    ganttSchedulerCtrl.previousColoringJobIds = [];
    GanttSchedulerService.generalCode($scope, ganttSchedulerCtrl);
    GanttSchedulerSingleMachioneService.updateCode($scope, ganttSchedulerCtrl, $element);
    FullCalendar.scaleScroll = $rootScope.scaleAfterZoom;
    ganttSchedulerCtrl.ganttHeight = window.innerHeight * $rootScope.scaleAfterZoom - 245;
    ganttSchedulerCtrl.init = function () {
      ganttSchedulerCtrl.ganttElement = $element.find('.gantt');
      if (ganttSchedulerCtrl.gantt && ganttSchedulerCtrl.gantt.destroy) {
        ganttSchedulerCtrl.gantt.destroy();
      }
      ganttSchedulerCtrl.gantt = new FullCalendar.Calendar(ganttSchedulerCtrl.ganttElement[0], ganttSchedulerCtrl.ganntOptions);
      ganttSchedulerCtrl.gantt.render();
      // $timeout(function(){
      //   ganttSchedulerCtrl.gantt.changeView('resourceTimeGridDay');
    }
    ganttSchedulerCtrl.changeGanttView = function (view) {
      if (view === 'calendar') {
        ganttSchedulerCtrl.gantt.changeView('resourceTimeGridDay');
        const containerWidth = $('.fc-view-container').width();
        if (containerWidth / ganttSchedulerCtrl.gantt.getResources().length > 175) {
          document.documentElement.style.setProperty('--gantt-calendar-width', `${containerWidth}px`);
        }
        else {
          document.documentElement.style.setProperty('--gantt-calendar-width', `${ganttSchedulerCtrl.gantt.getResources().length * 175}px`);
        }
      }
      else if (view === 'gantt') {
        ganttSchedulerCtrl.gantt.changeView(ganttSchedulerCtrl.ganttHeaderParams.timeField);
      }
    };

    $scope.showMore = {

    };
    var ganntDefaultOptions = {
      schedulerLicenseKey: '0133016263-fcs-1560668241',
      plugins: ['interaction', 'dayGrid', 'resourceTimeline', 'resourceTimeGrid'],
      editable: false, // enable draggable events
      viewSkeletonRender: function (info) {
        $scope.resource_area_element = info.el.querySelector('.fc-resource-area')
        if ($scope.resource_area_element) {
          $scope.resource_area_width = $scope.resource_area_element.clientWidth;
        }
      },
      eventStartEditable: false,
      eventResourceEditable: false,
      selectable: true,
      locale: $sessionStorage.DatePickLng,
      header: false,
      nowIndicator: true,
      height: ganttSchedulerCtrl.ganttHeight,
      scrollTime: '00:00', // undo default 6am scrollTime
      header: {
        center: 'title'
      },
      eventLimit: true,
      validRange: function (nowDate) {
        return {
          start: nowDate
        };
      },
      resources: function (fetchInfo, successCallback, failureCallback) {
        var resources = ganttSchedulerCtrl.ganntOptions && ganttSchedulerCtrl.ganntOptions.machineResources || [];
        if (ganttSchedulerCtrl.resourceChosen !== 'machines') {
          resources = _.filter(ganttSchedulerCtrl.auxiliaryData, { AuxTypeID: ganttSchedulerCtrl.resourceChosen }) || [];
        }
        successCallback(resources);
        ganttSchedulerCtrl.resourcesLoading = false;
      },
      defaultView: ganttSchedulerCtrl.ganttHeaderParams.timeField,
      views: {
        resourceTimelineWeekCustom: {
          type: 'resourceTimeline',
          slotDuration: '06:00',
          duration: { days: 7 },
          buttonText: 'Week'
        },
        resourceTimelineHour: {
          type: 'resourceTimeline',
          buttonText: 'hour',
          duration: { hours: 1 },
        },
        resourceTimelineMonthCustom: {
          type: 'resourceTimeline',
          slotDuration: '12:00',
          duration: { days: 30 },
          slotLabelFormat: [
            { weekday: 'short', day: 'numeric', month: 'numeric' }, // top level of text
            { hour: '2-digit',minute:'2-digit' } // lower level of text
          ],
          buttonText: 'Month'
        }
      },
      allDaySlot: false,
      eventClick: function (info) {
        if (info.event.extendedProps.machineEvent) {
          var url = $state.href('appObjectFullView', {
            appObjectName: 'CalendarEvent',
            ID: info.event.extendedProps.EventID
          });
          url = url + "?firstTime=true";
          var myWindow = window.open(url, "LEADERMES_Event", '', true);
          myWindow.location.reload();
          return;
        }
        if (ganttSchedulerCtrl.action && info.event.extendedProps.jobEvent) {
          const classNames = [...info.event.classNames];
          const indexOfClassNames = info.event.classNames.indexOf('chosen-for-action');
          if (indexOfClassNames < 0) {
            classNames.push('chosen-for-action');
          } else {
            classNames.splice(indexOfClassNames, 1);
          }
          $scope.jobEventsTooltips[info.event.id].dispose();
          info.event.setProp('classNames', classNames);
          return;
        }

        if (info && info.event && info.event.extendedProps && info.event.extendedProps.jobEvent && info.event.extendedProps.ID) {
          if ($scope.jobEventsTooltips[info.event.id]) {
            $scope.jobEventsTooltips[info.event.id].hide();
          };
          info.el.mousePosition = {
            x: info.jsEvent.pageX,
            y: info.jsEvent.pageY
          };
          ganttSchedulerCtrl.openJobActions(info.event.extendedProps.ID, info.event.extendedProps.MachineID, info.el);
          info.jsEvent.stopPropagation();
        }
      },
      resourceOrder: 'order1,order2',
      resourceAreaWidth: sessionStorage.getItem('resourceAreaWidth') || undefined,
      resourceColumns: [
        {
          labelText: $filter('translate')('MACHINES'),
          field: 'title',
          render: function (resource, el) {
            var extendedProps = resource.extendedProps;
            el.style.color = '#337ab7';
            el.style.cursor = 'pointer';
            //TODO make the menu change here.
            const newEl = $compile(`
                    <span ng-click="showMore[${extendedProps.Id}] = !showMore[${extendedProps.Id}];$event.stopPropagation()">
                      <img src="images/more.svg" width="4" height="12" style="margin: 0 5px" />
                    <span/>
                    <ul style="top: unset;min-width: 100px; left: 10px;" 
                      off-click-activator="showMore[${extendedProps.Id}]" off-click="showMore[${extendedProps.Id}] = false"
                      class="dropdown-menu select-dep-dropdown newScroll slim" ng-if="showMore[${extendedProps.Id}]">
                      <li 
                        style="width: calc(100% - 10px);"
                        ng-click="ganttSchedulerCtrl.updateProductionStatus(${extendedProps.Id});showMore[${extendedProps.Id}] = false;$event.stopPropagation()" 
                        >
                        <div class="pull-left" style="display: flex;justify-content: space-between;align-items: center">
                            <span>
                                {{"UPDATE_PRODUCTION_STATUS" | translate}}
                            </span>
                        </div>
                    </li>
                </ul>`)($scope)
            // el.append(newEl[0]);
            el.insertBefore(newEl[0], el.firstChild);
            let clickEl = el;
            if (el && el.children) {
              const foundEl = _.find(el.children, { className: 'fc-cell-text' });
              if (foundEl) {
                clickEl = foundEl
              }
            }
            clickEl.onclick = function () {
              $timeout(() => {
                ganttSchedulerCtrl.action = null;
                ganttSchedulerCtrl.singleMachine = {
                  enabled: true,
                  machineId: extendedProps.Id,
                  props: extendedProps
                }
              })
            };
          }
        }
      ],
      select: function (info) {
        if (info && info.resource &&
          info.resource.extendedProps &&
          info.resource.extendedProps.CalendarID) {
          $scope.newEventData = {
            start: moment(info.start),
            end: moment(info.end),
            calendarId: info.resource.extendedProps.CalendarID,
            machineName: info.resource.extendedProps.MachineName,
          };
          customServices.customGetCode($scope, 'custom:popupCreateEvent');
          $scope.callbackFunction = () => {
            ganttSchedulerCtrl.refreshData();
          };
        }
      },
      datesRender: function () {
        $timeout(function () {
          if (ganttSchedulerCtrl.updateJobColor) {
            ganttSchedulerCtrl.updateJobColor();
          }
        }, 500);
      },
      eventRender: function (info) {
        if (info.event && info.event.extendedProps && info.event.extendedProps.shiftEvent) {
          return;
        }
        console.log(1111);
        var tooltipTemplate = '';
        if (info.event.extendedProps.machineEvent) {
          tooltipTemplate = `<div>${info.event.title}</div>`;
        }
        else if (info.event.extendedProps.ID === 0) {
          tooltipTemplate = `<div>${$filter('translate')('NO_SETUP_ALLOWED')}</div>`;
        }
        else {
          tooltipTemplate = `<div class="tooltip-default"><div>${$filter('translate')('JOB_ID')}: ${info.event.extendedProps.ID}</div>
                <div>${$filter('translate')('JOB_ERP_ID')}: ${info.event.extendedProps.ErpJobID}</div>
                <div>${$filter('translate')('PRODUCT_NAME')}: ${ganttSchedulerCtrl.localLanguage ? info.event.extendedProps.ProductName : info.event.extendedProps.ProductEName}</div>
                <div>${$filter('translate')('MOLD_NAME')}: ${ganttSchedulerCtrl.localLanguage ? info.event.extendedProps.MoldLName : info.event.extendedProps.MoldEName}</div>
                <div>${$filter('translate')('PRODUCT_CATALOG_ID')}: ${info.event.extendedProps.ProductCatalog}</div></div>`;
          if (ganttSchedulerCtrl.resourceChosen !== 'machines') {
            tooltipTemplate = `${tooltipTemplate}
                  <div>${$filter('translate')('MACHINE_NAME')}: ${ganttSchedulerCtrl.localLanguage ? info.event.extendedProps.MachineLName : info.event.extendedProps.MachineEName}</div>`;
          }
          tooltipTemplate = tooltipTemplate + '<div class="tooltip-columns">';
          (ganttSchedulerCtrl.ganntOptions.resourceColumns || []).forEach(resourceColumn => {
            if (resourceColumn.fieldParam === 'machine_progress' && info.event.extendedProps.Status === 10){
              tooltipTemplate = tooltipTemplate + 
              `<div>${resourceColumn.labelText}: ${ (100 * (info.event.extendedProps.UnitsProducedOK / info.event.extendedProps.UnitsTarget)).toFixed(2) }%</div>`;
            }
            else if (resourceColumn.fieldParam && resourceColumn.fieldParam !== 'machine_progress') {
              tooltipTemplate = tooltipTemplate + 
              `<div>${resourceColumn.labelText}: ${ info.event[resourceColumn.fieldParam] || info.event.extendedProps[resourceColumn.fieldParam]}</div>`;
            }
            
          })

          tooltipTemplate = tooltipTemplate + '</div>';
        }
        var tooltip = new Tooltip(info.el, {
          // title: info.event.title,
          title: `<div id="job-${info.event.id}" class="gantt-tooltip-job-${info.event.id}">
                          <span class="title">
                            ${tooltipTemplate}
                          </span>
                        </div>`,
          placement: 'top',
          trigger: 'hover',
          container: '.gantt',
          html: true,
        });
        $scope.jobEventsTooltips[info.event.id] = tooltip;
        if (info.event && info.event.extendedProps && info.event.extendedProps.PConfigID && info.event.extendedProps.PConfigID != 0) {
          $(info.el).children().first().children().first().append('<div class="job-img" style="display:inline-block"><img style="margin: 0 5px;" src="images/treeGraph/jobs-icon-black.svg"></div>');
        }
        if (info.event && info.event.extendedProps && (info.event.extendedProps.MoldStatus == 2 || info.event.extendedProps.MoldStatus == 3)) {
          $(info.el).children().first().children().first().append('<div class="job-img" style="display:inline-block"><img style="margin: 0 5px;" src="images/maintenence-copy-9.svg"></div>');
        }
        // if (info.event.extendedProps.ID && info.event.extendedProps.Status !== 10){    
        //   $(info.el).children().first().children().first().prepend($compile(`<div ng-click="ganttSchedulerCtrl.openJobActions(${info.event.extendedProps.ID},${info.event.extendedProps.MachineID},$event);$event.stopPropagation()" style="display:inline-block"><img style="margin: 0 5px;" src="images/gantt/more.svg"></div>"`)($scope));
        // }
        // if (info.event && info.event.extendedProps && info.event.extendedProps.jobEvent && info.event.extendedProps.Status != 10){
        //   $(info.el).children().first().children().first().append($compile(`<div ng-click="ganttSchedulerCtrl.deleteJob($event,${info.event.extendedProps.ID})" style="display:inline-block;padding: 0px 3px;"><i class="fa fa-trash-o"></i></div>`)($scope));
        // }
      },
      eventDestroy: function (info) {
        $scope.tooltips[info.event.id] = false;
        $(`.gantt-tooltip-job-${info.event.id} .ganttCancelJob`).unbind("click");
      },
      eventMouseLeave: function (info) {
        if (info.event && info.event.extendedProps && info.event.extendedProps.shiftEvent) {
          return;
        }
        if ($scope.jobEventsTooltips[info.event.id]) {
          $scope.jobEventsTooltips[info.event.id].hide();
        }
      },
      eventMouseEnter: function (info) {
        if (info.event && info.event.extendedProps && info.event.extendedProps.shiftEvent) {
          return;
        }
        if (!$scope.tooltips[info.event.id]) {
          $scope.tooltips[info.event.id] = true;
        }
      },
    }

    ganttSchedulerCtrl.deleteJob = function (event, id) {
      event.stopPropagation();
      var job = _.find(ganttSchedulerCtrl.allJobEvents, { ID: id });
      if (job) {
        if ([1, 2, 3].indexOf(job.Status) >= 0) {
          $scope.openDeleteModal(job, $scope.cancelJob);
        }
        else if (job.Status == 11) {
          $scope.openDeleteModal(job, $scope.terminateJob);
        }
      }
    }

    $scope.openDeleteModal = function (job, callback) {
      SweetAlert.swal({
        text: '',
        title: $filter('translate')('YOU_ARE_ABOUT_TO_TERMINATE_THIS_JOB'),
        type: "info",
        showCancelButton: true,
        confirmButtonColor: "green",
        confirmButtonText: $filter('translate')("TERMINATE"),
        cancelButtonText: $filter('translate')("CANCEL"),
        closeOnConfirm: true,
        closeOnCancel: true,
        animation: "false",
        imageUrl: "empty",
        customClass: (ganttSchedulerCtrl.rtl ? " swalRTL back-gantt" : "back-gantt")
      },
        function (isConfirm) {
          if (isConfirm) {
            callback(job);
          }
        });
    }

    $scope.cancelJob = function (job) {
      LeaderMESservice.customAPI('multiRecordsUpsert',
        {
          "TopObjectID": 0,
          "formID": 50200,
          "records": [
            {
              "Action": "Update",
              "pairs": [
                {
                  "FieldName": "ID",
                  "Eq": job.id,
                  "DataType": "num"
                }
              ]
            }
          ],
          "skipSaveOperation": true
        }).then(function (response) {
          ganttSchedulerCtrl.refreshData();
        });
    };

    $scope.terminateJob = function (job) {
      LeaderMESservice.customAPI('multiRecordsUpsert',
        {
          "TopObjectID": 0,
          "formID": 50300,
          "records": [
            {
              "Action": "Update",
              "pairs": [
                {
                  "FieldName": "ID",
                  "Eq": job.id,
                  "DataType": "num"
                }
              ]
            }
          ],
          "skipSaveOperation": true
        }).then(function (response) {
          ganttSchedulerCtrl.refreshData();
        });
    };


    ganttSchedulerCtrl.openObject = function (linkitem, id) {
      var url = $state.href('appObjectFullView', {
        appObjectName: linkitem,
        ID: id
      });
      url = url + "?firstTime=true";
      var myWindow = window.open(url, "LEADERMES_" + linkitem, '', true);
      myWindow.location.reload();
    }

    $scope.$watch('ganttSchedulerCtrl.gantt.component.props.viewType', function (newValue, oldValue) {
      if (newValue != oldValue) {
        var days = Math.ceil((ganttSchedulerCtrl.gantt.view.activeEnd - ganttSchedulerCtrl.gantt.view.activeStart) / 1000 / 60 / 60 / 24);
        //ganttSchedulerCtrl.jobRequestInProgress = true;
        if (days > ganttSchedulerCtrl.daysRequested) {
          ganttSchedulerCtrl.getNextJobEvents(true).then(function () {
            // $timeout(function () {
            //   ganttSchedulerCtrl.jobRequestInProgress = false;
            // });
            if (ganttSchedulerCtrl.singleMachine) {
              ganttSchedulerCtrl.buildSingleMachineGantt();
            }
          })
        }
        else {
          $timeout(function () {
            ganttSchedulerCtrl.jobRequestInProgress = false;
          }, 50);
        }
      }

      ganttSchedulerCtrl.colorJobs();
    });

    ganttSchedulerCtrl.buildCalendar = function (init) {
      ganttSchedulerCtrl.lastUpdateTime = new Date();
      ganttSchedulerCtrl.getAllMachines().then(function (allMachines) {
        ganttSchedulerCtrl.allMachines = _.map(allMachines, function (machine) {
          machine.id = machine.Id;
          machine.title = machine.MachineName;
          return machine;
        });
        ganttSchedulerCtrl.ganntOptions = angular.copy(ganntDefaultOptions);
        ganttSchedulerCtrl.ganntOptions.defaultView = ganttSchedulerCtrl.ganttHeaderParams.timeField;
        ganttSchedulerCtrl.ganntOptions.machineResources = ganttSchedulerCtrl.allMachines;
        if (init) {
          ganttSchedulerCtrl.init();
          return;
        }
        ganttSchedulerCtrl.getShifts().then(function () {
          ganttSchedulerCtrl.ganntOptions.eventSources = ganttSchedulerCtrl.ganttShifts;
          if (ganttSchedulerCtrl.viewResourceToggle === 'calendar') {
            const containerWidth = $('.fc-view-container').width();
            if (containerWidth / ganttSchedulerCtrl.ganntOptions.machineResources.length > 175) {
              document.documentElement.style.setProperty('--gantt-calendar-width', `${containerWidth}px`);
            }
            else {
              document.documentElement.style.setProperty('--gantt-calendar-width', `${ganttSchedulerCtrl.ganntOptions.machineResources.length * 175}px`);
            }
            ganttSchedulerCtrl.ganntOptions.defaultView = 'resourceTimeGridDay';
          }
          ganttSchedulerCtrl.allJobEvents = [];
          ganttSchedulerCtrl.setupEvents = [];
          ganttSchedulerCtrl.init();
          ganttSchedulerCtrl.getNextJobEvents(true).then(function () {
            if (ganttSchedulerCtrl.singleMachine) {
              ganttSchedulerCtrl.buildSingleMachineGantt();
            }
            // $timeout(function () {
            //   ganttSchedulerCtrl.jobRequestInProgress = false;
            // });
          });

          ganttSchedulerCtrl.hello = () => {
            console.log(1111);
          };

          ganttSchedulerCtrl.coloringFields = [
            {
              value: null,
              param: "ErpJobID",
              TEXT: $filter('translate')('ERP_JOB_ID')
            },
            {
              value: null,
              param: "ERPOrderID",
              TEXT: $filter('translate')('ERP_ORDER_ID')
            },
            {
              value: null,
              param: "ProductCatalog",
              TEXT: $filter('translate')('PRODUCT_CATALOG_ID')
            },
            {
              value: null,
              param: ganttSchedulerCtrl.localLanguage ? 'ProductName' : 'ProductEName',
              TEXT: $filter('translate')('PRODUCT_NAME')
            },
            {
              value: null,
              param: "MoldID",
              TEXT: $filter('translate')('MOLD_ID')
            },
            {
              value: null,
              param: ganttSchedulerCtrl.localLanguage ? 'MoldLName' : 'MoldEName',
              TEXT: $filter('translate')('MOLD_NAME')
            },
            {
              value: null,
              param: ganttSchedulerCtrl.localLanguage ? 'CustomerLName' : 'CustomerEName',
              TEXT: $filter('translate')('CUSTOMER_NAME')
            },
            {
              value: false,
              param: 'MoldLocalID',
              TEXT: $filter('translate')('MOLD_LOCAL_ID')
            },
            {
              value: false,
              param: 'Notes',
              TEXT: $filter('translate')('NOTES')
            },
            {
              value: false,
              param: 'UnitsTarget',
              TEXT: $filter('translate')('UNITS_TARGET')
            },
            {
              value: false,
              param: 'UnitsProducedOK',
              TEXT: $filter('translate')('UNITS_PRODUCED_OK')
            },
            {
              value: false,
              param: 'TotalRejects',
              TEXT: $filter('translate')('TOTAL_REJECTS')
            },
            {
              value: false,
              param: 'TimeLeftHR',
              TEXT: $filter('translate')('TIME_LEFT_HR')
            },
            {
              value: false,
              param: 'JobStatus',
              TEXT: $filter('translate')('JOB_STATUS')
            },
            {
              value: false,
              param: 'MoldStatus',
              TEXT: $filter('translate')('MOLD_STATUS')
            },
            {
              dateField: true,
              value: false,
              param: 'EndTimeRequest',
              TEXT: $filter('translate')('REQUESTED_END_TIME')
            },
            {
              dateField: true,
              value: false,
              param: 'ClosingDate',
              TEXT: $filter('translate')('CLOSING_DATE')
            },
            {
              dateField: true,
              value: false,
              param: 'PlanningApprovedDate',
              TEXT: $filter('translate')('PLANNING_DATE_OF_APPROVAL')
            }
          ];
        });
      });
    }
    ganttSchedulerCtrl.buildCalendar(true);
    window.onmousemove = function () {
      if ($scope.resource_area_element && $scope.resource_area_width !== $scope.resource_area_element.clientWidth) {
        // console.log('width changed to', resource_area_element.clientWidth)
        // calendarEl.style.width = (632 + resource_area_element.clientWidth) + 'px'
        if (ganttSchedulerCtrl.gantt) {
          ganttSchedulerCtrl.gantt.updateSize();
        }
      }
      // resource_area_width = resource_area_element.clientWidth
    }

    ganttSchedulerCtrl.filteredView = false;
    ganttSchedulerCtrl.filteredViewChange = function (value) {
      ganttSchedulerCtrl.filteredView = value;
    }

    ganttSchedulerCtrl.updateProductionStatus = (machineId) => {
      //MachineScreenEditor
      const appObject = LeaderMESservice.getTabsByAppName('MachineScreenEditor');
      if (appObject && appObject.Actions) {
        const updateProductionStatusAction = _.find(appObject.Actions, { SubMenuAppPartID: 20220 });
        if (updateProductionStatusAction) {
          actionService.openAction({
            content: {
              ID: machineId,
            },
            emptyPage: () => {
              ganttSchedulerCtrl.refreshData();
            }
          }, updateProductionStatusAction);
        }
      }
    };

    // $scope.$watchCollection('ganttSchedulerCtrl.gantt.component.calendar.view.resourceAreaWidth', (newValue) => {
    //   debugger;
    //   console.log(newValue);
    // }, true, true);

    $scope.saveColumnWidths = () => {
      if (ganttSchedulerCtrl.gantt) {
        ganttSchedulerCtrl.ganttHeaderParams.resourceAreaWidth = ganttSchedulerCtrl.gantt.component.calendar.view.resourceAreaWidth + 'px';
      }
      if (
        ganttSchedulerCtrl.gantt && 
        ganttSchedulerCtrl.gantt.component && 
        ganttSchedulerCtrl.gantt.component.calendar && 
        ganttSchedulerCtrl.gantt.component.calendar.view && 
        ganttSchedulerCtrl.gantt.component.calendar.view.spreadsheet && 
        ganttSchedulerCtrl.gantt.component.calendar.view.spreadsheet.header && 
        ganttSchedulerCtrl.gantt.component.calendar.view.spreadsheet.header.colWidth && 
        ganttSchedulerCtrl.gantt.component.calendar.view.spreadsheet.header.colEls.length > 0) {

      }
    };

    ganttSchedulerCtrl.openSingleMachine = (machine) => {
      ganttSchedulerCtrl.changeMachine = true;
        ganttSchedulerCtrl.singleMachine = {
          enabled: true,
          machineId: machine.Id,
          props: machine
        }
      $timeout(()=> {
        ganttSchedulerCtrl.changeMachine = false;
      },0);
    }

  };

  return {
    restrict: "EA",
    templateUrl: 'js/components/ganttScheduler/ganttScheduler.html',
    scope: {
    },
    link: (scope, element, attrs) => {
      scope.$on('$destroy', function() {
        console.log("destroy");     
        // scope.saveColumnWidths();
        console.log(scope.gantt);
      });
    },
    controller: controller,
    controllerAs: 'ganttSchedulerCtrl'
  };
}

angular
  .module('LeaderMESfe')
  .directive('ganttScheduler', ganttScheduler);