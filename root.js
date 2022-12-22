

//navbar component
(function(a) {
  'use strict';

  function NavbarController(
    $rootScope,
    $interval,
    $timeout,
    $http, 
    loader, 
    alerts, 
    messages, 
    modals,
    ajax) {
    var vm = this;

    vm.ipsum = new LoremIpsum();
    vm.alertMsg = function(){
      alerts.alert("info", vm.ipsum.sentence(4, 14));
    };
    
    vm.modal = function(){
      modals.show({
        title: vm.ipsum.sentence(),
        data:{},
        template: vm.ipsum.paragraph()
      });
    };
    
    vm.loader = function(){
      loader.show();
    };
    
    vm.cards = function(){
      $rootScope.cards();
    };
    
    return vm;
  }

  a.module('rd').component('navbarInternal', {
    templateUrl: 'components/navbar-internal.html',
    controller: NavbarController
  });
})(window.angular);
//end navbar




(function(a) {

  var app = a.module("rd");

  app.controller('root', function(
    $rootScope,
    $scope,
    $timeout,
    channels,
    alerts,
    messages,
    modals) {

    let vm = this;
    vm.ipsum = new LoremIpsum();
    
    $scope.baseRef = baseRef;
    $scope.cards = new Array();
    
    $rootScope.cards = function(){
      let l = Math.floor(Math.random() * 6) + 1;
      l += Math.floor(Math.random() * 4) + 1;

      
      for(let i = 0; i < l; i++){
        $scope.cards.splice(0, 0,
        {
          body: vm.ipsum.paragraph(),
          title: vm.ipsum.sentence()
          //header: vm.ipsum.sentence()
        });
      }

    };
    
    $rootScope.cards();
    
    return vm;
  });


})(angular);
