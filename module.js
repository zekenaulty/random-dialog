/* developed on phone using spck editor */


//shorthand for checking for valid variable
window['is'] = function(n) {
  try {
    return n === undefined || n === null ? false : true;
  } catch (e) {
    return false;
  }
};

let baseRef = '';
//https://zekenaulty.github.io/random-dialog
if(!location.href.startsWith('https://localhost') && !location.href.startsWith('http://localhost')){
  //baseRef = 'https://zekenaulty.github.io/random-dialog/';
} else{
  //baseRef = 'http://localhost:7700/';
}

/*

    because of the loose coupling between components we need a reliable means to define events
    to be used by: $broadcast, $emit, $on, and channels

*/


//this is reminding me a bit of c/c++, but we need these #define WIN32_LEAN_AND_MEAN

//CHANNELS
const ERROR_SERVICE = 'ERROR_SERVICE';
const SESSION_SERVICE = 'SESSION_SERVICE';
const ALERT_FACTORY = 'ALERT_FACTORY';
const MESSAGE_FACTORY = 'MESSAGE_FACTORY';
const MODAL_FACTORY = 'MODAL_FACTORY';



//Events
const EVENT_RFERESHED = 'REFRESHED';
const EVENT_SHOW = 'SHOW';
const EVENT_HIDE = 'HIDE';
const EVENT_REGISTER = 'REGISTER';
const EVENT_RESET = 'RESET';
const EVENT_FAILED = 'FAILED';
const EVENT_SUCCEEDED = 'SUCCEEDED';
const EVENT_HTTP_ERROR = 'HTTP_ERROR';
const EVENT_UPDATED = 'UPDATED';
const EVENT_LOGIN = 'LOGIN';
const EVENT_INVALID = 'INVALID';

//query types
const QUERY_STATE = 'QUERY_STATE';


//create module
(function(a) {
  var app = a.module("rd", []);
})(angular);

//services & factories & directives


//compile directive 
(function(a) {
  'use strict';
  a.module('rd').directive('compile', function($compile) {
    // directive factory creates a link function
    return function(scope, element, attrs) {
      element.html(attrs.compile);
      $compile(element.contents())(scope);

      scope.$watch(
        function(scope) {
          return attrs.compile;
        },
        function(value) {
          element.html(value);
          $compile(element.contents())(scope);
        }
      );

    };
  });
})(window.angular);
//end compile directive


//channels provides simple module level communication 
(function(a) {
  'use strict';
  a.module('rd').service('channels', function() {
    var root = this;

    root.channels = {}; //dictionary of channels

    //isolated object builder
    function Channel(name) {
      let n = this;

      n.name = name; //this name is used to isolate the event communication channel
      n.events = {}; //dictionary of events

      n.raise = function(event) {
        console.info(n.name + ", " + event);
        var e = n.events[event];
        if (is(e)) {
          if (is(e.listeners) && Array.isArray(e.listeners) && e.listeners.length > 0 && is(e.dispatch)) {
            //go to the next stage and exclude the event from the arguments
            e.dispatch.apply(this, Array.prototype.slice.call(arguments).slice(1));
            console.info("dispatched");
          }
        }
      };

      //isolated dispatcher constructor
      function EventDispatcher() {
        var ed = this;

        ed.listeners = [];

        ed.indexOf = function(callback) {
          let li = ed.listeners.findIndex(function(l) {
            return callback === l; //ref equality
          });

          return li;
        };

        ed.listeners.remove = function(callback) {
          if (!is(callback)) return;
          let li = ed.indexOf(callback);

          if (li > -1) {
            ed.listeners.splice(li, 1);
          }
        };

        ed.dispatch = function() {
          for (var i = 0; i < ed.listeners.length; i++) {
            var act = ed.listeners[i];

            if (is(act))
              act.apply(this, arguments);
          }
        };

        return ed;
      }

      n.register = function(event) {
        if (!is(n.events[event]))
          n.events[event] = new EventDispatcher();
      };

      return n;
    }

    root.register = function(name) {
      //console.info('register event channel - ' + name)
      var c = root.channels[name] = new Channel(name);
      var events = Array.prototype.slice.call(arguments).slice(1);

      if (is(events) && Array.isArray(events)) {
        for (var i = 0; i < events.length; i++) {
          if (is(events[i]) && events[i] !== '')
            c.register(events[i]);
        }
      }

      return root.channels[name];
    };

    //shorthand to raise event on a channel
    root.raise = function(channel, event) {
      //console.info('raise event on channel - ' + channel + ', ' + event)

      var c = root.channels[channel];

      if (!is(c))
        return;

      //go to the next stage exclude channel from arguments
      c.raise.apply(this, Array.prototype.slice.call(arguments).slice(1));
    };

    //shorthand to listen for an event on a channel
    root.listen = function(channel, event, callback) {
      //console.info('listen for event on channel - ' + channel + ', ' + event)

      var c = root.channels[channel];

      if (!is(c))
        return;

      var ed = c.events[event];

      if (!is(ed))
        return;

      //help the bad code, if we get any, the number of listeners on a channel should usually be pretty low and this should be low impact
      //ed.listeners.remove(callback);

      //add the listener
      ed.listeners.push(callback);
      //console.info('listener for event on channel - ' + channel + ', ' + event + ' added');

    };

    root.ignore = function(channel, event, callback) {
      var c = root.channels[channel];

      if (!is(c))
        return;

      var ed = c.events[event];

      if (!is(ed))
        return;

      ed.listeners.remove(callback);
    };

    root.isListening = function(channel, event, callback) {
      var c = root.channels[channel];

      if (!is(c))
        return false;

      var ed = c.events[event];

      if (!is(ed))
        return false;

      return ed.indexOf(callback) > -1;
    };

    return root;
  });
})(window.angular);
//end channels service


//loading service
(function(a) {
  'use strict';
  a.module('rd').service('loader', function() {
    var root = this;

    root.show = function() {
      $('#__loader_unq__').removeClass('loader-hide');
    };

    root.hide = function() {
      $('#__loader_unq__').addClass('loader-hide');
    };

    return root;
  });
})(window.angular);
//end loading service

//alerts factory
(function(a) {
  'use strict';
  a.module('rd').factory('alerts', function($timeout, channels) {
    var root = this;
    channels.register(
      ALERT_FACTORY,
      EVENT_SHOW
    );

    //all the real work happens here
    root.alert = function(type, content) {
      let classType = {};

      classType['alert'] = true;
      classType['alert-' + type] = true;
      classType['alert-dismissible'] = true;

      channels.raise(
        ALERT_FACTORY,
        EVENT_SHOW,
        {
          content: content,
          type: classType
        }
      );
    };

    root.primary = function(content) {
      root.alert('primary', content);
    };

    root.secondary = function(content) {
      root.alert('secondary', content);
    };

    root.success = function(content) {
      root.alert('success', content);
    };

    root.danger = function(content) {
      root.alert('danger', content);
    };

    root.warning = function(content) {
      root.alert('warning', content);
    };

    root.info = function(content) {
      root.alert('info', content);
    };

    root.light = function(content) {
      root.alert('light', content);
    };

    root.dark = function(content) {
      root.alert('dark', content);
    };

    //simple extender
    root.extend = function(target) {
      target.alerts = root;
    };

    return root;
  });
})(window.angular);
//end alerts factory

//modals factory
(function(a) {
  'use strict';
  a.module('rd').factory('modals', function($timeout, channels) {
    var root = this;

    channels.register(
      MODAL_FACTORY,
      EVENT_SHOW,
      EVENT_HIDE
    );

    root.show = function(params) {
      if (!is(params))
        return;

      if (!is(params.name))
        params.name = 'modal-' + Math.floor((Math.random() * 99999) + (Math.random() * 99999))

      if (!is(params.data))
        params.data = {};

      if (!is(params.showClose))
        params.showClose = true;

      if (!is(params.title) && !is(params.content) && !is(params.templateUrl))
        return;

      if (params.title === '' && params.template === '' && params.templateUrl === '')
        return;

      if (!is(params.buttons) || !Array.isArray(params.buttons))
        params.buttons = [];

      if (!is(params.cssClasses) || params.cssClasses === '')
        params.cssClasses = { "modal-dialog": true };

      if (!is(params.cssClasses["modal-dialog"]))
        params.cssClasses["modal-dialog"] = true;

      if (!is(params.closeText))
        params.closeText = 'Close';

      if (!is(params.options))
        params.options = { backdrop: 'static', keyboard: false, focus: true };

      console.log('boop');
      
      //send the data to the component
      channels.raise(
        MODAL_FACTORY,
        EVENT_SHOW,
        params
      );
    };

    //simple extender
    root.extend = function(target) {
      target.modals = root;
    };

    return root;
  });
})(window.angular);
//end modals factory


//messages factory
(function(a) {
  'use strict';
  a.module('rd').factory('messages', function($timeout, channels) {
    var root = this;
    channels.register(
      MESSAGE_FACTORY,
      EVENT_SHOW
    );

    //all the real work happens here
    root.message = function(type, content) {
      let classType = {};

      classType['alert'] = true;
      classType['alert-' + type] = true;
      classType['alert-dismissible'] = true;
      classType['carousel-item'] = true;

      channels.raise(
        MESSAGE_FACTORY,
        EVENT_SHOW,
        {
          content: content,
          type: classType
        }
      );
    };

    root.primary = function(content) {
      root.message('primary', content);
    };

    root.secondary = function(content) {
      root.message('secondary', content);
    };

    root.success = function(content) {
      root.message('success', content);
    };

    root.danger = function(content) {
      root.message('danger', content);
    };

    root.warning = function(content) {
      root.message('warning', content);
    };

    root.info = function(content) {
      root.message('info', content);
    };

    root.light = function(content) {
      root.message('light', content);
    };

    root.dark = function(content) {
      root.message('dark', content);
    };

    //simple extender
    root.extend = function(target) {
      target.messages = root;
    };

    return root;
  });
})(window.angular);
//end messages factory


//ajax this service provides a hook that will trigger the loader on the site, and wraps security token handling into each request
(function(a) {
  'use strict';
  a.module('rd').service('ajax', function($http, $log) {
    var root = this;

    root.runningRequests = 0;

    root._success = function(response) {
      if (root.runningRequests > 0)
        root.runningRequests--;

      return response; //maintain promise
    };

    root._error = function(response) {
      if (root.runningRequests > 0)
        root.runningRequests--;

      return response; //maintain promise
    };

    root._request = function(method, url, data, useToken) {
      root.runningRequests++; //track request count

      return $http({
        method: method,
        url: url
      }).then(
        root._success,
        root._error
      );
    };

    root.get = function(url, useToken) {
      return root._request('GET', url, undefined, useToken);
    };

    root.post = function(url, data, useToken) {
      return root._request('POST', url, data, useToken);
    };

    root.patch = function(url, data, useToken) {
      return root._request('PATCH', url, data, useToken);
    };

    root.put = function(url, data, useToken) {
      return root._request('PUT', url, data, useToken);
    };

    root.delete = function(url, data, useToken) {
      return root._request('DELETE', url, data, useToken);
    };

    root.dispatch = function(response, success, failure) {
      if (!is(response) && is(failure))
        failure(undefined);

      if (response.status < 200 || response.status > 299) {
        if (is(failure)) {
          failure(response);
          return;
        }
      }

      if (is(success)) {
        success(response);
      }
    };

    //simple extender
    root.extend = function(target) {
      target.ajax = root;
    };


  });
})(window.angular);
//end ajax service


//styles service
(function(a) {
  'use strict';
  a.module('rd').service('styles', function($timeout, session) {
    var root = this;

    root.CommonClasses = function(target) {
      root.addCommonClasses(target);
    };

    root.NavClasses = function(target) {
      root.addCommonClasses(target);
      root.addNav(target);
    };

    root.NavbarClasses = function(target) {
      root.addCommonClasses(target);
      root.addNav(target);
      root.addNavbar(target);
    };

    root.NavbarMenuClasses = function(target) {
      root.addCommonClasses(target);
      root.addNav(target);
      root.addNavbar(target);
      root.addDropdown(target);
    };

    root.Tab = function(target) {
      root.addCommonClasses(target);
      root.addNav(target);
    };

    root.TabPane = function(target) {
      root.addCommonClasses(target);
      root.addNav(target);
    };

    root.addCommonClasses = function(target) {
      target['active'] = false;
      target['disabled'] = false;
      target['border'] = false;
      target['border-top'] = false;
      target['border-right'] = false;
      target['border-bottom'] = false;
      target['border-left'] = false;
      target['border-0'] = false;
      target['border-top-0'] = false;
      target['border-right-0'] = false;
      target['border-bottom-0'] = false;
      target['border-left-0'] = false;
      target['rounded'] = false;
      target['rounded-top'] = false;
      target['rounded-right'] = false;
      target['rounded-bottom'] = false;
      target['rounded-left'] = false;
      target['rounded-circle'] = false;
      target['rounded-0'] = false;
      target['border-primary'] = false;
      target['border-secondary'] = false;
      target['border-success'] = false;
      target['border-danger'] = false;
      target['border-warning'] = false;
      target['border-info'] = false;
      target['border-light'] = false;
      target['border-dark'] = false;
      target['border-white'] = false;
      target['bg-primary'] = false;
      target['bg-secondary'] = false;
      target['bg-success'] = false;
      target['bg-danger'] = false;
      target['bg-warning'] = false;
      target['bg-info'] = false;
      target['bg-light'] = false;
      target['bg-dark'] = false;
      target['bg-white'] = false;
      target['text-primary'] = false;
      target['text-secondary'] = false;
      target['text-success'] = false;
      target['text-danger'] = false;
      target['text-warning'] = false;
      target['text-info'] = false;
      target['text-light'] = false;
      target['text-dark'] = false;
      target['text-muted'] = false;
      target['text-white'] = false;
      target['ml-auto'] = false;
      target['mr-auto'] = false;
    };

    root.addNavbar = function(target) {
      if (!is(target))
        target = {};

      target['navbar'] = false;
      target['navbar-light'] = false;
      target['navbar-dark'] = false;
      target['navbar-brand'] = false;
      target['navbar-toggler'] = false;
      target['navbar-toggler-icon'] = false;
      target['navbar-collapse'] = false;
      target['navbar-nav'] = false;
      target['navbar-expand'] = false;
      target['navbar-expand-sm'] = false;
      target['navbar-expand-md'] = false;
      target['navbar-expand-lg'] = false;
      target['navbar-expand-xl'] = false;
    };

    root.addNav = function(target) {
      if (!is(target))
        target = {};

      target['nav'] = false;
      target['nav-item'] = false;
      target['nav-link'] = false;
      target['nav-tabs'] = false;
      target['nav-pills'] = false;
      target['nav-fill'] = false;
      target['nav-justified'] = false;
      target['nav-justified'] = false;
      target['nav-justified'] = false;
    };

    root.addDropdown = function(target) {
      if (!is(target))
        target = {};

      target['dropleft'] = false;
      target['dropright'] = false;
      target['dropdown'] = false;
      target['dropdown-toggle'] = false;
      target['dropdown-menu'] = false;
      target['dropdown-item'] = false;
      target['dropdown-divider'] = false;
      target['dropdown-toggle-split'] = false;
      target['dropdown-menu-right'] = false;

    };

    root.addTab = function(target) {

    };

    root.addTabPane = function(target) {
      target['tab-pane'] = false;
      target['tab-content'] = false;
    };

  });
})(window.angular);
//end styles service


//errors service, adds errors to alerts pane
(function(a) {
  'use strict';
  a.module('rd').service('errors', function(alerts) {
    var root = this;

    const SPC = '&nbsp;';

    root.extend = function(target, name) {
      target.source = name;
      target.errors = {
        owner: target,
        heading: function(msg) {
          if (!is(msg) || msg == '')
            return;

          return '<span class="h5">' + msg + '</span>';
        },
        body: function(msg) {
          if (!is(msg) || msg == '')
            return;

          return '<span class="h5">' + msg + '</span>';
        },
        httpCode: function(httpResponse) {
          if (!is(httpResponse))
            return;

          return '<strong><em><abbr title="' + httpResponse.statusText + '">(' + httpResponse.status + ')</abbr></em></strong>';
        },
        http: function(httpResponse, msg = '') {
          if (!is(httpResponse))
            return;

          let s = this.heading(this.owner.source + SPC + this.httpCode(httpResponse));
          let m = this.body(msg)

          alerts.danger(s + SPC + m);
        }
      };

      return target;
    };

  });
})(window.angular);
//end errors service

//components


//base component
(function(a) {
  'use strict';
  a.module('rd').service('component', function(
    ajax,
    alerts,
    messages,
    modals,
    errors,
    channels
  ) {
    var root = this;

    root.extend = function(
      target,
      name,
      scope) {

      ajax.extend(target);
      alerts.extend(target);
      messages.extend(target);
      modals.extend(target);
      errors.extend(target, name);

      return target;
    };

  });
})(window.angular);


//alerts component
//this component should only be used once in the entire project
(function(a) {
  'use strict';

  function SystemAlertController(
    $scope,
    $timeout,
    channels,
    component) {
    var ctrl = component.extend(this, 'SystemAlert', $scope);

    ctrl.data = {
      alerts: [],
      active: null
    };

    ctrl.showAlert = function(params) {
      //console.info("show alert - params: " + params)
      if (!is(params))
        return;

      ctrl.data.alerts.push(params);
      ctrl.data.active = ctrl.data.alerts[0];
    };

    ctrl.closeAll = function() {
      ctrl.data.alerts = [];
    };

    ctrl.removeAlert = function() {
      if (ctrl.data.alerts.length > 1) {
        ctrl.data.active = null;
        ctrl.data.alerts.splice(0, 1);
        ctrl.data.active = ctrl.data.alerts[0];
      } else {
        ctrl.data.active = null;
        ctrl.data.alerts = [];
        ctrl.data.removing = false;
      }

      $timeout(function() {
        $scope.$apply();
      });
    };

    ctrl.$onInit = function() {
      //listen for new alerts
      channels.listen(
        ALERT_FACTORY,
        EVENT_SHOW,
        ctrl.showAlert);
    };

    ctrl.$onDestroy = function() {
      channels.ignore(
        ALERT_FACTORY,
        EVENT_SHOW,
        ctrl.showAlert);
    };
  }

  a.module('rd').component('systemAlert', {
    templateUrl: baseRef + 'components/alerts.html',
    controller: SystemAlertController
  });
})(window.angular);
//end base component


//messages, shows messages to the user in a carousel, new messages can be pushed through the messages channel
(function(a) {
  'use strict';
  //this component should only be used once in the entire project
  function SystemMessageController($scope, $timeout, channels, component) {
    var ctrl = component.extend(this, 'SystemMessage', $scope);

    ctrl.SUMMARY = 0;
    ctrl.VIEW = 1;

    ctrl.data = {
      mode: ctrl.SUMMARY,
      messages: []
    };

    ctrl.setMode = function(m) {

      if (m == ctrl.VIEW && ctrl.data.messages.length > 0) {
        ctrl.data.mode = ctrl.VIEW;
      } else if (m === ctrl.SUMMARY) {
        ctrl.data.mode = ctrl.SUMMARY;
      }
    };

    ctrl.showMessage = function(params, interval = undefined) {
      let idx = ctrl.data.messages.length;

      if (!is(params))
        return;

      if (idx === 0)
        params.type['active'] = true;

      ctrl.data.messages.push(params);

      //I don't trust this, because of basic race conditions, but we are going to give it a go
      //alternatly, we need to come up with a good id schema using a uuid/guid or random #
      if (is(interval)) {
        $timeout(function() {
          try {
            ctrl.removeMessage(idx);
          } catch (e) {
            $log.log(e);
          }
        }, interval);
      }
    };

    ctrl.closeAll = function() {
      ctrl.data.messages = [];
    };

    ctrl.data.removing = false;
    ctrl.removeMessage = function(idx) {
      if (ctrl.data.messages.length > 1) {
        //this is so bad; race race race
        let pop = function() {
          ctrl.data.messages.splice(idx, 1);
          ctrl.data.removing = false;
          $('#message-stack-carousel').off('slide.bs.carousel');
        };

        ctrl.data.removing = true; //poor man's lock
        $('#message-stack-carousel').on('slide.bs.carousel', pop);
        $('#message-stack-carousel').carousel('next');
      } else {
        ctrl.data.messages = [];
        ctrl.data.removing = false;
      }
    };

    ctrl.$onInit = function() {
      //listen for new messages
      channels.listen(
        MESSAGE_FACTORY,
        EVENT_SHOW,
        ctrl.showMessage);
    };

    ctrl.$onDestroy = function() {
      channels.ignore(
        MESSAGE_FACTORY,
        EVENT_SHOW,
        ctrl.showMessage);
    };
  }

  a.module('rd').component('systemMessage', {
    templateUrl: baseRef + 'components/messages.html',
    controller: SystemMessageController
  });
})(window.angular);


//component for modal dialogs, I was feeling snarky when I wrote this it seems
(function(a) {
  'use strict';
  //this component should only be used once in the entire project
  function SystemModalController($scope, $timeout, component, channels) {
    var ctrl = component.extend(this, 'SystemModals');

    ctrl.data = {
      modals: []
    };

    ctrl.showModal = function(params) {
      if (!is(params))
        return;

      var idx = ctrl.data.modals.length;

      channels.raise(
        MODAL_FACTORY,
        EVENT_REGISTER,
        idx);

      params.index = function() {
        var name = this.name;
        return ctrl.data.modals.findIndex(function(i) { return name === i.name; });
      };

      params.id = 'system-modal-' + idx;
      params.selector = '#' + params.id;

      Object.defineProperty(params, 'jq', {
        get: function() {
          return $(this.selector);
        }
      });

      ctrl.data.modals.push(params);

      ctrl[params.name] = params.data;

      function pop() {
        $timeout(function() {
          params.jq.modal(params.options);
        }, 250);
      }

      if (is(params.templateUrl) && params.templateUrl !== '') {
        $http({
          method: 'GET',
          url: params.templateUrl
        }).then(
          function(response) {
            params.content = response.data;
            pop();
          },
          function(response) {
            params.content = response.data;
            pop();
          }
        );
      } else {
        params.content = params.template;
        pop();
      }

    };

    ctrl.getEventArgs = function(item) {
      return {
        data: ctrl[item.name],
        close: function() {
          ctrl.removeModal(item);
        }
      };
    };

    ctrl.removeModal = function(item) {

      let idx = item.index();
      let m = ctrl.data.modals[idx];

      //run any needed callback code
      if (is(m.closeCallback)) {
        m.closeCallback();
      }

      //hide the thing
      m.jq.modal('hide');

      //remove the data
      $timeout(function() {
        ctrl.data.modals.splice(idx, 1);
      }, 250);

      //notify concerned parties
      channels.raise(
        MODAL_FACTORY,
        EVENT_HIDE,
        idx);

      //we want to ensure that the backdrop goes away, but only if we want it to
      //ignore the current modal and check all others for visibility
      var visibleModals = false;
      $('.modal').not(m.jq).each(function() {
        if ($(this).data('bs.modal')._isShown) {
          visibleModals = true;
          return false;
        }
      });

      if (!visibleModals) {
        $('body').removeClass('modal-open');
        $('.modal-backdrop').hide();
      }
    };

    ctrl.$onInit = function() {
      channels.listen(
        MODAL_FACTORY,
        EVENT_SHOW,
        ctrl.showModal);
    };

    ctrl.$onDestroy = function() {
      channels.ignore(
        MODAL_FACTORY,
        EVENT_SHOW,
        ctrl.showModal);
    };
  }

  a.module('rd').component('systemModal', {
    templateUrl: baseRef + 'components/modals.html',
    controller: SystemModalController,
    controllerAs: '$modal'
  });
})(window.angular);
/*
        -- this is an example of how to properly scope you data --

        1) do your best to give your model a unique name
        2) pass in a data template
        3) use $modal.{modal-name}.data-template-item
        4) assuming you've kept a local copy of your data model, you can write functions to use that model or in buttons you can use the data parameter

            ctrl.expModel = {
                value: 'this came from my data model'
            };

            modals.show({
                name: 'exp',
                data: ctrl.expModel, //this is meant to be slightly confusing so you can make the connections
                title: 'Expression Testing',
                template: '<form><label>Enter Data: </label><div><input type="text" ng-model="$modal.exp.value" class="form-control" /></div></form>',
                buttons: [{
                    classes: { "btn": true, "btn-danger": true },
                    text: '?',
                    callback: function (name, e) {
                        let msg = 'From ' + name + ': ' + ctrl.expModel.value + ' === ' + e.data.value + '?';
                        e.close();
                        alerts.danger(msg);
                    }
                }],
                showClose: false
            });

            modals.show({
                name: 'templateUrl',
                data: ctrl.expModel,
                title: 'Template URL',
                templateUrl: 'angular/templates/modals/example001.html',
                cssClasses: { "modal-lg": true },
                buttons: [{
                    classes: { "btn": true, "btn-danger": true },
                    text: '?',
                    callback: function (name, e) {
                        e.close();
                    }
                }],
                showClose: false
            });
            

*/
//end modal component 


//loading component
(function(a) {
  'use strict';

  function LoadingController($interval, $http, ajax) {
    var ctrl = this;

    ctrl.utility = {
      isLoading: function() {
        try {
          return $http.pendingRequests.length > 0 && ajax.runningRequests > 0;
        } catch (e) {
          return false;
        }
      },
      check: function() {
        if (ctrl.utility.isLoading() === false) {
          $('#__loader_unq__').addClass('loader-hide');
        } else {
          $('#__loader_unq__').removeClass('loader-hide');
        }
      }
    };
    ctrl.utility.check();
    $interval(ctrl.utility.check, 2000);
  }

  a.module('rd').component('loading', {
    templateUrl: baseRef + 'components/loading.html',
    controller: LoadingController
  });
})(window.angular);
//end loading component 

