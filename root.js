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
    ajax,
    channels) {
    var vm = this;

    vm.ipsum = new LoremIpsum();
    vm.alertMsg = function() {
      let css = [
        'info',
        'danger',
        'warning',
        'primary',
        'secondary'
        ];
      let idx = Math.floor(
        Math.random() * css.length
      );
      alerts.alert(
        css[idx],
        vm.ipsum.sentence(4, 14));
    };

    vm.modal = function() {
      modals.show({
        name: 'demo' + (Math.floor(Math.random() * 99999)),
        title: vm.ipsum.sentence(),
        data: {},
        template: vm.ipsum.paragraph(),
        buttons: [
          {
            classes: {
              "btn": true,
              "btn-info": true
            },
            text: 'New Theme',
            callback: vm.newTheme
          },
          {
            classes: {
              "btn": true,
              "btn-primary": true
            },
            text: 'New Modal',
            callback: vm.modal
        },
          {
            classes: {
              "btn": true,
              "btn-warning": true
            },
            text: 'Close Modal',
            callback: function(name, e) {
              e.close();
            }
        },
          {
            classes: {
              "btn": true,
              "btn-danger": true
            },
            text: 'Close All Modals',
            callback: modals.closeAll
        }],
        showClose: false
      });
    };

    vm.loader = function() {
      loader.show(4000);
    };

    vm.cards = function() {
      $rootScope.cards();
    };
    
    vm.newTheme = function(){
      channels.raise(THEME, EVENT_NEW_THEME);
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

    $scope.theme = 'darkly';
    $scope.baseRef = baseRef;
    $scope.cards = new Array();

    //alternative to using channels 
    $rootScope.cards = function() {
      let l = Math.floor(Math.random() * 6) + 1;
      l += Math.floor(Math.random() * 4) + 1;


      for (let i = 0; i < l; i++) {
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
