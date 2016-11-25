define(['app','angularAMD'], function(app, InboxModule){	
    
	InboxModule.service('InboxService', function($http,$q){
        var service = {};
        service.getInboxRequests= getInboxRequests;
        
        function getInboxRequests(){
            var deferred = $q.defer();
            $http.get('config/InboxRequests.json').success(function(data){
                deferred.resolve(data);
            })
            .error(function(data){
                deferred.reject(data);
            })
            
            return deferred.promise;
        }
        
        return service;
    });
	
	// Service for handling small tasks in Inbox list view
	InboxModule.service('InboxListService', function($http,$q,$filter){
        var service = {};
        
        service.toggleExpand = function (obj,inbox) {
        	for (var i = 0; i < inbox.length; i++) {
                if (inbox[i].isExpanded !== undefined && inbox[i].isExpanded && inbox[i] !== obj) {
                    inbox[i].isExpanded = false;
                    angular.element(document.getElementById('expand-div-' + inbox[i].id)).removeClass("expanded");
                }
            }

            if (obj.isExpanded) {
                obj.isExpanded = false;
                angular.element(document.getElementById('expand-div-' + obj.id)).removeClass("expanded");
            } else {
                obj.isExpanded = true;
                angular.element(document.getElementById('expand-div-' + obj.id)).addClass("expanded");
            }
        };
        
        service.searchfilterby = function (searchFilter,inboxData) {
        	var inboxfiltered = [];
            var filterObjects = $filter('filter')(inboxData, {type: searchFilter});
            angular.forEach(filterObjects, function (value, key) {
            	inboxfiltered.push(value);
            });
            return inboxfiltered;
        };
        
        service.searchstatusby = function (searchStatus,inboxData) {
        	var beneficiariesfiltered = [];
            inboxData.forEach(function (beneficiaryData) {
            	//beneficiaryData.subRequests.forEach(function (subRequest) {
            		var filterObjects = $filter('filter')(beneficiaryData.subRequests, {displayStatus: searchStatus});
                	if (filterObjects.length) {
                		var beneficiaryInfo = beneficiaryData;
                		beneficiaryInfo.subRequests = filterObjects;
                		//console.log('beneficiaryInfo',beneficiaryInfo);
                		beneficiariesfiltered.push(beneficiaryInfo);
                	}
            	//});
        	});
            //console.log('beneficiariesfiltered',beneficiariesfiltered);
        	return beneficiariesfiltered;
        };
        
        return service;
    });
	
	// Service for fetching & formatting Inbox requests/tasks
	InboxModule.service('InboxRequestsService', function($q,$filter,Restangular,RefRestangular,AllReferenceDataService,ARPService,_currentUser,REQUEST_STATUS,PAGINATION_COUNT,INCLUDE,RequestDetailsService,NOMINATION){
        var service = {};
        var self = this;
		var _currentUser = _currentUser;
		
		service.inboxData = {};
        //var deferred = $q.defer();
        
		// Set below as false to skip corresponding API calls
		var showBulkRequests = true;
        var showTaskRequests = true;
        var showRequestsForMeNotByMe = true;
        
        // Format Task requests fetched from API for displaying in view
        self.formatTaskResponse = function (tasksResponse,$scope) {
			var tasksData = {
					"data": [],
					"unreadCount": 0
				};
			var beneficiaries = {};
			//var summary = {};
			var index = 0;
			var requestableName = $scope.requestableName;
			
			angular.forEach(tasksResponse, function(task){
				if (task.processDetails.requestDetails && task.processDetails.requestDetails.requestedOperations) {
					var requestedOperations = task.processDetails.requestDetails.requestedOperations[0];
					var beneficiary = requestedOperations.owner.display;
					var beneficiaryId = requestedOperations.owner.value;
					var requestName = requestedOperations.target;
					var requestDisplayName = (requestableName[requestName] && requestableName[requestName].requestDisplayName)?requestableName[requestName].requestDisplayName:'---';
					var requestResourceType = (requestableName[requestName] && requestableName[requestName].resourceType)?requestableName[requestName].resourceType:'---';
				} else {
					var beneficiary = 'No Beneficiary';
					var beneficiaryId = '';
					var requestName = '---';
					var requestDisplayName = '---';
					var requestResourceType = '---';
				}
				
				if (angular.isUndefined(beneficiaries[beneficiary])) {
					beneficiaries[beneficiary] = {
						"isQuestioned": false,
			            "beneficiary": beneficiary,
			            "beneficiaryId": beneficiaryId,
			            "type": "task",
			            "id": index,
			            "desc": "---",
			            "status": REQUEST_STATUS.PENDING,
			            "completeStatusCount": 0,
			            "subRequestsCount": 0,
			            "subRequests": []
					};
					//summary[beneficiary] = [];
					beneficiaries[beneficiary].desc = '';
					index++;
				}
				
				// Check signed in User is approver
				var approver = task.identityLink[0];
				var isRequestAsTask = false;
				var isRequestAsCompleteTask = false;
				var isRequestForNomination = false;
				if(task.status.toUpperCase() == REQUEST_STATUS.ASSIGNED.toUpperCase()) {
					
                    // Do Not show quick action buttons for LAM approver
                    if(NOMINATION.APPROVER_STAGES.indexOf(task.processDetails.stage)!=-1){
                        isRequestAsTask = false;
                        isRequestAsCompleteTask = false;
                        isRequestForNomination = true;
                    }else{
                        
                        /* Logic to display Approve/Reject/Complete actions */
                        angular.forEach(task.operations, function(taskOperation,opindex){
                            if(INCLUDE.REQUEST_ACTIONS.indexOf(taskOperation.toLowerCase()) !== -1){
                                
                                if(taskOperation.toLowerCase()=='claim'){
                                    
                                    if(INCLUDE.COMPLETE_ACTION_STAGES.indexOf(task.processDetails.stage.toLowerCase()) !== -1){
                                        isRequestAsCompleteTask = true;
                                    }else{
                                        isRequestAsTask = true;
                                    }
                                    
                                }else if(taskOperation.toLowerCase()=='approve'){
                                    isRequestAsTask = true;
                                }else if(taskOperation.toLowerCase()=='complete'){
                                    isRequestAsCompleteTask = true;
                                }
                            }
                        });
                    }
				}
				
				// Sub-request status
				var requestMethod = (requestedOperations && requestedOperations.method) ? requestedOperations.method : "";
                var displayStatus = RequestDetailsService.getAccessStatusText(task.status, requestMethod);
				
				var subRequest = {
	                    "name": "Access to " + requestDisplayName,
	                    "id": task.processDetails.requestId,
	                    "taskId": task.id,
	                    "description": task.processDetails.requestDetails.details.justification,
	                    "requestorName": task.processDetails.requestDetails.requestor.display,
	                    "owner": requestedOperations.owner.display,
	                    "requestorId": task.processDetails.requestDetails.requestor.value,
	                    "requestName": requestName,
	                    "type": requestResourceType,
	                    "assignedToType": task.identityLink[0].category.toLowerCase(),	//Added for distinguishing betn user & group
	                    "assignedTo": task.identityLink[0].display ? task.identityLink[0].display : task.identityLink[0].value,
                		"assignedStage": task.processDetails.stage ? task.processDetails.stage : "",
	                    "isReqQuestioned": (task.status==REQUEST_STATUS.QUESTIONED) ? true : false,
	                    "isRequestAsTask":isRequestAsTask,
	                    "isRequestAsCompleteTask":isRequestAsCompleteTask,
	                    "isRequestForNomination":isRequestForNomination,
	                    "status": task.status,
	                    "displayStatus": displayStatus,
	                    "dateRequested": task.processDetails.requestDetails.details.created,
	                    "dateAssigned": task.processDetails.assignedOn
	                };
				beneficiaries[beneficiary].subRequests.push(subRequest);
				//summary[beneficiary].push('Requested for ' + subRequest.type + ' (#' + subRequest.id + ')');
				beneficiaries[beneficiary].desc += 'Requested for ' + subRequest.type + ' (#' + subRequest.id + '), ';
				
				if (subRequest.status.toUpperCase() == REQUEST_STATUS.COMPLETED.toUpperCase()) {
					beneficiaries[beneficiary].completeStatusCount++;
				}
				beneficiaries[beneficiary].subRequestsCount++;
			});
			
			angular.forEach(beneficiaries, function(beneficiaryData, beneficiaryName){
				//beneficiaryData.desc = summary[beneficiaryName].join(', ');
				tasksData.data.push(beneficiaryData);
				tasksData.unreadCount += beneficiaryData.subRequestsCount;
			});
			return tasksData;
			
			//return beneficiaries;
		};
        
		// Format Bulk requests fetched from API for displaying in view
		self.formatBulkResponse = function (bulkResponse,$scope) {
			var bulkData = {
					"data": [],
					"unreadCount": 0
				};
        	var beneficiaries = {};
			//var summary = {};
			var index = 0;
			var requestableName = $scope.requestableName;
			
			angular.forEach(bulkResponse, function(bulk){
				if (bulk.Operations && bulk.Operations.length) {
					if (!bulk.Operations[0].target) {
						return;
					}
					var beneficiary = bulk.Operations[0].owner.display;
					var beneficiaryId = bulk.Operations[0].owner.value;
					var requestName = bulk.Operations[0].target;
					var requestDisplayName = (requestableName[requestName] && requestableName[requestName].requestDisplayName)?requestableName[requestName].requestDisplayName:'---';
				} else {
					var beneficiary = 'No Beneficiary';
					var beneficiaryId = '';
					var requestName = '---';
					var requestDisplayName = '---';
				}
				
				if (angular.isUndefined(beneficiaries[beneficiary])) {
					beneficiaries[beneficiary] = {
						"isQuestioned": false,
			            "beneficiary": beneficiary,
			            "beneficiaryId": beneficiaryId,
			            "type": "request",
			            "id": index,
			            "desc": "---",
			            "status": REQUEST_STATUS.PENDING,
			            "completeStatusCount": 0,
			            "subRequestsCount": 0,
			            "subRequests": []
					};
					//summary[beneficiary] = [];
					beneficiaries[beneficiary].desc = '';
					index++;
				}
				
				// Check signed in User is requestor OR beneficiary
                // # Only Signed In User as requestor can Cancel the request
				var isRequestAsView = false;
				if(bulk.status.toUpperCase() == REQUEST_STATUS.WAITING.toUpperCase() && 
						(bulk.requestor.value.toUpperCase()==_currentUser.userId.toUpperCase() 
						)){
					isRequestAsView = true;
				}
				
				// Sub-request status
				var requestMethod = (bulk.Operations[0] && bulk.Operations[0].method) ? bulk.Operations[0].method : "";
				var displayStatus = RequestDetailsService.getAccessStatusText(bulk.status, requestMethod);
				
				var subRequest = {
	                    "name": "Access to " + requestDisplayName,		// Display as per common pattern from function
	                    "id": bulk.id,
	                    "description": bulk.details.justification,
	                    "requestorName": bulk.requestor.display,
	                    "requestorId": bulk.requestor.value,
	                    "requestName": requestName,
	                    "type": (requestableName[requestName] && requestableName[requestName].resourceType) ? requestableName[requestName].resourceType : '---',
                		"isReqQuestioned": (bulk.status==REQUEST_STATUS.QUESTIONED) ? true : false,
	                    "isRequestAsView": isRequestAsView,
	                    "status": bulk.status,
	                    "displayStatus": displayStatus,
	                    "dateRequested": bulk.details.created
	                };
				
				if (bulk.assignedTo) {
					bulk.assignedTo.reverse();
					var assignedArr = bulk.assignedTo[bulk.assignedTo.length - 1];
					subRequest.assignedToType = assignedArr.category.toLowerCase();
					subRequest.assignedTo = assignedArr.display ? assignedArr.display : assignedArr.value;
					subRequest.assignedStage = assignedArr.stage ? assignedArr.stage : "";
					subRequest.dateAssigned = assignedArr.assignedOn;
				}
				
				beneficiaries[beneficiary].subRequests.push(subRequest);
				//summary[beneficiary].push('Requested for ' + subRequest.type + ' (#' + subRequest.id + ')');
				beneficiaries[beneficiary].desc += 'Requested for ' + subRequest.type + ' (#' + subRequest.id + '), ';
                
                if (INCLUDE.STATUS_PENDING.indexOf(bulk.status.toLowerCase()) === -1) {
					beneficiaries[beneficiary].completeStatusCount++;
				}
				
				if (ARPService.isTodaysDate(bulk.details.created) && 
						INCLUDE.STATUS_PENDING.indexOf(bulk.status.toLowerCase()) != -1) {
					beneficiaries[beneficiary].subRequestsCount++;
				}
			});
			
			/*angular.forEach(beneficiaries, function(beneficiaryData, beneficiaryName){
				beneficiaryData.desc = summary[beneficiaryName].join(', ');
				bulkData.push(beneficiaryData);
			});
			return bulkData;*/
			//return beneficiaries;
			
			angular.forEach(beneficiaries, function(beneficiaryData, beneficiaryName){
				beneficiaryData.desc = self.removeExtraCommas(beneficiaryData.desc);
        		if (beneficiaryData.completeStatusCount == beneficiaryData.subRequests.length) {
        			beneficiaryData.status = REQUEST_STATUS.COMPLETED;
        		}
        		bulkData.data.push(beneficiaryData);
        		bulkData.unreadCount += beneficiaryData.subRequestsCount;
			});
        	return bulkData;
        };
        
        // trim starting (, ...) & leading (..., ) commas from string
        self.removeExtraCommas = function (str) {
        	return str.replace(/(^\s*,)|(,\s*$)/g, '');
        };
        
        // Get Formatted Task requests (All/Searched) from API
        service.getTaskRequests = function ($scope) {
        	$scope.taskPromise = false;
        	$scope.taskRequests = {};
            //$scope.taskPromise = false;
        	$scope.proceedBulkLater = false;
            if ($scope.isSearch===true) {
            	// Tasks search
            	//console.log('Searching in tasks...');
            	var searchParameters = $scope.getSearchParameters('task');
    			var tasksResponse = [];
    			var allTaskResponse = angular.fromJson(localStorage.getItem("AllTaskRequests"));
    			
    			for (var i=0; i < allTaskResponse.length; i++) {
    				for (var j=0; j < searchParameters.length; j++) {
    					var searchKey = searchParameters[j];
	    	        	var searchVal = $scope.searchVal;
	    				var searchItem = eval("allTaskResponse[i]."+searchKey);
	    				//console.log('searchItem',searchItem);
	    				//console.log('searchVal',searchVal);
	    				if (searchItem && angular.containsInString(searchItem,searchVal,'any',false)===true) {
	    	        		tasksResponse.push(allTaskResponse[i]);
	    	        		break;
	    	        	}
    				}
				}
    			//console.log('tasksResponse',tasksResponse);
    			
    			if (tasksResponse.length) {
    				$scope.taskRequests = self.formatTaskResponse(tasksResponse,$scope);
    			    $scope.proceedBulkLater = true;
    			}
    			$scope.taskPromise = true;
				
    		} else {
    			// All Tasks
    			var searchReference = {
    				    "id" : "getARPTasks",
    				    "startIndex":1,
    				    "count":PAGINATION_COUNT.TASK_REQUESTS,
    				    "searchParameters" : {
    				    	//"Operations.owner.value" : ""
    				    }
    				};
    			var taskRequests = Restangular.all('tasks/.search?midas-service=oim11gr2-sql').post(searchReference);
	    		taskRequests.then(function(task) {
	    				var tasksResponse = task.data.plain();
	    				localStorage.setItem("AllTaskRequests", angular.toJson(tasksResponse));
	    				if (tasksResponse.length) {
	    					$scope.taskRequests = self.formatTaskResponse(tasksResponse,$scope);
		    				//console.log('Formatted Task response',$scope.taskRequests);
	    					$scope.proceedBulkLater = true;
	    				}
	    				$scope.taskPromise = true;
	    			});
    		}
        };
        
        // Get Formatted Bulk requests (All/Searched) from API
        service.getBulkRequests = function ($scope) {
        	$scope.bulkPromise = false;
        	$scope.bulkRequests = {};
    		if ($scope.isSearch===true) {
    			// Bulk requests search
    			//console.log('Searching in bulk...');
    			
    			var searchVal = $scope.searchVal;
	        	var searchReference = {
		                "id": "getARPRequests",
		                "startIndex":1,
    				    "count":PAGINATION_COUNT.DEFAULT,
		                "searchParameters" : {
		                	"inputValue" : searchVal
		                }
		            };
	        	
    			var bulkRequests = Restangular.all("bulk/.search").post(searchReference);
	        	bulkRequests.then(function(bulk) {
					var bulkResponse = bulk.data.plain();
					 //console.log('Search bulkResponse',bulkResponse);
    			    $scope.bulkRequests = self.formatBulkResponse(bulkResponse,$scope);
					$scope.bulkPromise = true;
				});
	        	
    		} else {
    			// All Bulk requests
    			//console.log('Bulk All requests mode');
    			var searchReference = {
    				    "id" : "getARPRequests",
    				    "startIndex":1,
    				    "count":PAGINATION_COUNT.BULK_REQUESTS,
    				    "searchParameters" : {
    				    	//"Operations.owner.value" : ""
    				    }
    				};
    			var bulkRequests = Restangular.all('bulk/.search?midas-service=oim11gr2-sql').post(searchReference);
    			bulkRequests.then(function(bulk) {
					var bulkResponse = bulk.data.plain();
					$scope.bulkRequests = self.formatBulkResponse(bulkResponse,$scope);
					$scope.bulkPromise = true;
				});
    		}
        };
        
        /* 
         * Get only Bulk requests (earlier this function used to fetch separately Bulk & RequestForMeNotForMe requests
         * and consolidate them together, now taken care by the API team)
         * 
         */
        service.getConsolidatedBulkRequests = function ($scope) {
        	
        	var deferred = $q.defer();
        	
        	// Get All Raised Requests from Bulk
        	if(angular.isUndefined($scope.bulkPromise)) {
        		$scope.bulkPromise = false;
        	}
        	service.getBulkRequests($scope);
        	
        	// Wait for Bulk API call completion
			var unwatchBulk = $scope.$watch('bulkPromise', function (newbulkPromise,oldbulkPromise){
	        	if (newbulkPromise === false) { return; }
	        	
	        	service.inboxData['bulk'] = $scope.bulkRequests;
	        	unwatchBulk();
	        	deferred.resolve(service.inboxData);
	        });
	        
	        return deferred.promise;
	    };
        
        /* 
         * Generate Inbox Tasks/Requests, If Tasks are found the function will return these immediately,
         * along with a flag to process (fetch) Bulk requests later asynchronously
         * 
         */
        service.getInboxList = function ($scope) {
        	
        	var deferred = $q.defer();
        	service.inboxData = {};
        	
			// API call for mapping requestables to request type (Application / Functional Role)
        	$scope.resourceTypesPromise = false;
	        $scope.requestableName = {};
	        AllReferenceDataService.getGlobalReferenceData().then(
	        		function (res) {
	        			//$scope.resourceTypes = res.children;
	        			$scope.resourceTypes = res['snp.refData.requestables.data'].children;
	        			//console.log('$scope.resourceTypes',$scope.resourceTypes);
	        			
	                    $scope.requestableNameList = [];
						angular.forEach($scope.resourceTypes, function (value, key) {
							// Always fetch attribute "type" from requestableData if present, else fetch typeLabel for display
		                    if(value.attributes.type){
		                        accessType = value.attributes.type;
		                    }else{
		                    	accessType = value.attributes.typeLabel;
		                    }
							$scope.requestableName[value.name] = {
									'resourceType': accessType,
									'requestDisplayName': value.attributes.label
								};
							$scope.requestableNameList[value.name] = {
	                                'requestDisplayName': value.attributes.label
	                            };
						});
						//console.log($scope.requestableName);
						$scope.resourceTypesPromise = true;
	        		}, function (error) {
						console.log("Error with status code", response.status);
						$scope.isLoadingInbox = false;
						$scope.error = res.statusText;
					}
	        );
	        
			// Wait for resourceType API call completion
	        /*** API call for TASKS ***/
	        $scope.taskPromise = false;
	        var unwatchResourceTypes = $scope.$watch('resourceTypesPromise', function (newResourceTypes,oldResourceTypes){
	        	if (newResourceTypes === false) { return; }
				
				if (showTaskRequests !== true) {
					$scope.taskPromise = true;
		        	return;
				}
				
	    		// Get All Raised Requests from Tasks
				service.getTaskRequests($scope);
				unwatchResourceTypes();
			});
	        
			// Wait for Tasks API call completion
	        /*** API call for BULK ***/
	        $scope.bulkPromise = false;
	        var unwatchTasks = $scope.$watch('taskPromise', function (newtaskPromise,oldtaskPromise){
	        	if (newtaskPromise === false) { return; }
	        	
	        	// Return back Tasks data if found, else proceed for Bulk
	        	if ($scope.proceedBulkLater === true || $scope.tasksOnly === true) {
	        		service.inboxData['tasks'] = $scope.taskRequests;
	        		deferred.resolve(service.inboxData);
	        		return;
	        	}
	        	
	        	// Proceed further only if either No tasks are found or only Bulk requests are needed to be fetched 
	        	if (showBulkRequests !== true) {
	        		$scope.bulkPromise = true;
		        	return;
	        	}
				
	        	// Get Consoldated Bulk requests
	        	service.getConsolidatedBulkRequests($scope).then(
						function(response){
							deferred.resolve(response);
						},
						function(error){
							console.log("Error in bulk response", error.status);
						}
					);
	        	
	        	unwatchTasks();
	        });
	        
	        return deferred.promise;
        };
        
        // Generate Inbox Search results for the currently selected Inbox type (Tasks/Requests)
        service.searchInboxList = function ($scope) {
        	
        	var deferred = $q.defer();
        	service.inboxData = {};
        	
			//console.log('Service $scope.searchFilter', $scope.searchFilter);
	        if ($scope.searchFilter=='task') {
	        	$scope.taskPromise = false;
	        	// Get All Raised Requests from Tasks
				service.getTaskRequests($scope);
				
				var unwatchTasks = $scope.$watch('taskPromise', function (newtaskPromise,oldtaskPromise){
					if (newtaskPromise === false) { return; }

					service.inboxData['tasks'] = $scope.taskRequests;
	        		deferred.resolve(service.inboxData);
	        		unwatchTasks();
				});
				
	        } else if ($scope.searchFilter=='request'){
	        	$scope.bulkPromise = false;
	        	
	        	// Get All Raised Requests from Bulk
				service.getBulkRequests($scope);
				
				var unwatchBulk = $scope.$watch('bulkPromise', function (newbulkPromise,oldbulkPromise){
					if (newbulkPromise === false) { return; }

					service.inboxData['bulk'] = $scope.bulkRequests;
	        		deferred.resolve(service.inboxData);
	        		unwatchBulk();
				});
	        }
	        return deferred.promise;
        };
        
        return service;
    });
	
});