define(['app', 'angularAMD'], function (app, RequestsModule) {

    RequestsModule.service('formSteps', function ($filter, $q, $timeout, $rootScope, StorageService, formFactory, newRequestService, Restangular, formlyConfig, referenceDataFactory, STORAGE_TYPES, SHOW_ASSIGN_MODEL, REQUEST_STATUS,RefRestangular,ARPService) {
        var self = this;
        var service = {};

// This service is for the step access
        service.access = function ($scope) {	   
		   
           if (angular.isUndefinedOrNull($scope.beneficiaryDisplay)) {
                $scope.frmData.beneficiary = $scope.requestType.self ? $scope.loggedUser.userId : $scope.frmData.beneficiary;
                $scope.beneficiaryUserId = $scope.requestType.self ? $scope.loggedUser.userId : $scope.frmData.beneficiary;
                $scope.beneficiaryDisplay = $scope.requestType.self ? $scope.loggedUser.displayName : $scope.selectedItem;
                $scope.beneficiaryUserNameDisplay = $scope.requestType.self ? $scope.loggedUser.displayName : $scope.selectedItem;
            }
    
            $scope.profileLoading = true;

            $scope.getUserDetails($scope.beneficiaryUserId).then(
                function (res) {
                    //Stores the users details in profile scope 
                    $scope.profile = angular.fromJson(res.data.plain());
                },
                // error
                        function (response) {
                        }
                ).finally(function () {
                    $scope.profileLoading = false;
            });
                 
            service.loadStandardProfile($scope);  // Load role/department/region
            
            // set the policy details
            $scope.setPolicy().then(
                function (resPolicyDetails) {
                    $scope.policyCode = resPolicyDetails.policyCode;
                    $scope.policyName = resPolicyDetails.policyName;
                },
                // error
                        function (response) {
                        }
                );
            						
        } // EO service.access()
        

        /* Function to get roles/departments/regions from API and load them */
        service.loadStandardProfile = function ($scope){
            
            $scope.addParams.userId = (angular.isUndefined($scope.frmData.beneficiary))? $scope.beneficiaryUserId:$scope.frmData.beneficiary;
			
            $scope.deptLabel = "Select Department *";
            $scope.regiLabel = "Select Regions *";
            
            if (angular.isUndefinedOrNull($scope.frmData.role)) {
                
                referenceDataFactory.getData($scope.addParams, "snp.refData.spDepartments.data").then(function (response) {
                    var resData = response.data.plain();
                    $scope.deptFullHierarchyByName =   ARPService.getHierarchicalPaths(resData.children, 'name');
                    $scope.dataAccess = [{
                            department: null,
                            subDepartment: null,
                            region: null,
                            departments: resData.children
                        }];

                    $timeout(function () {
                        // console.log(Math.round($('.dropdown-control').innerWidth()));
                        $(".tree-view").css('width', Math.round($('.dropdown-control').innerWidth() - 10));
                    }, 500);
                });
                
              referenceDataFactory.getData($scope.addParams, "snp.refData.spRegions.data").then(function (response) {
                    var resData = response.data.plain();
                    //$scope.regions = resData.children;
					$scope.regions = [{
						region : resData.children
					}];
                    $scope.regionFullHierarchyByName =   ARPService.getHierarchicalPaths(resData.children, 'name');
                	// $scope.regions = resData;
                })
            
         // to select the default value in Functional role
           // $scope.rolesLength = Object.keys($scope.roles).length;

            referenceDataFactory.getData($scope.addParams, "snp.refData.spRoles.data").then(function (response) {
                var tempRoles = {};                
                var resData = response.data.plain();
                angular.forEach(resData.children, function (value, key) {
                    if (angular.isDefined(value.attributes.typeLabel)) {
                        value.attributes.labelName=value.attributes.typeLabel;
                        value.attributes.name=value.name;
                        tempRoles[value.attributes.typeLabel] = value.attributes;
                    } else {
                        value.attributes.labelName=value.attributes.label;
                        value.attributes.name=value.name;
                        tempRoles[value.attributes.label] = value.attributes;
                    }
                })
                $scope.roles = {};
                Object.keys(tempRoles)
                        .sort()
                        .forEach(function (key, value) {
                            $scope.roles [key] = tempRoles[key];
                            /*if(value==0){
                             $scope.roles [key] = tempRoles[key];
                            }*/
                        });
                $scope.rolesLength = Object.keys($scope.roles).length; 
                //console.log("$scope.rolesLength>>",$scope.rolesLength);
                //console.log("$scope.roles>>",$scope.roles);
            });
            }
			
        } // EO service.loadStandardProfile()
        
        //to load the standard and optional application for the logged in user
        service.loadApplications= function ($scope){	            

        	var dataAccess= this.getSelectedDeptRegions($scope);
        	
        	var standardEnvironmentVariables = {	//"noAuthz":"Y",
        			"requestedAccess": {
				"appType":"standard",						  										
				"standardProfile":
						{ 
                            "functionalRole":"standardProfile",
                            "status":"U",
							"scope": dataAccess 
					} 
				}}
        	
        	var optionalEnvironmentVariables = { //"noAuthz":"Y", 
        			"requestedAccess": {
				"appType":"optional",						  										
				"standardProfile":
						{ 
							"functionalRole":"standardProfile",
                            "status":"U",
							"scope": dataAccess 
					} 
				}}
        	
        	$scope.addParams.requestedAccess = {
							    				"appType":"optional",						  										
							    				"standardProfile":
							    						{ 
							    							"functionalRole":"standardProfile",
                                                            "status":"U",
							    							"scope": dataAccess 
							    					} 
							    				}
        	
        	$scope.standardApplicationRequest = { 
					"subjectName": $scope.frmData.beneficiary ,
					"attributeName":  "snp.refData.spApps.data", 
					"environmentVariables": standardEnvironmentVariables
					};
        	$scope.optionalApplicationRequest = { 
					"subjectName": $scope.frmData.beneficiary ,
					"attributeName":  "snp.refData.spApps.data", 
					"environmentVariables":optionalEnvironmentVariables
					};

		
		var optionalAppPromise = RefRestangular.all("","snp.refData.spApps.data").post($scope.optionalApplicationRequest);
         
		optionalAppPromise.then(
        		function(response) {
        			 var tempApps = {}; 
        			 resData = response.data.plain();
        			 angular.forEach(resData.children, function (value, key) {
        				 
                         if (angular.isDefined(value.attributes.label)) {
                        	 value.attributes.disabled=false;
                        	 value.attributes.isSelected=false;
                        	 value.attributes.name=value.name;  
                        	 value.name=value.name;
                        	 value.attributes.appType="optional";
                        	 value.attributes.labelName=value.attributes.label;
                             tempApps[value.name] = value.attributes;
                         } else {
                             value.attributes.labelName=value.attributes.labelName;
                             value.attributes.name=value.name;
                             value.name=value.name;
                             value.attributes.appType="optional";
                             tempApps[value.name] = value.attributes;
                         }
                     })
                     $scope.optionalApplications = {};
        			 $scope.optionalApplicationsArr = [];
        			 
                     Object.keys(tempApps)
                             .sort()
                             .forEach(function (key, value) {
                                 $scope.optionalApplications[key] = tempApps[key];
                                 $scope.optionalApplicationsArr[value]=tempApps[key];
                             });
        		},function(error){
        			console.log('Error while retrieving the optional Apps');
        		})
        		
        		var standardAppPromise = RefRestangular.all("","snp.refData.spApps.data").post($scope.standardApplicationRequest);
          
		standardAppPromise.then(
        		function(response) {
        			var tempApps = {}; 
        			var resData = response.data.plain();
        			
        			 angular.forEach(resData.children, function (value, key) {
                         if (angular.isDefined(value.attributes.label)) {
                        	 value.attributes.name=value.name;  
                        	 value.name=value.name;
                        	 value.attributes.appType="standard";
                        	 value.attributes.labelName=value.attributes.label;
                        	 tempApps[value.name] = value.attributes;
                         } else {
                             value.attributes.labelName=value.attributes.labelName;
                             value.attributes.name=value.name;
                             value.attributes.appType="standard";
                             value.name=value.name;
                             tempApps[value.name] = value.attributes;
                         }
                     })
                    $scope.frmData.defaultApplications = [];
                     Object.keys(tempApps)
                             .sort()
                             .forEach(function (key, value) {
                            	 // to do remove if clause
                            	 $scope.frmData.defaultApplications[value] = tempApps[key];
                             });
                     
                    // $scope.frmData.defaultApplications = 
                     
                    	 console.log($scope.frmData.defaultApplications);
                    	 
                    	 //  need to remove
                    	// $scope.frmData.defaultApplications=$filter('filter')($scope.frmData.defaultApplications,{'name':'ARP'},true);
                    		
                     
        		},function(error){
        			console.log('Error while retrieving the optional Apps');
        		})
        		
        }
        
        // arrange the selected department and regions 
        service.getSelectedDeptRegions = function ($scope){
        	
            $scope.dataAccessObjects = [];
            
        	angular.forEach($scope.dataAccess, function(value){
        		if(!angular.isUndefinedOrNull(value)){
        			var dataAccessObject = {};
        			console.log("department : "+value.department[0].name+" :: region : "+value.region[0].name);
        			if(angular.isDefined($scope.deptFullHierarchyByName)){
        				dataAccessObject.department = $scope.deptFullHierarchyByName[value.department[0].name];
        			}
        			if(angular.isDefined($scope.regionFullHierarchyByName)){
        				dataAccessObject.region = $scope.regionFullHierarchyByName[value.region[0].name];
        			}
        			if(angular.isDefined($scope.frmData.role.name)) {
                        dataAccessObject.role=$scope.frmData.role.name;
                    }
        			
        			$scope.dataAccessObjects.push(dataAccessObject);
        		}
        	});
        	
        	console.log($scope.dataAccessObjects);
        	return $scope.dataAccessObjects;
        	
        }
                
        
        service.optapplications = function ($scope) {
                	if(angular.isUndefinedOrNull($scope.frmData.optionalApplications)){
                		this.loadApplications($scope);	
                	}
                	
                    StorageService.removeData('vm.fields', STORAGE_TYPES.local, "");
                    // initialize requestables loading to true
                    $scope.isLoadingRequestables = true;
                    // Check the request mode //
                    $scope.userRequestModeAccount = {};
                }
                
                
                // This service is for the step form
        service.optfunctions = function ($scope) {
                	
                    // Set any hiddenfields (if any) in current scope
                	//$scope.frmData.optionalApplications = $scope.data;
                    if ($scope.hiddenFields) {
                        $scope.vm.model.hiddenFields = $scope.hiddenFields;
                    }
                    $rootScope.primaryCoreRole = false;
                    $scope.showNoChange = false;
                    $scope.accessViolation = false;
                    // Set this variable to determine whether its revised or new
                    $scope.modeRequestId = undefined;

                    // Creates the object to search the account details from
					// user details
                    var searchObj = {
                        'target_name-value': $scope.frmData.application
                    };

                    $scope.frmData.applicationList = [];
                    angular.forEach($scope.frmData.exceptionalApp, function (application) {
                        $scope.frmData.applicationList.push(application);
                    })
                    
                    angular.forEach($scope.frmData.optionalApplications, function (application) {
                        $scope.frmData.applicationList.push(application);
                    })
                    
                    
                    
                    angular.forEach($scope.frmData.defaultApplications, function (application) {
                        $scope.frmData.applicationList.push(application);
                    })

                    
                    if ($scope.frmData.applicationList.length) {

                        // Put the access name in fromLocalMetadata to load the
						// meta-data from local folder
                        var fromLocalMetadata = [
                            // "CORE"
                        ];


                        $scope.form = $scope.frmData.application;
                        $scope.header = $scope.frmData.application;
                        // $scope[$scope.form + "formConfig"] = formlyConfig;
                        // Set the parameters to send in formly service
                        console.log($scope.addParams);
                        
                        
                        		$scope.addParams.application= $scope.frmData.application;
                        		$scope.addParams.userId= $scope.frmData.beneficiary;
                                    // unauth: $scope.selectedObj.unauth

                        // One more parameters added modeRequestId to know
						// whether it is revised or new request
                        if (!$scope.accessViolation) {
                            $scope.addParams.modeRequestId = $scope.modeRequestId;
                        }


                        $scope.patchPromise = false;
                        $scope.metadataPromise = false;

                        var vmfields = StorageService.getData('vm.fields', STORAGE_TYPES.local, "");
                        if (angular.isUndefined(vmfields)) {
                            /* New Demo code */
                            $scope.formLoading = true;
                            var metadataPromise = $scope.getMetaDataFromLocal();
                            metadataPromise.then(function (response) {
                            	$scope.vm.fields = {};
                            	console.log("$scope.vm.fields",response);
                                $scope.vm.fields = angular.copy(response);
                                var arrShowAssignModel = SHOW_ASSIGN_MODEL.ELEMENT_TYPE;
                                $scope.showCustomAddSelect(arrShowAssignModel);
                                var promises = [];
                                console.log(" $scope.addParams",$scope.addParams);
                                promises.push(formFactory.formlyService(formlyConfig, $scope.templatePath, $scope.addParams, $scope));
                                $q.all(promises).then(function () {
                                    $scope.formLoading = false;
                                });
                                $scope.formLoading = false;
                            });
                            
                            StorageService.putData('vm.fields', $scope.vm.fields, STORAGE_TYPES.local);
                        }

                    }
                }
        
                // This service is for the step summary
                service.summary = function ($scope, $state) {
                	console.log("summary page called");
                    $scope.title = newRequestService.getRequestMode($scope.modeRequestId, $scope.accessViolation, $scope.frmData.accessType, $scope.selectedApplicationDisplay);
                    // Find the PostRevoke and put into scope to display
                    // $scope.revokeDisplay = $scope.showPostRevoke();
                    $scope.objProcessModel = newRequestService.processModel($scope);
                    // $scope.displayForm = $scope.objProcessModel.display;

                    // Create the final json to display in summary 
                    $scope.displayForm = {}
                    angular.forEach($scope.objProcessModel.display, function (objectValue, objectKey) {
                        if (angular.isUndefined($scope.displayForm[objectValue.applicationName])) {
                            $scope.displayForm[objectValue.applicationName] = [];
                        }
                        $scope.displayForm[objectValue.applicationName].push(objectValue);
                    })


                    // Create final josn appliaction wise json to submit 
                    $scope.requestForm = {}
                    $scope.apireqdata = {
                        "details": {
                            "justification": "testing with new format of json"
                        },
                        "Operations": []
                    }

                    angular.forEach($scope.objProcessModel.request, function (objectValue, objectKey) {
                        if (angular.isUndefined($scope.requestForm[objectValue.applicationName])) {
                            $scope.requestForm[objectValue.applicationName] = [];
                        }
                        var apisubmitData = newRequestService.getApiJson($scope, objectKey, objectValue, objectValue.applicationName);

                        if ($filter('filter')($scope.apireqdata.Operations, {'target': objectValue.applicationName}, true).length) {
                            $filter('filter')($scope.apireqdata.Operations, {'target': objectValue.applicationName}, true)[0].data.Operations.push(apisubmitData.reqdata.data.Operations[0])
                        } else {
                            $scope.apireqdata.Operations.push(apisubmitData.reqdata)
                        }


                        // $scope.requestForm[objectValue.applicationName].push(brifcaseData.reqdata);
                    })
                }

                return service;
            });

            RequestsModule.service('newRequestService', function ($filter, $mdDialog, referenceDataFactory, VIEW_PATH, REMOVE_VALUE, ARPService) {
                var self = this;
                var service = {};
                
                // Opens the dialog on click of NEXT
                service.opendialog = function ($event, $scope) {
                    var viewPath = VIEW_PATH.mainview + 'requests/dialog/precanned-justification-dialog.html';
                    $mdDialog.show({
                        controller: DialogCtrl,
                        scope: $scope,
                        preserveScope: true,
                        controllerAs: 'ctrl',
                        templateUrl: viewPath,
                        targetEvent: $event,
                        clickOutsideToClose: false
                    }).then(function (actionData) {
                        // $scope.comment = actionData;
                    }, function () {
                        // $scope.comment = '';
                    });

                    function DialogCtrl() {
                        var self = this;
                        self.cancel = function ($event) {
                            $mdDialog.cancel();
                            // Reset Precanned dynamic data
                            angular.forEach($scope.constPrecannedFields, function (precannedFields) {
                                $scope[precannedFields + 'display'] = "";
                                $scope[precannedFields + '_duplicate'] = [];
                                $scope.precannedRoles = "";
                                $scope.precannedJustification = "";
                            })
                        };
                        self.finish = function ($event) {
                            $mdDialog.hide();
                            // Switch to the nextTab
                            service.processRequest($scope);
                        };
                    }
                }

// If everything is validated on from steps. its redirect you to summary step
                service.processRequest = function ($scope) {
                    $scope.vm.model.justification = angular.copy($scope.customPrecannedJustification);
                    $scope.nextTab();
                } // EO service.processRequest()

// Returns the request title either its revised or new
                service.getRequestMode = function (modeType, accessViolation, accessType, application) {
                    var mode = angular.isDefined(modeType) && !accessViolation ? 'update' : 'new';
                    if (mode == 'new') {
                        return "Access to " + accessType + " : " + application + " [NEW] ";
                    } else if (mode == "update") {
                        return "Access to " + accessType + " : " + application + " [REVISE] ";
                    }
                };
// Validate the form fields and returns the object
                self.validateDefaultFormControls = function (modelkey, modelElement) {
                    var displayVal = modelElement;
                    if (modelElement === true || modelElement === "yes") {
                        displayVal = "Yes";
                    } else if (modelElement === false || modelElement === "no") {
                        displayVal = "No";
                    } else {
                        if (modelkey == "endDate") {
                            displayVal = $filter('date')(modelElement, "MM/dd/yyyy h:mma Z");
                        } else if (localStorage.getItem('customradioLabel-' + modelkey) != null) {
                            var tempVal = angular.fromJson(localStorage.getItem('customradioLabel-' + modelkey));
                            if ($filter('filter')(tempVal, {'name': modelElement}, true).length) {
                                displayVal = $filter('filter')(tempVal, {'name': modelElement}, true)[0].label;
                            }
                        } else if (modelElement && localStorage.getItem('customLabel-' + modelkey) != null) {
                            var tempVal = angular.fromJson(localStorage.getItem('customLabel-' + modelkey));
                            displayVal = tempVal.label ? tempVal.label : tempVal;
                        }
                    }

                    var tempObjStore = {
                        value: displayVal,
                        markrow: false
                    };
                    return tempObjStore;
                }
// Set the display format of custom treedropdown
                self.setDisplayFormat = function (objFieldElement, tempObjStoreDetails) {
                    // Arrange the display as in the meta-data//
                    var arrStoreSequence = {};
                    angular.forEach(objFieldElement.templateOptions.fields[0].fieldGroup, function (element) {
                        arrStoreSequence[element.name] = "";
                    })

                    var tempObjStore = [];
                    angular.forEach(tempObjStoreDetails, function (element) {
                        var arrTemp = {};
                        angular.forEach(arrStoreSequence, function (innerElement, innerKey) {
                            arrTemp[innerKey] = element[innerKey];
                        })

                        if (angular.isDefined(element.markrow)) {
                            arrTemp['markrow'] = element.markrow;
                        }
                        tempObjStore.push(arrTemp);
                    })
                    return tempObjStore;
                    // Arrange the display as in the meta-data//
                }
// Compare the two objects PATCH and FORM-MODEL
                self.compareCustomaddselect = function (postDetails, formModel) {
                    var postDetailsIds = {};
                    var formModelIds = {};
                    var result = [];
                    if (angular.isArray(postDetails)) {
                        postDetails.forEach(function (el, i) {
                            postDetailsIds[el.value] = postDetails[i];
                        });
                    }

                    if (formModel && formModel.length) {
                        formModel.forEach(function (el, i) {
                            formModelIds[el.value] = formModel[i];
                        });
                    }
                    for (var i in postDetailsIds) {
                        if (!formModelIds.hasOwnProperty(i)) {
                            result.push(postDetailsIds[i]);
                        }
                    }
                    return(result);
                };
// Convert the boolean value to string in model
                self.setboolToStringPost = function (modelElement, objFieldElement, modelkey, fieldType) {
                    var arrStoreObj = [];
                    for (var i = 0; i < modelElement.length; i++) {
                        var tempObject = {};
                        angular.forEach(modelElement[i], function (objValue, objKey) {
                            if (angular.equals(fieldType, 'multicheckbox')) {
                                var multicheckboxLabel = angular.fromJson(localStorage.getItem('multicheckboxLabel-' + modelkey));
                                var dispKey = $filter('filter')(multicheckboxLabel, {'name': objKey}, true)[0].label;
                            } else {
                                if ($filter('filter')(objFieldElement.templateOptions.fields[0].fieldGroup, {'key': objKey}, true).length) {
                                    var dispKey = $filter('filter')(objFieldElement.templateOptions.fields[0].fieldGroup, {'key': objKey}, true)[0].name;
                                }
                            }


                            if (objValue === true) {
                                tempObject[dispKey] = "Yes";
                            } else if (objValue === false) {
                                tempObject[dispKey] = "No";
                            } else {
                                tempObject[dispKey] = objValue;
                            }
                        });
                        arrStoreObj.push(tempObject);
                    }
                    return arrStoreObj;
                }

// Adds the additinal attribute "markrow" with model
                self.markModel = function (modelElement, modelkey, patchDetails) {
                    var processedModelElement = angular.copy(modelElement);
                    if (angular.isDefined(patchDetails)) {
                        // Find out the re insert object //
                        var arrReInsert = [];
                        // console.log("processedModelElement-markModel-Before",processedModelElement);

                        if (processedModelElement && processedModelElement.length) {
                            for (var i = 0; i < processedModelElement.length; i++) {
                                var objValue = processedModelElement[i];
                                if (objValue.value == '') {
                                    var checkObj = angular.copy(objValue);
                                    delete checkObj.value;
                                    // console.log("checkObj " +
									// angular.toJson(checkObj));
                                    // console.log("patchDetails[modelkey] " +
									// angular.toJson(patchDetails[modelkey]));
                                    if (angular.isDefined(patchDetails[modelkey]) && $filter('filter')(patchDetails[modelkey], checkObj, true).length) {
                                        var foundObj = $filter('filter')(patchDetails[modelkey], checkObj, true)[0];
                                        arrReInsert.push(foundObj);
                                        // angular.saveDataToLocalStorage(foundObj,
										// 'removeDuplicateTreedropdownElement');
                                        // foundObj.value='';
                                        // console.log("foundObj
										// ",angular.toJson(foundObj));
                                        // console.log("processedModelElement-markModel-between",angular.toJson(processedModelElement));
                                        processedModelElement.splice(i, 1);
                                        i--; // decrement
                                    }
                                }
                                if (!objValue.value) {
                                    objValue.markrow = "add";
                                }
                            }
                        }

                        // console.log("processedModelElement-markModel-After",processedModelElement);
                        // find the removed element //
                        if (angular.isDefined(patchDetails[modelkey])) {
                            // console.log('patchDetails[modelkey]',patchDetails[modelkey]);
                            // console.log('processedModelElement',processedModelElement);
                            var removedElement = self.compareCustomaddselect(patchDetails[modelkey], processedModelElement);
                            angular.forEach(removedElement, function (objRemoved) {

                                if (!$filter('filter')(arrReInsert, {value: objRemoved.value}, true).length) {
                                    objRemoved.markrow = "remove";
                                }
                                if (!processedModelElement || !processedModelElement.length) {
                                    processedModelElement = [];
                                }

                                processedModelElement.push(objRemoved);
                            });
                        }

                    }
                    // console.log("Processed modelElement
					// FINAL",processedModelElement);
                    return processedModelElement;
                }
                //

// Get the full-name of selected value from the localstorage to display in
// summary
                self.treedropdownManipulate = function (modelElement, byType, valueBy, format) {
                    var arrTemp = [];
                    angular.forEach(modelElement, function (arrayVal, arrayKey) {
                        var objTemp = {};
                        angular.forEach(arrayVal, function (innerarrayVal, innerarrayKey) {
                            if (innerarrayKey !== '$$hashKey' && innerarrayKey != 'value') {
                                if (angular.isDefined(innerarrayVal[0].children) && angular.isDefined(innerarrayVal[0].attributes)) {

                                    var arrPath = innerarrayKey.split("-");
                                    var lastValue = arrPath[arrPath.length - 1];
                                    var treePathByType = angular.fromJson(localStorage.getItem('treedropdownModelBy' + byType + '-' + lastValue));


                                    objTemp[innerarrayKey] = treePathByType[eval("innerarrayVal[0]." + valueBy)];
                                    if (angular.equals(format, "displayJson")) {
                                        objTemp[innerarrayKey] = eval("innerarrayVal[0]." + valueBy);
                                    }
// if (angular.equals(format, "requestJson")) {
// objTemp[innerarrayKey] = treePathByType[eval("innerarrayVal[0]." + valueBy)];
// } else {
// objTemp[innerarrayKey] = eval("innerarrayVal[0]." + valueBy);
// }


                                } else {
                                    objTemp[innerarrayKey] = innerarrayVal;
                                }


                            } else {
                                objTemp['value'] = innerarrayVal;
                            }
                        })
                        arrTemp.push(objTemp);
                    })
                    return arrTemp;
                };

// Convert the format of patch json structure into model structure for
// treedropdown
                service.convertPatchformat = function (patchDetails, attributeName) {
                    angular.forEach(patchDetails, function (patchElement, patchkey) {
                        if (angular.isArray(patchElement)) {
                            angular.forEach(patchElement, function (patchVal, patchkey) {
                                angular.forEach(patchVal, function (objectVal, objectKey) {
                                    if (angular.isObject(objectVal)) {
                                        patchVal[objectKey] = eval("objectVal." + attributeName);
                                    } else {
                                        patchVal[objectKey] = objectVal;
                                    }
                                })
                            })

                        }

                    })
                    return patchDetails;
                };
// Parse the patch data and convert it into model strucure
                service.patchformModel = function ($scope, $q, patchDetails) {
                    var deferred = $q.defer();
                    var formModel = {};
                    angular.forEach(patchDetails, function (patchVal, patchkey) {
                        // var dataVal;

                        var modelVal;
                        var objField = $scope.filterNames("key", patchkey);
                        if (!angular.isUndefinedOrNull(objField)) {
                            switch (objField.type) {
                                case "multicheckbox":
                                    var multiselectModel = {};
                                    angular.forEach(patchVal, function (multicheckboxObj) {
                                        var multicheckboxLabel = multicheckboxObj[objField.templateOptions.key];
                                        multiselectModel[multicheckboxLabel] = true;
                                    })
                                    modelVal = multiselectModel;
                                    break;
                                case "multiselect":
                                    modelVal = patchVal;
                                    break;
                                case "customaddselect":
                                    modelVal = patchVal;
                                    break;
                                case "customaddtextbox":
                                    modelVal = patchVal;
                                    break;
                                case "treedropdownselect":
                                    angular.forEach(patchDetails[objField.key], function (element) {
                                        angular.forEach(element, function (elementValue, key) {

                                            // if (key != 'value' && key !=
											// 'practiceArea') {
                                            if (key.indexOf("region") !== -1 || key.indexOf("department") !== -1) {

                                                var arrElement = key.split('-');
                                                var lastElement = arrElement[arrElement.length - 1];
                                                var beneficiaryElement = $scope.frmData.beneficiary + "_" + lastElement;

                                                var filterByKey = $filter('filter')(objField.templateOptions.fields[0].fieldGroup, {'key': key}, true)[0];
                                                if (angular.equals(filterByKey.type, 'treedropdown')) {
                                                    // filterByKey.templateOptions.disabled
													// = true;
                                                    var addParams = {
                                                        application: $scope.frmData.application,
                                                        userId: $scope.frmData.beneficiary
                                                    };
                                                    addParams.field = key;
                                                    var arrPath = elementValue.split(':');
                                                    var lastValue = arrPath[arrPath.length - 1];

                                                    var resData = angular.copy($scope.fillcustomdropdown[beneficiaryElement]);
                                                    if ($filter('filterTree')(resData.children, lastValue, "name", true).length) {
                                                        element[key] = $filter('filterTree')(resData.children, lastValue, "name", true);
                                                        element[key].selected = true;
                                                        element[key].isExpanded = true;
                                                        element[key].isActive = false;
                                                    }


                                                } else {
                                                    // element[key] =
													// elementValue.value;
                                                    element[key] = elementValue;
                                                }

                                            }

                                        })

                                    })
                                    modelVal = patchVal;
                                    break;
                                default:
                                    if (angular.isDefined(patchVal.value)) {
                                        patchVal = patchVal.value;
                                    }
                                    if (patchVal == "true") {
                                        modelVal = true;
                                    } else if (patchVal == "false") {
                                        modelVal = false;
                                    } else {
                                        modelVal = patchVal;
                                    }

                            }

                            formModel[patchkey] = modelVal;
                        }
                    })
                    deferred.resolve(formModel);
                    return deferred.promise;
                };

// Process the model for both display and for API Post
                service.processModel = function ($scope) {
                    if ($scope.vm.model.hiddenFields) {
                        $scope.hiddenFields = $scope.vm.model.hiddenFields;
                        delete $scope.vm.model.hiddenFields;
                    }
                    // console.log('$scope.vm.model', $scope.vm.model);

                    var formModel = angular.copy($scope.vm.model);
                    var modeRequestId = $scope.modeRequestId && !$scope.accessViolation;
                    var patchDetails = angular.copy($scope.patchDetails);
                    var addParams = $scope.addParams;
                    var coreApiStorage = $scope.coreApiStorage;
                    var allApiStorage = $scope.allApiStorage;
                    // console.log('allApiStorage',allApiStorage);
                    // This is for the application LINX to deleting

                    if (angular.equals(addParams.application, 'LINX')) {
                        if (formModel.applicationRole != 'Analyst' && formModel.applicationRole != 'CRISILAnalyst') {
                            delete formModel['russianArticle'];
                            delete formModel['japaneseArticle'];
                        }
                        
                    }

                    // Remove spectators before it goes to display & API as it
					// need to set in customselect (formservice)
                    // to show spectator ID textbox on change ALM # 400
                    if (angular.equals(addParams.application, 'CDOCFE') && angular.isDefined(formModel.spectators)
                            && angular.equals(formModel.spectators[0], {})) {
                        formModel['spectators'] = [];
                    }
                    // Set the questions as NULL~NULL that if first question
					// selected as no in CORE
                    if (angular.equals(addParams.application, 'CORE') && modeRequestId) {
                        if (angular.isDefined(formModel.confidentialData) && angular.equals(formModel.confidentialData, "no")) {
                            if (angular.isDefined(formModel.editInformation)) {
                                formModel.editInformation = REMOVE_VALUE;
                            }
                            if (angular.isDefined(formModel.SIAdminGroup)) {
                                formModel.SIAdminGroup = REMOVE_VALUE;
                            }

                        } else if (angular.isDefined(formModel.editInformation) && angular.equals(formModel.editInformation, "no")) {
                            if (angular.isDefined(formModel.SIAdminGroup)) {
                                formModel.SIAdminGroup = REMOVE_VALUE;
                            }
                        }
                    }
                    var objMergeRequestDisplay = {
                        request: "",
                        display: ""
                    }
                    var objRequest = {};
                    var objDisplay = {};
                    // This below code is for sequence display
                    var objDisplaySequence = {};
                    // console.log("formModel", formModel);
                    angular.forEach(formModel, function (modelElement, modelkey) {
                        var objFieldElement = $scope.filterNames("key", modelkey);
                        if (angular.isDefined(modelElement) && !angular.isUndefinedOrNull(objFieldElement) && angular.isDefined(objFieldElement.data) && angular.isDefined(objFieldElement.data.displaySequence && !objFieldElement.hide ==true )) {
                            var objTempElement = {};
                            var objStoreElement = {
                                "formModel": modelElement,
                                "formField": objFieldElement
                            };
                            objTempElement[modelkey] = objStoreElement;
                            objDisplaySequence[objFieldElement.data.displaySequence] = objTempElement;
                        }
                    });
                    objDisplaySequence = angular.sortObjectByKey(objDisplaySequence);
                    angular.forEach(objDisplaySequence, function (sequenceElement) {
                        angular.forEach(sequenceElement, function (objStoreElement, modelkey) {
                            var modelElement = objStoreElement.formModel;
                            var objFieldElement = objStoreElement.formField;
                            // The extra parameters removed from
							// "treedropdownselect" So its get compared properly
                            if (objFieldElement.type == 'treedropdownselect') {
                                angular.forEach(modelElement, function (modelElementValue, modelElementKey) {
                                    angular.forEach(modelElementValue, function (innerValue) {
                                        if (angular.isArray(innerValue)) {
                                            delete  innerValue[0].selected;
                                            delete  innerValue[0].isExpanded;
                                            delete  innerValue[0].isActive;
                                        }
                                    })
                                })
                            }
                            var tempObjRequest = self.getRequestSubmission(modelElement, modelkey, modeRequestId, objFieldElement, patchDetails);
                            console.log("tempObjRequest",tempObjRequest);
                            angular.extend(objRequest, tempObjRequest);
                            
                            var tempObjDisplay = self.setDisplayForm(modelElement, modelkey, modeRequestId, objFieldElement, patchDetails, coreApiStorage, allApiStorage);
                            angular.extend(objDisplay, tempObjDisplay);
                            console.log("tempObjDisplay",tempObjDisplay);
                        });
                    });
                    // End

                    objMergeRequestDisplay.request = objRequest;
                    objMergeRequestDisplay.display = objDisplay;
                    return objMergeRequestDisplay;
                };

// Build request for POST/PATCH submission
                self.getRequestSubmission = function (modelElement, modelkey, modeRequestId, objFieldElement, patchDetails) {
                    // Whether to submit deleted model elements in PATCH Api
					// request or not
                    var submitDeletedElements = true;
                    var requestModel = {};
                    switch (objFieldElement.type) {
                        case "helper":
                            break;

                        case "multicheckbox":
                            var tempObjStore = {
                                type: objFieldElement.type,
                                name: objFieldElement.name,
                                applicationName: objFieldElement.data.applicationName,
                                details: []
                            };
                            if (modeRequestId) { // PATCH SUBMISSION
                                var arrInsertKey = [];
                                angular.forEach(modelElement, function (elementVal, elementKey) {
                                    if (Boolean(elementVal) === false) {
                                        return true;
                                    }
                                    var elementValue = "";
                                    var searchObj = {};
                                    searchObj[objFieldElement.templateOptions.key] = elementKey;
                                    if (angular.isDefined(patchDetails) && $filter('filter')(patchDetails[modelkey], searchObj, true).length) {
                                        elementValue = $filter('filter')(patchDetails[modelkey], searchObj, true)[0].value;
                                    }

                                    var objTemp = {};
                                    objTemp["value"] = elementValue;
                                    objTemp[objFieldElement.templateOptions.key] = elementKey;
                                    arrInsertKey.push(objTemp);
                                });
                                modelElement = arrInsertKey;
                                modelElement = self.markModel(modelElement, modelkey, patchDetails);
                                requestModel[objFieldElement.key] = modelElement;
                            } else { // POST SUBMISSION
                                var arrInsertKey = [];
                                angular.forEach(modelElement, function (elementVal, elementKey) {
                                    if (Boolean(elementVal) === false) {
                                        return true;
                                    }

                                    var objTemp = {};
                                    objTemp[objFieldElement.templateOptions.key] = elementKey;
                                    objTemp['value'] = '';
                                    arrInsertKey.push(objTemp);
                                });
                                if (arrInsertKey.length) {
                                    modelElement = arrInsertKey;
                                    tempObjStore.details.push(modelElement);
                                    requestModel[objFieldElement.key] = tempObjStore;
                                }
                            }
                            break;

                        case "multiselect":
                            var tempObjStore = {
                                type: objFieldElement.type,
                                name: objFieldElement.name,
                                applicationName: objFieldElement.data.applicationName,
                                details: []
                            };
                            if (modeRequestId) { // PATCH SUBMISSION
                                if (submitDeletedElements === false && modelElement == null) {
                                    break;
                                }
                                // patchDetails =
								// self.convertPatchformat(patchDetails,"value");
                                modelElement = self.markModel(modelElement, modelkey, patchDetails);
                                requestModel[objFieldElement.key] = modelElement;
                            } else { // POST SUBMISSION
                                if (modelElement != null && modelElement.length) {
                                    tempObjStore.details.push(modelElement);
                                    requestModel[objFieldElement.key] = tempObjStore;
                                }
                            }
                            break;

                        case "customaddtextbox":
                            var tempObjStore = {
                                type: objFieldElement.type,
                                name: objFieldElement.name,
                                applicationName: objFieldElement.data.applicationName,
                                details: []
                            };
                            if (modeRequestId) { // PATCH SUBMISSION
                                modelElement = self.markModel(modelElement, modelkey, patchDetails);
                                requestModel[objFieldElement.key] = modelElement;
                            } else { // POST SUBMISSION
                                tempObjStore.details.push(modelElement);
                                requestModel[objFieldElement.key] = tempObjStore;
                            }
                            break;
                        case "customaddselect":
                            var tempObjStore = {
                                type: objFieldElement.type,
                                name: objFieldElement.name,
                                applicationName: objFieldElement.data.applicationName,
                                details: []
                            };
                            if (modeRequestId) { // PATCH SUBMISSION
                                modelElement = self.markModel(modelElement, modelkey, patchDetails);
                                requestModel[objFieldElement.key] = modelElement;
                            } else { // POST SUBMISSION
                                tempObjStore.details.push(modelElement);
                                requestModel[objFieldElement.key] = tempObjStore;
                            }
                            break;
                        case "treedropdownselect":
                            var tempObjStore = {
                                type: objFieldElement.type,
                                name: objFieldElement.name,
                                applicationName: objFieldElement.data.applicationName,
                                details: []
                            };
                            if (modeRequestId) { // PATCH SUBMISSION
                                modelElement = self.treedropdownManipulate(modelElement, "Name", "name");
                                modelElement = self.markModel(modelElement, modelkey, patchDetails);
                            } else { // POST SUBMISSION
                                modelElement = self.treedropdownManipulate(modelElement, "Name", "name");
                                tempObjStore.details.push(modelElement);
                            }
                            // watch for the empty & single value

                            if (!angular.isUndefinedOrNull(modelElement) && modelElement && Object.keys(modelElement[0]).length > 1 && Object.keys(modelElement[0]).length != 0) {
                                requestModel[objFieldElement.key] = tempObjStore;
                            }

                            break;
                        case "checkbox":
                            var tempObjStore = {
                                type: objFieldElement.type,
                                name: objFieldElement.name,
                                applicationName: objFieldElement.data.applicationName,
                                details: []
                            };
                            var displayElement = true;
                            if (angular.isDefined(objFieldElement.data)) {
                                if (objFieldElement.data.disablePost) {
                                    displayElement = false;
                                }
                            }

                            if (displayElement) {
                                if (modeRequestId) { // PATCH SUBMISSION
                                    if (submitDeletedElements === false && modelElement == null) {
                                        break;
                                    }
                                    var objTemp = {
                                        value: modelElement
                                    };
                                    if (angular.isDefined(patchDetails) && angular.isDefined(patchDetails[modelkey])) {
                                        if (modelElement == null) {
                                            objTemp.value = patchDetails[modelkey];
                                            objTemp.markrow = "remove";
                                        } else if (Boolean(patchDetails[modelkey]) != modelElement) {
                                            objTemp.markrow = "replace";
                                        }
                                    }
                                    requestModel[objFieldElement.key] = objTemp;
                                } else { // POST SUBMISSION
                                    if (modelElement != null) {
                                        tempObjStore.details.push(modelElement);
                                        requestModel[objFieldElement.key] = tempObjStore;
                                    }
                                }
                            }
                            break;
                        case "treedropdown":
                            var tempObjStore = {
                                type: objFieldElement.type,
                                name: objFieldElement.name,
                                applicationName: objFieldElement.data.applicationName

                            };
                            if (modeRequestId) { // PATCH DISPLAY

                            } else {// POST DISPLAY
                                tempObjStore.details = modelElement[0].name;
                            }
                            requestModel[objFieldElement.key] = tempObjStore;
                            break;
                        case "multiselectfullview":
                            var tempObjStore = {
                                type: objFieldElement.type,
                                name: objFieldElement.name,
                                applicationName: objFieldElement.data.applicationName,
                                details: []
                            };
                            if (modeRequestId) { // PATCH DISPLAY

                            } else {// POST DISPLAY
                                angular.forEach(modelElement, function (objValue, objKey) {
                                    var treePathByNameLabel = angular.fromJson(localStorage.getItem('treedropdownModelByNameLabel-' + modelkey));
                                    var objMark = {};
                                    objMark[objFieldElement.templateOptions.key] = treePathByNameLabel[objValue.name];
                                    tempObjStore.details.push(objMark);
                                })

                            }
                            requestModel[objFieldElement.key] = tempObjStore;
                            break;
                        default:
                            var tempObjStore = {
                                type: objFieldElement.type,
                                name: objFieldElement.name,
                                applicationName: objFieldElement.data.applicationName,
                                details: []
                            };
                            if (modeRequestId) { // PATCH SUBMISSION
                                if (modelkey != 'voterFlag' && submitDeletedElements === false && modelElement == null) {
                                    break;
                                }
                                var objTemp = {
                                    value: modelElement
                                };
                                if (angular.isDefined(patchDetails) && angular.isDefined(patchDetails[modelkey])) {
                                    // var objPatchDetails =
									// patchDetails[modelkey];
                                    // var modelValueCheck =
									// angular.isDefined(objPatchDetails) ?
									// patchDetails[modelkey].value :
									// patchDetails[modelkey];
                                    if (modelElement == null) {	// ||
																// modelElement
																// == ""
                                        objTemp.value = angular.isDefined(patchDetails[modelkey].value) ? patchDetails[patchDetails[modelkey].value] : patchDetails[modelkey];
                                        if (modelkey == 'voterFlag') {
                                            objTemp.value = "no";
                                        }
                                        objTemp.markrow = "remove";
                                    } else if (patchDetails[modelkey] != modelElement) {
                                        objTemp.markrow = "replace";
                                    }
                                }
                                requestModel[objFieldElement.key] = objTemp;
                            } else { // POST SUBMISSION
                                if (modelElement != null) {
                                    tempObjStore.details.push(modelElement);
                                    requestModel[objFieldElement.key] = tempObjStore;
                                }
                            }

                    }
                    return requestModel;
                };

// Display form field changes in Summary step
                self.setDisplayForm = function (modelElement, modelkey, modeRequestId, objFieldElement, patchDetails, coreApiStorage, allApiStorage) {
                    var displayModel = {};
                    // console.log("multicheckbox",objFieldElement.type);
                    keyValue = '';
                    keyValue = objFieldElement.key;
                    if(objFieldElement.key.indexOf(objFieldElement.data.applicationName)>-1)
                    	{
                    	console.log("replacing key");
                    	keyValue = objFieldElement.key.replace(objFieldElement.data.applicationName,'');
                    	}
                   
                    switch (objFieldElement.type) {
                        case "helper":
                            break;
                        case "multicheckbox":
                        	
                            var tempObjStore = {
                                type: objFieldElement.type,
                                name: objFieldElement.name,
                                key : objFieldElement.key,
                                applicationName: objFieldElement.data.applicationName,
                                details: []
                            };
                            var multicheckboxNameLabel = angular.fromJson(localStorage.getItem('multicheckboxModelByNameLabel-' + modelkey));
                            // console.log("multicheckboxNameLabel[elementKey]",multicheckboxNameLabel[elementKey])
                            if (modeRequestId) { // PATCH DISPLAY
                                angular.forEach(modelElement, function (element, elementKey) {
                                    var searchObj = {};
                                    searchObj[objFieldElement.templateOptions.key] = elementKey;
                                    var elementValue = "";
                                    if ($filter('filter')(patchDetails[modelkey], searchObj, true).length) {
                                        elementValue = $filter('filter')(patchDetails[modelkey], searchObj, true)[0].value;
                                    }

                                    if (!elementValue && Boolean(element) === false) {
                                        return true;
                                    }
                                    var markrow;
                                    if (!elementValue && Boolean(element) === true) {
                                        markrow = "new";
                                    } else if (elementValue && Boolean(element) === false) {
                                        markrow = "remove";
                                    } else {
                                        markrow = "old";
                                    }



                                    var objMark = {
                                        name: multicheckboxNameLabel[elementKey],
                                        markrow: markrow
                                    };
                                    tempObjStore.details.push(objMark);
                                });
                            } else { // POST DISPLAY
                                angular.forEach(modelElement, function (elementVal, elementKey) {
                                    if (Boolean(elementVal) === false) {
                                        return true;
                                    }
                                    var objMark = {
                                        name: multicheckboxNameLabel[elementKey],
                                    };
                                    tempObjStore.details.push(objMark);
                                });
                            }
                            // Show form field only if it is either set or it's
							// value has changed
                            if (tempObjStore.details.length) {
                                displayModel[objFieldElement.name] = tempObjStore;
                            }
                            break;
                        case "multiselectnew":
                            var tempObjStore = {
                                type: objFieldElement.type,
                                name: objFieldElement.name,
                                applicationName: objFieldElement.data.applicationName,
                                details: []
                            };
                            if (modeRequestId) { // PATCH DISPLAY

                                // patchDetails =
								// self.convertPatchformat(patchDetails,"value");
                                modelElement = self.markModel(modelElement, modelkey, patchDetails);
                                // MARK the values in "modelElement"

                                angular.forEach(modelElement, function (objValue, objKey) {
                                    var markrow;
                                    if (!objValue.value) {
                                        markrow = "new";
                                    } else if (angular.equals(objValue.markrow, "remove")) {
                                        markrow = "remove";
                                    } else {
                                        markrow = "old";
                                    }
                                    var treePathByNameLabel = angular.fromJson(localStorage.getItem('multiselectModelNameLabel_' + objFieldElement.templateOptions.key));
                                    var splitValue = objValue[objFieldElement.templateOptions.key];
                                    var arrPath = splitValue.split(':');
                                    var lastElement = arrPath[arrPath.length - 1];
                                    var objMark = {
                                        name: treePathByNameLabel[lastElement],
                                        markrow: markrow
                                    };
                                    tempObjStore.details.push(objMark);
                                })

                            } else { // POST DISPLAY
                                angular.forEach(modelElement, function (objValue, objKey) {
// var treePathByNameLabel =
// angular.fromJson(localStorage.getItem('multiselectModelNameLabel_' +
// objFieldElement.templateOptions.key));
// var splitValue = objValue[objFieldElement.templateOptions.key];
// var arrPath = splitValue.split(':');
// var lastElement = arrPath[arrPath.length - 1];
// var objMark = {
// name: treePathByNameLabel[lastElement]
// };
                                    var objMark = {
                                        name: objValue.name
                                    };
                                    tempObjStore.details.push(objMark);
                                })
                            }
                            // Show form field only if it is either set or it's
							// value has changed
                            if (tempObjStore.details.length) {
                                // tempObjStore.details =
								// angular.sortByKey(tempObjStore.details,
								// 'name');
                                displayModel[objFieldElement.name] = tempObjStore;
                            }
                            break;
                        case "multiselectfullview":
                            var tempObjStore = {
                                type: objFieldElement.type,
                                name: objFieldElement.name,
                                applicationName: objFieldElement.data.applicationName,
                                details: []
                            };
                            if (modeRequestId) { // PATCH DISPLAY

                            } else {// POST DISPLAY
                                angular.forEach(modelElement, function (objValue, objKey) {
                                    var treePathByNameLabel = angular.fromJson(localStorage.getItem('treedropdownModelByNameLabel-' + modelkey));
                                    var objMark = {
                                        name: treePathByNameLabel[objValue.name]
                                    };
                                    tempObjStore.details.push(objMark);
                                })
                                displayModel[objFieldElement.name] = tempObjStore;
                            }
                            break;
                        case "treedropdown":
                            var tempObjStore = {
                                type: objFieldElement.type,
                                name: objFieldElement.name,
                                applicationName: objFieldElement.data.applicationName,
                                markrow: false
                            };
                            if (modeRequestId) { // PATCH DISPLAY

                            } else {// POST DISPLAY
                                var treePathByNameLabel = angular.fromJson(localStorage.getItem('treedropdownModelByNameLabel-' + modelkey));
                                tempObjStore.value = treePathByNameLabel[modelElement[0].name];
                            }
                            displayModel[objFieldElement.name] = tempObjStore;
                            break;
                        case "multiselect":
                            var tempObjStore = {
                                type: objFieldElement.type,
                                name: objFieldElement.name,
                                applicationName: objFieldElement.data.applicationName,
                                details: []
                            };
                            if (modeRequestId) { // PATCH DISPLAY

                                // patchDetails =
								// self.convertPatchformat(patchDetails,"value");
                                modelElement = self.markModel(modelElement, modelkey, patchDetails);
                                // MARK the values in "modelElement"

                                angular.forEach(modelElement, function (objValue, objKey) {
                                    var markrow;
                                    if (!objValue.value) {
                                        markrow = "new";
                                    } else if (angular.equals(objValue.markrow, "remove")) {
                                        markrow = "remove";
                                    } else {
                                        markrow = "old";
                                    }
                                    var treePathByNameLabel = angular.fromJson(localStorage.getItem('multiselectModelNameLabel_' + objFieldElement.templateOptions.key));
                                    var splitValue = objValue[objFieldElement.templateOptions.key];
                                    var arrPath = splitValue.split(':');
                                    var lastElement = arrPath[arrPath.length - 1];
                                    var objMark = {
                                        name: treePathByNameLabel[lastElement],
                                        markrow: markrow
                                    };
                                    tempObjStore.details.push(objMark);
                                })

                            } else { // POST DISPLAY
                                angular.forEach(modelElement, function (objValue, objKey) {
                                    var treePathByNameLabel = angular.fromJson(localStorage.getItem('multiselectModelNameLabel_' + objFieldElement.templateOptions.key));
                                    var splitValue = objValue[objFieldElement.templateOptions.key];
                                    var arrPath = splitValue.split(':');
                                    var lastElement = arrPath[arrPath.length - 1];
                                    var objMark = {
                                        name: treePathByNameLabel[lastElement]
                                    };
                                    tempObjStore.details.push(objMark);
                                })
                            }
                            // Show form field only if it is either set or it's
							// value has changed
                            if (tempObjStore.details.length) {
                                // tempObjStore.details =
								// angular.sortByKey(tempObjStore.details,
								// 'name');
                                displayModel[objFieldElement.name] = tempObjStore;
                            }
                            break;
                        case "customaddselect":
                            var tempObjStore = {
                                type: objFieldElement.type,
                                name: objFieldElement.name,
                                applicationName: objFieldElement.data.applicationName,
                                details: []
                            };
                            if (modeRequestId) { // PATCH DISPLAY

                                modelElement = self.markModel(modelElement, modelkey, patchDetails);
                                for (var i = 0; i < modelElement.length; i++) {
                                    var objMark = {};
                                    angular.forEach(modelElement[i], function (objValue, objKey) {
                                        // console.log( &&
										// objKey.indexOf('-display') == -1 );
                                        // Change the value if bool found
                                        if (!angular.equals(objKey, "value") && !angular.equals(objKey, "markrow")) {
                                            var dispKey = $filter('filter')(objFieldElement.templateOptions.fields[0].fieldGroup, {'key': objKey}, true)[0].name;
                                            if (objValue === true) {
                                                objMark[dispKey] = "Yes";
                                            } else if (objValue === false) {
                                                objMark[dispKey] = "No";
                                            } else {
                                                objMark[dispKey] = objValue;
                                            }
                                            // Mark the value by type
                                            if (!modelElement[i].value) {
                                                modelElement[i].markrow = "add";
                                            } else if (angular.equals(modelElement[i].markrow, "remove")) {
                                                objMark['markrow'] = "remove";
                                            } else {
                                                objMark['markrow'] = "old";
                                            }

                                        }


                                    });
                                    tempObjStore.details.push(objMark);
                                }
                            } else { // POST DISPLAY
                                tempObjStore.details = self.setboolToStringPost(modelElement, objFieldElement, modelkey);
                            }
                            displayModel[objFieldElement.name] = tempObjStore;
                            break;
                        case "customaddtextbox":
                            var tempObjStore = {
                                type: objFieldElement.type,
                                name: objFieldElement.name,
                                applicationName: objFieldElement.data.applicationName,
                                details: []
                            };
                            if (modeRequestId) { // PATCH DISPLAY

                                modelElement = self.markModel(modelElement, modelkey, patchDetails);
                                for (var i = 0; i < modelElement.length; i++) {
                                    var objMark = {};
                                    angular.forEach(modelElement[i], function (objValue, objKey) {
                                        // console.log( &&
										// objKey.indexOf('-display') == -1 );
                                        // Change the value if bool found
                                        if (!angular.equals(objKey, "value") && !angular.equals(objKey, "markrow")) {
                                            var dispKey = $filter('filter')(objFieldElement.templateOptions.fields[0].fieldGroup, {'key': objKey}, true)[0].name;
                                            if (objValue === true) {
                                                objMark[dispKey] = "Yes";
                                            } else if (objValue === false) {
                                                objMark[dispKey] = "No";
                                            } else {
                                                objMark[dispKey] = objValue;
                                            }
                                            // Mark the value by type
                                            if (!modelElement[i].value) {
                                                modelElement[i].markrow = "add";
                                            } else if (angular.equals(modelElement[i].markrow, "remove")) {
                                                objMark['markrow'] = "remove";
                                            } else {
                                                objMark['markrow'] = "old";
                                            }

                                        }


                                    });
                                    tempObjStore.details.push(objMark);
                                }
                            } else { // POST DISPLAY
                                tempObjStore.details = self.setboolToStringPost(modelElement, objFieldElement, modelkey);
                            }
                            // Remove header if empty e.g. Spectator of CFE
							// issue ALM #406
                            if (tempObjStore.details.length > 0) {
                                displayModel[objFieldElement.name] = tempObjStore;
                            }
                            break;
                        case "treedropdownselect":
                            var tempObjStore = {
                                type: objFieldElement.type,
                                name: objFieldElement.name,
                                applicationName: objFieldElement.data.applicationName,
                                details: []
                            };
                            // console.log("modelElement ", modelElement);
                            if (modeRequestId) { // PATCH SUBMISSION
                                // patchDetails =
								// self.convertPatchformat(patchDetails,"value");
                                // console.log("patchDetails",patchDetails);
                                // console.log(modelkey,modelElement);
                                modelElement = self.treedropdownManipulate(modelElement, "Name", "name");
                                // console.log("modelElementOld",modelkey,modelElement);
                                modelElement = self.markModel(modelElement, modelkey, patchDetails);
                                // console.log("modelElementNew",modelkey,modelElement);
                                var tempObjStoreDetails = [];
                                for (var i = 0; i < modelElement.length; i++) {
                                    var objMark = {};
                                    angular.forEach(modelElement[i], function (objValue, objKey) {
// console.log("objKey",objKey);
                                        // Change the value if bool found
                                        if (!angular.equals(objKey, "value") && !angular.equals(objKey, "markrow")) {
                                            var dispKey = $filter('filter')(objFieldElement.templateOptions.fields[0].fieldGroup, {'key': objKey}, true)[0];
                                            // console.log('dispKey',dispKey);
                                            if (angular.equals(dispKey.type, 'treedropdown')) {
                                                if (objValue === true) {
                                                    objMark[dispKey.name] = "Yes";
                                                } else if (objValue === false) {
                                                    objMark[dispKey.name] = "No";
                                                } else {
                                                    var arrPath = objKey.split("-");
                                                    var lastValue = arrPath[arrPath.length - 1];
                                                    var treePathByNameLabel = angular.fromJson(localStorage.getItem('treedropdownModelByNameLabel-' + lastValue));
                                                    var splitValue = objValue;
                                                    var arrPath = splitValue.split(':');
                                                    var lastElement = arrPath[arrPath.length - 1];
                                                    objMark[dispKey.name] = treePathByNameLabel[lastElement];
                                                }
                                            } else {
                                                objMark[dispKey.name] = objValue;
                                            }

                                            // Mark the value by type

                                            if (!modelElement[i].value) {
                                                modelElement[i].markrow = "add";
                                            } else if (angular.equals(modelElement[i].markrow, "remove")) {
                                                objMark['markrow'] = "remove";
                                            } else {
                                                objMark['markrow'] = "old";
                                            }
                                        }
                                    });
                                    tempObjStoreDetails.push(objMark);
                                }


                                tempObjStore.details = angular.copy(self.setDisplayFormat(objFieldElement, tempObjStoreDetails));
                            } else { // POST SUBMISSION
                                modelElement = self.treedropdownManipulate(modelElement, "Label", "attributes.label", "displayJson");
                                var tempObjStoreDetails = self.setboolToStringPost(modelElement, objFieldElement, modelkey);
                                tempObjStore.details = angular.copy(self.setDisplayFormat(objFieldElement, tempObjStoreDetails));
                            }
                            // 
                            if (!angular.isUndefinedOrNull(modelElement) && Object.keys(modelElement[0]).length > 1 && Object.keys(modelElement[0]).length != 0) {
                                // console.log(objFieldElement.name,tempObjStore);
                                displayModel[objFieldElement.name] = tempObjStore;
                            }

                            break;
                        case "customselect":
                            /*
							 * if (!modelElement) { break; }
							 */

                            var displayVal = modelElement;

                            if (localStorage.getItem('customselectModelNameLabel_' + modelkey) != null) {
                                var nameLabelJson = angular.fromJson(localStorage.getItem('customselectModelNameLabel_' + modelkey));
                            }
// console.log("nameLabelJson",nameLabelJson);

                            if (modelElement && nameLabelJson && nameLabelJson[modelElement]) {
                                displayVal = nameLabelJson[modelElement];
                            } else {
// if (angular.isDefined($filter('filter')(coreApiStorage, {"name": displayVal},
// true))) {
// displayVal = $filter('filter')(coreApiStorage, {"name": displayVal},
// true)[0].attributes.label;
// }
                            }

                            var tempObjStore = {
                                value: displayVal,
                                type: objFieldElement.type,
                                name: objFieldElement.name,
                                applicationName: objFieldElement.data.applicationName,
                                markrow: false
                            };

                            if (modeRequestId) { // PATCH DISPLAY
                                if (angular.isDefined(patchDetails)) {
                                    var patchDisplayVal = patchDetails[modelkey];
                                    if (modelElement && nameLabelJson && nameLabelJson[modelElement] && angular.isDefined(nameLabelJson[patchDisplayVal])) {
                                        tempObjStore.value = nameLabelJson[modelElement];
                                        patchDisplayVal = nameLabelJson[patchDisplayVal];
                                    } else if (modelElement && nameLabelJson && nameLabelJson[modelElement] && angular.isUndefined(nameLabelJson[patchDisplayVal])) {
                                        tempObjStore.value = nameLabelJson[modelElement];
                                        patchDisplayVal = nameLabelJson[patchDisplayVal];
                                    } else {
                                        /*
										 * if ($filter('filter')(coreApiStorage,
										 * {"name": modelElement}, true).length) {
										 * tempObjStore.value =
										 * $filter('filter')(coreApiStorage,
										 * {"name": modelElement},
										 * true)[0].attributes.label; }
										 */
                                        if (objFieldElement.data && objFieldElement.data.refData && allApiStorage[objFieldElement.data.refData]) {
                                            var elementApiStorage = allApiStorage[objFieldElement.data.refData].children;
                                            // console.log("elementApiStorage",
											// elementApiStorage);
                                            if ($filter('filter')(elementApiStorage, {"name": patchDisplayVal}, true).length) {
                                                patchDisplayVal = $filter('filter')(elementApiStorage, {"name": patchDisplayVal}, true)[0].attributes.label;
                                            }
                                        } else if ($filter('filter')(coreApiStorage, {"name": patchDisplayVal}, true).length) {
                                            patchDisplayVal = $filter('filter')(coreApiStorage, {"name": patchDisplayVal}, true)[0].attributes.label;
                                        }
                                    }
// var objPatchDetails = patchDetails[modelkey];
// var modelValueCheck = angular.isDefined(objPatchDetails) ?
// patchDetails[modelkey].value : patchDetails[modelkey];
// if (modelValueCheck != modelElement) {
                                    if (patchDetails[modelkey] != modelElement) {
                                        tempObjStore.markrow = true;
                                        // console.log('marking as
										// add/replace/remove...');
                                        /*
										 * if (!patchDetails[modelkey] &&
										 * modelElement) { tempObjStore.markrow =
										 * "add"; } else if
										 * (patchDetails[modelkey] &&
										 * !modelElement) { tempObjStore.markrow =
										 * "remove"; } else {
										 * tempObjStore.markrow = "replace"; }
										 */

                                        // tempObjStore.patchVal =
										// patchDetails[modelkey].display;
// tempObjStore.patchVal = patchDisplayVal;
// displayModel[objFieldElement.name] = tempObjStore;
                                    }
                                    // Check for patch & form values, if either
									// of these exist only then show in summary
                                    if (tempObjStore.value || patchDisplayVal) {
                                        tempObjStore.patchVal = patchDisplayVal;
                                        displayModel[objFieldElement.name] = tempObjStore;
                                    }
                                }
                                // displayModel[objFieldElement.name] =
								// tempObjStore;
                            } else { // POST DISPLAY
                                if (tempObjStore.value) {
                                    displayModel[objFieldElement.name] = tempObjStore;
                                }
                            }
                            break;
                        case "checkbox":
                            var tempObjStore = {};
                        
                            tempObjStore.type = objFieldElement.type;
                            tempObjStore.key = keyValue;
                            tempObjStore.applicationName = objFieldElement.data.applicationName;
                            tempObjStore.name = objFieldElement.name;
                            // Check either display the checkbox or not.
                            var displayElement = true;
                            if (angular.isDefined(objFieldElement.data)) {
                                if (objFieldElement.data.disableDisplay) {
                                    displayElement = false;
                                }
                            }

                            if (displayElement) {
                                if (modeRequestId) { // PATCH DISPLAY
                                    if (angular.isDefined(patchDetails)) {

                                        // var objPatchDetails =
										// patchDetails[modelkey];
                                        // var modelValueCheck =
										// angular.isDefined(objPatchDetails) ?
										// patchDetails[modelkey].value :
										// patchDetails[modelkey];
                                        // var modelValueCheck =
										// patchDetails[modelkey];
                                        if (Boolean(patchDetails[modelkey]) != Boolean(modelElement)) {
                                            tempObjStore.markrow = true;
                                            // tempObjStore.patchVal =
											// patchDetails[modelkey].display;
                                            if (Boolean(patchDetails[modelkey]) == true) {
                                                tempObjStore.patchVal = "Yes";
                                            } else if (Boolean(patchDetails[modelkey]) == false) {
                                                tempObjStore.patchVal = "No";
                                            } else {
                                                tempObjStore.patchVal = "";
                                            }
                                            // tempObjStore.patchVal =
											// Boolean(patchDetails[modelkey])
											// == true ? "Yes" : "No";
                                        }

                                    }
                                    // if (tempObjStore.value) {
                                    if (tempObjStore.value || tempObjStore.patchVal) {
                                        displayModel[objFieldElement.name] = tempObjStore;
                                    }

                                } else { // POST DISPLAY
                                    if (tempObjStore.value) {
                                        displayModel[objFieldElement.name] = tempObjStore;
                                    }
                                }
                            }
                            break;
                        case "customradio":
                            var tempObjStore = self.validateDefaultFormControls(modelkey, modelElement);
                            tempObjStore.type = objFieldElement.type;
                            tempObjStore.key = keyValue;
                            tempObjStore.applicationName = objFieldElement.data.applicationName;
                            tempObjStore.name = objFieldElement.name;
                            if (modeRequestId) { // PATCH DISPLAY
                                if (angular.isDefined(patchDetails[modelkey])) {
                                    var displayLabel = patchDetails[modelkey];
                                    if (localStorage.getItem('customradioLabel-' + modelkey) != null) {
                                        var nameLabelJson = angular.fromJson(localStorage.getItem('customradioLabel-' + modelkey));
                                        if ($filter('filter')(nameLabelJson, {'name': patchDetails[modelkey]}, true).length) {
                                            displayLabel = $filter('filter')(nameLabelJson, {'name': patchDetails[modelkey]}, true)[0].label;
                                        }
                                    }
                                    if (patchDetails[modelkey] != modelElement) {
                                        tempObjStore.markrow = true;
                                        tempObjStore.patchVal = displayLabel;
                                    }
                                }
                                if (tempObjStore.value) {
                                    displayModel[objFieldElement.name] = tempObjStore;
                                }
                            } else { // POST DISPLAY
                                if (tempObjStore.value) {
                                    displayModel[objFieldElement.name] = tempObjStore;
                                }
                            }
                            break;
                        case "label":

                            var tempObjStore = self.validateDefaultFormControls(modelkey, modelElement);
                            tempObjStore.applicationName = objFieldElement.data.applicationName;
                            tempObjStore.name = objFieldElement.name;
                            tempObjStore.type = "default";
                            // console.log('tempObjStore',tempObjStore);
                            if (modeRequestId) { // PATCH DISPLAY
                                if (angular.isDefined(patchDetails[modelkey])) {
                                    var patchDisplayVal = patchDetails[modelkey];
                                    if (objFieldElement.data && objFieldElement.data.refData && allApiStorage[objFieldElement.data.refData]) {
                                        var elementApiStorage = allApiStorage[objFieldElement.data.refData].children;
                                        // console.log("elementApiStorage",
										// elementApiStorage);
                                        if ($filter('filter')(elementApiStorage, {"name": patchDisplayVal}, true).length) {
                                            patchDisplayVal = $filter('filter')(elementApiStorage, {"name": patchDisplayVal}, true)[0].attributes.label;
                                        }
                                    }
                                    tempObjStore.patchVal = patchDisplayVal;

                                    if (patchDetails[modelkey] != modelElement) {
                                        tempObjStore.markrow = true;
                                    }
                                }
                                displayModel[objFieldElement.name] = tempObjStore;
                            } else { // POST DISPLAY
                                if (tempObjStore.value) {
                                    displayModel[objFieldElement.name] = tempObjStore;
                                }
                            }
                            break;
                        case "hiddentext":
                            var tempObjStore = self.validateDefaultFormControls(modelkey, modelElement);
                            console.log("objFieldElement.data.applicationName",objFieldElement.data.applicationName);
                            tempObjStore.applicationName = objFieldElement.data.applicationName;
                            tempObjStore.name = objFieldElement.name;
                            tempObjStore.type = objFieldElement.type;
                            // console.log('tempObjStore',tempObjStore);
                            if (modeRequestId) { // PATCH DISPLAY
                                if (angular.isDefined(patchDetails[modelkey])) {
                                    var patchDisplayVal = patchDetails[modelkey];
                                    if (objFieldElement.data && objFieldElement.data.refData && allApiStorage[objFieldElement.data.refData]) {
                                        var elementApiStorage = allApiStorage[objFieldElement.data.refData].children;
                                        // console.log("elementApiStorage",
                                        // elementApiStorage);
                                        if ($filter('filter')(elementApiStorage, {"name": patchDisplayVal}, true).length) {
                                            patchDisplayVal = $filter('filter')(elementApiStorage, {"name": patchDisplayVal}, true)[0].attributes.label;
                                        }
                                    }
                                    tempObjStore.patchVal = patchDisplayVal;

                                    if (patchDetails[modelkey] != modelElement) {
                                        tempObjStore.markrow = true;
                                    }
                                }
                                displayModel[objFieldElement.name] = tempObjStore;
                            } else { // POST DISPLAY
                                if (tempObjStore.value) {
                                    displayModel[objFieldElement.name] = tempObjStore;
                                }
                            }
                            break;

                            
                        default:
                            // COMMON for BOTH
                            var tempObjStore = self.validateDefaultFormControls(modelkey, modelElement);
                            tempObjStore.applicationName = objFieldElement.data.applicationName;
                            tempObjStore.name = objFieldElement.name;
                            tempObjStore.type = "default";
                            if (modeRequestId) { // PATCH DISPLAY
                                if (angular.isDefined(patchDetails[modelkey]) && !angular.equals(patchDetails[modelkey], REMOVE_VALUE)) {
                                    if (modelkey == "endDate") {
                                        if (tempObjStore.value != $filter('date')(patchDetails[modelkey], "MM/dd/yyyy h:mma Z")) {
                                            tempObjStore.patchVal = $filter('date')(patchDetails[modelkey], "MM/dd/yyyy h:mma Z");
                                            tempObjStore.markrow = true;
                                        }
                                    }
                                    else if (patchDetails[modelkey] != modelElement) {
                                        tempObjStore.markrow = true;
                                        tempObjStore.patchVal = patchDetails[modelkey];
                                    }
                                }
                                // 
                                if (tempObjStore.value && !angular.equals(tempObjStore.value, REMOVE_VALUE)) {
                                    displayModel[objFieldElement.name] = tempObjStore;
                                }
                            } else { // POST DISPLAY
                                if (tempObjStore.value) {
                                    displayModel[objFieldElement.name] = tempObjStore;
                                }
                            }

                    }

                    return displayModel;
                };
// Creates the API json to submit with POST
                service.getApiJson = function ($scope, objectKey, objectValue, applicationName, requestTitle) {
                	console.log("getApiJson called");
                    var frmData = $scope.frmData;
                    // var requestData = $scope.objProcessModel.request;

                    var requestData = {};
                    requestData[objectKey] = objectValue;
                    var modeRequestId = $scope.modeRequestId;
                    var objSelectedPrecanned = $scope.objSelectedPrecanned;
                    // var uniqueRequestId = $scope.uniqueRequestId != "" ?
					// $scope.uniqueRequestId : angular.guid();
                    var uniqueRequestId = angular.guid();
                    var data = {
                        Operations: []
                    };
                    // the below block of code for Precanned Justification
                    if (angular.isDefined(objSelectedPrecanned.name)) {
                        requestData['crossPractice'] = {
                            precannedName: objSelectedPrecanned.name,
                            markrow: "add"
                        };
                    }


                    var modeldata = angular.copy(requestData);
                    delete modeldata['justification'];
                    // Check the mode and change the Operation json
                    var operationsData = {};
                    if (modeRequestId && !$scope.accessViolation) { // PATCH
																	// PROCESS
                        angular.forEach(modeldata, function (value, key) {
                            if (angular.isArray(value)) {
                                angular.forEach(value, function (patchvalue) {
                                    var op = angular.isUndefined(patchvalue.markrow) ? "" : patchvalue.markrow;
                                    var patchCopy = angular.copy(patchvalue);
                                    if (angular.isDefined(patchCopy.markrow)) {
                                        delete patchCopy['markrow'];
                                    }

                                    if (op !== "") {
                                        data.Operations.push({
                                            values: patchCopy,
                                            op: op,
                                            path: key
                                        });
                                    }
                                })
                            } else {
                                if (angular.isDefined(value.markrow)) {
                                    var op = value.markrow;
                                    if (key == 'endDate') {
                                        postValue = $filter('date')(value.value, "yyyy-MM-ddTHH:mm:ssZ");
                                        op = "add";
                                    }
                                    else if (key == 'crossPractice') {
                                        postValue = value.precannedName;
                                    } else {
                                        postValue = value.value;
                                    }
                                    data.Operations.push({
                                        values: postValue,
                                        op: op,
                                        path: key
                                    });
                                }
                            }

                        })
                        operationsData = {
                            "method": "PATCH",
                            "path": "/Users/" + modeRequestId,
                            "target": frmData.application.name,
                            "data": data
                        }

                    } else { // POST PROCESS

                        var postValue;
                        angular.forEach(modeldata, function (value, key) {
                            if (key.indexOf("Helper") != -1) {
                                return;
                            }

                            /* Exception for endDate format */
                            if (key == 'endDate') {
                                postValue = $filter('date')(value, "yyyy-MM-ddTHH:mm:ssZ");
                            } else if (key == 'crossPractice') {
                                postValue = value.precannedName;
                            } else {
                                postValue = value;
                            }

                            data.Operations.push({
                                values: postValue.details,
                                op: "add",
                                path: key
                            });
                        });

                        if ($scope.accessViolation) {
                            operationsData = {
                                "method": "PUT",
                                "path": "/Users/" + $scope.accessId,
                                "target": frmData.application.name,
                                "owner": frmData.beneficiary,
                                "data": data
                            }
                        } else {
                            operationsData = {
                                "method": "POST",
                                "path": "/Users",
                                "target": applicationName,
                                "owner": frmData.beneficiary,
                                "data": data
                            }
                        }


                    }
                    /*
					 * IF PATCH MODE then takes the justifiaction from the patch
					 * response
					 */
                    // var justification = modeRequestId &&
					// !$scope.accessViolation ? requestData.justification.value
					// : requestData.justification;
                    /* Final request data to add in the brifcase */
// var reqdata = {
// "uniqueRequestId": uniqueRequestId,
// "details": {
// "justification": justification
// },
// "Operations": [
// operationsData
// ]
// }
                    /* Final brifcase display data */
                    var brifcaseList = {
                        "uniqueRequestId": uniqueRequestId,
                        "title": requestTitle,
                        "target": frmData.application,
                        "owner": frmData.beneficiary,
                        "justification": modeldata.justification,
                        "accessType": frmData.accessType,
                        "beneficiary": $scope.beneficiaryDisplay
                    }
                    /* Combine & Return */
                    var brifcaseData = {
                        reqdata: operationsData,
                        brifcaseList: brifcaseList
                    }
                    return brifcaseData;
                };
                return service;
            });
        });
