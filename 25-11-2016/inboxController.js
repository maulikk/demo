define(['app', 'angularAMD'], function (app, InboxModule) {
	// Common Controller for the entire Inbox module
	InboxModule.controller('InboxController', function ($scope, $rootScope, $state, $stateParams, $timeout, $filter, InboxService, InboxRequestsService, Restangular, _currentUser, VIEW_PATH, REQUEST_STATUS, INBOX_SEARCH_CRITERIA, SCROLLBAR_DIV_HEIGHT) {

		$scope.viewPath = VIEW_PATH.mainview + 'requests/dialog/';
        $scope.REQUEST_STATUS = REQUEST_STATUS;
        
        // Show tab selected depending on the current url state
			$scope.selectedIndex = 0;
            if ($state.current.name === 'requests' || $state.current.name === 'requests.action') {
                $scope.selectedIndex = 0;
            } else if ($state.current.name === 'requests.history') {
                $scope.selectedIndex = 1;
            }

            // Watch for changes in selectedIndex to navigate between My Access & History tabs
            $scope.$watch('selectedIndex', function (current, old) {
            	//console.log('current',current);
                if (current === 0) {
                    $state.go('requests.action');
                } else if (current === 1) {
                    $state.go('requests.history');
                }
            });
        
        /*if ($rootScope.previousState == 'request.access') {
        	$scope.returnToState = 'request.access';
        } else {*/
        	$scope.returnToState = 'inbox.list';
        	
        	/*
        	 * Remove inbox-related storage data on fresh navigation to Inbox module (coming from Non-Inbox pages)
        	 * This will ensure that Inbox / Search results will be shown from cached API response 
        	 * when returning back from Request details page
        	 */ 
        	localStorage.removeItem("inboxBulk");
        	localStorage.removeItem("inboxTasks");
        	localStorage.removeItem("searchedBulk");
        	localStorage.removeItem("searchedTasks");
        //}
        
       	// Initialize Inbox type to 'Requests' if not set
        if (!$rootScope.searchFilter) {
    		$rootScope.searchFilter = 'request';
    	}
        
        // Get Bulk requests asynchronously to save waiting time
        $scope.getAsyncBulkRequests = function () {
        	$scope.isLoadingBulk = true;
        	InboxRequestsService.getConsolidatedBulkRequests($scope).then(
					function(response){
						if ($rootScope.isLoadingInbox) {
							$rootScope.isLoadingInbox = false;
						}
						$scope.isLoadingBulk = false;
						if (response.bulk && response.bulk.data && response.bulk.data.length) {
							//console.log('Inbox Requests',response.bulk);
							//$rootScope.inbox = response.bulk.data;
							if ($rootScope.isSearch === true) {
								localStorage.setItem("searchedBulk", angular.toJson(response.bulk.data));
							} else {
								// This flag is for checking Briefcase route
								if ($stateParams.alertType != null && ($rootScope.previousState == 'briefcase' || $rootScope.previousState == 'request.briefcase')) {
									//console.log('Navigating to Requests...');
									$rootScope.inbox = response.bulk.data;
									
									//console.log('$stateParams',$stateParams);
									if ($stateParams.alertType != null) {
										if ($stateParams.alertType == 'newrequest_success') {
											$("#alert-briefcase-success").removeClass("hide");
							                setTimeout(function () {
							                    $("#alert-briefcase-success").addClass("hide");
							                }, 4000);
										}
										$stateParams.alertType = null;
									}
								}
								
								$scope.inboxcount['request'] = response.bulk.unreadCount;
								localStorage.setItem("inboxBulk", angular.toJson(response.bulk.data));
							}
						}
					},
					function(error){
						$scope.isLoadingBulk = false;
						console.log("Error in bulk response", error.status);
					}
				);
        };
        
        // Get Inbox Tasks/Requests
        $scope.generateInboxList = function () {
        	
        	InboxRequestsService.getInboxList($scope).then(
					function(response){
						if ($stateParams.alertType != null && ($rootScope.previousState == 'briefcase' || $rootScope.previousState == 'request.briefcase')) {
							// Briefcase has been submitted, hence get only Requests & show appropriate success message
							$rootScope.searchFilter = 'request';
							$scope.getAsyncBulkRequests();
			        	} else {
			        		// Normal flow
			        		$rootScope.isLoadingInbox = false;
    						//console.log('response',response);
    						if (response.tasks && response.tasks.data && response.tasks.data.length) {
    							$rootScope.searchFilter = 'task';
    							//console.log('Inbox Tasks',response.tasks);
    							$rootScope.inbox = response.tasks.data;
    							$scope.inboxcount['task'] = response.tasks.unreadCount;
    							localStorage.setItem("inboxTasks", angular.toJson(response.tasks.data));
    							
    							//console.log('$scope.proceedBulkLater',$scope.proceedBulkLater);
    							if ($scope.proceedBulkLater===true && $rootScope.tasksOnly===false) {
    								//Fetch Bulk requests asynchronously
    								$scope.getAsyncBulkRequests();
    							}
    							
    						} else if (response.bulk && response.bulk.data && response.bulk.data.length) {
    							$rootScope.searchFilter = 'request';
    							//console.log('Inbox Requests',response.bulk);
    							$rootScope.inbox = response.bulk.data;
    							$scope.inboxcount['request'] = response.bulk.unreadCount;
    							localStorage.setItem("inboxBulk", angular.toJson(response.bulk.data));
    						}
    						
    						// Filter Inbox data further, if status filter is pre-selected 
    						if ($rootScope.inbox.length && angular.isDefined($rootScope.searchStatus) && $rootScope.searchStatus!='all') {
    		            		//console.log('$rootScope.searchStatus',$rootScope.searchStatus);
    							var inboxData = $rootScope.inbox;
    		            		var beneficiariesfiltered = [];
    		            		inboxData.forEach(function (beneficiaryData) {
    		            			var filterObjects = $filter('filter')(beneficiaryData.subRequests, {'displayStatus': $rootScope.searchStatus});
    		                    	if (filterObjects.length) {
    		                    		var beneficiaryInfo = beneficiaryData;
    		                    		beneficiaryInfo.subRequests = filterObjects;
    		                    		//console.log('beneficiaryInfo',beneficiaryInfo);
    		                    		beneficiariesfiltered.push(beneficiaryInfo);
    		                    	}
    		                	});
    		            		$rootScope.inbox = beneficiariesfiltered;
    		            	}
			        	}
					},
					function(error){
						console.log("Error with status code", error.status);
						$rootScope.isLoadingInbox = false;
						$scope.error = error.statusText;
					}
				);
        };
        
        // Get Inbox Tasks/Requests based on searched criteria
        $scope.searchInInboxList = function () {
        	InboxRequestsService.searchInboxList($scope).then(
					function(response){
						$rootScope.isLoadingInbox = false;
						//console.log('Inbox ',response);
						if (response.tasks && response.tasks.data && response.tasks.data.length) {
                            //console.log('Inbox Tasks',response.tasks);
                            $rootScope.inbox = response.tasks.data;
                            localStorage.setItem("searchedTasks", angular.toJson(response.tasks.data));
					    } else if (response.bulk && response.bulk.data && response.bulk.data.length) {
							//console.log('Inbox Requests',response.bulk);
							$rootScope.inbox = response.bulk.data;
							localStorage.setItem("searchedBulk", angular.toJson(response.bulk.data));
                        }
						
						// Filter Searched data further, if status filter is pre-selected 
						if ($rootScope.inbox.length && angular.isDefined($rootScope.searchStatus) && $rootScope.searchStatus!='all') {
		            		//console.log('$rootScope.searchStatus',$rootScope.searchStatus);
							var inboxData = $rootScope.inbox;
		            		var beneficiariesfiltered = [];
		            		inboxData.forEach(function (beneficiaryData) {
		            			var filterObjects = $filter('filter')(beneficiaryData.subRequests, {'displayStatus': $rootScope.searchStatus});
		                    	if (filterObjects.length) {
		                    		var beneficiaryInfo = beneficiaryData;
		                    		beneficiaryInfo.subRequests = filterObjects;
		                    		//console.log('beneficiaryInfo',beneficiaryInfo);
		                    		beneficiariesfiltered.push(beneficiaryInfo);
		                    	}
		                	});
		            		$rootScope.inbox = beneficiariesfiltered;
		            	}
					},
					function(error){
						console.log("Error with status code", error.status);
						$rootScope.inbox = {};
						$rootScope.inboxcount = 0;
						$rootScope.isLoadingInbox = false;
						$scope.error = error.statusText;
					}
				);
        };
        
        // Check if Inbox data is available in storage, else generate it freshly
        if(!localStorage.getItem("inboxBulk") || !localStorage.getItem("inboxTasks")){
        	// Get Inbox List
        	$rootScope.inbox = {};
			$rootScope.isLoadingInbox = true;
			$scope.inboxcount = {
				'task': 0,
				'request': 0
			};
			$scope.sortOrder = 'asc';
			$scope.sortBy = 'beneficiary';
			$scope.sortReverse = false;
			
			$scope.currentUser = _currentUser;
			
			$rootScope.isSearch = false;
			$rootScope.tasksOnly = false;
			$scope.generateInboxList();
		}
        
        // Search Inbox
        $scope.INBOX_SEARCH_CRITERIA = INBOX_SEARCH_CRITERIA;
        $scope.getSearchPlaceholder = function () {
        	var placeholderArr = [];
        	angular.forEach(INBOX_SEARCH_CRITERIA, function(criteria){
        		placeholderArr.push(criteria.title);
        	});
        	return placeholderArr.join(' or ');
        };
        
        // Get search parameters to look up (search) in Inbox response
        $scope.getSearchParameters = function (type) {
        	var paramsArr = [];
        	var searchType = (type=='task') ? 'taskSearchParameter' : 'bulkSearchParameter';
        	angular.forEach(INBOX_SEARCH_CRITERIA, function(criteria){
        		if (angular.isArray(criteria[searchType])) {
        			angular.forEach(criteria[searchType], function(c){
        				paramsArr.push(c);
        			});
        		} else {
        			paramsArr.push(criteria[searchType]);
        		}
        	});
        	return paramsArr;
        };
        
        $scope.submitSearch = function() {
        	if (!this.search) {
        		return;
        	}
        	
        	// If search is performed in Request details page, then first navigate to Inbox list
        	if ($rootScope.currentState!='inbox.list') {
        		$state.go('inbox.list');
        	}
        	
        	$scope.searchMode = true;
        	$rootScope.inbox = {};
        	$rootScope.inboxcount = 0;
			$rootScope.isLoadingInbox = true;
        	
        	$scope.searchVal = this.search;
        	$rootScope.isSearch = true;
        	$scope.searchInInboxList();
        };
        
        /*
         * Clear search criteria from textbox as well as cached search results
         * Also replace Inbox view with the original cached requests/tasks (full data)
         */
        $scope.clearSearch = function() {
        	this.search = '';
        	$scope.search = '';
        	if ($scope.searchMode===true) {
        		$scope.searchMode = false;
        		/*$rootScope.inbox = angular.fromJson(localStorage.getItem("AllRequests"));
            	$rootScope.inboxcount = $rootScope.inbox.data.length;*/
        		
        		localStorage.removeItem("searchedBulk");
            	localStorage.removeItem("searchedTasks");
        		var lsKey = ($rootScope.searchFilter=='request') ? 'inboxBulk' : 'inboxTasks';
            	var inboxData = angular.fromJson(localStorage[lsKey]);
            	$rootScope.inbox = inboxData;
            }
        };
        
        // Watch for search input, if cleared then auto-switch to full Inbox view
        $scope.$watch('search', function(newVal){
        	if (newVal=='' && $scope.searchMode === true) {
        		//console.log('Showing complete list...');
        		$scope.clearSearch();
        	}
        });
        
		$scope.$on("$locationChangeStart", function(event){
	    	// Navigate directly to Discussion section in Request details, when deep-linked from external links
	    	if ($state.current.name === 'inbox.request#discussionquestion') {
	    		setTimeout(function(){
	        		//var hash = $state.current.name.split('#')[1];
	        		$(".accordion-container").find(".accordion-content").not('.fixed').hide();
	                $(".accordion-container").find(".toggle-icon").html('<i class="icon-plus-sign"></i>');
	                $(".accordion-container").find(".toggle-info").html('<span class="info-text" toggleexpand="">Show Details</span>');
	                $(".accordion-container").eq(1).find(".accordion-content").show();
	                $(".accordion-container").eq(1).find(".toggle-icon").html('<i class="icon-minus-sign"></i>');
	                $(".accordion-container").eq(1).find(".toggle-info").html('<span class="info-text" toggleexpand="">Hide Details</span>');
	                
	                $(".discussion-content").eq(0).addClass("hide");
	                $(".discussion-content").eq(1).addClass("hide");
	                $(".discussion-content").eq(2).addClass("hide");
	                $(".discussion-header").eq(0).addClass("hide");
	                $(".discussion-header").eq(1).addClass("hide");
	                $(".discussion-header").eq(2).addClass("hide");
	                
	                $("#add-comment").removeClass("hide");
		            $(".post-button").attr("disabled", "disabled");
		            $("#add-comment").find(".discussion-question-textarea").val('').addClass("green-textarea");
		            $(".discussion-header-question").addClass('hide');
	                
	        	},800);
	    		
	    	}
	    	
	    	// Handle direction of slide animations in Inbox pages
	    	switch($state.current.name)
            {
                case 'inbox.request':
                case 'inbox.request#discussionquestion':
                case 'inbox.action':
                	$('.inbox-container').removeClass('slide-left-fade').addClass('slide-right-fade');
                    break;
                    
                default:
                	$('.inbox-container').removeClass('slide-right-fade').addClass('slide-left-fade');
                	
            }
        });	
		
    });

	// Controller For Inbox List view only
	InboxModule.controller('InboxListController', function ($scope, $filter, $rootScope, $state, $stateParams, $location, InboxService, InboxListService, InboxRequestsService, RequestDetailsService, UserService, Restangular, RefRestangular, _currentUser, VIEW_PATH, SCROLLBAR_DIV_HEIGHT, STORAGE_TYPES, LIMITS, StorageService,AllReferenceDataService) {
		$scope.pageSize = 10;	// No of Beneficiaries per page 
		$scope.TEXTLIMIT = LIMITS.TEXT_CHARS;
		
		// Popover/Dialog box event handler functions
		$scope.openDialog = function ($event,taskId,requestId,owner,requestName) {
			$scope.approver = [];
			$scope.approver['task-value'] = taskId;
			$scope.request = {"id":requestId};
			$scope.owner = {"display":owner};
			$scope.requestableName = requestName;
            
			RequestDetailsService.opendialog($event,$scope,'approve');
		};
        
        $scope.openCompleteDialog = function ($event,taskId,requestId,owner,requestName) {
			$scope.approver = [];
			$scope.approver['task-value'] = taskId;
			$scope.request = {"id":requestId};
			$scope.owner = {"display":owner};
			$scope.requestableName = requestName;
            
			RequestDetailsService.opendialog($event,$scope,'complete');
		};

		$scope.openwarnDialog = function ($event,taskId,requestId,owner,requestName) {
			$scope.approver = [];
			$scope.approver['task-value'] = taskId;
            $scope.request = {"id":requestId};
			$scope.owner = {"display":owner};
			$scope.requestableName = requestName;
            
			RequestDetailsService.opendialog($event,$scope,'reject');
		};
		
		$scope.openCancelDialog = function ($event,requestId) {
			$scope.requestId = requestId;
			RequestDetailsService.opendialog($event,$scope,'cancel');
		};
		
		$scope.filterby = [{id: 'all', name: 'All'}, {id: 'request', name: 'Request'}, {id: 'clarifications', name: 'Clarifications'}];
        $scope.selectedStatus = [{id: 'pending', name: 'Pending'}, {id: 'completed', name: 'Completed'}];

        /*$scope.clearSearch = function () {
            $scope.search = '';
        };*/

        // Expand/Collapse Beneficiary requests 
        $scope.toggleExpand = function (obj) {
        	InboxListService.toggleExpand(obj, $rootScope.inbox);
        };
        
        // Filter by Request types - Tasks / Bulk
        $scope.searchfilterby = function () {
        	var searchFilter = this.searchFilter;
        	$rootScope.searchFilter = searchFilter;
        	$rootScope.inbox = {};
        	$scope.clearSearch();
        	/*if($scope.searchMode===true) {
        		var lsKey = (searchFilter=='request') ? 'searchedBulk' : 'searchedTasks';
        	} else {
        		var lsKey = (searchFilter=='request') ? 'inboxBulk' : 'inboxTasks';
        	}*/
        	
        	//console.log('searchFilter',searchFilter);
        	if(searchFilter=='request') {
        		var lsKey = 'inboxBulk';
        		var inboxData = (localStorage[lsKey]!=null) ? angular.fromJson(localStorage[lsKey]) : [];
        		
        		if (angular.isDefined($rootScope.searchStatus) && $rootScope.searchStatus!='all') {
            		//console.log('$rootScope.searchStatus',$rootScope.searchStatus);
            		var beneficiariesfiltered = [];
            		inboxData.forEach(function (beneficiaryData) {
            			var filterObjects = $filter('filter')(beneficiaryData.subRequests, {displayStatus: $rootScope.searchStatus});
                    	if (filterObjects.length) {
                    		var beneficiaryInfo = beneficiaryData;
                    		beneficiaryInfo.subRequests = filterObjects;
                    		//console.log('beneficiaryInfo',beneficiaryInfo);
                    		beneficiariesfiltered.push(beneficiaryInfo);
                    	}
                	});
            		$rootScope.inbox = beneficiariesfiltered;
            	} else {
            		$rootScope.inbox = inboxData;
            	}
        	} else {
        		$rootScope.isLoadingInbox = true;
        		//$rootScope.searchStatus = 'all';
        		$rootScope.isSearch = false;
        		$rootScope.tasksOnly = true;
        		$scope.generateInboxList();
    		}
			
        	//$scope.scrollConfig = angular.scrollbarConfig(SCROLLBAR_DIV_HEIGHT.OFFSET);
        };

        // Filter by Request Status - Pending / Provisioned
        $scope.statusby = function () {
        	var searchStatus = this.searchStatus;
        	$rootScope.searchStatus = searchStatus;
        	//console.log('searchStatus',searchStatus);
        	
        	//console.log('searchFilter',$rootScope.searchFilter);
        	if($scope.searchMode===true) {
        		var lsKey = ($rootScope.searchFilter=='request') ? 'searchedBulk' : 'searchedTasks';
        	} else {
        		var lsKey = ($rootScope.searchFilter=='request') ? 'inboxBulk' : 'inboxTasks';
        	}
        	var inboxData = (localStorage[lsKey]!=null) ? angular.fromJson(localStorage[lsKey]) : [];
        	
        	if (searchStatus == 'all') {
            	$rootScope.inbox = inboxData;
            } else {
            	$rootScope.inbox = InboxListService.searchstatusby(searchStatus,inboxData);
            }
        	
        	//$scope.scrollConfig = angular.scrollbarConfig(SCROLLBAR_DIV_HEIGHT.OFFSET);
        };

        // Sort Requests by Beneficiary names - Asc / Desc 
        $scope.mailsort = function (event) {
        	if ($scope.sortOrder == 'asc') {
        		$scope.sortOrder = 'desc';
        		$scope.sortReverse = true;
        	} else if ($scope.sortOrder == 'desc') {
        		$scope.sortOrder = 'asc';
        		$scope.sortReverse = false;
        	}
        };
        
        // Get CSS class name, to show status in different colors
        $scope.getRequestStatusClass = function (status) {
			return RequestDetailsService.getRequestStatusClass(status);
		}
        
        // get Group Members
		$scope.getGroupDetails = function (groupId) {
			UserService.getGroupDetails(groupId).then( function(req)
			{
				$scope.group = req.data.plain();
			},function(response) {
				console.log("Error with status code", response.status);
			});
		};
        
        //Get Scrollbar config
        //$scope.scrollConfig = angular.scrollbarConfig(SCROLLBAR_DIV_HEIGHT.OFFSET);
        
        // Resize window height on viewport change
		function resizePage() {
            var page_height = $(window).height() - SCROLLBAR_DIV_HEIGHT.DEFAULT_SCROLL_OFFSET;
            //console.log('page_height',page_height);
            $('.content-wrapper').height(page_height);
        }
        $(window).resize(resizePage);
        resizePage();
        //setTimeout(resizePage,1000);
        
        // Show transaction messages, if any, when landing on Inbox
        function showTransactionMessages () {
			if ($stateParams.alertType == 'newrequest_success' && 
					($rootScope.previousState == 'briefcase' || $rootScope.previousState == 'request.briefcase') ) {
				return;
			}
			switch ($stateParams.alertType) {
		        case 'approve_success':
		        	$("#alert-approve-success").removeClass("hide");
		            setTimeout(function () {
		                $("#alert-approve-success").addClass("hide");
		            }, 3000);
		        	break;
		        	
		        case 'reject_success':
		        	$("#alert-reject-success").removeClass("hide");
		            setTimeout(function () {
		                $("#alert-reject-success").addClass("hide");
		            }, 3000);
		        	break;
		        	
		        case 'complete_success':
		        	$("#alert-complete-success").removeClass("hide");
		            setTimeout(function () {
		                $("#alert-complete-success").addClass("hide");
		            }, 3000);
		        	break;
		        	
		        case 'cancel_success':
		        	$("#alert-cancel-success").removeClass("hide");
		            setTimeout(function () {
		                $("#alert-cancel-success").addClass("hide");
		            }, 3000);
		        	break;
		        	
		    	/*case 'newrequest_success':
		        	$("#alert-briefcase-success").removeClass("hide");
		            setTimeout(function () {
		                $("#alert-briefcase-success").addClass("hide");
		            }, 3000);
		        	break;*/
		        	
		    	case 'delete_success':
		        	$("#alert-delete-success").removeClass("hide");
		            setTimeout(function () {
		                $("#alert-delete-success").addClass("hide");
		            }, 3000);
		        	break;
		        	
		    	case 'question_success':
		        	$("#alert-question-success").removeClass("hide");
		            setTimeout(function () {
		                $("#alert-question-success").addClass("hide");
		            }, 3000);
		        	break;
		        	
		    	case 'answered_success':
		        	$("#alert-answered-success").removeClass("hide");
		            setTimeout(function () {
		                $("#alert-answered-success").addClass("hide");
		            }, 3000);
		        	break;
		        	
		    	default:
		    		break;
		    }
			
			// Reset back the state param, so as not to show the message again on controller reload.
			$stateParams.alertType = null;
		}
		
		//console.log('$stateParams.alertType',$stateParams.alertType);
        if ($stateParams.alertType != null) {
			showTransactionMessages();
		}
        
	});
	
    //Directive for expand and collapse in mail item
    InboxModule.directive('toggleexpand', function () {
        return {
            restrict: 'A',
            link: function (scope, element) {

                element.bind('click', function (e) {
                    angular.element(e.target).parents('.accordion-toggle').trigger('click');
                });
            }
        };
    });

    /*
     * Native slide toggle for AngularJS 1.4.x using $animateCss
     * Source : http://blog.assaf.co/native-slide-toggle-for-angularjs-1-4-x/
     */
    InboxModule.animation('.mail-list-expanded', ['$animateCss', function($animateCss) {
    	//console.log('Animating slide...');
        var lastId = 0;
        var _cache = {};

        function getId(el) {
          var id = el[0].getAttribute("data-mail-list-expanded");
          if (!id) {
            id = ++lastId;
            el[0].setAttribute("data-mail-list-expanded", id);
          }
          return id;
        }

        function getState(id) {
          var state = _cache[id];
          if (!state) {
            state = {};
            _cache[id] = state;
          }
          return state;
        }

        function generateRunner(closing, state, animator, element, doneFn) {
          return function() {
            state.animating = true;
            state.animator = animator;
            state.doneFn = doneFn;
            animator.start().finally(function() {
              if (closing && state.doneFn === doneFn) {
                element[0].style.height = '';
              }
              state.animating = false;
              state.animator = undefined;
              state.doneFn();
            });
          }
        }

        return {
          addClass: function(element, className, doneFn) {
            if (className == 'ng-hide') {
              var state = getState(getId(element));
              //console.log('state',state);
              var height = (state.animating && state.height) ?
                state.height : element[0].offsetHeight;

              var animator = $animateCss(element, {
                from: {
                  height: height + 'px',
                  opacity: 1
                },
                to: {
                  height: '0px',
                  opacity: 0
                }
              });
              if (animator) {
                if (state.animating) {
                  state.doneFn =
                    generateRunner(true,
                      state,
                      animator,
                      element,
                      doneFn);
                  return state.animator.end();
                } else {
                  state.height = height;
                  return generateRunner(true,
                    state,
                    animator,
                    element,
                    doneFn)();
                }
              }
            }
            doneFn();
          },
          removeClass: function(element, className, doneFn) {
            if (className == 'ng-hide') {
              var state = getState(getId(element));
              var height = (state.animating && state.height) ?
                state.height : element[0].offsetHeight;

              var animator = $animateCss(element, {
                from: {
                  height: '0px',
                  opacity: 0
                },
                to: {
                  height: height + 'px',
                  opacity: 1
                }
              });

              if (animator) {
                if (state.animating) {
                  state.doneFn = generateRunner(false,
                    state,
                    animator,
                    element,
                    doneFn);
                  return state.animator.end();
                } else {
                  state.height = height;
                  return generateRunner(false,
                    state,
                    animator,
                    element,
                    doneFn)();
                }
              }
            }
            doneFn();
          }
        };
    }]);
    
    
    //Controller For Approval of bulk requests (Action page)
    InboxModule.controller('ApprovalController', function ($scope, $element, $mdDialog, VIEW_PATH, SCROLLBAR_DIV_HEIGHT) {
        $scope.viewPath = VIEW_PATH.mainview + 'requests/dialog/';
        $scope.checkbox = function (event) {

            if ($(event.target).is(":checked")) {
                $(".approve_button").removeAttr("disabled");
            }
            else {
                if ($(".childCheckbox").is(":checked"))
                {
                }
                else
                {
                    $(".approve_button").attr("disabled", "disabled");
                }
            }

        };

        $scope.backtohome = function ()
        {
            setTimeout(function () {
                $("#alert-approve-success").removeClass("hide");
                setTimeout(function () {
                    $("#alert-approve-success").addClass("hide");
                }, 5000);
                $(".mail-list-item").find(".mail-list-expanded").css('display', 'none');
            }, 500);

            //window.location.reload("http://localhost/SPRS-html/#");
        };

        $scope.checkAll = function (source)
        {
            if ($(".childCheckbox").is(":checked")) {
                $(".childCheckbox").prop("checked", false);
                $(".approve_button").attr("disabled", "disabled");
            } else {
                $(".childCheckbox").prop("checked", true);
                $(".approve_button").removeAttr("disabled");
            }
        };

        $scope.openDialogMailApproved = function ($event) {
            $mdDialog.show({
                controller: DialogCtrl,
                controllerAs: 'ctrl',
                templateUrl: $scope.viewPath + 'mail-approved-dialog.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: $event,
                clickOutsideToClose: true
            })
        };

        function DialogCtrl() {
            var self = this;
            // list of `state` value/display objects
            //self.states        = loadAll();
            //self.querySearch   = querySearch;
            // ******************************
            // Template methods
            // ******************************
            self.cancel = function ($event) {
                $mdDialog.cancel();
            };
            self.finish = function ($event) {
                $mdDialog.hide();
            };
        }
        
        //Get Scrollbar config
        $scope.scrollConfig = angular.scrollbarConfig(SCROLLBAR_DIV_HEIGHT.OFFSET);
        
    });
    
    InboxModule.controller('StandardProfileRequestsTreeList', ['$scope','$filter','$window',
        function ($scope, $filter,$window) {
            $scope.standardRequestsList = [
                            {
                                beneficiary: 'Robert Smith',
                                createdBy: 'Adam Johnson',
                                requestDate: '10/18/2016',
                                opened: true,
                                children: [
                                    {
                                        functionalRole: 'Analyst',
                                        department: 'Corporate Ratings: Credit Assets',
                                        region: 'EMEA'
                                        
                                    },
                                    {
                                        functionalRole: 'Analyst',
                                        department: 'Structured Finance: Covered Bonds',
                                        region: 'Japan'
                                    }
                                ]
                            },
                            {
                                beneficiary: 'Anne Thomas',
                                createdBy: 'Adam Johnson',
                                requestDate: '10/15/2016',
                                children: [{
                                        functionalRole: 'Analyst',
                                        department: 'Front-End',
                                        region: 'North America'
                                    }]
                            },
                            {
                                beneficiary: 'Richard Lee',
                                createdBy: 'Pamela Diaz',
                                requestDate: '11/24/2016',
                                children: [{
                                        functionalRole: 'Analyst',
                                        department: 'Corporate Ratings: Insurance',
                                        region: 'North America'
                                    }]
                            },
                            {
                                beneficiary: 'Rachel Thompson',
                                createdBy: 'Pamela Diaz',
                                requestDate: '11/27/2016',
                                children: [{
                                        functionalRole: 'Analyst',
                                        department: 'Structured Finance: Debt Bonds',
                                        region: 'South America'
                                    }]
                            }
                        ];
            
            $scope.toggleAllCheckboxes = function ($event) {
                var i, item, len, ref, results, selected;
                selected = $event.target.checked;
                ref = $scope.standardRequestsList;
                results = [];
                for (i = 0, len = ref.length; i < len; i++) {
                    /*if ($window.CP.shouldStopExecution(1)) {
                        break;
                    }*/
                    item = ref[i];
                    item.selected = selected;
                    if (item.children != null) {
                        results.push($scope.$broadcast('changeChildren', item));
                    } else {
                        results.push(void 0);
                    }
                }
                //$window.CP.exitedLoop(1);
                return results;
            };
            $scope.initCheckbox = function (item, parentItem) {
                return item.selected = parentItem && parentItem.selected || item.selected || false;
            };
            $scope.toggleCheckbox = function (item, parentScope) {
                if (item.children != null) {
                    $scope.$broadcast('changeChildren', item);
                }
                if (parentScope.item != null) {
                    return $scope.$emit('changeParent', parentScope);
                }
            };
            $scope.$on('changeChildren', function (event, parentItem) {
                var child, i, len, ref, results;
                ref = parentItem.children;
                results = [];
                for (i = 0, len = ref.length; i < len; i++) {
                    /*if (window.CP.shouldStopExecution(2)) {
                        break;
                    }*/
                    child = ref[i];
                    child.selected = parentItem.selected;
                    if (child.children != null) {
                        results.push($scope.$broadcast('changeChildren', child));
                    } else {
                        results.push(void 0);
                    }
                }
                //$window.CP.exitedLoop(2);
                return results;
            });
            return $scope.$on('changeParent', function (event, parentScope) {
                var children;
                children = parentScope.item.children;
                parentScope.item.selected = $filter('selected')(children).length === children.length;
                parentScope = parentScope.$parent.$parent;
                if (parentScope.item != null) {
                    return $scope.$broadcast('changeParent', parentScope);
                }
            });
        }
    ]);
    
    InboxModule.controller('OptionalRequestsTreeList', ['$scope','$filter','$window',
        function ($scope, $filter,$window) {
            
            $scope.optionalRequestsList = [
                            {
                                beneficiary: 'Anne Thomas',
                                createdBy: 'Pamela Diaz',
                                requestDate: '11/27/2016',
                                opened: false,
                                children: [
                                    {
                                        functionalRole: 'Analyst',
                                        department: 'Corporate Ratings: Credit Assets',
                                        region: 'EMEA'
                                        
                                    },
                                    {
                                        functionalRole: 'Analyst',
                                        department: 'Structured Finance: Covered Bonds',
                                        region: 'Japan'
                                    }
                                ]
                            },
                            {
                                beneficiary: 'Robert Smith',
                                createdBy: 'Adam Johnson',
                                requestDate: '10/12/2016',
                                children: [{
                                        functionalRole: 'Analyst',
                                        department: 'Front-End',
                                        region: 'North America'
                                    },
                                    {
                                        functionalRole: 'Analyst',
                                        department: 'Front-End',
                                        region: 'North America'
                                    },
                                    {
                                        functionalRole: 'Analyst',
                                        department: 'Front-End',
                                        region: 'North America'
                                    }]
                            },
                            {
                                beneficiary: 'Rachel Thompson',
                                createdBy: 'Pamela Diaz',
                                requestDate: '11/20/2016',
                                children: [{
                                        functionalRole: 'Analyst',
                                        department: 'Corporate Ratings: Insurance',
                                        region: 'North America'
                                    },
                                    {
                                        functionalRole: 'Analyst',
                                        department: 'Corporate Ratings: Insurance',
                                        region: 'North America'
                                    },
                                    {
                                        functionalRole: 'Analyst',
                                        department: 'Corporate Ratings: Insurance',
                                        region: 'North America'
                                    },
                                    {
                                        functionalRole: 'Analyst',
                                        department: 'Corporate Ratings: Insurance',
                                        region: 'North America'
                                    },
                                    {
                                        functionalRole: 'Analyst',
                                        department: 'Corporate Ratings: Insurance',
                                        region: 'North America'
                                    },
                                    {
                                        functionalRole: 'Analyst',
                                        department: 'Corporate Ratings: Insurance',
                                        region: 'North America'
                                    },
                                    {
                                        functionalRole: 'Analyst',
                                        department: 'Corporate Ratings: Insurance',
                                        region: 'North America'
                                    },
                                    {
                                        functionalRole: 'Analyst',
                                        department: 'Corporate Ratings: Insurance',
                                        region: 'North America'
                                    }]
                            },
                            {
                                beneficiary: 'Richard Lee',
                                createdBy: 'Adam Johnson',
                                requestDate: '11/09/2016',
                                children: [{
                                        functionalRole: 'Analyst',
                                        department: 'Structured Finance: Debt Bonds',
                                        region: 'South America'
                                    }]
                            }
                        ];
            
            $scope.toggleAllCheckboxes = function ($event) {
                var i, item, len, ref, results, selected;
                selected = $event.target.checked;
                ref = $scope.optionalRequestsList;
                results = [];
                for (i = 0, len = ref.length; i < len; i++) {
                    /*if ($window.CP.shouldStopExecution(1)) {
                        break;
                    }*/
                    item = ref[i];
                    item.selected = selected;
                    if (item.children != null) {
                        results.push($scope.$broadcast('changeChildren', item));
                    } else {
                        results.push(void 0);
                    }
                }
                //$window.CP.exitedLoop(1);
                return results;
            };
            $scope.initCheckbox = function (item, parentItem) {
                return item.selected = parentItem && parentItem.selected || item.selected || false;
            };
            $scope.toggleCheckbox = function (item, parentScope) {
                if (item.children != null) {
                    $scope.$broadcast('changeChildren', item);
                }
                if (parentScope.item != null) {
                    return $scope.$emit('changeParent', parentScope);
                }
            };
            $scope.$on('changeChildren', function (event, parentItem) {
                var child, i, len, ref, results;
                ref = parentItem.children;
                results = [];
                for (i = 0, len = ref.length; i < len; i++) {
                    /*if (window.CP.shouldStopExecution(2)) {
                        break;
                    }*/
                    child = ref[i];
                    child.selected = parentItem.selected;
                    if (child.children != null) {
                        results.push($scope.$broadcast('changeChildren', child));
                    } else {
                        results.push(void 0);
                    }
                }
                //$window.CP.exitedLoop(2);
                return results;
            });
            return $scope.$on('changeParent', function (event, parentScope) {
                var children;
                children = parentScope.item.children;
                parentScope.item.selected = $filter('selected')(children).length === children.length;
                parentScope = parentScope.$parent.$parent;
                if (parentScope.item != null) {
                    return $scope.$broadcast('changeParent', parentScope);
                }
            });
        }
    ]);
    


});
