(function () {

'use strict';
  angular.module('GenericCrud', ['restangular', 'ngRoute', 'ngAnimate', 'schemaForm'])

  .config(function($routeProvider, RestangularProvider, $locationProvider, $httpProvider) {
    // CSRF Support
    //$httpProvider.defaults.xsrfCookieName = 'csrftoken';
    //$httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';

    // This only works in angular 3!
    // It makes dealing with Django slashes at the end of everything easier.
    //$resourceProvider.defaults.stripTrailingSlashes = false;

    //$locationProvider.html5Mode(true).hashPrefix('!');


    $routeProvider.
      when('/', {
        controller:ListCtrl, 
        templateUrl:'./partials/list.html'
      }).
      when('/edit/:objectId', {
        controller:EditCtrl, 
        templateUrl:'./partials/detail.html',
        resolve: {
          object: function(Restangular, $route){
            return Restangular.one('poll', $route.current.params.objectId).get();
          }
        }
      }).
      when('/new', {controller:CreateCtrl, templateUrl:'./partials/detail.html'}).
      otherwise({redirectTo:'/'});
      
      RestangularProvider.setBaseUrl('http://127.0.0.1:8000/api/v1/');
      //#RestangularProvider.setDefaultRequestParams({ Authorization: 'token 4f847ad3e4b08a2eed5f3b54' })
      RestangularProvider.setRestangularFields({
        id: '_id.$oid'
      });
      
      RestangularProvider.setRequestInterceptor(function(elem, operation, what) {
        
        if (operation === 'put') {
          elem._id = undefined;
          return elem;
        }
        return elem;
      });
  });

function ListCtrl($scope, Restangular) {
   $scope.objects = Restangular.all("poll/").getList().$object;
}


function CreateCtrl($scope, $location, Restangular) {
  $scope.save = function() {
    Restangular.all('poll/').post($scope.object).then(function(object) {
      $location.path('/list');
    });
  }
}

function EditCtrl($scope, $location, Restangular, object, schemaForm) {
  var original = object;
  $scope.object = Restangular.copy(original);
  

  $scope.isClean = function() {
    return angular.equals(original, $scope.object);
  }

  $scope.destroy = function() {
    original.remove().then(function() {
      $location.path('/list');
    });
  };

  $scope.save = function() {
    $scope.object.put().then(function() {
      $location.path('/');
    });
  };

  $scope.schema = {
    type: "object",
    properties: {
      "question": {
                "type": "string",
                "required": true,
                "read_only": false,
                "label": "Question",
                "max_length": 100
            },
            "text_help": {
                "type": "string",
                "required": true,
                "read_only": false,
                "label": "Text help"
            },
            "pub_date": {
                "type": "datetime",
                "required": true,
                "read_only": false,
                "label": "Date published"
            },
            "status": {
                "type": "choice",
                "required": true,
                "read_only": false,
                "label": "Status",
                "choices": [
                    {
                        "value": 0,
                        "display_name": "Inactive"
                    },
                    {
                        "value": 1,
                        "display_name": "Active"
                    }
                ]
            },
            "is_draft": {
                "type": "boolean",
                "required": false,
                "read_only": false,
                "label": "Is draft",
                "help_text": "This flag to marking if poll is ready to publishing"
            }
    }
  };

  $scope.form = [
    "*",
    {
      type: "submit",
      title: "Save"
    }
  ];

  $scope.model = {};

}
})();
