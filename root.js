

//navbar component
(function(a) {
  'use strict';

  function NavbarController(
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
        title: vm.ipsum.sentence(1, 4),
        data:{},
        template: vm.ipsum.paragraph()
      });
    };
    vm.loader = function(){
      loader.show();
    };
    return vm;
  }

  a.module('rd').component('navbarInternal', {
    templateUrl: baseRef + '/components/navbar-internal.html',
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
    
    return vm;
  });


})(angular);
