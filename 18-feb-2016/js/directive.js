sprsApp.directive('mapAnimation', function($timeout) {
  return {
    restrict: 'EA',
    link: function(scope, element, attr) {

     $("body").click(function(){
      alert("tresdt");
     });

    }
  }
});