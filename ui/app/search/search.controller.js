/* global MLSearchController */
(function () {
  'use strict';

  angular.module('app.search')
    .controller('SearchCtrl', SearchCtrl);

  SearchCtrl.$inject = ['$scope', '$location', 'userService', 'MLSearchFactory', 'MLRest'];

  // inherit from MLSearchController
  var superCtrl = MLSearchController.prototype;
  SearchCtrl.prototype = Object.create(superCtrl);

  function SearchCtrl($scope, $location, userService, searchFactory, mlRest) {
    var ctrl = this;

    ctrl.option = 'all.xml';
    ctrl.options = ['all.xml', 'all2.xml']

    var mlSearch = searchFactory.newContext();

    superCtrl.constructor.call(ctrl, $scope, $location, mlSearch);

    ctrl.init();

    ctrl.initialize = function()
    {
      ctrl.getOptions();
    }

    ctrl.setSnippet = function(type) {
      mlSearch.setSnippet(type);
      ctrl.search();
    };

    ctrl.getOptions = function() {
      mlRest.queryConfig('', '')
        .then(function(res) {
          console.log("Options fetched");
          console.log(res);
          ctrl.options = res.data;
          ctrl.option = ctrl.options[0].name;
        });
    };

    ctrl.setOptions = function(option) {
      ctrl.option = option;
      //mlSearch.setSnippet(type);
      ctrl.search();
    };

    //This is an entry point to do initialization
    ctrl.initialize();

    $scope.$watch(userService.currentUser, function(newValue) {
      ctrl.currentUser = newValue;
    });
  }
}());
