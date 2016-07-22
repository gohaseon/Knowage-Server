angular.module('metaManager').controller('metaModelCreationController', [ '$scope','sbiModule_translate', 'sbiModule_restServices', 'parametersBuilder','$timeout',metaModelCreationControllerFunction ]);
angular.module('metaManager').controller('metaModelCreationPhysicalController', [ '$scope','sbiModule_translate', 'sbiModule_restServices', 'parametersBuilder','$timeout','$mdDialog','sbiModule_config',metaModelCreationPhysicalControllerFunction ]);
angular.module('metaManager').controller('metaModelCreationBusinessController', [ '$scope','sbiModule_translate', 'sbiModule_restServices', 'parametersBuilder','$timeout','$mdDialog','sbiModule_config','metaModelServices',metaModelCreationBusinessControllerFunction ]);
angular.module('metaManager').controller('businessModelPropertyController', [ '$scope','sbiModule_translate', 'sbiModule_restServices', 'parametersBuilder','$timeout',businessModelPropertyControllerFunction ]);
angular.module('metaManager').controller('businessModelAttributeController', [ '$scope','sbiModule_translate', 'sbiModule_restServices', 'parametersBuilder','$timeout','$mdDialog','sbiModule_config',businessModelAttributeControllerFunction ]);
angular.module('metaManager').controller('calculatedBusinessColumnsController', [ '$scope','sbiModule_translate', 'sbiModule_restServices','$mdDialog','sbiModule_config','metaModelServices',calculatedBusinessColumnsControllerFunction ]);
angular.module('metaManager').controller('businessViewJoinRelationshipsController', [ '$scope','sbiModule_translate', 'sbiModule_restServices',businessViewJoinRelationshipsControllerFunction ]);


function metaModelCreationControllerFunction($scope, sbiModule_translate,sbiModule_restServices, parametersBuilder,$timeout) {


}

function metaModelCreationPhysicalControllerFunction($scope, sbiModule_translate,sbiModule_restServices, parametersBuilder,$timeout,$mdDialog,sbiModule_config) {
	$scope.selectedPhysicalModel = {};

	$scope.currentPhysicalModelParameterCategories = [];

	$scope.selectPhysicalModel = function(node) {
		$scope.selectedPhysicalModel = node;
		angular.copy(parametersBuilder
				.extractCategories($scope.selectedPhysicalModel.properties),
				$scope.currentPhysicalModelParameterCategories);
	}
	$scope.physicalModel_getlevelIcon = function(node) {
		if (node.hasOwnProperty("columns")) {
			// is business model node

			// TO-DO manage folder by type
			return "fa fa-table";
		} else {
			// is column node
			if (node.primaryKey == true) {
				return "fa fa-key goldKey"
			}
			return "fa fa-columns";

		}

	}
	$scope.physicalModel_isFolder = function(node) {
		if (node.hasOwnProperty("columns")) {
			return !node.expanded;
		}else{
			return true
		}
	}

	$scope.physicalModelMiscInfo = [ {
		name : "name",
		label : sbiModule_translate.load("name")
	}, {
		name : "description",
		label : sbiModule_translate.load("description")
	}, {
		name : "comment",
		label : sbiModule_translate.load("comment")
	}, {
		name : "dataType",
		label : sbiModule_translate.load("dataType")
	}, {
		name : "decimalDigits",
		label : sbiModule_translate.load("decimalDigits")
	}, {
		name : "typeName",
		label : sbiModule_translate.load("typeName")
	}, {
		name : "size",
		label : sbiModule_translate.load("size")
	}, {
		name : "octectLength",
		label : sbiModule_translate.load("octectLength")
	}, {
		name : "radix",
		label : sbiModule_translate.load("radix")
	}, {
		name : "defaultValue",
		label : sbiModule_translate.load("defaultValue")
	}, {
		name : "nullable",
		label : sbiModule_translate.load("nullable")
	}, {
		name : "position",
		label : sbiModule_translate.load("position")
	}, {
		name : "table",
		label : sbiModule_translate.load("table")
	}];

	$scope.refreshPhysicalModel=function(){
		$mdDialog.show({
			controller: refreshPhysicalModelController,
			preserveScope: true,
			locals: {businessModel:$scope.meta.businessModels, physicalModel: $scope.meta.physicalModels},
			templateUrl:sbiModule_config.contextName + '/js/src/meta/templates/refreshPhysicalModel.jsp',
			clickOutsideToClose:false,
			escapeToClose :false,
			fullscreen: true
		}).then(function(){
			$scope.physicalModelTreeInterceptor.refreshTree();
		});
	}


	$scope.fkTableColumns=[
		                       {
		                    	   label:sbiModule_translate.load("sbi.generic.name"),
		                    	   name:'name'
		                       },
		                       {
		                    	   label:sbiModule_translate.load("sbi.meta.source.columns"),
		                    	   name:'sourceColumns',
		                    	   transformer:function(item){
			                    		var toret=[];
			                    		for(var i=0;i<item.length;i++){
			                    			 toret.push(item[i].tableName+"."+item[i].name);
			                    		}
			                    		return toret.join(",");
		                    	   }
		                       },
		                       {
		                    	   label:sbiModule_translate.load("sbi.meta.target.columns"),
		                    	   name:'destinationColumns',
		                    	   transformer:function(item){
		                    		   var toret=[];
			                    		for(var i=0;i<item.length;i++){
			                    			 toret.push(item[i].tableName+"."+item[i].name);
			                    		}
			                    		return toret.join(",");
		                    	   }
		                       }
	                       ]
}

function metaModelCreationBusinessControllerFunction($scope, sbiModule_translate,sbiModule_restServices, parametersBuilder,$timeout,$mdDialog,sbiModule_config,metaModelServices){
	$scope.selectedBusinessModel = {};
	$scope.currentBusinessModelParameterCategories = [];
	$scope.tmpBMWatcher={};
//	$scope.$watch(function() {
//		var tmpSBM = {};
//		angular.copy($scope.selectedBusinessModel, tmpSBM);
//		delete tmpSBM.$parent;
//		return tmpSBM;
//	}, function(newValue, oldValue) {
//		if (!angular.equals(newValue, oldValue)) {
//			angular.copy(newValue,$scope.tmpBMWatcher);
//			$timeout(function(){
//				if(angular.equals(newValue,$scope.tmpBMWatcher)){
//					$scope.businessModelTreeInterceptor.refreshTree();
//				}
//			},500);
//		}
//	}, true);

	$scope.selectBusinessModel = function(node) {
		$scope.selectedBusinessModel = node;
		angular.copy(parametersBuilder.extractCategories($scope.selectedBusinessModel.properties),
				$scope.currentBusinessModelParameterCategories);

	};


	$scope.getBusinessModelType=function(bm){
		var prop=bm.properties;
		for(var i=0;i<prop.length;i++){
			if(angular.equals(prop[i].key,"structural.tabletype")){
				return prop[i].value.value;
			}
		}
		return "generic";
	};

	$scope.getBusinessModelColumnsType=function(bm){
		var prop=bm.properties;
		for(var i=0;i<prop.length;i++){
			if(angular.equals(prop[i].key,"structural.columntype")){
				return prop[i].value.value;
			}
		}
	};
	$scope.businessModelIconType={
			"generic" :"fa fa-table",
			"cube":"fa fa-cube",
			"dimension":"fa fa-square-o",
			"temporal dimension":"fa fa-calendar",
			"time dimension":"fa fa-clock-o",
			"geographic dimension":"fa fa-globe",
			"measure":"fa fa-barcode",
			"attribute":"fa fa-circle-o",
			"calendar":"fa fa-calendar-check-o",
	}

	$scope.businesslModel_getlevelIcon = function(node) {
		if (node.hasOwnProperty("simpleBusinessColumns")) {
			// is business model node

			// TO-DO manage folder by type
			return $scope.businessModelIconType[$scope.getBusinessModelType(node)] ||  "fa fa-table";
		} else {
			// is column node
			if (node.identifier == true) {
				return "fa fa-key goldKey"
			}
			return $scope.businessModelIconType[$scope.getBusinessModelColumnsType(node)];

		}
	}
	$scope.businessModel_isFolder = function(node) {
		if (node.hasOwnProperty("simpleBusinessColumns")) {
			return !node.expanded;
		}else{
			return true
		}
	}


	$scope.addBusinessModel=function(){
		$mdDialog.show({
			controller: addBusinessModelController,
			preserveScope: true,
			locals: {businessModel:$scope.meta.businessModels, physicalModel: $scope.meta.physicalModels},
			templateUrl:sbiModule_config.contextName + '/js/src/meta/templates/addBusinessModel.jsp',
			clickOutsideToClose:false,
			escapeToClose :false,
			fullscreen: true
		});
	}

	$scope.addBusinessView=function(editMode){
		$mdDialog.show({
			controller: addBusinessViewController,
			preserveScope: true,
			locals: {businessModel:$scope.meta.businessModels, originalPhysicalModel: $scope.meta.physicalModels,selectedBusinessModel: $scope.selectedBusinessModel,editMode:editMode},
			templateUrl:sbiModule_config.contextName + '/js/src/meta/templates/addBusinessView.jsp',
			clickOutsideToClose:false,
			escapeToClose :false,
			fullscreen: true
		}).then(function(){
			$scope.businessViewTreeInterceptor.refreshTree();
		});
	}


	$scope.deleteCurrentBusiness=function(){
		var isBusinessClass=!$scope.selectedBusinessModel.hasOwnProperty("joinRelationships");

		 var confirm = $mdDialog.confirm()
		 .title( isBusinessClass ? sbiModule_translate.load("sbi.meta.delete.businessclass") : sbiModule_translate.load("sbi.meta.delete.businessview") )
		 .ariaLabel('delete Business')
		 .ok(sbiModule_translate.load("sbi.general.continue"))
		 .cancel(sbiModule_translate.load("sbi.general.cancel"));
		   $mdDialog.show(confirm).then(function() {
			   //delete the item;
			   sbiModule_restServices.promisePost("1.0/metaWeb",(isBusinessClass ? "deleteBusinessClass" : "deleteBusinessView"),metaModelServices.createRequestRest({name:$scope.selectedBusinessModel.uniqueName}))
			   .then(function(response){
					metaModelServices.applyPatch(response.data);
			   },function(response){
				   sbiModule_restServices.errorHandler(response.data,sbiModule_translate.load("sbi.generic.genericError"));
			   })


		   }, function() {
		   });
	}

}
function businessModelPropertyControllerFunction($scope, sbiModule_translate,sbiModule_restServices, parametersBuilder,$timeout){
	$scope.businessModelMiscInfo = [ {
		name : "name",
		label : sbiModule_translate.load("name")
	}, {
		name : "description",
		label : sbiModule_translate.load("description")
	}
	];
}
function businessModelAttributeControllerFunction($scope, sbiModule_translate,sbiModule_restServices, parametersBuilder,$timeout,$mdDialog,sbiModule_config){
	$scope.selectedBusinessModelAttributes = [
	                              			{
	                              				label : sbiModule_translate.load("sbi.generic.name"),
	                              				name : "name"
	                              			},
	                              			{
	                              				label : sbiModule_translate
	                              						.load("sbi.meta.model.table.primaryKey"),
	                              				name : "identifier",
	                              				transformer : function(row) {
	                              					return "<md-checkbox ng-disabled='!scopeFunctions.existsBusinessModel(row)' ng-checked='scopeFunctions.isBusinessModelColumnPK(row)' ng-click='scopeFunctions.toggleBusinessModelColumnPK(row)' aria-label='isPrimaryKey'></md-checkbox>"
	                              					// return "<md-checkbox ng-model='row.identifier'
	                              					// aria-label='isPrimaryKey'></md-checkbox>"
	                              				}
	                              			},
	                              			{
	                              				label : sbiModule_translate.load("inUse"),
	                              				name : "added",
	                              				transformer : function(row) {
	                              					return "<md-checkbox ng-checked='scopeFunctions.existsBusinessModel(row)' ng-click='scopeFunctions.toggleBusinessModel(row)' aria-label='isPrimaryKey'></md-checkbox>"
	                              				}
	                              			}

	                              	];

	$scope.selectedBusinessModelAttributesScopeFunctions = {
			translate:sbiModule_translate,
			indexOfBc : function(bk) {
				for (var i = 0; i < $scope.selectedBusinessModel.columns.length; i++) {
					if (angular.equals(
							$scope.selectedBusinessModel.columns[i].uniqueName,
							bk.uniqueName)) {
						return i;
					}
				}
				return -1;
			},

			isBusinessModelColumnPK : function(row) {
				var index = this.indexOfBc(row);
				if (index != -1) {
					return $scope.selectedBusinessModel.columns[index].identifier;
				} else {
					return false;
				}

			},
			toggleBusinessModelColumnPK : function(row) {
				var index = this.indexOfBc(row);
				$scope.selectedBusinessModel.columns[index].identifier = !$scope.selectedBusinessModel.columns[index].identifier;
			},
			existsBusinessModel : function(row) {
				return (this.indexOfBc(row) != -1);
			},
			toggleBusinessModel : function(row) {
				var index = this.indexOfBc(row);
				if (index == -1) {
					$scope.selectedBusinessModel.columns.push(row);
				} else {
					$scope.selectedBusinessModel.columns.splice(index, 1);
				}
			}
		}

}





function businessViewJoinRelationshipsControllerFunction($scope,sbiModule_translate, sbiModule_restServices){
$scope.selectedBusinessViewJoinRelationships=[
               		                       {
            		                    	   label:sbiModule_translate.load("sbi.generic.name"),
            		                    	   name:'name'
            		                       },
            		                       {
            		                    	   label:sbiModule_translate.load("sbi.meta.source.columns"),
            		                    	   name:'sourceColumns',
            		                    	   transformer:function(item){
            			                    		var toret=[];
            			                    		for(var i=0;i<item.length;i++){
            			                    			 toret.push(item[i].tableName+"."+item[i].name);
            			                    		}
            			                    		return toret.join(",");
            		                    	   }
            		                       },
            		                       {
            		                    	   label:sbiModule_translate.load("sbi.meta.target.columns"),
            		                    	   name:'destinationColumns',
            		                    	   transformer:function(item){
            		                    		   var toret=[];
            			                    		for(var i=0;i<item.length;i++){
            			                    			 toret.push(item[i].tableName+"."+item[i].name);
            			                    		}
            			                    		return toret.join(",");
            		                    	   }
            		                       }
            	                       ]
}


function calculatedBusinessColumnsControllerFunction($scope,sbiModule_translate, sbiModule_restServices,$mdDialog,sbiModule_config,metaModelServices ){
	$scope.selectedBusinessModelCalculatedBusinessColumns=[
		                                              {
		                                            	  label:sbiModule_translate.load("sbi.generic.name"),
		                                            	  name:'name'
		                                              }
	                                              ]
	$scope.selectedBusinessModelCalculatedBusinessColumnsScopeFunctions={
			translate:sbiModule_translate,
			addCalculatedField : function(){
				$scope.addCalculatedField();
			}
	}
	$scope.addCalculatedField=function(){
		$mdDialog.show({
			controller: addCalculatedFieldController,
			preserveScope: true,
			locals: {selectedBusinessModel:$scope.selectedBusinessModel},
			templateUrl:sbiModule_config.contextName + '/js/src/meta/templates/addCalculatedField.jsp',
			clickOutsideToClose:false,
			escapeToClose :false,
			fullscreen: true
		}).then(function(){
		});
	}

	$scope.calculatedFieldSpeedOption=[{
					label : sbiModule_translate.load("sbi.generic.delete"),
					icon:'fa fa-trash' ,
					backgroundColor:'transparent',
					color:'black',
					action : function(item,event) {
						$scope.deleteCalculatedField(item);
					}
					 }
			];

	$scope.deleteCalculatedField=function(item){
		 var confirm = $mdDialog.confirm()
		 .title(sbiModule_translate.load("sbi.meta.delete.calculatedField"))
		 .ariaLabel('delete Calculated')
		 .ok(sbiModule_translate.load("sbi.general.continue"))
		 .cancel(sbiModule_translate.load("sbi.general.cancel"));
		   $mdDialog.show(confirm).then(function() {

			   //delete the item;
			   sbiModule_restServices.promisePost("1.0/metaWeb", "deleteCalculatedField",metaModelServices.createRequestRest({name:item.name,sourceTableName:$scope.selectedBusinessModel.uniqueName}))
			   .then(function(response){
					metaModelServices.applyPatch(response.data);
			   },function(response){
				   sbiModule_restServices.errorHandler(response.data,sbiModule_translate.load("sbi.generic.genericError"));
			   })


		   }, function() {
		   });
	}
}