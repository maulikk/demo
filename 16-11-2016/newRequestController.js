define(['app',
'angularAMD',
'smartTable'], function (app, RequestsModule, smartTable) {
    /*
     * Navigate the list and select the user using keybaord
     * DO NOT MOVE this arrowselector directive 
     */
    RequestsModule.directive('arrowSelector', [
        '$document',
        function ($document) {
            return {
                restrict: 'A',
                link: function (scope, elem, attrs, ctrl) {
                    var elemFocus = false;
                    elem.on('mouseenter', function () {
                        elemFocus = true;
                    });
                    elem.on('mouseleave', function () {
                        elemFocus = false;
                    });
                    $document.bind('keydown', function (e) {
                        var elmnt = document.getElementById('scrolldiv');
                        if (elemFocus) {
                            if (e.keyCode == 38) {
                                if (scope.selectedRow == 0) {
                                    elmnt.scrollTop = 0;
                                    return;
                                }                                //console.log("up...")

                                elmnt.scrollTop -= 28;
                                scope.selectedRow--;
                                scope.$apply();
                                e.preventDefault();
                            }
                            if (e.keyCode == 40) {
                                if (scope.selectedRow == scope.reportees.length - 1) {
                                    elmnt.scrollTop = elmnt.scrollHeight;
                                    return;
                                }                                //console.log("down...")

                                elmnt.scrollTop += 28;
                                scope.selectedRow++;
                                scope.$apply();
                                e.preventDefault();
                            }
                            if (e.keyCode == 13) {
                                scope.selectReportess(scope.reportees[scope.selectedRow]);
                                scope.$apply();
                                e.preventDefault();
                            }
                        }
                    });
                }
            };
        }
    ]);
    
    RequestsModule.controller('newRequestController', function ($scope, $rootScope, $state, $filter, $q, $timeout, $window, $mdDialog, newRequestService, ARPService, formSteps, userAccessDetailsFactory, AllReferenceDataService, Restangular, RefRestangular, StorageService, STORAGE_TYPES, formlyConfig, formlyValidationMessages, formFactory, FORM_TEMPLATE, VIEW_PATH, _requestableType, _currentUser, BriefcaseService, SHOW_ASSIGN_MODEL, SCROLLBAR_DIV_HEIGHT, PRECANNED_POLICY, PRECANNED_FIELDS, LIMITS, INCLUDE, REQUEST_STATUS, ACCESS_DISPLAY_CHAR, END_DATE_POLICY, PAGINATION_COUNT, referenceDataFactory) {
        formlyConfig.extras.errorExistsAndShouldBeVisibleExpression = 'fc.$touched || form.$submitted';
        formlyValidationMessages.addStringMessage('required', 'This field is required');
        //formlyValidationMessages.addTemplateOptionValueMessage('maxlength', 'maxlength', '', 'is the maxlength length', 'Too short');
        formlyValidationMessages.addStringMessage('maxlength', 'Your input is WAAAAY too long!');
        /* New demo code */
        $scope.addParams = {
        }        // Added the logic for capturing the selected values in Optional Apps page in new MOCK up.               

        $scope.data = [
        ];
        $scope.isChecked = function (id) {
            console.log('id is : ', id);
            var match = false;
            for (var i = 0; i < $scope.data.length; i++) {
                if ($scope.data[i].id == id) {
                    match = true;
                }
            }
            return match;
        };
        
        $scope.sync = function (bool, item) {
            if (bool) {
                // add item
                $scope.data.push(item);
            } else {
                $scope.data.splice($scope.data.indexOf(item), 1);
                // remove item
                /*if($filter('filter')($scope.data,{'name' :item.name},true).length>0)
                    	{
                    		$scope.data.splice(item,1);
                    	}*/
                /* for(var i=0 ; i < $scope.data.length; i++) {
                        if($scope.data[i].id == item.id){
                          $scope.data.splice(i,1);
                        }
                      } */
            }
            $scope.frmData.optionalApplications = $scope.data;
            console.log($scope.data);
        };
        
        //Added code new mockup - November 3rd 2016
        $scope.disableDepApps = function (applicationLabel) {
            if (!angular.isUndefinedOrNull($scope.optionalApplications[applicationLabel].addDependencies)) {
                var addDepApps = $scope.optionalApplications[applicationLabel].addDependencies;
                if (!$scope.optionalApplications[applicationLabel].disabled) {
                    for (i = 0; i < addDepApps.length; i++) {
                        $scope.optionalApplications[addDepApps[i]].disabled = true;
                        $scope.optionalApplications[addDepApps[i]].isSelected = true;
                    }
                }
                if ($scope.optionalApplications[applicationLabel].isSelected && !$scope.optionalApplications[applicationLabel].disabled) {
                    for (i = 0; i < addDepApps.length; i++) {
                        $scope.optionalApplications[addDepApps[i]].disabled = false;
                        $scope.optionalApplications[addDepApps[i]].isSelected = false;
                    }
                }
            }
        }
        
        $scope.checkDisabled = function (applicationLabel) {
            if ($scope.optionalApplications[applicationLabel].disabled && $scope.optionalApplications[applicationLabel].isSelected) {
                return true;
            } 
            else {
                return false;
            }
        }
        
        $scope.addInput = function () {
            referenceDataFactory.getData($scope.addParams, 'snp.refData.spDepartments.data').then(function (response) {
                var resData = response.data.plain();
                $scope.dataAccess.push({
                    department: null,
                    subDepartment: null,
                    region: null,
                    departments: resData.children
                });
            })
            $timeout(function () {
                $('.tree-view').css('width', Math.round($('.dropdown-control').innerWidth() - 10));
            }, 500);
        }
        $scope.duplicateRow = false;
        $scope.validateAccess = function (valid) {
            var keepGoing = true;
            $scope.departmentRegion = [
            ];
            $scope.duplicateRow = false;
            var oldValue = {
            };
            angular.forEach($scope.dataAccess, function (value, key) {
                if (keepGoing) {
                    if (angular.isUndefinedOrNull(value['department']) || angular.isUndefinedOrNull(value['region'])) {
                        keepGoing = false;
                    }
                    if (!angular.equals(value, {
                    }) && angular.equals(value, oldValue)) {
                        keepGoing = false;
                        $scope.duplicateRow = true;
                    }
                }
                oldValue = value;
            })
            console.log('$scope.frmData.role ', $scope.frmData.role);
            if ($scope.frmData.role && keepGoing) {
                $scope.nextTab()
            }
        }
        $scope.removeInput = function (index) {
            $scope.dataAccess.splice(index, 1);
        }        /*formFactory.getFormData("snp.refData.spDefaultApps.data").then(function (response) {
                    $scope.frmData.defaultApplications = response.data.data.children;
                    $scope.getApplication($scope.frmData.defaultApplications, "attributes.label");
                })*/
        /*  formFactory.getFormData("snp.refData.spOptionalApps.data").then(function (response) {
                    $scope.optionalApplications = [];
                    angular.forEach(response.data.data.children, function (value, key) {
                        value.label = value.attributes.label;
                        $scope.optionalApplications.push(value)
                    })
                })*/

        formFactory.getFormData('snp.refData.spExceptionalApps.data').then(function (response) {
            $scope.exceptionalApplications = [
            ];
            angular.forEach(response.data.data.children, function (value, key) {
                value.label = value.attributes.label;
                $scope.exceptionalApplications.push(value)
            })
        })
        $scope.getSelectedDeptRegions = function ($scope) {
            formSteps.getSelectedDeptRegions($scope);
        }
        $scope.getApplication = function (applications, valueBy) {
            var str = '';
            angular.forEach(applications, function (value) {
                str += eval('value.' + valueBy) + ','
            })
            $scope.applicationDisplay = str.substring(0, str.length - 1);
        };
        $scope.resetExceptionalapp = function () {
            if ((angular.isDefined($scope.frmData.showExceptionalApp) && $scope.frmData.showExceptionalApp == true)) {
                $scope.frmData.exceptionalApplications = [
                ];
            }
        }
        $scope.optAppCheckRequired = function (valid) {
            $scope.frmData.optionalApplications = $scope.data;
            if (valid && $scope.frmData.optionalApplications.length > 0) {
                $scope.nextTab();
            }            //                    if ((angular.isDefined($scope.frmData.showExceptionalApp) && $scope.frmData.showExceptionalApp == true)) {//checked
            //                        if (valid && angular.isDefined($scope.frmData.exceptionalApplications) && $scope.frmData.exceptionalApplications.length != 0) {
            //                            $scope.nextTab();
            //                        }
            //
            //                    } else { //unchecked             
            //
            //                        if (valid && angular.isDefined($scope.frmData.optionalApplications) && $scope.frmData.optionalApplications.length != 0) {
            //                            $scope.nextTab();
            //                        }
            //                    }

        }
        $scope.others = true;
        $scope.toggleOthers = function () {
            $scope.others = $scope.others === false ? true : false;
        };
        $scope.submitRequest = function () {
            console.log(angular.toJson($scope.apireqdata))
        }        //ng-disabled="profileLoading || disableNext" 

        $scope.validateBeneficiary = function (valid) {
            if ($scope.profileLoading != false || $scope.disableNext != false) {
                return false;
            } else if (angular.isUndefinedOrNull($scope.frmData.beneficiary) && $scope.requestType.others) {
                return false;
            } else {
                $scope.nextTab()
            }
        }
        $scope.requestTypeGroup = {
            'Self': 'Self',
            'Others': 'Others'
        }        /* New demo code end */

        if (sessionStorage['clearUserAccessDetails'] != null) {
            userAccessDetailsFactory.reset();
            sessionStorage.removeItem('clearUserAccessDetails');
        }        //Load the questions for the application CORE  

        $scope.coreQuestions = null;
        $scope.loadCoreQuestions = function () {
            var deferred = $q.defer();
            referenceDataFactory.getData($scope.addParams, 'snp.refData.CORE.questions.data').then(function (response) {
                var resData = response.data.plain();
                $scope.coreQuestions = resData;
                deferred.resolve($scope.coreQuestions);
            }).finally (function () {
            });
            return deferred.promise;
        }        //Show the access search box as active

        $scope.highlightAccessSearchBox = function () {
            angular.element(document.getElementById('access_first_wrap')).addClass('search-active');
            document.getElementById('showallCheckbox').style.visibility = 'hidden';
            $scope.resetAccessContent();
        }        //Show the access dropdown select as active

        $scope.highlightAccessDropdowns = function () {
            angular.element(document.getElementById('access_first_wrap')).removeClass('search-active');
            document.getElementById('showallCheckbox').style.visibility = 'visible';
            $scope.clearAccessSearch();
        }        //Assign the element template path to scope

        $scope.templatePath = FORM_TEMPLATE(VIEW_PATH);
        $scope.tooltipsPath = VIEW_PATH.tooltipview;
        //Load the all data from localsorage if found otherwise load the new one from API
        AllReferenceDataService.getGlobalReferenceData().then(function (res) {
            //$scope.resourceTypes = res.children;
            $scope.coreApiStorage = res['snp.refData.CORE.attribute.data'].children;
            $scope.allApiStorage = res;
        }, function (error) {
        }
        );
        //Assign PRECANNED_FIELDS in scope
        $scope.constPrecannedFields = PRECANNED_FIELDS;
        $scope.precanned_policy = PRECANNED_POLICY;
        
        //Resize tree dropdown width as per viewport change
        function resizeTreeDropdown() {
            setTimeout(function () {
                $('.tree-view').css('width', Math.round($('.dropdown-control').innerWidth() - 10));
            }, 500);
        }
        $scope.$watchGroup(['navMenuState',
        'layoutArea'], resizeTreeDropdown);
        
        $(window).resize(resizeTreeDropdown);
        
        
        // Required validation  start //
        //Find all the custom mandatory field from metadata 
        $scope.pushRequired = function (metadata) {
            var arrRequired = {
            };
            var i = 1;
            angular.forEach(metadata, function (dataElement) {
                var multiselect = {
                };
                if (angular.isDefined(dataElement.fieldGroup) && $filter('filter') (dataElement.fieldGroup, {
                    'type': 'multiselect'
                }, true).length) {
                    multiselect = $filter('filter') (dataElement.fieldGroup, {
                        'type': 'multiselect'
                    }, true) [0];
                }
                if (!angular.equals(multiselect, {
                }) && angular.equals(multiselect.type, 'multiselect')) {
                    if (multiselect.templateOptions.required) {
                        var keyDetails = {
                            type: multiselect.type,
                            length: 0
                        }
                        arrRequired[multiselect.key] = keyDetails;
                    }
                }
                if (angular.equals(dataElement.type, 'treedropdownselect')) {
                    var keepGoing = true;
                    angular.forEach(metadata, function (element) {
                        var is_treedropdownselect = angular.equals(dataElement.type, 'treedropdownselect');
                        if (keepGoing) {
                            if (angular.isDefined(element.data) && angular.isDefined(element.data.childKey)) {
                                if (angular.equals(element.data.childKey, dataElement.key) && element.required) {
                                    keepGoing = false;
                                    var keyDetails = {
                                        type: dataElement.type,
                                        length: is_treedropdownselect ? dataElement.templateOptions.fields[0].fieldGroup.length : 0
                                    }
                                    arrRequired[dataElement.key] = keyDetails;
                                }
                            }
                        }
                    })
                }
            });
            return arrRequired;
        }        //Validate the forms other than Analytical              

        $scope.validateForm = function ($event,application) {
        	console.log('validating form');
            $scope.arrValidateForm = [
            ];
            if (angular.isDefined($scope.arrRequired)) {
                //console.log('$scope.arrRequired',$scope.arrRequired);
                angular.forEach($scope.arrRequired, function (keyDetails, key) {
                    var keyType = keyDetails.type;
                    switch (keyType) {
                        case 'multiselect':
                            var isHiddenField;
                            var fieldFound = false;
                            angular.forEach($scope.vm.fields, function (fieldElement) {
                                if (!fieldFound && angular.isDefined(fieldElement.fieldGroup) && $filter('filter') (fieldElement.fieldGroup, {
                                    'key': key
                                }, true).length) {
                                    //console.log('fieldElement',fieldElement);
                                    var multiselectField = $filter('filter') (fieldElement.fieldGroup, {
                                        'key': key
                                    }, true) [0];
                                    isHiddenField = fieldElement.hide || multiselectField.hide;
                                    fieldFound = true;
                                }
                            });
                            if (isHiddenField !== true) {
                                if (!$scope.vm.model[key] || !Object.keys($scope.vm.model[key]).length) {
                                    if ($scope.arrValidateForm.indexOf('true') < 0) {
                                        $scope.arrValidateForm.push('true');
                                    }
                                }
                            }
                            break;
                        case 'treedropdownselect':
                            if (angular.equals(keyType, 'treedropdownselect') && !angular.isUndefinedOrNull($scope.vm.model[key]) && !angular.equals($scope.frmData.application, 'analyticalRoles')) {
                                if ($scope.vm.model[key]) {
                                    angular.forEach($scope.vm.model[key], function (objectValue, objectKey) {
                                        var arrNewValue = angular.copy(objectValue);
                                        delete arrNewValue.value;
                                        delete arrNewValue.$$hashKey;
                                        var objLength = Object.keys(arrNewValue).length;
                                        var chkForBlank = false;
                                        angular.forEach(arrNewValue, function (value, key) {
                                            if (!chkForBlank && value == '') {
                                                chkForBlank = true;
                                                objLength = 0;
                                            }
                                        })
                                        if (objLength != 3) {
                                            if ($scope.arrValidateForm.indexOf('true') < 0) {
                                                $scope.arrValidateForm.push('true');
                                            }
                                        }
                                    })
                                }
                            }
                            break;
                        case 'multicheckbox':
                            if (angular.equals(keyType, 'multicheckbox') && !angular.isUndefinedOrNull($scope.vm.model[key]) && !angular.equals(application, 'RPM')) {
                                if ($scope.vm.model[key]) {
                                    angular.forEach($scope.vm.model[key], function (objectValue, objectKey) {
                                        var arrNewValue = angular.copy(objectValue);
                                        delete arrNewValue.value;
                                        delete arrNewValue.$$hashKey;
                                        var objLength = Object.keys(arrNewValue).length;
                                        var chkForBlank = false;
                                        angular.forEach(arrNewValue, function (value, key) {
                                            if (!chkForBlank && value == '') {
                                                chkForBlank = true;
                                                objLength = 0;
                                            }
                                        })
                                        if (objLength != 3) {
                                            if ($scope.arrValidateForm.indexOf('true') < 0) {
                                                $scope.arrValidateForm.push('true');
                                            }
                                        }
                                    })
                                }
                            }
                        default:
                    } // switch (keyType)

                });                // KRA multicheckbox validation
                if (application == 'keyRatingsApplications') {
                    if (angular.isDefined($scope.vm.model.accessCategories)) {
                        var arrFalse = [
                        ];
                        angular.forEach($scope.vm.model.accessCategories, function (multicheckboxVal, multicheckboxKey) {
                            if (multicheckboxVal == true) {
                                arrFalse.push(multicheckboxVal);
                            }
                        });
                        //console.log('NRC arrFalse',arrFalse);
                        if (arrFalse.length == 0) {
                            // For multi-checkbox if blank
                            $rootScope.requiredCheck = true;
                        } else {
                            $rootScope.requiredCheck = false;
                        }
                    } else {
                        $scope.isFormError = true;
                        $scope.arrValidateForm.push('true');
                    }
                }
                console.log('$scope.frmData.application', application);
                if (application == 'RPM') {
                    if (angular.isDefined($scope.vm.fields)) {
                        var arrFalse = [
                        ];
                        angular.forEach($scope.vm.fields, function (multicheckboxVal, multicheckboxKey) {
                            if (multicheckboxVal == true) {
                                arrFalse.push(multicheckboxVal);
                            }
                        });
                        //console.log('NRC arrFalse',arrFalse);
                        if (arrFalse.length == 0) {
                            // For multi-checkbox if blank
                            $rootScope.requiredCheck = true;
                        } else {
                            $rootScope.requiredCheck = false;
                        }
                    } else {
                        $scope.isFormError = true;
                        $scope.arrValidateForm.push('true');
                    }
                }                // Merge together all validation criterias, and show/hide errors

                if ($scope.isValidated()) {
                    $scope.openDialog($event);
                    $scope.isFormError = false;
                } else {
                    // Validation failed
                    $scope.isFormError = false;
                    $timeout(function () {
                        $scope.isFormError = true;
                    }, 500);
                }                //console.log("$scope.vm.form.$invalid  ",$scope.vm.form.$invalid)

            }
        };
        //Validate the Analytical Form 
        $scope.validateAnalyticalForm = function ($event) {
            $scope.arrValidateForm = [
            ];
            if (angular.isDefined($scope.vm.model.roleRequestables)) {
                $scope.arrValidateForm = [
                ];
                var arrFalse = [
                ];
                angular.forEach($scope.vm.model.roleRequestables, function (multicheckboxVal, multicheckboxKey) {
                    if (multicheckboxVal == true) {
                        arrFalse.push(multicheckboxVal);
                    }
                })
                if (arrFalse.length == 0) {
                    $rootScope.requiredCheck = true;
                }
                var unWatch = $scope.$watch('vm.model.roleRequestables', function (newValue, oldValue) {
                    angular.forEach(newValue, function (multicheckboxVal, multicheckboxKey) {
                        if (multicheckboxVal != false) {
                            angular.forEach($scope.vm.model[multicheckboxKey], function (elementVal, elementKey) {
                                var arrNewValue = angular.copy(elementVal);
                                delete arrNewValue.value;
                                delete arrNewValue.$$hashKey;
                                var objLength = Object.keys(arrNewValue).length;
                                var chkForBlank = false;
                                angular.forEach(arrNewValue, function (value, key) {
                                    if (!chkForBlank && value == '') {
                                        chkForBlank = true;
                                        objLength = 0;
                                    }
                                })
                                if (objLength != 3) {
                                    if ($scope.arrValidateForm.indexOf(multicheckboxKey) < 0) {
                                        $scope.arrValidateForm.push(multicheckboxKey);
                                    }
                                }
                            })
                        }
                    })
                    if ($scope.isValidated()) {
                        $scope.openDialog($event);
                        $scope.isFormError = false;
                    } else {
                        // Validation Failed
                        $scope.isFormError = false;
                        $timeout(function () {
                            $scope.isFormError = true;
                        }, 500);
                    }
                    unWatch();
                })
            } else {
                $scope.isFormError = true;
                $scope.arrValidateForm.push('');
            }
        }        //Its get called on form step to validate the required fields               

        $scope.checkAndValidateForms = function ($event) {
        	console.log("$event",$event);
        	angular.forEach($scope.frmData.applicationList,function (application){
        		console.log("applicationName",application.name);
        		 switch ($scope.frmData.application) {
                 case 'analyticalRoles':
                     $scope.validateAnalyticalForm($event);
                     break;
                 default:
                     $scope.validateForm($event);
             }
        		
        	});
           
        };
        //Check the validation completed
        $scope.isValidated = function () {
            /*
                     * $scope.arrValidateForm : For Custom elements
                     * $scope.vm.form.$invalid : Default formly validation
                     * $rootScope.requiredCheck : Duplicate values validation AND for multicheckbox mandatory validation
                     */
            if ($scope.arrValidateForm.length == 0 && !$scope.vm.form.$invalid && !$rootScope.requiredCheck) {
                return true;
            } else {
                return false;
            }
        }        // Reset validation variables 

        $scope.resetValidationVariables = function () {
            //Reset validation variables
            $scope.arrValidateForm = [
            ];
            $rootScope.requiredCheck = false;
            //$scope.arrAnalyticalValidation = [];
            $scope.isFormError = false;
        }        // Required Validation Ends //  
        // PreCanned Justification Start //
        // PreCanned check //

        $scope.isPreCanned = function () {
            if ($scope.precanned_policy.indexOf($scope.policyCode) > - 1 && angular.equals($scope.frmData.accessType, 'Functional Role')) {
                return true;
            } else {
                return false;
            }
        }        // Open dialog box on click of next in form step //

        $scope.openDialog = function ($event) {
            if ($scope.isPreCanned()) {
                $scope.convertToPrecannedFormat().then(function (res) {
                    var scope = res;
                    //&& scope.length
                    $scope.getPrecannedJustification(scope);
                    newRequestService.opendialog($event, $scope);
                },                // error
                function (res) {
                }
                );
            } else {
                $scope.nextTab();
            }
        };
        // Parse the form model json and convert it into precanned post format to sent in API //
        $scope.convertToPrecannedFormat = function () {
            var deferred = $q.defer();
            var scope = [
            ];
            angular.forEach($scope.vm.model, function (modelElement) {
                if (angular.isArray(modelElement)) {
                    angular.forEach(modelElement, function (modelElementValue, modelElementKey) {
                        if (Object.keys(modelElementValue).length > 2) {
                            var scopeObj = {
                            };
                            angular.forEach(modelElementValue, function (precannedFields, precannedKey) {
                                if (!angular.equals(precannedKey, '$$hashKey') && !angular.equals(precannedKey, 'value')) {
                                    var modelValue = precannedFields[0].name;
                                    if (angular.isDefined(modelValue)) {
                                        var splitKey = precannedKey.split('-');
                                        var lastValue = splitKey[splitKey.length - 1];
                                        var treePathByName = angular.fromJson(localStorage.getItem('treedropdownModelByName-' + lastValue));
                                        var treePathByNameLabel = angular.fromJson(localStorage.getItem('treedropdownModelByNameLabel-' + lastValue));
                                        var modelValue = treePathByName[modelValue];
                                        var splitModel = modelValue.split(':');
                                        var modelDisplayValue = treePathByNameLabel[splitModel[splitModel.length - 1]];
                                        var objCombine = {
                                            modelValue: modelValue,
                                            modelDisplayValue: modelDisplayValue
                                        }
                                        if (splitKey.length > 1) {
                                            scopeObj[splitKey[1]] = objCombine;
                                        } else {
                                            scopeObj[splitKey[0]] = objCombine;
                                        }
                                    }
                                }
                            })
                            if (!angular.equals(scopeObj, {
                            })) {
                                var chkDuplicate = $scope.checkDuplicatePrecannedScope(scope, scopeObj);
                                if (chkDuplicate) {
                                    scope.push(scopeObj);
                                }
                            }
                        }
                    })
                }
            })
            deferred.resolve(scope);
            return deferred.promise;
        }        //Remove duplicate entries from precanned scope to show in dialog

        $scope.checkDuplicatePrecannedScope = function (scope, scopeObj) {
            var keepGoing = true;
            angular.forEach(scope, function (element) {
                if (keepGoing) {
                    if (angular.equals(element, scopeObj)) {
                        keepGoing = false;
                    }
                }
            })
            return keepGoing;
        }        //Load precanned justification through API //

        $scope.precannedJustificationList = [
        ];
        $scope.getPrecannedJustification = function (precannedScope) {
            $scope.customPrecannedJustification = '';
            $scope.precannedRoles = '';
            $scope.precannedJustification = '';
            //Create the complete string to display in OPDM 
            angular.forEach($scope.constPrecannedFields, function (precanned_Field) {
                $scope[precanned_Field + 'display'] = '';
                $scope[precanned_Field + '_duplicate'] = [
                ];
            })
            var postScope = [
            ];
            angular.forEach(precannedScope, function (element) {
                var objScope = {
                };
                angular.forEach($scope.constPrecannedFields, function (precannedFields) {
                    objScope[precannedFields] = element[precannedFields].modelValue;
                    if ($scope[precannedFields + '_duplicate'].indexOf(element[precannedFields].modelDisplayValue) < 0) {
                        $scope[precannedFields + 'display'] += $scope[precannedFields + '_duplicate'].length ? ', ' + element[precannedFields].modelDisplayValue : '' + element[precannedFields].modelDisplayValue;
                        $scope[precannedFields + '_duplicate'].push(element[precannedFields].modelDisplayValue);
                    }
                })
                postScope.push(objScope);
            })            //Create the complete string to display Roles
            $scope.precannedRoles = '';
            var multicheckboxData = angular.fromJson(localStorage.getItem('multicheckboxLabel-' + 'roleRequestables'));
            angular.forEach($scope.vm.model['roleRequestables'], function (element, key) {
                if (element) {
                    var roleLabel = $filter('filter') (multicheckboxData, {
                        'name': key
                    }, true) [0];
                    $scope.precannedRoles += roleLabel.label + ', ';
                }
            })
            $scope.precannedRoles = $scope.precannedRoles.substring(0, $scope.precannedRoles.length - 2);
            var deferred = $q.defer();
            $scope.isLoadingPrecanned = true;
            //Final object to sent with the POST
            var objPrecanned = {
                'subjectName': $scope.frmData.beneficiary,
                'attributeName': 'snp.refData.roles.preCertifiedJustificationIds.data',
                'environmentVariables': {
                    //"returnAll": "Y",
                    'requestedAccess': {
                        'functionalRole': $scope.frmData.application,
                        'scope': postScope
                    }
                }
            }
            var resultPromise = RefRestangular.all('').post(objPrecanned);
            resultPromise.then(function (result) {
                deferred.resolve(result);
                if (result.error) {
                    if (result.error.status == 404) {
                        $scope.precannedJustificationList = null;
                        //$scope.error = 'No Records';
                    } else {
                        $scope.precannedJustificationList = null;
                    }
                } else {
                    var response = result.data.plain();
                    $scope.precannedJustificationList = angular.copy($scope.precannedBucketValidate(response));
                    angular.keySort($scope.precannedJustificationList, 'labelDisplay', false);
                }
            }).finally (function () {
                $scope.isLoadingPrecanned = false;
            });
            return deferred.promise;
        }        // Precanned Bucket validatation with different criteria

        $scope.precannedBucketValidate = function (response) {
            var tempPrecanned = [
            ];
            var appendOthers = {
                'children': null,
                'name': 'others',
                'labelDisplay': 'Other',
                'attributes': {
                    'granted': false,
                    'label': 'Other'
                }
            };
            if (angular.isUndefinedOrNull(response.children)) {
                return tempPrecanned;
            }            /* Precanned response.children grater than 2*/

            if (Object.keys(response.children).length > 2) {
                tempPrecanned.push(appendOthers);
                /* Precanned response.children equal to 2 but having multipleDepartments */
            } else if (Object.keys(response.children).length == 2 && $filter('filter') (response.children, {
                'name': 'multipleDepartments'
            }).length) {
                var arrFilter = $filter('filter') (response.children, {
                    'name': '!multipleDepartments'
                });
                angular.forEach(arrFilter, function (childElement) {
                    angular.forEach(childElement.children, function (element) {
                        element.labelDisplay = element.attributes.label.length > 105 ? element.attributes.label.substr(0, 105) + '...' : element.attributes.label;
                        tempPrecanned.push(element);
                    })
                })                /* Precanned response.children equal to 2 but not having multipleDepartments */
            } else if (Object.keys(response.children).length == 2 && !$filter('filter') (response.children, {
                'name': 'multipleDepartments'
            }).length) {
                tempPrecanned.push(appendOthers);
            } else {
                /* Precanned response.children having null response and having only one set */
                angular.forEach(response.children, function (childElement) {
                    angular.forEach(childElement.children, function (element) {
                        element.labelDisplay = element.attributes.label.length > 105 ? element.attributes.label.substr(0, 105) + '...' : element.attributes.label;
                        tempPrecanned.push(element);
                    })
                })
            }
            return tempPrecanned;
        }        //Function is triggered when you change precanned justification 

        $scope.objSelectedPrecanned = {
        };
        $scope.changePrecanned = function () {
            $scope.objSelectedPrecanned = angular.fromJson($scope.precannedJustification);
            if ($scope.objSelectedPrecanned.attributes.label != 'Other' && $scope.precannedJustificationList.length) {
                $scope.customPrecannedJustification = $scope.objSelectedPrecanned.attributes.label;
            } else {
                $scope.customPrecannedJustification = '';
            }
        }        // PreCanned Justification End //
        //Fetch the End Date attribute from API to show 

        $scope.setEndDate = function () {
            var deferred = $q.defer();
            var objRequestables = {
                'subjectName': $scope.frmData.beneficiary,
                'attributeName': 'snp.refData.endDate.attribute.data',
                'environmentVariables': {
                    //"returnAll": "Y", //only if you want all returned.
                    'requestedAccess': {
                    }
                }
            };
            var requestablePromise = RefRestangular.all('').post(objRequestables);
            requestablePromise.then(function (res) {
                deferred.resolve(res);
            }, function (response) {
                console.log('Error with status code', response.status);
            }
            ).finally (function () {
            });
            return deferred.promise;
        }        // Get the current user from session // 

        $scope.loggedUser = _currentUser;
        //Access drop down values //
        $scope.requestableType = _requestableType;
        //To store the request submit id //
        $rootScope.requestId = null;
        //Go into the REVISE Mode //
        $scope.enterInside = true;
        //Object to store the info from Beneficiary and Access               
        $scope.frmData = {
        };
        //Vm Object to store all form related element                 
        $scope.vm = this;
        $scope.vm.formHeader = $scope.header;
        //Object to store form options                
        $scope.vm.options = {
        };
        //initialize the model
        $scope.vm.model = {
        };
        $scope.vm.fields = {
        };
        //                $scope.vm.onSubmit = onSubmit;
        //
        //                function onSubmit() {
        //                    $rootScope.formSubmit = true; 
        //                    alert($rootScope.formSubmit)
        ////                    if ($scope.vm.form.$valid) {
        ////                        $scope.nextTab();
        ////                    }
        //                }
        $scope.vm.onSubmit = function ($event) {
            $rootScope.$broadcast('onSubmit', {
                'submit': false
            });
            $timeout(function () {
            	console.log("form submitted onSubmit",$event);
                var customValidation = true;
                angular.forEach($scope.vm.fields, function (field) {
                	console.log("field",field);
                    if (field.key && angular.isString(field.key) && angular.isDefined(field.data.submit)) {
                        if (!field.data.submit) {
                            customValidation = false;
                        }
                    }
                })                
                console.log("customValidation",$scope.vm.form.$valid);
                customValidation = $scope.checkAndValidateForms($event)
                if ($scope.vm.form.$valid) {
                    $scope.nextTab();
                }
            }, 1000)
        }        // Function to check the value is object //

        $scope.isObject = function (obj) {
            if (angular.isObject(obj)) {
                return true;
            } else {
                return false;
            }
        };
        // Function to check value exists in array //                
        $scope.isExistInArray = function (searchVal, array) {
            if (array.indexOf(searchVal) == - 1) {
                return false;
            } else {
                return true;
            }
        }        // Link to tab from the edit icon in summary //

        $scope.uniqueRequestId = '';
        $scope.editTab = function (index, uniqueRequestId) {
            $scope.selectedIndex = index;
            $scope.uniqueRequestId = uniqueRequestId;
        }
        $scope.changeBeneficiary = function (index) {
            $scope.frmData = {
            };
            $scope.beneficiaryDisplay = null;
            $scope.profile = null;
            $scope.selectedIndex = index;
            $scope.requestType.others = true;
            $scope.requestType.self = false;
            $scope.tabLocked = {
                firstLocked: false,
                secondLocked: true,
                thirdLocked: true,
                fourthLocked: true,
                fifthLocked: true
            }
        }        // Beneficiary request types //

        $scope.requestType = {
            self: true,
            others: false
        }        //Start Over from Access step //(Start Over)

        $scope.startOver = function () {
            $scope.showNoChange = false;
            $scope.enterInside = true;
            $scope.selectedObj = null;
            //$scope.frmData = {};
            delete $scope.frmData.accessKey;
            delete $scope.frmData.selectedapplication;
            $scope.vm.model = {
            };
            $scope.selectedIndex = 2;
            $scope.tabLocked = {
                firstLocked: false,
                secondLocked: false,
                thirdLocked: true,
                fourthLocked: true,
                fifthLocked: true
            }
            $scope.replaceContent = {
                searchApp: false,
                preRequisites: false
            }
            $scope.showDescription = false;
            setTimeout(function () {
                var tabItem = document.getElementsByTagName('md-tab-item');
                for (var i = 2; i < tabItem.length; i++) {
                    document.getElementsByTagName('md-tab-item') [i].classList.remove('md-visited');
                }
            }, 2000);
            StorageService.removeData('vm.fields', STORAGE_TYPES.local, '');
            localStorage.removeItem('treedropdownModel');
            $scope.resetValidationVariables();
        }        //Reset the new request from stage Beneficiary // 

        $scope.reloadState = function (resetBeneficiary) {
            $scope.showNoChange = false;
            $scope.enterInside = true;
            $scope.frmData = {
            };
            $scope.selectedObj = null;
            if (resetBeneficiary == undefined || resetBeneficiary !== false) {
                $scope.requestType.self = true;
                $scope.requestType.others = false;
            }
            $scope.selectedItem = null;
            //                    $scope.tabLocked = {
            //                        firstLocked: true,
            //                        secondLocked: false,
            //                        thirdLocked: true,
            //                        fourthLocked: true,
            //                        fifthLocked: true
            //                    }
            $scope.replaceContent = {
                searchApp: false,
                preRequisites: false,
                requestViolation: false
            }            //To reset the description in access step 

            $scope.accessTypeDescription = '';
            //setTimeout(function () {
            var tabItem = document.getElementsByTagName('md-tab-item');
            for (var i = 0; i < tabItem.length; i++) {
                document.getElementsByTagName('md-tab-item') [i].classList.remove('md-visited');
            }            //}, 2000);

            $scope.vm.model = {
            };
            //Remove entries from local storage
            StorageService.removeData('requestableStorage', STORAGE_TYPES.local, '');
            $scope.reloadInbox = false;
            //To disable the Next button in access step.
            $scope.accessDisabled = true;
            //Reset the checkbox on access page
            $scope.showUnauthorizedChecked = false;
            $scope.resetValidationVariables();
            $scope.arrInQueue = [
            ];
        }        // Reset the form on click of RESET button on form step //

        $scope.resetfrm = function () {
            if ($scope.modeRequestId) {
                $scope.vm.model = angular.copy($scope.oldModel);
            } else {
                $scope.vm.options.resetModel();
            }
            $rootScope.requestId = null;
        }        //Get the beneficiary details from the API

        $scope.getUserDetails = function (beneficiary) {
            var deferred = $q.defer();
            var requestModePromise = Restangular.one('/users', beneficiary).get();
            requestModePromise.then(function (res) {
                deferred.resolve(res);
            });
            return deferred.promise;
        }        /*
                 * Steps when user want to update the access from My Access
                 * 
                 */
        //Update Access flow for selected user (from User Access details page)

        $scope.isManageUserAccess = false;
        //Reset Selected user's access data if not coming from Access page
        $scope.previousState = $rootScope.previousState;
        if ($scope.previousState != 'access.user' && $scope.previousState != 'access.current' && $scope.previousState != 'inbox.request') {
            userAccessDetailsFactory.reset();
        }        //Redirect the user to Access page if user press cancle in form stage

        $scope.cancelUserAccess = function () {
            userAccessDetailsFactory.reset();
            StorageService.removeData('vm.fields', STORAGE_TYPES.local, '');
            var params = {
            };
            if ($scope.requestId) {
                params = {
                    requestId: $scope.requestId
                };
            }
            $state.go($scope.previousState, params);
        }
        $scope.userAccessData = userAccessDetailsFactory.get();
        //Flow when user want to update access from My Access 
        if (!angular.isObjectEmpty($scope.userAccessData)) {
            //console.log('userAccessData',$scope.userAccessData);
            //Reset validation variables
            $scope.resetValidationVariables();
            StorageService.removeData('vm.fields', STORAGE_TYPES.local, '');
            $scope.isManageUserAccess = true;
            $scope.requestablePromise = false;
            $scope.userRequestModeAccountPromise = false;
            $scope.requestType.self = false;
            $scope.requestType.others = true;
            $scope.frmData.beneficiary = $scope.userAccessData.userDetails.id;
            $scope.isMoverAuthorized = $scope.userAccessData.isMoverAuthorized;
            var userDisplayName = ($scope.userAccessData.userDetails.displayName) ? $scope.userAccessData.userDetails.displayName : $scope.userAccessData.userDetails.cn;
            $scope.selectedItem = userDisplayName;
            $scope.beneficiaryDisplay = userDisplayName;
            $scope.frmData.accessType = $scope.userAccessData.accessType;
            $scope.frmData.accessKey = $scope.userAccessData.accessKey;
            if ($scope.userAccessData.requestId) {
                $scope.requestId = $scope.userAccessData.requestId;
            }
            $scope.tabLocked = {
                firstLocked: true,
                secondLocked: true,
                thirdLocked: true,
                fourthLocked: true,
                fifthLocked: true
            };
            $scope.userRequestModeAccount = {
            };
            $scope.getUserDetails($scope.frmData.beneficiary).then(function (res) {
                $scope.userDetails = angular.fromJson(res.data.plain());
                //set the policy details
                $scope.setPolicy().then(function (resPolicyDetails) {
                    //console.log('resPolicyDetails',resPolicyDetails);
                    $scope.policyCode = resPolicyDetails.policyCode;
                    $scope.policyName = resPolicyDetails.policyName;
                    $scope.userRequestModeAccount = angular.fromJson(res.data).accounts;
                    //console.log('userReq: ',$scope.userRequestModeAccount);
                    $scope.userRequestModeAccountPromise = true;
                    if (angular.isUndefined($scope.showUnauthorizedChecked) || !$scope.showUnauthorizedChecked) {
                        $scope.accesscategory(true);
                    }
                },                // error
                function (response) {
                }
                );
            },            // error
            function (response) {
            }
            );
            $scope.$watchGroup(['requestablePromise',
            'userRequestModeAccountPromise'], function (newVal, oldVal) {
                if (newVal[0] === true && newVal[1] === true) {
                    var requestableArray = $scope.requestableName[$scope.frmData.accessKey];
                    var filterobj = {
                        'endpoint': $scope.userAccessData.accessTarget
                    };
                    if ($filter('filter') (requestableArray, filterobj, true).length) {
                        $scope.frmData.selectedapplication = $filter('filter') (requestableArray, filterobj, true) [0];
                        $scope.changeapplication();
                    }                    //$scope.tabLocked.secondLocked = true;

                    $scope.tabLocked.thirdLocked = false;
                    $scope.selectedIndex = 2;
                    //$rootScope.requiredCheck = false;
                }
            });
        } else {
            //The normal flow when user want to update access from new request 
            // Tab locked initail value //
            $scope.tabLocked = {
                firstLocked: true,
                secondLocked: false,
                thirdLocked: true,
                fourthLocked: true,
                fifthLocked: true
            }            //Reset all on refresh //

            $scope.reloadState();
        }        //Set the policyName & policy Code

        $scope.setPolicy = function () {
            var deferred = $q.defer();
            var policyDetails = {
                policyName: '',
                policyCode: ''
            }
            if ($scope.requestType.self) {
                // Get the policy details in case of self
                $scope.checkAlternatePolicy = false;
                if (angular.isDefined($scope.loggedUser.alternatePolicyRole)) {
                    policyDetails.policyName = $rootScope.policyRoles[$scope.loggedUser.alternatePolicyRole];
                    policyDetails.policyCode = $scope.loggedUser.alternatePolicyRole;
                    $scope.checkAlternatePolicy = true;
                } else if (!$scope.checkAlternatePolicy) {
                    policyDetails.policyName = $rootScope.policyRoles[$scope.loggedUser.alternatePolicyRole];
                    policyDetails.policyCode = $scope.loggedUser.defaultPolicyRole;
                }                // Set Default Policy role

                $scope.defaultPolicyRole = $scope.loggedUser.defaultPolicyRole;
            } else {
                // Get the policy details in case of  others
                $scope.checkAlternatePolicy = false;
                if (angular.isDefined($rootScope.policyRoles[$scope.userDetails.alternatePolicyRole])) {
                    policyDetails.policyName = $rootScope.policyRoles[$scope.userDetails.alternatePolicyRole];
                    policyDetails.policyCode = $scope.userDetails.alternatePolicyRole;
                    $scope.checkAlternatePolicy = true;
                } else if (!$scope.checkAlternatePolicy) {
                    policyDetails.policyName = $rootScope.policyRoles[$scope.userDetails.defaultPolicyRole];
                    policyDetails.policyCode = $scope.userDetails.defaultPolicyRole;
                }                // Set Default Policy role

                $scope.defaultPolicyRole = $scope.userDetails.defaultPolicyRole;
            }
            deferred.resolve(policyDetails);
            return deferred.promise;
        }
        $scope.brifcasePost = [
        ];
        $scope.brifcaseList = [
        ];
        $scope.addToBrifcase = function () {
            var requestTitle = getRequestTitle();
            var brifcaseData = newRequestService.getApiJson($scope, requestTitle);
            //Check If PATCH has no change //
            //console.log(angular.toJson(brifcaseData.reqdata));
            $scope.showNoChange = false;
            /* No change message is applicable only for PATCH */
            /* Exclude the crossPractice field because that field is added as an extra field in case of analytical */
            var filterWithoutCrossPractice = $filter('filter') (brifcaseData.reqdata.Operations[0].data.Operations, {
                'path': '!crossPractice'
            });
            if (!filterWithoutCrossPractice.length && !angular.isUndefined($scope.modeRequestId)) {
                angular.element(document.getElementById('addtobrifcase')) [0].disabled = true;
                $scope.showNoChange = true;
                return true;
            }            // Check the request is duplicate or not

            var brifcasePost = angular.fromJson(localStorage.getItem('brifcase.post'));
            var brifcaseList = angular.fromJson(localStorage.getItem('brifcase.list'));
            // check the dupliacte based on appliation name
            var keepGoing = true;
            var removeDuplicateId = '';
            angular.forEach(brifcaseList, function (element) {
                if (keepGoing) {
                    // Duplicates: Having same requestable name and owner
                    if (angular.equals(element.target, brifcaseData.brifcaseList.target) && angular.equals(element.owner, brifcaseData.brifcaseList.owner)) {
                        removeDuplicateId = element['uniqueRequestId'];
                        keepGoing = false;
                    }
                }
            })
            if (!angular.equals(removeDuplicateId, '')) {
                var newbrifcaseList = [
                ];
                angular.forEach(brifcaseList, function (objBrifcaseList) {
                    if (!angular.equals(objBrifcaseList.uniqueRequestId, removeDuplicateId)) {
                        newbrifcaseList.push(objBrifcaseList);
                    }
                })
                localStorage.setItem('brifcase.list', angular.toJson(newbrifcaseList));
                var newbrifcasePost = [
                ];
                angular.forEach(brifcasePost, function (objBrifcasePost) {
                    if (!angular.equals(objBrifcasePost.uniqueRequestId, removeDuplicateId)) {
                        newbrifcasePost.push(objBrifcasePost);
                    }
                })
                localStorage.setItem('brifcase.post', angular.toJson(newbrifcasePost));
            }
            angular.saveDataToLocalStorage(brifcaseData.reqdata, 'brifcase.post');
            angular.saveDataToLocalStorage(brifcaseData.brifcaseList, 'brifcase.list');
            $scope.brifcasePost = angular.fromJson(localStorage.getItem('brifcase.post'));
            $scope.brifcaseList = angular.fromJson(localStorage.getItem('brifcase.list'));
            $rootScope.requestInBrifcaseCount = $scope.brifcaseList.length;
            $scope.selectedIndex = 4;
            $scope.tabLocked.fifthLocked = false;
            $scope.uniqueRequestId = '';
            $scope.resetAccessContent();
            $scope.showUnauthorizedChecked = false;
        }        // In Queue the request to submit //

        $scope.arrInQueue = [
        ];
        $scope.inQueueToSubmit = function (row) {
            $scope.arrInQueue = BriefcaseService.inQueueToSubmit(row, $scope.arrInQueue);
        }        // Add to brifcase by call the REST Api // 

        var promises = [
        ];
        $scope.submitBrifcase = function ()
        {
            BriefcaseService.submitBrifcase($scope);
            setTimeout(function () {
                $scope.brifcaseList = angular.fromJson(localStorage.getItem('brifcase.list'));
                $scope.brifcasePost = angular.fromJson(localStorage.getItem('brifcase.post'));
                $rootScope.requestInBrifcaseCount = $scope.brifcaseList.length;
            }, 1000);
            $q.all(promises).then(function (results) {
                $rootScope.requestId = BriefcaseService.mergeRequest($scope.arrRequestId);
                $scope.reloadInbox = true;
                $state.go('inbox.list', {
                    'alertType': 'newrequest_success'
                });
            },            // error
            function (response) {
            }
            );
            setTimeout(function () {
                /*$("#alert-briefcase-success").removeClass("hide");
                                         //$("#apps").find(".mail-list-expanded").hide();
                                         setTimeout(function () {
                                         $("#alert-briefcase-success").addClass("hide");
                                         }, 2500);*/
                $scope.vm.model = {
                };
                $scope.frmData = {
                };
                $scope.selectedItem = null;
                if (!angular.isUndefinedOrNull(localStorage.getItem('brifcase.list'))) {
                    $rootScope.requestInBrifcaseCount = angular.fromJson(localStorage.getItem('brifcase.list')).length;
                }
            }, 4000);
        };
        //Stores all the request Ids after submitting the request
        $scope.arrRequestId = [
        ];
        //Its called when you want to submit the request from briefcase                        
        $scope.submitFinalRequest = function (finaldata) {
            promises.push(BriefcaseService.submitFinalRequest(finaldata, $scope));
        }        //Opens a confirmation dialog box when you want to delete request 

        $scope.removeFromBrifcase = function ($event) {
            var viewPath = VIEW_PATH.mainview + 'requests/dialog/briefcase-delete.tmpl.html';
            $mdDialog.show({
                controller: DialogCtrl,
                scope: $scope,
                preserveScope: true,
                controllerAs: 'ctrl',
                templateUrl: viewPath,
                targetEvent: $event,
                clickOutsideToClose: false
            }).then(function (actionData) {
                //$scope.comment = actionData;
            }, function () {
                //$scope.comment = '';
            });
            ;
            function DialogCtrl() {
                var self = this;
                self.cancel = function ($event) {
                    $mdDialog.cancel();
                };
                self.finish = function ($event) {
                    $mdDialog.hide();
                    BriefcaseService.removeFromBrifcase($scope);
                    setTimeout(function () {
                        $scope.brifcaseList = angular.fromJson(localStorage.getItem('brifcase.list'));
                        $scope.brifcasePost = angular.fromJson(localStorage.getItem('brifcase.post'));
                        $rootScope.requestInBrifcaseCount = $scope.brifcaseList.length;
                        $state.reload('request.briefcase');
                    }, 500);
                };
            }
        }        //Mark the check boxes checked //

        $scope.checkAll = function () {
            angular.forEach($scope.brifcaseList, function (item) {
                item.Selected = true;
            });
        };
        //Show at least one row for the custom element in the form that are configured in the constant SHOW_ASSIGN_MODEL //  
        $scope.showCustomAddSelect = function (arrShowAssignModel) {
            angular.forEach(arrShowAssignModel, function (elementKey) {
                var filterobj = {
                };
                filterobj['type'] = elementKey;
                var arrFilter = $filter('filter') ($scope.vm.fields, filterobj, true);
                if (arrFilter.length) {
                    angular.forEach(arrFilter, function (objSearch, key) {
                        var ObjModel = {
                        };
                        ObjModel[objSearch.key] = [
                            {
                            }
                        ];
                        angular.extend($scope.vm.model, ObjModel);
                    })
                }
            });
        }        //Filter the meta-date by key : value

        $scope.filterNames = function (key, value) {
            var searchElement = null;
            var filterobj = {
            };
            filterobj[key] = value;
            var keepGoing = true;
            angular.forEach($scope.vm.fields, function (innerVal, innerkey) {
                if (keepGoing) {
                    if (angular.isUndefined(innerVal.type)) {
                        if ($filter('filter') (innerVal.fieldGroup, filterobj, true).length) {
                            keepGoing = false;
                            searchElement = $filter('filter') (innerVal.fieldGroup, filterobj, true) [0];
                        }
                    } else {
                        var arrSerach = [
                        ];
                        //chnages done for KRA
                        //arrSerach.push(angular.copy(innerVal));
                        arrSerach.push(innerVal);
                        if ($filter('filter') (arrSerach, filterobj, true).length) {
                            keepGoing = false;
                            searchElement = $filter('filter') (arrSerach, filterobj, true) [0];
                        }
                    }
                }
            })
            return (searchElement);
        }        //Stores the beneficiary details                      

        $scope.userDetails = {
        };
        //$watch new request steps 
        $scope.$watch('selectedIndex', function (current, old) {
            var elmnt = document.getElementById('scrollTop');
            if (!angular.isUndefinedOrNull(elmnt)) {
                elmnt.scrollTop = 0;
            }
            if (current === 0 && !$scope.isManageUserAccess) {
                $state.go('request.beneficiary');
                formSteps.beneficiary($scope);
                if (angular.isDefined(angular.element(document.getElementById('nextBtn')) [0])) {
                    angular.element(document.getElementById('nextBtn')) [0].disabled = false;
                }
                $('.md-tab').eq(old).addClass('md-visited');
            } else if (current === 1 && !$scope.isManageUserAccess) {
                $state.go('request.access');
                formSteps.access($scope);
                if (angular.isDefined($scope.frmData.application)) {
                    if (angular.isDefined(angular.element(document.getElementById('nextBtn')) [0])) {
                        angular.element(document.getElementById('nextBtn')) [0].disabled = false;
                    }
                } else {
                    if (angular.isDefined(angular.element(document.getElementById('nextBtn')) [0])) {
                        angular.element(document.getElementById('nextBtn')) [0].disabled = true;
                    }
                }
            } else if (current === 2) {
                if ($scope.reloadInbox) {
                    $state.go('inbox.list', {
                    }, {
                        reload: true
                    });
                    $scope.reloadInbox = false;
                    return true;
                }
                $state.go('request.optapplications');
                formSteps.optapplications($scope);
                if (angular.isDefined(angular.element(document.getElementById('nextBtn')) [0])) {
                    angular.element(document.getElementById('nextBtn')) [0].disabled = true;
                }
                $scope.tabLocked.fourthLocked = true;
                $scope.tabLocked.fifthLocked = true;
                setTimeout(function () {
                    var tabItem = document.getElementsByTagName('md-tab-item');
                    for (var i = 3; i < tabItem.length; i++) {
                        document.getElementsByTagName('md-tab-item') [i].classList.remove('md-visited');
                    }
                }, 500);
            } else if (current === 3) {
                $state.go('request.optfunctions');
                formSteps.optfunctions($scope);
            } else if (current === 4) {
                formSteps.summary($scope);
                $state.go('request.summary');
            }
            if (current != 0) {
                if (angular.isObjectEmpty($scope.userAccessData) || (!angular.isObjectEmpty($scope.userAccessData) && current > 2)) {
                    $('.md-tab').eq(old).addClass('md-visited');
                }
            }
            setTimeout(function () {
                resizePage();
            }, 1000);
        });
        //Set access Type Information 
        $scope.accessTypeDescription = '';
        $scope.setAccessTypeInfo = function () {
            var objSearched = $scope.selectedAccessInfo();
            if (angular.isDefined(objSearched.attributes) && angular.isDefined(objSearched.attributes.description)) {
                $scope.accessTypeDescription = objSearched.attributes.description;
            }
        }        // Get selected access Type Information from requestable

        $scope.selectedAccessInfo = function () {
            if ($filter('filter') ($scope.requestableName[$scope.frmData.accessKey], {
                endpoint: $scope.frmData.application
            }, true).length) {
                return $filter('filter') ($scope.requestableName[$scope.frmData.accessKey], {
                    endpoint: $scope.frmData.application
                }, true) [0];
            }
        }        // Show the Post Revoke Condition on summary Page;

        $scope.showPostRevoke = function () {
            var objSearched = $scope.selectedAccessInfo();
            if (angular.isDefined(objSearched.attributes) && angular.isDefined(objSearched.attributes.postConditionRevoke)) {
                var postConditionRevoke = objSearched.attributes.postConditionRevoke;
                var arrRevoke = [
                ];
                angular.forEach(postConditionRevoke, function (accessType, key) {
                    angular.keySort($scope.userRequestModeAccount, 'provisionedOn', true);
                    if ($filter('filter') ($scope.userRequestModeAccount, {
                        'target_name-value': accessType
                    }, true).length) {
                        var filterAccount = ($filter('filter') ($scope.userRequestModeAccount, {
                            'target_name-value': accessType
                        }, true) [0]);
                        if (filterAccount.status.toLowerCase() == REQUEST_STATUS.PROVISIONED) {
                            //arrRevoke.push(accessType);
                            arrRevoke.push(filterAccount.target_name);
                        }
                    }
                });
                return (angular.mergeArray(arrRevoke, ','));
            }
        }        //Loads the revised data from API

        $scope.patchformModel = function () {
            var deferred = $q.defer();
            //Load the form data for update //
            if ($scope.enterInside) {
                // GET /accounts/123?single=true
                var postDetailsPromise = Restangular.one('users', $scope.modeRequestId).get({
                    'midas-target': $scope.frmData.application
                });
                postDetailsPromise.then(function (res) {
                    deferred.resolve(res);
                });
                $scope.enterInside = false;
            }
            return deferred.promise;
        }        //Loads the data from API for fields that are configured in treedropdown meta-data 

        $scope.getTreedropdownDataFromAPI = function (addParams, refData, key) {
            var deferred = $q.defer();
            referenceDataFactory.getData(addParams, refData).then(function (response) {
                var objResponse = {
                    key: key,
                    resData: response.data.plain()
                }
                deferred.resolve(objResponse);
            });
            return deferred.promise;
        }        //Put the same data in the scope. So that it will be available before the form load                       

        $scope.loadTreedropdown = function (filterTreedropdown) {
            var deferred = $q.defer();
            var promises = [
            ];
            $scope.fillcustomdropdown = {
            };
            var addParams = {
                application: $scope.frmData.application,
                userId: $scope.frmData.beneficiary
            };
            var treedropdownJson = filterTreedropdown[0];
            var filterByKey = $filter('filter') (treedropdownJson.templateOptions.fields[0].fieldGroup, {
                'type': 'treedropdown'
            }, true);
            angular.forEach(filterByKey, function (element) {
                promises.push($scope.getTreedropdownDataFromAPI(addParams, element.data.refData, element.key));
            })            // Promises for treedropdown elements from metadata api
            $q.all(promises).then(function (response) {
                angular.forEach(response, function (responseElement) {
                    // If key has '-' in key field like analyticalRoles, split for region & dept treedropdown
                    var arrPath = responseElement.key.split('-');
                    var lastValue = arrPath[arrPath.length - 1];
                    $scope.fillcustomdropdown[$scope.frmData.beneficiary + '_' + lastValue] = angular.copy(responseElement.resData);
                    var treePathByName = ARPService.getHierarchicalPaths(responseElement.resData.children, 'name');
                    var treePathByLabel = ARPService.getHierarchicalPaths(responseElement.resData.children, 'attributes.label');
                    var treePathNameLabel = ARPService.getHierarchicalPathNames(responseElement.resData.children, 'name', 'attributes.label');
                    localStorage.setItem('treedropdownModelByName-' + lastValue, angular.toJson(treePathByName));
                    localStorage.setItem('treedropdownModelByLabel-' + lastValue, angular.toJson(treePathByLabel));
                    localStorage.setItem('treedropdownModelByNameLabel-' + lastValue, angular.toJson(treePathNameLabel));
                })
                var fillcustomdropdown = angular.copy($scope.fillcustomdropdown);
                deferred.resolve(fillcustomdropdown);
            })
            return deferred.promise;
        }        // Common function for End date forms & General forms

        $scope.prepareFormFields = function (resData, resDateData) {
            var formFields = {
            };
            //Check whether to add end date in meta-data or not
            if (!angular.isUndefinedOrNull(resDateData) && !angular.isUndefinedOrNull(resDateData.data.children) && angular.equals(resDateData.data.children[0].name.toLowerCase(), 'yes')) {
                var dateElement = {
                    'className': 'flex-40',
                    'type': 'customdate',
                    'key': 'endDate',
                    'name': 'End Date',
                    'data': {
                        'displaySequence': 0
                    }
                }
                var dateHeader = {
                    'type': 'header',
                    'name': 'Access Date',
                    'info': 'Access Date'
                }                //Don't change the sequence

                resData.elements.unshift(dateElement);
                resData.elements.unshift(dateHeader);
            }            // Remove the row element from the meta-data Justification

            var filterWithoutJustification = $filter('filter') (resData.elements, {
                'name': '!Justification'
            });
            var filterJustification = $filter('filter') (resData.elements, {
                'name': 'Justification'
            }, true);
            angular.forEach(filterJustification, function (justificationElement) {
                if (angular.isDefined(justificationElement.templateOptions)) {
                    delete justificationElement.templateOptions.rows;
                }
            })
            filterWithoutJustification.push(filterJustification[0]);
            filterWithoutJustification.push(filterJustification[1]);
            resData.elements = angular.copy(filterWithoutJustification);
            //If isPreCanned found true its hide the Justification element in meta-data 
            if ($scope.isPreCanned()) {
                formFields = $filter('filter') (resData.elements, {
                    'name': '!Justification'
                });
                var filterJustification = $filter('filter') (resData.elements, {
                    'name': 'Justification'
                }, true);
                angular.forEach(filterJustification, function (justificationElement) {
                    justificationElement.hide = true;
                })
                formFields.push(filterJustification[0]);
                formFields.push(filterJustification[1]);
            } else {
                //Set the icon hover info for the Justification     
                formFields = resData.elements;
                var filterJustification = $filter('filter') (formFields, {
                    'info': 'Justification'
                }, true);
                filterJustification[0].info = 'Please provide any additional information relevant to processing this request below.';
            }            //Assign vm.fields to validator function to parse required .

            $scope.arrRequired = $scope.pushRequired(formFields);
            StorageService.putData('vm.fields', formFields, STORAGE_TYPES.local);
            return formFields;
        }        //Load the meta-data from Local to debug

        $scope.getMetaDataFromLocal = function () {
            console.log('$scope.getMetaDataFromLocal');
            /* New Demo code */
            var deferred = $q.defer();
            var promises = [
            ];
            var metadata = [
            ];
            // sorting application by name
            $scope.frmData.applicationList = $filter('orderBy') ($scope.frmData.applicationList, 'name');
            angular.forEach($scope.frmData.applicationList, function (application) {
                promises.push(formFactory.getFormData(application.name));
            })
            var index = 0;
            $q.all(promises).then(function (response) {
                angular.forEach(response, function (data) {
                    angular.forEach(data.data[Object.keys(data.data) [0]], function (element) {
                        if (element.key) {
                            if (angular.isUndefined(element.data)) {
                                element.data = {
                                }
                            }
                            element.data.displaySequence = index++;
                            element.data.applicationName = Object.keys(data.data) [0];
                        }
                        metadata.push(element);
                    })
                })
                StorageService.putData('vm.fields', response, STORAGE_TYPES.local);
                deferred.resolve(metadata);
            })            /* New Demo code end*/
            //                            var processedFormFields = {};
            //                            var deferred = $q.defer();
            //                            var state = $scope.frmData.application;
            //                            formFactory.getFormData(state)
            //                                    .then(function (response) {
            //                                        var resData = angular.fromJson(response.data);
            //                                        var filterTreedropdown = $filter('filter')(resData.elements, {"type": "treedropdownselect"}, true);
            //                                        //If we found treedropdownselect in meta-data then first load the fields data from "loadTreedropdown" 
            //                                        if (filterTreedropdown.length) {
            //                                            $scope.loadTreedropdown(filterTreedropdown).then(
            //                                                    function (response) {
            //                                                        // This is only for End Date Policy Roles (e.g. ASC6) and Functional Role
            //                                                        if ($scope.frmData.accessType == "Functional Role" && END_DATE_POLICY.indexOf($scope.defaultPolicyRole) != -1) {
            //                                                            $scope.setEndDate().then(
            //                                                                    function (resDateData) {
            //
            //                                                                        processedFormFields = $scope.prepareFormFields(resData, resDateData);
            //                                                                        deferred.resolve(processedFormFields);
            //                                                                    },
            //                                                                    // error
            //                                                                            function (response) {
            //
            //                                                                            });
            //                                                                } else {
            //                                                            // General Forms without End Date
            //                                                            processedFormFields = $scope.prepareFormFields(resData);
            //                                                            deferred.resolve(processedFormFields);
            //                                                        }
            //                                                    })
            //                                                } else {
            //                                                    if ($scope.frmData.accessType == "Functional Role" && END_DATE_POLICY.indexOf($scope.defaultPolicyRole) != -1) {
            //                                                        $scope.setEndDate().then(
            //                                                                function (resDateData) {
            //
            //                                                                    processedFormFields = $scope.prepareFormFields(resData, resDateData);
            //                                                                    deferred.resolve(processedFormFields);
            //                                                                },
            //                                                                // error
            //                                                                        function (response) {
            //
            //                                                                        });
            //                                                            } else {
            //                                                        // General Forms without End Date
            //                                                        processedFormFields = $scope.prepareFormFields(resData);
            //                                                        deferred.resolve(processedFormFields);
            //                                                    }
            //                                                }
            //
            //
            //
            //
            //                                            });
            return deferred.promise;
        }        //Load the meta-data from API

        $scope.getMetaDataFromAPI = function () {
            var processedFormFields = {
            };
            var deferred = $q.defer();
            //var formFields = {};
            var FormPromise = Restangular.one('/config/idmprovider', 'snp.Form.' + $scope.frmData.application).get();
            FormPromise.then(function (res) {
                var resData = angular.fromJson(res.data);
                var filterTreedropdown = $filter('filter') (resData.elements, {
                    'type': 'treedropdownselect'
                }, true);
                //If we found treedropdownselect in meta-data then first load the fields data from "loadTreedropdown" 
                if (filterTreedropdown.length) {
                    $scope.loadTreedropdown(filterTreedropdown).then(function (response) {
                        // This is only for End Date Policy Roles (e.g. ASC6) and Functional Role
                        if ($scope.frmData.accessType == 'Functional Role' && END_DATE_POLICY.indexOf($scope.defaultPolicyRole) != - 1) {
                            $scope.setEndDate().then(function (resDateData) {
                                processedFormFields = $scope.prepareFormFields(resData, resDateData);
                                deferred.resolve(processedFormFields);
                            },                            // error
                            function (response) {
                            });
                        } else {
                            // General Forms without End Date
                            processedFormFields = $scope.prepareFormFields(resData);
                            deferred.resolve(processedFormFields);
                        }
                    })
                } else {
                    if ($scope.frmData.accessType == 'Functional Role' && END_DATE_POLICY.indexOf($scope.defaultPolicyRole) != - 1) {
                        $scope.setEndDate().then(function (resDateData) {
                            processedFormFields = $scope.prepareFormFields(resData, resDateData);
                            deferred.resolve(processedFormFields);
                        },                        // error
                        function (response) {
                        });
                    } else {
                        // General Forms without End Date
                        processedFormFields = $scope.prepareFormFields(resData);
                        deferred.resolve(processedFormFields);
                    }
                }
            });
            return deferred.promise;
        }        //Function that call on each next button //

        $scope.max = 4;
        $scope.selectedval = '';
        $scope.selectedaccess = '';
        
        $scope.nextTab = function () {
            //Reset validation variables
            $scope.resetValidationVariables();
            var index = ($scope.selectedIndex == $scope.max) ? 0 : $scope.selectedIndex + 1;
            $scope.selectedIndex = index;
            if (index == '0')
            {
                $state.go('request.beneficiary');
            } 
            else if (index == '1') {
                $scope.tabLocked.secondLocked = false;
                $state.go('request.access');
                setTimeout(function () {
                    var user_val = $('.requestOthersDiv').find('input').val();
                    $('.name-selection').html(user_val);
                });
            } 
            else if (index == '2') {
                $scope.tabLocked.thirdLocked = false;
                $state.go('request.optapplications');
            } 
            else if (index == '3')
            {
                $scope.tabLocked.fourthLocked = false;
                $state.go('request.optfunctions');
            } else if (index == '4') {
                $scope.tabLocked.fifthLocked = false;
                $state.go('request.summary');
            }
        };
        //Watch on form.application
        $scope.$watch('frmData.application', function (current, old) {
            if (current !== old) {
                $scope.tabLocked.fourthLocked = true;
                $scope.tabLocked.fifthLocked = true;
                setTimeout(function () {
                    var tabItem = document.getElementsByTagName('md-tab-item');
                    for (var i = 2; i < tabItem.length; i++) {
                        document.getElementsByTagName('md-tab-item') [i].classList.remove('md-visited');
                    }
                }, 2000);
                $scope.showNoChange = false;
                $scope.enterInside = true;
                $scope.vm.model = {
                };
                $scope.vm.fields = {
                };
                //StorageService.removeData('vm.fields', STORAGE_TYPES.local, "");
                localStorage.removeItem('treedropdownModel');
            }
        })        
        //Set the maxlength for justification textarea in scope                        
        $scope.justificationLimit = LIMITS.JUSTIFICATION_MAXLENGTH;
        $scope.precannedJustificationLimit = LIMITS.PRECANNED_JUSTIFICATION_MAXLENGTH;
        //Watch added on vm.model.justification and customPrecannedJustification to truncate the fields value if its exceed the length
        $scope.$watchGroup(['customPrecannedJustification',
        'vm.model.justification'], function (current, old) {
            //Limit set for the precanned pop-up justifiaction
            if (angular.isDefined(current[0]) && current[0].length > $scope.precannedJustificationLimit) {
                $scope.customPrecannedJustification = current[0].substring(0, $scope.precannedJustificationLimit);
            }            
            //Limit set for form justifiaction

            if (angular.isDefined(current[1]) && current[1].length > $scope.justificationLimit) {
                $scope.vm.model.justification = current[1].substring(0, $scope.justificationLimit);
            }
        })        
        //Set the Prerequisite & description to false  //
        $scope.selectedApplication = '';
        $scope.replaceContent = {
            searchApp: false,
            preRequisites: false
        }
        $scope.accessDisabled = true;
        //Its called when the user change the application on access step                        
        $scope.changeapplication = function () {
            $scope.showDescription = false;
            $timeout(function () {
                $scope.showDescription = true;
            }, 500)            //Change the type or typeLabel 
            //if (!$scope.frmData.accessType && $filter('filter')($scope.requestableName[$scope.frmData.accessKey], $scope.frmData.accessKey, true).length) {
            if (!$scope.frmData.accessType || $filter('filter') ($scope.requestableName[$scope.frmData.accessKey], $scope.frmData.accessKey, true).length) {
                $scope.frmData.accessType = $filter('filter') ($scope.requestableName[$scope.frmData.accessKey], $scope.frmData.accessKey, true) [0].attributes.type;
            }
            $scope.showNoChange = false;
            $scope.enterInside = true;
            $scope.vm.model = {
            };
            $scope.selectedObj = angular.fromJson($scope.frmData.selectedapplication);
            //console.log('$scope.selectedObj',$scope.selectedObj);
            $scope.frmData.application = $scope.selectedObj.endpoint;
            $scope.selectedApplicationDisplay = $scope.selectedObj.name;
            if ($scope.selectedObj.markInprogress) {
                $scope.accessDisabled = true;
                $scope.replaceContent.requestLocked = true;
            } else {
                $scope.accessDisabled = false;
                $scope.replaceContent.requestLocked = false;
            }
            if ($scope.selectedObj.markViolation) {
                $scope.replaceContent.requestViolation = true;
            } else {
                $scope.replaceContent.requestViolation = false;
            }
            $scope.replaceContent.searchApp = false;
            $scope.accessTypeDescription = $scope.selectedObj.attributes.description;
            if (angular.isDefined($scope.selectedObj.prerequisite) && !angular.equals($scope.selectedObj.prerequisite, '')) {
                $scope.replaceContent.preRequisites = true;
            } else {
                $scope.replaceContent.preRequisites = false;
            }            //$rootScope.requiredCheck = false;

            StorageService.removeData('vm.fields', STORAGE_TYPES.local, '');
            /*Load the CORE Questions*/
            if (angular.equals($scope.frmData.application, 'CORE')) {
                $scope.addParams = {
                    application: $scope.frmData.application,
                    userId: $scope.frmData.beneficiary,
                    unauth: $scope.selectedObj.unauth
                };
                $scope.loadCoreQuestions().then(function (res) {
                },                // error
                function (response) {
                }
                );
            }
        };
        
        //Jump to the Form step after searching the application //
        $scope.jumpToApplication = function (accessResult) {
            //console.log('accessResult',accessResult);
            //$scope.replaceContent.searchedRequestLocked = false;
            //Reset validation variables
            $scope.resetValidationVariables();
            $scope.frmData.application = accessResult.endpoint;
            $scope.selectedObj = angular.fromJson(accessResult);
            $scope.frmData.accessType = accessResult.attributes.type;
            if (angular.isDefined(accessResult.attributes.typeLabel)) {
                $scope.frmData.accessKey = accessResult.attributes.typeLabel;
            } else {
                $scope.frmData.accessKey = accessResult.attributes.type;
            }
            $scope.selectedApplicationDisplay = accessResult.name;
            StorageService.removeData('vm.fields', STORAGE_TYPES.local, '');
            if (angular.isDefined(accessResult.markInprogress) && Boolean(accessResult.markInprogress) === true) {
                $scope.replaceContent.searchedRequestLocked = true;
                return;
            }
            $scope.selectedIndex = 2;
            $scope.vm.model = {
            };
            $scope.tabLocked = {
                firstLocked: false,
                secondLocked: false,
                thirdLocked: false,
                fourthLocked: true,
                fifthLocked: true
            };
        }        //Search the Application and Functional Role                 

        $scope.searchCategory = function () {
            var searchRequestableName = document.getElementById('searchAccess').value;
            if (searchRequestableName) {
                //$scope.replaceContent.preRequisites = false;
                $scope.showDescription = false;
                $scope.replaceContent.searchedRequestLocked = false;
                $scope.replaceContent.searchApp = true;
                $scope.searchedAccess = searchRequestableName;
                //var searchHow = 'Starts With';
                var searchHow = 'Contains';
                $scope.accessSearchResult = [
                ];
                angular.forEach($scope.requestableName, function (element, key) {
                    angular.forEach(element, function (childelement, key) {
                        var searchedValue = angular.highlighText(childelement.attributes.label.toString(), $scope.searchedAccess, searchHow, false);
                        if (searchedValue.indexOf('highlighted') > - 1) {
                            //tooltip conditions to add description after search of application
                            if (angular.isDefined(childelement.attributes.description.paragraph)) {
                                childelement.new_description = childelement.attributes.description.paragraph[0] || childelement.attributes.description.paragraph || '---';
                            } else {
                                if (angular.isArray(childelement.attributes.description.points)) {
                                    childelement.new_description = childelement.attributes.description.points[0] || '---';
                                } else {
                                    childelement.new_description = childelement.attributes.description.points || '---';
                                }
                            }
                            if (childelement.new_description.length > ACCESS_DISPLAY_CHAR.TEXT_CHARS) {
                                childelement.new_description = childelement.new_description.substr(0, ACCESS_DISPLAY_CHAR.TEXT_CHARS);
                            }                            //tooltip conditions to add prerequisite after search of application

                            if (angular.isDefined(childelement.prerequisite.paragraph)) {
                                childelement.new_prerequisite = childelement.prerequisite.paragraph[0] || childelement.prerequisite.paragraph || '---';
                            } else {
                                if (angular.isArray(childelement.prerequisite.points)) {
                                    childelement.new_prerequisite = childelement.prerequisite.points[0] || '---';
                                } else {
                                    childelement.new_prerequisite = childelement.prerequisite.points || '---';
                                }
                            }
                            if (childelement.new_prerequisite.length && childelement.new_prerequisite.length > ACCESS_DISPLAY_CHAR.TEXT_CHARS) {
                                childelement.new_prerequisite = childelement.new_prerequisite.substr(0, ACCESS_DISPLAY_CHAR.TEXT_CHARS);
                            }
                            $scope.accessSearchResult.push(childelement);
                        }
                    })
                })
            } else {
                $scope.replaceContent.searchApp = false;
            }
        };
        
        //Clear the Access serach in Access Page
        $scope.clearAccessSearch = function () {
            document.getElementById('searchAccess').value = '';
            $scope.replaceContent.searchApp = false;
            $scope.showDescription = true;
        }        //Show all Unauthorized Access after checking checkbox in access step 

        $scope.showUnauthorizedChecked = false;
        $scope.loadUnauthorizedAccess = function () {
            if (this.showUnauthAccess) {
                $scope.accesscategory(this.showUnauthAccess);
                $scope.showUnauthorizedChecked = true;
                if (angular.isDefined($scope.selectedObj)) {
                    $scope.selectedObj.markstar = false;
                }
            } else {
                $scope.accesscategory();
                $scope.showUnauthorizedChecked = false;
                if (angular.isDefined($scope.selectedObj)) {
                    $scope.selectedObj.markstar = true;
                }
                if (angular.isUndefinedOrNull($scope.frmData.selectedapplication)) {
                    if (angular.isDefined($scope.selectedObj)) {
                        $scope.selectedObj.markstar = false;
                    }
                }
            }
            if (angular.isUndefinedOrNull($scope.frmData.selectedapplication)) {
                $scope.accessDisabled = true;
                $scope.replaceContent.preRequisites = false;
            }
        }        
        
        //Reset the access step fields                        

        $scope.loadrequestableName = false;
        $scope.resetAccessContent = function () {
            /* New Demo Code */
            $scope.dataAccess = [
                {
                    department: null,
                    subDepartment: null,
                    region: null
                }
            ];
            $scope.frmData.role = ''            /* New Demo Code End*/
            /*Reset the access step*/
            $scope.replaceContent.preRequisites = false;
            $scope.accessTypeDescription = '';
            $scope.frmData.selectedapplication = undefined;
            $scope.accessDisabled = true;
            //$scope.frmData.application = undefined;
            $scope.replaceContent.searchApp = false;
            $scope.replaceContent.requestLocked = false;
            /*Reset the access done*/
        }        // Process requestable Response //

        $scope.processRequestable = function (requestableData, showUnauthAccess) {
            var accessType = {
            };
            angular.forEach(requestableData.children, function (value, key) {
                var filterobj = {
                };
                if (angular.isDefined(value.attributes.typeLabel)) {
                    filterobj[value.attributes.typeLabel] = '';
                } else {
                    filterobj[value.attributes.type] = '';
                }
                if (!$filter('filter') (requestableData.children, filterobj, true).length) {
                    if (angular.isDefined(value.attributes.typeLabel)) {
                        accessType[value.attributes.typeLabel] = [
                        ];
                    } else {
                        accessType[value.attributes.type] = [
                        ];
                    }
                }
            });
            accessType = angular.sortObjectByKey(accessType);
            //Create array of baneficiary request to mark requestable inprocess.
            var beneficiaryRequests = [
            ];
            if (localStorage.getItem('inboxBulk') != null) {
                var allRequests = angular.fromJson(localStorage.getItem('inboxBulk'));
                //console.log('allRequests',allRequests);
                var searchObj = {
                    'beneficiaryId': $scope.frmData.beneficiary.toUpperCase()
                };
                //console.log('searchObj',searchObj);
                if ($filter('filter') (allRequests, searchObj, true).length) {
                    beneficiaryRequests = $filter('filter') (allRequests, searchObj, true) [0].subRequests;
                }
            }            //Get the brifcase localstorage to mark inprocess

            var brifcaseList = [
            ];
            if (localStorage.getItem('brifcase.post') != null) {
                var brifcaseList = angular.fromJson(localStorage.getItem('brifcase.list'));
            }
            angular.forEach(requestableData.children, function (value, key) {
                var markstar = false;
                var markRevised = false;
                var markInprogress = false;
                var markViolation = false;
                var markDeny = false;
                var additionalInfo = '';
                if (angular.isDefined(value.attributes.policyRole)) {
                    if (!angular.equals(value.attributes.policyRole, '') && angular.isArray(value.attributes.policyRole)) {
                        //markstar = !angular.equals($scope.policyCode, value.attributes.policyRole) ? true : false;
                        markstar = (value.attributes.policyRole.indexOf($scope.policyCode) !== - 1) ? false : true;
                    }
                }
                var searchObj = {
                    'target_name-value': value.name
                };
                angular.keySort($scope.userRequestModeAccount, 'provisionedOn', true);
                //Check the access status from the user's account details                               
                if ($filter('filter') ($scope.userRequestModeAccount, searchObj, true).length) {
                    var filterAccount = ($filter('filter') ($scope.userRequestModeAccount, searchObj, true) [0]);
                    if (filterAccount.status.toLowerCase() == REQUEST_STATUS.PROVISIONED) {
                        markRevised = true;
                        //filterAccount.isAuthorized = "VIOLATION"; // HARDCODING to be removed
                        /* Movers logic */
                        if (!angular.isUndefined(filterAccount.isAuthorized)) {
                            if (filterAccount.isAuthorized == null) {
                                // skip
                            } else if (filterAccount.isAuthorized.toLowerCase() == 'violation') {
                                markViolation = true;
                            } else if (filterAccount.isAuthorized.toLowerCase() == 'deny') {
                                markDeny = true;
                            }
                        }                        /* Movers logic */

                    }
                }                //Check the requestable in the briefcase

                brifcaseList.some(function (request) {
                    if (angular.equals(request.target, value.name) && angular.equals(request.owner.toLowerCase(), $scope.frmData.beneficiary.toLowerCase())) {
                        markInprogress = true;
                        additionalInfo = {
                            requestId: request.uniqueRequestId,
                            requestorName: $scope.beneficiaryDisplay,
                            requestStatus: 'In Briefcase'
                        }
                        return true;
                    }
                })
                if (!markInprogress) {
                    if (angular.isDefined(value.attributes.isLocked)) {
                        if (!angular.equals(value.attributes.isLocked, '')) {
                            markInprogress = angular.equals(value.attributes.isLocked, 'yes') ? true : false;
                        }
                    }
                }                //Create the final object to store in array

                var pushData = {
                    endpoint: value.name,
                    name: value.attributes.label,
                    //prerequisite: (angular.isDefined(value.attributes.preCondition) && value.attributes.preCondition != "" && value.attributes.preCondition.length) ? value.attributes.preCondition : '',
                    prerequisite: angular.isDefined(value.attributes.preCondition) ? value.attributes.preCondition : '',
                    //markstar: angular.isUndefined(showUnauthAccess) ? false : markstar,
                    markstar: markstar,
                    markViolation: markViolation,
                    markDeny: markDeny,
                    attributes: value.attributes,
                    markRevised: markRevised,
                    markInprogress: markInprogress,
                    additionalInfo: additionalInfo
                };
                if (angular.isDefined(value.attributes.typeLabel)) {
                    accessType[value.attributes.typeLabel].push(pushData);
                } else {
                    accessType[value.attributes.type].push(pushData);
                }
            });
            // Mark Lock on the dependent postConditionRevoke
            angular.forEach(accessType, function (value, key) {
                angular.forEach(value, function (appValue, key) {
                    if (angular.isDefined(appValue.attributes) && appValue.markInprogress) {
                        var revokedLock = $scope.postConditionRevokeLock(appValue.attributes, requestableData);
                        //if (angular.isDefined(revokedLock) && Object.keys(revokedLock).length > 0) {
                        angular.forEach(revokedLock, function (revokeValue, revokeKey) {
                            angular.forEach(accessType, function (accessValue, accessKey) {
                                angular.forEach(accessValue, function (nextAppValue, nextAppkey) {
                                    if (angular.equals(nextAppValue.endpoint, revokeKey)) {
                                        nextAppValue.markInprogress = true;
                                    }
                                })
                            })
                        })                        //}
                    }
                })
            })            //filter the access
            var accessTypeFiltered = {
            };
            angular.forEach(accessType, function (value, key) {
                angular.forEach(value, function (pushVal, pushKey) {
                    if (angular.isUndefined(accessTypeFiltered[key])) {
                        accessTypeFiltered[key] = [
                        ];
                    }
                    if (!pushVal.markstar) {
                        accessTypeFiltered[key].push(pushVal);
                    } else if (showUnauthAccess) {
                        accessTypeFiltered[key].push(pushVal);
                    }
                })
            })
            $scope.requestableName = {
            };
            angular.forEach(accessTypeFiltered, function (value, key) {
                if (value.length) {
                    $scope.requestableName[key] = angular.sortByKey(value, 'name');
                }
            })
            $scope.requestablePromise = true;
        }        // Check dependent app in the postConditionRevoke

        $scope.postConditionRevokeLock = function (attributes, requestableData) {
            if (angular.isDefined(attributes) && angular.isDefined(attributes.postConditionRevoke)) {
                var postConditionRevoke = attributes.postConditionRevoke;
                var objRevoked = {
                };
                angular.forEach(requestableData.children, function (revokeValue, revokekey) {
                    if (postConditionRevoke.indexOf(revokeValue.name) != - 1) {
                        objRevoked[revokeValue.name] = true;
                    }
                })
                return objRevoked;
            }
        }        //AccessType validation //

        $scope.requestableName = {
        };
        $scope.accesscategory = function (showUnauthAccess) {
            $scope.isLoadingRequestables = true;
            var deferred = $q.defer();
            /* API call for RequestableName */
            var requestableStorage = StorageService.getData('requestableStorage', STORAGE_TYPES.local, '');
            if (requestableStorage && angular.isUndefined(showUnauthAccess)) {
                var requestableData = angular.fromJson(requestableStorage);
                requestableData = angular.fromJson(requestableData.data);
                $scope.processRequestable(requestableData, showUnauthAccess);
                $scope.isLoadingRequestables = false;
            } else {
                var objRequestables = {
                    'subjectName': $scope.frmData.beneficiary,
                    'attributeName': 'snp.refData.requestables.data',
                    'environmentVariables': {
                        //                                        "returnAll": "Y", //only if you want all returned.
                        'requestedAccess': {
                        }
                    }
                };
                var requestablePromise = RefRestangular.all('').post(objRequestables);
                requestablePromise.then(function (res) {
                    //$timeout(function(){
                    $scope.isLoadingRequestables = false;
                    deferred.resolve(res);
                    var requestableData = res.data.plain();
                    //console.log('From API',requestableData);
                    StorageService.putData('requestableStorage', requestableData, STORAGE_TYPES.local);
                    $scope.processRequestable(requestableData, showUnauthAccess);
                    //},5000);
                }, function (response) {
                    console.log('Error with status code', response.status);
                }
                );
            }
            if (!angular.isUndefinedOrNull($scope.frmData.accessType) && !angular.isUndefinedOrNull($scope.requestableName)) {
                angular.element(document.getElementById('workrole')).removeClass('hide');
            }
        };
        
        //Watch the requestableName and mark as unauthorized
        $scope.$watch('requestableName', function (currentRequestableName, oldRequestableName) {
            var oldObject = {
            };
            if (currentRequestableName !== oldRequestableName && $scope.showUnauthorizedChecked) {
                angular.forEach($scope.requestableName, function (requestableElement, requestableKey) {
                    if (!angular.equals(oldObject, {
                    })) {
                        oldRequestableName = oldObject;
                    }
                    if (!angular.isUndefinedOrNull(oldRequestableName)) {
                        var extraElement = angular.compareTwoObjects(currentRequestableName[requestableKey], oldRequestableName[requestableKey], 'endpoint');
                        if (extraElement.length) {
                            oldObject = angular.copy(oldRequestableName);
                        }
                        angular.forEach(extraElement, function (element) {
                            element.unauth = true;
                        })
                    }
                })
            }
        }, true)        //Justification validation
        $scope.validateJustification = function (item) {
            if (angular.isDefined(item) && document.getElementById('nextBtn')) {
                angular.element(document.getElementById('nextBtn')) [0].disabled = false;
            } else {
                angular.element(document.getElementById('nextBtn')) [0].disabled = true;
            }
        }        //Beneficiary custom checkbox SELF  

        $scope.requestSelf = function (event) {
            StorageService.removeData('requestableStorage', STORAGE_TYPES.local, '');
            if (angular.element(document.getElementById('requestSelf')).hasClass('requestActive')) {
                return;
            }            //Reset previously selected reportee's data

            var reloadBeneficiary = false;
            $scope.reloadState(reloadBeneficiary);
            $scope.resetAccessContent();
            $scope.profile = undefined;
            $scope.requestType.self = true;
            $scope.requestType.others = false;
            //                                    angular.element(document.getElementById('nextBtn'))[0].disabled = false;
            angular.element(document.getElementById('requestSelf')).addClass('requestActive');
            angular.element(document.getElementById('requestOthers')).removeClass('requestActive');
            //$scope.profile = undefined;
            $scope.getUserDetails($scope.loggedUser.userId).then(function (res) {
                $scope.profile = angular.fromJson(res.data.plain());
            },            // error
            function (response) {
            }
            );
        }        //Beneficiary custom checkbox OTHERS                                 

        $scope.requestOthers = function (event) {
            StorageService.removeData('requestableStorage', STORAGE_TYPES.local, '');
            if (angular.element(document.getElementById('requestOthers')).hasClass('requestActive')) {
                return;
            }            //Reset previously selected reportee's data

            var reloadBeneficiary = false;
            $scope.reloadState(reloadBeneficiary);
            $scope.resetAccessContent();
            $scope.profile = undefined;
            $scope.beneficiaryDisplay = undefined;
            //                                    angular.element(document.getElementById('nextBtn'))[0].disabled = true;
            $scope.requestType.self = false;
            if (angular.element(document.getElementById('requestSelf')).hasClass('requestActive')) {
                $scope.requestType.others = true;
                angular.element(document.getElementById('requestSelf')).removeClass('requestActive');
                //angular.element(document.getElementById('requestSelf')).addClass("hideBtn");
                angular.element(document.getElementById('requestOthers')).addClass('requestActive');
                $('.requestOthersDiv').fadeIn();
            } else {
                $scope.getUserDetails($scope.loggedUser.userId).then(function (res) {
                    $scope.profile = angular.fromJson(res.data.plain());
                },                // error
                function (response) {
                }
                );
                //                                                angular.element(document.getElementById('nextBtn'))[0].disabled = false;
                $scope.requestType.others = false;
                angular.element(document.getElementById('requestOthers')).removeClass('requestActive');
                angular.element(document.getElementById('requestSelf')).addClass('requestActive');
                //angular.element(document.getElementById('requestSelf')).removeClass("hideBtn");
                $('.requestOthersDiv').fadeIn();
            }
        }        //Function returns the title having Access details

        function getRequestTitle() {
            return newRequestService.getRequestMode($scope.modeRequestId, $scope.accessViolation, $scope.frmData.accessType, $scope.selectedApplicationDisplay);
        }        // Resize window height on viewport change

        function resizePage() {
            var page_height = $(window).height() - SCROLLBAR_DIV_HEIGHT.OFFSET_INNER_PAGES;
            //console.log('page_height',page_height);
            $('md-tab-content').height(page_height);
            $('.request-wrap').height(page_height);
        }
        $(window).resize(resizePage);
        /*setTimeout(function(){
                                 //$(window).trigger('resize');
                                 resizePage();
                                 },100);*/
        
        
        
        
        //Get Scrollbar config
        $scope.scrollConfig = angular.scrollbarConfig(SCROLLBAR_DIV_HEIGHT.OFFSET_INNER_PAGES);
        $scope.profile = undefined;
        
        
        
        /****** Ajax Smart table ****************/
        //Its get called when user select the reporte from the searched list                        
        $scope.selectReportess = function (reporteesDetails) {
            //Reset previously selected reportee's data
            var reloadBeneficiary = false;
            $scope.reloadState(reloadBeneficiary);
            //$scope.startOver();
            $scope.resetAccessContent();
            $scope.showUnauthorizedChecked = false;
            //angular.element(document.getElementById('nextBtn'))[0].disabled = true;
            StorageService.removeData('requestableStorage', STORAGE_TYPES.local, '');
            $scope.profile = null;
            angular.forEach($scope.reportees, function (reporteeElement) {
                if (reporteeElement.selected) {
                    reporteeElement.selected = false;
                }
            });
            $scope.frmData.beneficiary = reporteesDetails.id;
            $scope.beneficiaryDisplay = reporteesDetails.cn;
            $scope.selectedItem = reporteesDetails.cn;
            reporteesDetails.selected = true;
            $scope.openDropdown = false;
            $scope.profileLoading = true;
            $scope.getUserDetails($scope.frmData.beneficiary).then(function (res) {
                if (res.status == 404) {
                    //angular.element(document.getElementById('nextBtn'))[0].disabled = true;
                } else {
                    $scope.profile = angular.fromJson(res.data.plain());
                    $scope.userDetails = angular.copy($scope.profile);
                    if ($scope.reportees != null) {
                        //angular.element(document.getElementById('nextBtn'))[0].disabled = false;
                    }
                }
            }).finally (function () {
                if (angular.isDefined($scope.profile.displayName)) {
                    $scope.disableNext = false;
                    //$scope.resetfrm();
                }                //set the policy details

                $scope.setPolicy().then(function (resPolicyDetails) {
                    $scope.policyCode = resPolicyDetails.policyCode;
                    $scope.policyName = resPolicyDetails.policyName;
                },                // error
                function (response) {
                }
                );
            });
            $scope.profileLoading = false;
        };
        
        
        //Change the css class for the Reportess dropdown
        $scope.openDropdown = false;
        $scope.getDropdownIconClass = function () {
            this.search = '';
            if (!$scope.openDropdown) {
                $scope.openDropdown = true;
                $scope.reportees = null;
                return 'arrow-down';
            }
            $scope.openDropdown = false;
            $scope.reportees = null;
            return 'arrow-up';
        };
        //Its get called when user tiggers the blur event outside the dropdown
        function closeWhenClickingElsewhere(event, callbackFn, parentClass) {
            var element = event.target;
            if (!element)
            return;
            var clickedOnPopup = false;
            // Check up to 10 levels up the DOM tree
            for (var i = 0; i < 20 && element && !clickedOnPopup; i++) {
                var elementClasses = element.classList;
                if (elementClasses !== undefined && elementClasses.contains(parentClass)) {
                    clickedOnPopup = true;
                    break;
                } 
                else {
                    element = element.parentElement;
                }
            }
            if (!clickedOnPopup) {
                callbackFn();
            }
        }        // Close all instances when user clicks elsewhere

        $window.onclick = function (event) {
            closeWhenClickingElsewhere(event, function () {
                $scope.openDropdown = false;
                $scope.reportees = null;
                this.search = '';
                $scope.$apply();
            }, 'landingbox1');
        };
        $scope.paginationPageSizes = [
            10,
            20,
            50,
            100
        ];
        $scope.itemsByPage = 200; //20
        $scope.reportees = [
        ];
        //Server side pagination //
        //$scope.reporteesList = [];
        $scope.disableNext = false;
        var abortGet;
        //Loads the reportees from the server based on the searched criteria                        
        $scope.getReportees = function (tableState) {
            /*var number = 20;
                                     var start = 1;
                                     var objReportees = {
                                     "id": "reportees",
                                     "startIndex": start,
                                     "count": number,
                                     "searchParameters": {"userid": $scope.loggedUser.userId}
                                     }
                                     var resultPromise = Restangular.all("users/.search").post(objReportees);*/
            var pagination = tableState.pagination;
            var start = pagination.start || 1; // This is NOT the page number, but the index of item in the list that you want to use to display the table.
            var number = pagination.number || false; // Number of entries showed per page. if pagination.number not found set false .
            var searchText = tableState.search.predicateObject ? tableState.search.predicateObject.displayName : '';
            if (searchText && searchText.length) {
                $scope.selectedRow = 0;
                $scope.reportees = null;
            }            //console.log('searchText',searchText);

            if (number && searchText && searchText.length > 2) {
                $scope.isLoading = true;
                $scope.profileLoading = true;
                $scope.disableNext = true;
                number = 20;
                var objReportees = {
                    'id': 'userAccessSearch',
                    'startIndex': start,
                    'count': PAGINATION_COUNT.DEFAULT, //number
                    'searchParameters': {
                        'name': searchText
                    }
                };
                var addlHeaders = {
                    'Content-Type': 'application/json',
                    'mhcSegment': 'MCGRAW-HILL CORPORATE',
                    'mhcGroup': '',
                    'mhcRatingAttributeARPProfile': 'DSC',
                    'X-Midas-Service-Name': 'default-ldap',
                    'OAM_REMOTE_USER': $scope.loggedUser.userId
                };
                // Aborting any previous unresolved request and proceed
                if (abortGet) {
                    abortGet.resolve();
                }
                abortGet = $q.defer();
                var resultPromise = Restangular.all('users/.search').withHttpConfig({
                    timeout: abortGet.promise
                }).post(objReportees, {
                }, addlHeaders); // ?midas-service=default-ldap
                resultPromise.then(function (result) {
                    //console.log('success',result);
                    if (result.error) {
                        if (result.error.status == 404) {
                            $scope.reportees = null;
                            $scope.error = 'No Records';
                        } else {
                            $scope.reportees = null;
                        }
                    } else if (result.data) {
                        //$scope.reportees = result.data.plain();
                        var reportees = result.data.plain();
                        $scope.reportees = (reportees.length) ? reportees : false;
                        if (!$scope.reportees) {
                            $scope.profileLoading = false;
                        }
                    }
                }, function (error) {
                    //console.log('error',error);
                }
                ).finally (function () {
                    $scope.isLoading = false;
                    if (angular.isDefined($scope.profile.displayName)) {
                        $scope.disableNext = false;
                    }
                    $scope.profileLoading = false;
                });
            } else {
                $scope.reportees = null;
                searchText = '';
            }
        }
        
        //$scope.getReportees();
        /****** Ajax smart table ends ************/
        // Collapsible Beneficiary Profile

        $scope.collapsedProfile = true;
        //Toggle the user details box in Beneficiary step
        $scope.toggleBox = function () {
            $scope.collapsedProfile = !$scope.collapsedProfile;
        };
        // Start raising a new request in Update access mode (and if briefcase is empty)
        $scope.reloadNewRequest = function () {
            //console.log('Update access mode');
            sessionStorage['clearUserAccessDetails'] = true;
            $state.go('request.beneficiary', {
            }, {
                reload: true
            });
        };
    });
});
