var app = angular.module('schedulerKpi', [ 'ngMaterial', 'angular_table' ,'sbiModule', 'angular-list-detail','ui.codemirror','color.picker','angular_list','angular_time_picker','ngMessages']);
app.config(['$mdThemingProvider', function($mdThemingProvider) {
	$mdThemingProvider.theme('knowage')
	$mdThemingProvider.setDefaultTheme('knowage');
}]);


app.controller('schedulerKpiController', ['$scope','sbiModule_config','sbiModule_translate', 'sbiModule_restServices','$mdDialog','$q','$mdToast','$timeout','$angularListDetail','$filter','$timeout',kpiTargetControllerFunction ]);

function kpiTargetControllerFunction($scope,sbiModule_config,sbiModule_translate,sbiModule_restServices,$mdDialog,$q,$mdToast,$timeout,$angularListDetail,$filter,$timeout){
	$scope.translate=sbiModule_translate;
	$scope.selectedScheduler={};
	$scope.kpi = [];
	$scope.kpiAllList = [];
	$scope.kpiSelected = [];
	$scope.placeHolder = [];
	$scope.engines = [];
	$scope.selectedTab={'tab':0};
	$scope.engineMenuOptionList = [{
		label : sbiModule_translate.load('sbi.generic.delete'),
		icon:'fa fa-trash' ,
		backgroundColor:'transparent',	
		action : function(item,event) {
			$scope.removeEngine(item);
		}

	}];


	$scope.loadEngineKpi = function(){
		sbiModule_restServices.promiseGet("1.0/kpi","listSchedulerKPI")
		.then(function(response){ 
			angular.copy(response.data,$scope.engines);
			for(var i=0;i<$scope.engines.length;i++){
				if($scope.engines[i].endDate!=null && $scope.engines[i].endDate!=undefined){
					var dateFormat = $scope.parseDate(sbiModule_config.localizedDateFormat);
					//parse date based on language selected
					 $scope.engines[i].endDate=$filter('date')( $scope.engines[i].endDate, dateFormat);
				}
				if($scope.engines[i].startDate!=null && $scope.engines[i].startDate!=undefined){
					var dateFormat = $scope.parseDate(sbiModule_config.localizedDateFormat);
					//parse date based on language selected
					 $scope.engines[i].startDate=$filter('date')( $scope.engines[i].startDate, dateFormat);
				}
			}
		},function(response){
		});

	}
	
	$scope.loadEngineKpi();
	
	$scope.getListKPI = function(){
		var arr_name = [];
		sbiModule_restServices.promiseGet("1.0/kpi","listKpi")
		.then(function(response){ 
			for(var i=0;i<response.data.length;i++){

				var obj = {};
				obj["name"]=response.data[i].name;
				obj["version"]=response.data[i].version;
				if(response.data[i].category!=undefined){
					obj["valueCd"] = response.data[i].category.valueCd;
				}
				obj["author"]=response.data[i].author;
				obj["datacreation"]=new Date(response.data[i].dateCreation);
				obj["id"]=response.data[i].id;

				$scope.kpiAllList.push(obj);

			}
		},function(response){
		});
	}
	$scope.getListKPI();

	
	$scope.loadAllInformationForKpi  = function(){
	
		var arr = [];
		for(var k=0;k<$scope.selectedScheduler.kpis.length;k++){
			arr.push($scope.selectedScheduler.kpis[k].name);
		}
		sbiModule_restServices.promisePost("1.0/kpi", 'listPlaceholderByKpi',arr).then(
				function(response) {
					if (response.data.hasOwnProperty("errors")) {
						$scope.showAction(response.data);
					} else {
					angular.copy(response.data,$scope.placeHolder);
					$scope.addPlaceHolderMissing();
					}
				},function(response) {
					$scope.errorHandler(response.data,"");
				})
		

		

	}
	
	$scope.removeEngine = function(item){

	}
	
	$scope.addPlaceHolderMissing = function(){
		var keys = Object.keys($scope.placeHolder);
		for(var i=0;i<keys.length;i++){
						var index = $scope.indexInList(keys[i],$scope.selectedScheduler.filters,"kpiName");
						if(index ==-1){
							
							var objType = {"domainCode": "KPI_PLACEHOLDER_TYPE",
											"domainName": "KPI placeholder value type",
											"translatedValueDescription": "Fixed Value",
											"translatedValueName": "Fixed Value",
											"valueCd": "FIXED_VALUE",
											"valueDescription": "sbidomains.kpi.fixedvalue",
											"valueId": 355,
											"valueName": "sbidomains.kpi.fixedvalue"
							}
						
							for(var v=0;v<$scope.placeHolder[keys[i]].length;v++){
								var obj = {};
								obj.kpiName = keys[i];
								obj.placeholderName = $scope.placeHolder[keys[i]][v];
								obj.value="";
								obj.type = objType;
								
								$scope.selectedScheduler.filters.push(obj);
							}
							/*if($scope.placeHolder[keys[i]].length==1){
								obj.placeholderName = $scope.placeHolder[keys[i]][0];
							}	*/
						}
					}
					$scope.checkMissingType();
	}
	
	$scope.checkMissingType = function(){
		for(var i=0;i<$scope.selectedScheduler.filters.length;i++){
			if($scope.selectedScheduler.filters[i].type==null){
				var objType = {"domainCode": "KPI_PLACEHOLDER_TYPE",
						"domainName": "KPI placeholder value type",
						"translatedValueDescription": "Fixed Value",
						"translatedValueName": "Fixed Value",
						"valueCd": "FIXED_VALUE",
						"valueDescription": "sbidomains.kpi.fixedvalue",
						"valueId": 355,
						"valueName": "sbidomains.kpi.fixedvalue"
						}
				$scope.selectedScheduler.filters[i].type = objType;
			}
		}
	}
	
	$scope.indexInList=function(item, list,param) {

		for (var i = 0; i < list.length; i++) {
			var object = list[i];
			if(object[param]==item){
				return i;
			}
		}

		return -1;
	};
	$scope.parseDate = function(date){
		result = "";
		if(date == "d/m/Y"){
			result = "dd/MM/yyyy";
		}
		if(date =="m/d/Y"){
			result = "MM/dd/yyyy"
		}
		return result;
	};

	$scope.cancel = function(){
		$timeout(function(){
			$scope.selectedTab.tab=0;
		},0)
		$angularListDetail.goToList();
	}

	$scope.tableColumn=[
	                    {label:"Name",name:"name"},
	                    {label:"KPI",name:"kpiNames"},
	                    {label:"Start Date",name:"startDate"},
	                    {label:"End Date",name:"endDate",comparatorFunction:function(a,b){return 1}},
	                    {label:"Author",name:"author"}]
}






