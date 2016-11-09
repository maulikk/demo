// Routes for Angular
var app = angular.module('sprsApp', ['ngMaterial','ui.router','nsPopover','mgcrea.ngStrap','mgcrea.ngStrap.tooltip','mgcrea.ngStrap.popover','perfect_scrollbar'])

// Main Controller

app.controller("MainCtrl", function($scope, $element) {

    $element.class = "navigation-folded";

    $scope.class = "notfolded";

    $scope.popover = {
      "title": "Title",
      "content": "Hello Popover<br />This is a multiline message!"
    };

    $scope.filterby = [ { id: 'all', name: 'All' }, { id: 'request', name: 'Request' }, { id: 'clarifications', name: 'Clarifications' } ];

    $scope.selectedStatus = [ { id: 'pending', name: 'Pending' }, { id: 'completed', name: 'Completed' } ];

    $scope.init = function() {
        console.log();
        $scope.showModal = false;
        $scope.buttonClicked = "";
        $scope.toggleModal = function(btnClicked){
            $scope.buttonClicked = btnClicked;
            $scope.showModal = !$scope.showModal;
        };
		
		$(".navigation-simple").find(".item").on('click',function(){
			$(this).addClass("active");
		});
        
        // var briefcase_len = $(".horz-row").length();
        // console.log(briefcase_len);
        // $("#header .suitcase-key .badge").html(briefcase_len);

        if ($(window)[0].innerWidth < 1280) {
            $("#apps").addClass("navigation-folded");
            $("#navigation").removeClass("notfolded").addClass("folded");
            $scope.class = 'folded';
        }
        setTimeout(function() {
            $("#apps").find(".mail-list-expanded").hide();
            $("#apps").find(".approval-list .mail-list-expanded").show();
            $(".nav-inbox").find(".badge").html($(".mail-list-item").length);
        }, 800);

 
        // $('#mail .content').perfectScrollbar();
        
 


    };

    $scope.$on("$locationChangeStart", function(event){
        setTimeout(function(){
            
            var locationurl = window.location.hash;
            var location = locationurl.split('#');
            var bodylocation = window.location.href;
            //Add class to body
            var bodylocationurl = bodylocation.split('/');
			console.log(location);
            console.log(bodylocationurl);
            // if (bodylocationurl[4] == 'new-request') {
                for(var i=0;i<bodylocationurl.length;i++)
                {
                    switch(bodylocationurl[i])
                    {
                        case 'new-request':
                                $("body").addClass("inner-page new-request");
                                $("body").removeClass("my-profile");
                                $("body").removeClass("briefcase");
                                $("body").removeClass("certifications");
                                $("body").removeClass("reports");
                                
                                $("body").find(".navigation-simple").find(".item").each(function(){
                                    $(this).removeClass("active");
                                });
                                $("body").find(".nav-newrequest").addClass('active');
                                break;
                        case 'my-access':
                                $("body").addClass("inner-page my-access");
                                $("body").removeClass("my-profile");
                                $("body").removeClass("briefcase");
                                $("body").removeClass("certifications");
                                $("body").removeClass("reports");

                                $("body").find(".navigation-simple").find(".item").each(function(){
                                    $(this).removeClass("active");
                                });
                                $("body").find(".nav-myaccess").addClass('active');
                              
                                break;

                        case 'reports':
                                $("body").addClass("inner-page reports");
                                $("body").removeClass("my-profile");
                                $("body").removeClass("briefcase");
                                $("body").removeClass("certifications");
                                $("body").removeClass("my-access");

                                $("body").find(".navigation-simple").find(".item").each(function(){
                                    $(this).removeClass("active");
                                });
                                $("body").find(".nav-reports").addClass('active'); 
                                break;

                        case 'briefcase':
                                $("body").addClass("inner-page briefcase");
                                 $("body").removeClass("my-profile");
                                $("body").removeClass("reports");
                                $("body").removeClass("certifications");
                                $("body").removeClass("my-access");
                                break;

                        case 'my-profile':
                               $("body").addClass("inner-page my-profile");
                                $("body").removeClass("briefcase"); 
                                $("body").removeClass("reports");
                                $("body").removeClass("certifications");
                                $("body").removeClass("my-access");
                                break;

                        case 'certifications':
                                $("body").addClass("inner-page certifications");
                                $("body").removeClass("briefcase"); 
                                $("body").removeClass("reports"); 
                                $("body").removeClass("my-access"); 
                                 $("body").removeClass("my-profile"); 
                                break;

                        /*case 'reports':
                                $("body").addClass("inner-page reports");
                                $("body").removeClass("new-request");  
                                $("body").removeClass("briefcase");  
                                $("body").removeClass("certifications");  
                                break;*/

                        default:
                            $("body").removeClass("inner-page");  
                            $("body").find(".navigation-simple").find(".item").each(function(){
                            $(this).removeClass("active");
                            }); 
                            $("body").find(".nav-inbox").addClass('active'); 
                            setTimeout(function(){
                               $(".mail-list-expanded").css('display','none');
                            });         
                            break;
                    }
                }
                console.log($.inArray('new-request',bodylocationurl));
             

            for(var j=0;j<location.length;j++)    
            {
                switch(location[j])
                {
                    case 'discussionquestion':
                        $(".accordion-container").find(".accordion-content").hide();
                        $(".accordion-container").find(".toggle-icon").html('<i class="icon-plus-sign"></i>');
                        $(".accordion-container").find(".toggle-info").html('<span class="info-text" toggleexpand="">Show Details</span>');
                        $(".accordion-container").eq(1).find(".accordion-content").show();
                        $(".accordion-container").eq(1).find(".toggle-icon").html('<i class="icon-minus-sign"></i>');
                        $(".accordion-container").eq(1).find(".toggle-info").html('<span class="info-text" toggleexpand="">Hide Details</span>');
                        $("#discuss-question").removeClass("hide");
                        $(".discussion-header-question").addClass("hide");
                        $(".discussion-content").eq(0).addClass("hide");
                        $(".discussion-content").eq(1).addClass("hide");
                        $(".discussion-content").eq(2).addClass("hide");
                        $(".response-button").addClass("hide");
                        $(".discussion-header").eq(0).addClass("hide");
                        $(".discussion-header").eq(1).addClass("hide");
                        $(".discussion-header").eq(2).addClass("hide");
                        
                        $("#discussion-responseanswer").addClass("hide");
                        $(".post-button").removeClass("hide");
                        break;
                    case 'discussion':
                        $(".accordion-container").find(".accordion-content").hide();
                        $(".accordion-container").find(".toggle-icon").html('<i class="icon-plus-sign"></i>');
                        $(".accordion-container").find(".toggle-info").html('<span class="info-text" toggleexpand="">Show Details</span>');
                        $(".accordion-container").eq(1).find(".accordion-content").show();
                        $(".accordion-container").eq(1).find(".toggle-icon").html('<i class="icon-minus-sign"></i>');
                        $(".accordion-container").eq(1).find(".toggle-info").html('<span class="info-text" toggleexpand="">Hide Details</span>');  
                        break;
                    default:
                        break;   
                }
            }
            
            
        },800);
            // do stuff that I want to get done
    });


    //Function for sidebar navigation fold and unfold
    $scope.changeClass = function(event) {

        if ($scope.class === "notfolded") {
            $scope.class = "folded";
            var body = document.getElementById('apps');
            console.log(body);
            document.getElementById('apps').classList.add('navigation-folded'); //add
            //$(event.target).addClass("navigation-folded");
        } else {
            //$(event.target).removeClass("navigation-folded");
            document.getElementById('apps').classList.remove('navigation-folded');
            $scope.class = "notfolded";
        }
    };
    //Function for mail list expand and collpase
    $scope.expand = function(obj) {
        console.log($(obj.target).parents(".mail-list-item").find(".mail-list-expanded").hasClass("not-expanded"));
        $(obj.target).parents(".mail-list-item").find(".mail-list-expanded").find(".mail-list-expanded").hide();
        console.log(obj.target);
        if ($(obj.target).parents(".mail-list-item").find(".mail-list-expanded").hasClass("not-expanded")) {
            $(obj.target).parents(".mail-list-item").find(".mail-list-expanded").addClass("expanded").removeClass('not-expanded').slideDown();
            if ($(obj.target).hasClass("icons-plus-circle")) {
                $(obj.target).parent(".md-button").addClass('expanded');

            } else {
                $(obj.target).parents(".mail-list-item").find(".md-layout-row").find(".md-button").addClass('expanded');
            }
        } else {
            $(obj.target).parents(".mail-list-item").find(".mail-list-expanded").addClass("not-expanded").removeClass('expanded').slideUp();
            if ($(obj.target).hasClass("icons-plus-circle")) {
                $(obj.target).parent(".md-button").removeClass('expanded');

            } else {
                $(obj.target).parents(".mail-list-item").find(".md-layout-row").find(".md-button").removeClass('expanded');
            }

        }
    };
    $scope.updateLayoutMode = function(event) {
        if (this.vm.layoutMode === 'boxed') {
            document.getElementById('apps').classList.add('boxed'); //add
        } else {
            document.getElementById('apps').classList.remove('boxed'); //add
        }
    };

    $scope.mailsort = function(event) {
        if ($(event.target).parents(".sort-icon").hasClass("ascending-order")) {
            $(event.target).parents(".sort-icon").addClass("descending-order");
            $(event.target).parents(".sort-icon").removeClass("ascending-order");
            var elems = $.makeArray($("#apps").find(".mail-list-item"));
            elems.sort(function(a, b) {
                return new Date($(a).find(".time").text()) < new Date($(b).find(".time").text());
            });
            $("#apps").find(".mail-list-pane").html(elems);
        } else {
            $(event.target).parents(".sort-icon").addClass("ascending-order");
            $(event.target).parents(".sort-icon").removeClass("descending-order");
            var elems = $.makeArray($("#apps").find(".mail-list-item"));
            elems.sort(function(a, b) {
                return new Date($(a).find(".time").text()) > new Date($(b).find(".time").text());
            });
            $("#apps").find(".mail-list-pane").html(elems);
        }
    };

    $scope.approveDialog = function($mdDialog)
    {
          $mdDialog.show({
            controller: "MainCtrl",
            templateUrl: './access.html',
            parent: angular.element(document.body),
            clickOutsideToClose:true
          })
    };

    $scope.backtohome = function()
     {
      
      setTimeout(function(){
       $(".mail-list-expanded").css('display','none');
      });
      //window.location.reload("http://localhost/SPRS-html/#");
     };

    // Beneficiary custom checkbox
      $scope.requestSelf = function(event) {
        $(".requestSelf").addClass("requestActive");
        $(".requestOthers").removeClass("requestActive");        
    }
    $scope.requestOthers = function(event) {        
        if($(".requestSelf").hasClass("requestActive")){            
            $(".requestOthers").addClass("requestActive");
            $(".requestSelf").removeClass("requestActive").addClass("hideBtn");
            $(".requestOthersDiv").fadeIn();
        }
        else{
            $(".requestOthers").removeClass("requestActive");
            $(".requestSelf").addClass("requestActive").removeClass("hideBtn");;
            $(".requestOthersDiv").fadeOut();
        }
    }

    $scope.accordion_toggle = function(event) {
        //event.preventDefault();
        // create accordion variables
        if($(event.target).hasClass("info-text"))
        {
            var accordion = $(event.target);
            var accordionContent = accordion.parents(".accordion-toggle").next('.accordion-content');
            var accordionToggleIcon = accordion.parents(".accordion-toggle").children('.toggle-icon');
            var accordionToggleInfo = accordion.parents(".accordion-toggle").children('.toggle-info');   
        }
        else if($(event.target).hasClass("icon-plus-sign"))
        {
            var accordion = $(event.target);
            var accordionContent = accordion.parents(".accordion-toggle").next('.accordion-content');
            var accordionToggleIcon = accordion.parents(".accordion-toggle").children(".toggle-icon");
            var accordionToggleInfo = accordion.parents(".accordion-toggle").children('.toggle-info');      
        }
        else
        {
            var accordion = $(event.target);
            var accordionContent = accordion.next('.accordion-content');
            var accordionToggleIcon = $(event.target).children('.toggle-icon');
            var accordionToggleInfo = $(event.target).children('.toggle-info');
        }

        console.log(accordionContent);

        $(".accordion-container").find(".accordion-toggle").removeClass("open");

        $(".accordion-container").find(".accordion-content").hide(100);

        $(".accordion-container").find(".toggle-icon").html("<i class='icon-plus-sign'></i>");
        $(".accordion-container").find(".toggle-info").html("<span class='info-text'>Show Details</span>");
        // toggle accordion link open class
        // toggle accordion content
        if(accordionContent.is(":visible"))
        {
            accordionToggleIcon.html("<i class='icon-plus-sign'></i>");
            accordionToggleInfo.html("<span class='info-text'>Show Details</span>");
            accordionContent.hide(100);
        }
        else
        {
            accordionToggleIcon.html("<i class='icon-minus-sign'></i>");
            accordionToggleInfo.html("<span class='info-text'>Hide Details</span>");
            accordionContent.show(100);    
        }
        

        //accordion.addClass("open");

        // change plus/minus icon
        /*if (accordion.hasClass("open")) {
            accordionToggleIcon.html("<i class='icon-minus-sign'></i>");
            accordionToggleInfo.html("<span class='info-text'>Hide Details</span>");
        } else {
            accordion.removeClass("open");
            accordionToggleIcon.html("<i class='icon-plus-sign'></i>");
            accordionToggleInfo.html("<span class='info-text'>Show Details</span>");
        }*/
    }
});

//Directive for expand and collapse in mail item
app.directive('toggleexpand', function () {
    return {
      restrict: 'A',
      link: function(scope, element) {

        element.bind('click', function(e) {
            
            angular.element(e.target).parents('.accordion-toggle').trigger('click');
        });
      }
    };
});

/*
app.directive('backtomail', function() {
    return {
        restrict: 'A',
      link: function(scope, element) {
        $('.mail-list-expanded').css('display', 'none');
        
        // element.bind('click', function(e) {
        //     angular.element(e.target).parents('.accordion-toggle').trigger('click');
        // });
      }
  };
});
*/

//Controller For Discussion Raise Question and Response to Question

app.controller("DiscussionController",function($scope,$element){
	/*Textarea KeyUp Event to Enable the Response Button and Find No of Characters used*/
	$scope.discussionresponseanswer = function(event){
		var content_length = $(event.target).val().length;
		$("#discussion-responseanswer").find(".content-length-change").html(content_length);
		if(content_length != 0){
			$(".response-button").removeAttr('disabled');
		}
		else
		{
			$(".response-button").attr('disabled','disabled');
		}
	};
	
    /*Raise a New Question Click event*/
    $scope.raisenewquestion = function(event) {
        $("#discuss-question").removeClass("hide");
        $(".post-button").removeClass("hide").attr("disabled", "disabled");
        $(".close-question-button").addClass("hide");
        $("#discuss-question").find(".discussion-question-textarea").val('').addClass("green-textarea");
        $scope.selectedUser3 = "";
        if ($(".close-button").hasClass("hide")) {} else {
            $(".close-button").addClass("hide");
        }
        $(".discussion-header-question").addClass('hide');

    };

	
	$scope.postquestionresponse = function(event)
	{
		var content = $("#discuss-question").find(".discussion-question-textarea").val();
		var userval = $scope.selectedUser3;
		var currentdate = new Date(); 
		var datetime = currentdate.getMonth()+1 + "/"
                + (currentdate.getDate())  + "/" 
                + currentdate.getFullYear() + " - "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes();
		
		var question_template = '<div class="discussion-header"><i class="icon-style icons-comments-question"></i><p><strong>'+datetime+'</strong> Question posed by <span class="blue-text">Joan Johnson</span> to <strong>'+userval+'</strong></p></div><div class="discussion-content"><p class="triangle-border left-top tb-success">'+content+'</p></div>';
		$("#discuss-question").addClass("hide");
		$(".post-button").addClass('hide');
		$(".close-question-button").removeClass('hide');
		$(question_template).insertBefore($(".discussion-header-question"));
		$(".success-discussion-content").find(".alert-success").html("Your question has been successfully posted to "+userval+".");
		$(".success-discussion-content").find(".alert-success").removeClass("hide");
		setTimeout(function(){
			$(".success-discussion-content").find(".alert-success").addClass("hide").fadeOut(300);	
			$(".discussion-content").find(".triangle-border").removeClass('tb-success');
		},12500);
        $(".discussion-header-question").removeClass('hide');
		
	};
	
	$scope.discussionquestion = function(event){
		var content_length = $(event.target).val().length;
		$(event.target).removeClass('green-textarea');
		$("#discuss-question").find(".content-length-change").html(content_length);
		if(content_length != 0){
			$(".post-button").removeAttr('disabled');
		}
		else
		{
			$(".post-button").attr('disabled','disabled');
		}
	};
	
	
	/*Post Response click event*/
	$scope.postdiscussionresponse = function(event){
		var content = $("#discussion-responseanswer").find(".discussion-textarea").val();
		var currentdate = new Date(); 
		var datetime = currentdate.getMonth()+1 + "/"
                + (currentdate.getDate())  + "/" 
                + currentdate.getFullYear() + " - "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes();

		var answer_template = '<div class="discussion-header bg-ct"><p><strong>'+datetime+'</strong><span class="blue-text">Joan Johnson</span> responded to Greg Knowlton</p></div><div class="discussion-content"><p class="triangle-border right-top">'+content+'</p></div>';
		$("#discussion-responseanswer").addClass("hide");
		$(".response-button").addClass('hide');
		$(".close-button").removeClass('hide');
        $(".close-question-button").addClass("hide");
		$(answer_template).insertBefore($("#discussion-responseanswer"));
		//$("#discussion-responseanswer").find(".discussion_content").append(answer_template);
	};


    $scope.homePopoverPostdiscussionresponse = function(event){
        $("#discussion-responseanswer").hide();
        $("#popover-discussions").find(".poD-content").hide();
        $("#popover-discussions").find(".response-button").addClass('hide');
        $("#popover-discussions").find(".success-discussion-content").find(".alert-success").find(".success-link").html("Your question has been successfully posted to Greg Knowlton");
        $("#popover-discussions").find(".success-discussion-content").find(".alert-success").removeClass("hide");
        $("#popover-discussions").find(".ok-button").removeClass("hide");
        $("#popover-discussions").find(".discussion-header").hide();
    };
	
	/*Close Discussion Accordion Click Event*/
	$scope.closediscussion = function(event)
	{
		$(event.target).parents(".accordion-content").hide();
		$(event.target).parents(".accordion-content").prev('.accordion-toggle').find(".toggle-icon").html("<i class='icon-plus-sign'></i>");
		$(event.target).parents(".accordion-content").prev('.accordion-toggle').find(".toggle-info").html("<span class='info-text'>Show Details</span>");
	}
});


//Controller For Approval Mail List Item
app.controller("ApprovalController",function($scope,$element){
    $scope.checkbox = function(event){
        
        if ($(event.target).is(":checked")) {
            $(".approve_button").removeAttr("disabled");
        }
        else{
            if($(".childCheckbox").is(":checked"))
            {
            }
            else
            {
                $(".approve_button").attr("disabled","disabled");
            }
        }
        
    };

    $scope.backtohome = function()
    {
      setTimeout(function(){
        $("#alert-approve-success").removeClass("hide");
        setTimeout(function(){
            $("#alert-approve-success").addClass("hide");
        },4000);
        $(".mail-list-item").find(".mail-list-expanded").css('display','none'); 
      });
       
      //window.location.reload("http://localhost/SPRS-html/#");
    };
    
    $scope.checkAll = function(source)
    {
        if($(".childCheckbox").is(":checked")){
        $(".childCheckbox").prop("checked",false);
        $(".approve_button").attr("disabled","disabled");
        }else{
        $(".childCheckbox").prop("checked",true);
        $(".approve_button").removeAttr("disabled");
        }
    }
});


//Search Filter and Status Controller
app.controller("FilterController",function($scope,$element,$location){

 $scope.searchfilterby = function() {
    var filterval = $scope.selectedUser1;
    if (filterval != 'all' && filterval != '') {
        $(".mail-list-pane").find(".mail-list-item").each(function() {
            if ($(this).hasClass("mailstatus-"+filterval)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    } else {
        $(".mail-list-pane").find(".mail-list-item").show();
    }
};

$scope.accordion_dialog_toggle = function(event)
{
    console.log($("body").find(".app-table-in").attr("id"));
   
    $(".app-table-in").find(".accordion-container").removeClass("SelectedAccordion");
    $(event.target).parents(".accordion-container").addClass("SelectedAccordion");
    var accordion = $(".app-table-in").find(".SelectedAccordion");
    var accordionContent = accordion.next('.accordion-content');
    var accordionToggleIcon = accordion.children('.toggle-icon');
    var accordionToggleInfo = accordion.children('.toggle-info');

    $(".app-table-in").find(".accordion-container").find(".accordion-toggle").removeClass("open");

    $(".app-table-in").find(".accordion-container").find(".accordion-content").addClass("display-none");

    $(".app-table-in").find(".accordion-container").find(".toggle-icon").html("<i class='icon-plus-sign'></i>");
    $(".app-table-in").find(".accordion-container").find(".toggle-info").html("<span class='info-text'>Show Details</span>");
    // toggle accordion link open class
    // toggle accordion content
    if($(".app-table-in").find(".SelectedAccordion").find(".accordion-content").hasClass("display-block"))
    {
        $(".app-table-in").find(".SelectedAccordion").find(".toggle-icon").html("<i class='icon-plus-sign'></i>");
        $(".app-table-in").find(".SelectedAccordion").find(".accordion-content").removeClass("display-block");
        $(".app-table-in").find(".SelectedAccordion").find(".accordion-content").addClass("display-none");    
    }        
    else
    {
        $(".app-table-in").find(".SelectedAccordion").find(".toggle-icon").html("<i class='icon-minus-sign'></i>");
        $(".app-table-in").find(".SelectedAccordion").find(".accordion-content").removeClass("display-none");
        $(".app-table-in").find(".SelectedAccordion").find(".accordion-content").addClass("display-block");    
    }
	
	if($("body").hasClass("certifications"))
	{
        if ($(".content-wrapper").find(".certifications").find(".vertical-topalign").hasClass("hide")) {
    		$(".content-wrapper").find(".certifications").find(".access-info-table").removeClass("hide");
    		$(".content-wrapper").find(".certifications").find(".access-not-found").addClass("hide");
        }
        else {
            return false;
        }
	}
    
};

$scope.complete_access = function(event)
{
	
	$location.url("/");
	
	setTimeout(function(){
		$("#alert-access-success").removeClass("hide");
		setTimeout(function(){
			$("#alert-access-success").addClass("hide");
			$("#apps").find(".mail-list-expanded").hide();
		},2500);
	},500);
}

$scope.enableallc = function(event)
{
	$(".content-wrapper").find(".certifications").find(".optionC-text").addClass("active");
	$(".content-wrapper").find(".certifications").find(".submit_button").removeAttr("disabled","disabled");
}

$scope.showalertsuccess = function(event)
{
	$(".content-wrapper").find(".certifications").find(".access-info-table").addClass("hide");
	$(".content-wrapper").find(".certifications").find(".vertical-topalign").removeClass("hide");
    $(".content-wrapper").find(".certifications").find(".accordion .status-icon").attr("src","images/icon_status-full.png");
	setTimeout(function(){
		$(".content-wrapper").find(".certifications").find(".vertical-topalign").addClass("hide");
		$(".content-wrapper").find(".certifications").find(".access-not-found").removeClass("hide");
		$(".content-wrapper").find(".certifications").find(".dlt-row").removeClass("active");

	},2800);
	$(".content-wrapper").find(".certifications").find(".complete_button").removeAttr("disabled","disabled");
}
$scope.showcertification_table = function(event) {
    if ($(".content-wrapper").find(".certifications").find(".vertical-topalign").hasClass("hide")) {
        $("body.certifications").find(".content-wrapper").find(".dlt-row").removeClass("active");
        $(event.target).parent().addClass("active");
        $(".content-wrapper").find(".certifications").find(".access-info-table").removeClass("hide");
        $(".content-wrapper").find(".certifications").find(".access-not-found").addClass("hide");
    } else {
        return false;
    }
};

$scope.showapp_table = function(event) {
    $("body.my-access").find(".dlt-row").removeClass("active");
    $(event.target).parent().addClass("active");
    $(".access-not-found").addClass("hide");
    $(".access-info-table").removeClass("hide");
};

$scope.readmoretext = function() {
    $(".remaining_text").show();
    $(".read_more").hide();
    $(".less_more").show();
};

$scope.lessmoretext = function() {
    $(".remaining_text").hide();
    $(".read_more").show();
    $(".less_more").hide();
};

$scope.statusby = function() {
    var statusval = $scope.selectedUser2;
    if (statusval != '') {
        $(".mail-list-pane").find(".mail-list-item").each(function() {
            console.log($(this));
            if ($(this).hasClass("mailstatus-"+statusval)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    } else {
        $(".mail-list-pane").find(".mail-list-item").show();
    }
};

});

//Tab Controller
app.controller("TabController",function($scope,$location)
{
	$scope.max = 4;
	$scope.selectedIndex = 0;
	$scope.thirdLocked = true,
	$scope.fourthLocked = true,
	$scope.fifthLocked = true,
	$scope.selectedval = '';
	$scope.selectedaccess = '';
	
	$scope.myDate = new Date();
	$scope.myEndDate = new Date();
	$scope.prevTab = function(index){
		$scope.selectedIndex = 0;
	};
	
	$scope.gotofirsttab = function(){
		$scope.selectedIndex = 0;
        $(".next_button").removeClass("hide");
        $(".add_to_briefcase_button").addClass("hide");
        $(".submit_briefcase_button").addClass("hide");
        $(".raise_briefcase_button").addClass("hide");
        $(".cancel_briefcase_button").addClass("hide");
        $(".start_over_button").addClass("hide");
        $(".next_button").removeAttr("disabled");
	};
	$scope.editsecondtab = function(){
        $scope.selectedIndex = 1;
        $(".next_button").removeClass("hide");
        $(".add_to_briefcase_button").addClass("hide");
        $(".submit_briefcase_button").addClass("hide");
        $(".raise_briefcase_button").addClass("hide");
        $(".cancel_briefcase_button").addClass("hide");
        $(".start_over_button").addClass("hide");
        $(".next_button").removeAttr("disabled");
	};
    $scope.editthirdtab = function(){
        $scope.selectedIndex = 2;
        $(".next_button").removeClass("hide");
        $(".add_to_briefcase_button").addClass("hide");
        $(".submit_briefcase_button").addClass("hide");
        $(".raise_briefcase_button").addClass("hide");
        $(".cancel_briefcase_button").addClass("hide");
        $(".start_over_button").addClass("hide");
        $(".next_button").removeAttr("disabled");
    };
	
	$scope.$watch('selectedIndex', function(current, old){
		if(current == 2 || current == 1 || current == 0)
		{
			console.log($(".md-tab").eq(current).hasClass("md-visited"));
			if($(".md-tab").eq(current).hasClass("md-visited")){
				$(".next_button").removeClass("hide");
				$(".next_button").removeAttr("disabled");	
			}
			$(".add_to_briefcase_button").addClass("hide");
			$(".submit_briefcase_button").addClass("hide");
			$(".raise_briefcase_button").addClass("hide");
			$(".cancel_briefcase_button").addClass("hide");
			$(".start_over_button").addClass("hide");
            $(".number-tabs md-tab-content").each(function(i) {
                if (i>=2) {
                    $(this).css("height",$(window).height() - parseInt($("#header").height() + $(".top-bg").height() + $(".md-tab-actions").height()));
                }
            });
            $('.number-tabs md-tab-content').perfectScrollbar();
			//
		}
		else if(current == 3)
		{
			if($(".summary_work_role_selection").find("span").html() == 'Regions')
			{
				$(".summary-wrap").find(".summary_content_access").parents("tr").addClass("hide");
				$(".summary-wrap").find(".summary_special_content_access").parents("tr").addClass("hide");
				$(".summary-wrap").find(".summary_special_environment").parents("tr").addClass("hide");
				$(".summary-wrap").find(".summary_database").addClass('hide');
				$(".summary-wrap").find(".summary_environments").addClass('hide');
				$(".summary-wrap").find(".summary_linx_access").addClass('hide');
				$(".summary-wrap").find(".summary_departments_content").addClass('hide');
			}
			else
			{
				
			}
			
			
			$(".next_button").addClass("hide");
			$(".add_to_briefcase_button").removeClass("hide");
			$(".submit_briefcase_button").addClass("hide");
			$(".raise_briefcase_button").addClass("hide");
			$(".cancel_briefcase_button").addClass("hide");
			$(".start_over_button").removeClass("hide");
		}
		
		if(current != 0)
			$(".md-tab").eq(old).addClass("md-visited");
    });
	
	$scope.raiserequest = function(){
		window.location.reload();
	}
	
	$scope.nextTab = function() {
		var index = ($scope.selectedIndex == $scope.max) ? 0 : $scope.selectedIndex + 1;
		$scope.selectedIndex = index;
		if(index == '1')
		{
			setTimeout(function(){
				var user_val = $(".requestOthersDiv").find("input").val();
				$(".name-selection").html(user_val);
			});
		}
		else if(index == '2')
		{
			$scope.thirdLocked = false;
			var search_value = $(".access_search_tab").val();
			
			if(search_value == 'Data Manager')
			{
				setTimeout(function(){
					$(".data-accessBoard").addClass("hide");
					$(".application_selection").addClass("hide");
					$(".work_role_selection").removeClass("hide");
					$(".read_confidential_info").addClass("hide");
					$(".top-alert").addClass("hide");
					$(".environment_selection").removeClass("hide");
					$(".access-SpecialCheckbox").removeClass("hide");
					$(".level_access").removeClass("hide");
					$("#work_Regions").addClass("hide");
					$("#organization_Access").addClass("hide");
					$('#multiselect').multiselect();
				},400);
			}
			$(".next_button").removeClass("hide");
			$(".add_to_briefcase_button").addClass("hide");
			$(".submit_briefcase_button").addClass("hide");
			$(".raise_briefcase_button").addClass("hide");
			$(".cancel_briefcase_button").addClass("hide");
			$(".start_over_button").addClass("hide");
		}
		else if(index == '3')
		{
			$scope.fourthLocked = false;
			var user_name = $(".name-selection").html();
			var work_role = $(".work_roles_selected").html();
			var content_justification = $(".form_justication_content").val();
			var content_access = [];
			var radio_content_access = [];
			var special_content_access = [];
			var summary_Work_regions = [];
			if(work_role == 'Regions')
			{
				$(".summary-wrap").find(".user_name_selection").find("span").html(user_name);
				$(".summary-wrap").find(".summary_work_role_selection").find("span").html(work_role);
				$(".summary-wrap").find(".summary_content_justification").html(content_justification);
				
				  $(".accessregion_work_region").find(".col-right").find("#acc_workRegionmultiselect_to").find("option").each(function(){
					 summary_Work_regions.push($(this).text());
				});
				$(".summary_work_regions").find(".summary_content_work_Regions").html(summary_Work_regions.join(','));
				$(".summary-wrap").find(".summary_content_access").parents("tr").addClass("hide");
				$(".summary-wrap").find(".summary_special_content_access").parents(".summary_special_content_access_tr").addClass("hide");
				$(".summary-wrap").find(".summary_special_environment").parents(".summary_special_environment_tr").addClass("hide");
				$(".summary-wrap").find(".summary_database").addClass('hide');
				$(".summary-wrap").find(".summary_environments").addClass('hide');
				$(".summary-wrap").find(".summary_linx_access").addClass('hide');
				$(".summary-wrap").find(".summary_departments_content").addClass('hide');
				$(".next_button").addClass("hide");
				$(".add_to_briefcase_button").removeClass("hide");
				$(".start_over_button").removeClass("hide");
				$(".agree_term_alert").addClass("hide");
				
			}
			else
			{
				console.log($(".access-innerCheckbox").find(".access_inner"));
				$(".access-innerCheckbox").find(".access-inner").each(function(){
					console.log($(this));
					if($(this).hasClass("md-checked"))
					{
						content_access.push($(this).find(".md-label").find("span").html());
					}
				});
				$(".access-radioButton").find(".form_content_access").each(function(){
					console.log($(this));
					if($(this).hasClass("md-checked"))
					{
						radio_content_access.push($(this).find(".md-label").find("span").html());
					}
				});
				$(".access-SpecialCheckbox").find(".specialcontent_checkbox").each(function(){
					console.log($(this));
					if($(this).hasClass("md-checked"))
					{
						special_content_access.push($(this).find(".md-label").find("span").html());
					}
				});
				$(".level_access").find(".linx_level_access").each(function(){
					if($(this).hasClass("md-checked"))
					{
						special_content_access.push($(this).find(".md-label").find("span").html());
					}
				});
				var special_environment = $(".specialEnvironment").find(".md-select-value").find(".md-text").html();
				var inner_content_access = content_access.join(',');
				var radio_inner_content_access = radio_content_access.join(',');
				var summary_special_content_access = special_content_access.join(',');
				$(".summary-wrap").find(".user_name_selection").find("span").html(user_name);
				$(".summary-wrap").find(".summary_work_role_selection").find("span").html(work_role);
				$(".summary-wrap").find(".summary_content_justification").html(content_justification);
				$(".summary-wrap").find(".summary_content_access").html(radio_inner_content_access+" "+inner_content_access);
				$(".summary-wrap").find(".summary_special_content_access").html(summary_special_content_access);
				$(".summary-wrap").find(".summary_special_environment").html(special_environment);
				$(".summary_work_regions").find(".summary_content_work_Regions").addClass("hide");
				$(".next_button").addClass("hide");
				$(".add_to_briefcase_button").removeClass("hide");
				$(".submit_briefcase_button").addClass("hide");
				$(".raise_briefcase_button").addClass("hide");
				$(".cancel_briefcase_button").addClass("hide");
				$(".start_over_button").removeClass("hide");
			}
			
		}
		else if(index == '4')
		{
			$scope.fifthLocked = false;
			var user_name = $(".name-selection").html();
			$(".briefcase_list").find(".brief_user_name").html(user_name);
			$(".submit_briefcase_button").removeClass("hide");
			$(".raise_briefcase_button").removeClass("hide");
			$(".cancel_briefcase_button").removeClass("hide");
			setTimeout(function(){
				$(".briefcase_list").find(".alert-success").hide(300);
				$(".submit_briefcase_button").removeAttr("disabled");
				$(".raise_briefcase_button").removeAttr("disabled");
				$(".cancel_briefcase_button").removeAttr("disabled");
			},2500);
			$(".submit_briefcase_button").removeClass("hide");
			$(".raise_briefcase_button").removeClass("hide");
			$(".cancel_briefcase_button").removeClass("hide");
			$(".start_over_button").addClass("hide");
			$(".add_to_briefcase_button").addClass("hide");
		}
		$(".next_button").attr("disabled","disabled");
	};
	
	
	$scope.showaddnewicon = function(event){
		var selectpri = $scope.selectPrevileges;
		if(selectpri != '')
		{
			$scope.selectDepartment = 'Finance';
			$scope.selectWorkrole = 'Primary Analyst';
			$(".addnewiconbutton").removeClass("hide");
		}
		else
		{
			$(".addnewiconbutton").addClass("hide");
		}
		
	};
	
	$scope.searchworkroles = function(event){
		console.log(event.target);
		var work_role = $(".search-wrapper").find("input").val();
		if(work_role == 'Data Manager')
		{
			$(".display_results").removeClass("hide");

		}
		else
		{
			$(".display_results").addClass("hide");
		}
		console.log(work_role);
	};
	
	$scope.cloneselectaccess = function(){ 
		var anotherselect = $(".application_access_board_clone").removeClass("hide");
		$(".addnewiconbutton").addClass("hide");
		
	};
	
	$scope.changecontentAccess = function(item)
	{
		console.log(item);
		if (item.contentAccess == "Read/Write Access") {
		  $(".access-innerCheckbox").find(".access-inner").each(function(){
			$(this).removeAttr("disabled");
		  });
		  
		}
	};
	
	$scope.submitbriefcase = function(){
		$location.url('/');
		setTimeout(function(){
			$("#alert-briefcase-success").removeClass("hide");
			$("#apps").find(".mail-list-expanded").hide();
			setTimeout(function(){
				$("#alert-briefcase-success").addClass("hide");
			},2500);
		},500);
		
	};
	
	$scope.cancelrequest = function(){
		$location.url('/');
		setTimeout(function(){
			$("#apps").find(".mail-list-expanded").hide();
		},500);
	};
	
	
	
	$scope.enablebriefcasebutton = function(event){
		if($(event.target).val() != '')
		{
			$(".add_to_briefcase_button").removeAttr("disabled");
			$(".start_over_button").removeAttr("disabled");
		}
		else
		{
			$(".add_to_briefcase_button").attr("disabled","disabled");
		}
	};
	
	$scope.checkagree = function(item)
	{
		if(item.agreeterms)
		{
			$(".next_button").removeAttr("disabled");
		}
	};
	
	$scope.enterjustification = function(){
		if($(".agreeterms").hasClass("hide"))
		{
			
			if($(event.target).val() != '')
			{
				$(".next_button").removeAttr("disabled");
			}
			else
			{
				$(".next_button").attr("disabled","disabled");
			}
		}
	};
	
	$scope.changeworkrole = function()
	{
		
		$(".next_button").removeAttr("disabled");
		setTimeout(function(){
			var accesscategory = $scope.selectedAccess;
			var selectedwork_role = $scope.selectedworkRole;
			var selectedapplication = $scope.selectedApplication;
			if(selectedwork_role != '')
			{
				var selected_val = selectedwork_role;
				$(".data-accessBoard").addClass("hide");
				$(".application_selection").addClass("hide");
				$(".work_role_selection").removeClass("hide");
				$(".read_confidential_info").addClass("hide");
				$(".top-alert").addClass("hide");
				$(".environment_selection").removeClass("hide");
                $(".access-SpecialCheckbox").removeClass("hide");
				$(".level_access").removeClass("hide");
                $(".summary_work_regions").addClass("hide");
				$("#work_Regions").addClass("hide");
				$("#organization_Access").addClass("hide");
				$('#multiselect').multiselect();
			}
			else if(selectedapplication != '')
			{
				var selected_val = selectedapplication;
				$(".data-accessBoard").removeClass("hide");
				$(".application_selection").removeClass("hide");
				$(".work_role_selection").addClass("hide");
				$(".environment_selection").addClass("hide");
				$(".level_access").addClass("hide");
				$("#department_Section").addClass("hide");
				$("#work_Regions").removeClass("hide");
				$("#organization_Access").removeClass("hide");
				$("#workRegionmultiselect").multiselect();
				$("#organizationAccessmultiselect").multiselect();
			}
			$(".form-data-work-roles").find(".work_roles_selected").html(accesscategory+" : "+ selected_val);
		},1800);
		
	};
	
	$scope.changeapplication = function(){
		$(".next_button").removeAttr("disabled");
		setTimeout(function(){
			var accesscategory = $scope.selectedAccess;
			var selectedwork_role = $scope.selectedworkRole;
			var selected_application = $scope.selectedApplication;
			if(selected_application != '')
			{
				var selected_val = selected_application;
				$(".data-accessBoard").removeClass("hide");
				$(".application_selection").removeClass("hide");
				$(".work_role_selection").addClass("hide");
				$(".environment_selection").addClass("hide");
				$(".level_access").addClass("hide");
				$("#department_Section").addClass("hide");
				$("#work_Regions").removeClass("hide");
                $(".summary_work_regions").addClass("hide");
				$("#organization_Access").removeClass("hide");
				$("#workRegionmultiselect").multiselect();
				$("#organizationAccessmultiselect").multiselect();
			}
			$(".form-data-work-roles").find(".work_roles_selected").html(accesscategory+" : "+ selected_val);
		},1800);
	}
	
	$scope.accesscategory = function(){
		if($scope.selectedAccess == 'Work Roles')
		{
			$(".work-role").removeClass("hide");
			$(".application-access").removeClass("hide");
			$(".alert-warning").removeClass("hide");
			$(".level_access").removeClass("hide");
			$(".access-radioButton").removeClass("hide");
			$(".read_confidential_info").removeClass("hide");
			$(".access-SpecialCheckbox").removeClass("hide");
			$(".specialEnvironment").parents(".form-category").removeClass("hide");
			$(".data-accessBoard").removeClass("hide");
			$(".application_selection").removeClass("hide");
			$(".work_role_selection").removeClass("hide");
			$(".environment_selection").removeClass("hide");
			$(".summary_work_regions").addClass("hide");
			$(".level_access").removeClass("hide");
			$("#department_Section").removeClass("hide");
			$("#work_Regions").removeClass("hide");
			$("#organization_Access").removeClass("hide");
			if($(".application-access").hasClass("hide"))
			{
			}
			else
			{
				$(".application-access").addClass("hide");
			}
		}
		else if($scope.selectedAccess == 'Applications')
		{
			$(".application-access").removeClass("hide");
			$(".work-role").removeClass("hide");
			$(".work-role").removeClass("hide");
			$(".application-access").removeClass("hide");
			$(".alert-warning").removeClass("hide");
			$(".level_access").removeClass("hide");
			$(".access-radioButton").addClass("hide");
			$(".read_confidential_info").removeClass("hide");
            $(".access-SpecialCheckbox").addClass("hide");
            $(".access-SpecialCheckbox").parent(".wb-content").addClass("hide");
            $(".normal_work_region").removeClass("hide");
			$(".middle_alert").addClass("hide");            
			$(".specialEnvironment").parents(".form-category").addClass("hide");
			$(".data-accessBoard").removeClass("hide");
			$(".application_selection").removeClass("hide");
			$(".work_role_selection").removeClass("hide");
			$(".environment_selection").removeClass("hide");
            $(".accessregion_work_region").addClass("hide");
			$(".level_access").removeClass("hide");
			$("#department_Section").removeClass("hide");
			$("#work_Regions").removeClass("hide");
			$("#organization_Access").removeClass("hide");
			if($(".work-role").hasClass("hide"))
			{
			}
			else
			{
				$(".work-role").addClass("hide");
			}
		}
		else if($scope.selectedAccess == 'Regions')
		{
			
			$(".next_button").removeAttr("disabled");
			$(".work-role").addClass("hide");
			$(".application-access").addClass("hide");
			$(".alert-warning").addClass("hide");
			$(".top-alert").removeClass("hide");
			$(".level_access").addClass("hide");
			$(".access-radioButton").addClass("hide");
			$(".read_confidential_info").addClass("hide");
			$(".access-SpecialCheckbox").addClass("hide");
			$(".access-SpecialCheckbox").parent().addClass("hide");
			$(".specialEnvironment").parents(".form-category").addClass("hide");
			$(".data-accessBoard").addClass("hide");
			$(".application_selection").addClass("hide");
			$(".work_role_selection").addClass("hide");
			$(".environment_selection").addClass("hide");
			$(".level_access").addClass("hide");
			$("#department_Section").addClass("hide");
			$("#work_Regions").removeClass("hide");
			$(".agreeterms").addClass("hide");
            $(".accessregion_work_region").removeClass("hide");
			$("#organization_Access").addClass("hide");
			$(".normal_work_region").addClass("hide");
			$("#acc_workRegionmultiselect").multiselect();
			setTimeout(function(){
				
				$(".form-data-work-roles").find(".work_roles_selected").html($scope.selectedAccess);
			},1800);
		}
		
	};
});


app.config(function($mdDateLocaleProvider) {
  $mdDateLocaleProvider.formatDate = function(date) {
    return moment(date).format('MMMM D,YYYY');
  };
});

// Dialog Controller

app.controller("DemoCtrl", function($mdDialog) {
    var self = this;
    self.simulateQuery = false;
    self.isDisabled    = false;
    self.repos         = loadAll();
    self.querySearch   = querySearch;
    self.selectedItemChange = selectedItemChange;
    self.searchTextChange   = searchTextChange;
    self.openDialog = function($event) {
      $mdDialog.show({
        controller: DialogCtrl,
        controllerAs: 'ctrl',
        templateUrl: 'shared/dialog/approved-dialog.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: $event,
        clickOutsideToClose:true
      })
    },

    self.openDialogMailApproved = function($event) {
      $mdDialog.show({
        controller: DialogCtrl,
        controllerAs: 'ctrl',
        templateUrl: 'shared/dialog/mail-approved-dialog.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: $event,
        clickOutsideToClose:true
      })
    },

    self.openwarnDialog = function($event)
    {
       $mdDialog.show({
        controller: DialogCtrl,
        controllerAs: 'ctrl',
        templateUrl: 'shared/dialog/warn.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: $event,
        clickOutsideToClose:true
      })     
    },

    self.userInfoTblDialog = function($event)
    {
       $mdDialog.show({
        controller: DialogCtrl,
        controllerAs: 'ctrl',
        templateUrl: 'shared/dialog/user-table-info.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: $event,
        clickOutsideToClose:true
      })     
    },

    self.reviewAccessDialog = function($event)
    {
       $mdDialog.show({
        controller: DialogCtrl,
        controllerAs: 'ctrl',
        templateUrl: 'shared/dialog/review-access-dialog.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: $event,
        clickOutsideToClose:true
      })     
    }

    function querySearch (query) {
      var results = query ? self.repos.filter( createFilterFor(query) ) : self.repos,
          deferred;
      if (self.simulateQuery) {
        deferred = $q.defer();
        $timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
        return deferred.promise;
      } else {
        return results;
      }
    }
    function searchTextChange(text) {
      console.log('Text changed to ' + text);
    }
    function selectedItemChange(item) {
		console.log(item);
		if(item.value != '')
		{
			$(".next_button").removeAttr("disabled");
		}
		else
		{
			$(".next_button").attr("disabled","disabled");
		}
		console.log('Item changed to ' + JSON.stringify(item));
    }
    /**
     * Build `components` list of key/value pairs
     */
    function loadAll() {
      var repos = [
        {
          'name'      : 'Sam Smith',
          // 'url'       : 'https://github.com/angular/angular.js',
        },
        {
          'name'      : 'Sally Jones',
        },
        {
          'name'      : 'Sal Johson',
          
        },
        {
          'name'      : 'Susan McCarthy',

        },
        {
          'name'      : 'Sidney Clark',
        }
      ];
      return repos.map( function (repo) {
        repo.value = repo.name.toLowerCase();
        return repo;
      });
    }
    /**
     * Create filter function for a query string
     */
    function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);
      return function filterFn(item) {
        return (item.value.indexOf(lowercaseQuery) === 0);
      };
    }

});

function DialogCtrl ($timeout, $q, $scope, $mdDialog) {
    var self = this;
    // list of `state` value/display objects
    //self.states        = loadAll();
    //self.querySearch   = querySearch;
    // ******************************
    // Template methods
    // ******************************
    self.cancel = function($event) {
      $mdDialog.cancel();
    };
    self.finish = function($event) {
      $mdDialog.hide();
    };
}