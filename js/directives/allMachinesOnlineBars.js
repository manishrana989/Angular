var allMachinesOnlineBarsDirective = function($filter, shiftService, LeaderMESservice) {
	var Template = 'views/custom/productionFloor/onlineTab/allMachinesOnlineBars.html';

	return {
		restrict: 'E',
		templateUrl: Template,
		scope: {
			machine: '=',
			options: '=',
			dep: '=',
			longest: '=',
			type: '=',
			showgoals: '=',
			totalParams: '=',
			showPencils: '=',
			colorMode: '=',
			showTextKeys: '=',
			fullColorMode: '=',
			shapeType: '=',
			selectedScale: '=',
		},
		controller: function($scope, shiftService, LeaderMESservice, $element, $sessionStorage) {
			var onlineBarsCtrl = this;
			onlineBarsCtrl.longestBarHeight = 100;

			$scope.rtl = LeaderMESservice.isLanguageRTL();
			var isLocal = LeaderMESservice.showLocalLanguage();
			$scope.localLanguage = isLocal;
			$scope.departmentId = $scope.dep.DepartmentID || $scope.dep.ID;

			$scope.$watch('dep.MachineSummeryForDepartment', function(newv, oldv) {
				updateBarsData();
			});
			onlineBarsCtrl.getTargets = function() {
				LeaderMESservice.customAPI('getTargets', {
					DepartmentID: $scope.departmentId,
				}).then(function(response) {
					onlineBarsCtrl.targets = _.map(response.TargetInfo, function(target) {
						target.ActualTargetValue = (target.ActualTargetValue * 100).toFixed(1);
						target.TargetValue = (target.TargetValue * 100).toFixed(1);
						target.ui_name = isLocal ? target.LName : target.EName;
						return target;
					});
					if (!$sessionStorage.targetBarsVisibility) {
						$sessionStorage.targetBarsVisibility = {};
					}
					for (var i = 0; i < onlineBarsCtrl.targets.length; i++) {
						if ($sessionStorage.targetBarsVisibility[onlineBarsCtrl.targets[i].Name] === undefined) {
							$sessionStorage.targetBarsVisibility[onlineBarsCtrl.targets[i].Name] = true;
						}
					}
				});
			};

			$scope.$on('get-targets', function(event, args) {
				onlineBarsCtrl.getTargets();
			});

			// department name
			$scope.depName = (isLocal ? $scope.dep.DepartmentLname : $scope.dep.DepartmentEname) || $scope.dep.Name;

			var updateBarsData = function() {
				$scope.barsData = [];
				$scope.allMachines = 0;
				$scope.machinesInProduction = 0;
				if ($scope.type == 'online' || $scope.type == 'target') {
					$scope.barsData = _.without(
						_.map($scope.dep.MachineSummeryForDepartment, function(o) {
							if (!o.fake) return o;
						}),
						undefined
					);

					//    $scope.barsData = $scope.dep.MachineSummeryForDepartment
					for (var i = 0; i < $scope.barsData.length; i++) {
						$scope.allMachines += $scope.barsData[i].MachineCount;
					}

					for (var i = 0; i < $scope.dep.DepartmentsMachine.length; i++) {
						if ($scope.dep.DepartmentsMachine[i].ProductionModeID == 1) {
							$scope.machinesInProduction++;
						}
					}
				}
				var max = 0;
				var maxIndx = -1;

				for (var i = 0; i < $scope.barsData.length; i++) {
					if ($scope.barsData[i].MachineCount > max) {
						max = $scope.barsData[i].MachineCount;
						maxIndx = i;
					}
				}
				for (var i = 0; i < $scope.barsData.length; i++) {
					$scope.barsData[i].barHeight = ($scope.barsData[i].MachineCount / $scope.longest) * onlineBarsCtrl.longestBarHeight;
				}

				$scope.diffMargin = onlineBarsCtrl.longestBarHeight - $scope.barsData[maxIndx].barHeight;

				var ordering = {};
				var sortOrder = [1, 5, 2, 3, 6, 8, 0, 7, 4];

				for (var i = 0; i < sortOrder.length; i++) ordering[sortOrder[i]] = i;

				$scope.barsData.sort(function(a, b) {
					return ordering[a.MachineStatusID] - ordering[b.MachineStatusID];
				});
			};
		},
		controllerAs: 'allMachinesOnlineBarsCtrl',
	};
};

angular.module('LeaderMESfe').directive('allMachinesOnlineBarsDirective', allMachinesOnlineBarsDirective);
