var phonecatControllers = angular.module('phonecatControllers', []);

phonecatControllers.controller('PhoneListCtrl', ['$scope', '$http',
  function ($scope, $http, $element) {
    $element.class = "navigation-folded";

    $scope.class = "notfolded";

    $scope.init = function() {
            console.log();

            if ($(window)[0].innerWidth < 1280) {
                $("#apps").addClass("navigation-folded");
                $("#navigation").removeClass("notfolded").addClass("folded");
                $scope.class = 'folded';
            }
            setTimeout(function(){
                $("#apps").find(".mail-list-expanded").hide();
            },800);
        };
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
            if($(obj.target).hasClass("icons-plus-circle")){
                $(obj.target).parent(".md-button").addClass('expanded');

            }
            else
            {
                $(obj.target).parents(".md-layout-row").find(".layout-column").find(".md-button").addClass('expanded');
            }
        } else {
            $(obj.target).parents(".mail-list-item").find(".mail-list-expanded").addClass("not-expanded").removeClass('expanded').slideUp();
            if($(obj.target).hasClass("icons-plus-circle")){
                $(obj.target).parent(".md-button").removeClass('expanded');

            }
            else
            {
                $(obj.target).parents(".md-layout-row").find(".layout-column").find(".md-button").removeClass('expanded');
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

    $scope.mailsort = function(event){
        if($(event.target).parents(".sort-icon").hasClass("ascending-order")){
            $(event.target).parents(".sort-icon").addClass("descending-order");
            $(event.target).parents(".sort-icon").removeClass("ascending-order");
            var elems = $.makeArray($("#apps").find(".mail-list-item"));
            elems.sort(function(a, b) {
                return new Date( $(a).find(".time").text() ) < new Date( $(b).find(".time").text() );
            });
            $("#apps").find(".mail-list-pane").html(elems);
        }
        else
        {
            $(event.target).parents(".sort-icon").addClass("ascending-order");
            $(event.target).parents(".sort-icon").removeClass("descending-order");
            var elems = $.makeArray($("#apps").find(".mail-list-item"));
            elems.sort(function(a, b) {
                return new Date( $(a).find(".time").text() ) > new Date( $(b).find(".time").text() );
            });
            $("#apps").find(".mail-list-pane").html(elems);   
        }
    }; 
  }]);

phonecatControllers.controller('PhoneDetailCtrl', ['$scope', '$routeParams',
  function($scope, $routeParams) {
    $scope.phoneId = $routeParams.phoneId;
  }]);