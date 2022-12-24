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

    vm.message = function(){
      messages.primary(vm.ipsum.sentence());
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
    
    $scope.header = 'Welcome';
    $scope.title = 'About random dialog...';
    $scope.body = 'found a card bug..';

    $scope.theme = 'darkly';
    $scope.baseRef = baseRef;
    $scope.cards = new Array();

    //alternative to using channels 
    $rootScope.cards = function() {
      let l = Math.floor(Math.random() * 6) + 1;
      l += Math.floor(Math.random() * 4) + 1;


      for (let i = 0; i < l; i++) {
        $scope.cards.splice(1, 0,
        {
          body: vm.ipsum.paragraph(),
          title: vm.ipsum.sentence()
          //header: vm.ipsum.sentence()
        });
      }

    };

    
    $scope.cards.splice(0,0,{
      header: 'Random-Dialog',
      title: 'About',
      body: `
      <p>This is a basic angularjs module used to wrap and bundle bootstrap layout and feedback integrations.</p>
      <p>Primarily intended to provide a "simple" way for angularjs apps to quickly layout and provide basic user input/output through a central viewport.</p>
      <h6>Features</h6>
      <ul class="tiny-text">
        <li>Bootswatch Theme(s)</li>
        <li>System Alerts</li>
        <li>Sytem Modals</li>
        <li>Loading Overlay</li>
        <li>Sytem Messages</li>
        <li>Ajax Subsystem</li>
        <li>Event Communication Channels</li>
      </ul>
      <p>Currently there is a bug with the message carousel...</p>
      `
    });
    

    $rootScope.cards();

    return vm;
  });


})(angular);
